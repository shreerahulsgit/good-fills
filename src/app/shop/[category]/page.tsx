import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/lib/data/shop';
import { ProductCategory, CategoryPageProps } from '@/types';
import { getAllServerProducts } from '@/lib/store/products';
import { ShopCatalogView } from '@/components/shop/catalog-view';
import { JsonLd } from '@/components/seo/json-ld';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

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
        alternates: {
            canonical: `https://thegoodfills.com/shop/${params.category}`,
        },
        openGraph: {
            title: `${catInfo.name} Products`,
            description,
            url: `https://thegoodfills.com/shop/${params.category}`,
            images: [
                {
                    url: '/logo.png',
                    width: 1200,
                    height: 400,
                    alt: `${catInfo.name} Products`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${catInfo.name} Products`,
            description,
            images: ['/logo.png'],
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = params.category as ProductCategory;

    if (!VALID_CATEGORIES.includes(category)) {
        notFound();
    }

    const catInfo = CATEGORIES.find((c) => c.id === category);
    const categoryName = catInfo?.name || 'Category';

    const products = await getAllServerProducts();

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: categoryName, url: `/shop/${category}` },
    ]);

    return (
        <main>
            <JsonLd data={breadcrumbSchema} />
            <ShopCatalogView initialCategory={category} initialProducts={products} />
        </main>
    );
}
