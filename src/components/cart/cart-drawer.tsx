'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/components/context/cart-context';
import { formatCurrency } from '@/lib/dispatch/shipping';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';
import styles from '@/components/cart/cart-drawer.module.css';

export function CartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
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
    totalItems,
    refreshProducts,
  } = useCart();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleProceedToCheckout = async () => {
    setIsRefreshing(true);
    const refreshed = await refreshProducts();
    setIsRefreshing(false);
    if (refreshed) {
      closeCart();
      router.push('/checkout');
    }
  };

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
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <ShoppingBag size={20} className={styles.headerIcon} />
            <h3 className={styles.title}>Your Bag ({totalItems})</h3>
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart" className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {items.length > 0 && (
          <div className={styles.weightBar}>
            <div className={styles.weightMeta}>
              <Truck size={14} className={styles.weightIcon} />
              <span>
                Weight: <strong>{totalWeightGrams}g</strong> ({shipping.totalWeightKg}kg)
              </span>
            </div>
            <span className={`badge ${styles.weightBadge}`}>{shipping.slabDescription}</span>
          </div>
        )}

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <ShoppingBag size={28} />
              </div>
              <h4 className={styles.emptyTitle}>Your bag is empty</h4>
              <p className={styles.emptyText}>
                Our homemade products are prepared fresh to order. Explore our offerings to get started.
              </p>
              <Link href="/shop" onClick={closeCart} className="btn btn-primary empty-btn">
                Explore Products <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className={styles.itemCard}>
                <img src={item.product.images.primary} alt={item.product.name} className={styles.itemImage} />

                <div className={styles.itemInfo}>
                  <div>
                    <div className={styles.itemHeader}>
                      <Link href={`/product/${item.product.slug}`} onClick={closeCart} className={styles.itemTitle}>
                        {item.product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        aria-label="Remove item"
                        className={styles.itemRemoveButton}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className={styles.itemMeta}>
                      <span>Pack: {item.product.packSize}</span>
                      <span>•</span>
                      <span>{formatCurrency(item.product.price)} each</span>
                    </div>
                  </div>

                  <div className={styles.itemFooter}>
                    <div className={styles.quantityControl}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className={styles.quantityButton}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className={styles.quantityButton}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <strong className={styles.itemTotal}>{formatCurrency(item.product.price * item.quantity)}</strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.summary}>
            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Product Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.shippingRow}>
                <div className={styles.shippingLabel}>
                  <span className={styles.shippingText}>Shipping Charges</span>
                  <span className={styles.shippingNote}>({shipping.slabDescription})</span>
                </div>
                <strong className={styles.shippingValue}>{formatCurrency(shipping.shippingCost)}</strong>
              </div>
              <div className={styles.internationalNote}>
                Delivery outside India?{' '}
                <a
                  href={`https://wa.me/919742068899?text=${encodeURIComponent(
                    `Hello Good Fills! 🌿\nI would like to place an International Order for delivery outside India.\n\n📦 Cart Items:\n${items
                      .map((i) => `• ${i.quantity}x ${i.product.name} (${i.product.packSize || ''})`)
                      .join('\n')}\n\nTotal: ₹${subtotal}\nPlease share international courier rates.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.internationalLink}
                >
                  WhatsApp Us
                </a>{' '}
                or call{' '}
                <a href="tel:+919742068899" className={styles.phoneLink}>
                  +91 97420 68899
                </a>
              </div>
              <div className="hairline-divider" style={{ margin: 'var(--space-2) 0' }} />
              <div className={styles.totalRow}>
                <span>Total Amount</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isRefreshing}
              className={`btn btn-primary ${styles.checkoutButton} ${isRefreshing ? styles.checkoutButtonDisabled : ''}`}
            >
              {isRefreshing ? 'Conciling the cart...' : 'Proceed to Checkout'} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
