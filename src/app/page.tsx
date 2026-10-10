import React from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { ArtisanalValues } from '@/components/home/artisanal-values';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoryPortals } from '@/components/home/category-portals';
import { ProcessTimeline } from '@/components/home/process-timeline';
import { FeaturedTestimonials } from '@/components/home/featured-testimonals';
import { getAllServerProducts } from '@/lib/store/products';
import { getAllReviews } from '@/lib/store/reviews';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
    const products = await getAllServerProducts();
    const reviews = await getAllReviews();

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