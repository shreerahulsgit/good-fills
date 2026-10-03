'use client';

import React, { useState, useEffect } from 'react';
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

  // Start hidden so it NEVER appears on the preloader screen
  const [isVisible, setIsVisible] = useState(false);

  // Trigger on home page AFTER preload finishes
  useEffect(() => {
    // Only activate after the preloader curtain has completely lifted and home page is visible
    if (!showPreloader && isLoaded) {
      if (pathname === '/') {
        const isDismissed =
          typeof window !== 'undefined' &&
          sessionStorage.getItem('gf_intl_corner_toast_dismissed') === 'true';

        if (!isDismissed) {
          // Graceful 800ms delay after home page content is revealed
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [showPreloader, isLoaded, pathname]);

  // Sync with prop if explicitly provided
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsVisible(propIsOpen);
    }
  }, [propIsOpen]);

  // Listen to open events from anywhere (e.g. top announcement bar click)
  useEffect(() => {
    const handleOpen = () => {
      setIsVisible(true);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gf_intl_corner_toast_dismissed');
      }
    };
    window.addEventListener('gf_open_intl_toast', handleOpen);
    return () => window.removeEventListener('gf_open_intl_toast', handleOpen);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gf_intl_corner_toast_dismissed', 'true');
    }
    if (propOnClose) propOnClose();
  };

  // NEVER render on the preloader screen
  if (showPreloader || !isVisible) return null;

  return (
    <aside
      className={styles.floatingContainer}
      role="region"
      aria-label="International delivery notification"
    >
      <div className={styles.toastCard}>
        {/* Card Header with Badge & Cross Button */}
        <div className={styles.cardHeader}>
          <span className={styles.badge}>
            <Globe size={11} />
            Worldwide Delivery
          </span>

          <button
            type="button"
            onClick={handleDismiss}
            className={styles.closeBtn}
            title="Dismiss notice"
            aria-label="Close international delivery notice"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <h4 className={styles.title}>Delivering Outside India?</h4>
        <p className={styles.desc}>
          We ship homemade nutrition, food &amp; skincare worldwide via DTDC with custom weight-based rates.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            <MessageCircle size={15} />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:+91${atelierPhone}`}
            className={styles.callBtn}
            title={`Call +91 ${atelierPhone}`}
          >
            <PhoneCall size={14} />
            <span>Call</span>
          </a>
        </div>

        {/* Footer Sublink */}
        <div className={styles.footerRow}>
          <Link
            href="/international-delivery"
            className={styles.guideLink}
            onClick={handleDismiss}
          >
            <span>View shipping guide</span>
            <ArrowRight size={11} />
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
