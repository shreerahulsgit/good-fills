'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreloader } from '@/lib/preloader-context';
import { X, Globe, MessageCircle, PhoneCall, ArrowRight } from 'lucide-react';
import styles from './InternationalDeliveryModal.module.css';

interface InternationalDeliveryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function InternationalDeliveryModal({ isOpen: propIsOpen, onClose: propOnClose }: InternationalDeliveryModalProps) {
  const pathname = usePathname();
  const { isLoaded, showPreloader } = usePreloader();

  const atelierPhone = '9742068899';
  const whatsappUrl = `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(
    'Hello Good Fills! 🌿 I would like to place an order for delivery outside India. Please share details on courier rates and items.'
  )}`;

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Trigger on home page AFTER preload finishes
  useEffect(() => {
    if (!isMounted) return;

    if (pathname !== '/') {
      setIsVisible(false);
      return;
    }

    if (!showPreloader && isLoaded) {
      let isDismissed = false;
      try {
        isDismissed = sessionStorage.getItem('gf_intl_corner_toast_dismissed') === 'true';
      } catch {
        isDismissed = false;
      }

      if (!isDismissed) {
        // Graceful delay after home page content is revealed
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isMounted, showPreloader, isLoaded, pathname]);

  // Auto-hide popup after 8 seconds of visibility
  useEffect(() => {
    if (isVisible) {
      autoHideTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => {
        if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      };
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
  };

  const handleMouseLeave = () => {
    if (isVisible) {
      autoHideTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, 3500);
    }
  };

  // Sync with prop if explicitly provided
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsVisible(propIsOpen);
    }
  }, [propIsOpen]);

  // Listen to open events from anywhere
  useEffect(() => {
    const handleOpen = () => {
      setIsVisible(true);
      try {
        sessionStorage.removeItem('gf_intl_corner_toast_dismissed');
      } catch {
        // ignore
      }
    };
    window.addEventListener('gf_open_intl_toast', handleOpen);
    return () => window.removeEventListener('gf_open_intl_toast', handleOpen);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('gf_intl_corner_toast_dismissed', 'true');
    } catch {
      // ignore
    }
    if (propOnClose) propOnClose();
  };

  // Only render on client, on home page, and when preloader is finished
  if (!isMounted || pathname !== '/' || showPreloader || !isVisible) return null;

  return (
    <aside
      className={styles.floatingContainer}
      aria-label="International delivery notification"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.toastCard}>
        {/* Card Header with Badge & Cross Button */}
        <div className={styles.cardHeader}>
          <span className={styles.badge}>
            <Globe size={10} />
            Worldwide Delivery
          </span>

          <button
            type="button"
            onClick={handleDismiss}
            className={styles.closeBtn}
            title="Dismiss notice"
            aria-label="Close international delivery notice"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content */}
        <h4 className={styles.title}>Order for Delivery Outside India</h4>
        <p className={styles.desc}>
          We ship fresh nutrition, food &amp; skincare worldwide with fast, tracked courier delivery.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            <MessageCircle size={13} />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:+91${atelierPhone}`}
            className={styles.callBtn}
            title={`Call +91 ${atelierPhone}`}
          >
            <PhoneCall size={12} />
            <span>Call</span>
          </a>
        </div>

        {/* Footer Sublink */}
        <div className={styles.footerRow}>
          <Link
            href="/shipping-policy#international"
            className={styles.guideLink}
            onClick={handleDismiss}
          >
            <span>View shipping guide</span>
            <ArrowRight size={10} />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className={styles.dismissText}
          >
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
}
