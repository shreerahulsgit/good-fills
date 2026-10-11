import 'dotenv/config';

type OrderStatus = 'Pending' | 'Confirmed' | 'Ready to Ship' | 'Shipped' | 'Completed' | 'Failed' | 'Cancelled';
type ShipmentStatus = 'Not Shipped' | 'Handed Over' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Failed';

type OrderRecord = {
  id: string;
  orderStatus: OrderStatus;
  shipmentStatus: ShipmentStatus;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  trackingNumber?: string | null;
};

type ConsoleOrdersResponse = {
  success: boolean;
  orders?: OrderRecord[];
};

type DtdcCheckpoint = {
  CheckpointState?: string;
};

type DtdcTrackingResponse = {
  MostRecentStatus?: string;
  ShipmentState?: string;
  Checkpoints?: DtdcCheckpoint[];
};

type MappingResult = {
  orderStatus: OrderStatus;
  shipmentStatus: ShipmentStatus;
};

const APP_BASE_URL = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const CONSOLE_PASSCODE = process.env.CONSOLE_PASSCODE;
const dryRun = process.argv.includes('--dry-run') || process.env.SYNC_TRACKING_DRY_RUN === '1';

type LogLevel = 'INFO' | 'OK' | 'WARN' | 'ERROR';
type LogFields = Record<string, string | number | boolean | undefined>;

const useColors = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);
const levelColors: Record<LogLevel, string> = {
  INFO: '\u001b[36m',
  OK: '\u001b[32m',
  WARN: '\u001b[33m',
  ERROR: '\u001b[31m',
};

function log(level: LogLevel, event: string, fields: LogFields = {}): void {
  const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const color = useColors ? levelColors[level] : '';
  const reset = useColors ? '\u001b[0m' : '';
  const details = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('  ');

  console.log(`${timestamp} ${color}${level.padEnd(5)}${reset}  ${event}${details ? `  ${details}` : ''}`);
}

function normalizeStatus(value?: string): string {
  return String(value ?? '').trim().toLowerCase();
}

function mapDtdcStateToStatus(raw: unknown): MappingResult | null {
  const payload = raw as DtdcTrackingResponse | null;
  const states = (payload?.Checkpoints ?? []).map((checkpoint) => normalizeStatus(checkpoint?.CheckpointState));
  const latest = normalizeStatus(payload?.MostRecentStatus || payload?.ShipmentState);

  if (!latest && states.length === 0) {
    return null;
  }

  const mergedText = `${latest} ${states.join(' ')}`.toLowerCase();

  if (mergedText.includes('delivered') || mergedText.includes('delivery completed')) {
    return { orderStatus: 'Completed', shipmentStatus: 'Delivered' };
  }

  if (
    mergedText.includes('pickup requested') ||
    mergedText.includes('pick up request received') ||
    mergedText.includes('inforeceived') ||
    mergedText.includes('manifested') ||
    mergedText.includes('handed over') ||
    mergedText.includes('booked') ||
    mergedText.includes('picked up') ||
    mergedText.includes('received by courier')
  ) {
    return { orderStatus: 'Shipped', shipmentStatus: 'Handed Over' };
  }

  if (
    mergedText.includes('out for delivery') ||
    mergedText.includes('outfordelivery') ||
    mergedText.includes('out_for_delivery')
  ) {
    return { orderStatus: 'Shipped', shipmentStatus: 'Out for Delivery' };
  }

  if (
    mergedText.includes('in transit') ||
    mergedText.includes('intransit') ||
    mergedText.includes('transit')
  ) {
    return { orderStatus: 'Shipped', shipmentStatus: 'In Transit' };
  }

  return null;
}

function isEligibleForSync(order: OrderRecord): boolean {
  const trackingNumber = order.trackingNumber?.trim();
  if (!trackingNumber) return false;
  if (order.paymentStatus !== 'Paid') return false;
  if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Failed') return false;
  if (order.shipmentStatus === 'Delivered' || order.orderStatus === 'Completed') return false;
  return true;
}

