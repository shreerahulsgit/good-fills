import Razorpay from 'razorpay';
import crypto from 'crypto';

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

export function isSandboxAllowed(): boolean {
    if (isProduction()) {
        return false;
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    if (keyId.startsWith('rzp_live_')) {
        return false;
    }
    const mode = process.env.NEXT_PUBLIC_MOCK_PAYMENT_MODE;
    return mode !== 'false' && mode !== 'disabled';
}

export function getRazorpayClient(): Razorpay | null {
    if (!isRazorpayConfigured()) return null;

    return new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
}

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

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script');
      resolve(false);
    };

    document.body.appendChild(script);
  });
}