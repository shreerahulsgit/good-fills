import type { Metadata } from 'next';
import { ContactView } from '@/components/contact/ContactView';

export const metadata: Metadata = {
  title: 'Contact Our Kitchen Atelier • Good Fills Bengaluru',
  description:
    'Connect directly with the Good Fills Bengaluru kitchen team. Inquire about infant weaning nutrition, custom stone-milled porridge ratios, DTDC order tracking, or wholesale hampers.',
};

export default function ContactPage() {
  return <ContactView />;
}
