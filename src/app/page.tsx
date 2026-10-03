'use client';

import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { InternationalAnnouncement } from '@/components/home/InternationalAnnouncement';
import { ArtisanalValues } from '@/components/home/ArtisanalValues';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryPortals } from '@/components/home/CategoryPortals';
import { ProcessTimeline } from '@/components/home/ProcessTimeline';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <InternationalAnnouncement />
      <ArtisanalValues />
      <FeaturedProducts />
      <CategoryPortals />
      <ProcessTimeline />
    </main>
  );
}
