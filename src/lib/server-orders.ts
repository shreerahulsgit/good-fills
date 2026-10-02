import fs from 'fs';
import path from 'path';
import { Order, CartItem, ShippingAddress, OrderStatus, PaymentStatus, ShipmentStatus } from '@/types';
import { PRODUCTS } from '@/data/products';
import { calculateDomesticShipping } from '@/lib/shipping';

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

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'server-orders.json');
const WEBHOOK_EVENTS_FILE = path.join(DATA_DIR, 'webhook-events.json');

// Memory caches
let ordersCache: Map<string, Order> = new Map();
let paymentsCache: Map<string, PaymentRecord> = new Map();
let processedWebhookEvents: Set<string> = new Set();
let isInitialized = false;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore if cannot write to filesystem (read-only environments)
    }
  }
}

function initStore() {
  if (isInitialized) return;
  isInitialized = true;
  ensureDataDir();

  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach((ord: Order) => ordersCache.set(ord.id, ord));
      }
    }
  } catch (err) {
    console.error('Error loading server orders from disk:', err);
  }

  try {
    if (fs.existsSync(WEBHOOK_EVENTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(WEBHOOK_EVENTS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach((id: string) => processedWebhookEvents.add(id));
      }
    }
  } catch (err) {
    console.error('Error loading webhook events from disk:', err);
  }
}

function persistOrders() {
  try {
    ensureDataDir();
    const arr = Array.from(ordersCache.values());
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    // Graceful fallback for read-only or serverless environments
  }
}

function persistWebhookEvents() {
  try {
    ensureDataDir();
    const arr = Array.from(processedWebhookEvents);
    fs.writeFileSync(WEBHOOK_EVENTS_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch {
    // Ignore
  }
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

    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.availability !== 'available') {
      throw new Error(`Product '${product.name}' is currently unavailable.`);
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

  const order: Order = {
    id: orderId,
    createdAt: now,
    customerId: `CUST-${customerPhone.replace(/\D/g, '').slice(-6)}`,
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim(),
    shippingAddress,
    items: authCart.validatedItems,
    subtotal: authCart.subtotal,
    shippingCost: authCart.shippingCost,
    total: authCart.grandTotal,
    weightGrams: authCart.totalWeightGrams,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Pending',
    orderStatus: 'Pending',
    shipmentStatus: 'Not Shipped',
    courier: 'DTDC',
    estimatedDelivery: '2–4 days',
    statusHistory: [
      {
        timestamp: now,
        status: 'Pending',
        category: 'order',
        note: 'Order initiated by customer; awaiting UPI payment authorization.',
        actor: 'customer',
      },
      {
        timestamp: now,
        status: 'Pending',
        category: 'payment',
        note: 'Awaiting Razorpay UPI payment confirmation.',
        actor: 'system',
      },
    ],
  };

  ordersCache.set(order.id, order);
  persistOrders();

  return {
    order,
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
  return ordersCache.get(orderId) || null;
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
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  source?: 'callback' | 'webhook';
}): { order: Order; alreadyPaid: boolean } {
  initStore();

  const order = getOrderByRazorpayOrderId(razorpayOrderId);
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
 * Returns all stored orders, sorted newest first
 */
export function getAllServerOrders(): Order[] {
  initStore();
  const arr = Array.from(ordersCache.values());
  return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Updates order status, shipment status, and DTDC tracking number from admin dashboard
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
  return order;
}

