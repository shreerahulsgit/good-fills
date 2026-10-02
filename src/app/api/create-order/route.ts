import { NextResponse } from 'next/server';
import { getRazorpayClient, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const currency = body.currency || 'INR';
    const receipt = body.receipt || `rcpt_${Date.now()}`;

    // Validate minimum amount (100 paise = ₹1)
    if (!amount || isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least 100 paise (₹1)' },
        { status: 400 }
      );
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 401 }
      );
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { error: 'Razorpay client initialization failed' },
        { status: 500 }
      );
    }

    // Call Razorpay orders.create
    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt,
      notes: body.notes || {},
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err: any) {
    console.error('Razorpay create-order error:', err);
    return NextResponse.json(
      { error: err?.error?.description || err?.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
