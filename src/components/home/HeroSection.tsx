'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePreloader } from '@/lib/preloader-context';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

export function HeroSection() {
  const { isLoaded, showPreloader } = usePreloader();
  const isReady = !showPreloader || isLoaded;

  return (
    <section className="hero-minimal-section">
      {/* Background Image Layer (Smooth cinematic scale-in once preloader completes) */}
      <motion.div 
        className="hero-bg-layer"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={isReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.4, ease: luxuryEase }}
      />

      <div className="container hero-minimal-container">
        <div className="hero-minimal-content">
          {/* Main Title — Semantic H1 with Sequential Staggered Line Reveals */}
          <h1 className="hero-minimal-title">
            <motion.span 
              className="hero-title-line"
              initial={{ opacity: 0, y: 24 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.9, ease: luxuryEase, delay: 0.16 }}
            >
              Traditional care,
            </motion.span>
            
            <motion.span 
              className="hero-title-line"
              initial={{ opacity: 0, y: 24 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.9, ease: luxuryEase, delay: 0.32 }}
            >
              made for everyday life.
            </motion.span>
          </h1>

          {/* Sequential Subtitle Reveal */}
          <motion.p 
            className="hero-minimal-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.85, ease: luxuryEase, delay: 0.46 }}
          >
            Homemade food, nutrition, skincare and bath products prepared with care and made to order.
          </motion.p>

          {/* Sequential Action Buttons Reveal with Spring Micro-Interactions */}
          <motion.div 
            className="hero-minimal-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.60 }}
          >
            <motion.div 
              className="hero-btn-wrapper"
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Link href="/shop" className="btn btn-primary hero-minimal-btn group-btn">
                <span>Shop Products</span>
                <ArrowRight size={16} className="btn-arrow" />
              </Link>
            </motion.div>

            <motion.div 
              className="hero-btn-wrapper"
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Link href="/about" className="btn btn-outline hero-minimal-btn">
                <span>Our Story</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={isReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, ease: luxuryEase, delay: 0.85 }}
      >
        <span className="hero-scroll-text">Scroll to explore</span>
        <div className="hero-scroll-line">
          <motion.span
            className="hero-scroll-line-fill"
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
