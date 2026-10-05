'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  CornerDownRight,
  Send,
  ThumbsUp,
  Package,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Review } from '@/lib/server-reviews';
import styles from './AdminReviewsModerationView.module.css';

interface AdminReviewsModerationViewProps {
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  onNavigateToOrder?: (orderId: string) => void;
}

interface ReviewStats {
  totalCount: number;
  averageRating: number;
  recommendationPercentage: number;
  featuredCount: number;
  verifiedCount: number;
  distribution: Record<number, number>;
}

export function AdminReviewsModerationView({ showToast, onNavigateToOrder }: AdminReviewsModerationViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [ratingFilter, setRatingFilter] = useState<'all' | number>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'verified' | 'featured' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Inline reply editor state
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch reviews from admin API
  const loadReviews = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      } else {
        showToast(data.error || 'Failed to load customer reviews.', 'error');
      }
    } catch {
      showToast('Could not connect to reviews server.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadReviews(true);
  }, []); // Run on initial mount only

  // Unique products present in the reviews list for filter dropdown
  const uniqueProducts = useMemo(() => {
    const map = new Map<string, string>();
    reviews.forEach((r) => {
      if (r.productId && r.productName) {
        map.set(r.productId, r.productName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Rating filter
    if (ratingFilter !== 'all') {
      if (ratingFilter === 2) {
        // Group 1 and 2 stars
        list = list.filter((r) => Math.round(r.rating) <= 2);
      } else {
        list = list.filter((r) => Math.round(r.rating) === ratingFilter);
      }
    }

    // Product filter
    if (productFilter !== 'all') {
      list = list.filter(
        (r) => r.productId.toLowerCase() === productFilter.toLowerCase()
      );
    }

    // Type filter
    if (typeFilter === 'verified') {
      list = list.filter((r) => r.isVerifiedBuyer);
    } else if (typeFilter === 'featured') {
      list = list.filter((r) => r.isFeatured);
    } else if (typeFilter === 'hidden') {
      list = list.filter((r) => r.status === 'hidden');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        return (
          r.authorName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.orderId && r.orderId.toLowerCase().includes(q)) ||
          r.location.toLowerCase().includes(q)
        );
      });
    }

    // Sort: newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list;
  }, [reviews, ratingFilter, productFilter, typeFilter, searchQuery]);

  // Action: Toggle Featured Testimonial
  const handleToggleFeature = async (reviewId: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-feature', reviewId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, isFeatured: data.isFeatured } : r))
        );
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            featuredCount: data.isFeatured
              ? prev.featuredCount + 1
              : Math.max(0, prev.featuredCount - 1),
          };
        });
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'Failed to update testimonial status.', 'error');
      }
    } catch {
      showToast('Error updating testimonial status.', 'error');
    }
  };

  // Action: Toggle Review Visibility (Hide / Publish)
  const handleToggleVisibility = async (reviewId: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-visibility', reviewId }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: data.review.status } : r))
        );
        showToast(data.message, 'info');
      } else {
        showToast(data.error || 'Failed to change review visibility.', 'error');
      }
    } catch {
      showToast('Error updating review visibility.', 'error');
    }
  };

  // Action: Submit Founder / Kitchen Reply
  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      showToast('Please type a reply message first.', 'info');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', reviewId, message: replyText.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.review) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, founderReply: data.review.founderReply } : r))
        );
        showToast('Founder reply posted successfully.', 'success');
        setActiveReplyReviewId(null);
        setReplyText('');
      } else {
        showToast(data.error || 'Failed to save reply.', 'error');
      }
    } catch {
      showToast('Error saving reply.', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Action: Delete Review
  const handleDeleteReview = async (review: Review) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete this review by "${review.authorName}" for ${review.productName}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', reviewId: review.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
        showToast('Review permanently deleted.', 'info');
      } else {
        showToast(data.error || 'Failed to delete review.', 'error');
      }
    } catch {
      showToast('Error deleting review.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <header className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>Good Fills Community Voice</span>
            <span className={styles.countBadge}>
              <CheckCircle2 size={12} />
              <span>{reviews.length} Total Reviews</span>
            </span>
          </div>
          <h1 className={styles.title}>Customer Reviews &amp; Testimonials Console</h1>
          <p className={styles.subtitle}>
            Read and moderate all customer reviews, highlight top testimonials for the store, post founder replies, and verify delivered order references.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => loadReviews(true)}
            disabled={isRefreshing}
            className={styles.refreshBtn}
            title="Refresh customer reviews list"
          >
            <RefreshCw size={14} className={isRefreshing ? styles.spin : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Reviews'}</span>
          </button>
        </div>
      </header>

      {/* 2. Key Metrics Cards */}
      <section className={styles.metricsGrid} aria-label="Review Summary Metrics">
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Reviews</span>
            <MessageSquare size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{stats?.totalCount || reviews.length}</div>
          <div className={styles.metricSubtext}>Published customer reviews</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Average Rating</span>
            <Star size={16} className={styles.metricIcon} fill="currentColor" color="#d97706" />
          </div>
          <div className={styles.metricValue}>
            {stats?.averageRating ? `${stats.averageRating}★` : '5.0★'}
          </div>
          <div className={styles.metricSubtext}>Across all creations</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Verified Buyer Rate</span>
            <ShieldCheck size={16} className={styles.metricIcon} color="#166534" />
          </div>
          <div className={styles.metricValue}>
            {stats ? `${stats.verifiedCount} orders` : '100%'}
          </div>
          <div className={styles.metricSubtext}>Reviews from delivered orders</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Featured Testimonials</span>
            <Sparkles size={16} className={styles.metricIcon} color="#d97706" />
          </div>
          <div className={styles.metricValue}>{stats?.featuredCount || 0}</div>
          <div className={styles.metricSubtext}>Highlighted as top recommendations</div>
        </div>
      </section>

      {/* 3. Toolbar & Filters */}
      <div className={styles.toolbar}>
        <div className={styles.filtersGroup}>
          {/* Rating Filter */}
          <select
            className={styles.filterSelect}
            value={ratingFilter}
            onChange={(e) => {
              const val = e.target.value;
              setRatingFilter(val === 'all' ? 'all' : Number(val));
            }}
            aria-label="Filter by star rating"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">1 &amp; 2 Stars</option>
          </select>

          {/* Product Filter */}
          <select
            className={styles.filterSelect}
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            aria-label="Filter by creation"
          >
            <option value="all">All Creations</option>
            {uniqueProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Review Type Filter */}
          <select
            className={styles.filterSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            aria-label="Filter by review type"
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Buyers Only</option>
            <option value="featured">Featured Testimonials Only</option>
            <option value="hidden">Hidden Reviews Only</option>
          </select>
        </div>

        {/* Search Input */}
        <div className={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search customer, order #, or feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 4. Reviews List */}
      <section aria-label="Customer Reviews List">
        <div className={styles.sectionBlockHeader}>
          <div>
            <h2 className={styles.sectionBlockTitle}>
              Customer Feedback ({filteredReviews.length} Reviews)
            </h2>
            <span className={styles.sectionBlockCount}>
              Showing reviews matching current filters
            </span>
          </div>
        </div>

        {isLoading && reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: 'var(--accent-terracotta)' }} />
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading customer reviews...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>
              No Reviews Found
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No customer reviews match the selected filter or search term.
            </p>
          </div>
        ) : (
          <div className={styles.reviewsStack}>
            {filteredReviews.map((review) => {
              const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const isReplyOpen = activeReplyReviewId === review.id;
              const isHidden = review.status === 'hidden';

              return (
                <article
                  key={review.id}
                  className={`${styles.reviewCard} ${review.isFeatured ? styles.reviewCardFeatured : ''} ${isHidden ? styles.reviewCardHidden : ''}`}
                >
                  {/* Top Row: Author, Order Tag, Rating & Badges */}
                  <div className={styles.cardHeaderRow}>
                    <div className={styles.authorBlock}>
                      <div className={styles.authorAvatar}>
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.authorNameMeta}>
                        <div className={styles.authorNameLine}>
                          <span className={styles.authorName}>{review.authorName}</span>
                          {review.isVerifiedBuyer && (
                            <span className={styles.verifiedTag}>
                              <ShieldCheck size={11} strokeWidth={2.5} />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                          {review.orderId && (
                            onNavigateToOrder ? (
                              <button
                                type="button"
                                onClick={() => onNavigateToOrder(review.orderId!)}
                                className={styles.orderIdPill}
                                title="Click to view order in Dispatch Manifest"
                                style={{ background: 'none', border: '1px solid var(--border-medium)', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                <Package size={11} />
                                <span>Order #{review.orderId} ↗</span>
                              </button>
                            ) : (
                              <span className={styles.orderIdPill} title="Verified Order Number">
                                <Package size={11} />
                                <span>Order #{review.orderId}</span>
                              </span>
                            )
                          )}
                        </div>
                        <span className={styles.authorLocation}>
                          {review.location} • {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className={styles.ratingAndStatusRow}>
                      <div className={styles.starsRow} aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= review.rating ? 'currentColor' : 'none'}
                            color={star <= review.rating ? '#d97706' : 'var(--border-medium)'}
                          />
                        ))}
                      </div>

                      {review.isFeatured && (
                        <span className={styles.featuredBadge}>
                          <Sparkles size={11} />
                          <span>Featured Testimonial</span>
                        </span>
                      )}

                      {isHidden && (
                        <span className={styles.hiddenBadge}>
                          <EyeOff size={11} />
                          <span>Hidden from Store</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Reference */}
                  <div className={styles.productRefLine}>
                    <span>Reviewed Product:</span>
                    <span className={styles.productNameHighlight}>{review.productName}</span>
                  </div>

                  {/* Title & Comment */}
                  <h3 className={styles.reviewTitle}>&ldquo;{review.title}&rdquo;</h3>
                  <p className={styles.reviewComment}>{review.comment}</p>

                  {/* Child / Family Tag */}
                  {review.childAge && (
                    <div>
                      <span className={styles.childAgeTag}>
                        Prepared for: <strong>{review.childAge}</strong>
                      </span>
                    </div>
                  )}

                  {/* Existing Founder Response */}
                  {review.founderReply && (
                    <div className={styles.founderReplyBox}>
                      <div className={styles.founderReplyHeader}>
                        <span>Good Fills Kitchen Response</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(review.founderReply.repliedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className={styles.founderReplyText}>
                        &ldquo;{review.founderReply.message}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Inline Reply Editor */}
                  {isReplyOpen && (
                    <div className={styles.replyEditorBox}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Write Founder / Kitchen Response:
                      </label>
                      <textarea
                        className={styles.replyTextarea}
                        rows={3}
                        placeholder={`Reply directly to ${review.authorName} regarding their feedback...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className={styles.replyActionsRow}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => {
                            setActiveReplyReviewId(null);
                            setReplyText('');
                          }}
                          disabled={isSubmittingReply}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          style={{ backgroundColor: 'var(--accent-terracotta)', color: '#FFFFFF', borderColor: 'var(--accent-terracotta)' }}
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={isSubmittingReply}
                        >
                          <Send size={12} />
                          <span>{isSubmittingReply ? 'Posting...' : 'Post Reply'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Strip */}
                  <div className={styles.cardActionsStrip}>
                    <div className={styles.metaInfoLeft}>
                      <span>{review.helpfulCount || 0} patrons found this helpful</span>
                    </div>

                    <div className={styles.actionBtnsGroup}>
                      {/* Toggle Featured */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFeature(review.id);
                        }}
                        className={`${styles.actionBtn} ${review.isFeatured ? styles.actionBtnFeaturedActive : ''}`}
                        title={review.isFeatured ? 'Remove from top testimonials' : 'Highlight as top testimonial'}
                      >
                        <Sparkles size={13} />
                        <span>{review.isFeatured ? 'Featured ✓' : 'Feature Testimonial'}</span>
                      </button>

                      {/* Reply Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isReplyOpen) {
                            setActiveReplyReviewId(null);
                            setReplyText('');
                          } else {
                            setActiveReplyReviewId(review.id);
                            setReplyText(review.founderReply?.message || '');
                          }
                        }}
                        className={styles.actionBtn}
                        title="Add or edit founder response"
                      >
                        <CornerDownRight size={13} />
                        <span>{review.founderReply ? 'Edit Reply' : 'Reply'}</span>
                      </button>

                      {/* Hide / Unhide */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleVisibility(review.id);
                        }}
                        className={styles.actionBtn}
                        title={isHidden ? 'Publish this review' : 'Hide this review from customer view'}
                      >
                        {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{isHidden ? 'Publish' : 'Hide'}</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteReview(review);
                        }}
                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                        title="Permanently delete review"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
