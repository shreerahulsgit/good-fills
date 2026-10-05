import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
// Note: To use the cinematic scroll-driven expanding intro hero instead, swap HeroSection with ScrollExpandingHero:
// import { ScrollExpandingHero } from '@/components/home/ScrollExpandingHero';
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
      {/* Active: High-converting minimal editorial hero. (Swap with <ScrollExpandingHero /> whenever approved) */}
      <HeroSection />
      <ArtisanalValues />
      <CategoryPortals initialProducts={products} />
      <FeaturedProducts initialProducts={products} />
      <ProcessTimeline />
      <FeaturedTestimonials initialReviews={reviews} />
    </main>
  );
}
