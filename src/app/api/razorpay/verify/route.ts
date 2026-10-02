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
  confirmOrderPayment,
  recordOrderPaymentFailure,
} from '@/lib/server-orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { verified: false, error: 'Missing razorpay_order_id or razorpay_payment_id' },
        { status: 400 }
      );
    }

    // 1. Locate internal order server-side & confirm strict mapping
    const existingOrder = getOrderByRazorpayOrderId(razorpay_order_id);
    if (!existingOrder) {
      return NextResponse.json(
        { verified: false, error: 'No matching internal order found for this payment' },
        { status: 400 }
      );
    }

    // 2. Idempotency check: If already paid, return safe no-op
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

    // 3. Sandbox check (STRICTLY BLOCKED IN PRODUCTION)
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

      const { order } = confirmOrderPayment({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
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

    // 4. Live/Test Gateway Mode Verification
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
      recordOrderPaymentFailure({
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

      // Confirm amount match (in paise)
      const expectedAmountPaise = Math.round(existingOrder.total * 100);
      if (paymentEntity.amount !== expectedAmountPaise) {
        return NextResponse.json(
          { verified: false, error: `Payment amount (${paymentEntity.amount}) does not match order total (${expectedAmountPaise})` },
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
        recordOrderPaymentFailure({
          razorpayOrderId: razorpay_order_id,
          reason: `Payment is in unexpected state: ${paymentEntity.status}`,
        });

        return NextResponse.json(
          { verified: false, error: `Payment is not in captured state (current: ${paymentEntity.status})` },
          { status: 400 }
        );
      }
    }

    // Step C: Confirm payment and update order status idempotently
    const { order, alreadyPaid } = confirmOrderPayment({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      source: 'callback',
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
