import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Customer Reviews Moderation • Good Fills Console',
    description: 'Moderate customer ratings, testimonials, and verified purchase feedback.',
};

export default function ConsoleReviewsPage() {
    return <AdminDispatchView initialTab="reviews" />;
}