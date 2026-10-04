import type { Metadata } from 'next';
import { getAllServerProducts } from '@/lib/server-products';
import { ShopCatalogView } from '@/components/shop/ShopCatalogView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop All Handcrafted Creations — Good Fills',
  description:
    'Browse our complete catalog of homemade food, nutrition, skincare, and bath products crafted to order in Bengaluru. 100% natural, DTDC delivery across India.',
  openGraph: {
    title: 'Shop All Handcrafted Creations — Good Fills',
    description:
      'Browse our complete catalog of homemade food, nutrition, skincare, and bath products crafted to order in Bengaluru.',
  },
};

export default function ShopPage() {
  const products = getAllServerProducts();

  return (
    <main>
      <ShopCatalogView initialCategory="all" initialProducts={products} />
    </main>
  );
}

