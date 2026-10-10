import { NextResponse } from 'next/server';
import { fetchDtdcCheckpoints } from '@/lib/dispatch/dtdc';
import { searchTrackingOrder } from '@/lib/dispatch/tracking';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('id') || searchParams.get('phone');

        if (!query || !query.trim()) {
            return NextResponse.json(
                { error: 'Please enter a valid Good Fills Order ID or 10-digit mobile number.' },
                { status: 400 }
            );
        }

        const trackingData = await searchTrackingOrder(query);

        if (!trackingData) {
            return NextResponse.json(
                {
                    error: `No consignment record located for query "${query.trim()}". Please verify your Order ID or mobile number.`,
                },
                { status: 404 }
            );
        }

        const awbNumber = trackingData.courier.awbNumber.trim();
        if (!awbNumber || awbNumber === 'Assigned on Dispatch') {
            return new NextResponse(null, { status: 204 });
        }

        const checkpoints = await fetchDtdcCheckpoints(awbNumber);
        return NextResponse.json(checkpoints);
    } catch (error) {
        console.error('Error fetching DTDC live tracking:', error);
        return NextResponse.json(
            { error: 'Live DTDC tracking is temporarily unavailable. Please try again shortly.' },
            { status: 502 }
        );
    }
}