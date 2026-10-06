'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  PenLine,
  X,
  Check,
  ShieldCheck,
  MessageSquare,
  Package,
  Maximize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { Review, ProductReviewSummary } from '@/lib/server-reviews';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import styles from './ProductReviewsSection.module.css';

interface ProductReviewsSectionProps {
  product: Product;
  initialSummary?: ProductReviewSummary | null;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Exceptional — Exceeded Expectations',
  4: 'Wonderful — High Quality & Wholesome',
  3: 'Good — Standard Experience',
  2: 'Fair — Needs Improvement',
  1: 'Disappointing — Not as Expected',
};

export function ProductReviewsSection({ product, initialSummary }: ProductReviewsSectionProps) {
  const { currentUser, orders } = useCustomerAuth();
  const [summary, setSummary] = useState<ProductReviewSummary | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSummary);
  const [activeFilter, setActiveFilter] = useState<'all' | number>('all');
  const [sortBy, setSortBy] = useState<'helpful' | 'newest' | 'rating'>('helpful');
  const [selectedModalImage, setSelectedModalImage] = useState<{ src: string; author: string } | null>(null);
  
  // Delivered order validation: strictly verify if this customer has a delivered order with this product
  const deliveredOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    const targetId = product.id.toLowerCase();
    const targetSlug = (product.slug || '').toLowerCase();

    return orders.find((o) => {
      const isDelivered = o.shipmentStatus === 'Delivered' || o.orderStatus === 'Delivered';
      if (!isDelivered) return false;
      return o.items && o.items.some((item) => {
        const pId = (item.product?.id || (item as any).productId || '').toLowerCase();
        const pSlug = (item.product?.slug || (item as any).productSlug || '').toLowerCase();
        return pId === targetId || pSlug === targetSlug || pId === targetSlug || pSlug === targetId;
      });
    }) || null;
  }, [orders, product.id, product.slug]);

  // Helpful Votes Tracking in localStorage
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    authorName: '',
    location: '',
    childAge: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sync author name with current user or delivered order
  useEffect(() => {
    if (deliveredOrder || currentUser) {
      setFormData((prev) => ({
        ...prev,
        authorName: prev.authorName || currentUser?.name || deliveredOrder?.customerName || '',
        location: prev.location || (deliveredOrder?.shippingAddress?.city ? `${deliveredOrder.shippingAddress.city}, ${deliveredOrder.shippingAddress.state || 'Karnataka'}` : ''),
      }));
    }
  }, [deliveredOrder, currentUser]);

  // Load voted reviews from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gf_helpful_reviews');
      if (saved) {
        setVotedIds(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch reviews if not provided
  useEffect(() => {
    if (!initialSummary) {
      setIsLoading(true);
      fetch(`/api/reviews?productId=${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.summary) {
            setSummary(data.summary);
          }
        })
        .catch((err) => console.error('Failed to load reviews:', err))
        .finally(() => setIsLoading(false));
    }
  }, [product.id, initialSummary]);

  // Handle helpful vote
  const handleVoteHelpful = async (reviewId: string) => {
    if (votedIds.has(reviewId)) return;

    // Optimistic UI update
    const updatedVoted = new Set(votedIds).add(reviewId);
    setVotedIds(updatedVoted);
    try {
      localStorage.setItem('gf_helpful_reviews', JSON.stringify(Array.from(updatedVoted)));
    } catch {
      // Ignore
    }

    if (summary) {
      setSummary({
        ...summary,
        reviews: summary.reviews.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        ),
      });
    }

    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
    } catch (err) {
      console.error('Error recording helpful vote:', err);
    }
  };

  // Submit new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.title.trim()) {
      setSubmitError('Please enter a review headline.');
      return;
    }
    if (!formData.comment.trim() || formData.comment.trim().length < 5) {
      setSubmitError('Please enter detailed feedback (at least 5 characters).');
      return;
    }
    if (!formData.authorName.trim()) {
      setSubmitError('Please enter your name.');
      return;
    }

    if (!deliveredOrder) {
      setSubmitError('Only customers with a delivered order can write a review. Please check your order history in your account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: deliveredOrder.id,
          productId: product.id,
          productName: product.name,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
          authorName: formData.authorName,
          location: formData.location || deliveredOrder.shippingAddress?.city || 'Bengaluru, Karnataka',
          childAge: formData.childAge || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      const createdReview: Review = data.review;

      // Optimistic update summary
      if (summary) {
        const newReviews = [createdReview, ...summary.reviews];
        const newTotal = newReviews.length;
        const newSum = newReviews.reduce((acc, curr) => acc + curr.rating, 0);
        const newAvg = Number((newSum / newTotal).toFixed(1));
        const newDist = { ...summary.distribution };
        const roundedRating = Math.min(5, Math.max(1, Math.round(createdReview.rating))) as 1|2|3|4|5;
        newDist[roundedRating] = (newDist[roundedRating] || 0) + 1;
        const recommendCount = newReviews.filter((r) => r.rating >= 4).length;

        setSummary({
          averageRating: newAvg,
          totalCount: newTotal,
          recommendationPercentage: Math.round((recommendCount / newTotal) * 100),
          distribution: newDist,
          reviews: newReviews,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          authorName: '',
          location: '',
          childAge: '',
        });
      }, 1400);
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    if (!summary || !summary.reviews) return [];

    let list = [...summary.reviews];

    if (activeFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === activeFilter);
    }

    if (sortBy === 'helpful') {
      list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [summary, activeFilter, sortBy]);

  const avgRating = summary?.averageRating || 5.0;
  const totalReviews = summary?.totalCount || 0;
  const recommendPercent = summary?.recommendationPercentage || 100;
  const distribution = summary?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <section id="customer-reviews" className={styles.reviewsSection} aria-label="Customer Reviews">
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>Authentic Patron Feedback</span>
          <span className={styles.eyebrowLine} />
        </div>
        <h2 className={styles.sectionTitle}>Reviews & Parent Endorsements</h2>
        <p className={styles.sectionSubtitle}>
          Real experiences shared by conscious families across India. Every single creation is freshly ground in Bengaluru with zero synthetic additives.
        </p>
      </div>

      {/* Hero Scorecard */}
      <div className={styles.scorecard}>
        {/* Left: Big Rating Number */}
        <div className={styles.ratingMetricBlock}>
          <div className={styles.bigRatingNumber}>{avgRating.toFixed(1)}</div>
          <div className={styles.starsRow} aria-label={`${avgRating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={22}
                className={star <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}
                fill={star <= Math.round(avgRating) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <div className={styles.totalReviewsLabel}>
            Based on {totalReviews} authenticated {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
          <div className={styles.recommendationBadge}>
            <CheckCircle2 size={13} strokeWidth={2.5} />
            <span>{recommendPercent}% of patrons recommend this creation</span>
          </div>
        </div>

        {/* Middle: Rating Breakdown Bars */}
        <div className={styles.breakdownBlock}>
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const count = distribution[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            const isActive = activeFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => setActiveFilter(isActive ? 'all' : stars)}
                className={`${styles.breakdownRow} ${isActive ? styles.breakdownRowActive : ''}`}
                title={`Filter by ${stars} star reviews`}
              >
                <span className={styles.breakdownStarsLabel}>
                  {stars} <Star size={12} fill="currentColor" className={styles.starFilled} />
                </span>
                <div className={styles.breakdownTrack}>
                  <div className={styles.breakdownFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.breakdownCountLabel}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right: CTA to Write Review */}
        <div className={styles.ctaBlock}>
          {deliveredOrder ? (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '3px 8px', marginBottom: '8px', border: '1px solid #bbf7d0' }}>
                <Check size={12} strokeWidth={2.5} />
                <span>Delivered Order #{deliveredOrder.id}</span>
              </div>
              <h3 className={styles.ctaHeadline}>How Was Your Fresh Batch?</h3>
              <p className={styles.ctaSubtext}>
                You ordered this creation. Share your authentic experience to guide other families seeking traditional nutrition.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className={styles.writeReviewBtn}
              >
                <PenLine size={16} />
                <span>Write a Review</span>
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', padding: '3px 8px', marginBottom: '8px' }}>
                <ShieldCheck size={12} />
                <span>Delivered Orders Only</span>
              </div>
              <h3 className={styles.ctaHeadline}>Purchased This Creation?</h3>
              <p className={styles.ctaSubtext}>
                To guarantee 100% authentic feedback, reviews can only be submitted after your order is delivered.
              </p>
              <Link
                href="/account?tab=orders"
                className={styles.writeReviewBtn}
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Package size={15} />
                <span>Review from Order History</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.filterPills}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`${styles.filterPill} ${activeFilter === 'all' ? styles.filterPillActive : ''}`}
          >
            All Reviews ({totalReviews})
          </button>
          {([5, 4, 3] as const).map((stars) => {
            const count = distribution[stars] || 0;
            if (count === 0 && activeFilter !== stars) return null;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setActiveFilter(stars)}
                className={`${styles.filterPill} ${activeFilter === stars ? styles.filterPillActive : ''}`}
              >
                {stars} Stars ({count})
              </button>
            );
          })}
        </div>

        <div className={styles.sortSelectorWrapper}>
          <label htmlFor="review-sort" className={styles.sortLabel}>Sort by:</label>
          <select
            id="review-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="helpful">Most Helpful</option>
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {filteredAndSortedReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h4 className={styles.emptyTitle}>No reviews match your selected filter</h4>
            <p className={styles.emptyText}>
              Try selecting &quot;All Reviews&quot; to read other parent experiences.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={styles.filterPill}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => {
            const hasVoted = votedIds.has(review.id);
            const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <article key={review.id} className={styles.reviewCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardStarsAndBadges}>
                    <div className={styles.starsRow} aria-label={`${review.rating} stars`}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= review.rating ? styles.starFilled : styles.starEmpty}
                          fill={s <= review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>

                    {review.isVerifiedBuyer && (
                      <span className={styles.verifiedBadge}>
                        <ShieldCheck size={12} strokeWidth={2.5} />
                        Verified Patron
                      </span>
                    )}

                    {review.childAge && (
                      <span className={styles.childAgeTag}>
                        Age: {review.childAge}
                      </span>
                    )}
                  </div>

                  <span className={styles.cardDate}>{formattedDate}</span>
                </div>

                <h3 className={styles.reviewTitle}>{review.title}</h3>
                <p className={styles.reviewComment}>{review.comment}</p>

                {/* Verified Customer Feedback Photo / Note Attachment */}
                {review.testimonialImage && (
                  <div className={styles.reviewImageAttachment}>
                    <button
                      type="button"
                      onClick={() => setSelectedModalImage({
                        src: review.testimonialImage!,
                        author: review.authorName,
                      })}
                      className={styles.reviewImageBtn}
                      aria-label={`View verified note from ${review.authorName}`}
                    >
                      <div className={styles.reviewImageThumbFrame}>
                        <img
                          src={review.testimonialImage}
                          alt={`Verified note from ${review.authorName}`}
                          className={styles.reviewImageThumb}
                          loading="lazy"
                        />
                        <div className={styles.reviewImageZoomBadge}>
                          <Maximize2 size={12} />
                          <span>View Verified Note</span>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {review.founderReply && (
                  <div className={styles.founderReplyBlock}>
                    <div className={styles.founderReplyHeader}>
                      <span className={styles.founderReplyBadge}>Good Fills Kitchen Team</span>
                      <span className={styles.founderReplyDate}>
                        {new Date(review.founderReply.repliedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <p className={styles.founderReplyBody}>&ldquo;{review.founderReply.message}&rdquo;</p>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.authorMeta}>
                    <span className={styles.authorName}>{review.authorName}</span>
                    <span className={styles.authorLocation}>• {review.location}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => handleVoteHelpful(review.id)}
                      disabled={hasVoted}
                      className={styles.helpfulBtn}
                      title={hasVoted ? 'You marked this as helpful' : 'Mark as helpful'}
                    >
                      {hasVoted ? (
                        <>
                          <Check size={13} strokeWidth={2.5} />
                          <span>Helpful ({review.helpfulCount})</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp size={13} />
                          <span>Helpful ({review.helpfulCount})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalBackdrop} onClick={() => !isSubmitting && setIsModalOpen(false)}>
            <motion.div
              className={styles.modalDialog}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Modal Header */}
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderLeft}>
                  {deliveredOrder && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', marginBottom: '6px', border: '1px solid #bbf7d0' }}>
                      <Check size={11} strokeWidth={2.5} />
                      <span>Delivered Order #{deliveredOrder.id}</span>
                    </div>
                  )}
                  <h3 className={styles.modalTitle}>{product.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.modalCloseBtn}
                  aria-label="Close review dialog"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmitReview}>
                <div className={styles.modalBody}>
                  {submitSuccess ? (
                    <div className={styles.successMessage}>
                      <Check size={18} strokeWidth={2.5} />
                      <div>
                        <strong>Review Authenticated & Published!</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                          Thank you for sharing your experience with the Good Fills community.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {submitError && (
                        <div className={styles.errorMessage}>{submitError}</div>
                      )}

                      {/* Star Rating Selector */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Overall Rating *</label>
                        <div className={styles.interactiveStarsRow}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const activeVal = hoverRating || formData.rating;
                            const isFilled = star <= activeVal;
                            return (
                              <button
                                key={star}
                                type="button"
                                className={styles.starSelectBtn}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setFormData({ ...formData, rating: star })}
                                aria-label={`Select ${star} stars`}
                              >
                                <Star
                                  size={26}
                                  className={isFilled ? styles.starFilled : styles.starEmpty}
                                  fill={isFilled ? 'currentColor' : 'none'}
                                />
                              </button>
                            );
                          })}
                          <span className={styles.ratingDescriptor}>
                            {RATING_DESCRIPTIONS[hoverRating || formData.rating]}
                          </span>
                        </div>
                      </div>

                      {/* Review Headline */}
                      <div className={styles.formGroup}>
                        <label htmlFor="review-title" className={styles.formLabel}>
                          Review Headline *
                        </label>
                        <input
                          id="review-title"
                          type="text"
                          required
                          placeholder="e.g. Gentle on digestion, noticeable energy and aroma"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className={styles.formInput}
                          maxLength={100}
                        />
                      </div>

                      {/* Detailed Feedback */}
                      <div className={styles.formGroup}>
                        <label htmlFor="review-comment" className={styles.formLabel}>
                          Your Experience & Details *
                        </label>
                        <textarea
                          id="review-comment"
                          required
                          rows={4}
                          placeholder="How did you prepare it? How did your child or family react to the taste and texture?"
                          value={formData.comment}
                          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                          className={styles.formTextarea}
                          maxLength={800}
                        />
                      </div>

                      {/* Two Column: Name & Location */}
                      <div className={styles.formRowTwo}>
                        <div className={styles.formGroup}>
                          <label htmlFor="author-name" className={styles.formLabel}>
                            Your Full Name *
                          </label>
                          <input
                            id="author-name"
                            type="text"
                            required
                            placeholder="e.g. Priya Sharma"
                            value={formData.authorName}
                            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                            className={styles.formInput}
                            maxLength={60}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="author-location" className={styles.formLabel}>
                            City / Location <span className={styles.formLabelOptional}>(Optional)</span>
                          </label>
                          <input
                            id="author-location"
                            type="text"
                            placeholder="e.g. Bengaluru, Karnataka"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className={styles.formInput}
                            maxLength={60}
                          />
                        </div>
                      </div>

                      {/* Child Age or Family note (especially for baby-kids / nutrition) */}
                      <div className={styles.formGroup}>
                        <label htmlFor="child-age" className={styles.formLabel}>
                          Child&apos;s Age or Family Note <span className={styles.formLabelOptional}>(Optional)</span>
                        </label>
                        <input
                          id="child-age"
                          type="text"
                          placeholder="e.g. 8 Months, 2.5 Years, or Whole Family"
                          value={formData.childAge}
                          onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                          className={styles.formInput}
                          maxLength={40}
                        />
                      </div>

                      {/* Assurance Notice */}
                      <div className={styles.modalNotice}>
                        <strong>Our Transparency Promise:</strong> All reviews are submitted directly by verified patrons. We do not edit, incentivize, or filter honest community reviews.
                      </div>
                    </>
                  )}
                </div>

                {!submitSuccess && (
                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={styles.modalCancelBtn}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.modalSubmitBtn}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Publishing...' : 'Submit Review'}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                alt={`Feedback from ${selectedModalImage.author}`}
                className={styles.lightboxImg}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
