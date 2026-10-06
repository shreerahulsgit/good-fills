'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Quote, Maximize2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Review } from '@/lib/server-reviews';
import styles from './FeaturedTestimonials.module.css';

interface FeaturedTestimonialsProps {
  initialReviews?: Review[];
}

const luxuryEase = [0.16, 1, 0.3, 1] as const;

export function FeaturedTestimonials({ initialReviews = [] }: FeaturedTestimonialsProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedModalImage, setSelectedModalImage] = useState<{ src: string; author: string; title: string } | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedModalImage) {
        setSelectedModalImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModalImage]);

  // Touch tracking for mobile swipe gestures
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Responsive itemsPerView calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch live reviews from API to reflect any recent admin approvals or pinned testimonials
  useEffect(() => {
    fetch('/api/reviews', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviewsList(data.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to refresh testimonials:', err);
      });
  }, []);

  // Curate ONLY explicitly admin-featured testimonials:
  // ONLY testimonials that the admin has actively pinned/featured in the console appear on the homepage.
  const displayedReviews = useMemo(() => {
    return reviewsList
      .filter((r) => Boolean(r.isFeatured) && r.status !== 'hidden')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviewsList]);

  const maxIndex = Math.max(0, displayedReviews.length - itemsPerView);
  const totalSteps = maxIndex + 1;

  // Keep currentIndex within bounds if itemsPerView changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Gentle autoplay: slides every 6.5s when user is not hovering or swiping
  useEffect(() => {
    if (isPaused || totalSteps <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(timer);
  }, [isPaused, totalSteps, handleNext]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation when user interacts with carousel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  if (displayedReviews.length === 0) {
    return null;
  }

  const gap = itemsPerView === 1 ? 16 : 20;

  return (
    <section
      id="testimonials"
      className={styles.section}
      aria-label="Customer Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.container}>
        {/* Editorial Section Header */}
        <div className={styles.header}>
          <div className={styles.headerTextGroup}>
            <motion.span
              className={styles.eyebrow}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: luxuryEase }}
            >
              Voices of Our Patrons
            </motion.span>
            <motion.h2
              className={styles.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08, ease: luxuryEase }}
            >
              Cherished in Family Kitchens.
            </motion.h2>
            <motion.p
              className={styles.description}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.14, ease: luxuryEase }}
            >
              Authentic experiences from parents, doctors, and mindful patrons across India whose daily rituals are nourished by Good Fills made-to-order creations.
            </motion.p>
          </div>

          {/* Carousel Controls (Desktop & Tablet) */}
          <div className={styles.headerControls}>
            <div className={styles.counter}>
              <span className={styles.counterCurrent}>
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className={styles.counterDivider}>/</span>
              <span className={styles.counterTotal}>
                {String(totalSteps).padStart(2, '0')}
              </span>
            </div>

            <div className={styles.navButtons}>
              <button
                type="button"
                onClick={handlePrev}
                className={styles.navButton}
                aria-label="Previous testimonial"
              >
                <ArrowLeft size={15} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={styles.navButton}
                aria-label="Next testimonial"
              >
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Refined Luxury Trust Strip */}
        <motion.div
          className={styles.trustStrip}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18, ease: luxuryEase }}
        >
          <div className={styles.trustItem}>
            <div className={styles.starsGroup}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} className={styles.starFilled} />
              ))}
            </div>
            <span className={styles.trustText}>
              <strong>4.9 / 5.0</strong> Rating
            </span>
          </div>

          <span className={styles.trustDot} aria-hidden="true" />

          <div className={styles.trustItem}>
            <Sparkles size={13} className={styles.trustIconAccent} />
            <span className={styles.trustText}>
              <strong>100%</strong> Pure &amp; Wholesome
            </span>
          </div>

          <span className={styles.trustDot} aria-hidden="true" />

          <div className={styles.trustItem}>
            <ShieldCheck size={14} className={styles.trustIconGreen} />
            <span className={styles.trustText}>
              <strong>Verified</strong> Patron Community
            </span>
          </div>
        </motion.div>

        {/* Carousel Viewport & Track with Sequential Animation */}
        <div
          className={styles.carouselViewport}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.carouselTrack}
            style={{
              transform: `translateX(calc(-${currentIndex} * ((100% + ${gap}px) / ${itemsPerView})))`,
            }}
          >
            {displayedReviews.map((review, idx) => {
              // Extract initials for refined monogram
              const initials = review.authorName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <article
                  key={review.id}
                  className={`${styles.card} ${review.isFeatured ? styles.cardFeatured : ''}`}
                  style={{
                    flex: `0 0 calc((100% - ${(itemsPerView - 1) * gap}px) / ${itemsPerView})`,
                    maxWidth: `calc((100% - ${(itemsPerView - 1) * gap}px) / ${itemsPerView})`,
                  }}
                >
                  <div className={styles.cardInner}>
                    {/* Header Row: Stars, Badges & Product Tag */}
                    <div className={styles.cardHeaderRow}>
                      <div className={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= review.rating ? styles.starFilled : ''}
                            color={s <= review.rating ? '#d97706' : 'var(--border-subtle)'}
                            fill={s <= review.rating ? '#d97706' : 'none'}
                          />
                        ))}
                        <span className={styles.ratingNumber}>{review.rating}.0</span>
                      </div>

                      <div className={styles.badgesRow}>
                        {review.isFeatured && (
                          <span className={styles.featuredBadge}>
                            <Sparkles size={10} />
                            Featured
                          </span>
                        )}
                        {review.isVerifiedBuyer && (
                          <span className={styles.verifiedBadge}>
                            <ShieldCheck size={10} strokeWidth={2.4} />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Mention Link */}
                    <div className={styles.productTagWrapper}>
                      <Link
                        href={`/product/${review.productId}`}
                        className={styles.productTag}
                        title={`View ${review.productName}`}
                      >
                        <span>{review.productName}</span>
                        <span className={styles.productTagArrow}>➔</span>
                      </Link>
                    </div>

                    {/* Quote Content */}
                    <div className={styles.quoteWrapper}>
                      <Quote size={18} className={styles.quoteIcon} aria-hidden="true" />
                      <h3 className={styles.reviewTitle}>&ldquo;{review.title}&rdquo;</h3>
                      <p className={styles.reviewComment}>{review.comment}</p>
                    </div>

                    {/* Verified Customer Feedback Photo / Note Inside Card */}
                    {review.testimonialImage && (
                      <div className={styles.testimonialPhotoWrapper}>
                        <button
                          type="button"
                          onClick={() => setSelectedModalImage({
                            src: review.testimonialImage!,
                            author: review.authorName,
                            title: review.title
                          })}
                          className={styles.photoThumbnailBtn}
                          aria-label={`View verified note from ${review.authorName}`}
                        >
                          <div className={styles.photoThumbFrame}>
                            <img
                              src={review.testimonialImage}
                              alt={`Verified note from ${review.authorName}`}
                              className={styles.photoThumbImg}
                              loading="lazy"
                            />
                            <div className={styles.photoZoomOverlay}>
                              <Maximize2 size={12} />
                              <span>View Verified Note</span>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Kitchen Note if present */}
                    {review.founderReply && (
                      <div className={styles.founderReplyBox}>
                        <div className={styles.founderReplyLabel}>Kitchen Note:</div>
                        <p className={styles.founderReplyText}>{review.founderReply.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Author Monogram, Name & Details */}
                  <div className={styles.cardAuthor}>
                    <div className={styles.authorProfile}>
                      <div className={styles.avatarMonogram} aria-hidden="true">
                        {initials}
                      </div>
                      <div className={styles.authorDetails}>
                        <span className={styles.authorName}>{review.authorName}</span>
                        <span className={styles.authorMeta}>{review.location}</span>
                      </div>
                    </div>

                    {review.childAge && (
                      <span className={styles.childAgeTag}>{review.childAge}</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Bottom Pagination & Mobile Controls */}
        <div className={styles.bottomBar}>
          {/* Mobile Prev / Next Controls */}
          <div className={styles.mobileNavRow}>
            <button
              type="button"
              onClick={handlePrev}
              className={styles.mobileNavBtn}
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={14} />
              <span>Prev</span>
            </button>

            <span className={styles.mobileCounter}>
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className={styles.mobileNavBtn}
              aria-label="Next testimonial"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Pagination Step Pips */}
          <div className={styles.paginationDots} role="tablist" aria-label="Testimonial slides">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={currentIndex === idx}
                onClick={() => setCurrentIndex(idx)}
                className={`${styles.dot} ${currentIndex === idx ? styles.dotActive : ''}`}
                aria-label={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Bottom Catalog Link */}
          <div className={styles.footerAction}>
            <Link href="/shop" className={styles.exploreBtn}>
              <span>Explore All 13 Creations</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Screenshot Viewing */}
      {selectedModalImage && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setSelectedModalImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Verified Customer Note"
        >
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.lightboxHeader}>
              <div className={styles.lightboxTitleRow}>
                <ShieldCheck size={16} className={styles.lightboxShield} />
                <span className={styles.lightboxAuthor}>
                  Verified Patron Feedback · {selectedModalImage.author}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalImage(null)}
                className={styles.lightboxCloseBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.lightboxImageWrap}>
              <img
                src={selectedModalImage.src}
                alt={`Testimonial from ${selectedModalImage.author}`}
                className={styles.lightboxImg}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
