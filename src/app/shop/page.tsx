import type { Metadata } from 'next';
import { ShopCatalogView } from '@/components/shop/ShopCatalogView';

export const metadata: Metadata = {
  title: 'Shop All Handcrafted Creations — Good Fills',
  description:
    'Browse our complete catalog of 13 homemade food, nutrition, skincare, and bath products crafted to order in Bengaluru. 100% natural, DTDC delivery across India.',
  openGraph: {
    title: 'Shop All Handcrafted Creations — Good Fills',
    description:
      'Browse our complete catalog of 13 homemade food, nutrition, skincare, and bath products crafted to order in Bengaluru.',
  },
};

export default function ShopPage() {
  return (
    <main>
      <ShopCatalogView initialCategory="all" />
    </main>
  );
}
