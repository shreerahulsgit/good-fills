'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { usePreloader } from '@/components/context/preloader-context';
import { AnnouncementConfig } from '@/types';
import styles from '@/components/navigation/announcement.module.css';

const SESSION_KEY = 'good_fills_announcement_seen';

export function AnnouncementModal() {
  const pathname = usePathname();
  const { isLoaded, showPreloader } = usePreloader();
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch announcement config once on mount
  useEffect(() => {
    let isCancelled = false;

    async function fetchConfig() {
      try {
        const res = await fetch('/api/announcement', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data?.config) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        console.error('Failed to fetch announcement config:', err);
      } finally {
        if (!isCancelled) setHasAttemptedFetch(true);
      }
    }

    fetchConfig();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Evaluate whether to trigger the popup after preloader completes
  useEffect(() => {
    // Never show on admin or console routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/console')) {
      setIsOpen(false);
      return;
    }

    // Must wait until config is fetched, preloader is done lifting
    if (!hasAttemptedFetch || !config || !config.enabled) {
      setIsOpen(false);
      return;
    }

    if (!showPreloader && isLoaded) {
      const isPreview = typeof window !== 'undefined' && (
        window.location.search.includes('preview_poster') || 
        window.location.search.includes('preview=true')
      );

      const hasSeen = typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY);

      if (!hasSeen || isPreview || !config.showOncePerSession) {
        // Small delay so page reveals first before the modal appears
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [hasAttemptedFetch, config, showPreloader, isLoaded, pathname]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !config || !config.enabled) return null;

  const content = (
    <div className={styles.posterWrapper}>
      <img
        src={config.imageUrl || '/images/announcement-poster.jpg'}
        alt={config.title || 'Announcement from Good Fills'}
        className={styles.posterImage}
        loading="eager"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={config.title || 'Good Fills Announcement'}
        >
          <motion.div
            className={styles.modalBox}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleClose}
              title="Close announcement"
              aria-label="Close announcement"
            >
              <X size={18} strokeWidth={2.4} />
            </button>

            {config.linkUrl ? (
              <Link
                href={config.linkUrl}
                className={styles.posterLink}
                onClick={handleClose}
              >
                {content}
              </Link>
            ) : (
              content
            )}

            {config.showButton !== false && (
              <div className={styles.modalFooter}>
                {config.linkUrl ? (
                  <Link
                    href={config.linkUrl}
                    className={styles.actionButton}
                    onClick={handleClose}
                  >
                    <span>{config.buttonText || 'Explore Kitchen'}</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={handleClose}
                  >
                    <span>{config.buttonText || 'Continue to Store'}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
