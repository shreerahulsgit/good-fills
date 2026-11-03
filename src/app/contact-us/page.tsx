import type { Metadata } from 'next';
import { ContactView } from '@/components/contact-us/contact-view';
import { KITCHEN_FAQS } from '@/lib/data/faqs';
import { JsonLd } from '@/components/seo/json-ld';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
    title: 'Contact & Customer Support',
    description: 'Contact the Good Fills team in Bengaluru for product questions, order assistance, delivery updates or wholesale inquiries. We are ready to help.',
    alternates: {
        canonical: 'https://thegoodfills.com/contact-us',
    },
    openGraph: {
        title: 'Contact & Customer Support',
        description: 'Contact the Good Fills team in Bengaluru for product questions, order assistance, delivery updates or wholesale inquiries. We are ready to help.',
        url: 'https://thegoodfills.com/contact-us',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 400,
                alt: 'Contact Good Fills Bengaluru',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Contact & Customer Support',
        description: 'Direct communication with the Good Fills kitchen in Bengaluru.',
        images: ['/logo.png'],
    },
};

export default function ContactUsPage() {
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Contact Us', url: '/contact-us' },
    ]);

    const faqSchema = generateFAQSchema(KITCHEN_FAQS);

    return (
        <main>
            <JsonLd data={[breadcrumbSchema, faqSchema]} />
            <ContactView />
        </main>
    );
}
