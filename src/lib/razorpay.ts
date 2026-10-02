import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Server-side Razorpay configuration and verification utility.
 * Strictly server-only; secret keys are never exposed to client bundles.
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return false;
  if (keyId.includes('placeholder') || keySecret.includes('placeholder')) return false;

  return true;
}

/**
 * Enforces Requirement 19:
 * The Atelier Sandbox Simulator must be development/test-only.
 * It must NEVER activate in production.
 */
export function isSandboxAllowed(): boolean {
  if (isProduction()) {
    return false;
  }
  return process.env.NEXT_PUBLIC_MOCK_PAYMENT_MODE !== 'false';
}

export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured()) return null;

  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Timing-safe cryptographic HMAC-SHA256 signature verification for Checkout Callback
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
 */
export function verifySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature || !orderId || !paymentId) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (err) {
    console.error('Error during signature comparison:', err);
    return false;
  }
}

/**
 * Timing-safe cryptographic HMAC-SHA256 signature verification for Razorpay Webhooks
 * Formula: HMAC_SHA256(raw_request_body, RAZORPAY_WEBHOOK_SECRET)
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !rawBody) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const actualBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (err) {
    console.error('Error during webhook signature comparison:', err);
    return false;
  }
}

/**
 * Query Razorpay API directly to verify payment capture status and payment method
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<any | null> {
  const razorpay = getRazorpayClient();
  if (!razorpay) return null;

  try {
    return await razorpay.payments.fetch(paymentId);
  } catch (err) {
    console.error(`Error querying Razorpay API for payment ${paymentId}:`, err);
    return null;
  }
}
