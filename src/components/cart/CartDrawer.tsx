'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/shipping';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const pathname = usePathname();
  const { 
    isCartOpen, 
    closeCart, 
    items, 
    updateQuantity, 
    removeItem, 
    subtotal, 
    shipping, 
    grandTotal,
    totalWeightGrams,
    totalItems
  } = useCart();

  // Automatically close cart if user lands on checkout page
  useEffect(() => {
    if (pathname === '/checkout' && isCartOpen) {
      closeCart();
    }
  }, [pathname, isCartOpen, closeCart]);

  useEffect(() => {
    if (isCartOpen && pathname !== '/checkout') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCartOpen, pathname]);

  if (!isCartOpen || pathname === '/checkout') return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 24, 22, 0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 36px rgba(26, 24, 22, 0.15)',
          borderLeft: '1px solid var(--border-hairline)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div 
          style={{
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent-terracotta)' }} />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
              Your Bag ({totalItems})
            </h3>
          </div>
          <button 
            onClick={closeCart}
            aria-label="Close cart"
            style={{ 
              padding: '6px', 
              color: 'var(--text-muted)', 
              borderRadius: 'var(--radius-xs)',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Weight & DTDC Slab Indicator */}
        {items.length > 0 && (
          <div 
            style={{
              padding: 'var(--space-3) var(--space-6)',
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-hairline)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} style={{ color: 'var(--accent-terracotta)' }} />
              <span>Weight: <strong>{totalWeightGrams}g</strong> ({shipping.totalWeightKg}kg)</span>
            </div>
            <span className="badge" style={{ fontSize: '0.72rem', backgroundColor: '#FFFFFF' }}>
              {shipping.slabDescription}
            </span>
          </div>
        )}

        {/* Items Scrollable List */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          {items.length === 0 ? (
            <div 
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                padding: 'var(--space-8) 0'
              }}
            >
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                  color: 'var(--text-muted)'
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ marginBottom: 'var(--space-2)' }}>Your bag is empty</h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '280px', marginBottom: 'var(--space-6)' }}>
                Our homemade products are prepared fresh to order. Explore our offerings to get started.
              </p>
              <Link 
                href="/shop" 
                onClick={closeCart}
                className="btn btn-primary"
              >
                Explore Products <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div 
                key={item.product.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  gap: 'var(--space-4)',
                  paddingBottom: 'var(--space-4)',
                  borderBottom: '1px solid var(--border-hairline)'
                }}
              >
                <img 
                  src={item.product.images.primary} 
                  alt={item.product.name}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-hairline)'
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Link 
                        href={`/product/${item.product.slug}`} 
                        onClick={closeCart}
                        style={{ fontWeight: 500, fontSize: '0.92rem', color: 'var(--text-primary)' }}
                      >
                        {item.product.name}
                      </Link>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        aria-label="Remove item"
                        style={{ color: 'var(--text-muted)', padding: '2px' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#B91C1C')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>Pack: {item.product.packSize}</span>
                      <span>•</span>
                      <span>{formatCurrency(item.product.price)} each</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)' }}>
                    {/* Quantity Controls */}
                    <div 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-canvas)'
                      }}
                    >
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0 8px', minWidth: '24px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Transparent Shipping Calculation */}
        {items.length > 0 && (
          <div 
            style={{
              padding: 'var(--space-6)',
              borderTop: '1px solid var(--border-hairline)',
              backgroundColor: 'var(--bg-cream)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Product Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tracked Express Shipping</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({shipping.slabDescription})</span>
                </div>
                <strong style={{ color: 'var(--accent-terracotta)' }}>{formatCurrency(shipping.shippingCost)}</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '-2px' }}>
                Delivery outside India?{' '}
                <a
                  href={`https://wa.me/919742068899?text=${encodeURIComponent(
                    `Hello Good Fills! 🌿\nI would like to place an International Order for delivery outside India.\n\n📦 Cart Items:\n${items
                      .map((i) => `• ${i.quantity}x ${i.product.name} (${i.product.packSize || ''})`)
                      .join('\n')}\n\nTotal: ₹${subtotal}\nPlease share international courier rates.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#128C7E', fontWeight: 600, textDecoration: 'none' }}
                >
                  WhatsApp Us
                </a>{' '}
                or call{' '}
                <a href="tel:+919742068899" style={{ color: 'var(--accent-terracotta)', fontWeight: 600, textDecoration: 'none' }}>
                  +91 97420 68899
                </a>
              </div>
              <div className="hairline-divider" style={{ margin: 'var(--space-2) 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 600 }}>
                <span>Total Amount</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-sage)', flexShrink: 0 }} />
              <span>Made to order in Bengaluru • UPI Payment only at checkout</span>
            </div>

            <Link 
              href="/checkout" 
              onClick={closeCart}
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center', padding: '0.95rem' }}
            >
              Proceed to Checkout <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
