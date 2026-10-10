'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Phone, Mail, Instagram, MessageCircle, ShieldCheck } from 'lucide-react';

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/console') || pathname?.includes('/order/invoice')) {
    return null;
  }

  const hideCtaBanner = Boolean(
    pathname?.startsWith('/shop') ||
    pathname?.startsWith('/product') ||
    pathname?.startsWith('/order/track') ||
    pathname?.startsWith('/contact-us') ||
    pathname?.startsWith('/account') ||
    pathname?.startsWith('/order/confirmation') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/privacy-policy') ||
    pathname?.startsWith('/terms-of-service') ||
    pathname?.startsWith('/shipping-policy') ||
    pathname?.startsWith('/refund-policy')
  );

  return (
    <footer className={`site-footer ${hideCtaBanner ? 'without-cta' : ''}`} id="footer">
      <div className="container footer-outer-container">
        {!hideCtaBanner && (
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
        )}

        <div className="footer-main-card">
          <div className="footer-card-inner">
            <div className="footer-card-top">
              <div className="footer-brand-pane">
                <div className="footer-logo-row" style={{ marginBottom: 'var(--space-3)' }}>
                  <Link href="/" aria-label="Good Fills Homepage">
                    <img 
                      src="/logo.png" 
                      alt="Good Fills Homemade Products" 
                      className="footer-brand-logo"
                      style={{
                        height: '52px',
                        width: 'auto',
                        maxWidth: '220px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </Link>
                </div>

                <p className="footer-brand-summary">
                  Pure homemade nutrition, baby food, and botanical care made fresh to order in Bengaluru. Prepared with ancestral kitchen recipes and sealed warm for 6 months natural freshness.
                </p>

                <div className="footer-credential-pill">
                  <ShieldCheck size={14} className="credential-icon" />
                  <span>FSSAI Registered Kitchen &bull; Bengaluru, India</span>
                </div>

                <div className="footer-social-icons">
                  <a
                    href="https://wa.me/919742068899"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Chat with WhatsApp Concierge"
                    title="WhatsApp Concierge"
                  >
                    <MessageCircle size={17} strokeWidth={1.8} />
                  </a>

                  <a
                    href="https://www.instagram.com/goodfills2020"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Visit Good Fills on Instagram"
                    title="Instagram @goodfills2020"
                  >
                    <Instagram size={17} strokeWidth={1.8} />
                  </a>

                  <a
                    href="mailto:goodfillsproducts@gmail.com"
                    className="footer-social-btn"
                    aria-label="Email the Bengaluru Atelier"
                    title="Email goodfillsproducts@gmail.com"
                  >
                    <Mail size={17} strokeWidth={1.8} />
                  </a>

                  <a
                    href="tel:+919742068899"
                    className="footer-social-btn"
                    aria-label="Call Good Fills Atelier"
                    title="Call +91 97420 68899"
                  >
                    <Phone size={17} strokeWidth={1.8} />
                  </a>
                </div>
              </div>

              <div className="footer-columns-group">
                <div className="footer-links-col">
                  <h4 className="footer-col-heading">Collections</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/shop" className="footer-nav-link highlight">
                        All Creations
                      </Link>
                    </li>
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
                  </ul>
                </div>

                <div className="footer-links-col">
                  <h4 className="footer-col-heading">The Atelier</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/our-story" className="footer-nav-link">
                        Our Story
                      </Link>
                    </li>
                    <li>
                      <a
                        href="/#process"
                        className="footer-nav-link"
                        onClick={(e) => {
                          if (typeof window !== 'undefined' && window.location.pathname === '/') {
                            e.preventDefault();
                            const el = document.getElementById('process');
                            if (el) {
                              const headerOffset = 110;
                              const elementPosition = el.getBoundingClientRect().top + window.scrollY;
                              window.scrollTo({
                                top: elementPosition - headerOffset,
                                behavior: 'smooth',
                              });
                              window.history.pushState(null, '', '#process');
                              window.dispatchEvent(new CustomEvent('goodfills:reset-process'));
                            }
                          }
                        }}
                      >
                        Craft Journey
                      </a>
                    </li>
                    <li>
                      <a
                        href="/#testimonials"
                        className="footer-nav-link"
                        onClick={(e) => {
                          if (typeof window !== 'undefined' && window.location.pathname === '/') {
                            e.preventDefault();
                            const el = document.getElementById('testimonials');
                            if (el) {
                              const headerOffset = 110;
                              const elementPosition = el.getBoundingClientRect().top + window.scrollY;
                              window.scrollTo({
                                top: elementPosition - headerOffset,
                                behavior: 'smooth',
                              });
                              window.history.pushState(null, '', '#testimonials');
                            }
                          }
                        }}
                      >
                        Patron Reviews
                      </a>
                    </li>
                    <li>
                      <Link href="/shipping-policy#international" className="footer-nav-link">
                        Ship International
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="footer-links-col">
                  <h4 className="footer-col-heading">Patron Care</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/order/track" className="footer-nav-link">
                        Track Your Order
                      </Link>
                    </li>
                    <li>
                      <Link href="/account" className="footer-nav-link">
                        My Account
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact-us" className="footer-nav-link">
                        Contact Atelier
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="footer-links-col">
                  <h4 className="footer-col-heading">Policies &amp; Trust</h4>
                  <ul className="footer-nav-list">
                    <li>
                      <Link href="/shipping-policy" className="footer-nav-link">
                        Shipping &amp; Delivery
                      </Link>
                    </li>
                    <li>
                      <Link href="/refund-policy" className="footer-nav-link">
                        Returns &amp; Replacements
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="footer-nav-link">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms-of-service" className="footer-nav-link">
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-card-bottom">
              <span className="footer-copy-text">
                &copy; {new Date().getFullYear()} Good Fills Bengaluru Atelier. All rights reserved. Handcrafted to order.
              </span>

              <div className="footer-bottom-trust-notes">
                <span className="footer-trust-tag">100% Homemade</span>
                <span className="footer-dot-sep">&bull;</span>
                <span className="footer-trust-tag">Zero Preservatives</span>
                <span className="footer-dot-sep">&bull;</span>
                <span className="footer-trust-tag">FSSAI Certified Kitchen</span>
                <span className="footer-dot-sep">&bull;</span>
                <span className="footer-trust-tag">Worldwide Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-giant-watermark" aria-hidden="true">
          <img
            src="/logo.png"
            alt="Good Fills Logo"
            className="footer-giant-watermark-logo"
          />
        </div>
      </div>
    </footer>
  );
}