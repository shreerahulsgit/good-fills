import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ArtisanalValues } from '@/components/home/ArtisanalValues';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryPortals } from '@/components/home/CategoryPortals';
import { ProcessTimeline } from '@/components/home/ProcessTimeline';
import { FeaturedTestimonials } from '@/components/home/FeaturedTestimonials';
import { getAllServerProducts } from '@/lib/server-products';
import { getAllReviews } from '@/lib/server-reviews';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getAllServerProducts();
  const reviews = getAllReviews();

  return (
    <main>
      <HeroSection />
      <ArtisanalValues />
      <FeaturedProducts initialProducts={products} />
      <CategoryPortals initialProducts={products} />
      <ProcessTimeline />
      <FeaturedTestimonials initialReviews={reviews} />
    </main>
  );
}
