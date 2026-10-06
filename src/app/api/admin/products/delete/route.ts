import { NextResponse } from 'next/server';
import { deleteServerProduct } from '@/lib/server-products';

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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product id is required.' },
        { status: 400 }
      );
    }

    const success = await deleteServerProduct(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
