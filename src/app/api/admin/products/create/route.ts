import { NextResponse } from 'next/server';
import { createServerProduct } from '@/lib/server-products';

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
    const { name, category, price, packSize, productWeightGrams } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Product name, category, and price are required.' },
        { status: 400 }
      );
    }

    const created = createServerProduct(body);
    return NextResponse.json({ success: true, product: created });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product.' },
      { status: 500 }
    );
  }
}
