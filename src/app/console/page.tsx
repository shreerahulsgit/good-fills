import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Atelier Console • Good Fills Admin',
    description: 'Manage Good Fills orders, processing batches, sales analytics, and order fulfillment.',
};

export default function ConsolePage() {
    return <AdminDispatchView initialTab="dashboard" />;
}