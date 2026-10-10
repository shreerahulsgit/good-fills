import { NextResponse } from 'next/server';
import { searchTrackingOrder } from '@/lib/dispatch/tracking';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('id') || searchParams.get('phone');

        if (!query || !query.trim()) {
            return NextResponse.json(
                {
                    error: 'Please enter a valid Good Fills Order ID or 10-digit mobile number.',
                },
                { status: 400 }
            );
        }

        const trackingData = await searchTrackingOrder(query);

        if (!trackingData || ['pending', 'cancelled'].includes(trackingData.orderStatus.trim().toLowerCase())) {
            return NextResponse.json(
                {
                    error: `No consignment record located for query "${query.trim()}". Please verify your Order ID or mobile number.`,
                },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, tracking: trackingData });
    } catch (error) {
        console.error('Error fetching live order tracking:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred while communicating with the logistics telemetry gateway.' },
            { status: 500 }
        );
    }
}