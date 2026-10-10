'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Check,
  Truck,
  Clock,
  ShieldCheck,
  Leaf,
  ArrowRight,
  Minus,
  Plus,
  MessageCircle,
  FileText,
  RotateCcw,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductCategory } from '@/types';
import type { ProductReviewSummary } from '@/lib/server-reviews';
import { CATEGORIES, PRODUCTS } from '@/data/products';
import { useCart } from '@/lib/cart-context';
import { calculateDomesticShipping } from '@/lib/shipping';
import { ProductReviewsSection } from './ProductReviewsSection';
import styles from './ProductDetailView.module.css';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

let productCatalogRequest: Promise<Product[] | null> | null = null;

function loadProductCatalog(): Promise<Product[] | null> {
  if (!productCatalogRequest) {
    productCatalogRequest = fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => (Array.isArray(data.products) ? data.products as Product[] : null))
      .catch((err) => {
        console.error('Error refreshing related products:', err);
        return null;
      })
      .finally(() => {
        productCatalogRequest = null;
      });
  }

  return productCatalogRequest;
}

const reviewSummaryRequests = new Map<string, Promise<ProductReviewSummary | null>>();

function loadProductReviewSummary(productId: string): Promise<ProductReviewSummary | null> {
  const key = productId.toLowerCase();
  const inFlight = reviewSummaryRequests.get(key);
  if (inFlight) return inFlight;

  const request = fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
    .then((res) => res.json())
    .then((data) => (data.success && data.summary ? data.summary as ProductReviewSummary : null))
    .catch((err) => {
      console.error('Error fetching review summary:', err);
      return null;
    })
    .finally(() => {
      reviewSummaryRequests.delete(key);
    });

  reviewSummaryRequests.set(key, request);
  return request;
}

interface ProductDetailViewProps {
  product: Product;
  allProducts?: Product[];
}

type TabType = 'ingredients' | 'preparation' | 'storage' | 'shipping';

