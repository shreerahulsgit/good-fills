'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Phone, Mail, MessageCircle, ShieldCheck } from 'lucide-react';

function InstagramIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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
                    <InstagramIcon size={16} />
                  </a>

                  <a
                    href="https://www.facebook.com/share/1FMwVm7H2b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Visit Good Fills on Facebook"
                    title="Facebook Good Fills"
                  >
                    <FacebookIcon size={16} />
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