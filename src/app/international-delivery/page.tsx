import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe,
  Clock,
  PhoneCall,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import styles from '@/components/legal/PolicyLayout.module.css';

export const metadata: Metadata = {
  title: 'International Delivery & Global Shipping • Good Fills Bengaluru Atelier',
  description:
    'Handcrafted homemade food, nutrition, and skincare shipped worldwide from Bengaluru via DTDC International courier. Transparent weight-based shipping quotes.',
};

export default function InternationalDeliveryPage() {
  const atelierPhone = '9742068899';
  const whatsappUrl = `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(
    'Hello Good Fills! 🌿 I would like to place an order for delivery outside India. Please share details on courier rates and order placement.'
  )}`;

  return (
    <div className={styles.policyPageWrapper}>
      <div className={styles.policyContainer}>

        {/* 1. TOP EDITORIAL META STRIP */}
        <div className={styles.metaHeader}>
          <div className={styles.metaEyebrow}>
            <Globe size={13} />
            <span>Good Fills Atelier · International Logistics</span>
          </div>
          <div className={styles.metaRight}>
            <span className={styles.metaBadge}>Worldwide Air Cargo</span>
            <span>DTDC International Express</span>
          </div>
        </div>

        {/* 2. HERO TITLE BLOCK */}
        <div className={styles.heroBlock}>
          <h1 className={styles.heroTitle}>
            International Delivery &amp; <em>Worldwide Shipping</em>
          </h1>
          <p className={styles.heroLead}>
            Freshly prepared to order in our Bengaluru home kitchen within 24–48 hours of order confirmation. Dispatched worldwide to customers seeking pure, unadulterated traditional nutrition and skincare.
          </p>
        </div>

        {/* 3. MAIN ARTICLE CONTENT */}
        <article className={styles.policyArticle}>
          {/* Highlight Notice Box */}
          <div className={styles.highlightNotice}>
            <div className={styles.noticeTitle}>
              <PhoneCall size={16} />
              <span>Direct Call-First Ordering · Kitchen Line +91 {atelierPhone}</span>
            </div>
            <p className={styles.noticeText}>
              Because international air courier charges are high and vary significantly depending on gross parcel weight, destination customs regulations, and daily cargo tariffs, we do not automate international shipping checkout online. The moment you wish to order from outside India, please place a direct call to our atelier desk at <strong>+91 {atelierPhone}</strong> (or message on WhatsApp) so we can assess current courier rates and coordinate your batch personally.
            </p>
          </div>

          <h2>1. How to Place an International Order</h2>
          <p>
            Ordering your favorite traditional Good Fills creations from abroad is simple and handled with personalized concierge care:
          </p>
          <ul>
            <li>
              <strong>Step 1 — Browse &amp; Choose Your Products:</strong> Browse our online catalog and decide which fresh homemade foods, nutrition mixes, or skincare creations you want.
            </li>
            <li>
              <strong>Step 2 — Call Our Atelier Desk (+91 {atelierPhone}):</strong> The moment you want to place an international order, call our kitchen directly at <strong>+91 {atelierPhone}</strong> <em>(or message on WhatsApp for international timezones)</em> with your item list and destination country.
            </li>
            <li>
              <strong>Step 3 — Custom Courier Rate &amp; Timeline Confirmation:</strong> Because international courier tariffs depend on current air freight rates and destination customs, our team confirms the exact courier charges and delivery schedule directly with you.
            </li>
            <li>
              <strong>Step 4 — Fresh Batch Preparation &amp; Payment:</strong> Once confirmed on the call, your order is freshly soaked, sprouted, and stone-milled in our Bengaluru kitchen, and payment is processed securely.
            </li>
            <li>
              <strong>Step 5 — Export Packaging &amp; Doorstep Delivery:</strong> Your order is sealed in altitude-resistant barrier pouches and dispatched via DTDC International Express, with live tracking shared with you.
            </li>
          </ul>

          <h2>2. Serviceable Destinations &amp; Estimated Air Transit</h2>
          <p>
            We fulfill deliveries worldwide through DTDC International Air Courier network to all major overseas destinations:
          </p>

          <div className={styles.tableWrap}>
            <table className={styles.policyTable}>
              <thead>
                <tr>
                  <th>Destination Region</th>
                  <th>Estimated Air Transit</th>
                  <th>Courier Network Service</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>North America (USA &amp; Canada)</strong></td>
                  <td>6 – 9 Business Days</td>
                  <td>DTDC International Air Express</td>
                </tr>
                <tr>
                  <td><strong>United Kingdom &amp; European Union</strong></td>
                  <td>6 – 8 Business Days</td>
                  <td>DTDC International Air Priority</td>
                </tr>
                <tr>
                  <td><strong>United Arab Emirates &amp; GCC</strong></td>
                  <td>4 – 6 Business Days</td>
                  <td>DTDC Gulf Express</td>
                </tr>
                <tr>
                  <td><strong>Singapore, Malaysia &amp; APAC</strong></td>
                  <td>5 – 7 Business Days</td>
                  <td>DTDC Asia Air Express</td>
                </tr>
                <tr>
                  <td><strong>Australia &amp; New Zealand</strong></td>
                  <td>7 – 10 Business Days</td>
                  <td>DTDC Oceanic Air Express</td>
                </tr>
                <tr>
                  <td><strong>Rest of the World</strong></td>
                  <td>8 – 12 Business Days</td>
                  <td>DTDC Global Partner Network</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            *Transit times are counted from date of DTDC courier dispatch from Bengaluru and exclude potential delays at destination customs control.
          </p>

          <h2>3. Export Packaging &amp; Freshness Guarantee</h2>
          <p>
            Every product sent internationally undergoes specialized multi-barrier export packing:
          </p>
          <ul>
            <li>
              <strong>Airtight Moisture Barriers:</strong> Food powders and porridge blends are heat-sealed in multi-layer food-grade pouches that insulate against altitude pressure changes during flight.
            </li>
            <li>
              <strong>Zero Additives or Fillers:</strong> Even for international shipments, we never add synthetic preservatives or stabilizers. Natural freshness is guaranteed for up to 6 months when kept sealed.
            </li>
            <li>
              <strong>Shock-Absorbing Outer Box:</strong> Parcels are cushioned with reinforced corrugated layers to withstand transit across international air cargo hubs.
            </li>
          </ul>

          <h2>4. Customs Declarations &amp; Import Regulations</h2>
          <p>
            All international consignments are accompanied by standard commercial invoices and required HS tariff classification codes. Any destination country import customs duties, local taxes (VAT/GST), or administrative clearance charges levied by foreign customs are the responsibility of the recipient.
          </p>
        </article>

        {/* 4. ATELIER CONCIERGE HELP CARD */}
        <section className={styles.supportCard}>
          <div className={styles.supportLeft}>
            <div className={styles.supportEyebrow}>
              <Globe size={13} />
              <span>International Concierge Desk</span>
            </div>
            <h3 className={styles.supportTitle}>Ready to Place an Overseas Order?</h3>
            <p className={styles.supportDesc}>
              Call our Bengaluru kitchen team directly at <strong>+91 {atelierPhone}</strong> or connect on WhatsApp. We will confirm item availability, calculate gross weight, and share current air courier rates.
            </p>
          </div>

          <div className={styles.supportActions}>
            <a
              href={`tel:+91${atelierPhone}`}
              className={styles.whatsappBtn}
              style={{ backgroundColor: 'var(--accent-terracotta)' }}
            >
              <PhoneCall size={15} />
              <span>Call Kitchen (+91 {atelierPhone})</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactPageBtn}
            >
              <MessageCircle size={15} />
              <span>WhatsApp Desk</span>
            </a>

            <Link href="/shop" className={styles.contactPageBtn}>
              <span>Browse Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
