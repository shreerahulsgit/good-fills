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

  const invoiceNumber = formatInvoiceNumber(order?.id || orderId || 'Order');
  const dateObj = order?.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';
  const formattedTime = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const totalWords = numberToIndianRupeeWords(order?.total || 0);

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
              window.location.href = `/order-confirmation/${encodeURIComponent(order?.id || orderId)}`;
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
            <div className={styles.atelierDetails}>
              <span className={styles.atelierEntity}>{ATELIER_INFO.legalEntity}</span>
              <span className={styles.atelierDivider}>•</span>
              <span>{ATELIER_INFO.location}</span>
            </div>
            <div className={styles.atelierContact}>
              WhatsApp: {ATELIER_INFO.phone} &nbsp;|&nbsp; {ATELIER_INFO.email}
            </div>
            <div className={styles.atelierFssai}>
              FSSAI Lic. No. 21224180000411 &nbsp;•&nbsp; Bengaluru Atelier
            </div>
          </div>

          <div className={styles.metaCol}>
            <div className={styles.invoiceTitleWrap}>
              <h1 className={styles.invoiceTitle}>TAX INVOICE</h1>
              {order.paymentStatus === 'Paid' && (
                <span className={styles.statusPillPaid}>PAID</span>
              )}
            </div>
            <div className={styles.invoiceNumber}>{invoiceNumber}</div>
            <div className={styles.metaDetails}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Order Ref:</span>
                <span className={styles.metaValue}>{order.id}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Date:</span>
                <span className={styles.metaValue}>
                  {formattedDate}{formattedTime ? ` • ${formattedTime}` : ''}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Payment Ref:</span>
                  <span className={styles.metaValue}>{order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Party Details */}
        <div className={styles.partySection}>
          <div className={styles.partyBox}>
            <div className={styles.partyLabel}>Billed To</div>
            <div className={styles.partyName}>
              {order.customerName || order.shippingAddress?.fullName || 'Valued Patron'}
            </div>
            <div className={styles.partyText}>
              {order.customerPhone || order.shippingAddress?.phone ? (
                <div>Phone: {order.customerPhone || order.shippingAddress?.phone}</div>
              ) : null}
              {order.customerEmail || order.shippingAddress?.email ? (
                <div>Email: {order.customerEmail || order.shippingAddress?.email}</div>
              ) : null}
            </div>
          </div>

          <div className={styles.partyBox}>
            <div className={styles.partyLabel}>Shipped To (DTDC Express)</div>
            <div className={styles.partyName}>
              {order.shippingAddress?.fullName || order.customerName || 'Valued Patron'}
            </div>
            <div className={styles.partyText}>
              <div>{order.shippingAddress?.addressLine1 || 'Bengaluru Made to Order Atelier'}</div>
              {order.shippingAddress?.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
              <div>
                {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'} – {order.shippingAddress?.pincode || '560001'}
              </div>
              {order.shippingAddress?.phone && (
                <div>Contact: {order.shippingAddress.phone}</div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.itemColDesc}>Item</th>
                <th className={styles.itemColQty}>Qty</th>
                <th className={styles.itemColRate}>Rate</th>
                <th className={styles.itemColAmount}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => {
                const packText = item?.product?.packSize || '';
                const weightText = item?.product?.productWeightGrams ? `${item.product.productWeightGrams}g` : '';
                const metaString = [packText, weightText].filter(Boolean).join(' • ');

                return (
                  <tr key={item?.product?.id || idx}>
                    <td className={styles.itemColDesc}>
                      <div className={styles.itemName}>{item?.product?.name || 'Handcrafted Blend'}</div>
                      {metaString && (
                        <div className={styles.itemSub}>{metaString}</div>
                      )}
                    </td>
                    <td className={styles.itemColQty}>{item?.quantity || 1}</td>
                    <td className={styles.itemColRate}>{formatCurrency(item?.product?.price || 0)}</td>
                    <td className={styles.itemColAmount}>
                      {formatCurrency((item?.product?.price || 0) * (item?.quantity || 1))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & QR Block */}
        <div className={styles.summarySection}>
          <div className={styles.wordsCol}>
            <div className={styles.wordsLabel}>Amount in Words</div>
            <div className={styles.wordsText}>{totalWords}</div>

            {/* Subtle, compact tracking badge */}
            {qrCodeDataUrl && (
              <div className={styles.qrBadge}>
                <img src={qrCodeDataUrl} alt="Consignment Tracking QR" className={styles.qrImage} />
                <div className={styles.qrMeta}>
                  <div className={styles.qrTitle}>Track Consignment</div>
                  <div className={styles.qrSub}>Scan for live DTDC status</div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.calcCol}>
            <div className={styles.calcTable}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Subtotal:</span>
                <span className={styles.calcValue}>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Shipping (DTDC Express):</span>
                <span className={styles.calcValue}>
                  {order.shippingCost > 0 ? formatCurrency(order.shippingCost) : 'Free'}
                </span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Taxes (GST):</span>
                <span className={styles.calcValue}>Included</span>
              </div>
              <div className={styles.calcRowTotal}>
                <span>Total Amount:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Clean Notes & Alankrutha Sunil Signature */}
        <div className={styles.bottomSection}>
          <div className={styles.noteCol}>
            <div className={styles.thankYouNote}>Thank you for choosing Good Fills!</div>
            <div className={styles.legalNotice}>
              Computer-generated tax invoice issued by Good Fills Artisanal Kitchen.
              <br />
              For assistance: {ATELIER_INFO.phone} &nbsp;|&nbsp; {ATELIER_INFO.email}
            </div>
          </div>

          {/* Official Good Fills Atelier Stamp */}
          <div className={styles.stampCol}>
            <div className={styles.stampWrap}>
              <svg
                viewBox="0 0 140 140"
                className={styles.stampSvg}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Good Fills Official Atelier Stamp"
              >
                <defs>
                  <path id="gfStampTopArc" d="M 18 70 A 52 52 0 0 1 122 70" fill="none" />
                  <path id="gfStampBotArc" d="M 18 70 A 52 52 0 0 0 122 70" fill="none" />
                </defs>

                {/* Outer Heavy Seal Ring */}
                <circle cx="70" cy="70" r="64" stroke="#97411d" strokeWidth="2.4" fill="none" />

                {/* Middle Dotted Ring */}
                <circle cx="70" cy="70" r="59" stroke="#97411d" strokeWidth="1.2" strokeDasharray="3.5 2.5" fill="none" />

                {/* Inner Solid Ring */}
                <circle cx="70" cy="70" r="41" stroke="#97411d" strokeWidth="1.4" fill="none" />

                {/* Top Curved Text: GOOD FILLS HOMEMADE */}
                <text
                  fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  fontSize="8"
                  fontWeight="800"
                  fill="#97411d"
                  letterSpacing="1.4"
                  textAnchor="middle"
                >
                  <textPath href="#gfStampTopArc" startOffset="50%">
                    GOOD FILLS HOMEMADE
                  </textPath>
                </text>

                {/* Bottom Curved Text: BENGALURU • KARNATAKA */}
                <text
                  fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                  fontSize="7"
                  fontWeight="800"
                  fill="#97411d"
                  letterSpacing="1.1"
                  textAnchor="middle"
                >
                  <textPath href="#gfStampBotArc" startOffset="50%">
                    ★ BENGALURU • KARNATAKA ★
                  </textPath>
                </text>

                {/* Center Badge Details */}
                <g textAnchor="middle" fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" fill="#97411d">
                  <path d="M70 47 L71.5 50.5 L75 51 L72.5 53.5 L73 57 L70 55 L67 57 L67.5 53.5 L65 51 L68.5 50.5 Z" fill="#97411d" />
                  <line x1="43" y1="59" x2="97" y2="59" stroke="#97411d" strokeWidth="1" />
                  <text x="70" y="69" fontSize="9" fontWeight="900" letterSpacing="1.2">OFFICIAL</text>
                  <text x="70" y="80" fontSize="8" fontWeight="800" letterSpacing="1">STAMP</text>
                  <line x1="43" y1="84" x2="97" y2="84" stroke="#97411d" strokeWidth="1" />
                  <text x="70" y="93" fontSize="6.5" fontWeight="700" letterSpacing="0.8">ATELIER SEAL</text>
                </g>
              </svg>
            </div>
            <div className={styles.stampLabel}>Official Atelier Stamp</div>
            <div className={styles.stampEntity}>{ATELIER_INFO.brandName} • Bengaluru</div>
          </div>
        </div>
      </div>
    </div>
  );
}
