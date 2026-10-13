import type { Metadata } from 'next';
import { getAllServerProducts } from '@/lib/store/products';
import { ShopCatalogView } from '@/components/shop/catalog-view';
import { ProductCategory } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Shop Handmade Products | Good Fills',
    description: 'Browse small-batch food, nutrition, skincare and bath products made to order in Bengaluru. Find everyday essentials with delivery across India.',
    openGraph: {
        title: 'Shop Handmade Products | Good Fills',
        description: 'Browse small-batch food, nutrition, skincare and bath products made to order in Bengaluru. Find everyday essentials with delivery across India.',
    },
};

interface ShopPageProps {
    searchParams?: {
        category?: string;
    };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const products = await getAllServerProducts();
    const category = (searchParams?.category as ProductCategory) || 'all';

    return (
        <main>
        <ShopCatalogView initialCategory={category} initialProducts={products} />
        </main>
    );
}