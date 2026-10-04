import { NextResponse } from 'next/server';
import { getAllServerProducts } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = getAllServerProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve products.' },
      { status: 500 }
    );
  }
}
