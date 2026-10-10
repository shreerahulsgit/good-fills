import {
    Order,
    CartItem,
    ShippingAddress,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    ShipmentStatus,
    PaymentRecord,
    AuthoritativeCartCalculation
} from '@/types';
import { getServerProductById } from '@/lib/store/products';
import { calculateDomesticShipping } from '@/lib/dispatch/shipping';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function toDbOrderStatus(status: OrderStatus): string {
    return status;
}

function fromDbOrderStatus(status: string): OrderStatus {
    return status as OrderStatus;
}

function toDbShipmentStatus(status: ShipmentStatus): string {
    return status === 'Failed' ? 'Failed' : status;
}

function fromDbShipmentStatus(status: string): ShipmentStatus {
    return status === 'Failed' ? 'Failed' : status as ShipmentStatus;
}

function normalizePaymentMethod(method: unknown): PaymentMethod {
    return method === 'netbanking' || method === 'Net Banking' ? 'Net Banking' : 'UPI';
}

function normalizeUtr(utr: unknown): string | undefined {
    return typeof utr === 'string' && utr.trim() ? utr.trim() : undefined;
}

function fromSupabaseOrderRow(row: Record<string, unknown>): Order {
    const orderStatus = fromDbOrderStatus(String(row.order_status));
    const shipmentStatus = fromDbShipmentStatus(String(row.shipment_status));

    return {
        id: String(row.id),
        createdAt: String(row.created_at),
        customerId: String(row.customer_id || 'guest'),
        customerName: String(row.customer_name || ''),
        customerEmail: String(row.customer_email || ''),
        customerPhone: String(row.customer_phone || ''),
        shippingAddress: row.shipping_address as ShippingAddress,
        items: Array.isArray(row.items) ? row.items as CartItem[] : [],
        subtotal: Number(row.subtotal),
        shippingCost: Number(row.shipping_cost),
        total: Number(row.total),
        paymentMethod: normalizePaymentMethod(row.payment_method),
        paymentStatus: String(row.payment_status) as PaymentStatus,
        orderStatus,
        shipmentStatus,
        upiUtr: typeof row.txn_utr === 'string' ? row.txn_utr : undefined,
        razorpayOrderId: typeof row.razorpay_order_id === 'string' ? row.razorpay_order_id : undefined,
        razorpayPaymentId: typeof row.razorpay_payment_id === 'string' ? row.razorpay_payment_id : undefined,
        weightGrams: row.weight_grams == null ? undefined : Number(row.weight_grams),
        courier: String(row.courier || 'DTDC'),
        trackingNumber: typeof row.tracking_number === 'string' ? row.tracking_number : undefined,
        estimatedDelivery: '2–4 days',
        dispatchDate: typeof row.dispatch_date === 'string' ? row.dispatch_date : undefined,
        deliveredDate: typeof row.delivered_date === 'string' ? row.delivered_date : undefined,
        statusHistory: [],
    };
}

function toSupabaseOrderRow(order: Order) {
    return {
        id: order.id,
        customer_id: order.customerId === 'guest' ? null : order.customerId,
        created_at: order.createdAt,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        shipping_address: order.shippingAddress,
        items: order.items,
        subtotal: order.subtotal,
        shipping_cost: order.shippingCost,
        total: order.total,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        order_status: toDbOrderStatus(order.orderStatus),
        shipment_status: toDbShipmentStatus(order.shipmentStatus),
        txn_utr: order.upiUtr || null,
        razorpay_order_id: order.razorpayOrderId || null,
        razorpay_payment_id: order.razorpayPaymentId || null,
        weight_grams: order.weightGrams || null,
        courier: order.courier,
        tracking_number: order.trackingNumber || null,
        dispatch_date: order.dispatchDate || null,
        delivered_date: order.deliveredDate || null,
    };
}

