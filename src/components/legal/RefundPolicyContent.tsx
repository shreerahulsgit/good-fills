'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, CheckCircle, PackageCheck, HelpCircle } from 'lucide-react';
import styles from './PolicyLayout.module.css';

export function RefundPolicyContent() {
  return (
    <>
      {/* Primary Highlight Banner */}
      <div className={styles.highlightNotice}>
        <div className={styles.noticeTitle}>
          <ShieldAlert size={16} />
          <span>Core Policy Notice · Strictly Non-Returnable &amp; Non-Cancellable</span>
        </div>
        <p className={styles.noticeText}>
          Because every Good Fills creation is freshly roasted, sprouted, and stone-milled only after your order is confirmed, <strong>all orders are final, non-cancellable, and strictly non-returnable</strong> once payment is completed.
        </p>
      </div>

      <h2>1. Made-to-Order &amp; Cancellation Policy</h2>
      <p>
        Unlike industrial FMCG brands that store mass-manufactured inventory in warehouses for months, Good Fills operates as an artisanal micro-batch kitchen atelier in Bengaluru.
      </p>
      <p>
        The moment your order and UPI payment are confirmed through Razorpay:
      </p>
      <ul>
        <li>Certified organic grains, pulses, and cold-pressed botanical oils are immediately drawn from farm storage.</li>
        <li>Traditional culinary processes—such as 24-hour soaking, sprouting, shade-drying, and slow stone-milling—are queued specifically for your batch.</li>
        <li>Artisanal labor and kitchen capacity are irreversibly committed.</li>
      </ul>
      <p>
        Consequently, <strong>we do not offer a cancellation window</strong>. Once an order is placed and confirmed through our checkout, it enters active preparation and cannot be cancelled, recalled, or refunded for change of mind.
      </p>

      <h2>2. Strictly Non-Returnable &amp; Non-Exchangeable</h2>
      <p>
        Under Indian Food Safety standards (FSSAI) and international hygiene guidelines for infant nutrition and personal wellness care:
      </p>
      <ul>
        <li>
          <strong>Food &amp; Infant Nutrition:</strong> Products such as our Sprouted Ragi Porridge, Traditional Sathumaavu, and Kids Nutrition Powder cannot be restocked, resold, or re-handled once they leave our kitchen facility.
        </li>
        <li>
          <strong>Skin &amp; Bath Formulations:</strong> Due to hygiene and tamper-safety reasons, cold-pressed body oils, baby bath powders, and herbal formulations are strictly non-returnable.
        </li>
        <li>
          <strong>All sales are final.</strong> We do not accept returns or exchanges for taste preferences, texture expectations, or incorrect product selection by the buyer.
        </li>
      </ul>

      <h2>3. Transit Damage, Seal Tampering &amp; Spillage Guarantee</h2>
      <p id="damages">
        While our creations are strictly non-returnable, we take 100% responsibility for ensuring your parcel reaches your doorstep in pristine condition.
      </p>
      <p>
        Every consignment is sealed in an airtight, multi-layer barrier pouch and packaged in reinforced protective outer boxing before handover to DTDC Domestic Express.
      </p>

      <div className={styles.accentBox}>
        <h3 style={{ margin: '0 0 10px', color: 'var(--accent-terracotta)' }}>
          <PackageCheck size={18} />
          What Qualifies for an Immediate Replacement or Refund?
        </h3>
        <p style={{ margin: '0 0 12px' }}>
          We will promptly replace or refund your order under the following three conditions:
        </p>
        <ul style={{ margin: '0 0 0 18px', padding: 0 }}>
          <li>
            <strong>Physical Transit Damage:</strong> The outer shipping carton is crushed, torn open, or soaked during courier transport.
          </li>
          <li>
            <strong>Tampered Inner Seal:</strong> The airtight barrier pouch seal is broken, punctured, or compromised upon delivery.
          </li>
          <li>
            <strong>Incorrect Item Delivered:</strong> The item delivered does not match your order confirmation receipt.
          </li>
        </ul>
      </div>

      <h2>4. Step-by-Step Reporting Protocol (Within 24 Hours)</h2>
      <p>
        To ensure prompt resolution with our courier partner, please follow this protocol:
      </p>
      <ol>
        <li>
          <strong>Do Not Discard Packaging:</strong> Retain the original shipping box, the courier consignment label (showing the DTDC AWB number), and the damaged product pouch.
        </li>
        <li>
          <strong>Capture Photo / Video Evidence:</strong> Take clear photographs or a short video showing:
          <ul>
            <li>The outer shipping box and the DTDC shipping label.</li>
            <li>The damaged area, torn seal, or spilled product.</li>
          </ul>
        </li>
        <li>
          <strong>Contact Our Concierge within 24 Hours:</strong> Send the photos along with your <strong>Order ID (e.g. ORD-3595)</strong> via:
          <ul>
            <li>
              <strong>WhatsApp:</strong>{' '}
              <a
                href="https://wa.me/919742068899?text=Hello%20Good%20Fills,%20I%20received%20a%20damaged%20package."
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}
              >
                +91 97420 68899
              </a>
            </li>
            <li>
              <strong>Email:</strong>{' '}
              <a
                href="mailto:goodfillsproducts@gmail.com?subject=Damaged%20Order%20Report"
                style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}
              >
                goodfillsproducts@gmail.com
              </a>
            </li>
          </ul>
        </li>
      </ol>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        *Please note: Claims submitted beyond 24 hours of delivery cannot be investigated with courier logs and will not be eligible for replacement or compensation.
      </p>

      <h2>5. Resolution &amp; Refund Processing Timeline</h2>
      <p>
        Upon receiving your report and photos, our team reviews the case within <strong>4 to 6 business hours</strong>.
      </p>
      <ul>
        <li>
          <strong>Priority Replacement (Recommended):</strong> We will prepare a fresh batch in our Bengaluru kitchen and dispatch it via express courier at zero extra charge within 24 hours.
        </li>
        <li>
          <strong>Refund to Original Payment Method:</strong> If you prefer a refund rather than a replacement, an immediate 100% refund is initiated through Razorpay back to your original UPI bank account.
        </li>
        <li>
          <strong>Banking Turnaround:</strong> Razorpay settlements typically reflect in your bank account within <strong>5 to 7 business days</strong> depending on your issuing bank.
        </li>
      </ul>

      <h2>6. Inaccurate Delivery Address or Refused Deliveries</h2>
      <p>
        Because our products are perishable and prepared bespoke:
      </p>
      <ul>
        <li>
          The customer is solely responsible for providing complete and accurate shipping information (including street address, landmarks, contact mobile number, and 6-digit pincode).
        </li>
        <li>
          If a consignment is returned to our Bengaluru atelier due to an incorrect address, recipient unavailability, or refusal to accept delivery from the DTDC delivery agent, <strong>no refund will be issued</strong>. Re-dispatch will incur standard DTDC courier charges.
        </li>
      </ul>
    </>
  );
}
