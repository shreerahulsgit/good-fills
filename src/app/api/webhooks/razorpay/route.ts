import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import {
  confirmOrderPayment,
  recordOrderPaymentFailure,
  isWebhookEventProcessed,
  recordWebhookEventProcessed,
} from '@/lib/server-orders';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 signature verification
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      console.warn('Unauthorized Razorpay webhook attempt with invalid signature');
      return NextResponse.json(
        { error: 'Invalid webhook cryptographic signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    // 2. Idempotency Check: Don't process the same webhook event twice
    if (isWebhookEventProcessed(eventId)) {
      return NextResponse.json({
        received: true,
        status: 'already_processed',
        eventId,
      });
    }

    // 3. Process relevant lifecycle events
    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        const paymentId = payment?.id;

        if (razorpayOrderId && paymentId) {
          confirmOrderPayment({
            razorpayOrderId,
            razorpayPaymentId: paymentId,
            source: 'webhook',
          });
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payload?.payment?.entity;
        const razorpayOrderId = payment?.order_id;
        const errorDesc = payment?.error_description || 'Payment failed';

        if (razorpayOrderId) {
          recordOrderPaymentFailure({
            razorpayOrderId,
            reason: errorDesc,
          });
        }
        break;
      }

      case 'order.paid': {
        const orderEntity = payload.payload?.order?.entity;
        const payment = payload.payload?.payment?.entity;
        const razorpayOrderId = orderEntity?.id;
        const paymentId = payment?.id;

        if (razorpayOrderId && paymentId) {
          confirmOrderPayment({
            razorpayOrderId,
            razorpayPaymentId: paymentId,
            source: 'webhook',
          });
        }
        break;
      }

      default:
        // Ignore unhandled events safely
        break;
    }

    // 4. Mark event ID as processed
    recordWebhookEventProcessed(eventId);

    return NextResponse.json({
      received: true,
      event: eventType,
      eventId,
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
