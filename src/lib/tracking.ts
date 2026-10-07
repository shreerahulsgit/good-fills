import fs from 'fs';
import path from 'path';
import { Order, ShippingAddress } from '@/types';
import { PRODUCTS } from '@/data/products';
import { getAllServerOrders, getAllServerOrdersAsync } from '@/lib/server-orders';

export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';

export interface TrackingMilestone {
  step: number;
  title: string;
  stageName: string;
  location: string;
  timestamp: string;
  status: MilestoneStatus;
  telemetryNote: string;
  carrierAction?: string;
}

export interface CourierPartnerInfo {
  name: string;
  brand: string;
  serviceType: string;
  awbNumber: string;
  isAssigned: boolean;
  trackingUrl: string;
  helpline: string;
}

export interface ConsignmentPackageSpecs {
  totalWeightGrams: number;
  formattedWeight: string;
  packagingType: string;
  sealIntegrity: string;
  storageRequirement: string;
  batchCode: string;
}

export interface TrackingTelemetryResult {
  orderId: string;
  found: boolean;
  orderCreatedAt: string;
  customerName: string;
  maskedPhone: string;
  shippingAddress: ShippingAddress;
  orderStatus: string;
  shipmentStatus: string;
  overallProgressPercent: number;
  currentStatusHeadline: string;
  currentStatusDescription: string;
  statusBadgeType: 'live' | 'completed' | 'processing' | 'pending';
  estimatedDeliveryDate: string;
  estimatedDeliveryWindow: string;
  isDelivered: boolean;
  courier: CourierPartnerInfo;
  packageSpecs: ConsignmentPackageSpecs;
  milestones: TrackingMilestone[];
  items: Array<{
    id: string;
    name: string;
    packSize: string;
    quantity: number;
    price: number;
    imagePrimary: string;
    productWeightGrams: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface DtdcCheckpoint {
  Time: string;
  Date: string;
  Location: string;
  Activity: string;
  CourierName: string;
  CheckpointState: string;
}

export interface DtdcTrackingResponse {
  Checkpoints?: DtdcCheckpoint[];
  MostRecentStatus?: string;
  ShipmentState?: string;
  AdditionalInfo?: string;
}

import os from 'os';

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'server-orders.json');
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'good-fills-data', 'server-orders.json');

function maskPhoneNumber(phone?: string): string {
  if (!phone) return '+91 ••••• •••••';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    const last4 = clean.slice(-4);
    const first2 = clean.slice(0, 2);
    return `+91 ${first2}••• ••${last4}`;
  }
  return phone;
}

function loadOrdersFromDisk(): Order[] {
  const map = new Map<string, Order>();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((o: Order) => map.set(o.id, o));
      }
    }
  } catch (err) {}

  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const raw = fs.readFileSync(TMP_ORDERS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((o: Order) => map.set(o.id, o));
      }
    }
  } catch (err) {}

  return Array.from(map.values());
}

/**
 * Derives the active milestone stage (1 to 5) directly from the order data
 */
export function deriveActiveStage(order: Order): number {
  if (order.shipmentStatus === 'Delivered' || order.orderStatus === 'Delivered') {
    return 5;
  }
  if (order.shipmentStatus === 'Out for Delivery') {
    return 4;
  }
  if (
    order.shipmentStatus === 'In Transit' ||
    order.shipmentStatus === 'Handed Over' ||
    order.orderStatus === 'Shipped'
  ) {
    return 3;
  }
  if (order.orderStatus === 'Processing' || order.orderStatus === 'Ready to Ship') {
    return 2;
  }
  return 1;
}

/**
 * Builds clear, simple, professional tracking data based on the real order
 */
