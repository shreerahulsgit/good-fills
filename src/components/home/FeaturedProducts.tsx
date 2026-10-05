'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Check, Minus, Plus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/lib/cart-context';
import { Product } from '@/types';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

// Default fallback signature slugs
const DEFAULT_FEATURED_SLUGS = [
  'kids-nutrition-powder',
  'ragi-porridge-mix',
  'ubtan-face-pack',
];

interface FeaturedProductsProps {
  initialProducts?: Product[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: luxuryEase,
    },
  },
};

export function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
  const { addItem, updateQuantity, items } = useCart();
  const [productsList, setProductsList] = useState<Product[]>(initialProducts || PRODUCTS);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProductsList(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    const refreshProducts = () => {
      fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setProductsList(data.products);
          }
        })
        .catch((err) => console.error('Error fetching featured products:', err));
    };

    refreshProducts();

    // Auto-refresh when switching back to tab from admin console
    window.addEventListener('focus', refreshProducts);
    return () => window.removeEventListener('focus', refreshProducts);
  }, []);

  const featuredProducts = useMemo(() => {
    // Show strictly creations that are explicitly marked as featured by admin
    // Never allow test products to leak onto homepage
    return productsList.filter(
      (p) => Boolean(p.featured) && p.id !== 'prod-live-test' && p.price > 1
    );
  }, [productsList]);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  // If admin has unpinned all products from homepage, hide section cleanly
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="featured-section">
      <div className="container">
        {/* Section Header with Sequential Stagger */}
        <div className="featured-header">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase }}
          >
            <span className="eyebrow">Signature Creations</span>
            <h2 className="featured-title">Our Most Cherished Home Recipes.</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.12 }}
            className="featured-header-action"
          >
            <Link href="/shop" className="featured-view-all group">
              <span>View All {productsList.length} Creations</span>
              <ArrowRight size={15} className="featured-arrow" />
            </Link>
          </motion.div>
        </div>

        {/* 3-Product Grid with Sequential Stagger */}
        <motion.div
          className="featured-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {featuredProducts.map((product) => {
            const isAdded = addedId === product.id;
            const inCartItem = items.find((i) => i.product.id === product.id);
            const inCartQty = inCartItem?.quantity || 0;
            return (
              <motion.div
                key={product.id}
                className="product-card group"
                variants={cardVariants}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              >
                <Link href={`/product/${product.slug}`} className="product-card-link">
                  {/* Image Container with Subtle Hover Zoom */}
                  <div className="product-image-wrap">
                    <img
                      src={product.images?.primary || '/logo.png'}
                      alt={product.name}
                      className="product-img"
                    />

                    {/* Pack Size Pill */}
                    <div className="product-badge-size">
                      {product.packSize}
                    </div>

                    {/* Freshly Made / Stock Badge */}
                    {product.availability === 'sold-out' ? (
                      <div className="product-badge-made" style={{ backgroundColor: 'rgba(220, 38, 38, 0.95)', color: '#FFFFFF' }}>
                        Sold Out
                      </div>
                    ) : product.availability === 'temporarily-unavailable' ? (
                      <div className="product-badge-made" style={{ backgroundColor: 'rgba(217, 119, 6, 0.95)', color: '#FFFFFF' }}>
                        Temp. Unavailable
                      </div>
                    ) : product.availability === 'coming-soon' ? (
                      <div className="product-badge-made" style={{ backgroundColor: 'rgba(37, 99, 235, 0.95)', color: '#FFFFFF' }}>
                        Coming Soon
                      </div>
                    ) : (
                      <div className="product-badge-made">
                        Made to Order
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="product-info">
                    <div className="product-meta-row">
                      <span className="product-category-label">
                        {product.category.replace('-', ' & ')}
                      </span>
                      <span className="product-rating-pill" title="Verified Customer Rating">
                        <Star size={10} fill="currentColor" className="star-icon-pill" />
                        <span>4.9</span>
                      </span>
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.shortDescription}</p>

                    {/* Price & Action Row */}
                    <div className="product-price-row">
                      <div className="product-price-wrap">
                        <span className="product-currency">₹</span>
                        <span className="product-amount">{product.price}</span>
                      </div>

                      {/* Tactile Quick-Add Button (Stock aware) */}
                      {product.availability && product.availability !== 'available' ? (
                        <button
                          type="button"
                          disabled
                          className="product-add-btn"
                          style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <span>
                            {product.availability === 'sold-out'
                              ? 'Sold Out'
                              : product.availability === 'coming-soon'
                              ? 'Coming Soon'
                              : 'Unavailable'}
                          </span>
                        </button>
                      ) : inCartQty > 0 ? (
                        <div
                          className="product-inline-stepper"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(product.id, inCartQty - 1);
                            }}
                            className="stepper-action-btn"
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="stepper-count-label">{inCartQty} in bag</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(product.id, inCartQty + 1);
                            }}
                            className="stepper-action-btn"
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={(e) => handleAdd(e, product)}
                          className={`product-add-btn ${isAdded ? 'btn-added' : ''}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                          aria-label={`Add ${product.name} to bag`}
                        >
                          {isAdded ? (
                            <>
                              <Check size={14} strokeWidth={2.5} />
                              <span>Added ✓</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
