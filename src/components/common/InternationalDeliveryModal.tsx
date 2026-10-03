'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Globe, MessageCircle, PhoneCall, Truck, Scale, ShieldCheck, ArrowRight } from 'lucide-react';
import styles from './InternationalDeliveryModal.module.css';

interface InternationalDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InternationalDeliveryModal({ isOpen, onClose }: InternationalDeliveryModalProps) {
  const atelierPhone = '9742068899';
  const whatsappUrl = `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(
    'Hello Good Fills! 🌿 I would like to place an order for delivery outside India. Please share details on courier rates and items.'
  )}`;

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gf_intl_popup_dismissed', 'true');
    }
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intl-popup-title"
    >
      <div className={styles.modal}>
        <div className={styles.topAccentLine} />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={styles.closeBtn}
          aria-label="Close international delivery modal"
        >
          <X size={16} />
        </button>

        {/* Header Badge */}
        <div className={styles.badgeRow}>
          <span className={styles.badge}>
            <Globe size={13} />
            Worldwide Dispatch
          </span>
          <span className={styles.badgeSub}>Bengaluru Atelier</span>
        </div>

        {/* Title */}
        <h2 id="intl-popup-title" className={styles.title}>
          Looking for International Delivery?
        </h2>

        {/* Description */}
        <p className={styles.description}>
          We ship our homemade foods, nutrition mixes, and skincare creations to loved ones across the globe! Because international air courier tariffs depend strictly on net parcel weight and destination customs, our kitchen desk assists you directly with exact courier quotes.
        </p>

        {/* 3 Value Pillars */}
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <Truck size={17} className={styles.featureIcon} />
            <div className={styles.featureTitle}>DTDC International</div>
            <p className={styles.featureText}>Doorstep air courier to 50+ countries.</p>
          </div>

          <div className={styles.featureCard}>
            <Scale size={17} className={styles.featureIcon} />
            <div className={styles.featureTitle}>Weight-Based Slabs</div>
            <p className={styles.featureText}>Exact courier tariffs with no inflated fees.</p>
          </div>

          <div className={styles.featureCard}>
            <ShieldCheck size={17} className={styles.featureIcon} />
            <div className={styles.featureTitle}>Airtight Sealed</div>
            <p className={styles.featureText}>Secure vacuum barrier for flight transit.</p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
            onClick={handleDismiss}
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp to Order</span>
          </a>

          <div className={styles.callRow}>
            <a
              href={`tel:+91${atelierPhone}`}
              className={styles.callBtn}
              onClick={handleDismiss}
            >
              <PhoneCall size={15} />
              <span>Call Kitchen</span>
            </a>

            <Link
              href="/international-delivery"
              className={styles.guideLink}
              onClick={handleDismiss}
            >
              <span>Shipping Guide</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className={styles.dismissBtn}
          >
            Continue browsing for delivery in India
          </button>
        </div>
      </div>
    </div>
  );
}
