import { NextResponse } from 'next/server';
import { getAllServerProducts } from '@/lib/server-products';
import { requireConsoleSession } from '@/lib/require-console-session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const authError = requireConsoleSession();
    if (authError) return authError;

    const products = await getAllServerProducts();
    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve products.' },
      { status: 500 }
    );
  }
}
