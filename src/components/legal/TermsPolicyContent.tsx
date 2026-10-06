'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Scale, AlertOctagon } from 'lucide-react';
import styles from './PolicyLayout.module.css';

export function TermsPolicyContent() {
  return (
    <>
      <div className={styles.highlightNotice}>
        <div className={styles.noticeTitle}>
          <FileText size={16} />
          <span>Atelier Terms of Service · Agreement &amp; Operating Standards</span>
        </div>
        <p className={styles.noticeText}>
          By browsing our website, placing an order, or creating an account with Good Fills, you agree to be bound by these Terms of Service, our <Link href="/shipping-policy" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>Shipping Policy</Link>, and our <Link href="/refund-policy" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>Returns Policy</Link>.
        </p>
      </div>

      <h2>1. The Atelier Model &amp; Made-to-Order Crafts</h2>
      <p>
        Good Fills is an artisanal food, nutrition, and botanical care atelier based in Bengaluru, Karnataka, India.
      </p>
      <p>
        All creations displayed on this storefront—including our baby &amp; kids sprouted porridge powders, traditional sathumaavu, cold-pressed oils, and herbal bath formulations—are prepared strictly made-to-order following ancestral kitchen traditions.
      </p>
      <ul>
        <li>
          <strong>Natural Harvest Variations:</strong> Because we source real, unadulterated whole grains, seeds, and pulses without synthetic dyes or chemical standardization, subtle variations in natural color, aroma, and grind texture may occur between seasonal harvest batches. These natural variations are marks of authentic agricultural purity.
        </li>
        <li>
          <strong>Zero Preservatives &amp; Storage Guidelines:</strong> Our products contain zero artificial preservatives, anti-caking agents, or maltodextrin. Once delivered, customers are responsible for transferring products to clean, airtight glass or stainless steel containers, storing them away from moisture and direct sunlight. Under proper storage, creations maintain optimal quality for 6 months from the date of milling.
        </li>
      </ul>

      <h2>2. Order Acceptance, Pricing &amp; UPI Payments</h2>
      <p>
        When you place an order on Good Fills:
      </p>
      <ul>
        <li>All prices listed on our website are in Indian Rupees (INR, ₹) and include applicable domestic taxes.</li>
        <li>Courier shipping charges are authoritative, calculated by total net product weight, and displayed clearly before checkout.</li>
        <li>Payments are processed exclusively through authorized digital channels (UPI via Razorpay). Good Fills does not accept cash on delivery (COD) or manual, unverified direct bank transfers.</li>
        <li>We reserve the right to decline or cancel orders in cases of demonstrable system pricing glitches, severe ingredient shortages, or courier service unavailability in remote postal zones.</li>
      </ul>

      <h2>3. Strictly Non-Cancellable &amp; Non-Returnable Policy</h2>
      <p>
        As detailed in our <Link href="/refund-policy" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>Returns Policy</Link>:
      </p>
      <ul>
        <li>Because raw organic ingredients and milling labor are immediately committed upon payment confirmation, <strong>orders cannot be cancelled, amended, or recalled once placed</strong>.</li>
        <li>Due to food safety standards and personal hygiene regulations, all products are strictly non-returnable and non-exchangeable once dispatched from our atelier.</li>
        <li>In the event of verified transit damage, broken seals, or missing items reported within 24 hours of delivery with photographic evidence, we will provide a free priority replacement or full refund.</li>
      </ul>

      <h2>4. Dietary, Wellness &amp; Allergen Disclaimers</h2>
      <p>
        Please read all ingredient labels carefully before consumption:
      </p>
      <ul>
        <li>
          <strong>Allergens:</strong> Our creations are produced in a kitchen environment that processes sprouted cereals, millets, pulses, tree nuts (such as almonds and cashews), and seeds. While we follow strict sanitization protocols, cross-contact may occur. If you or your infant has known food allergies, please review the complete ingredient list on each product page.
        </li>
        <li>
          <strong>Not Medical Advice:</strong> Information provided on this website—including traditional Ayurvedic references and folklore nutritional benefits—is for educational purposes only. Our products are nutritious artisanal foods and botanical care, not pharmaceutical medications or therapeutic cures for specific clinical conditions.
        </li>
        <li>
          <strong>Infant Weaning:</strong> Always consult your pediatrician before introducing new grains or complementary weaning foods to infants under 6 months of age.
        </li>
      </ul>

      <h2>5. Intellectual Property &amp; Brand Rights</h2>
      <p>
        All brand trademarks, photographs, packaging graphics, product descriptions, recipe philosophies, and website design code are the exclusive intellectual property of Good Fills.
      </p>
      <p>
        Unauthorized copying, scraping, reproducing, or commercially republishing any material without express written consent is strictly prohibited.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted under applicable Indian law, Good Fills, its founders, and kitchen artisans shall not be liable for any indirect, incidental, or consequential damages resulting from courier transit delays, improper post-delivery storage by the customer, or unauthorized use of our digital storefront.
      </p>
      <p>
        In all circumstances, our maximum aggregate liability to you for any claim arising from an order shall not exceed the total amount paid by you for that specific order.
      </p>

      <h2>7. Governing Law &amp; Dispute Jurisdiction</h2>
      <p>
        These Terms of Service, along with all operational and legal policies, are governed by and construed in accordance with the laws of the Republic of India.
      </p>
      <p>
        Any disputes, claims, or controversies arising out of or related to our products or services shall be subject to the exclusive jurisdiction of the competent courts in <strong>Bengaluru, Karnataka, India</strong>.
      </p>

      <h2>8. Amendments to Terms</h2>
      <p>
        We reserve the right to update or modify these Terms of Service periodically to reflect operational, legal, or regulatory changes. Updated terms will take effect immediately upon being published on this page.
      </p>
    </>
  );
}
