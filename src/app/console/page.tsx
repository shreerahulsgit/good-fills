import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Administration Console',
    description: 'Manage customer orders, product listings, kitchen preparation and business activity from the Good Fills administration console.',
};

export default function ConsolePage() {
    return <AdminDispatchView initialTab="dashboard" />;
}