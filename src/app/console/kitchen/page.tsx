import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Kitchen Prep & Roasting Planner • Good Fills Console',
    description: 'Daily kitchen roasting, sprouting, and milling production manifest.',
};

export default function ConsoleKitchenPage() {
    return <AdminDispatchView initialTab="kitchen" />;
}