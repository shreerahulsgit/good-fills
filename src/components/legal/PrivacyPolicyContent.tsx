'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, EyeOff, Server, UserCheck } from 'lucide-react';
import styles from './PolicyLayout.module.css';

export function PrivacyPolicyContent() {
  return (
    <>
      <div className={styles.highlightNotice}>
        <div className={styles.noticeTitle}>
          <Lock size={16} />
          <span>Zero Financial Data Storage · 100% Privacy Guarantee</span>
        </div>
        <p className={styles.noticeText}>
          Good Fills never collects, stores, or accesses your bank account credentials, UPI MPIN, or payment passwords. All transactions are securely routed through <strong>Razorpay’s 256-bit bank-grade encrypted payment gateway</strong>.
        </p>
      </div>

      <h2>1. Overview &amp; Scope</h2>
      <p>
        Good Fills (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), operating as an artisanal atelier in Bengaluru, Karnataka, India, is committed to safeguarding the privacy and personal data of our customers (&quot;you&quot;, &quot;your&quot;).
      </p>
      <p>
        This Privacy Policy outlines how we collect, handle, process, and protect your personal information in compliance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the <strong>Digital Personal Data Protection Act, 2023</strong> (DPDP Act).
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        We only collect information strictly necessary to fulfill your artisanal food and skincare orders:
      </p>
      <ul>
        <li>
          <strong>Contact Information:</strong> Full name, 10-digit mobile phone number, and email address.
        </li>
        <li>
          <strong>Shipping &amp; Delivery Information:</strong> Street address, apartment/flat number, landmark, city, state, and 6-digit postal pincode.
        </li>
        <li>
          <strong>Customer Account Profile:</strong> If you sign in via Google or Email/Password, we store your authenticated email, name, and saved shipping addresses securely in our customer directory.
        </li>
        <li>
          <strong>Order Telemetry &amp; Logs:</strong> Order reference ID (e.g. <code>ORD-3595</code>), items ordered, DTDC courier tracking number, and transaction capture status.
        </li>
      </ul>

      <h2>3. Payment Security &amp; Gateway Processing</h2>
      <p>
        We operate an entirely digital, cashless payment flow powered by <strong>Razorpay</strong>:
      </p>
      <ul>
        <li>
          When you pay via UPI (Google Pay, PhonePe, Paytm, BHIM, or any bank UPI app), your transaction is authorized directly within your UPI app or bank terminal.
        </li>
        <li>
          Good Fills receives only an encrypted cryptographic transaction reference ID confirming payment capture. We never store, log, or have access to your bank account numbers or authorization PINs.
        </li>
        <li>
          Razorpay is certified as a <strong>PCI-DSS Level 1 compliant service provider</strong>, adhering to the highest global banking security standards.
        </li>
      </ul>

      <h2>4. How We Use Your Information</h2>
      <p>
        Your data is used strictly for legitimate operational purposes:
      </p>
      <ol>
        <li>To mill, pack, and prepare your bespoke creations in our Bengaluru kitchen.</li>
        <li>To print the official shipping manifest and courier label for DTDC Domestic Express.</li>
        <li>To transmit transactional notifications via SMS and WhatsApp (order confirmation, dispatch alerts, and DTDC AWB tracking updates).</li>
        <li>To provide customer support and address any inquiries submitted via our Concierge desk.</li>
        <li>To maintain account order history and saved delivery addresses in your Customer Hub.</li>
      </ol>

      <div className={styles.accentBox}>
        <h3 style={{ margin: '0 0 10px', color: 'var(--accent-terracotta)' }}>
          <EyeOff size={18} />
          Our Strict Anti-Spam &amp; Data Ethics Promise
        </h3>
        <ul style={{ margin: 0, paddingLeft: '18px' }}>
          <li>We will <strong>never sell, rent, monetize, or trade</strong> your personal information to third-party marketing brokers or ad networks.</li>
          <li>We will never send promotional spam to your phone number. Mobile contact is strictly reserved for delivery alerts and direct concierge replies.</li>
        </ul>
      </div>

      <h2>5. Trusted Operational Service Providers</h2>
      <p>
        We share your data only with verified operational partners required to run our atelier:
      </p>
      <ul>
        <li>
          <strong>DTDC Domestic Express:</strong> Name, delivery address, and phone number are provided to the courier for doorstep package delivery and delivery confirmation SMS.
        </li>
        <li>
          <strong>Razorpay Software Pvt. Ltd.:</strong> Order financial details for secure UPI payment processing and automated refund settlements.
        </li>
        <li>
          <strong>Google Firebase:</strong> Secure, encrypted cloud authentication tokens for 1-click Google Sign-In and account security.
        </li>
      </ul>

      <h2>6. Data Retention &amp; Customer Rights</h2>
      <p>
        We retain customer order records as required by Indian accounting standards, GST regulations, and food safety traceability mandates.
      </p>
      <p>
        You have the right to:
      </p>
      <ul>
        <li>Access, inspect, or update your saved shipping addresses anytime in your <Link href="/account" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>My Account Hub</Link>.</li>
        <li>Request deletion of your account and registered profile by contacting our Concierge desk.</li>
      </ul>

      <h2>7. Grievance Redressal &amp; Nodal Officer</h2>
      <p>
        In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the details of our Grievance Officer are provided below:
      </p>
      <div className={styles.accentBox} style={{ background: 'var(--bg-subtle)' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--text-primary)' }}>Good Fills Atelier — Grievance &amp; Compliance</p>
        <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>Atelier Location: Bengaluru, Karnataka, India</p>
        <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>Email: <a href="mailto:goodfillsproducts@gmail.com" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>goodfillsproducts@gmail.com</a></p>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Mobile / WhatsApp: <strong>+91 97420 68899</strong> (Mon–Sat, 9 AM – 7 PM IST)</p>
      </div>
    </>
  );
}
