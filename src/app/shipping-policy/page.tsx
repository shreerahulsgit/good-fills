import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { ShippingPolicyContent } from '@/components/legal/ShippingPolicyContent';

export const metadata: Metadata = {
  title: 'Shipping Policy & International Delivery • Good Fills Bengaluru Atelier',
  description:
    'Learn about our fresh made-to-order kitchen dispatch, domestic express logistics, pan-India delivery timelines, and worldwide air cargo services.',
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
