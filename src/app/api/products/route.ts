import { NextResponse } from 'next/server';
import { getAllServerProducts, syncProductsFromFirestore } from '@/lib/server-products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await syncProductsFromFirestore();
    const products = getAllServerProducts(true);
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
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve products.' },
      { status: 500 }
    );
  }
}
