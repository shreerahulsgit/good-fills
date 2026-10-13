import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Customer Inquiries',
    description: 'Review and manage customer questions, contact requests and product inquiries in the Good Fills console.',
};

export default function ConsoleInquiriesPage() {
    return <AdminDispatchView initialTab="inquiries" />;
}