export async function calculateAuthoritativeCart(
    clientItems: Array<{ productId: string; quantity: number }>
): Promise<AuthoritativeCartCalculation> {
    if (!Array.isArray(clientItems) || clientItems.length === 0) {
        throw new Error('Cart must contain at least one valid item.');
    }

    let subtotal = 0;
    let totalWeightGrams = 0;
    const validatedItems: CartItem[] = [];

    for (const item of clientItems) {
        const quantity = Math.floor(Number(item.quantity));
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(`Invalid item quantity: ${item.quantity}`);
        }

        const product = await getServerProductById(item.productId);
        if (!product) {
            throw new Error(`Product ID "${item.productId}" is not available.`);
        }

        subtotal += product.price * quantity;
        totalWeightGrams += product.productWeightGrams * quantity;
        validatedItems.push({ product, quantity });
    }

    const shippingCost = calculateDomesticShipping(totalWeightGrams).shippingCost;
    return {
        subtotal,
        totalWeightGrams,
        shippingCost,
        grandTotal: subtotal + shippingCost,
        validatedItems,
    };
}

export function generateOrderId(): string {
    return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function isDuplicateOrderIdError(error: { code?: string; details?: string | null; message?: string }): boolean {
    const errorText = `${error.message || ''} ${error.details || ''}`;
    return error.code === '23505' && /orders_pkey|Key \(id\)=/i.test(errorText);
}

async function resolveCustomerId(
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    shippingAddress: ShippingAddress
): Promise<string> {
    const supabase = createSupabaseAdminClient();
    const email = customerEmail.trim().toLowerCase();
    const phone = customerPhone.trim();

    const { data: emailMatches, error: emailError } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .limit(1);
    if (emailError) throw new Error(`Failed to find customer in Supabase: ${emailError.message}`);
    if (emailMatches?.[0]?.id) return String(emailMatches[0].id);

    const { data: phoneMatches, error: phoneError } = await supabase
    .from('customers')
    .select('id')
    .ilike('phone', `%${phone.replace(/\D/g, '').slice(-10)}`)
    .limit(1);
    if (phoneError) throw new Error(`Failed to search customer phone in Supabase: ${phoneError.message}`);
    if (phoneMatches?.[0]?.id) return String(phoneMatches[0].id);

    const { data: created, error: createError } = await supabase
    .from('customers')
    .insert({
        name: customerName.trim(),
            email: email || null,
            phone: phone || null,
            role: 'customer',
            addresses: [shippingAddress],
    })
    .select('id')
    .single();
    if (createError) throw new Error(`Failed to create customer in Supabase: ${createError.message}`);
    return String(created.id);
}

export async function createPendingOrder({
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    clientItems,
    paymentMethod,
}: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: ShippingAddress;
    clientItems: Array<{ productId: string; quantity: number }>;
    paymentMethod: PaymentMethod;
}): Promise<{ order: Order; authoritativeTotal: number; totalWeightGrams: number }> {
    const calculation = await calculateAuthoritativeCart(clientItems);
    const now = new Date().toISOString();
    const customerId = await resolveCustomerId(customerName, customerEmail, customerPhone, shippingAddress);
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const order: Order = {
            id: generateOrderId(),
            createdAt: now,
            customerId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            shippingAddress,
            items: calculation.validatedItems,
            subtotal: calculation.subtotal,
            shippingCost: calculation.shippingCost,
            total: calculation.grandTotal,
            paymentMethod,
            paymentStatus: 'Pending',
            orderStatus: 'Pending',
            shipmentStatus: 'Not Shipped',
            courier: 'DTDC',
            weightGrams: calculation.totalWeightGrams,
            statusHistory: [],
            estimatedDelivery: '2–4 days',
        };
        const { error } = await createSupabaseAdminClient().from('orders').insert(toSupabaseOrderRow(order));

        if (!error) {
            return {
                order,
                authoritativeTotal: calculation.grandTotal,
                totalWeightGrams: calculation.totalWeightGrams,
            };
        }

        if (!isDuplicateOrderIdError(error) || attempt === maxAttempts) {
            throw new Error(`Failed to create order in Supabase: ${error.message}`);
        }
    }

    throw new Error('Failed to create order in Supabase after retrying duplicate order IDs.');
}

