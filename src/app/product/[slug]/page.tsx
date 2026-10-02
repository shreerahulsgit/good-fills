import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { ProductDetailView } from '@/components/product/ProductDetailView';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = PRODUCTS.find((p) => p.slug === params.slug);

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
          url: product.images.primary,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <ProductDetailView product={product} />
    </main>
  );
}
