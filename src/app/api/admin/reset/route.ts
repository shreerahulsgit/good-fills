import { NextResponse } from 'next/server';
import { clearAllOrders } from '@/lib/supabase-orders';
import { clearAllCustomers } from '@/lib/server-customer';
import { clearAllInquiries } from '@/lib/inquiries';
import { resetReviewsToSeed } from '@/lib/server-reviews';
import { requireConsoleSession } from '@/lib/require-console-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authError = requireConsoleSession();
    if (authError) return authError;

    // 1. Wipe all orders, payments, and webhook events
    await clearAllOrders();

    // 2. Wipe all patron / customer profiles and saved addresses
    await clearAllCustomers();

    // 3. Wipe all inquiries, queries, and contact messages
    await clearAllInquiries();

    // 4. Reset reviews back to default authentic seed catalog reviews
    await resetReviewsToSeed();

    return NextResponse.json({
      success: true,
      message: 'All test data (customers, orders, inquiries, and messages) has been erased successfully.',
      cleared: {
        orders: true,
        customers: true,
        inquiries: true,
        reviewsResetToSeed: true,
      },
    });
  } catch (error: any) {
    console.error('Error during admin data reset:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to erase data.' },
      { status: 500 }
    );
  }
}
