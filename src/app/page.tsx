import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ArtisanalValues } from '@/components/home/ArtisanalValues';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryPortals } from '@/components/home/CategoryPortals';
import { ProcessTimeline } from '@/components/home/ProcessTimeline';
import { getAllServerProducts } from '@/lib/server-products';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getAllServerProducts();

  return (
    <main>
      <HeroSection />
      <ArtisanalValues />
      <FeaturedProducts initialProducts={products} />
      <CategoryPortals initialProducts={products} />
      <ProcessTimeline />
    </main>
  );
}