export function buildTrackingTelemetry(order: Order, forcedStage?: number): TrackingTelemetryResult {
  const createdDate = new Date(order.createdAt || Date.now());
  const orderId = order.id || '';
  const phoneClean = (order.customerPhone || '').replace(/\D/g, '');

  const activeStage = forcedStage !== undefined ? forcedStage : deriveActiveStage(order);

  // Real or pending DTDC tracking number
  const hasRealAwb = Boolean(order.trackingNumber && order.trackingNumber.trim().length > 0);
  const dtdcAwb = hasRealAwb ? (order.trackingNumber as string).trim() : 'Assigned on Dispatch';

  // Format dates cleanly
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const t1 = new Date(createdDate.getTime());
  const t2 = new Date(createdDate.getTime() + 12 * 3600 * 1000);
  const t3 = new Date(createdDate.getTime() + 24 * 3600 * 1000);
  const t4 = new Date(createdDate.getTime() + 48 * 3600 * 1000);
  const t5 = new Date(createdDate.getTime() + 54 * 3600 * 1000);

  const destCity = order.shippingAddress?.city || 'Bengaluru';
  const destPincode = order.shippingAddress?.pincode || '560038';

  // 5 Clear, Professional Milestones
  const milestones: TrackingMilestone[] = [
    {
      step: 1,
      title: 'Order Confirmed',
      stageName: 'Kitchen Order Received',
      location: 'Good Fills Kitchen, Bengaluru',
      timestamp: fmtDate(t1),
      status: activeStage >= 1 ? 'completed' : 'pending',
      telemetryNote: 'Order and payment confirmed. Batch queued for fresh soaking and sprouting.',
      carrierAction: 'Order Confirmed',
    },
    {
      step: 2,
      title: 'Prepared & Packed',
      stageName: 'Processing & Packaging',
      location: 'Good Fills Kitchen, Bengaluru',
      timestamp: activeStage >= 2 ? fmtDate(t2) : 'Awaiting Preparation',
      status: activeStage > 2 ? 'completed' : activeStage === 2 ? 'in_progress' : 'pending',
      telemetryNote: 'Batch freshly prepared, quality checked, and sealed in an airtight barrier pouch for freshness.',
      carrierAction: 'Packed & Quality Checked',
    },
    {
      step: 3,
      title: 'Dispatched via DTDC Express',
      stageName: 'Handed to Courier',
      location: 'DTDC Sorting Facility, Bengaluru',
      timestamp: activeStage >= 3 ? (order.dispatchDate ? fmtDate(new Date(order.dispatchDate)) : fmtDate(t3)) : 'Awaiting Courier Handover',
      status: activeStage > 3 ? 'completed' : activeStage === 3 ? 'in_progress' : 'pending',
      telemetryNote: hasRealAwb
        ? `Handed over to DTDC Express courier under AWB ${dtdcAwb}. In transit to ${destCity}.`
        : `Handed over to DTDC Express courier. In transit to ${destCity}.`,
      carrierAction: hasRealAwb ? `DTDC AWB: ${dtdcAwb}` : 'Courier Manifest Assigned',
    },
    {
      step: 4,
      title: 'Out for Delivery',
      stageName: 'Local Courier Delivery',
      location: `DTDC Delivery Hub, ${destCity}`,
      timestamp: activeStage >= 4 ? fmtDate(t4) : 'Pending Delivery Run',
      status: activeStage > 4 ? 'completed' : activeStage === 4 ? 'in_progress' : 'pending',
      telemetryNote: `Your package is with the local DTDC delivery executive and will reach your doorstep today.`,
      carrierAction: 'Out for Delivery',
    },
    {
      step: 5,
      title: 'Delivered',
      stageName: 'Doorstep Handover',
      location: `${order.shippingAddress?.addressLine1 || 'Doorstep'}, ${destCity}`,
      timestamp: activeStage === 5 ? (order.deliveredDate ? fmtDate(new Date(order.deliveredDate)) : fmtDate(t5)) : 'Pending Handover',
      status: activeStage === 5 ? 'completed' : 'pending',
      telemetryNote: 'Package delivered safely to your address with tamper-evident seal intact.',
      carrierAction: 'Delivered Successfully',
    },
  ];

  // Professional percentage mapping: 20%, 40%, 60%, 80%, 100%
  const progressMap: Record<number, number> = {
    1: 20,
    2: 40,
    3: 60,
    4: 80,
    5: 100,
  };
  const overallProgressPercent = progressMap[activeStage] || 20;

  // Simple, Professional Status Headlines
  let currentStatusHeadline = 'Order Confirmed & Preparing';
  let currentStatusDescription = 'We have received your order. Our Bengaluru kitchen team is preparing your fresh batch.';
  let statusBadgeType: 'live' | 'completed' | 'processing' | 'pending' = 'processing';

  if (activeStage === 2) {
    currentStatusHeadline = 'Prepared & Packed';
    currentStatusDescription = 'Your batch has been prepared and packed into an airtight pouch, ready for courier pickup.';
    statusBadgeType = 'processing';
  } else if (activeStage === 3) {
    currentStatusHeadline = 'Dispatched via DTDC Express';
    currentStatusDescription = `Your parcel is on its way with DTDC courier to ${destCity}.`;
    statusBadgeType = 'live';
  } else if (activeStage === 4) {
    currentStatusHeadline = 'Out for Delivery Today';
    currentStatusDescription = `Your local DTDC courier agent is on the way to your doorstep in ${destCity}.`;
    statusBadgeType = 'live';
  } else if (activeStage === 5) {
    currentStatusHeadline = 'Delivered to Doorstep';
    currentStatusDescription = `Your package has been successfully delivered at ${destCity}.`;
    statusBadgeType = 'completed';
  }

  // Current real stage without fake date promises
  const currentDeliveryStage =
    activeStage === 5
      ? 'Delivered'
      : activeStage === 4
      ? 'Out for Delivery'
      : activeStage === 3
      ? 'In Transit with DTDC'
      : activeStage === 2
      ? 'Freshly Milled & Packed'
      : 'Order Confirmed & Preparing';

  const estimatedDeliveryWindow = currentDeliveryStage;
  const estimatedDeliveryDate = '';

  const totalWeightGrams =
    order.weightGrams ||
    order.items?.reduce((sum, it) => sum + (it.product.productWeightGrams * it.quantity), 0) ||
    250;

  const packageSpecs: ConsignmentPackageSpecs = {
    totalWeightGrams,
    formattedWeight: totalWeightGrams >= 1000 ? `${(totalWeightGrams / 1000).toFixed(1)} kg` : `${totalWeightGrams}g`,
    packagingType: 'Airtight Barrier Foil Pouch + Sturdy Carton',
    sealIntegrity: 'Tamper-Evident Freshness Seal',
    storageRequirement: 'Store in cool, dry place away from moisture',
    batchCode: `BATCH-${createdDate.toISOString().slice(2, 10).replace(/-/g, '')}`,
  };

  const courier: CourierPartnerInfo = {
    name: 'DTDC Express Limited',
    brand: 'DTDC Pan-India Express',
    serviceType: 'Domestic Priority Express',
    awbNumber: dtdcAwb,
    isAssigned: hasRealAwb,
    trackingUrl: hasRealAwb
      ? `https://www.dtdc.in/tracking/shipment-tracking.asp`
      : 'https://www.dtdc.in/tracking/shipment-tracking.asp',
    helpline: '1800 209 6006',
  };

  const items = (order.items || []).map((it) => {
    const matchedProduct = PRODUCTS.find(
      (p) => p.id === it.product?.id || p.slug === it.product?.slug || p.name.toLowerCase() === (it.product?.name || '').toLowerCase()
    );
    return {
      id: it.product?.id || matchedProduct?.id || 'prod-01',
      name: it.product?.name || matchedProduct?.name || 'Artisanal Porridge Flour',
      packSize: it.product?.packSize || matchedProduct?.packSize || '250g',
      quantity: it.quantity || 1,
      price: it.product?.price || matchedProduct?.price || 225,
      imagePrimary:
        matchedProduct?.images?.primary ||
        it.product?.images?.primary ||
        '/images/products/kids-nutrition-powder.png',
      productWeightGrams: it.product?.productWeightGrams || matchedProduct?.productWeightGrams || 250,
    };
  });

  return {
    orderId,
    found: true,
    orderCreatedAt: order.createdAt || new Date().toISOString(),
    customerName: order.customerName || 'Good Fills Customer',
    maskedPhone: maskPhoneNumber(phoneClean),
    shippingAddress: order.shippingAddress || {
      fullName: order.customerName || 'Good Fills Customer',
      phone: phoneClean,
      email: order.customerEmail || 'customer@example.com',
      addressLine1: 'Doorstep Delivery',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
    },
    orderStatus: order.orderStatus || 'Confirmed',
    shipmentStatus: order.shipmentStatus || 'Not Shipped',
    overallProgressPercent,
    currentStatusHeadline,
    currentStatusDescription,
    statusBadgeType,
    estimatedDeliveryDate: '',
    estimatedDeliveryWindow,
    isDelivered: activeStage === 5,
    courier,
    packageSpecs,
    milestones,
    items,
    subtotal: typeof order.subtotal === 'number' ? order.subtotal : (order.total || 0),
    shippingCost: typeof order.shippingCost === 'number' ? order.shippingCost : 0,
    total: typeof order.total === 'number' ? order.total : 0,
  };
}

