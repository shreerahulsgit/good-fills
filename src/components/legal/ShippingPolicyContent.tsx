'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  Globe,
  Clock,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  Plane,
} from 'lucide-react';
import styles from './PolicyLayout.module.css';

export function ShippingPolicyContent() {
  const atelierPhone = '9742068899';
  const internationalWhatsappUrl = `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(
    'Hello Good Fills! 🌿 I would like to place an order for delivery outside India. Please share details on courier rates and order placement.'
  )}`;

  return (
    <>
      {/* Quick Jump Section Switcher */}
      <nav className={styles.sectionSwitcher} aria-label="Shipping policy sections">
        <a href="#domestic" className={styles.sectionPill}>
          <Truck size={14} style={{ color: 'var(--accent-terracotta)' }} />
          <span>Section 1: Domestic Delivery (Pan-India)</span>
        </a>
        <a href="#international" className={styles.sectionPill}>
          <Globe size={14} style={{ color: 'var(--accent-terracotta)' }} />
          <span>Section 2: International Delivery (Worldwide)</span>
        </a>
      </nav>

      {/* =====================================================================
          SECTION 1: DOMESTIC SHIPPING (PAN-INDIA)
          ===================================================================== */}
      <section id="domestic">
        <div className={styles.sectionBadgeRow}>
          <span className={styles.sectionBadge}>Section 1 · Domestic</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Pan-India Express Doorstep Logistics
          </span>
        </div>

        <div className={styles.highlightNotice}>
          <div className={styles.noticeTitle}>
            <Clock size={16} />
            <span>Made-to-Order Dispatch Guarantee · Fresh from Bengaluru</span>
          </div>
          <p className={styles.noticeText}>
            Good Fills never stores pre-packed food powder in warehouse distribution hubs. Every batch is soaked, sprouted, and stone-milled in Bengaluru within <strong>24 to 48 hours</strong> of order placement, sealed warm for 6-month natural freshness, and dispatched via <strong>DTDC Domestic Express</strong>.
          </p>
        </div>

        <h2>1.1 The Freshness Cycle: Kitchen Preparation Timelines</h2>
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
            <strong>Airtight Barrier Sealing (Day 1–2):</strong> The finished powder or botanical blend is sealed in a multi-layered food-grade foil pouch with zero oxygen exposure.
          </li>
          <li>
            <strong>Handover to Courier Partner:</strong> Handed over to our express courier partner (DTDC) with an active consignment AWB tracking number.
          </li>
        </ul>

        <h2>1.2 Domestic Courier Logistics &amp; Estimated Transit Times</h2>
        <p>
          We ship pan-India to all serviceable postal pincodes in partnership with <strong>DTDC Express Cargo</strong>. Standard delivery transit times (after kitchen dispatch):
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
                <td>Local Express</td>
              </tr>
              <tr>
                <td><strong>Karnataka State &amp; Neighboring Capitals (Chennai, Hyderabad)</strong></td>
                <td>2 – 3 Business Days</td>
                <td>Regional Express</td>
              </tr>
              <tr>
                <td><strong>Tier 1 Indian Metros (Mumbai, Delhi NCR, Kolkata, Pune)</strong></td>
                <td>3 – 4 Business Days</td>
                <td>Priority Air Express</td>
              </tr>
              <tr>
                <td><strong>Tier 2 &amp; Tier 3 Cities &amp; Rest of India</strong></td>
                <td>4 – 6 Business Days</td>
                <td>Standard Domestic Air / Surface</td>
              </tr>
              <tr>
                <td><strong>North-East, Jammu &amp; Kashmir, Remote Outposts</strong></td>
                <td>5 – 8 Business Days</td>
                <td>Regional Remote Coverage</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          *Transit estimates represent business days calculated from the date of courier pickup. Delays caused by force majeure, severe weather, or regional transport restrictions are outside our direct control.
        </p>

        <h2>1.3 Authoritative Weight-Based Fee Schedule</h2>
        <p>
          To ensure fair and transparent pricing, courier freight charges are calculated strictly based on the net weight of the creations in your bag. Our server computes shipping authoritatively at checkout:
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

        <h2>1.4 Live Tracking &amp; Delivery Notifications</h2>
        <p>
          Good Fills provides end-to-end transparency:
        </p>
        <ul>
          <li>
            <strong>Consignment AWB Number:</strong> Once your package is scanned at the DTDC Bengaluru sorting hub, you receive an automated SMS with your consignment tracking number.
          </li>
          <li>
            <strong>Online Tracking Hub:</strong> You can track your package in real-time at any time on our{' '}
            <Link href="/track-order" style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>
              Live Order Tracking Console (/track-order)
            </Link>{' '}
            using your Order ID (e.g. <code>ORD-3567</code>) or registered 10-digit mobile number.
          </li>
          <li>
            <strong>Delivery Day Alert:</strong> On the day of delivery, DTDC sends an automated "Out for Delivery" SMS alert to your phone.
          </li>
        </ul>

        <h2>1.5 Packaging Integrity &amp; Damage Inspection on Arrival</h2>
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
      </section>

      {/* =====================================================================
          SECTION DIVIDER
          ===================================================================== */}
      <div className={styles.sectionDividerBlock}>
        <div className={styles.sectionBadgeRow}>
          <span className={styles.sectionBadge}>Section 2 · International</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Worldwide Express Air Cargo
          </span>
        </div>
      </div>

      {/* =====================================================================
          SECTION 2: INTERNATIONAL DELIVERY (WORLDWIDE)
          ===================================================================== */}
      <section id="international">
        <div className={styles.highlightNotice}>
          <div className={styles.noticeTitle}>
            <Plane size={16} />
            <span>Worldwide Air Cargo Guarantee · Dispatched from Bengaluru</span>
          </div>
          <p className={styles.noticeText}>
            We ship our handcrafted baby cereals, traditional health mixes, and botanical care powders worldwide from Bengaluru via <strong>DTDC International Air Express</strong>. Transparent weight-based pricing, door-to-door flight tracking, and export-grade barrier packaging.
          </p>
        </div>

        <h2>2.1 Countries &amp; Destinations We Serve</h2>
        <p>
          Good Fills partners with <strong>DTDC International Air Express</strong> to deliver freshly made-to-order creations to Indian families and traditional care lovers worldwide. We currently serve:
        </p>
        <ul>
          <li><strong>North America:</strong> United States (all 50 states), Canada</li>
          <li><strong>Middle East &amp; Gulf (GCC):</strong> UAE (Dubai, Abu Dhabi, Sharjah), Saudi Arabia, Qatar, Oman, Kuwait, Bahrain</li>
          <li><strong>Europe &amp; UK:</strong> United Kingdom, Germany, Netherlands, France, Ireland, Switzerland, Sweden</li>
          <li><strong>Asia-Pacific:</strong> Singapore, Malaysia, Australia, New Zealand</li>
        </ul>

        <h2>2.2 How International Orders Work (Step-by-Step)</h2>
        <ol>
          <li>
            <strong>Choose Your Items:</strong> Browse our online catalog and decide which creations and pack sizes you need.
          </li>
          <li>
            <strong>Connect with Our Kitchen Desk:</strong> Reach our concierge on WhatsApp at <strong>+91 {atelierPhone}</strong> with your product list and international destination address (City, Postal Code, Country).
          </li>
          <li>
            <strong>Live Air Cargo Quote:</strong> We calculate gross volumetric consignment weight and provide an all-inclusive shipping quote via priority international air express.
          </li>
          <li>
            <strong>Fresh Milling &amp; Dispatch:</strong> Upon payment confirmation (via International Card, UPI, or Bank Transfer), your batch is soaked, sprouted, freshly milled, sealed in export-grade barrier pouches, and dispatched within 24–48 hours.
          </li>
          <li>
            <strong>Global Air Tracking:</strong> You receive an official International Air Waybill (AWB) tracking number with real-time flight telemetry to your doorstep.
          </li>
        </ol>

        <h2>2.3 Transit Times by Region</h2>
        <p>
          All international parcels depart from Kempegowda International Airport (BLR), Bengaluru:
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.policyTable}>
            <thead>
              <tr>
                <th>Global Region</th>
                <th>Estimated Flight &amp; Delivery Transit</th>
                <th>Carrier</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Middle East / UAE</strong></td>
                <td>3 to 5 Business Days</td>
                <td>Priority Air Cargo</td>
              </tr>
              <tr>
                <td><strong>United Kingdom &amp; Europe</strong></td>
                <td>4 to 7 Business Days</td>
                <td>Priority Air Cargo</td>
              </tr>
              <tr>
                <td><strong>USA &amp; Canada</strong></td>
                <td>5 to 8 Business Days</td>
                <td>Priority Air Cargo</td>
              </tr>
              <tr>
                <td><strong>Singapore &amp; Malaysia</strong></td>
                <td>3 to 5 Business Days</td>
                <td>Priority Air Cargo</td>
              </tr>
              <tr>
                <td><strong>Australia &amp; New Zealand</strong></td>
                <td>6 to 9 Business Days</td>
                <td>Priority Air Cargo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>2.4 Packaging Standards for Overseas Transit</h2>
        <p>
          Artisanal natural foods require uncompromising moisture and aroma protection over thousands of miles. Every international parcel features:
        </p>
        <ul>
          <li><strong>Triple-Layer High-Barrier Foil Pouches:</strong> Hermetically heat-sealed to prevent humidity, oxidation, or aroma loss across flight temperature changes.</li>
          <li><strong>Food-Grade Outer Cushioning:</strong> Corrugated boxes lined with protective bubble padding to withstand international cargo handling.</li>
          <li><strong>Export Documentation:</strong> Compliant commercial invoices, FSSAI certificates, non-hazardous declaration, and ingredients breakdown attached for customs clearance.</li>
        </ul>

        <h2>2.5 Customs, Import Duties &amp; Taxes</h2>
        <p>
          Customs regulations vary across nations. Most personal consignments of dry grain powders and bath botanicals enter duty-free under standard personal-use exemptions. However, any local import duties, VAT, or clearance charges levied by the destination country&apos;s customs authorities remain the responsibility of the recipient.
        </p>

        {/* Dedicated International Concierge Help Box */}
        <div className={styles.intlSupportCard}>
          <h3 className={styles.intlSupportTitle}>Ready to Place an Overseas Order?</h3>
          <p className={styles.intlSupportText}>
            Connect directly with our Bengaluru kitchen team at <strong>+91 {atelierPhone}</strong> on WhatsApp. We will confirm item availability, compute gross weight, and share live air courier freight rates.
          </p>

          <div className={styles.intlActions}>
            <a
              href={internationalWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <MessageCircle size={15} />
              <span>WhatsApp International Desk</span>
            </a>

            <a
              href={`tel:+91${atelierPhone}`}
              className={styles.contactPageBtn}
            >
              <PhoneCall size={15} />
              <span>Call Kitchen (+91 {atelierPhone})</span>
            </a>

            <Link href="/shop" className={styles.contactPageBtn}>
              <span>Browse Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
