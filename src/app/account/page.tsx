import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AccountView } from '@/components/account/account-view';

export const metadata: Metadata = {
    title: 'My Account & Orders • Good Fills Bengaluru',
    description:
    'View your Good Fills order history, track live shipments, inspect receipts, and manage saved delivery addresses.',
};

export default function AccountPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '60vh' }}></div>}>
        <AccountView />
        </Suspense>
    );
}