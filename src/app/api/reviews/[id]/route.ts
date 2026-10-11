import { NextRequest, NextResponse } from 'next/server';
import { voteReviewHelpful } from '@/lib/store/reviews';

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
        }

        const helpfulCount = await voteReviewHelpful(id);
        if (helpfulCount === null) {
            return NextResponse.json(
                { success: false, error: 'Review not found' },
                { status: 404, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        return NextResponse.json(
            { success: true, helpfulCount },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error: any) {
        console.error('Error voting review helpful:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update helpful vote.' },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}