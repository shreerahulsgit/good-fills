import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
    title: 'Product Catalog',
    description: 'Manage product descriptions, pricing, pack sizes, availability and featured listings in the Good Fills catalog.',
};

export default function ConsoleProductsPage() {
    return <AdminDispatchView initialTab="products" />;
}