import { NextRequest, NextResponse } from 'next/server';
import { getProductReviewSummary, getAllReviews, addCustomerReview } from '@/lib/server-reviews';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (productId) {
      const summary = getProductReviewSummary(productId);
      return NextResponse.json(
        { success: true, summary },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const reviews = getAllReviews();
    return NextResponse.json(
      { success: true, reviews },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, rating, title, comment, authorName, location, childAge } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Product ID is required.' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid headline for your review.' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please provide detailed feedback (at least 5 characters).' },
        { status: 400 }
      );
    }

    if (!authorName || typeof authorName !== 'string' || authorName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your name.' },
        { status: 400 }
      );
    }

    const newReview = addCustomerReview({
      productId,
      productName: productName || 'Traditional Creation',
      rating: numericRating,
      title: title.trim(),
      comment: comment.trim(),
      authorName: authorName.trim(),
      location: location?.trim() || 'Bengaluru, India',
      childAge: childAge?.trim(),
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit review.' },
      { status: 500 }
    );
  }
}
