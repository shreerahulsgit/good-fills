import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AccountView } from '@/components/account/account-view';

export const metadata: Metadata = {
    title: 'Account and Orders',
    description: 'Review your order history, check shipment updates, access receipts and manage your saved delivery addresses in your Good Fills account.',
};

export default function AccountPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '60vh' }}></div>}>
        <AccountView />
        </Suspense>
    );
}