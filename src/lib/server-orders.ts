import fs from 'fs';
import path from 'path';
import os from 'os';
import { Order, CartItem, ShippingAddress, OrderStatus, PaymentStatus, ShipmentStatus } from '@/types';
import { PRODUCTS } from '@/data/products';
import { getServerProductById } from '@/lib/server-products';
import { calculateDomesticShipping } from '@/lib/shipping';
import { getRazorpayClient, isRazorpayConfigured } from '@/lib/razorpay';

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: 'razorpay';
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number; // in INR
  currency: 'INR';
  status: PaymentStatus;
  method: 'UPI';
  signatureVerified: boolean;
  capturedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthoritativeCartCalculation {
  subtotal: number;
  totalWeightGrams: number;
  shippingCost: number;
  grandTotal: number;
  validatedItems: CartItem[];
}

const PRIMARY_DATA_DIR = path.join(process.cwd(), '.data');
const PRIMARY_ORDERS_FILE = path.join(PRIMARY_DATA_DIR, 'server-orders.json');
const PRIMARY_WEBHOOK_EVENTS_FILE = path.join(PRIMARY_DATA_DIR, 'webhook-events.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'good-fills-data');
const TMP_ORDERS_FILE = path.join(TMP_DATA_DIR, 'server-orders.json');
const TMP_WEBHOOK_EVENTS_FILE = path.join(TMP_DATA_DIR, 'webhook-events.json');

// Memory caches
let ordersCache: Map<string, Order> = new Map();
let paymentsCache: Map<string, PaymentRecord> = new Map();
let processedWebhookEvents: Set<string> = new Set();
let isInitialized = false;

function ensureDataDirs() {
  if (!fs.existsSync(PRIMARY_DATA_DIR)) {
    try {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    } catch {}
  }
  if (!fs.existsSync(TMP_DATA_DIR)) {
    try {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    } catch {}
  }
}

export function initStore() {
  if (isInitialized) return;
  isInitialized = true;
  ensureDataDirs();

  // 1. Load from Primary Data File (Committed disk)
  try {
    if (fs.existsSync(PRIMARY_ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRIMARY_ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach((ord: Order) => ordersCache.set(ord.id, ord));
      }
    }
  } catch (err) {
    console.error('Error loading server orders from primary disk:', err);
  }

  // 2. Load from Tmp Data File (Takes precedence for updated runtime state in serverless)
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach((ord: Order) => ordersCache.set(ord.id, ord));
      }
    }
  } catch (err) {
    console.error('Error loading server orders from tmp disk:', err);
  }

  // 3. Load Webhook Events
  try {
    if (fs.existsSync(PRIMARY_WEBHOOK_EVENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRIMARY_WEBHOOK_EVENTS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach((id: string) => processedWebhookEvents.add(id));
      }
    }
    if (fs.existsSync(TMP_WEBHOOK_EVENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_WEBHOOK_EVENTS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach((id: string) => processedWebhookEvents.add(id));
      }
    }
  } catch (err) {
    console.error('Error loading webhook events from disk:', err);
  }
}

function persistOrders() {
  const arr = Array.from(ordersCache.values());
  const serialized = JSON.stringify(arr, null, 2);

  // Try writing to primary directory (local dev / persistent disk)
  try {
    ensureDataDirs();
    fs.writeFileSync(PRIMARY_ORDERS_FILE, serialized, 'utf8');
  } catch {}

  // Always write to writable /tmp directory (works across serverless invocations)
  try {
    ensureDataDirs();
    fs.writeFileSync(TMP_ORDERS_FILE, serialized, 'utf8');
  } catch {}
}

function persistWebhookEvents() {
  const arr = Array.from(processedWebhookEvents);
  const serialized = JSON.stringify(arr, null, 2);

  try {
    ensureDataDirs();
    fs.writeFileSync(PRIMARY_WEBHOOK_EVENTS_FILE, serialized, 'utf8');
  } catch {}

  try {
    ensureDataDirs();
    fs.writeFileSync(TMP_WEBHOOK_EVENTS_FILE, serialized, 'utf8');
  } catch {}
}

export function clearAllOrders(): void {
  initStore();
  ordersCache.clear();
  paymentsCache.clear();
  processedWebhookEvents.clear();
  persistOrders();
  persistWebhookEvents();
}

export function reloadOrdersFromDisk(): void {
  ordersCache.clear();
  paymentsCache.clear();
  processedWebhookEvents.clear();
  isInitialized = false;
  initStore();
}