export function ProductDetailView({ product, allProducts }: ProductDetailViewProps) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');
  const [catalogList, setCatalogList] = useState<Product[]>(allProducts || PRODUCTS);
  const [reviewSummaryState, setReviewSummary] = useState<{
    productId: string;
    summary: ProductReviewSummary;
  } | null>(null);
  const reviewSummary = reviewSummaryState?.productId === product.id ? reviewSummaryState.summary : null;


  useEffect(() => {
    loadProductCatalog().then((products) => {
      if (products && products.length > 0) setCatalogList(products);
    });

    loadProductReviewSummary(product.id).then((summary) => {
      if (summary) setReviewSummary({ productId: product.id, summary });
    });
  }, [product.id]);

  const categoryInfo = CATEGORIES.find((c) => c.id === product.category);
  const shippingInfo = calculateDomesticShipping(product.productWeightGrams * quantity);

  // Related products from the same category or general catalog (excluding current product)
  const finalRelated = useMemo(() => {
    const sameCat = catalogList.filter(
      (p) => p.id !== product.id && p.category === product.category
    ).slice(0, 3);

    if (sameCat.length >= 3) return sameCat;

    return [
      ...sameCat,
      ...catalogList.filter((p) => p.id !== product.id && !sameCat.some((sc) => sc.id === p.id)),
    ].slice(0, 3);
  }, [catalogList, product.id, product.category]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const getPreparationGuidance = (category: ProductCategory) => {
    switch (category) {
      case 'baby-kids':
        return 'Mix 2 tablespoons of mix with 1 cup of cold water or milk until completely lump-free. Place in a heavy-bottomed vessel over medium-low heat. Stir continuously for 5–7 minutes until thick, creamy, and aromatic. Allow to cool lukewarm before feeding.';
      case 'skin-bath':
        return 'Take 1–2 tablespoons of powder in a small bowl. Blend with raw milk, rose water, or warm water into a smooth paste. Gently massage over damp skin in circular motions. Rinse thoroughly with warm water. 100% soap-free and non-stripping.';
      case 'pantry-beverages':
        return 'For Filter Coffee: Brew in a traditional brass filter with 2 heaping tablespoons. Allow decoction to drip slowly for 15 minutes before frothing with hot milk. For Mountain Honey: Enjoy 1 teaspoon raw daily or swirl into lukewarm water. Avoid boiling temperatures.';
      case 'nutrition-wellness':
      default:
        return 'Blend 2 tablespoons with lukewarm water, milk, or your daily beverage. Stir vigorously or shake in a bottle until smoothly incorporated. Crafted with sprouted grains and cold-milled seeds for instant bioavailability.';
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        {/* Breadcrumb Trail */}
        <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <Link href="/shop" className={styles.breadcrumbLink}>
            Shop
          </Link>
          {categoryInfo && (
            <>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href={`/shop/${categoryInfo.id}`} className={styles.breadcrumbLink}>
                {categoryInfo.name}
              </Link>
            </>
          )}
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        {/* Above-the-Fold Two-Column Grid */}
        <div className={styles.productHeroGrid}>
          {/* Left Column: Product Gallery */}
          <div className={styles.galleryColumn}>
            <div className={styles.mainImageFrame}>
              <img
                src={product.images.primary}
                alt={product.name}
                className={styles.mainImage}
              />

              {/* Authenticity Made-to-Order Seal */}
              <div className={styles.sealBadge}>
                <span className={styles.sealDot} />
                <span>Made to Order in Bengaluru</span>
              </div>

              {/* Pack Size Pill */}
              <div className={styles.packSizeTag}>{product.packSize}</div>
            </div>

            {/* Gallery Pillars Ribbon */}
            <div className={styles.galleryPillars}>
              <div className={styles.galleryPillarItem}>
                <span className={styles.galleryPillarTitle}>100% Traditional</span>
                <span className={styles.galleryPillarSub}>Zero synthetics</span>
              </div>
              <div className={styles.galleryPillarItem}>
                <span className={styles.galleryPillarTitle}>6-Month Freshness</span>
                <span className={styles.galleryPillarSub}>Airtight sealed</span>
              </div>
              <div className={styles.galleryPillarItem}>
                <span className={styles.galleryPillarTitle}>Tracked Delivery</span>
                <span className={styles.galleryPillarSub}>2–4 business days</span>
              </div>
            </div>
          </div>

          {/* Right Column: Commerce & Product Info */}
          <div className={styles.infoColumn}>
            {/* Category Tag Row */}
            <div className={styles.categoryTagRow}>
              <span className={styles.categoryPill}>
                {categoryInfo?.name || product.category.replace('-', ' & ')}
              </span>
              <span className={styles.tagDivider}>•</span>
              <span className={styles.provenanceBadge}>BENGALURU KITCHEN</span>
              {product.availability === 'sold-out' && (
                <>
                  <span className={styles.tagDivider}>•</span>
                  <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Sold Out
                  </span>
                </>
              )}
              {product.availability === 'temporarily-unavailable' && (
                <>
                  <span className={styles.tagDivider}>•</span>
                  <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Temporarily Unavailable
                  </span>
                </>
              )}
              {product.availability === 'coming-soon' && (
                <>
                  <span className={styles.tagDivider}>•</span>
                  <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Coming Soon
                  </span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h1 className={styles.productTitle}>{product.name}</h1>

            {/* Quick Star Rating Jump Snippet */}
            <a href="#customer-reviews" className={styles.ratingSnippet} title="Jump to Authenticated Reviews">
              <div className={styles.ratingStarsSnippet}>
                <Star size={14} className={styles.starFilled} fill="currentColor" />
                <span className={styles.ratingScore}>
                  {reviewSummary ? reviewSummary.averageRating.toFixed(1) : '4.9'}
                </span>
              </div>
              <span className={styles.ratingCountSnippet}>
                ({reviewSummary ? reviewSummary.totalCount : 'Verified'} Reviews)
              </span>
              <span className={styles.ratingSepSnippet}>•</span>
              <span className={styles.ratingRecommendSnippet}>
                {reviewSummary ? `${reviewSummary.recommendationPercentage}% Recommend` : '100% Recommend'}
              </span>
            </a>

            {/* Price & Weight Block */}
            <div className={styles.priceSection}>
              <div className={styles.priceDisplay}>
                <span className={styles.priceCurrency}>₹</span>
                <span className={styles.priceAmount}>{product.price}</span>
              </div>
              <span className={styles.packWeightNote}>per {product.packSize} pack</span>
              <span className={styles.taxNotice}>(inclusive of all taxes)</span>
            </div>

            {/* Short Narrative */}
            <p className={styles.shortDesc}>{product.shortDescription}</p>

            {/* Catalog-Verified Highlights */}
            {product.benefits && product.benefits.length > 0 && (
              <div className={styles.benefitPillsRow}>
                {product.benefits.slice(0, 3).map((benefit, bIdx) => (
                  <span key={bIdx} className={styles.benefitPill}>
                    <span className={styles.benefitDot} />
                    <span>{benefit}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Artisanal Assurance & Logistics Deck - Strictly Verified with product_info.md */}
            <div className={styles.assuranceDeck}>
              {/* Row 1: Made to Order & Traditional Preparation */}
              <div className={styles.assuranceRow}>
                <div className={styles.assuranceIconBox}>
                  <Clock size={18} strokeWidth={2} />
                </div>
                <div className={styles.assuranceBody}>
                  <div className={styles.assuranceHeader}>
                    <h4 className={styles.assuranceTitle}>Freshly Made to Order</h4>
                    <span className={styles.assuranceBadgeHighlight}>Zero Bulk Storage</span>
                  </div>
                  <p className={styles.assuranceDesc}>
                    Handcrafted in small batches only after order confirmation. Prepared using traditional washing, soaking, sun-drying &amp; sprouting—never mass-produced or stored in warehouses.
                  </p>
                </div>
              </div>

              <div className={styles.assuranceDivider} />

              {/* Row 2: DTDC Express Delivery */}
              <div className={styles.assuranceRow}>
                <div className={styles.assuranceIconBox}>
                  <Truck size={18} strokeWidth={2} />
                </div>
                <div className={styles.assuranceBody}>
                  <div className={styles.assuranceHeader}>
                    <h4 className={styles.assuranceTitle}>Fast &amp; Tracked Doorstep Delivery</h4>
                    <span className={styles.assuranceBadge}>
                      ₹{shippingInfo.shippingCost} · 2–4 Business Days
                    </span>
                  </div>
                  <p className={styles.assuranceDesc}>
                    Pan-India express courier calculated strictly by net product weight ({product.packSize} pack). Live consignment tracking SMS dispatched the moment your package is sealed.
                  </p>
                </div>
              </div>

              <div className={styles.assuranceDivider} />

              {/* Row 3: Traditional Hygiene & FSSAI Standards */}
              <div className={styles.assuranceRow}>
                <div className={styles.assuranceIconBox}>
                  <ShieldCheck size={18} strokeWidth={2} />
                </div>
                <div className={styles.assuranceBody}>
                  <div className={styles.assuranceHeader}>
                    <h4 className={styles.assuranceTitle}>Traditional Purity &amp; Food Safety</h4>
                    <span className={styles.assuranceBadge}>100% Homemade Atelier</span>
                  </div>
                  <p className={styles.assuranceDesc}>
                    Prepared in our Bengaluru home kitchen adhering strictly to certified food hygiene and FSSAI standards. Zero harsh chemicals, artificial fillers, or preservatives. Sealed in food-grade barrier pouches.
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Add to Bag CTA */}
            <div className={styles.purchaseActions}>
              <div className={styles.quantityStepper}>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || (product.availability && product.availability !== 'available')}
                  className={styles.stepperBtn}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className={styles.quantityCount}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 20 || (product.availability && product.availability !== 'available')}
                  className={styles.stepperBtn}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              {product.availability === 'sold-out' ? (
                <button
                  type="button"
                  disabled
                  className={styles.addToBagBtn}
                  style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                >
                  <span>Sold Out — Batch Fully Allocated</span>
                </button>
              ) : product.availability === 'coming-soon' ? (
                <button
                  type="button"
                  disabled
                  className={styles.addToBagBtn}
                  style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                >
                  <span>Coming Soon — Milling Fresh Soon</span>
                </button>
              ) : product.availability === 'temporarily-unavailable' ? (
                <button
                  type="button"
                  disabled
                  className={styles.addToBagBtn}
                  style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                >
                  <span>Temporarily Unavailable</span>
                </button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  className={`${styles.addToBagBtn} ${isAdded ? styles.isAdded : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} strokeWidth={2} />
                      <span>Add to Bag • ₹{product.price * quantity}</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* WhatsApp & Call Atelier Consultation Row */}
            <div className={styles.whatsappRow}>
              <div className={styles.whatsappLeft}>
                <MessageCircle size={17} strokeWidth={2} className={styles.whatsappIcon} />
                <span className={styles.whatsappText}>
                  Need bulk gifting or international delivery? Call{' '}
                  <a href="tel:+919742068899" style={{ color: 'var(--accent-terracotta)', fontWeight: 600, textDecoration: 'underline' }}>
                    +91 97420 68899
                  </a>{' '}
                  or chat with our kitchen.
                </span>
              </div>
              <a
                href={`https://wa.me/919742068899?text=Hello%20Good%20Fills!%20I%20have%20a%20question%20about%20${encodeURIComponent(
                  product.name
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappLink}
              >
                <span>WhatsApp Us</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Below-the-Fold Specifications & Accordion Tabs */}
        <section className={styles.specificationsSection}>
          <div className={styles.tabsHeader}>
            <button
              type="button"
              onClick={() => setActiveTab('ingredients')}
              className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.isActiveTab : ''}`}
            >
              <span>Ingredients &amp; Sourcing</span>
              {activeTab === 'ingredients' && <span className={styles.activeTabLine} />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preparation')}
              className={`${styles.tabButton} ${activeTab === 'preparation' ? styles.isActiveTab : ''}`}
            >
              <span>Preparation &amp; Usage</span>
              {activeTab === 'preparation' && <span className={styles.activeTabLine} />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('storage')}
              className={`${styles.tabButton} ${activeTab === 'storage' ? styles.isActiveTab : ''}`}
            >
              <span>Storage &amp; 6-Month Shelf Life</span>
              {activeTab === 'storage' && <span className={styles.activeTabLine} />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`${styles.tabButton} ${activeTab === 'shipping' ? styles.isActiveTab : ''}`}
            >
              <span>Shipping &amp; Returns</span>
              {activeTab === 'shipping' && <span className={styles.activeTabLine} />}
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className={styles.tabContentPanel}>
            <AnimatePresence mode="wait">
              {activeTab === 'ingredients' && (
                <motion.div
                  key="ingredients"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: luxuryEase }}
                >
                  <h3 className={styles.tabLead}>Whole, unadulterated traditional ingredients.</h3>
                  <p className={styles.tabBodyText}>
                    {product.description}
                  </p>

                  {product.ingredients && product.ingredients.length > 0 ? (
                    <div>
                      <div className={styles.ingredientsGrid}>
                        {product.ingredients.map((ing, idx) => (
                          <span key={idx} className={styles.ingredientChip}>
                            <Leaf size={12} strokeWidth={2} style={{ color: 'var(--accent-terracotta)' }} />
                            <span>{ing}</span>
                          </span>
                        ))}
                      </div>

                      {product.ingredientsNote && (
                        <div className={styles.contentNoticeBox}>
                          <strong>Atelier Verification Note:</strong> {product.ingredientsNote}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.contentNoticeBox}>
                      <strong>[CONTENT REQUIRED FROM GOOD FILLS]</strong> Detailed grain breakdown and recipe ratios are currently pending final verification from the kitchen. All ingredients are guaranteed 100% natural, vegetarian, and prepared without artificial preservatives.
                    </div>
                  )}

                  {product.benefits && product.benefits.length > 0 && (
                    <div className={styles.tabBenefitsSection}>
                      <h4 className={styles.tabBenefitsHeading}>Catalog-Stated Attributes &amp; Benefits</h4>
                      <ul className={styles.tabBenefitsList}>
                        {product.benefits.map((b, bIdx) => (
                          <li key={bIdx} className={styles.tabBenefitItem}>
                            <Check size={14} className={styles.tabBenefitCheck} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                      <p className={styles.tabBenefitsDisclaimer}>
                        *Source: Extracted directly from GoodFills 15-Page Product Catalog.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'preparation' && (
                <motion.div
                  key="preparation"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: luxuryEase }}
                >
                  <h3 className={styles.tabLead}>Traditional culinary wisdom in your kitchen.</h3>
                  <p className={styles.tabBodyText}>
                    {getPreparationGuidance(product.category)}
                  </p>
                  <p className={styles.tabBodyText}>
                    <strong>Atelier Note:</strong> Because our preparations contain zero maltodextrin, anti-caking agents, or synthetic stabilizers, natural settling or oil release may occur. Stir well before each use.
                  </p>
                </motion.div>
              )}

              {activeTab === 'storage' && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: luxuryEase }}
                >
                  <h3 className={styles.tabLead}>Guaranteed 6-month natural shelf life.</h3>
                  <p className={styles.tabBodyText}>
                    {product.storageInstructions}
                  </p>
                  <p className={styles.tabBodyText}>
                    Every batch is sealed immediately following natural cooling into airtight, food-grade barrier pouches that block ambient moisture, UV light, and oxidation. Always use a dry spoon and close the seal tightly after opening.
                  </p>
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: luxuryEase }}
                >
                  <h3 className={styles.tabLead}>Pan-India Express Delivery</h3>
                  <p className={styles.tabBodyText}>
                    Shipping is calculated strictly by <strong>total product weight</strong> (excluding packaging materials), keeping courier costs transparent and fair across India.
                  </p>

                  <table className={styles.shippingTable}>
                    <thead>
                      <tr>
                        <th>Product Weight</th>
                        <th>Tracked Express Courier</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Up to 500g</td>
                        <td>₹100</td>
                      </tr>
                      <tr>
                        <td>501g – 1,000g (1kg)</td>
                        <td>₹200</td>
                      </tr>
                      <tr>
                        <td>1.01kg – 2,000g (2kg)</td>
                        <td>₹400</td>
                      </tr>
                      <tr>
                        <td>2.01kg – 3,000g (3kg)</td>
                        <td>₹600</td>
                      </tr>
                      <tr>
                        <td>Each additional 1kg</td>
                        <td>+₹200</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className={styles.tabBodyText} style={{ marginTop: 'var(--space-4)' }}>
                    <strong>Damaged in Transit Policy:</strong> In the rare event a parcel arrives damaged during courier handling, please contact our atelier on WhatsApp (+91 97420 68899) with your Order ID and photos within 24 hours. We resolve transit damages promptly with an immediate replacement or full assistance.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Authenticated Reviews & Parent Feedback */}
        <ProductReviewsSection
          key={product.id}
          product={product}
          initialSummary={reviewSummary}
        />

        {/* Complementary Creations (Related Products) */}
        {finalRelated.length > 0 && (
          <section className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
              <div>
                <span className="eyebrow">Complementary Creations</span>
                <h2 className={styles.relatedTitle}>You May Also Appreciate</h2>
              </div>
              <Link href="/shop" className="featured-view-all group">
                <span>View Full Catalog</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className={styles.relatedGrid}>
              {finalRelated.map((rel: Product) => (
                <div key={rel.id} className="product-card group">
                  <Link href={`/product/${rel.slug}`} className="product-card-link">
                    <div className="product-image-wrap">
                      <img src={rel.images.primary} alt={rel.name} className="product-img" loading="lazy" />
                      <div className="product-badge-size">{rel.packSize}</div>
                      <div className="product-badge-made">Made to Order</div>
                    </div>

                    <div className="product-info">
                      <span className="product-category-label">
                        {rel.category.replace('-', ' & ')}
                      </span>
                      <h3 className="product-name">{rel.name}</h3>

                      {/* Top Layer Pricing (Flipkart Style) */}
                      <div className="product-price-block">
                        <div className="product-price-wrap">
                          <span className="product-currency">₹</span>
                          <span className="product-amount">{rel.price}</span>
                        </div>
                        <span className="product-weight-sub">per {rel.packSize}</span>
                      </div>

                      <p className="product-desc">{rel.shortDescription}</p>

                      <div className="product-card-actions">
                        <span className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                          View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* App-like Mobile Sticky "Add to Bag" Bottom Bar — Permanently pinned on mobile (Flipkart style) */}
      <div className={styles.mobileStickyBar}>
            <div className={styles.stickyBarInner}>
              <div className={styles.stickyProductInfo}>
                <div className={styles.stickyThumbWrap}>
                  <img
                    src={product.images.primary}
                    alt={product.name}
                    className={styles.stickyThumb}
                  />
                </div>
                <div className={styles.stickyMeta}>
                  <div className={styles.stickyTitle}>{product.name}</div>
                  <div className={styles.stickyPriceRow}>
                    <span className={styles.stickyPrice}>₹{product.price * quantity}</span>
                    <span className={styles.stickyPack}>({product.packSize})</span>
                  </div>
                </div>
              </div>

              <div className={styles.stickyActions}>
                {product.availability === 'sold-out' ? (
                  <button
                    type="button"
                    disabled
                    className={styles.stickyAddBtn}
                    style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                  >
                    <span>Sold Out</span>
                  </button>
                ) : product.availability === 'coming-soon' ? (
                  <button
                    type="button"
                    disabled
                    className={styles.stickyAddBtn}
                    style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                  >
                    <span>Coming Soon</span>
                  </button>
                ) : product.availability === 'temporarily-unavailable' ? (
                  <button
                    type="button"
                    disabled
                    className={styles.stickyAddBtn}
                    style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                  >
                    <span>Unavailable</span>
                  </button>
                ) : (
                  <div className={styles.stickyButtonGroup}>
                    <div className={styles.stickyStepper}>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className={styles.stickyStepperBtn}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className={styles.stickyQuantityCount}>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 20}
                        className={styles.stickyStepperBtn}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleAddToCart}
                      className={`${styles.stickyAddBtn} ${isAdded ? styles.isAdded : ''}`}
                      whileTap={{ scale: 0.94 }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} strokeWidth={2.5} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} strokeWidth={2.2} />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
}