async function requestJson<T>(url: string, init: RequestInit = {}, cookie?: string): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (cookie) {
    headers.set('Cookie', cookie);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const text = await response.text();
  if (!response.ok) {
    const body = text || response.statusText || 'Unknown error';
    throw new Error(`HTTP ${response.status} for ${url}: ${body.slice(0, 200)}`);
  }

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function loginToConsole(): Promise<string> {
  if (!CONSOLE_PASSCODE) {
    throw new Error('Missing CONSOLE_PASSCODE. Set it in the environment before running this script.');
  }

  const response = await fetch(`${APP_BASE_URL}/api/console/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ passcode: CONSOLE_PASSCODE }),
    redirect: 'manual',
  });

  const cookieHeader = response.headers.get('set-cookie') || response.headers.get('Set-Cookie');
  if (!response.ok || !cookieHeader) {
    const text = await response.text();
    throw new Error(`Console login failed: ${response.status} ${response.statusText}${text ? ` :: ${text.slice(0, 200)}` : ''}`);
  }

  return cookieHeader.split(';')[0];
}

async function syncTracking() {
  log('INFO', 'script.sync.started', { baseUrl: APP_BASE_URL, dryRun });

  const cookie = await loginToConsole();
  const ordersResponse = await requestJson<ConsoleOrdersResponse>(`${APP_BASE_URL}/api/console/orders`, { method: 'GET' }, cookie);
  const orders = Array.isArray(ordersResponse?.orders) ? ordersResponse.orders : [];
  const eligibleOrders = orders.filter(isEligibleForSync);
  const counts = { updated: 0, wouldUpdate: 0, unchanged: 0, unmapped: 0, unavailable: 0, failed: 0 };

  log('INFO', 'script.orders.loaded', { total: orders.length, eligible: eligibleOrders.length });

  for (const order of eligibleOrders) {
    const awb = order.trackingNumber?.trim();
    if (!awb) continue;

    try {
      const trackingUrl = `${APP_BASE_URL}/api/order/track/dtdc?q=${encodeURIComponent(order.id)}`;
      const liveTracking = await requestJson<DtdcTrackingResponse | { error?: string } | null>(trackingUrl, { method: 'GET' });

      if (!liveTracking || typeof liveTracking === 'string' || ('error' in liveTracking && liveTracking.error)) {
        counts.unavailable += 1;
        log('WARN', 'script.data.unavailable', { orderId: order.id, awb });
        continue;
      }

      const nextState = mapDtdcStateToStatus(liveTracking);
      if (!nextState) {
        counts.unmapped += 1;
        log('INFO', 'script.status.unmapped', { orderId: order.id, awb });
        continue;
      }

      const sameStatus = order.shipmentStatus === nextState.shipmentStatus && order.orderStatus === nextState.orderStatus;
      if (sameStatus) {
        counts.unchanged += 1;
        log('INFO', 'script.status.unchanged', { orderId: order.id, status: nextState.shipmentStatus });
        continue;
      }

      log('INFO', dryRun ? 'script.status.would_update' : 'script.status.updating', {
        orderId: order.id,
        from: `${order.orderStatus}/${order.shipmentStatus}`,
        to: `${nextState.orderStatus}/${nextState.shipmentStatus}`,
      });

      if (!dryRun) {
        await requestJson(
          `${APP_BASE_URL}/api/console/orders/update`,
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              orderStatus: nextState.orderStatus,
              shipmentStatus: nextState.shipmentStatus,
              trackingNumber: awb,
            }),
          },
          cookie,
        );
        counts.updated += 1;
      } else {
        counts.wouldUpdate += 1;
      }
    } catch (error: unknown) {
      counts.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      log('WARN', 'script.order.failed', { orderId: order.id, awb, error: message });
    }
  }

  log('OK', 'script.sync.completed', { ...counts, dryRun });
}

void syncTracking().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  log('ERROR', 'script.sync.failed', { error: message });
  process.exit(1);
});