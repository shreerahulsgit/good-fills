import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerProductBySlug, getAllServerProducts } from '@/lib/store/products';
import { getProductReviewSummary } from '@/lib/store/reviews';
import { ProductDetailView } from '@/components/product/product-view';
import { JsonLd } from '@/components/seo/json-ld';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { CATEGORIES } from '@/lib/data/shop';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const allProducts = await getAllServerProducts();
    return allProducts.map((product) => ({
        slug: product.slug,
    }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const product = await getServerProductBySlug(params.slug);

    if (!product) {
        return {
            title: 'Product Not Found',
            description: 'This product could not be found. Browse the Good Fills collection to discover food, nutrition, skincare and bath essentials.',
        };
    }

    const description = `${product.name} (${product.packSize}), made to order in Bengaluru. View ingredients, benefits, and delivery information from Good Fills.`;

    return {
        title: `${product.name} - ${product.packSize}`,
        description,
        alternates: {
            canonical: `https://thegoodfills.com/product/${product.slug}`,
        },
        openGraph: {
            title: `${product.name} - ${product.packSize}`,
            description,
            url: `https://thegoodfills.com/product/${product.slug}`,
            images: [
                {
                    url: product.images?.primary || '/logo.png',
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} - ${product.packSize}`,
            description,
            images: [product.images?.primary || '/logo.png'],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await getServerProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    const allProducts = await getAllServerProducts();

    let reviewSummary = null;
    try {
        reviewSummary = await getProductReviewSummary(product.id);
    } catch (err) {
        console.warn('Failed to fetch review summary for product schema:', err);
    }

    const categoryObj = CATEGORIES.find((c) => c.id === product.category);
    const categoryName = categoryObj?.name || 'Shop';

    const productSchema = generateProductSchema(product, reviewSummary);
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' },
        { name: categoryName, url: `/shop/${product.category}` },
        { name: `${product.name} - ${product.packSize}`, url: `/product/${product.slug}` },
    ]);

    return (
        <main>
            <JsonLd data={[productSchema, breadcrumbSchema]} />
            <ProductDetailView product={product} allProducts={allProducts} />
        </main>
    );
}
