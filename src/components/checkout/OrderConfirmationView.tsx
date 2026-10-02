'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Truck,
  ArrowRight,
  MessageCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Package,
} from 'lucide-react';
import { Order } from '@/types';
import { getOrderById, saveOrder } from '@/lib/orders';
import { formatCurrency } from '@/lib/shipping';
import styles from './OrderConfirmationView.module.css';

interface OrderConfirmationViewProps {
  orderId: string;
}

export function OrderConfirmationView({ orderId }: OrderConfirmationViewProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderId) {
        setIsLoaded(true);
        return;
      }

      // 1. Try local storage first for instant rendering
      const localFound = getOrderById(orderId);
      if (localFound && isMounted) {
        setOrder(localFound);
        setIsLoaded(true);
      }

      // 2. Fetch authoritative order from server
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order && isMounted) {
            setOrder(data.order);
            saveOrder(data.order);
          }
        }
      } catch (err) {
        console.warn('Could not fetch order from server API:', err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const atelierPhone = '9742068899';

  if (!isLoaded) {
    return (
      <div className={styles.pageWrapper}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Clock size={32} style={{ color: 'var(--accent-terracotta)', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>
              Loading order verification...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pre-formatted WhatsApp confirmation message
  const waText = order
    ? encodeURIComponent(
        `Hello Good Fills Atelier! I have placed order ${order.id} for ${formatCurrency(
          order.total
        )} via ${order.paymentMethod}.${order.razorpayPaymentId ? ` Razorpay Ref: ${order.razorpayPaymentId}.` : ''}${order.upiUtr ? ` UPI UTR: ${order.upiUtr}.` : ''} Delivery to: ${order.shippingAddress.fullName}, ${order.shippingAddress.city}, PIN: ${order.shippingAddress.pincode}. Please confirm preparation.`
      )
    : encodeURIComponent(
        `Hello Good Fills Atelier! I have a question regarding my order ${orderId}.`
      );

  const formattedDate = order
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        <div className={styles.confirmationContainer}>
          {/* Success Seal Card */}
          <div className={styles.successCard}>
            <div className={styles.successIconBadge}>
              <Check size={36} strokeWidth={2.5} />
            </div>

            <div>
              <span className={styles.orderStatusPill}>
                ● Order Confirmed &amp; Queued
              </span>
            </div>

            <h1 className={styles.successTitle}>
              Thank You, {order ? order.customerName.split(' ')[0] : 'Valued Customer'}
            </h1>
            <p className={styles.successDesc}>
              Your order has been received at our Bengaluru atelier. Every blend is made fresh to order using traditional methods without artificial preservatives.
            </p>

            <div className={styles.orderIdBox}>
              <span className={styles.orderIdLabel}>Order Reference:</span>
              <span className={styles.orderIdValue}>{order ? order.id : orderId}</span>
            </div>
          </div>

          {/* Courier & Dispatch Timeline Card */}
          <div className={styles.courierNotice}>
            <div className={styles.courierIcon}>
              <Truck size={18} strokeWidth={2} />
            </div>
            <div>
              <h4 className={styles.courierTitle}>
                DTDC Express Doorstep Delivery (2–4 Business Days)
              </h4>
              <p className={styles.courierDesc}>
                Preparation takes 24–48 hours for soaking, sun-drying &amp; fresh stone-milling. The moment your barrier pouch is sealed and handed over to DTDC, a consignment tracking SMS with a live link will be dispatched to{' '}
                <strong>{order ? order.customerPhone : 'your mobile number'}</strong>.
              </p>
            </div>
          </div>

          {/* Order Details Breakdown */}
          {order && (
            <div className={styles.detailsCard}>
              <div className={styles.detailsHeader}>
                <h3 className={styles.detailsTitle}>Order Specification</h3>
                <span className={styles.detailsDate}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {formattedDate}
                </span>
              </div>

              {/* Delivery & Payment Two-Column Info */}
              <div className={styles.detailsGrid}>
                {/* Shipping Destination */}
                <div className={styles.infoBlock}>
                  <span className={styles.infoBlockLabel}>
                    <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                    Delivery Destination
                  </span>
                  <div className={styles.infoBlockContent}>
                    <strong>{order.shippingAddress.fullName}</strong>
                    <br />
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                    <br />
                    Phone: {order.shippingAddress.phone}
                  </div>
                </div>

                {/* Payment Method */}
                <div className={styles.infoBlock}>
                  <span className={styles.infoBlockLabel}>
                    <CreditCard size={11} style={{ display: 'inline', marginRight: 3 }} />
                    Payment Method
                  </span>
                  <div className={styles.infoBlockContent}>
                    <strong>{order.paymentMethod === 'Razorpay' ? 'Razorpay Instant Gateway' : 'Direct UPI Payment'}</strong>
                    <br />
                    Status: <span style={{ color: '#16a34a', fontWeight: 600 }}>{order.paymentStatus}</span>
                    {order.razorpayPaymentId && (
                      <>
                        <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Gateway Ref: {order.razorpayPaymentId}
                        </span>
                      </>
                    )}
                    {order.upiUtr && (
                      <>
                        <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          UTR / Ref: {order.upiUtr}
                        </span>
                      </>
                    )}
                    <br />
                    Total Weight: {order.weightGrams || 0}g net
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className={styles.itemsTable}>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.product.id} className={styles.itemRow}>
                      <td className={styles.itemCell}>
                        <div className={styles.itemTitleCol}>
                          <img
                            src={item.product.images.primary}
                            alt={item.product.name}
                            className={styles.itemThumb}
                          />
                          <div>
                            <h4 className={styles.itemName}>{item.product.name}</h4>
                            <span className={styles.itemSub}>{item.product.packSize} pack</span>
                          </div>
                        </div>
                      </td>
                      <td className={`${styles.itemCell} ${styles.itemQtyCol}`}>
                        × {item.quantity}
                      </td>
                      <td className={`${styles.itemCell} ${styles.itemPriceCol}`}>
                        {formatCurrency(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cost Summary */}
              <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 12 }}>
                <div className={styles.summaryRow}>
                  <span>Product Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>DTDC Domestic Courier</span>
                  <span style={{ color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                    {formatCurrency(order.shippingCost)}
                  </span>
                </div>
                <div className={styles.grandTotalRow}>
                  <span className={styles.grandTotalLabel}>Total Paid / Payable</span>
                  <span className={styles.grandTotalAmount}>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className={styles.actionsRow}>
            <a
              href={`https://wa.me/91${atelierPhone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappConfirmBtn}
            >
              <MessageCircle size={16} />
              <span>Confirm on WhatsApp with Kitchen</span>
            </a>

            <Link href="/shop" className={styles.shopMoreBtn}>
              <Package size={15} />
              <span>Explore More Creations</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
