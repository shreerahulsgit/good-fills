import type { Metadata } from 'next';
import { AboutView } from '@/components/our-story/our-story-view';
import { JsonLd } from '@/components/seo/json-ld';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
    title: 'Our Story and Approach',
    description: 'Learn about Good Fills and our approach to preparing small-batch food, nutrition and personal care products in Bengaluru.',
    alternates: {
        canonical: 'https://thegoodfills.com/our-story',
    },
    openGraph: {
        title: 'Our Story and Approach',
        description: 'Learn about Good Fills and our approach to preparing small-batch food, nutrition and personal care products in Bengaluru.',
        url: 'https://thegoodfills.com/our-story',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 400,
                alt: 'Our Story Good Fills',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Our Story and Approach',
        description: 'Small-batch food, nutrition and personal care crafted with care in Bengaluru.',
        images: ['/logo.png'],
    },
};

export default function OurStoryPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Our Story', url: '/our-story' },
    ]);

    return (
        <main>
            <JsonLd data={breadcrumbSchema} />
            <AboutView />
        </main>
    );
}
