import type { Metadata } from 'next';
import { AboutView } from '@/components/about/AboutView';

export const metadata: Metadata = {
  title: 'Our Story • Good Fills Bengaluru Atelier',
  description:
    'The philosophy behind Good Fills: traditional washing, soaking, sun-drying, and sprouting pulses and grains in Bengaluru. Pure made-to-order family nutrition and botanical care.',
};

export default function AboutPage() {
  return <AboutView />;
}
