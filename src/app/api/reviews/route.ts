import { NextRequest, NextResponse } from 'next/server';
import { getProductReviewSummary, getAllReviews, getReviewsByOrderId } from '@/lib/store/reviews';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId');
        const productId = searchParams.get('productId');

        if (orderId) {
            const reviews = await getReviewsByOrderId(orderId);
            return NextResponse.json(
                { success: true, reviews },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        Pragma: 'no-cache',
                        Expires: '0',
                    },
                }
            );
        }

        if (productId) {
            const summary = await getProductReviewSummary(productId);
            return NextResponse.json(
                { success: true, summary },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        Pragma: 'no-cache',
                        Expires: '0',
                    },
                }
            );
        }

        const reviews = await getAllReviews();
        return NextResponse.json(
            { success: true, reviews },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0',
                },
            }
        );
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to retrieve reviews.' },
            { status: 500 }
        );
    }
}