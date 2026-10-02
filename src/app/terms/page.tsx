import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/PolicyLayout';
import { TermsPolicyContent } from '@/components/legal/TermsPolicyContent';

export const metadata: Metadata = {
  title: 'Terms of Service • Good Fills Bengaluru Atelier',
  description:
    'Terms of service, made-to-order conditions, artisanal food guidelines, allergen disclaimers, and legal jurisdiction for Good Fills.',
};

export default function TermsPage() {
  return (
    <PolicyLayout
      activePolicy="terms"
      title="Terms of <em>Service</em>"
      subtitle="Operating standards, dietary disclaimers, UPI billing terms, and customer rights governing our Bengaluru handcrafted food and botanical care atelier."
      lastUpdated="October 2026"
    >
      <TermsPolicyContent />
    </PolicyLayout>
  );
}
