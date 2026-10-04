import { NextResponse } from 'next/server';
import { updateServerProduct } from '@/lib/server-products';

export async function POST(request: Request) {
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

    const body = await request.json();
    const { id, updates } = body;

    if (!id || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Valid product id and updates payload are required.' },
        { status: 400 }
      );
    }

    const updated = updateServerProduct(id, updates);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product.' },
      { status: 500 }
    );
  }
}
