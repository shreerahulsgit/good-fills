'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePreloader } from '@/lib/preloader-context';
import { X, Globe, PhoneCall, ArrowRight } from 'lucide-react';
import styles from './InternationalDeliveryModal.module.css';

// Official WhatsApp vector icon from Simple Icons (https://simpleicons.org/icons/whatsapp)
function WhatsAppIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.977-.276-.101-.477-.15-.678.15-.2.3-.778.977-.954 1.178-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.783-1.676-2.083-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.3.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.301-1.054 1.028-1.054 2.508 0 1.48 1.079 2.909 1.23 3.109.15.2 2.124 3.243 5.145 4.545.719.31 1.28.496 1.718.635.722.23 1.378.197 1.9.12.581-.086 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.126-.276-.226-.577-.376zm-5.467 6.438a9.426 9.426 0 0 1-4.814-1.32l-.345-.205-3.58.939.955-3.489-.225-.358a9.434 9.434 0 0 1-1.447-4.992c0-5.213 4.241-9.454 9.459-9.454 2.527 0 4.902.984 6.69 2.772a9.422 9.422 0 0 1 2.768 6.685c0 5.216-4.242 9.457-9.456 9.457zm7.842-17.298A11.018 11.018 0 0 0 12.005 0C5.939 0 1.002 4.937 1.002 11.003c0 1.939.505 3.832 1.464 5.494L.548 24l7.697-2.019a10.985 10.985 0 0 0 5.76 1.623h.005c6.066 0 11.003-4.937 11.003-11.003 0-2.94-1.144-5.704-3.227-7.787z" />
    </svg>
  );
}

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
            <WhatsAppIcon size={14} className={styles.whatsappIcon} />
            <span className={styles.whatsappLabel}>Chat on WhatsApp</span>
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
