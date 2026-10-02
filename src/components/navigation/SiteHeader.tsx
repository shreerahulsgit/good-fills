'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { CATEGORIES } from '@/data/products';
import { SearchModal } from '@/components/navigation/SearchModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
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
  Truck
} from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { currentUser, orders, logout } = useCustomerAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for subtle elevation
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

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: isScrolled ? 'rgba(250, 248, 245, 0.94)' : 'var(--bg-canvas)',
          backdropFilter: 'blur(12px)',
          borderBottom: isScrolled ? '1px solid var(--border-hairline)' : '1px solid transparent',
          transition: 'all var(--transition-smooth)',
          height: 'var(--header-height)'
        }}
      >
        <div 
          className="container"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)'
          }}
        >
          {/* Mobile Menu Button */}
          <div className="mobile-only" style={{ display: 'none' }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile navigation"
              style={{ padding: '8px', color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Brand Logo & Origin */}
          <Link 
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '2px 0'
            }}
            aria-label="Good Fills Homepage"
          >
            <img 
              src="/logo.png" 
              alt="Good Fills Homemade Products" 
              style={{
                height: '44px',
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav 
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)'
            }}
          >
            {/* Shop with Rich Dropdown */}
            <div 
              style={{ position: 'relative' }}
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                href="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  letterSpacing: '0.03em',
                  color: pathname.startsWith('/shop') ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                  padding: 'var(--space-2) 0',
                  transition: 'color var(--transition-fast)',
                  textDecoration: 'none'
                }}
              >
                <span>Shop</span>
                <ChevronDown size={14} style={{ opacity: 0.6, transform: isShopDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
              </Link>

              {/* Rich Dropdown Panel */}
              {isShopDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '-20px',
                    width: '460px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    boxShadow: '0 16px 40px rgba(34, 24, 19, 0.08)',
                    borderRadius: 0,
                    padding: 'var(--space-6)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-4)',
                    zIndex: 50,
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.id}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        padding: 'var(--space-2)',
                        borderRadius: 0,
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-cream)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {cat.tagline}
                      </span>
                    </Link>
                  ))}

                  <div 
                    style={{ 
                      gridColumn: 'span 2', 
                      borderTop: '1px solid var(--border-hairline)', 
                      paddingTop: 'var(--space-3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>13 launch products • Handcrafted to order</span>
                    <Link 
                      href="/shop" 
                      style={{ fontWeight: 600, color: 'var(--accent-terracotta)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      View All Products <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: pathname === '/about' ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-terracotta)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Our Story
            </Link>

            <Link
              href="/contact"
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: pathname === '/contact' ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-terracotta)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Contact
            </Link>

            <Link
              href="/track"
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: pathname.startsWith('/track') ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                transition: 'color var(--transition-fast)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-terracotta)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Track Order
            </Link>
          </nav>

          {/* Action Icons (Search, Real Account Hub, Cart) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search store"
              style={{
                padding: '8px',
                color: 'var(--text-primary)',
                borderRadius: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-terracotta)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              <Search size={20} />
            </button>

            {/* REAL-WORLD PATRON ACCOUNT NAV HUB */}
            {currentUser ? (
              /* LOGGED IN PATRON CHIP & DROPDOWN */
              <div 
                ref={accountDropdownRef}
                style={{ position: 'relative' }}
                onMouseEnter={() => setIsAccountDropdownOpen(true)}
                onMouseLeave={() => setIsAccountDropdownOpen(false)}
              >
                <Link
                  href="/account"
                  aria-label="My Account"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '5px 10px',
                    backgroundColor: pathname.startsWith('/account') ? 'var(--bg-cream)' : 'transparent',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 0,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                    e.currentTarget.style.backgroundColor = 'var(--bg-cream)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    if (!pathname.startsWith('/account')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: 'var(--accent-terracotta)',
                      color: 'var(--text-light)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-serif)',
                      borderRadius: 0,
                      flexShrink: 0
                    }}
                  >
                    {getInitials(currentUser.name)}
                  </span>
                  <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Hi, {getFirstName(currentUser.name)}
                  </span>
                  <ChevronDown 
                    size={13} 
                    style={{ 
                      opacity: 0.6, 
                      transform: isAccountDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease'
                    }} 
                  />
                </Link>

                {/* Rich E-Commerce Account Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      width: '260px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      boxShadow: '0 16px 36px rgba(34, 24, 19, 0.1)',
                      borderRadius: 0,
                      zIndex: 60,
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    {/* Header: Verified Patron Meta */}
                    <div 
                      style={{ 
                        padding: '14px 16px', 
                        borderBottom: '1px solid var(--border-hairline)', 
                        backgroundColor: 'var(--bg-cream)' 
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={13} /> {currentUser.email || (currentUser.phone ? `+91 ${currentUser.phone}` : 'Verified Account')}
                      </div>
                    </div>

                    {/* Nav Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-cream)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <Package size={15} color="var(--accent-terracotta)" /> My Orders
                        </span>
                        <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--bg-subtle)', padding: '2px 7px', fontWeight: 700, borderRadius: 0 }}>
                          {orders.length}
                        </span>
                      </Link>

                      <Link
                        href="/account?tab=profile"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          padding: '9px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-cream)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <User size={15} color="var(--accent-terracotta)" /> Personal Profile
                      </Link>

                      <Link
                        href="/account?tab=addresses"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          padding: '9px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-cream)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <MapPin size={15} color="var(--accent-terracotta)" /> Saved Addresses
                      </Link>

                      <Link
                        href="/track"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          padding: '9px 16px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-cream)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <Truck size={15} color="var(--accent-terracotta)" /> Track Consignment
                      </Link>
                    </div>

                    {/* Footer: Sign Out */}
                    <div style={{ borderTop: '1px solid var(--border-hairline)', padding: '6px 0' }}>
                      <button
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          logout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 16px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#d9381e',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff8f7')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LOGGED OUT STATE: SIGN IN BUTTON */
              <Link
                href="/account"
                aria-label="Customer account sign in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 0,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                  e.currentTarget.style.color = 'var(--accent-terracotta)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-cream)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Button with Reactive Counter */}
            <button
              onClick={openCart}
              aria-label={`View Cart with ${totalItems} items`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: totalItems > 0 ? 'var(--text-primary)' : 'transparent',
                color: totalItems > 0 ? 'var(--bg-surface)' : 'var(--text-primary)',
                border: '1px solid var(--text-primary)',
                borderRadius: 0,
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (totalItems === 0) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-cream)';
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--accent-terracotta)';
                  e.currentTarget.style.borderColor = 'var(--accent-terracotta)';
                }
              }}
              onMouseLeave={(e) => {
                if (totalItems === 0) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--text-primary)';
                }
              }}
            >
              <ShoppingBag size={16} />
              <span>Bag ({totalItems})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(34, 24, 19, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '360px',
              backgroundColor: 'var(--bg-surface)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-hairline)',
                  paddingBottom: 'var(--space-4)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  aria-label="Good Fills Homepage"
                >
                  <img 
                    src="/logo.png" 
                    alt="Good Fills Homemade Products" 
                    style={{
                      height: '38px',
                      width: 'auto',
                      maxWidth: '165px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Mobile Patron Profile Banner (If logged in) */}
              {currentUser && (
                <div 
                  style={{ 
                    backgroundColor: 'var(--bg-cream)', 
                    padding: '12px 14px', 
                    border: '1px solid var(--border-medium)', 
                    marginBottom: 'var(--space-4)',
                    borderRadius: 0 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{ 
                        width: '38px', 
                        height: '38px', 
                        backgroundColor: 'var(--accent-terracotta)', 
                        color: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700, 
                        fontFamily: 'var(--font-serif)',
                        borderRadius: 0,
                        flexShrink: 0
                      }}
                    >
                      {getInitials(currentUser.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> {currentUser.email || (currentUser.phone ? `+91 ${currentUser.phone}` : 'Verified Account')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Category & Store Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <span className="eyebrow" style={{ marginBottom: 0 }}>Catalog</span>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-2) 0',
                      borderBottom: '1px solid var(--border-hairline)',
                      textDecoration: 'none'
                    }}
                  >
                    <span>{cat.name}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </Link>
                ))}

                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-terracotta)', textDecoration: 'none', paddingTop: '4px' }}
                >
                  Browse All 13 Products →
                </Link>

                <div className="hairline-divider" style={{ margin: 'var(--space-2) 0' }} />

                <Link
                  href="/track"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 500, 
                    color: pathname.startsWith('/track') ? 'var(--accent-terracotta)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                >
                  <Truck size={15} /> Track Doorstep Order
                </Link>

                {currentUser ? (
                  <>
                    <Link
                      href="/account?tab=orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ 
                        fontSize: '0.95rem', 
                        fontWeight: 500, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={15} /> My Orders
                      </span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--bg-subtle)', padding: '2px 7px', fontWeight: 700 }}>
                        {orders.length}
                      </span>
                    </Link>

                    <Link
                      href="/account?tab=profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                    >
                      <User size={15} /> Personal Profile
                    </Link>

                    <Link
                      href="/account?tab=addresses"
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                    >
                      <MapPin size={15} /> Saved Addresses
                    </Link>
                  </>
                ) : null}

                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none' }}
                >
                  Our Story
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none' }}
                >
                  Contact &amp; Concierge
                </Link>
              </div>
            </div>

            {/* Mobile Footer Auth Action */}
            <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d9381e',
                    color: '#d9381e',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: 0
                  }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              ) : (
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'var(--accent-terracotta)',
                    border: 'none',
                    color: 'var(--text-light)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    borderRadius: 0
                  }}
                >
                  <User size={15} /> Sign In with Mobile OTP
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Search Modal and Cart Drawer */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />

      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
