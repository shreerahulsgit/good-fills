import type { Metadata } from 'next';
import { AboutView } from '@/components/about/AboutView';

export const metadata: Metadata = {
  title: 'Our Story • Good Fills Bengaluru Kitchen',
  description:
    'How Good Fills makes fresh homemade baby food, sprouted porridges, and natural bath powders in Bengaluru. Pure traditional soaking, sprouting, and stone grinding.',
};

export default function OurStoryPage() {
  return <AboutView />;
}
