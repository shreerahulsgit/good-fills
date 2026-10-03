'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { Order } from '@/types';
import {
  ATELIER_INFO,
  numberToIndianRupeeWords,
  generateTrackingQrCode,
  formatInvoiceNumber,
} from '@/lib/invoice';
import { formatCurrency } from '@/lib/shipping';
import styles from './InvoiceDocumentView.module.css';

interface InvoiceDocumentViewProps {
  orderId: string;
  initialOrder?: Order | null;
}

export function InvoiceDocumentView({ orderId, initialOrder }: InvoiceDocumentViewProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(!initialOrder);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order && isMounted) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch order for invoice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!order) {
      load();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [orderId, order]);

  // Generate QR code for tracking
  useEffect(() => {
    if (order?.id) {
      generateTrackingQrCode(order.id).then((url) => {
        if (url) setQrCodeDataUrl(url);
      });
    }
  }, [order?.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className={styles.pageCanvas}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Clock size={36} style={{ color: '#97411d', margin: '0 auto 16px' }} />
          <p style={{ color: '#786b66', fontSize: '0.95rem' }}>Generating official invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.pageCanvas}>
        <div className={styles.actionsBar}>
          <Link href="/shop" className={styles.backBtn}>
            <ArrowLeft size={16} /> Return to Shop
          </Link>
        </div>
        <div className={styles.invoiceSheet} style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ color: '#97411d', marginBottom: '8px' }}>Invoice Record Not Found</h2>
          <p style={{ color: '#6c635d', fontSize: '0.9rem' }}>
            We could not locate an official order matching reference: <strong>{orderId}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const invoiceNumber = formatInvoiceNumber(order.id);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const totalWords = numberToIndianRupeeWords(order.total);

  return (
    <div className={styles.pageCanvas}>
      {/* Top Screen-Only Actions */}
      <div className={styles.actionsBar}>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = `/order-confirmation/${encodeURIComponent(order.id)}`;
            }
          }}
          className={styles.backBtn}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className={styles.actionBtnsRight}>
          <button type="button" onClick={handlePrint} className={styles.printBtn}>
            <Printer size={17} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* A4 Printable Invoice Sheet */}
      <div className={styles.invoiceSheet}>
        {/* Header */}
        <div className={styles.invoiceHeader}>
          <div className={styles.brandCol}>
            <img src="/logo.png" alt="Good Fills" className={styles.brandLogo} />
            <div className={styles.brandTagline}>{ATELIER_INFO.tagline}</div>
            <div className={styles.atelierAddress}>
              {ATELIER_INFO.address}
              <br />
              WhatsApp: {ATELIER_INFO.phone} • Email: {ATELIER_INFO.email}
              <br />
              <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
                {ATELIER_INFO.fssaiNumber}
              </span>
            </div>
          </div>

          <div className={styles.metaCol}>
            <h1 className={styles.invoiceTitle}>Tax Invoice</h1>
            <div className={styles.invoiceNumber}>{invoiceNumber}</div>
            <div className={styles.metaRow}>
              <strong>Order Ref:</strong> {order.id}
            </div>
            <div className={styles.metaRow}>
              <strong>Date:</strong> {formattedDate} at {formattedTime}
            </div>
            {order.razorpayPaymentId && (
              <div className={styles.metaRow}>
                <strong>Payment Ref:</strong> {order.razorpayPaymentId}
              </div>
            )}
            {order.paymentStatus === 'Paid' && (
              <span className={styles.statusPillPaid}>Payment Verified • Paid</span>
            )}
          </div>
        </div>

        {/* Customer & Shipping Party Details */}
        <div className={styles.partySection}>
          <div className={styles.partyBox}>
            <div className={styles.partyLabel}>Billed To:</div>
            <div className={styles.partyName}>{order.customerName}</div>
            <div className={styles.partyText}>
              Phone: {order.customerPhone}
              <br />
              Email: {order.customerEmail}
            </div>
          </div>

          <div className={styles.partyBox}>
            <div className={styles.partyLabel}>Shipped To (DTDC Express):</div>
            <div className={styles.partyName}>{order.shippingAddress.fullName}</div>
            <div className={styles.partyText}>
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
              <br />
              Phone: {order.shippingAddress.phone}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th className={styles.itemColDesc}>Item Description</th>
              <th className={styles.itemColQty}>Qty</th>
              <th className={styles.itemColRate}>Rate</th>
              <th className={styles.itemColAmount}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.product.id || idx}>
                <td className={styles.itemColDesc}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemSub}>
                    Pack Size: {item.product.packSize} • {item.product.productWeightGrams}g Net • Handcrafted in Bengaluru
                  </div>
                </td>
                <td className={styles.itemColQty}>{item.quantity}</td>
                <td className={styles.itemColRate}>{formatCurrency(item.product.price)}</td>
                <td className={styles.itemColAmount}>
                  {formatCurrency(item.product.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary & QR Block */}
        <div className={styles.summarySection}>
          <div className={styles.wordsBox}>
            <div className={styles.wordsLabel}>Amount Chargeable (in words):</div>
            <div className={styles.wordsText}>{totalWords}</div>

            {/* Tracking QR Code */}
            {qrCodeDataUrl && (
              <div className={styles.qrContainer}>
                <img src={qrCodeDataUrl} alt="Consignment Tracking QR" className={styles.qrImage} />
                <div>
                  <div className={styles.qrTextTitle}>Scan to Track Consignment</div>
                  <div className={styles.qrTextDesc}>
                    Point your camera to check live DTDC preparation & dispatch status for order{' '}
                    <strong>{order.id}</strong>.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className={styles.calcTable}>
              <div className={styles.calcRow}>
                <span>Product Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className={styles.calcRow}>
                <span>DTDC Domestic Express Courier:</span>
                <span>{order.shippingCost > 0 ? formatCurrency(order.shippingCost) : 'Free (₹0)'}</span>
              </div>
              <div className={styles.calcRow}>
                <span>Taxes & Kitchen Packing:</span>
                <span>Included</span>
              </div>
              <div className={styles.calcRowTotal}>
                <span>Total Amount:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Guarantee & Alankrutha Sunil Signature */}
        <div className={styles.bottomSection}>
          <div className={styles.termsCol}>
            <div className={styles.termsHeading}>Atelier Guarantee & Care Notes:</div>
            • 100% natural, freshly made to order in our Bengaluru home kitchen.
            <br />
            • Sealed in airtight food-grade barrier pouches for 6-month natural freshness.
            <br />
            • Dispatched via DTDC Express Domestic Courier with live tracking SMS updates.
            <br />
            • For assistance or reorders: WhatsApp +91 97420 68899.
          </div>

          {/* Authorized Signature Block */}
          <div className={styles.signatureCol}>
            <div className={styles.signatureWrap}>
              {/* Artisanal Calligraphic Signature Stroke */}
              <svg
                viewBox="0 0 240 60"
                className={styles.signatureSvg}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 45 C 35 15, 60 10, 85 30 C 110 50, 130 15, 160 25 C 185 32, 210 20, 230 18"
                  stroke="#97411d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M40 38 C 75 35, 120 40, 195 28"
                  stroke="#97411d"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M70 20 C 72 38, 75 48, 76 52"
                  stroke="#97411d"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={styles.signatureLine}></div>
            <div className={styles.signatoryName}>{ATELIER_INFO.founderName}</div>
            <div className={styles.signatoryTitle}>{ATELIER_INFO.founderTitle}</div>
            <div className={styles.atelierBadge}>Good Fills • Bengaluru</div>
          </div>
        </div>
      </div>
    </div>
  );
}
