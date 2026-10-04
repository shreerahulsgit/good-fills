import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { getServerProductBySlug, getAllServerProducts } from '@/lib/server-products';
import { ProductDetailView } from '@/components/product/ProductDetailView';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const allProducts = getAllServerProducts();
  const list = allProducts.length > 0 ? allProducts : PRODUCTS;
  return list.map((product) => ({
    slug: product.slug,
  }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getServerProductBySlug(params.slug) || PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    return {
      title: 'Product Not Found — Good Fills',
    };
  }

  return {
    title: `${product.name} (${product.packSize}) — Good Fills Atelier`,
    description: `${product.shortDescription} Handmade to order in Bengaluru, India. 100% natural traditional care. DTDC express delivery.`,
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

export default function ProductPage({ params }: ProductPageProps) {
  const product = getServerProductBySlug(params.slug) || PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const allProducts = getAllServerProducts();

  return (
    <main>
      <ProductDetailView product={product} allProducts={allProducts} />
    </main>
  );
}

