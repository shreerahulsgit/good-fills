'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, MessageCircle, PhoneCall, Truck, ShieldCheck, Scale, ArrowRight } from 'lucide-react';
import styles from './InternationalAnnouncement.module.css';

export function InternationalAnnouncement() {
  const atelierPhone = '9742068899';
  const whatsappUrl = `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(
    'Hello Good Fills! 🌿 I would like to inquire about international delivery outside India. Please share details on courier rates and order placement.'
  )}`;

  return (
    <section id="international-delivery" className={styles.announcementSection} aria-label="International Delivery Announcement">
      <div className="container">
        <div className={styles.announcementCard}>
          <div className={styles.grid}>
            {/* Left Content Column */}
            <div>
              <div className={styles.eyebrowRow}>
                <span className={styles.eyebrowBadge}>
                  <Globe size={13} />
                  Worldwide Fulfillment
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Dispatched from Bengaluru Atelier
                </span>
              </div>

              <h2 className={styles.title}>
                Delivering Traditional Care Worldwide
              </h2>

              <p className={styles.description}>
                Living outside India or looking to send handcrafted homemade nutrition, wholesome foods, or herbal bath powders to family abroad? We fulfill international orders directly from our kitchen desk with custom DTDC International courier rates calculated strictly by parcel weight.
              </p>

              {/* 3 Core Pillars */}
              <div className={styles.pillarsList}>
                <div className={styles.pillarItem}>
                  <Truck size={18} className={styles.pillarIcon} />
                  <div className={styles.pillarTitle}>DTDC International</div>
                  <p className={styles.pillarDesc}>Doorstep global courier delivery with end-to-end tracking.</p>
                </div>

                <div className={styles.pillarItem}>
                  <Scale size={18} className={styles.pillarIcon} />
                  <div className={styles.pillarTitle}>Weight-Based Slabs</div>
                  <p className={styles.pillarDesc}>Exact courier rates calculated transparently by net weight.</p>
                </div>

                <div className={styles.pillarItem}>
                  <ShieldCheck size={18} className={styles.pillarIcon} />
                  <div className={styles.pillarTitle}>Export Airtight Seal</div>
                  <p className={styles.pillarDesc}>Pouch and vacuum sealed to preserve fresh homemade potency.</p>
                </div>
              </div>
            </div>

            {/* Right Action Box */}
            <div className={styles.actionBox}>
              <div className={styles.actionBoxHeader}>
                <h3 className={styles.actionBoxTitle}>International Order Desk</h3>
                <span className={styles.phoneBadge}>+91 {atelierPhone}</span>
              </div>

              <div className={styles.actionButtons}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  <MessageCircle size={17} />
                  <span>Chat on WhatsApp to Order</span>
                </a>

                <a
                  href={`tel:+91${atelierPhone}`}
                  className={styles.callBtn}
                >
                  <PhoneCall size={16} />
                  <span>Call Kitchen: +91 {atelierPhone}</span>
                </a>
              </div>

              <p className={styles.noteText}>
                Our kitchen coordinates custom quotes and payment directly for all overseas shipments.{' '}
                <Link href="/international-delivery" className={styles.learnMoreLink}>
                  View international guide &rarr;
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
