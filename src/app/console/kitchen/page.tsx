import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Kitchen Prep & Planner',
    description: 'Organize daily kitchen preparation, roasting, sprouting and milling tasks using the Good Fills production planner.',
};

export default function ConsoleKitchenPage() {
    return <AdminDispatchView initialTab="kitchen" />;
}