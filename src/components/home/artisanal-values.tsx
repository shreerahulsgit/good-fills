'use client';

import React from 'react';
import { PackageCheck, Leaf, Truck, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

const VALUES = [
  {
    num: '01',
    icon: PackageCheck,
    title: 'Made to Order',
    description: 'Prepared in small batches only when an order is placed — never warehoused.',
  },
  {
    num: '02',
    icon: Leaf,
    title: 'Traditional Ingredients',
    description: 'Wholesome natural ingredients crafted with time-honored traditional care.',
  },
  {
    num: '03',
    icon: Truck,
    title: 'Fast & Tracked Delivery',
    description: 'Reliable doorstep shipping across India, delivered in 2–4 business days.',
  },
  {
    num: '04',
    icon: ShieldCheck,
    title: 'Bengaluru & FSSAI',
    description: 'Artisanal kitchen in Bengaluru adhering to certified food safety standards.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: luxuryEase,
    },
  },
};

export function ArtisanalValues() {
  return (
    <section className="values-section">
      <motion.div 
        className="values-hairline-top"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: luxuryEase }}
      />

      <div className="container">
        <motion.div 
          className="values-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <motion.div 
                key={val.num} 
                className="value-card group"
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              >
                <div className="value-header">
                  <motion.span 
                    className="value-num"
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {val.num}
                  </motion.span>
                  <motion.div 
                    className="value-icon-box"
                    whileHover={{ scale: 1.14, rotate: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </motion.div>
                </div>
                
                <h3 className="value-title">{val.title}</h3>
                <p className="value-desc">{val.description}</p>

                <span className="value-hover-line" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <motion.div 
        className="values-hairline-bottom"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: luxuryEase, delay: 0.15 }}
      />
    </section>
  );
}