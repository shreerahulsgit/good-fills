import { NextResponse } from 'next/server';
import { getRazorpayClient, isRazorpayConfigured, isSandboxAllowed, isProduction } from '@/lib/razorpay';
import { createPendingOrder, linkRazorpayOrderId } from '@/lib/server-orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, shippingAddress } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Valid cart items are required' },
        { status: 400 }
      );
    }

    if (!customer?.fullName || !customer?.phone || !customer?.email) {
      return NextResponse.json(
        { error: 'Valid customer contact details are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.addressLine1 || !shippingAddress?.city || !shippingAddress?.pincode) {
      return NextResponse.json(
        { error: 'Valid delivery address is required' },
        { status: 400 }
      );
    }

    // 1. Authoritative Server Calculation & Internal Order Creation
    // (Never trust any clientTotal or clientPrice)
    const { order, authoritativeTotal } = createPendingOrder({
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingAddress: {
        ...shippingAddress,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        country: 'India',
      },
      clientItems: items,
    });

    const amountInPaise = Math.round(authoritativeTotal * 100);

    // 2. Production safety check
    if (isProduction() && !isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Production payment gateway credentials are not configured.' },
        { status: 500 }
      );
    }

    // 3. Genuine Gateway Order Creation (Live or Test keys)
    if (isRazorpayConfigured()) {
      const razorpay = getRazorpayClient();
      if (!razorpay) {
        throw new Error('Razorpay client initialization failed');
      }

      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.id,
        notes: {
          goodFillsOrderId: order.id,
          customerName: order.customerName,
          phone: order.customerPhone,
          atelier: 'Bengaluru Made to Order',
        },
      });

      // Maintain authoritative Server ↔ Razorpay mapping
      linkRazorpayOrderId(order.id, rzpOrder.id);

      return NextResponse.json({
        success: true,
        internalOrderId: order.id,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        isMock: false,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      });
    }

    // 4. Atelier Sandbox Mode (STRICTLY DEVELOPMENT ONLY)
    if (isSandboxAllowed()) {
      const simulatedOrderId = `order_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      linkRazorpayOrderId(order.id, simulatedOrderId);

      return NextResponse.json({
        success: true,
        internalOrderId: order.id,
        razorpayOrderId: simulatedOrderId,
        amount: amountInPaise,
        currency: 'INR',
        isMock: true,
        keyId: 'rzp_test_simulated',
        message: 'Atelier Test Sandbox active [DEVELOPMENT ONLY]',
      });
    }

    return NextResponse.json(
      { error: 'Payment gateway configuration is missing or inactive.' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
