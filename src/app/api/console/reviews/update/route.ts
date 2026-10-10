import { NextRequest, NextResponse } from 'next/server';
import {
    deleteReview,
    toggleFeaturedReview,
    toggleReviewVisibility,
    addFounderReply,
} from '@/lib/store/reviews';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const authError = requireConsoleSession();
        if (authError) return authError;

        const body = await req.json();
        const { action, reviewId, message } = body;

        if (!action || !reviewId) {
            return NextResponse.json(
                { success: false, error: 'Action and review ID are required.' },
                { status: 400 }
            );
        }

        if (action === 'delete') {
            const deleted = await deleteReview(reviewId);
            if (!deleted) {
                return NextResponse.json(
                    { success: false, error: 'Review not found or already deleted.' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, message: 'Review deleted successfully.' });
        }

        if (action === 'toggle-feature') {
            const isFeatured = await toggleFeaturedReview(reviewId);
            return NextResponse.json({
                success: true,
                isFeatured,
                message: isFeatured ? 'Review marked as featured testimonial.' : 'Review removed from featured testimonials.',
            });
        }

        if (action === 'toggle-visibility') {
            const updated = await toggleReviewVisibility(reviewId);
            if (!updated) {
                return NextResponse.json(
                    { success: false, error: 'Review not found.' },
                    { status: 404 }
                );
            }
            return NextResponse.json({
                success: true,
                review: updated,
                message: updated.status === 'hidden' ? 'Review hidden from store.' : 'Review published.',
            });
        }

        if (action === 'reply') {
            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Reply message cannot be empty.' },
                    { status: 400 }
                );
            }
            const updated = await addFounderReply(reviewId, message);
            if (!updated) {
                return NextResponse.json(
                    { success: false, error: 'Review not found.' },
                    { status: 404 }
                );
            }
            return NextResponse.json({
                success: true,
                review: updated,
                message: 'Founder reply posted.',
            });
        }

        return NextResponse.json(
            { success: false, error: `Unknown moderation action: ${action}` },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Error executing review moderation action:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Operation failed.' },
            { status: 500 }
        );
    }
}