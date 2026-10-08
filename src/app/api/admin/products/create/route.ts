import { NextResponse } from 'next/server';
import { createServerProduct } from '@/lib/server-products';
import { requireConsoleSession } from '@/lib/require-console-session';

export async function POST(request: Request) {
  try {
    const authError = requireConsoleSession();
    if (authError) return authError;

    const body = await request.json();
    const { name, category, price, packSize, productWeightGrams } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Product name, category, and price are required.' },
        { status: 400 }
      );
    }

    const created = await createServerProduct(body);
    return NextResponse.json({ success: true, product: created });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product.' },
      { status: 500 }
    );
  }
}
