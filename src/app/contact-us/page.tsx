import type { Metadata } from 'next';
import { ContactView } from '@/components/contact-us/contact-view';

export const metadata: Metadata = {
    title: 'Contact & Customer Support',
    description: 'Contact the Good Fills team in Bengaluru for product questions, order assistance, delivery updates or wholesale inquiries. We are ready to help.',
};

export default function ContactUsPage() {
    return <ContactView />;
}