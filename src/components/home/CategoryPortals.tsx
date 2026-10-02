'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, PRODUCTS } from '@/data/products';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

// Calculate exact product counts dynamically
const categoriesWithCounts = CATEGORIES.map((cat, idx) => {
  const count = PRODUCTS.filter((p) => p.category === cat.id).length;
  return {
    ...cat,
    num: `0${idx + 1}`,
    count,
  };
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: luxuryEase,
    },
  },
};

export function CategoryPortals() {
  return (
    <section className="portals-section">
      <div className="container">
        {/* Section Header with Staggered Reveal */}
        <div className="portals-header">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase }}
          >
            <span className="eyebrow">Explore by Family</span>
            <h2 className="portals-title">Carefully Crafted for Every Need.</h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.12 }}
            className="portals-subtitle"
          >
            13 handmade creations organized across four traditional everyday disciplines.
          </motion.p>
        </div>

        {/* 4-Portal Grid with Sequential Alignment */}
        <motion.div
          className="portals-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {categoriesWithCounts.map((cat) => (
            <motion.div
              key={cat.id}
              className="portal-card group"
              variants={cardVariants}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <Link href={`/shop/${cat.id}`} className="portal-link">
                {/* Visual Imagery Container */}
                <div className="portal-img-wrap">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="portal-img"
                  />
                  
                  {/* Subtle Gradient Veil */}
                  <div className="portal-veil" />

                  {/* Serial Stamp */}
                  <span className="portal-num">{cat.num}</span>

                  {/* Product Count Pill */}
                  <span className="portal-pill">
                    {cat.count} {cat.count === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

                {/* Portal Content */}
                <div className="portal-body">
                  <h3 className="portal-name">{cat.name}</h3>
                  <p className="portal-tagline">{cat.tagline}</p>
                  
                  <div className="portal-action">
                    <span className="portal-action-text">Explore Collection</span>
                    <ArrowRight size={14} className="portal-arrow" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
