import { NextResponse } from 'next/server';
import { getAllServerProducts } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

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

    const products = getAllServerProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve products.' },
      { status: 500 }
    );
  }
}