export async function linkRazorpayOrderId(internalOrderId: string, razorpayOrderId: string): Promise<void> {
    const { error } = await createSupabaseAdminClient()
    .from('orders')
    .update({ razorpay_order_id: razorpayOrderId })
    .eq('id', internalOrderId);
    if (error) throw new Error(`Failed to link Razorpay order: ${error.message}`);
}

export async function getServerOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await createSupabaseAdminClient()
    .from('orders')
    .select('*')
    .ilike('id', orderId)
    .maybeSingle();
    if (error) throw new Error(`Failed to load order from Supabase: ${error.message}`);
    return data ? fromSupabaseOrderRow(data as Record<string, unknown>) : null;
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const { data, error } = await createSupabaseAdminClient()
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();
    if (error) throw new Error(`Failed to load Razorpay order mapping: ${error.message}`);
    return data ? fromSupabaseOrderRow(data as Record<string, unknown>) : null;
}

export async function resolveOrderById(orderId: string): Promise<Order | null> {
    return getServerOrderById(orderId);
}

export async function getAllServerOrdersAsync(): Promise<Order[]> {
    const { data, error } = await createSupabaseAdminClient()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to load orders from Supabase: ${error.message}`);
    return (data || []).map((row) => fromSupabaseOrderRow(row as Record<string, unknown>));
}

export async function confirmOrderPayment({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentMethod,
    upiUtr,
    orderFallback,
}: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
    paymentMethod?: string;
    upiUtr?: string;
    source?: 'callback' | 'webhook';
    orderFallback?: Order;
}): Promise<{ order: Order; alreadyPaid: boolean }> {
    const order = (await getOrderByRazorpayOrderId(razorpayOrderId)) || orderFallback;
    if (!order) throw new Error(`Order mapping not found for Razorpay Order ID: ${razorpayOrderId}`);
    if (order.paymentStatus === 'Paid') return { order, alreadyPaid: true };

    const updatedOrder: Order = {
        ...order,
        paymentMethod: normalizePaymentMethod(paymentMethod),
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed',
        razorpayOrderId,
        razorpayPaymentId,
        upiUtr: normalizeUtr(upiUtr) || order.upiUtr,
    };
    const { error } = await createSupabaseAdminClient()
    .from('orders')
    .update(toSupabaseOrderRow(updatedOrder))
    .eq('id', updatedOrder.id);
    if (error) throw new Error(`Failed to confirm order payment: ${error.message}`);

    const now = new Date().toISOString();
    const payment: PaymentRecord = {
        id: `PMT-${razorpayPaymentId}`,
        orderId: updatedOrder.id,
        provider: 'razorpay',
        providerOrderId: razorpayOrderId,
        providerPaymentId: razorpayPaymentId,
        amount: updatedOrder.total,
        currency: 'INR',
        status: 'Paid',
        method: updatedOrder.paymentMethod,
        signatureVerified: Boolean(razorpaySignature),
        capturedAt: now,
        createdAt: now,
        updatedAt: now,
    };
    const { error: paymentError } = await createSupabaseAdminClient().from('payments').upsert({
        id: payment.id,
        order_id: payment.orderId,
        provider: payment.provider,
        provider_order_id: payment.providerOrderId,
        provider_payment_id: payment.providerPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        signature_verified: payment.signatureVerified,
        captured_at: payment.capturedAt,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
    }, { onConflict: 'id' });
    if (paymentError) throw new Error(`Failed to record payment in Supabase: ${paymentError.message}`);

    return { order: updatedOrder, alreadyPaid: false };
}

export async function recordOrderPaymentFailure({
    razorpayOrderId,
    reason,
}: {
    razorpayOrderId: string;
    reason?: string;
}): Promise<Order | null> {
    const order = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (!order || order.paymentStatus === 'Paid') return order;

    const updatedOrder = {
        ...order,
        paymentStatus: 'Failed' as PaymentStatus,
        orderStatus: 'Failed' as OrderStatus,
        shipmentStatus: 'Failed' as ShipmentStatus,
    };
    const { error } = await createSupabaseAdminClient()
    .from('orders')
    .update(toSupabaseOrderRow(updatedOrder))
    .eq('id', order.id);
    if (error) throw new Error(`Failed to record payment failure: ${error.message}`);
    return updatedOrder;
}

export async function updateOrderAdmin({
    orderId,
    orderStatus,
    shipmentStatus,
    trackingNumber,
}: {
    orderId: string;
    orderStatus?: OrderStatus;
    shipmentStatus?: ShipmentStatus;
    trackingNumber?: string;
    note?: string;
    actor?: 'admin' | 'manager' | 'system';
}): Promise<Order | null> {
    const order = await getServerOrderById(orderId);
    if (!order) return null;

    const now = new Date().toISOString();
    const trackingNumberAdded = Boolean(trackingNumber?.trim()) && !order.trackingNumber?.trim();
    const shouldDispatch = trackingNumberAdded && order.paymentStatus === 'Paid';
    const nextShipmentStatus = shouldDispatch
    ? 'Handed Over'
    : shipmentStatus || order.shipmentStatus;
    const nextOrderStatus: OrderStatus = nextShipmentStatus === 'Delivered'
    ? 'Completed'
    : shouldDispatch
    ? 'Shipped'
    : orderStatus || order.orderStatus;
    const updatedOrder: Order = {
        ...order,
        orderStatus: nextOrderStatus,
        shipmentStatus: nextShipmentStatus,
        trackingNumber: trackingNumber === undefined ? order.trackingNumber : trackingNumber.trim(),
        dispatchDate: (nextShipmentStatus === 'Handed Over' || nextShipmentStatus === 'In Transit')
        ? (order.dispatchDate || now)
        : order.dispatchDate,
        deliveredDate: nextShipmentStatus === 'Delivered' ? (order.deliveredDate || now) : order.deliveredDate,
    };

    const { error } = await createSupabaseAdminClient()
    .from('orders')
    .update(toSupabaseOrderRow(updatedOrder))
    .eq('id', orderId);
    if (error) throw new Error(`Failed to update order in Supabase: ${error.message}`);
    return updatedOrder;
}

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
    const { data, error } = await createSupabaseAdminClient()
    .from('events')
    .select('event_id')
    .eq('event_id', eventId)
    .maybeSingle();
    if (error) throw new Error(`Failed to check webhook event: ${error.message}`);
    return Boolean(data);
}

export async function recordWebhookEventProcessed(eventId: string, eventType?: string, payload?: unknown): Promise<void> {
    const { error } = await createSupabaseAdminClient().from('events').upsert({
        event_id: eventId,
        event_type: eventType || null,
        payload: payload || null,
        processing_status: 'processed',
        processed_at: new Date().toISOString(),
    }, { onConflict: 'event_id' });
    if (error) throw new Error(`Failed to record webhook event: ${error.message}`);
}

export async function clearAllOrders(): Promise<void> {
    const { error } = await createSupabaseAdminClient().from('orders').delete().neq('id', '');
    if (error) throw new Error(`Failed to clear orders: ${error.message}`);
}

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
    const existing = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (existing) return existing;
    if (!fallback?.items?.length) return null;

    const customer = fallback.customer || { fullName: 'Good Fills Customer', phone: '', email: '' };
    const address = fallback.shippingAddress || {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        addressLine1: 'Bengaluru Made to Order Atelier',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
    };
    const { order } = await createPendingOrder({
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: address,
        clientItems: fallback.items,
        paymentMethod: 'UPI',
    });
    await linkRazorpayOrderId(order.id, razorpayOrderId);
    return getServerOrderById(order.id);
}