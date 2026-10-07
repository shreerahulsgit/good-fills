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
export const revalidate = 0;

export default function HomePage() {
  const products = getAllServerProducts(true);
  const reviews = getAllReviews();

  return (
    <main>
      <HeroSection />
      <ArtisanalValues />
      <CategoryPortals initialProducts={products} />
      <FeaturedProducts initialProducts={products} />
      <ProcessTimeline />
      <FeaturedTestimonials initialReviews={reviews} />
    </main>
  );
}
