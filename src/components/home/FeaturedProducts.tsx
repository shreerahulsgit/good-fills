'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/lib/cart-context';
import { Product } from '@/types';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

// Curate the top 3 signature creations
const FEATURED_SLUGS = [
  'kids-nutrition-powder',
  'ragi-porridge-mix',
  'ubtan-face-pack',
];

const featuredProducts = FEATURED_SLUGS.map((slug) =>
  PRODUCTS.find((p) => p.slug === slug)
).filter((p): p is Product => Boolean(p));

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

export function FeaturedProducts() {
  const { addItem, openCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
    openCart();
  };

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
            <h2 className="featured-title">Handcrafted in Small Batches.</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.12 }}
            className="featured-header-action"
          >
            <Link href="/shop" className="featured-view-all group">
              <span>View All 13 Products</span>
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
                      src={product.images.primary}
                      alt={product.name}
                      className="product-img"
                    />

                    {/* Pack Size Pill */}
                    <div className="product-badge-size">
                      {product.packSize}
                    </div>

                    {/* Freshly Made Badge */}
                    <div className="product-badge-made">
                      Made to Order
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="product-info">
                    <span className="product-category-label">
                      {product.category.replace('-', ' ')}
                    </span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.shortDescription}</p>

                    {/* Price & Action Row */}
                    <div className="product-price-row">
                      <div className="product-price-wrap">
                        <span className="product-currency">₹</span>
                        <span className="product-amount">{product.price}</span>
                      </div>

                      {/* Tactile Quick-Add Button */}
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
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            <span>Add to Bag</span>
                          </>
                        )}
                      </motion.button>
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
