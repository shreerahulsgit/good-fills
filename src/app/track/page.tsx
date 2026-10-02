import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TrackView } from '@/components/track/TrackView';

export const metadata: Metadata = {
  title: 'Live Order Tracking • Good Fills DTDC Pan-India Express',
  description:
    'Track your freshly stone-milled sprouted porridge and organic flour consignments in real time. Kitchen preparation milestones and DTDC courier tracking.',
};

export default function TrackPage() {
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
          Connecting to DTDC Telemetry Gateway...
        </div>
      }
    >
      <TrackView />
    </Suspense>
  );
}
