import type { Metadata } from 'next';
import { PolicyLayout } from '@/components/legal/policy-layout';
import { PrivacyPolicyContent } from '@/components/legal/privacy-policy';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Read how Good Fills collects, uses and protects personal information related to your account, orders, payments and delivery.',
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