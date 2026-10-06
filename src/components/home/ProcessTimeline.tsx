'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

interface StepItem {
  step: string;
  navLabel: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

const STEPS: StepItem[] = [
  {
    step: '01',
    navLabel: 'Order Placed',
    title: 'Your Order Awakens the Atelier',
    description:
      'Instant UPI verification immediately triggers our Bengaluru kitchen. We calculate exact shipping by weight directly at checkout, ensuring complete pricing transparency with strictly zero stockpiling or pre-packed warehouse inventory.',
    metric: 'Instant',
    metricLabel: 'Batch Scheduled',
  },
  {
    step: '02',
    navLabel: 'Small-Batch Prep',
    title: 'Sprouted, Roasted & Milled',
    description:
      'Grains and botanicals are hand-sorted, sprouted over 48 hours, sun-dried, and slow-roasted in traditional iron kadhais to preserve volatile natural oils and vital nutrients. Freshly crafted in small batches with strictly zero artificial preservatives or synthetic additives.',
    metric: '12–24h',
    metricLabel: 'Crafting Time',
  },
  {
    step: '03',
    navLabel: 'Aroma Sealed',
    title: 'Sealed for 6-Month Freshness',
    description:
      'Immediately following natural cooling, each preparation is sealed into airtight food-grade barrier pouches. This locks in the volatile natural aroma, rich flavor, and active botanical enzymes, guaranteeing a full 6-month shelf life without chemical preservatives.',
    metric: '6 Months',
    metricLabel: 'Natural Shelf Life',
  },
  {
    step: '04',
    navLabel: 'Express Dispatch',
    title: 'Direct Pan-India Doorstep Courier',
    description:
      'Freshly sealed parcels are dispatched via express couriers for fast, tracked doorstep delivery across India within 2 to 4 business days. Real-time tracking numbers are sent straight to your phone via SMS and WhatsApp the moment your package departs.',
    metric: '2–4 Days',
    metricLabel: 'Doorstep Delivery',
  },
];

export function ProcessTimeline() {
  // Always begin and stay at Step 1 (Order Placed) until the user navigates
  const [activeIndex, setActiveIndex] = useState(0);

  const nextStep = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % STEPS.length);
  }, []);

  const prevStep = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + STEPS.length) % STEPS.length);
  }, []);

  // Listen for navigation to #process (from footer or direct link)
  useEffect(() => {
    const handleScrollToProcess = () => {
      setActiveIndex(0); // Reset firmly to Step 1
      if (typeof window !== 'undefined' && window.location.hash === '#process') {
        const el = document.getElementById('process');
        if (el) {
          const headerOffset = 110;
          const elementPosition = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth',
          });
        }
      }
    };

    if (typeof window !== 'undefined' && window.location.hash === '#process') {
      const timer = setTimeout(handleScrollToProcess, 150);
      return () => clearTimeout(timer);
    }

    window.addEventListener('hashchange', handleScrollToProcess);
    window.addEventListener('goodfills:reset-process', handleScrollToProcess);
    return () => {
      window.removeEventListener('hashchange', handleScrollToProcess);
      window.removeEventListener('goodfills:reset-process', handleScrollToProcess);
    };
  }, []);

  const current = STEPS[activeIndex];

  return (
    <section
      className="process-section"
      id="process"
    >
      <div className="container">
        {/* Section Header */}
        <div className="process-header">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase }}
          >
            <span className="eyebrow">The Made-to-Order Journey</span>
            <h2 className="process-title">How Every Batch is Crafted.</h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.12 }}
            className="process-subtitle"
          >
            We do not keep finished products sitting on warehouse shelves. Your batch begins only after your order is confirmed.
          </motion.p>
        </div>

        {/* Continuous Timeline Spine */}
        <div className="process-spine-container">
          <div className="process-spine-track">
            {STEPS.map((item, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;

              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`process-spine-node ${isActive ? 'is-active' : ''} ${isPast ? 'is-past' : ''}`}
                  aria-label={`Jump to Step ${item.step}: ${item.navLabel}`}
                >
                  <div className="process-node-head">
                    <span className="process-node-num">{item.step}</span>
                    <span className="process-node-label">{item.navLabel}</span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeSpineIndicator"
                      className="process-spine-active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tightened Minimalist Editorial Stage */}
        <div className="process-stage-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: luxuryEase }}
              className="process-stage-content"
            >
              {/* Grand Background Serif Watermark */}
              <div className="process-stage-watermark" aria-hidden="true">
                {current.step}
              </div>

              {/* Narrative Focus */}
              <div className="process-narrative-col">
                <span className="process-stage-phase-tag">
                  PHASE {current.step} OF 04
                </span>

                <h3 className="process-stage-title">{current.title}</h3>
                <p className="process-stage-desc">{current.description}</p>
              </div>

              {/* Compact Stat & Controls */}
              <div className="process-sidebar-col">
                <div className="process-stat-block">
                  <span className="process-stat-metric">{current.metric}</span>
                  <span className="process-stat-label">{current.metricLabel}</span>
                </div>

                <div className="process-nav-controls">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="process-nav-btn prev"
                    aria-label="Previous step"
                  >
                    <ArrowLeft size={16} strokeWidth={2} />
                    <span>Prev</span>
                  </button>

                  <div className="process-step-pips">
                    {STEPS.map((_, dotIndex) => (
                      <button
                        key={dotIndex}
                        type="button"
                        onClick={() => setActiveIndex(dotIndex)}
                        className={`process-pip ${dotIndex === activeIndex ? 'active' : ''}`}
                        aria-label={`Go to step ${dotIndex + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="process-nav-btn next"
                    aria-label="Next step"
                  >
                    <span>Next</span>
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
