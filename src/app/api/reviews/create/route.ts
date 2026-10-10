import { NextRequest, NextResponse } from 'next/server';
import { addCustomerReview, getReviewsByOrderId } from '@/lib/store/reviews';
import { resolveOrderById } from '@/lib/store/orders';
import { getSupabaseUser } from '@/lib/store/users';
import { getCustomerProfile } from '@/lib/store/customers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const authUser = await getSupabaseUser();
        if (!authUser) return NextResponse.json({ success: false, error: 'Account authentication required.' }, { status: 401 });

        const body = await req.json();
        const { orderId, productId, productName, rating, title, comment, authorName, location, childAge } = body;

        if (!orderId || typeof orderId !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Only customers with delivered orders can submit a review. Please provide your Order ID.',
                },
                { status: 403 }
            );
        }

        if (!productId || typeof productId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Product ID is required.' },
                { status: 400 }
            );
        }

        const order = await resolveOrderById(orderId.trim());
        if (!order) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Order #${orderId} was not found. Please verify your order number.`,
                },
                { status: 404 }
            );
        }

        const customerProfile = await getCustomerProfile(authUser.id);
        const ownsOrder = customerProfile?.orders.some((customerOrder) => customerOrder.id === order.id);
        if (!ownsOrder) {
            return NextResponse.json(
                { success: false, error: 'You can only review products from your own orders.' },
                { status: 403 }
            );
        }

        const isDelivered =
        order.shipmentStatus === 'Delivered' ||
        order.orderStatus === 'Completed';

        if (!isDelivered) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Order #${order.id} is currently ${order.shipmentStatus || order.orderStatus}. You can write a review once your package has been delivered to your doorstep.`,
                },
                { status: 400 }
            );
        }

        const cleanProductId = productId.trim().toLowerCase();
        const hasProduct = order.items && order.items.some((item) => {
            const pId = (item.product?.id || (item as any).productId || '').toLowerCase();
            const pSlug = (item.product?.slug || (item as any).productSlug || '').toLowerCase();
            return pId === cleanProductId || pSlug === cleanProductId;
        });

        if (!hasProduct) {
            return NextResponse.json(
                {
                    success: false,
                    error: `This product was not purchased in Order #${order.id}.`,
                },
                { status: 400 }
            );
        }

        const existingForOrder = await getReviewsByOrderId(order.id);
        const alreadyReviewed = existingForOrder.some((r) => {
            return r.productId.toLowerCase() === cleanProductId;
        });

        if (alreadyReviewed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'You have already submitted a review for this product from this order. Thank you!',
                },
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
                { success: false, error: 'Please provide a headline for your review.' },
                { status: 400 }
            );
        }

        if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
            return NextResponse.json(
                { success: false, error: 'Please provide detailed feedback (at least 5 characters).' },
                                     { status: 400 }
            );
        }

        const resolvedAuthor = (authorName && typeof authorName === 'string' && authorName.trim().length > 1)
        ? authorName.trim()
        : (order.customerName || order.shippingAddress?.fullName || 'Verified Customer');

        const resolvedLocation = (location && typeof location === 'string' && location.trim().length > 1)
        ? location.trim()
        : (order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state || 'Karnataka'}` : 'Bengaluru, Karnataka');

        const newReview = await addCustomerReview({
            orderId: order.id,
            productId,
            productName: productName || 'Traditional Creation',
            rating: numericRating,
            title: title.trim(),
                                                  comment: comment.trim(),
                                                  authorName: resolvedAuthor,
                                                  location: resolvedLocation,
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