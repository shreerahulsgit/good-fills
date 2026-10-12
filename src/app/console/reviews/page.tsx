import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Review Management',
    description: 'Review customer ratings and testimonials, and manage verified purchase feedback in the Good Fills console.',
};

export default function ConsoleReviewsPage() {
    return <AdminDispatchView initialTab="reviews" />;
}