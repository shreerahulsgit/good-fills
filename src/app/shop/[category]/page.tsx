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
            title: 'Shop Products',
            description: 'Browse small-batch food, nutrition, skincare and bath products made to order in Bengaluru, with delivery available across India.',
        };
    }

    const categoryDescriptions: Record<ProductCategory, string> = {
        'baby-kids': 'Explore thoughtfully prepared food and bath essentials for babies and children, made in small batches in Bengaluru.',
        'nutrition-wellness': 'Browse small-batch nutrition blends and pantry essentials prepared with care in Bengaluru for everyday use.',
        'skin-bath': 'Discover traditional bath and skincare essentials made in small batches with carefully selected botanical ingredients.',
        'pantry-beverages': 'Shop pantry staples and beverages prepared in small batches, with products made to order in Bengaluru.',
    };
    const description = categoryDescriptions[catInfo.id];

    return {
        title: `${catInfo.name} Products`,
        description,
        openGraph: {
            title: `${catInfo.name} Products`,
            description,
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