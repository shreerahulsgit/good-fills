import { NextResponse } from 'next/server';
import { loginOrRegisterCustomer } from '@/lib/server-customer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, authUserId } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const result = await loginOrRegisterCustomer({ email, name, authUserId });
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to authenticate patron session.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patron session authenticated successfully.',
      user: result.user,
      orders: result.orders,
    });
  } catch (error: any) {
    console.error('Email sign-in API error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error during email authentication.' },
      { status: 500 }
    );
  }
}
