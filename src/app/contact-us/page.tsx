import type { Metadata } from 'next';
import { ContactView } from '@/components/contact/ContactView';

export const metadata: Metadata = {
  title: 'Contact Our Kitchen Atelier • Good Fills Bengaluru',
  description:
    'Connect directly with the Good Fills Bengaluru kitchen team. Inquire about infant weaning nutrition, custom milled porridge ratios, live order tracking, or wholesale hampers.',
};

export default function ContactUsPage() {
  return <ContactView />;
}
