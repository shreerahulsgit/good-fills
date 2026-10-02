import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { ShippingPolicyContent } from '@/components/legal/ShippingPolicyContent';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy • Good Fills Bengaluru Atelier',
  description:
    'Learn about our fresh made-to-order kitchen dispatch, DTDC Domestic Express logistics, weight-based courier rates, and pan-India doorstep delivery timelines.',
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      activePolicy="shipping"
      title="Shipping &amp; <em>Delivery Policy</em>"
      subtitle="Freshly roasted, sprouted, and stone-milled in Bengaluru within 24–48 hours of order confirmation. Delivered across India via DTDC Express."
      lastUpdated="October 2026"
    >
      <ShippingPolicyContent />
    </PolicyLayout>
  );
}
