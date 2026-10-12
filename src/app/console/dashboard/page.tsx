import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Console Dashboard',
    description: 'Review sales activity, revenue metrics and key business performance indicators for Good Fills.',
};

export default function ConsoleDashboardPage() {
    return <AdminDispatchView initialTab="dashboard" />;
}