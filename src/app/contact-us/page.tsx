import type { Metadata } from 'next';
import { ContactView } from '@/components/contact-us/contact-view';
import { KITCHEN_FAQS } from '@/lib/data/faqs';
import { JsonLd } from '@/components/seo/json-ld';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
    title: 'Contact Atelier & Concierge',
    description: 'Contact the Good Fills kitchen team in Bengaluru for product questions, infant weaning advice, order assistance, delivery updates or custom batches.',
    alternates: {
        canonical: 'https://thegoodfills.com/contact-us',
    },
    openGraph: {
        title: 'Contact Atelier & Concierge | Good Fills',
        description: 'Contact the Good Fills kitchen team in Bengaluru for product questions, infant weaning advice, order assistance, delivery updates or custom batches.',
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
        title: 'Contact Atelier & Concierge | Good Fills',
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
