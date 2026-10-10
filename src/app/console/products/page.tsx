import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Product Catalog Management • Good Fills Console',
    description: 'Edit product details, pricing, pack sizes, stock availability, and featured badges.',
};

export default function ConsoleProductsPage() {
    return <AdminDispatchView initialTab="products" />;
}