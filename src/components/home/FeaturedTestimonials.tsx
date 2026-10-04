'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Review } from '@/lib/server-reviews';
import styles from './FeaturedTestimonials.module.css';

interface FeaturedTestimonialsProps {
  initialReviews?: Review[];
}

const luxuryEase = [0.16, 1, 0.3, 1] as const;

export function FeaturedTestimonials({ initialReviews = [] }: FeaturedTestimonialsProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);

  // Re-fetch client side to ensure live updates if admin toggles featured status
  useEffect(() => {
    fetch('/api/reviews', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviewsList(data.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to refresh testimonials:', err);
      });
  }, []);

  // Compute displayed testimonials:
  // 1. Give top priority to reviews marked `isFeatured: true` by the admin
  // 2. If fewer than 3 reviews are pinned, fill with the highest-rated verified buyer reviews
  const displayedReviews = useMemo(() => {
    const published = reviewsList.filter((r) => r.status !== 'hidden');
    const featured = published.filter((r) => r.isFeatured);

    if (featured.length >= 3) {
      return featured.slice(0, 6);
    }

    const remaining = published.filter((r) => !r.isFeatured && r.rating >= 4);
    remaining.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));

    const combined = [...featured, ...remaining];
    return combined.slice(0, 3);
  }, [reviewsList]);

  if (displayedReviews.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Customer Testimonials">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.subtitle}>Voices of Our Patrons</span>
          <h2 className={styles.title}>Cherished in Family Kitchens</h2>
          <p className={styles.description}>
            Authentic experiences from parents, doctors, and mindful patrons across India whose daily rituals are nourished by Good Fills made-to-order creations.
          </p>
        </div>

        {/* Aggregate Trust Banner */}
        <div className={styles.trustBanner}>
          <div className={styles.trustItem}>
            <div className={styles.starsRow} style={{ marginBottom: 0 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} className={styles.starFilled} />
              ))}
            </div>
            <span>4.9 / 5.0 Star Rating</span>
          </div>

          <div className={styles.trustDivider} />

          <div className={styles.trustItem}>
            <Sparkles size={15} color="var(--accent-terracotta)" />
            <span>100% Wholesome Recommendation</span>
          </div>

          <div className={styles.trustDivider} />

          <div className={styles.trustItem}>
            <ShieldCheck size={15} color="#15803d" />
            <span>Verified Order Reviews</span>
          </div>
        </div>

        {/* 3-Column Testimonials Grid */}
        <div className={styles.testimonialsGrid}>
          {displayedReviews.map((review, idx) => (
            <motion.article
              key={review.id}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: luxuryEase }}
            >
              <div className={styles.cardTop}>
                {/* Header Row: Verified Badge & Creation Link */}
                <div className={styles.cardHeaderRow}>
                  <div className={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= review.rating ? styles.starFilled : ''}
                        color={s <= review.rating ? '#d97706' : 'var(--border-medium)'}
                        fill={s <= review.rating ? '#d97706' : 'none'}
                      />
                    ))}
                  </div>

                  {review.isVerifiedBuyer && (
                    <span className={styles.verifiedBadge}>
                      <ShieldCheck size={11} strokeWidth={2.5} />
                      Verified
                    </span>
                  )}
                </div>

                <Link
                  href={`/product/${review.productId}`}
                  className={styles.productTag}
                  title={`View ${review.productName}`}
                >
                  {review.productName} ➔
                </Link>

                <h3 className={styles.reviewTitle}>&ldquo;{review.title}&rdquo;</h3>
                <p className={styles.reviewComment}>&ldquo;{review.comment}&rdquo;</p>

                {/* Founder Reply if available */}
                {review.founderReply && (
                  <div className={styles.founderReplyBox}>
                    <div className={styles.founderReplyLabel}>Good Fills Kitchen Note:</div>
                    <p className={styles.founderReplyText}>{review.founderReply.message}</p>
                  </div>
                )}
              </div>

              {/* Author & Location Footer */}
              <div className={styles.cardAuthor}>
                <div className={styles.authorDetails}>
                  <span className={styles.authorName}>{review.authorName}</span>
                  <span className={styles.authorMeta}>{review.location}</span>
                </div>

                {review.childAge && (
                  <span className={styles.childAgeTag}>{review.childAge}</span>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={styles.footerCta}>
          <Link href="/shop" className={styles.exploreBtn}>
            <span>Explore All Artisanal Creations</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
