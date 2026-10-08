import { NextResponse } from 'next/server';
import { deleteServerProduct } from '@/lib/server-products';
import { requireConsoleSession } from '@/lib/require-console-session';

export async function POST(request: Request) {
  try {
    const authError = requireConsoleSession();
    if (authError) return authError;

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
