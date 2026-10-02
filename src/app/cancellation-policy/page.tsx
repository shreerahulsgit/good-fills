import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { RefundPolicyContent } from '@/components/legal/RefundPolicyContent';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy • Good Fills Bengaluru Atelier',
  description:
    'Information regarding our made-to-order non-cancellable terms and strict non-returnable policy under food safety standards.',
};

export default function CancellationPolicyPage() {
  return (
    <PolicyLayout
      activePolicy="refund"
      title="Cancellation &amp; <em>Refund Policy</em>"
      subtitle="Orders are immediately scheduled for custom micro-batch preparation upon payment confirmation and cannot be cancelled. Read our policy regarding food hygiene and transit protection."
      lastUpdated="October 2026"
    >
      <RefundPolicyContent />
    </PolicyLayout>
  );
}