/**
 * Searches orders by Order ID, DTDC tracking number, phone number, or email address
 */
export async function searchTrackingOrder(query: string): Promise<TrackingTelemetryResult | null> {
  const rawQuery = (query || '').trim();
  if (!rawQuery) return null;
  const cleanQuery = rawQuery.toUpperCase();

  // Combine loaded disk orders + in-memory cached orders
  const diskOrders = loadOrdersFromDisk();
  let serverOrders: Order[] = [];
  try {
    serverOrders = getAllServerOrders();
  } catch {}

  const ordersMap = new Map<string, Order>();
  diskOrders.forEach((o) => ordersMap.set(o.id, o));
  serverOrders.forEach((o) => ordersMap.set(o.id, o));
  let orders = Array.from(ordersMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const findMatch = (list: Order[]) => {
    // 1. Direct match by Order ID (e.g. "ORD-5616" or "5616")
    const idDigits = cleanQuery.replace(/\D/g, '');
    const idMatch = list.find((o) => {
      const oIdUpper = o.id.toUpperCase();
      if (oIdUpper === cleanQuery) return true;
      if (idDigits.length >= 4 && oIdUpper.replace(/\D/g, '') === idDigits) return true;
      return false;
    });
    if (idMatch) return buildTrackingTelemetry(idMatch);

    // 2. Direct match by DTDC Consignment number (AWB)
    const awbMatch = list.find((o) => {
      if (!o.trackingNumber) return false;
      const cleanAwb = o.trackingNumber.trim().toUpperCase().replace(/\s+/g, '');
      const testAwb = cleanQuery.replace(/\s+/g, '');
      return cleanAwb === testAwb;
    });
    if (awbMatch) return buildTrackingTelemetry(awbMatch);

    // 3. Match by Phone Number (last 10 digits or 8+ digits)
    const phoneDigits = cleanQuery.replace(/\D/g, '').slice(-10);
    if (phoneDigits.length >= 8) {
      const phoneMatch = list.find((o) => {
        const oPhone = (o.customerPhone || o.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);
        return oPhone && (oPhone.endsWith(phoneDigits) || phoneDigits.endsWith(oPhone));
      });
      if (phoneMatch) return buildTrackingTelemetry(phoneMatch);
    }

    // 4. Match by Email Address
    if (rawQuery.includes('@')) {
      const testEmail = rawQuery.toLowerCase();
      const emailMatch = list.find((o) => {
        const oEmail = (o.customerEmail || o.shippingAddress?.email || '').trim().toLowerCase();
        return oEmail === testEmail;
      });
      if (emailMatch) return buildTrackingTelemetry(emailMatch);
    }

    return null;
  };

  let result = findMatch(orders);
  if (!result) {
    // Check live Razorpay cloud orders
    try {
      const cloudOrders = await getAllServerOrdersAsync();
      result = findMatch(cloudOrders);
    } catch {}
  }

  return result;
}
