import type { Metadata } from 'next';
import { AboutView } from '@/components/our-story/our-story-view';

export const metadata: Metadata = {
    title: 'Our Story and Approach',
    description: 'Learn about Good Fills and our approach to preparing small-batch food, nutrition and personal care products in Bengaluru.',
};

export default function OurStoryPage() {
    return <AboutView />;
}
