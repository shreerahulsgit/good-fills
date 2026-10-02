import { NextResponse } from 'next/server';
import { getCustomerProfile } from '@/lib/server-customer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('id') || searchParams.get('phone') || searchParams.get('email');

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Customer mobile number or email is required.' },
        { status: 400 }
      );
    }

    const data = getCustomerProfile(identifier);
    if (!data) {
      return NextResponse.json(
        { error: 'Customer record not found. Please verify your phone number or email.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Error in customer profile route:', error);
    return NextResponse.json(
      { error: 'Failed to load customer profile.' },
      { status: 500 }
    );
  }
}
