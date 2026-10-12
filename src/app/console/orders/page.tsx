import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Order Management',
    description: 'Review customer orders, update fulfillment status and coordinate dispatch from the Good Fills console.',
};

export default function ConsoleOrdersPage() {
    return <AdminDispatchView initialTab="orders" />;
}