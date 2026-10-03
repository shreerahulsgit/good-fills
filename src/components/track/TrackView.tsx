'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Box,
  Sparkles,
  X,
  FileText
} from 'lucide-react';
import { TrackingTelemetryResult } from '@/lib/tracking';
import styles from './TrackView.module.css';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

export function TrackView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<TrackingTelemetryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Auto-lookup on mount only if query param is present
  useEffect(() => {
    const qParam = searchParams.get('q') || searchParams.get('id') || searchParams.get('phone');
    if (qParam && qParam.trim()) {
      setSearchQuery(qParam.trim());
      executeTrackingLookup(qParam.trim());
    }
  }, [searchParams]);

  const executeTrackingLookup = async (queryToSearch: string) => {
    const trimmed = queryToSearch.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your Good Fills Order ID or 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'No order found matching your search. Please check your Order ID.');
        setActiveOrder(null);
      } else {
        setActiveOrder(data.tracking);
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setErrorMessage('Could not connect to courier tracking. Please try again.');
      setActiveOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    executeTrackingLookup(searchQuery);
    router.replace(`/track?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
  };

  const handleCopyAwb = (awb: string) => {
    if (awb === 'Assigned on Dispatch') return;
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2400);
  };

  return (
    <main className={styles.trackContainer}>
      {/* 1. TOP LOGISTICS STATUS BAR */}
      <motion.div 
        className={styles.controlBar}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: luxuryEase }}
      >
        <div className={styles.controlBarInner}>
          <div className={styles.gatewayBadge}>
            <span className={styles.pulseDot} />
            <span>Live DTDC Express Tracking</span>
          </div>
          <div className={styles.hubRoute}>
            <span>Dispatch: <span className={styles.hubRouteItem}>Bengaluru Kitchen</span></span>
            <span>•</span>
            <span>Courier: <span className={styles.hubRouteItem}>DTDC Domestic Express</span></span>
            <span>•</span>
            <span>Service: <span className={styles.hubRouteItem}>Doorstep Delivery</span></span>
          </div>
        </div>
      </motion.div>

      {/* 2. SEARCH CONSOLE */}
      <section className={styles.consoleHero}>
        <div className={styles.heroHeader}>
          <motion.div 
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: luxuryEase }}
          >
            <Truck size={14} />
            <span>Doorstep Tracking</span>
          </motion.div>

          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxuryEase, delay: 0.08 }}
          >
            Track Your <em>Good Fills</em> Order
          </motion.h1>

          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxuryEase, delay: 0.16 }}
          >
            Follow your freshly prepared batch from our Bengaluru kitchen to your doorstep. Enter your Order ID or registered mobile number below.
          </motion.p>

          {/* Search Box with Micro-Animations */}
          <motion.form 
            className={styles.searchConsole} 
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxuryEase, delay: 0.22 }}
          >
            <div className={styles.searchInputGroup}>
              <div className={styles.searchIconWrapper}>
                <Search size={19} />
              </div>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Enter Order ID (e.g. ORD-3595) or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Order ID or Mobile Number"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  title="Clear"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <motion.button
              type="submit"
              className={styles.searchBtn}
              disabled={isLoading || !searchQuery.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className={styles.spinIcon} />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Error Message Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                className={styles.errorBanner}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <AlertCircle size={20} color="#d9381e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div className={styles.errorTitle}>Order Lookup Notice</div>
                  <p className={styles.errorText}>{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. TRACKING DASHBOARD */}
      <AnimatePresence mode="wait">
        {activeOrder ? (
          <motion.section 
            key={activeOrder.orderId}
            className={styles.dashboardGrid}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
          >
            {/* Main Status Card */}
            <div className={styles.statusMasterCard}>
              <div className={styles.statusHeaderStrip}>
                <div className={styles.statusHeaderLeft}>
                  {activeOrder.statusBadgeType === 'live' && (
                    <span className={styles.badgeLive}>
                      <span className={styles.pulseDot} />
                      In Transit
                    </span>
                  )}
                  {activeOrder.statusBadgeType === 'completed' && (
                    <span className={styles.badgeDelivered}>
                      <CheckCircle2 size={13} />
                      Delivered
                    </span>
                  )}
                  {activeOrder.statusBadgeType === 'processing' && (
                    <span className={styles.badgeProcessing}>
                      <Clock size={13} />
                      Kitchen Preparation
                    </span>
                  )}
                </div>
                <div className={styles.statusHeaderRight}>
                  <Link
                    href={`/invoice/${activeOrder.orderId}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--accent-terracotta)',
                      textDecoration: 'none',
                      marginRight: '12px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(151, 65, 29, 0.08)'
                    }}
                    title="View & Download Official Invoice"
                  >
                    <FileText size={12} />
                    <span>Official Invoice</span>
                  </Link>
                  <span className={styles.awbBadgeText}>
                    DTDC AWB: <strong>{activeOrder.courier.awbNumber}</strong>
                  </span>
                </div>
              </div>

              <div className={styles.statusHeadlineBody}>
                <h2 className={styles.statusLeadTitle}>
                  {activeOrder.currentStatusHeadline}
                </h2>
                <p className={styles.statusLeadDesc}>
                  {activeOrder.currentStatusDescription}
                </p>
              </div>

              {/* Metrics Strip */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCell}>
                  <div className={styles.metricLabel}>Order ID</div>
                  <div className={styles.metricValue}>
                    <span>{activeOrder.orderId}</span>
                  </div>
                </div>

                <div className={styles.metricCell}>
                  <div className={styles.metricLabel}>DTDC Tracking Number</div>
                  <div className={styles.metricValue}>
                    <span>{activeOrder.courier.awbNumber}</span>
                    {activeOrder.courier.isAssigned && (
                      <motion.button
                        type="button"
                        className={`${styles.copyAwbBtn} ${copiedAwb ? styles.copiedBadge : ''}`}
                        onClick={() => handleCopyAwb(activeOrder.courier.awbNumber)}
                        title="Copy tracking number"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copiedAwb ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className={styles.metricCell}>
                  <div className={styles.metricLabel}>Package Weight</div>
                  <div className={styles.metricValue}>
                    <span>{activeOrder.packageSpecs.formattedWeight}</span>
                  </div>
                </div>

                <div className={styles.metricCell}>
                  <div className={styles.metricLabel}>Delivery Location</div>
                  <div className={styles.metricValue}>
                    <span>{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className={styles.progressSection}>
              <div className={styles.progressLabelRow}>
                <div className={styles.progressLabelLeft}>
                  <span>Order &amp; Delivery Progress</span>
                  <span className={styles.progressStepBadge}>
                    {activeOrder.isDelivered ? 'Step 5 of 5' : `Step ${Math.min(5, Math.max(1, Math.round(activeOrder.overallProgressPercent / 20)))} of 5`}
                  </span>
                </div>
                <span className={styles.progressPercentText}>{activeOrder.overallProgressPercent}%</span>
              </div>
              <div className={styles.progressTrack}>
                <motion.div
                  className={`${styles.progressFill} ${activeOrder.isDelivered ? styles.progressFillDelivered : ''}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${activeOrder.overallProgressPercent}%` }}
                  transition={{ duration: 1.2, ease: luxuryEase, delay: 0.15 }}
                />
              </div>
            </div>

            {/* Two-Column Details */}
            <div className={styles.telemetrySplit}>
              {/* Left Column: 5 Chronological Steps */}
              <div className={styles.timelineCard}>
                <div className={styles.timelineCardHeader}>
                  <h3 className={styles.timelineTitle}>Delivery Steps</h3>
                  <span className={styles.timelineSlaNote}>Pan-India Express</span>
                </div>

                <div className={styles.milestonesList}>
                  {activeOrder.milestones.map((m, idx) => {
                    const isCompleted = m.status === 'completed';
                    const isCurrent = m.status === 'in_progress';

                    return (
                      <motion.div
                        key={m.step}
                        className={`${styles.milestoneItem} ${
                          isCompleted
                            ? styles.milestoneItemCompleted
                            : isCurrent
                            ? styles.milestoneItemCurrent
                            : ''
                        }`}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, ease: luxuryEase, delay: idx * 0.08 }}
                        whileHover={{ x: 3 }}
                      >
                        {/* Step Marker */}
                        <div className={styles.milestoneMarker}>
                          {isCompleted ? (
                            <Check size={16} />
                          ) : isCurrent ? (
                            <span className={styles.pulseDot} style={{ width: '10px', height: '10px' }} />
                          ) : (
                            <span>{m.step}</span>
                          )}
                        </div>

                        {/* Content Box */}
                        <div className={styles.milestoneContent}>
                          <div className={styles.milestoneTopRow}>
                            <h4 className={styles.milestoneTitle}>{m.title}</h4>
                            <span className={styles.milestoneTime}>{m.timestamp}</span>
                          </div>

                          <div className={styles.milestoneLocation}>
                            <MapPin size={12} />
                            <span>{m.location}</span>
                          </div>

                          <p className={styles.milestoneNote}>{m.telemetryNote}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Courier & Manifest Details */}
              <div className={styles.sidebarCol}>
                {/* Courier Card */}
                <motion.div 
                  className={styles.sideCard}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: luxuryEase, delay: 0.18 }}
                >
                  <h3 className={styles.sideCardTitle}>
                    <span>Courier Partner</span>
                    <Truck size={18} color="var(--accent-terracotta)" />
                  </h3>

                  <div className={styles.courierGrid}>
                    <div className={styles.courierRow}>
                      <span className={styles.courierKey}>Carrier</span>
                      <span className={styles.courierVal}>{activeOrder.courier.name}</span>
                    </div>
                    <div className={styles.courierRow}>
                      <span className={styles.courierKey}>Tracking No. (AWB)</span>
                      <span className={styles.courierVal}>{activeOrder.courier.awbNumber}</span>
                    </div>
                    <div className={styles.courierRow}>
                      <span className={styles.courierKey}>DTDC Helpline</span>
                      <a href={`tel:${activeOrder.courier.helpline.replace(/\s+/g, '')}`} className={styles.courierPhoneLink}>
                        <Phone size={12} />
                        <span>{activeOrder.courier.helpline}</span>
                      </a>
                    </div>
                    <div className={styles.courierRow}>
                      <span className={styles.courierKey}>Recipient</span>
                      <span className={styles.courierVal}>
                        {activeOrder.customerName} ({activeOrder.maskedPhone})
                      </span>
                    </div>
                  </div>

                  {activeOrder.courier.isAssigned && (
                    <motion.a
                      href="https://www.dtdc.in/tracking/shipment-tracking.asp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.dtdcPortalBtn}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Check on DTDC Website</span>
                      <ExternalLink size={14} />
                    </motion.a>
                  )}
                </motion.div>

                {/* Items Card */}
                <motion.div 
                  className={styles.sideCard}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: luxuryEase, delay: 0.28 }}
                >
                  <h3 className={styles.sideCardTitle}>
                    <span>Items in This Order</span>
                    <Package size={18} color="var(--accent-terracotta)" />
                  </h3>

                  <div className={styles.itemList}>
                    {activeOrder.items.map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <img
                          src={item.imagePrimary}
                          alt={item.name}
                          className={styles.itemThumb}
                        />
                        <div className={styles.itemDetails}>
                          <div className={styles.itemName}>{item.name}</div>
                          <div className={styles.itemMeta}>
                            {item.packSize} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div className={styles.itemPrice}>
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.specsBox}>
                    <div className={styles.specItem}>
                      <ShieldCheck size={14} color="#27ae60" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Packaging:</strong> Sealed Airtight Barrier Foil Pouch</span>
                    </div>
                    <div className={styles.specItem}>
                      <Box size={14} color="var(--accent-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Batch Reference:</strong> {activeOrder.packageSpecs.batchCode}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Kitchen Support */}
                <motion.div 
                  className={styles.conciergeCard}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: luxuryEase, delay: 0.36 }}
                >
                  <h3 className={styles.conciergeTitle}>Need Help with Delivery?</h3>
                  <p className={styles.conciergeDesc}>
                    Have special delivery instructions or questions about your order? Reach our Bengaluru kitchen team directly.
                  </p>

                  <div className={styles.conciergeActions}>
                    <motion.a
                      href={`https://wa.me/919742068899?text=${encodeURIComponent(
                        `Hi Good Fills team, I am checking the status of my order ${activeOrder.orderId}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappBtn}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MessageSquare size={16} />
                      <span>WhatsApp Support</span>
                    </motion.a>

                    <motion.a
                      href="tel:+919742068899"
                      className={styles.callSupportBtn}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Phone size={15} />
                      <span>Call +91 97420 68899</span>
                    </motion.a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* 4. EMPTY STATE */}
      <AnimatePresence>
        {!activeOrder && !isLoading && (
          <motion.section 
            className={styles.dashboardGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: luxuryEase }}
          >
            <div className={styles.awaitingConsole}>
              <motion.div 
                className={styles.awaitingIconWrap}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Package size={30} />
              </motion.div>
              <h2 className={styles.awaitingTitle}>Search for Your Order</h2>
              <p className={styles.awaitingText}>
                Enter your Order ID (from your confirmation SMS or email) or your 10-digit mobile number above.
              </p>

              {/* 4 Simple Steps with Staggered Entrance */}
              <div className={styles.logisticsProcessGrid}>
                {[
                  {
                    step: 'STEP 1',
                    title: 'Order Received',
                    desc: 'Grains are soaked and sprouted for 24 hours for tender infant digestion.',
                  },
                  {
                    step: 'STEP 2',
                    title: 'Preparation & Packaging',
                    desc: 'Carefully prepared and packed in airtight pouches to preserve natural nutrients.',
                  },
                  {
                    step: 'STEP 3',
                    title: 'Foil Sealed',
                    desc: 'Sealed immediately in airtight pouches with zero preservatives.',
                  },
                  {
                    step: 'STEP 4',
                    title: 'DTDC Delivery',
                    desc: 'Dispatched via DTDC express courier straight to your doorstep with live SMS tracking.',
                  },
                ].map((item, idx) => (
                  <motion.div 
                    key={item.step}
                    className={styles.processStepCard}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: luxuryEase, delay: idx * 0.08 }}
                    whileHover={{ y: -3 }}
                  >
                    <span className={styles.stepNum}>{item.step}</span>
                    <h4 className={styles.stepTitle}>{item.title}</h4>
                    <p className={styles.stepDesc}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
