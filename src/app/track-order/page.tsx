import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrackView } from '@/components/track/TrackView';

export const metadata: Metadata = {
  title: 'Live Order Tracking • Good Fills Express Delivery',
  description:
    'Track your freshly milled sprouted porridge and organic flour consignments in real time. Kitchen preparation milestones and live tracking updates.',
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