export function generateOrderId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${randomSuffix}`;
}

/**
 * Server-authoritative calculation:
 * NEVER trusts prices, weights, shipping, or totals from the browser.
 */
export function calculateAuthoritativeCart(
  clientItems: Array<{ productId: string; quantity: number }>
): AuthoritativeCartCalculation {
  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    throw new Error('Cart must contain at least one valid item.');
  }

  let subtotal = 0;
  let totalWeightGrams = 0;
  const validatedItems: CartItem[] = [];

  for (const item of clientItems) {
    const qty = Math.floor(Number(item.quantity));
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid item quantity: ${item.quantity}`);
    }

    const product = getServerProductById(item.productId) || PRODUCTS.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product ID "${item.productId}" is not available in the Good Fills atelier catalog.`);
    }

    // Authoritative prices and weights directly from catalog
    subtotal += product.price * qty;
    totalWeightGrams += product.productWeightGrams * qty;

    validatedItems.push({
      product,
      quantity: qty,
    });
  }

  // Authoritative shipping calculation based strictly on product net weight
  const shippingCalculation = calculateDomesticShipping(totalWeightGrams);
  const shippingCost = shippingCalculation.shippingCost;
  const grandTotal = subtotal + shippingCost;

  return {
    subtotal,
    totalWeightGrams,
    shippingCost,
    grandTotal,
    validatedItems,
  };
}

/**
 * Creates a server-side pending order before Razorpay Order creation
 */
export function createPendingOrder({
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  clientItems,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  clientItems: Array<{ productId: string; quantity: number }>;
}): { order: Order; authoritativeTotal: number; totalWeightGrams: number } {
  initStore();

  const authCart = calculateAuthoritativeCart(clientItems);
  const now = new Date().toISOString();
  const orderId = generateOrderId();

  const pendingOrder: Order = {
    id: orderId,
    createdAt: now,
    customerId: 'guest',
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'UPI',
    shipmentStatus: 'Not Shipped',
    courier: 'DTDC',
    estimatedDelivery: '2–4 days',
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    shippingAddress,
    items: authCart.validatedItems,
    subtotal: authCart.subtotal,
    shippingCost: authCart.shippingCost,
    total: authCart.grandTotal,
    weightGrams: authCart.totalWeightGrams,
    statusHistory: [
      {
        timestamp: now,
        status: 'Pending',
        category: 'order',
        note: 'Order initiated at Bengaluru Atelier. Awaiting payment authorization.',
        actor: 'customer',
      },
    ],
  };

  ordersCache.set(orderId, pendingOrder);
  persistOrders();

  return {
    order: pendingOrder,
    authoritativeTotal: authCart.grandTotal,
    totalWeightGrams: authCart.totalWeightGrams,
  };
}

export function linkRazorpayOrderId(internalOrderId: string, razorpayOrderId: string): void {
  initStore();
  const order = ordersCache.get(internalOrderId);
  if (order) {
    order.razorpayOrderId = razorpayOrderId;
    ordersCache.set(internalOrderId, order);
    persistOrders();
  }
}

export function getOrderByRazorpayOrderId(razorpayOrderId: string): Order | null {
  initStore();
  const allOrders = Array.from(ordersCache.values());
  return allOrders.find((order) => order.razorpayOrderId === razorpayOrderId) || null;
}

export function getServerOrderById(orderId: string): Order | null {
  initStore();
  const direct = ordersCache.get(orderId);
  if (direct) return direct;
  const upper = orderId.toUpperCase();
  const allOrders = Array.from(ordersCache.values());
  return allOrders.find((order) => order.id.toUpperCase() === upper) || null;
}

/**
 * Resolves an order by fetching from Razorpay Cloud API when in-memory cache
 * is empty due to serverless cold starts.
 */
export async function resolveOrderFromRazorpay(
  razorpayOrderId: string,
  fallback?: {
    internalOrderId?: string;
    customer?: { fullName: string; phone: string; email: string };
    shippingAddress?: ShippingAddress;
    items?: Array<{ productId: string; quantity: number }>;
    razorpayPaymentId?: string;
  }
): Promise<Order | null> {
  initStore();

  const cached = getOrderByRazorpayOrderId(razorpayOrderId);
  if (cached) return cached;

  let rzpOrder: any = null;
  let rzpPayment: any = null;

  if (isRazorpayConfigured()) {
    const razorpay = getRazorpayClient();
    if (razorpay) {
      try {
        rzpOrder = await razorpay.orders.fetch(razorpayOrderId);
      } catch (err) {
        console.error('Error fetching order from Razorpay API:', err);
      }

      if (fallback?.razorpayPaymentId) {
        try {
          rzpPayment = await razorpay.payments.fetch(fallback.razorpayPaymentId);
        } catch (err) {
          console.error('Error fetching payment from Razorpay API:', err);
        }
      }
    }
  }

  const notes = rzpOrder?.notes || {};
  const internalId = notes.goodFillsOrderId || rzpOrder?.receipt || fallback?.internalOrderId || generateOrderId();
  const customerName = notes.customerName || fallback?.customer?.fullName || rzpPayment?.notes?.customerName || 'Good Fills Customer';
  const customerPhone = notes.phone || fallback?.customer?.phone || rzpPayment?.contact || '';
  const customerEmail = notes.email || fallback?.customer?.email || rzpPayment?.email || '';

  const shippingAddress: ShippingAddress = fallback?.shippingAddress || {
    fullName: customerName,
    phone: customerPhone,
    email: customerEmail,
    addressLine1: notes.addr1 || 'Bengaluru Made to Order Atelier',
    addressLine2: notes.addr2 || '',
    city: notes.city || 'Bengaluru',
    state: notes.state || 'Karnataka',
    pincode: notes.pincode || '560001',
    country: 'India',
  };

  let clientItems: Array<{ productId: string; quantity: number }> = [];
  if (notes.items) {
    try {
      const parsed = JSON.parse(notes.items);
      if (Array.isArray(parsed)) {
        clientItems = parsed.map((p: any) => ({
          productId: p.id || p.productId,
          quantity: p.q || p.quantity || 1,
        }));
      }
    } catch {}
  }

  if (clientItems.length === 0 && fallback?.items && fallback.items.length > 0) {
    clientItems = fallback.items;
  }

  if (clientItems.length === 0) {
    // If amount is ₹1 (100 paise), default to the live test sample
    clientItems = [{ productId: 'prod-live-test', quantity: 1 }];
  }

  let authCart: AuthoritativeCartCalculation;
  try {
    authCart = calculateAuthoritativeCart(clientItems);
  } catch {
    const fallbackPrice = rzpOrder ? Number((rzpOrder.amount / 100).toFixed(2)) : 1;
    authCart = {
      subtotal: fallbackPrice,
      totalWeightGrams: 0,
      shippingCost: 0,
      grandTotal: fallbackPrice,
      validatedItems: [],
    };
  }

  const createdAt = rzpOrder?.created_at
    ? new Date(rzpOrder.created_at * 1000).toISOString()
    : new Date().toISOString();
  const now = new Date().toISOString();

  const isPaid = rzpOrder?.status === 'paid' || rzpPayment?.status === 'captured';

  const order: Order = {
    id: internalId,
    createdAt,
    customerId: 'guest',
    orderStatus: isPaid ? 'Confirmed' : 'Pending',
    paymentStatus: isPaid ? 'Paid' : 'Pending',
    paymentMethod: 'UPI',
    shipmentStatus: (notes.shipmentStatus as ShipmentStatus) || 'Not Shipped',
    courier: 'DTDC',
    estimatedDelivery: '2–4 days',
    trackingNumber: notes.trackingNumber || undefined,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items: authCart.validatedItems,
    subtotal: Number(notes.subtotal) || authCart.subtotal,
    shippingCost: Number(notes.shipping) || authCart.shippingCost,
    total: rzpOrder ? Number((rzpOrder.amount / 100).toFixed(2)) : authCart.grandTotal,
    weightGrams: Number(notes.weight) || authCart.totalWeightGrams,
    razorpayOrderId,
    razorpayPaymentId: fallback?.razorpayPaymentId || rzpPayment?.id || undefined,
    statusHistory: [
      {
        timestamp: createdAt,
        status: 'Pending',
        category: 'order',
        note: 'Order initiated via Razorpay checkout.',
        actor: 'system',
      },
    ],
  };

  if (isPaid) {
    order.statusHistory.push({
      timestamp: now,
      status: 'Paid',
      category: 'payment',
      note: `Razorpay payment captured (${order.razorpayPaymentId || 'verified'}).`,
      actor: 'system',
    });
    order.statusHistory.push({
      timestamp: now,
      status: 'Confirmed',
      category: 'order',
      note: 'Payment verified. Queued for Bengaluru kitchen preparation.',
      actor: 'system',
    });
  }

  ordersCache.set(order.id, order);
  persistOrders();
  return order;
}

/**
 * Resolves an order by internal order ID, checking memory/disk and syncing with Razorpay.
 */
export async function resolveOrderById(orderId: string): Promise<Order | null> {
  initStore();
  const direct = getServerOrderById(orderId);
  if (direct) return direct;

  // Sync across live Razorpay orders
  await getAllServerOrdersAsync();
  return getServerOrderById(orderId);
}

/**
 * Idempotent order payment confirmation:
 * If the order was already Paid, returns safe no-op.
 */
export function confirmOrderPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  source = 'callback',
  orderFallback,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  source?: 'callback' | 'webhook';
  orderFallback?: Order;
}): { order: Order; alreadyPaid: boolean } {
  initStore();

  let order = getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order && orderFallback) {
    order = orderFallback;
    ordersCache.set(order.id, order);
  }

  if (!order) {
    throw new Error(`Order mapping not found for Razorpay Order ID: ${razorpayOrderId}`);
  }

  // Idempotency check: Already paid?
  if (order.paymentStatus === 'Paid') {
    return { order, alreadyPaid: true };
  }

  const now = new Date().toISOString();
  order.paymentStatus = 'Paid';
  order.orderStatus = 'Confirmed';
  order.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) {
    order.razorpaySignature = razorpaySignature;
  }

  order.statusHistory.push({
    timestamp: now,
    status: 'Paid',
    category: 'payment',
    note: `Razorpay UPI payment confirmed (${razorpayPaymentId}) via ${source}.`,
    actor: 'system',
  });

  order.statusHistory.push({
    timestamp: now,
    status: 'Confirmed',
    category: 'order',
    note: 'Payment verified. Order confirmed and queued for Bengaluru kitchen preparation.',
    actor: 'system',
  });

  ordersCache.set(order.id, order);
  persistOrders();

  // Record payment in payments cache
  const paymentRecord: PaymentRecord = {
    id: `PMT-${Date.now()}`,
    orderId: order.id,
    provider: 'razorpay',
    providerOrderId: razorpayOrderId,
    providerPaymentId: razorpayPaymentId,
    amount: order.total,
    currency: 'INR',
    status: 'Paid',
    method: 'UPI',
    signatureVerified: Boolean(razorpaySignature),
    capturedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  paymentsCache.set(paymentRecord.id, paymentRecord);

  return { order, alreadyPaid: false };
}

/**
 * Handles payment failure:
 * Never downgrades an already 'Paid' order.
 */
export function recordOrderPaymentFailure({
  razorpayOrderId,
  reason,
}: {
  razorpayOrderId: string;
  reason?: string;
}): Order | null {
  initStore();

  const order = getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) return null;

  // Never downgrade a paid order
  if (order.paymentStatus === 'Paid') {
    return order;
  }

  const now = new Date().toISOString();
  order.paymentStatus = 'Failed';
  order.statusHistory.push({
    timestamp: now,
    status: 'Failed',
    category: 'payment',
    note: reason ? `Payment failed: ${reason}` : 'Payment was declined or cancelled.',
    actor: 'system',
  });

  ordersCache.set(order.id, order);
  persistOrders();
  return order;
}

/**
 * Webhook idempotency protection
 */
export function isWebhookEventProcessed(eventId: string): boolean {
  initStore();
  return processedWebhookEvents.has(eventId);
}

export function recordWebhookEventProcessed(eventId: string): void {
  initStore();
  processedWebhookEvents.add(eventId);
  persistWebhookEvents();
}

/**
 * Returns all stored orders, sorted newest first (synchronous cache read)
 */
export function getAllServerOrders(): Order[] {
  initStore();
  const arr = Array.from(ordersCache.values());
  return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Fetches all orders from memory/disk and seamlessly synchronizes with live Razorpay API.
 * Ensures the admin view and tracking always reflect all live captured transactions.
 */
export async function getAllServerOrdersAsync(): Promise<Order[]> {
  initStore();

  if (isRazorpayConfigured()) {
    try {
      const razorpay = getRazorpayClient();
      if (razorpay) {
        const [ordersRes, paymentsRes] = await Promise.all([
          razorpay.orders.all({ count: 100 }).catch(() => ({ items: [] })),
          razorpay.payments.all({ count: 100 }).catch(() => ({ items: [] })),
        ]);

        const capturedPayments = new Map<string, any>();
        ((paymentsRes as any)?.items || []).forEach((p: any) => {
          if (p.order_id && p.status === 'captured') {
            capturedPayments.set(p.order_id, p);
          }
        });

        for (const rzpOrder of ((ordersRes as any)?.items || [])) {
          const existing = getOrderByRazorpayOrderId(rzpOrder.id);
          const pmt = capturedPayments.get(rzpOrder.id);
          const isPaid = rzpOrder.status === 'paid' || Boolean(pmt);

          if (!existing) {
            // CRITICAL INTEGRITY CHECK:
            // ONLY reconstruct/import an order from Razorpay API if it was actually PAID.
            // Abandoned carts, cancelled checkouts, or timed-out payment attempts must NEVER
            // be created as active dispatch orders in the system!
            if (isPaid) {
              await resolveOrderFromRazorpay(rzpOrder.id, {
                razorpayPaymentId: pmt?.id,
              });
            }
          } else {
            // If Razorpay order is paid or payment captured, ensure order is marked Paid
            if (isPaid && existing.paymentStatus !== 'Paid') {
              existing.paymentStatus = 'Paid';
              existing.orderStatus = existing.orderStatus === 'Pending' ? 'Confirmed' : existing.orderStatus;
              existing.razorpayPaymentId = pmt?.id || existing.razorpayPaymentId;
              ordersCache.set(existing.id, existing);
              persistOrders();
            } else if (!isPaid && existing.paymentStatus === 'Pending') {
              // If payment was attempted or timed out and never captured after 15 minutes, mark Failed/Cancelled
              const ageMs = Date.now() - new Date(existing.createdAt).getTime();
              if (ageMs > 15 * 60 * 1000) {
                existing.paymentStatus = 'Failed';
                existing.orderStatus = 'Cancelled';
                ordersCache.set(existing.id, existing);
                persistOrders();
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error syncing live Razorpay orders:', err);
    }
  }

  return getAllServerOrders();
}

/**
 * Updates order status, shipment status, and DTDC tracking number from admin dashboard.
 * Also synchronizes update to Razorpay Order notes for persistent cloud storage.
 */
export function updateOrderAdmin({
  orderId,
  orderStatus,
  shipmentStatus,
  trackingNumber,
  note,
  actor = 'admin',
}: {
  orderId: string;
  orderStatus?: OrderStatus;
  shipmentStatus?: ShipmentStatus;
  trackingNumber?: string;
  note?: string;
  actor?: 'admin' | 'manager' | 'system';
}): Order | null {
  initStore();
  const order = ordersCache.get(orderId);
  if (!order) return null;

  const now = new Date().toISOString();

  if (orderStatus && order.orderStatus !== orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({
      timestamp: now,
      status: orderStatus,
      category: 'order',
      note: note || `Order status updated to ${orderStatus}.`,
      actor,
    });
  }

  if (shipmentStatus && order.shipmentStatus !== shipmentStatus) {
    order.shipmentStatus = shipmentStatus;
    if (shipmentStatus === 'Handed Over' || shipmentStatus === 'In Transit') {
      order.dispatchDate = now;
      if (order.orderStatus !== 'Delivered') {
        order.orderStatus = 'Shipped';
      }
    }
    if (shipmentStatus === 'Delivered') {
      order.deliveredDate = now;
      order.orderStatus = 'Delivered';
    }
    order.statusHistory.push({
      timestamp: now,
      status: shipmentStatus,
      category: 'shipment',
      note: note || `Shipment status updated to ${shipmentStatus}.`,
      actor,
    });
  }

  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber.trim();
  }

  ordersCache.set(order.id, order);
  persistOrders();

  // Async sync tracking notes to Razorpay cloud
  if (order.razorpayOrderId && isRazorpayConfigured()) {
    try {
      const rzp = getRazorpayClient();
      if (rzp) {
        rzp.orders.edit(order.razorpayOrderId, {
          notes: {
            goodFillsOrderId: order.id,
            trackingNumber: order.trackingNumber || '',
            shipmentStatus: order.shipmentStatus,
            orderStatus: order.orderStatus,
          },
        }).catch((err: any) => console.error('Failed to sync order notes to Razorpay:', err));
      }
    } catch (err) {
      console.error('Error syncing order update to Razorpay:', err);
    }
  }

  return order;
}
