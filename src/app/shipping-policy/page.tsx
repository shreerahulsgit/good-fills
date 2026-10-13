import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/policy-layout';
import { ShippingPolicyContent } from '@/components/legal/shipping-policy';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy',
    description: 'Find information about order preparation, shipping methods, delivery timelines and tracking for Good Fills orders in India and internationally.',
};

export default function ShippingPolicyPage() {
    return (
        <PolicyLayout
        activePolicy="shipping"
        title="Shipping &amp; <em>Delivery Policy</em>"
        subtitle="Freshly roasted, sprouted, and milled in Bengaluru within 24–48 hours. Fast, tracked delivery across India and worldwide."
        lastUpdated="October 2026"
        >
        <ShippingPolicyContent />
        </PolicyLayout>
    );
}