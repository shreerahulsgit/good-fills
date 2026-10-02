'use client';

import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ArtisanalValues } from '@/components/home/ArtisanalValues';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryPortals } from '@/components/home/CategoryPortals';
import { ProcessTimeline } from '@/components/home/ProcessTimeline';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ArtisanalValues />
      <FeaturedProducts />
      <CategoryPortals />
      <ProcessTimeline />
    </main>
  );
}
