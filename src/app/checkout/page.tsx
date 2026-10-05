import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Secure Checkout • Good Fills Atelier',
  description:
    'Complete your order for freshly prepared homemade nutrition, food, and skincare. Direct UPI payment and fast, tracked doorstep delivery across India.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
