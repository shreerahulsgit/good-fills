'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Phone, Mail, Instagram, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-outer-container">
        {/* 1. Top Rounded Black CTA Banner (As seen in reference) */}
        <div className="footer-cta-card">
          <div className="footer-cta-content">
            <span className="footer-cta-eyebrow">MADE FRESH IN BENGALURU</span>
            <h2 className="footer-cta-title">
              Ready to taste authentic traditional care?
            </h2>
            <p className="footer-cta-desc">
              Every creation is roasted, sprouted, and milled only after your order is confirmed. Zero warehouse dust, strictly zero preservatives.
            </p>
            <div className="footer-cta-action">
              <Link href="/shop" className="footer-cta-btn">
                <span>Explore All Creations</span>
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Floating Rounded Main Footer Card (As seen in reference) */}
        <div className="footer-main-card">
          <div className="footer-card-inner">
            {/* Top Grid: Brand & Description (Left) + 3 Link Columns (Right) */}
            <div className="footer-card-top">
              {/* Brand Column */}
              <div className="footer-brand-pane">
                <div className="footer-logo-row" style={{ marginBottom: 'var(--space-4)' }}>
                  <img 
                    src="/logo.png" 
                    alt="Good Fills Homemade Products" 
                    style={{
                      height: '52px',
                      width: 'auto',
                      maxWidth: '220px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>

                <p className="footer-brand-summary">
                  Good Fills crafts artisanal food, nutrition, skincare, and bath essentials made to order in Bengaluru. Prepared with ancestral kitchen methods and sealed warm for 6-month natural freshness.
                </p>

                {/* Social & Contact Icons */}
                <div className="footer-social-icons">
                  <a
                    href="https://wa.me/919742068899"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Chat on WhatsApp"
                  >
                    <MessageCircle size={18} strokeWidth={1.8} />
                  </a>

                  <a
                    href="https://www.instagram.com/goodfills2020"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Visit Instagram"
                  >
                    <Instagram size={18} strokeWidth={1.8} />
                  </a>

                  <a
                    href="mailto:goodfillsproducts@gmail.com"
                    className="footer-social-btn"
                    aria-label="Send an email"
                  >
                    <Mail size={18} strokeWidth={1.8} />
                  </a>

                  <a
                    href="tel:+919742068899"
                    className="footer-social-btn"
                    aria-label="Call Good Fills"
                  >
                    <Phone size={18} strokeWidth={1.8} />
                  </a>
                </div>
              </div>

              {/* 3 Link Columns */}
              <div className="footer-columns-group">
                {/* Column 1: Creations */}
                <div className="footer-links-col">
                  <h4 className="footer-col-heading">Creations</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/shop/baby-kids" className="footer-nav-link">
                        Baby &amp; Kids
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/nutrition-wellness" className="footer-nav-link">
                        Nutrition &amp; Wellness
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/skin-bath" className="footer-nav-link">
                        Skin &amp; Bath
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop/pantry-beverages" className="footer-nav-link">
                        Pantry &amp; Beverages
                      </Link>
                    </li>
                    <li>
                      <Link href="/shop" className="footer-nav-link highlight">
                        Full Catalog (13)
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: The Atelier */}
                <div className="footer-links-col">
                  <h4 className="footer-col-heading">The Atelier</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/about" className="footer-nav-link">
                        Our Story
                      </Link>
                    </li>
                    <li>
                      <a href="/#process" className="footer-nav-link">
                        Craft Journey
                      </a>
                    </li>
                    <li>
                      <Link href="/track" className="footer-nav-link">
                        Order Tracking
                      </Link>
                    </li>
                    <li>
                      <Link href="/account" className="footer-nav-link">
                        My Account
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Trust & Company */}
                <div className="footer-links-col">
                  <h4 className="footer-col-heading">Trust &amp; Care</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <span className="footer-fssai-text">
                        <ShieldCheck size={14} className="fssai-icon" />
                        FSSAI Registered
                      </span>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/919742068899"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-nav-link"
                      >
                        WhatsApp Support
                      </a>
                    </li>
                    <li>
                      <Link href="/refund-policy#damages" className="footer-nav-link">
                        Damage Guarantee
                      </Link>
                    </li>
                    <li>
                      <span className="footer-mono-note">
                        Bengaluru, India
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Row inside card */}
            <div className="footer-card-bottom">
              <span className="footer-copy-text">
                &copy; {new Date().getFullYear()} Good Fills. All rights reserved. Handcrafted to order.
              </span>

              <div className="footer-legal-row">
                <Link href="/privacy" className="footer-legal-anchor">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="footer-legal-anchor">
                  Terms of Service
                </Link>
                <Link href="/shipping-policy" className="footer-legal-anchor">
                  Shipping Policy
                </Link>
                <Link href="/refund-policy" className="footer-legal-anchor">
                  Returns &amp; Replacement
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Massive Watermark Wordmark Cropped at Bottom (As seen in reference) */}
        <div className="footer-giant-watermark" aria-hidden="true">
          GOOD FILLS
        </div>
      </div>
    </footer>
  );
}
