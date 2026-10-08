import { NextResponse } from 'next/server';
import { updateCustomerProfile } from '@/lib/server-customer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, name, email, phone } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Customer identifier is required.' },
        { status: 400 }
      );
    }

    if (!name && !email && phone === undefined) {
      return NextResponse.json(
        { error: 'Please provide a name or email to update.' },
        { status: 400 }
      );
    }

    const updated = await updateCustomerProfile(identifier, { name, email, phone });
    if (!updated) {
      return NextResponse.json(
        { error: 'Customer profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
