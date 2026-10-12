import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/policy-layout';
import { RefundPolicyContent } from '@/components/legal/refund-policy';

export const metadata: Metadata = {
    title: 'Returns & Replacement Policy',
    description: 'Review the Good Fills cancellation, return and replacement terms, including how to report an item damaged during delivery.',
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