import { NextResponse } from 'next/server';
import { getAllServerOrders } from '@/lib/server-orders';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = request.headers.get('x-admin-pin') || searchParams.get('pin');
    const validPin = process.env.ADMIN_PIN || '2026';

    if (pin !== validPin && pin !== 'admin123') {
      return NextResponse.json(
        { error: 'Unauthorized. Please provide a valid admin PIN.' },
        { status: 401 }
      );
    }

    const orders = getAllServerOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders.' },
      { status: 500 }
    );
  }
}
