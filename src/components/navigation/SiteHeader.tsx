'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { CATEGORIES } from '@/data/products';
import { SearchModal } from '@/components/navigation/SearchModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartToastNotification } from '@/components/cart/CartToastNotification';
import { InternationalDeliveryModal } from '@/components/common/InternationalDeliveryModal';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Package,
  MapPin,
  ShieldCheck,
  LogOut,
  Truck,
  MessageCircle,
  Sparkles,
  Globe,
} from 'lucide-react';
import styles from './SiteHeader.module.css';

const drawerEase = [0.16, 1, 0.3, 1] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { currentUser, orders, logout } = useCustomerAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('gf_announcement_dismissed') === 'true') {
        setIsAnnouncementDismissed(true);
        return;
      }
    } catch {}

    // Automatically hide international delivery banner after 10 seconds
    const timer = setTimeout(() => {
      setIsAnnouncementDismissed(true);
      try {
        sessionStorage.setItem('gf_announcement_dismissed', 'true');
      } catch {}
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismissAnnouncement = () => {
    setIsAnnouncementDismissed(true);
    try {
      sessionStorage.setItem('gf_announcement_dismissed', 'true');
    } catch {}
  };

  const shopDropdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle elevation and backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsShopDropdownOpen(false);
    setIsAccountDropdownOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile/tablet drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown hover helpers with debounce to prevent accidental flicker
  const handleShopMouseEnter = useCallback(() => {
    if (shopDropdownTimerRef.current) clearTimeout(shopDropdownTimerRef.current);
    setIsShopDropdownOpen(true);
  }, []);

  const handleShopMouseLeave = useCallback(() => {
    shopDropdownTimerRef.current = setTimeout(() => {
      setIsShopDropdownOpen(false);
    }, 150);
  }, []);

  const isCheckoutPage = pathname === '/checkout';
  const isHome = pathname === '/';

  const handleCartClick = (e: React.MouseEvent) => {
    if (isCheckoutPage) {
      e.preventDefault();
      // On the checkout page, clicking the bag button should not open the overlapping bag drawer.
      // Instead, smoothly scroll to the order summary ledger on the page.
      const summaryEl =
        document.querySelector('[class*="summaryDeck"]') ||
        document.querySelector('aside');
      if (summaryEl) {
        summaryEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }
    openCart();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'GF';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getFirstName = (name?: string) => {
    if (!name) return 'Customer';
    return name.trim().split(/\s+/)[0];
  };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/console') || pathname?.includes('/invoice')) {
    return null;
  }

  return (
    <>
      {/* --------------------------------------------------------
          MAIN STICKY HEADER
          -------------------------------------------------------- */}
      <header
        id="master-nav"
        className={`${styles.headerRoot} ${isScrolled ? styles.headerScrolled : ''} ${isHome ? styles.headerHome : ''}`}
      >
        {/* Top Announcement Bar — International Delivery */}
        <AnimatePresence>
          {!isAnnouncementDismissed && (
            <motion.aside
              initial={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.45, ease: drawerEase }}
              style={{ overflow: 'hidden' }}
              className={styles.announcementBar}
              aria-label="International shipping announcement"
            >
              <div className={styles.announcementContainer}>
                <span className={styles.announcementDesktop}>
                  ✈️ <strong>International Delivery Available</strong> — Fast, tracked courier delivery worldwide.{' '}
                  <Link
                    href="/shipping-policy#international"
                    className={styles.announcementLink}
                  >
                    Learn more &amp; order &rarr;
                  </Link>
                </span>
                <span className={styles.announcementMobile}>
                  ✈️ <strong>Worldwide Delivery</strong> —{' '}
                  <Link
                    href="/shipping-policy#international"
                    className={styles.announcementLink}
                  >
                    Order &rarr;
                  </Link>
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismissAnnouncement}
                className={styles.announcementCloseBtn}
                aria-label="Dismiss announcement"
                title="Close announcement"
              >
                <X size={14} />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className={styles.headerContainer}>
          {/* Mobile & Tablet Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            className={styles.hamburgerBtn}
          >
            <Menu size={20} />
          </button>

          {/* Brand Logo (Center on mobile/tablet, Left on desktop) */}
          <Link
            href="/"
            className={styles.brandLink}
            aria-label="Good Fills Homepage"
          >
            <img
              src="/logo.png"
              alt="Good Fills Homemade Products"
              className={styles.brandLogo}
            />
          </Link>

          {/* Desktop Navigation Links (> 1040px) */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            {/* Shop with Interactive Mega-Menu */}
            <div
              className={styles.dropdownWrapper}
              onMouseEnter={handleShopMouseEnter}
              onMouseLeave={handleShopMouseLeave}
            >
              <Link
                href="/shop"
                className={`${styles.dropdownTrigger} ${
                  pathname.startsWith('/shop') ? styles.dropdownTriggerActive : ''
                }`}
              >
                <span>Shop</span>
                <ChevronDown
                  size={14}
                  className={`${styles.chevronIcon} ${
                    isShopDropdownOpen ? styles.chevronRotated : ''
                  }`}
                />
              </Link>

              {/* Mega-Menu Dropdown Panel */}
              <AnimatePresence>
                {isShopDropdownOpen && (
                  <motion.div
                    className={styles.megaMenuPanel}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16, ease: drawerEase }}
                  >
                    <div className={styles.megaMenuGrid}>
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop/${cat.id}`}
                          className={styles.megaMenuItem}
                          onClick={() => setIsShopDropdownOpen(false)}
                        >
                          <span className={styles.megaMenuTitle}>
                            {cat.name}
                            <ArrowRight size={13} style={{ opacity: 0.5 }} />
                          </span>
                          <span className={styles.megaMenuDesc}>{cat.tagline}</span>
                        </Link>
                      ))}
                    </div>

                    <div className={styles.megaMenuFooter}>
                      <span className={styles.megaMenuBadge}>
                        13 catalog products · Freshly made to order
                      </span>
                      <Link
                        href="/shop"
                        className={styles.megaMenuViewAll}
                        onClick={() => setIsShopDropdownOpen(false)}
                      >
                        <span>View All Products</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/track-order"
              className={`${styles.navLink} ${
                pathname.startsWith('/track-order') ? styles.navLinkActive : ''
              }`}
            >
              <Truck size={14} style={{ opacity: 0.75 }} />
              <span>Track Order</span>
            </Link>

            <Link
              href="/our-story"
              className={`${styles.navLink} ${
                pathname === '/our-story' ? styles.navLinkActive : ''
              }`}
            >
              Our Story
            </Link>

            <Link
              href="/contact-us"
              className={`${styles.navLink} ${
                pathname === '/contact-us' ? styles.navLinkActive : ''
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons & Controls */}
          <div className={styles.actionsRow}>
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search store products"
              className={styles.iconBtn}
            >
              <Search size={19} />
            </button>

            {/* Desktop User Account Hub (> 1040px only) */}
            {currentUser ? (
              <div
                ref={accountDropdownRef}
                className={styles.dropdownWrapper}
                onMouseEnter={() => setIsAccountDropdownOpen(true)}
                onMouseLeave={() => setIsAccountDropdownOpen(false)}
              >
                <Link
                  href="/account"
                  className={`${styles.patronChip} ${
                    isAccountDropdownOpen ? styles.patronChipActive : ''
                  }`}
                  aria-label="My Account"
                >
                  <span className={styles.patronAvatar}>
                    {getInitials(currentUser.name)}
                  </span>
                  <span className={styles.patronName}>
                    Hi, {getFirstName(currentUser.name)}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`${styles.chevronIcon} ${
                      isAccountDropdownOpen ? styles.chevronRotated : ''
                    }`}
                  />
                </Link>

                <AnimatePresence>
                  {isAccountDropdownOpen && (
                    <motion.div
                      className={styles.patronDropdown}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={styles.patronDropdownHeader}>
                        <div className={styles.patronDropdownName}>
                          {currentUser.name}
                        </div>
                        <div className={styles.patronDropdownVerified}>
                          <ShieldCheck size={13} />
                          <span>
                            {currentUser.email ||
                              (currentUser.phone
                                ? `+91 ${currentUser.phone}`
                                : 'Verified Account')}
                          </span>
                        </div>
                      </div>

                      <div className={styles.patronDropdownList}>
                        <Link
                          href="/account?tab=orders"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className={styles.patronDropdownItem}
                        >
                          <span className={styles.patronDropdownItemLeft}>
                            <Package size={15} color="var(--accent-terracotta)" />
                            <span>My Orders</span>
                          </span>
                          <span className={styles.orderBadge}>{orders.length}</span>
                        </Link>

                        <Link
                          href="/account?tab=profile"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className={styles.patronDropdownItem}
                        >
                          <span className={styles.patronDropdownItemLeft}>
                            <User size={15} color="var(--accent-terracotta)" />
                            <span>Personal Profile</span>
                          </span>
                        </Link>

                        <Link
                          href="/account?tab=addresses"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className={styles.patronDropdownItem}
                        >
                          <span className={styles.patronDropdownItemLeft}>
                            <MapPin size={15} color="var(--accent-terracotta)" />
                            <span>Saved Addresses</span>
                          </span>
                        </Link>

                        <Link
                          href="/track-order"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className={styles.patronDropdownItem}
                        >
                          <span className={styles.patronDropdownItemLeft}>
                            <Truck size={15} color="var(--accent-terracotta)" />
                            <span>Track Consignment</span>
                          </span>
                        </Link>
                      </div>

                      <div className={styles.patronDropdownFooter}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            logout();
                          }}
                          className={styles.signOutBtn}
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/account"
                className={styles.signInBtn}
                aria-label="My Account"
              >
                <User size={15} />
                <span>Account</span>
              </Link>
            )}

            {/* Mobile / Tablet Compact User Button (<= 1040px only) */}
            <Link
              href="/account"
              aria-label="Customer Account"
              className={styles.mobileUserBtn}
            >
              {currentUser ? (
                <span className={styles.patronAvatar} style={{ width: 24, height: 24, fontSize: '0.68rem' }}>
                  {getInitials(currentUser.name)}
                </span>
              ) : (
                <User size={19} />
              )}
            </Link>

            {/* Desktop ONLY Bag Button (> 1040px) */}
            <button
              type="button"
              onClick={handleCartClick}
              aria-label={
                isCheckoutPage
                  ? `Shopping bag with ${totalItems} items (reviewed below in order summary)`
                  : `View shopping bag with ${totalItems} items`
              }
              title={
                isCheckoutPage
                  ? 'Your bag items are shown in the order summary on this page'
                  : `View shopping bag (${totalItems})`
              }
              className={`${styles.cartBtnDesktop} ${
                totalItems > 0 ? styles.cartBtnDesktopFilled : ''
              } ${isCheckoutPage ? styles.cartBtnDesktopOnCheckout : ''}`}
            >
              <ShoppingBag size={16} />
              <span>Bag</span>
              <motion.span
                key={totalItems}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className={styles.cartCountPill}
              >
                {totalItems}
              </motion.span>
            </button>

            {/* Mobile / Tablet ONLY Bag Button (<= 1040px) */}
            <button
              type="button"
              onClick={handleCartClick}
              aria-label={
                isCheckoutPage
                  ? `Shopping bag with ${totalItems} items (reviewed below in order summary)`
                  : `View shopping bag with ${totalItems} items`
              }
              title={
                isCheckoutPage
                  ? 'Your bag items are shown in the order summary on this page'
                  : `View shopping bag (${totalItems})`
              }
              className={`${styles.mobileCartBtn} ${isCheckoutPage ? styles.mobileCartBtnOnCheckout : ''}`}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className={styles.mobileCartBadge}
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------
          MOBILE & TABLET DRAWER (CLEAN 4-OPTION MENU + WHATSAPP & SIGN OUT)
          -------------------------------------------------------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className={styles.drawerBackdrop} onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div
              className={styles.drawerPanel}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: drawerEase }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className={styles.drawerHeader}>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Good Fills Homepage"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <img
                    src="/logo.png"
                    alt="Good Fills Homemade Products"
                    style={{ height: '32px', width: 'auto', maxWidth: '140px', objectFit: 'contain' }}
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className={styles.drawerCloseBtn}
                >
                  <X size={19} />
                </button>
              </div>

              {/* Drawer Scrollable Body: Exactly the 4 options + WhatsApp quick need */}
              <div className={styles.drawerBody}>
                {/* 4 Clean Navigation Links Requested */}
                <div className={styles.drawerCleanNavList}>
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${styles.drawerCleanLink} ${
                      pathname.startsWith('/shop') ? styles.drawerCleanLinkActive : ''
                    }`}
                  >
                    <span>Shop</span>
                    <ArrowRight size={16} className={styles.drawerArrow} />
                  </Link>

                  <Link
                    href="/track-order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${styles.drawerCleanLink} ${
                      pathname.startsWith('/track-order') ? styles.drawerCleanLinkActive : ''
                    }`}
                  >
                    <span>Track Order</span>
                    <ArrowRight size={16} className={styles.drawerArrow} />
                  </Link>

                  <Link
                    href="/our-story"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${styles.drawerCleanLink} ${
                      pathname === '/our-story' ? styles.drawerCleanLinkActive : ''
                    }`}
                  >
                    <span>Our Story</span>
                    <ArrowRight size={16} className={styles.drawerArrow} />
                  </Link>

                  <Link
                    href="/contact-us"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${styles.drawerCleanLink} ${
                      pathname === '/contact-us' ? styles.drawerCleanLinkActive : ''
                    }`}
                  >
                    <span>Contact</span>
                    <ArrowRight size={16} className={styles.drawerArrow} />
                  </Link>
                </div>

                <div className={styles.drawerDivider} />

                {/* Quick Need: WhatsApp Chat */}
                <a
                  href="https://wa.me/919742068899?text=Hello%20Good%20Fills!%20I%20have%20an%20inquiry%20regarding%20your%20homemade%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.drawerConciergeCard}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle size={20} color="#27ae60" style={{ flexShrink: 0 }} />
                    <div>
                      <div className={styles.drawerConciergeTitle}>Need Quick Help?</div>
                      <div className={styles.drawerConciergeSubtitle}>
                        Chat directly on WhatsApp
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={15} color="#27ae60" style={{ flexShrink: 0 }} />
                </a>

                {/* International Delivery Popup Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('gf_open_intl_toast'));
                    }
                  }}
                  className={styles.drawerConciergeCard}
                  style={{ marginTop: '8px', border: '1px solid rgba(151, 65, 29, 0.2)', backgroundColor: '#FAF6F0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={18} color="var(--accent-terracotta)" style={{ flexShrink: 0 }} />
                    <div style={{ textAlign: 'left' }}>
                      <div className={styles.drawerConciergeTitle} style={{ color: 'var(--text-primary)' }}>
                        International Delivery
                      </div>
                      <div className={styles.drawerConciergeSubtitle} style={{ color: 'var(--text-muted)' }}>
                        Fast, tracked worldwide delivery
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={15} color="var(--accent-terracotta)" style={{ flexShrink: 0 }} />
                </button>
              </div>

              {/* Drawer Footer: Sign Out (if logged in) or Sign In (if guest) */}
              <div className={styles.drawerFooter}>
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className={styles.drawerSignOutBtn}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={styles.drawerSignInLink}
                  >
                    <User size={15} />
                    <span>My Account</span>
                  </Link>
                )}

                <div className={styles.drawerTrustNote}>
                  100% Traditional Homemade · Made Fresh in Bengaluru
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Modals & Cart Drawer */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <InternationalDeliveryModal />
      <CartDrawer />
      <CartToastNotification />
    </>
  );
}
