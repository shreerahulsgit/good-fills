'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Box
} from 'lucide-react';
import { TrackingTelemetryResult } from '@/lib/tracking';
import styles from './TrackView.module.css';



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
      <div className={styles.controlBar}>
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
      </div>

      {/* 2. SEARCH CONSOLE */}
      <section className={styles.consoleHero}>
        <div className={styles.heroHeader}>
          <div className={styles.eyebrow}>
            <Truck size={14} />
            <span>Doorstep Tracking</span>
          </div>
          <h1 className={styles.heroTitle}>
            Track Your <em>Good Fills</em> Order
          </h1>
          <p className={styles.heroSubtitle}>
            Follow your freshly prepared batch from our Bengaluru kitchen to your doorstep. Enter your Order ID or registered mobile number below.
          </p>

          {/* Search Box */}
          <form className={styles.searchConsole} onSubmit={handleSearchSubmit}>
            <div className={styles.searchIconWrapper}>
              <Search size={20} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Enter your Order ID (e.g. ORD-7776) or 10-digit mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Order ID or Mobile Number"
            />
            <button
              type="submit"
              className={styles.searchBtn}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="spin-animation" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>



          {/* Error Message Banner */}
          {errorMessage && (
            <div className={styles.errorBanner}>
              <AlertCircle size={20} color="#d9381e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div className={styles.errorTitle}>Order Lookup Notice</div>
                <p className={styles.errorText}>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. TRACKING DASHBOARD */}
      {activeOrder && (
        <section className={styles.dashboardGrid}>
          {/* Main Status Card */}
          <div className={styles.statusMasterCard}>
            <div className={styles.statusHeaderStrip}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  DTDC AWB:{' '}
                  <strong style={{ color: 'var(--text-light)' }}>
                    {activeOrder.courier.awbNumber}
                  </strong>
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
                    <button
                      type="button"
                      className={`${styles.copyAwbBtn} ${copiedAwb ? styles.copiedBadge : ''}`}
                      onClick={() => handleCopyAwb(activeOrder.courier.awbNumber)}
                      title="Copy tracking number"
                    >
                      {copiedAwb ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                    </button>
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

          {/* Progress Bar */}
          <div className={styles.progressSection}>
            <div className={styles.progressLabelRow}>
              <span>Order &amp; Delivery Progress</span>
              <span>{activeOrder.overallProgressPercent}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressFill} ${activeOrder.isDelivered ? styles.progressFillDelivered : ''}`}
                style={{ width: `${activeOrder.overallProgressPercent}%` }}
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
                    <div
                      key={m.step}
                      className={`${styles.milestoneItem} ${
                        isCompleted
                          ? styles.milestoneItemCompleted
                          : isCurrent
                          ? styles.milestoneItemCurrent
                          : ''
                      }`}
                      style={{ animationDelay: `${idx * 0.08}s` }}
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
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Courier & Manifest Details */}
            <div className={styles.sidebarCol}>
              {/* Courier Card */}
              <div className={styles.sideCard}>
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
                    <span className={styles.courierVal}>{activeOrder.courier.helpline}</span>
                  </div>
                  <div className={styles.courierRow}>
                    <span className={styles.courierKey}>Recipient</span>
                    <span className={styles.courierVal}>
                      {activeOrder.customerName} ({activeOrder.maskedPhone})
                    </span>
                  </div>
                </div>

                {activeOrder.courier.isAssigned && (
                  <a
                    href="https://www.dtdc.in/tracking/shipment-tracking.asp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.dtdcPortalBtn}
                  >
                    <span>Check on DTDC Website</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {/* Items Card */}
              <div className={styles.sideCard}>
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
              </div>

              {/* Kitchen Support */}
              <div className={styles.conciergeCard}>
                <h3 className={styles.conciergeTitle}>Need Help with Delivery?</h3>
                <p className={styles.conciergeDesc}>
                  Have special delivery instructions or questions about your order? Reach our Bengaluru kitchen team directly.
                </p>

                <div className={styles.conciergeActions}>
                  <a
                    href={`https://wa.me/919606456789?text=${encodeURIComponent(
                      `Hi Good Fills team, I am checking the status of my order ${activeOrder.orderId}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <MessageSquare size={16} />
                    <span>WhatsApp Support</span>
                  </a>

                  <a
                    href="tel:+919606456789"
                    className={styles.callSupportBtn}
                  >
                    <Phone size={15} />
                    <span>Call +91 96064 56789</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. EMPTY STATE */}
      {!activeOrder && !isLoading && (
        <section className={styles.dashboardGrid}>
          <div className={styles.awaitingConsole}>
            <div className={styles.awaitingIconWrap}>
              <Package size={30} />
            </div>
            <h2 className={styles.awaitingTitle}>Search for Your Order</h2>
            <p className={styles.awaitingText}>
              Enter your Order ID (from your confirmation SMS or email) or your 10-digit mobile number above.
            </p>

            {/* 4 Simple Steps */}
            <div className={styles.logisticsProcessGrid}>
              <div className={styles.processStepCard}>
                <span className={styles.stepNum}>STEP 1</span>
                <h4 className={styles.stepTitle}>Order Received</h4>
                <p className={styles.stepDesc}>
                  Grains are soaked and sprouted for 24 hours for tender infant digestion.
                </p>
              </div>

              <div className={styles.processStepCard}>
                <span className={styles.stepNum}>STEP 2</span>
                <h4 className={styles.stepTitle}>Preparation &amp; Packaging</h4>
                <p className={styles.stepDesc}>
                  Carefully prepared and packed in airtight pouches to preserve natural nutrients.
                </p>
              </div>

              <div className={styles.processStepCard}>
                <span className={styles.stepNum}>STEP 3</span>
                <h4 className={styles.stepTitle}>Foil Sealed</h4>
                <p className={styles.stepDesc}>
                  Sealed immediately in airtight pouches with zero preservatives.
                </p>
              </div>

              <div className={styles.processStepCard}>
                <span className={styles.stepNum}>STEP 4</span>
                <h4 className={styles.stepTitle}>DTDC Delivery</h4>
                <p className={styles.stepDesc}>
                  Dispatched via DTDC express courier straight to your doorstep with live SMS tracking.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
