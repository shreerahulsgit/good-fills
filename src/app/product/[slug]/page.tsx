import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerProductBySlug, getAllServerProducts } from '@/lib/store/products';
import { ProductDetailView } from '@/components/product/product-view';

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
            title: 'Product Not Found — Good Fills',
        };
    }

    return {
        title: `${product.name} (${product.packSize}) — Good Fills Atelier`,
        description: `${product.shortDescription} Handmade to order in Bengaluru, India. 100% natural traditional care. Fast, tracked delivery across India.`,
        openGraph: {
            title: `${product.name} — Handcrafted by Good Fills`,
            description: product.shortDescription,
            images: [
                {
                    url: product.images?.primary || '/logo.png',
                    width: 800,
                    height: 800,
                    alt: product.name,
                },
            ],
        },
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await getServerProductBySlug(params.slug);

    if (!product) {
        notFound();
    }

    const allProducts = await getAllServerProducts();

    return (
        <main>
        <ProductDetailView product={product} allProducts={allProducts} />
        </main>
    );
}