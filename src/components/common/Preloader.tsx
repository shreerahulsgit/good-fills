'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { usePreloader } from '@/lib/preloader-context';

const luxuryEase = [0.16, 1, 0.3, 1] as const;
const curtainEase = [0.76, 0, 0.24, 1] as const;

const POETIC_PHRASES = [
  'Traditional care, prepared with intention',
  '100% pure homemade ingredients',
  'Handcrafted & made to order in Bengaluru',
];

export function Preloader() {
  const pathname = usePathname();
  const { isLoaded, setIsLoaded, showPreloader, setShowPreloader } = usePreloader();
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isLifting, setIsLifting] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/console')) {
      setIsLoaded(true);
      setShowPreloader(false);
      return;
    }

    const isPreview = typeof window !== 'undefined' && window.location.search.includes('preview');
    const hasSeen = typeof window !== 'undefined' && sessionStorage.getItem('good_fills_preloader_seen');

    if (hasSeen && !isPreview) {
      setIsLoaded(true);
      setShowPreloader(false);
      return;
    }

    // Slow, stately progress counter (~4.4 seconds total) for comfortable reading
    const startTime = performance.now();
    const duration = 2300;

    const animateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      
      // Smooth natural progression curve
      const easeVal = 1 - Math.pow(1 - rawProgress, 2.2);
      const currentPercent = Math.min(Math.floor(easeVal * 100), 100);
      setProgress(currentPercent);

      // Generous reading intervals (~1.4s per phrase)
      if (rawProgress >= 0.66) {
        setPhraseIndex(2);
      } else if (rawProgress >= 0.33) {
        setPhraseIndex(1);
      } else {
        setPhraseIndex(0);
      }

      if (rawProgress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        setProgress(100);
        // Generous 600ms hold at 100% so the user can comfortably finish reading
        setTimeout(() => {
          setIsLifting(true);
          // Trigger hero entrance as curtain begins clearing
          setTimeout(() => {
            setIsLoaded(true);
          }, 400);
          // Complete removal after curtain clears
          setTimeout(() => {
            setShowPreloader(false);
            sessionStorage.setItem('good_fills_preloader_seen', 'true');
          }, 1250);
        }, 600);
      }
    };

    requestAnimationFrame(animateProgress);
  }, [setIsLoaded, setShowPreloader]);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/console') || !showPreloader) return null;

  return (
    <motion.div
      key="luxury-preloader-canvas"
      className="luxury-preloader-canvas"
      initial={{ y: 0 }}
      animate={{ y: isLifting ? '-100%' : 0 }}
      transition={{ duration: 1.05, ease: curtainEase }}
    >
      {/* Top Provenance Header */}
      <div className="preloader-top-bar">
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="preloader-eyebrow"
        >
          BENGALURU • EST. 2024
        </motion.span>
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="preloader-eyebrow"
        >
          HANDCRAFTED TO ORDER
        </motion.span>
      </div>

      {/* Center Monolithic Stage */}
      <div className="preloader-center-stage">
        <motion.div
          className="preloader-wordmark-container"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: luxuryEase, delay: 0.2 }}
        >
          <img 
            src="/logo.png" 
            alt="Good Fills Homemade Products" 
            style={{
              height: 'clamp(56px, 8vw, 76px)',
              width: 'auto',
              maxWidth: '300px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 12px'
            }}
          />
          <span className="preloader-sub-tag">Traditional Artisanal Care</span>
        </motion.div>

        {/* Poetic Dynamic Sub-phrase with Soft, Readable Dissolve */}
        <div className="preloader-phrase-wrapper">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: luxuryEase }}
              className="preloader-phrase"
            >
              {POETIC_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Luxury Progress Counter & Line */}
      <div className="preloader-bottom-bar">
        <div className="preloader-progress-track">
          <motion.div 
            className="preloader-progress-fill"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <div className="preloader-counter-row">
          <span className="preloader-counter-label">PREPARING ATELIER</span>
          <span className="preloader-counter-digits">
            {progress < 10 ? `0${progress}` : progress}
            <span className="preloader-counter-unit">%</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
