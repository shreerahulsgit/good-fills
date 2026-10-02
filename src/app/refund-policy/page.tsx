import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { RefundPolicyContent } from '@/components/legal/RefundPolicyContent';

export const metadata: Metadata = {
  title: 'Returns & Replacement Policy • Good Fills Bengaluru Atelier',
  description:
    'Our strictly non-returnable and non-cancellable policy for fresh artisanal foods, infant nutrition powders, and botanical care, plus our 24-hour transit damage replacement guarantee.',
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      activePolicy="refund"
      title="Returns &amp; <em>Replacement Policy</em>"
      subtitle="Bespoke made-to-order creations are strictly non-returnable and non-cancellable once confirmed. Backed by our 100% transit damage and broken seal guarantee."
      lastUpdated="October 2026"
    >
      <RefundPolicyContent />
    </PolicyLayout>
  );
}
