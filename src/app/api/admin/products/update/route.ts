import { NextResponse } from 'next/server';
import { updateServerProduct } from '@/lib/server-products';
import { requireConsoleSession } from '@/lib/require-console-session';

export async function POST(request: Request) {
  try {
    const authError = requireConsoleSession();
    if (authError) return authError;

    const body = await request.json();
    const { id, updates } = body;

    if (!id || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Valid product id and updates payload are required.' },
        { status: 400 }
      );
    }

    const updated = await updateServerProduct(id, updates);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update product.' },
      { status: 500 }
    );
  }
}
