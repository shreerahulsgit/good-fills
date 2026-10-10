import type { Metadata } from 'next';
import { getAllServerProducts } from '@/lib/store/products';
import { ShopCatalogView } from '@/components/shop/catalog-view';
import { ProductCategory } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Shop All Handcrafted Creations — Good Fills',
    description:
    'Browse our complete catalog of homemade food, nutrition, skincare, and bath products crafted to order in Bengaluru. 100% natural, fast doorstep delivery across India.',
    openGraph: {
        title: 'Shop All Handcrafted Creations — Good Fills',
        description:
        'Browse our complete catalog of homemade food, nutrition, skincare, and bath products crafted to order in Bengaluru.',
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