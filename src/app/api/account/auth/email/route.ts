import { NextResponse } from 'next/server';
import { loginOrRegisterCustomer } from '@/lib/server-customer';
import { getSupabaseUser } from '@/lib/require-supabase-user';

export async function POST(request: Request) {
  try {
    const authUser = await getSupabaseUser();
    if (!authUser) return NextResponse.json({ error: 'Account authentication required.' }, { status: 401 });

    const body = await request.json();
    const { name } = body;
    const email = authUser.email;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const result = await loginOrRegisterCustomer({ email, name, authUserId: authUser.id });
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
