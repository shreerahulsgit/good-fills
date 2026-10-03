import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Globe,
  Truck,
  Scale,
  ShieldCheck,
  MessageCircle,
  PhoneCall,
  Clock,
  Package,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'International Delivery & Global Shipping • Good Fills',
  description:
    'Handcrafted homemade food, nutrition, and skincare shipped worldwide from Bengaluru via DTDC International courier. Transparent weight-based shipping quotes.',
};

export default function InternationalDeliveryPage() {
  const atelierPhone = '9742068899';
  const whatsappUrl = `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(
    'Hello Good Fills! 🌿 I would like to inquire about international delivery outside India. Please share details on courier rates and order placement.'
  )}`;

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', padding: 'var(--space-12) 0 var(--space-20)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Breadcrumb Navigation */}
        <nav style={{ marginBottom: 'var(--space-6)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>International Delivery</span>
        </nav>

        {/* Hero Header */}
        <header style={{ marginBottom: 'var(--space-10)', textAlign: 'left' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(151, 65, 29, 0.08)',
            color: 'var(--accent-terracotta)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '999px',
            marginBottom: 'var(--space-3)',
          }}>
            <Globe size={13} />
            Global Atelier Dispatch
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            margin: '0 0 var(--space-4)',
          }}>
            International Delivery &amp; Worldwide Shipping
          </h1>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '740px',
            margin: 0,
          }}>
            Good Fills prepares every batch fresh to order in our Bengaluru home kitchen. We fulfill deliveries worldwide to customers seeking pure, unadulterated traditional nutrition and skincare.
          </p>
        </header>

        {/* Highlight Action Card */}
        <div style={{
          background: 'linear-gradient(135deg, #FAF6F0 0%, #F4ECE0 100%)',
          border: '1px solid rgba(151, 65, 29, 0.2)',
          borderRadius: '20px',
          padding: 'clamp(24px, 4vw, 36px)',
          marginBottom: 'var(--space-12)',
          boxShadow: '0 4px 20px rgba(34, 24, 19, 0.04)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 10px',
          }}>
            How to Place an International Order
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-6)',
          }}>
            Because international courier tariffs depend heavily on gross parcel weight (including export packaging) and destination customs clearance, our website does not charge automated flat shipping for overseas addresses. Instead, our kitchen coordinates your order directly:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: 'var(--space-6)',
          }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid rgba(151, 65, 29, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-terracotta)', fontSize: '0.82rem', marginBottom: '4px' }}>STEP 01</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '4px' }}>Select Your Products</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Browse our catalog and note your required items and quantities.
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid rgba(151, 65, 29, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-terracotta)', fontSize: '0.82rem', marginBottom: '4px' }}>STEP 02</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '4px' }}>Connect with Kitchen Desk</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                WhatsApp or call us with your delivery address &amp; postal code.
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid rgba(151, 65, 29, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-terracotta)', fontSize: '0.82rem', marginBottom: '4px' }}>STEP 03</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '4px' }}>Exact Quote &amp; Dispatch</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                We weigh the parcel, share exact DTDC courier costs, and send secure payment link.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#128C7E',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: '999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(18, 140, 126, 0.24)',
              }}
            >
              <MessageCircle size={17} />
              <span>Connect on WhatsApp (+91 {atelierPhone})</span>
            </a>

            <a
              href={`tel:+91${atelierPhone}`}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--text-primary)',
                border: '1px solid rgba(151, 65, 29, 0.25)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '12px 22px',
                borderRadius: '999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <PhoneCall size={16} />
              <span>Call Kitchen Directly</span>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <section style={{ marginTop: 'var(--space-12)' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            fontWeight: 400,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
          }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Which countries do you deliver to?
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                We ship to USA, UK, Canada, Australia, UAE, Singapore, Malaysia, and most European countries supported by DTDC International air courier network.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                How long does international transit take?
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                Orders are freshly prepared within 24–48 hours of order confirmation. Air courier delivery typically takes 6–10 business days depending on customs clearance in the destination country.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                How are food items packaged for international flights?
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                All powders, porridge mixes, and food items are heat-sealed in multilayer moisture-barrier pouches and packed with protective cushioning to withstand altitude and transit pressures.
              </p>
            </div>
          </div>
        </section>

        {/* Back to Catalog Link */}
        <div style={{ marginTop: 'var(--space-12)', textAlign: 'center' }}>
          <Link
            href="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--accent-terracotta)',
              textDecoration: 'none',
            }}
          >
            <span>Browse Good Fills Catalog</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
