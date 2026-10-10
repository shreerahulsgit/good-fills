import { NextRequest, NextResponse } from 'next/server';
import { getAllReviews } from '@/lib/store/reviews';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const authError = requireConsoleSession();
        if (authError) return authError;

        const reviews = await getAllReviews();

        const totalCount = reviews.length;
        const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalScore = 0;
        let featuredCount = 0;
        let verifiedCount = 0;

        reviews.forEach((r) => {
            const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
            distribution[rounded] = (distribution[rounded] || 0) + 1;
            totalScore += r.rating;
            if (r.isFeatured) featuredCount++;
            if (r.isVerifiedBuyer) verifiedCount++;
        });

            const averageRating = totalCount > 0 ? Number((totalScore / totalCount).toFixed(1)) : 5.0;
            const recommendCount = (distribution[5] || 0) + (distribution[4] || 0);
            const recommendationPercentage = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 100;

            return NextResponse.json(
                {
                    success: true,
                    stats: {
                        totalCount,
                        averageRating,
                        recommendationPercentage,
                        featuredCount,
                        verifiedCount,
                        distribution,
                    },
                    reviews,
                },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                        Pragma: 'no-cache',
                        Expires: '0',
                    },
                }
            );
    } catch (error: any) {
        console.error('Error fetching admin reviews:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch reviews.' },
            { status: 500 }
        );
    }
}