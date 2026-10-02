import { Order, CartItem, ShippingAddress, OrderStatus, PaymentStatus, ShipmentStatus } from '@/types';

const ORDERS_STORAGE_KEY = 'good_fills_orders_v1';

/**
 * Generate a clean Order ID in accordance with handoff.md Section 17 ("ORD-XXXX")
 */
export function generateOrderId(): string {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${randomSuffix}`;
}

/**
 * Create and persist a new order
 */
export function createOrder({
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  subtotal,
  shippingCost,
  total,
  totalWeightGrams,
  upiUtr,
  paymentMethod = 'UPI',
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentStatus,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  totalWeightGrams: number;
  upiUtr?: string;
  paymentMethod?: 'UPI' | 'Razorpay';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus?: PaymentStatus;
}): Order {
  const now = new Date().toISOString();
  const orderId = generateOrderId();

  const determinedPaymentStatus: PaymentStatus = paymentStatus || (
    paymentMethod === 'Razorpay' 
      ? (razorpayPaymentId ? 'Paid' : 'Pending') 
      : (upiUtr ? 'Paid' : 'Pending')
  );

  const paymentNote = paymentMethod === 'Razorpay'
    ? (razorpayPaymentId ? `Razorpay payment verified (ID: ${razorpayPaymentId})` : 'Razorpay order created, awaiting payment.')
    : (upiUtr ? `Payment submitted with UTR: ${upiUtr}` : 'Awaiting payment verification.');

  const newOrder: Order = {
    id: orderId,
    createdAt: now,
    customerId: `CUST-${customerPhone.replace(/\D/g, '').slice(-6)}`,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    subtotal,
    shippingCost,
    total,
    weightGrams: totalWeightGrams,
    paymentMethod,
    paymentStatus: determinedPaymentStatus,
    orderStatus: 'Confirmed',
    shipmentStatus: 'Not Shipped',
    courier: 'DTDC',
    estimatedDelivery: '2–4 days',
    upiUtr: upiUtr || undefined,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    statusHistory: [
      {
        timestamp: now,
        status: 'Confirmed',
        category: 'order',
        note: `Order placed by customer via ${paymentMethod} checkout.`,
        actor: 'customer'
      },
      {
        timestamp: now,
        status: determinedPaymentStatus,
        category: 'payment',
        note: paymentNote,
        actor: paymentMethod === 'Razorpay' ? 'system' : 'customer'
      },
      {
        timestamp: now,
        status: 'Not Shipped',
        category: 'shipment',
        note: 'Fresh preparation queued in Bengaluru kitchen.',
        actor: 'system'
      }
    ]
  };

  saveOrder(newOrder);
  return newOrder;
}

/**
 * Save an order to localStorage
 */
export function saveOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAllOrders();
    const filtered = existing.filter(o => o.id !== order.id);
    const updated = [order, ...filtered];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order to localStorage', e);
  }
}

/**
 * Get all stored orders
 */
export function getAllOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse orders from localStorage', e);
    return [];
  }
}

/**
 * Get order by ID
 */
export function getOrderById(orderId: string): Order | null {
  const orders = getAllOrders();
  return orders.find(o => o.id.toLowerCase() === orderId.toLowerCase()) || null;
}
