'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import styles from './CartToastNotification.module.css';

export function CartToastNotification() {
  const pathname = usePathname();
  const { lastAddedItem, dismissToast, openCart, subtotal, totalItems } = useCart();
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    if (!lastAddedItem) return;

    setTimerKey((prev) => prev + 1);

    const timer = setTimeout(() => {
      dismissToast();
    }, 3800);

    return () => clearTimeout(timer);
  }, [lastAddedItem, dismissToast]);

  if (pathname === '/checkout') return null;

  return (
    <div className={styles.toastPortal}>
      <AnimatePresence>
        {lastAddedItem && (
          <motion.div
            key={lastAddedItem.timestamp}
            className={styles.toastCard}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Bar with Success Pill & Close Button */}
            <div className={styles.toastHeader}>
              <div className={styles.toastBadge}>
                <Check size={13} strokeWidth={2.5} />
                <span>Added to Bag</span>
              </div>
              <button
                type="button"
                onClick={dismissToast}
                className={styles.toastCloseBtn}
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>

            {/* Product Body */}
            <div className={styles.toastBody}>
              {lastAddedItem.product.images?.primary ? (
                <img
                  src={lastAddedItem.product.images.primary}
                  alt={lastAddedItem.product.name}
                  className={styles.toastThumb}
                />
              ) : (
                <div
                  className={styles.toastThumb}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag size={20} color="var(--accent-terracotta)" />
                </div>
              )}
              <div className={styles.toastInfo}>
                <div className={styles.toastProductName}>
                  {lastAddedItem.product.name}
                </div>
                <div className={styles.toastProductMeta}>
                  Qty: {lastAddedItem.quantity} × {lastAddedItem.product.packSize || 'Standard'}
                  <span className={styles.toastProductPrice}>
                    • ₹{(lastAddedItem.product.price * lastAddedItem.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtotal & Quick Actions */}
            <div className={styles.toastFooter}>
              <div className={styles.toastSummaryRow}>
                <span>Bag Total ({totalItems} {totalItems === 1 ? 'item' : 'items'}):</span>
                <span className={styles.toastSubtotalVal}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.toastActionsRow}>
                <button
                  type="button"
                  onClick={dismissToast}
                  className={styles.continueBtn}
                >
                  Keep Shopping
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissToast();
                    openCart();
                  }}
                  className={styles.viewBagBtn}
                >
                  <span>View Bag</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Animated Disappearing Progress Bar */}
            <div className={styles.timerBarTrack}>
              <div key={timerKey} className={styles.timerBarFill} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
