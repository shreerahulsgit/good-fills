import type { Metadata } from 'next';
import { getAllServerProducts } from '@/lib/store/products';
import { ShopCatalogView } from '@/components/shop/catalog-view';
import { ProductCategory } from '@/types';
import { JsonLd } from '@/components/seo/json-ld';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Shop Handmade Products | Good Fills',
    description: 'Browse small-batch food, nutrition, skincare and bath products made to order in Bengaluru. Find everyday essentials with delivery across India.',
    alternates: {
        canonical: 'https://thegoodfills.com/shop',
    },
    openGraph: {
        title: 'Shop Handmade Products | Good Fills',
        description: 'Browse small-batch food, nutrition, skincare and bath products made to order in Bengaluru. Find everyday essentials with delivery across India.',
        url: 'https://thegoodfills.com/shop',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 400,
                alt: 'Good Fills Catalog',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Shop Handmade Products | Good Fills',
        description: 'Browse small-batch food, nutrition, skincare and bath products made to order in Bengaluru.',
        images: ['/logo.png'],
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

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
    ]);

    return (
        <main>
            <JsonLd data={breadcrumbSchema} />
            <ShopCatalogView initialCategory={category} initialProducts={products} />
        </main>
    );
}
