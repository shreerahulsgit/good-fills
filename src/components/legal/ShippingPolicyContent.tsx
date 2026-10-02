'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import styles from './PolicyLayout.module.css';

export function ShippingPolicyContent() {
  return (
    <>
      <div className={styles.highlightNotice}>
        <div className={styles.noticeTitle}>
          <Clock size={16} />
          <span>Made-to-Order Dispatch Guarantee · Fresh from Bengaluru</span>
        </div>
        <p className={styles.noticeText}>
          Good Fills never stores pre-packed food powder in warehouse distribution hubs. Every batch is soaked, sprouted, and stone-milled in Bengaluru within <strong>24 to 48 hours</strong> of order placement, sealed warm for 6-month natural freshness, and dispatched via <strong>DTDC Domestic Express</strong>.
        </p>
      </div>

      <h2>1. The Freshness Cycle: Kitchen Preparation Timelines</h2>
      <p>
        Because we adhere to ancestral preparation methods without industrial chemical stabilizers or artificial preservatives:
      </p>
      <ul>
        <li>
          <strong>Order Confirmation &amp; Queueing (Day 0):</strong> Your order is recorded, and high-purity pulses and grains are scheduled for washing and soaking.
        </li>
        <li>
          <strong>Sprouting, Roasting &amp; Stone-Milling (Day 1):</strong> Grains are germinated to unlock bio-available micronutrients, gently roasted, and slow-milled on traditional granite mills to preserve essential fatty acids and aromatic vitality.
        </li>
        <li>
          <strong>Airtight Barrier Sealing (Day 1–2):</strong> The finished powder or botanical oil is sealed in a multi-layered food-grade foil pouch with zero oxygen exposure.
        </li>
        <li>
          <strong>Handover to DTDC Express:</strong> Handed over to DTDC domestic express courier with an active consignment AWB tracking number.
        </li>
      </ul>

      <h2>2. Domestic Courier Logistics &amp; Estimated Transit Times</h2>
      <p>
        We ship pan-India to all serviceable postal pincodes serviced by <strong>DTDC Express Cargo</strong>. Standard delivery transit times (after kitchen dispatch):
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.policyTable}>
          <thead>
            <tr>
              <th>Destination Region</th>
              <th>Estimated Transit Time</th>
              <th>Service Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Bengaluru &amp; Surrounds</strong></td>
              <td>1 – 2 Business Days</td>
              <td>DTDC Local Express</td>
            </tr>
            <tr>
              <td><strong>Karnataka State &amp; Neighboring Capitals (Chennai, Hyderabad)</strong></td>
              <td>2 – 3 Business Days</td>
              <td>DTDC Regional Express</td>
            </tr>
            <tr>
              <td><strong>Tier 1 Indian Metros (Mumbai, Delhi NCR, Kolkata, Pune)</strong></td>
              <td>3 – 4 Business Days</td>
              <td>DTDC Domestic Air / Express</td>
            </tr>
            <tr>
              <td><strong>Tier 2 &amp; Tier 3 Cities &amp; Rest of India</strong></td>
              <td>4 – 6 Business Days</td>
              <td>DTDC Domestic Surface / Air</td>
            </tr>
            <tr>
              <td><strong>North-East, Jammu &amp; Kashmir, Remote Outposts</strong></td>
              <td>5 – 8 Business Days</td>
              <td>DTDC Regional Out-of-Delivery Area</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        *Please note that transit estimates are business days calculated from the date of DTDC courier pickup. Delays caused by force majeure, severe weather, or state transport lockdowns are outside our direct control.
      </p>

      <h2>3. Weight-Based Shipping Fee Schedule</h2>
      <p>
        To ensure fair and transparent pricing, courier freight charges are calculated strictly based on the net weight of the creations in your bag. Our server computes shipping authoritative at checkout:
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.policyTable}>
          <thead>
            <tr>
              <th>Total Consignment Weight</th>
              <th>Courier Shipping Charge</th>
              <th>Packaging Specs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>0 g – 500 g</strong></td>
              <td>₹100</td>
              <td>Padded protective box / tamper-proof bag</td>
            </tr>
            <tr>
              <td><strong>501 g – 1,000 g (1 kg)</strong></td>
              <td>₹200</td>
              <td>Reinforced corrugated shipper carton</td>
            </tr>
            <tr>
              <td><strong>1,001 g – 2,000 g (2 kg)</strong></td>
              <td>₹400</td>
              <td>Double-walled transit carton</td>
            </tr>
            <tr>
              <td><strong>2,001 g – 3,000 g (3 kg)</strong></td>
              <td>₹600</td>
              <td>Heavy-duty reinforced shipping carton</td>
            </tr>
            <tr>
              <td><strong>Above 3,000 g (&gt;3 kg)</strong></td>
              <td>₹600 + ₹200 per additional 1 kg</td>
              <td>Palletized / multiple master cartons</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Live Tracking &amp; Delivery Notifications</h2>
      <p>
        Good Fills provides end-to-end transparency:
      </p>
      <ul>
        <li>
          <strong>Consignment AWB Number:</strong> Once your package is scanned at the DTDC Bengaluru sorting hub, you receive an automated SMS with your consignment tracking number.
        </li>
        <li>
          <strong>Online Tracking Hub:</strong> You can track your package in real-time at any time on our{' '}
          <Link href="/track" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>
            Live Order Tracking Console (/track)
          </Link>{' '}
          using your Order ID (e.g. <code>ORD-3595</code>) or registered 10-digit mobile number.
        </li>
        <li>
          <strong>Delivery Day Alert:</strong> On the day of delivery, DTDC sends an automated "Out for Delivery" SMS alert to your phone.
        </li>
      </ul>

      <h2>5. Packaging Integrity &amp; Damage Inspection on Arrival</h2>
      <p id="damages">
        Every Good Fills creation is packaged in high-barrier, moisture-resistant pouches and sealed with a tamper-evident seal.
      </p>
      <ul>
        <li>
          <strong>Check the Exterior Seal:</strong> Before accepting delivery from the courier executive, ensure the outer carton and packaging tape are untampered.
        </li>
        <li>
          <strong>Tampered Parcel:</strong> If the outer box appears heavily crushed, torn, or wet, please refuse delivery and immediately message us on WhatsApp with photos.
        </li>
        <li>
          For complete details on receiving a free replacement or refund for damaged shipments, please review our{' '}
          <Link href="/refund-policy#damages" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>
            Returns &amp; Replacement Policy
          </Link>.
        </li>
      </ul>
    </>
  );
}
