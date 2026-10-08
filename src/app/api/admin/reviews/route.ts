import { NextRequest, NextResponse } from 'next/server';
import {
  getAllReviews,
  deleteReview,
  toggleFeaturedReview,
  toggleReviewVisibility,
  addFounderReply,
} from '@/lib/server-reviews';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

export async function POST(req: NextRequest) {
  try {
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
