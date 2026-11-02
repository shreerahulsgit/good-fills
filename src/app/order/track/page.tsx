import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrackView } from '@/components/order/track-view';

export const metadata: Metadata = {
    title: 'Order Tracking & Updates',
    description: 'Check your Good Fills order status, kitchen preparation progress and live DTDC courier tracking updates in one place.',
    alternates: {
        canonical: 'https://thegoodfills.com/order/track',
    },
};

export default function TrackOrderPage() {
    return (
        <Suspense
        fallback={
            <div
            style={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-canvas)',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            }}
            >
            Connecting to Order Telemetry Gateway...
            </div>
        }
        >
        <TrackView />
        </Suspense>
    );
}
