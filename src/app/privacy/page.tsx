import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { PrivacyPolicyContent } from '@/components/legal/PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy • Good Fills Bengaluru Atelier',
  description:
    'Our commitment to your privacy, IT Act and DPDP Act compliance, zero storage of financial/UPI data, and responsible handling of shipping information.',
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      activePolicy="privacy"
      title="Atelier <em>Privacy Policy</em>"
      subtitle="How we respect and safeguard your personal information. Zero sensitive financial data storage, bank-grade 256-bit encryption, and a strict anti-spam promise."
      lastUpdated="October 2026"
    >
      <PrivacyPolicyContent />
    </PolicyLayout>
  );
}
