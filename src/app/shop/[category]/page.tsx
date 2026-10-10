import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/data/shop';
import { ProductCategory, CategoryPageProps } from '@/types';
import { getAllServerProducts } from '@/lib/store/products';
import { ShopCatalogView } from '@/components/shop/catalog-view';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: ProductCategory[] = [
    'baby-kids',
    'nutrition-wellness',
    'skin-bath',
    'pantry-beverages',
];

export function generateStaticParams() {
    return VALID_CATEGORIES.map((cat) => ({
        category: cat,
    }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
    const catInfo = CATEGORIES.find((c) => c.id === params.category);

    if (!catInfo) {
        return {
            title: 'Shop — Good Fills',
        };
    }

    return {
        title: `${catInfo.name} — Handcrafted to Order | Good Fills`,
        description: catInfo.description,
        openGraph: {
            title: `${catInfo.name} — Good Fills`,
            description: catInfo.description,
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = params.category as ProductCategory;

    if (!VALID_CATEGORIES.includes(category)) {
        notFound();
    }

    const products = await getAllServerProducts();

    return (
        <main>
        <ShopCatalogView initialCategory={category} initialProducts={products} />
        </main>
    );
}