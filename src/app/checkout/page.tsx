import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/checkout-view';

export const metadata: Metadata = {
    title: 'Secure Checkout & Payment',
    description: 'Review your order, enter delivery details and complete payment securely. Good Fills offers made-to-order products with delivery across India.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function CheckoutPage() {
    return <CheckoutView />;
}