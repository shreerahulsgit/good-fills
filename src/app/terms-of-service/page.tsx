import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/policy-layout';
import { TermsPolicyContent } from '@/components/legal/terms-policy';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Review the terms that apply to Good Fills website use, orders, payments, product information and customer responsibilities.',
};

export default function TermsOfServicePage() {
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