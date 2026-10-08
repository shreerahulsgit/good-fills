import { NextResponse } from 'next/server';
import {
  verifySignature,
  isRazorpayConfigured,
  isProduction,
  isSandboxAllowed,
  fetchRazorpayPayment,
} from '@/lib/razorpay';
import {
  getOrderByRazorpayOrderId,
  resolveOrderFromRazorpay,
  confirmOrderPayment,
  recordOrderPaymentFailure,
} from '@/lib/supabase-orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
      isMock,
      internalOrderId,
      customer,
      shippingAddress,
      items,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { verified: false, error: 'Missing razorpay_order_id or razorpay_payment_id' },
        { status: 400 }
      );
    }

    // 1. Sandbox check (STRICTLY BLOCKED IN PRODUCTION)
    if (isMock) {
      if (isProduction()) {
        return NextResponse.json(
          { verified: false, error: 'Sandbox test simulator is strictly forbidden in production' },
          { status: 403 }
        );
      }

      if (!isSandboxAllowed()) {
        return NextResponse.json(
          { verified: false, error: 'Sandbox mode is not permitted in this environment' },
          { status: 403 }
        );
      }

      const { order } = await confirmOrderPayment({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod: method,
        source: 'callback',
      });

      return NextResponse.json({
        verified: true,
        orderId: order.id,
        paymentId: razorpay_payment_id,
        isMock: true,
        order,
      });
    }

    // 2. Live/Test Gateway Mode Verification
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { verified: false, error: 'Razorpay gateway is not configured' },
        { status: 500 }
      );
    }

    if (!razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: 'Missing razorpay_signature for cryptographic verification' },
        { status: 400 }
      );
    }

    // Step A: Timing-safe HMAC-SHA256 signature verification
    const isSigValid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSigValid) {
      await recordOrderPaymentFailure({
        razorpayOrderId: razorpay_order_id,
        reason: 'HMAC-SHA256 signature verification failed (possible tampering)',
      });

      return NextResponse.json(
        { verified: false, error: 'Cryptographic signature mismatch. Payment verification failed.' },
        { status: 400 }
      );
    }

    // Step B: Query Razorpay API directly to verify payment status, capture, and currency
    const paymentEntity = await fetchRazorpayPayment(razorpay_payment_id);
    if (paymentEntity) {
      // Confirm order ID match
      if (paymentEntity.order_id !== razorpay_order_id) {
        return NextResponse.json(
          { verified: false, error: 'Payment entity order_id does not match checkout order_id' },
          { status: 400 }
        );
      }

      // Confirm currency match
      if (paymentEntity.currency !== 'INR') {
        return NextResponse.json(
          { verified: false, error: `Invalid currency: ${paymentEntity.currency}` },
          { status: 400 }
        );
      }

      // Confirm payment state is captured or authorized
      if (paymentEntity.status !== 'captured' && paymentEntity.status !== 'authorized') {
        await recordOrderPaymentFailure({
          razorpayOrderId: razorpay_order_id,
          reason: `Payment is in unexpected state: ${paymentEntity.status}`,
        });

        return NextResponse.json(
          { verified: false, error: `Payment is not in captured state (current: ${paymentEntity.status})` },
          { status: 400 }
        );
      }
    }

    const paymentMethod = paymentEntity?.method || method;
    const upiUtr = paymentEntity?.acquirer_data?.upi_transaction_id
      || paymentEntity?.acquirer_data?.bank_transaction_id
      || paymentEntity?.acquirer_data?.rrn;

    // Step C: Locate or reconstruct internal order (handles serverless cold starts)
    let existingOrder = await getOrderByRazorpayOrderId(razorpay_order_id);
    if (!existingOrder) {
      existingOrder = await resolveOrderFromRazorpay(razorpay_order_id, {
        internalOrderId,
        customer,
        shippingAddress,
        items,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    if (!existingOrder) {
      return NextResponse.json(
        { verified: false, error: 'No matching internal order found for this payment' },
        { status: 400 }
      );
    }

    // Idempotency check: If already paid, return safe no-op
    if (existingOrder.paymentStatus === 'Paid') {
      return NextResponse.json({
        verified: true,
        orderId: existingOrder.id,
        paymentId: existingOrder.razorpayPaymentId || razorpay_payment_id,
        alreadyPaid: true,
        order: existingOrder,
        message: 'Order has already been confirmed as Paid.',
      });
    }

    // Step D: Confirm payment and update order status idempotently
    const { order, alreadyPaid } = await confirmOrderPayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod,
      upiUtr,
      source: 'callback',
      orderFallback: existingOrder,
    });

    return NextResponse.json({
      verified: true,
      orderId: order.id,
      paymentId: razorpay_payment_id,
      alreadyPaid,
      order,
    });
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { verified: false, error: error.message || 'Payment verification encountered an unexpected error' },
      { status: 500 }
    );
  }
}
