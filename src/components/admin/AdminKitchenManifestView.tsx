'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  CheckCircle2,
  Scale,
  Clock,
  Check,
  RotateCcw,
  Package,
  Search,
  ChefHat,
  Filter,
  CheckSquare,
  Square,
  Truck,
  Sparkles,
  Archive,
} from 'lucide-react';
import { Order, Product, ProductCategory } from '@/types';
import { getUnifiedStatus, UnifiedStatus } from './AdminDispatchView';
import styles from './AdminKitchenManifestView.module.css';

interface AdminKitchenManifestViewProps {
  orders: Order[];
  allProducts: Product[];
  onQuickAdvance: (orderId: string, targetStatus: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

interface AggregatedBatchProduct {
  productId: string;
  productName: string;
  packSize: string;
  category: ProductCategory;
  imageUrl: string;
  totalQuantity: number;
  unitWeightGrams: number;
  totalGrams: number;
  unpackedCount: number;
  orderRefs: Array<{
    orderId: string;
    customerName: string;
    quantity: number;
    city: string;
    status: string;
  }>;
}

export function AdminKitchenManifestView({
  orders,
  allProducts,
  onQuickAdvance,
  showToast,
}: AdminKitchenManifestViewProps) {
  // Filters: strictly wired to operational states
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all-active' | 'completed'>('pending');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'unprepared' | 'prepared'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '48h'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancingAll, setIsAdvancingAll] = useState(false);
  const [advancingBatchId, setAdvancingBatchId] = useState<string | null>(null);

  // Today's Date String for localStorage keys
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Simple, Direct Prepared State: { [productId]: boolean }
  const [preparedBatches, setPreparedBatches] = useState<Record<string, boolean>>({});

  // Load saved prep state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`gf_kitchen_prepared_${todayKey}`);
      if (saved) {
        setPreparedBatches(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, [todayKey]);

  // Toggle batch prepared status
  const toggleBatchPrepared = (productId: string) => {
    setPreparedBatches((prev) => {
      const isCurrentlyPrepared = !prev[productId];
      const updated = {
        ...prev,
        [productId]: isCurrentlyPrepared,
      };

      try {
        localStorage.setItem(`gf_kitchen_prepared_${todayKey}`, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      showToast(
        isCurrentlyPrepared ? 'Marked batch as prepared ✓' : 'Marked batch as pending',
        isCurrentlyPrepared ? 'success' : 'info'
      );

      return updated;
    });
  };

  // Reset all ticks for today
  const handleResetAllTicks = () => {
    if (!window.confirm('Reset all batch checkboxes for today?')) return;
    setPreparedBatches({});
    try {
      localStorage.removeItem(`gf_kitchen_prepared_${todayKey}`);
      showToast('Daily kitchen checkboxes reset', 'info');
    } catch {
      // Ignore
    }
  };

  // Total Orders Already Delivered or Dispatched (Kitchen work is 100% completed)
  const totalCompletedOrders = useMemo(() => {
    return orders.filter((o) => {
      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
      return u === 'Delivered' || u === 'Shipped' || u === 'Out for Delivery';
    }).length;
  }, [orders]);

  // Filter orders for kitchen batch preparation:
  // Strictly excludes Delivered/Shipped/Cancelled orders from active views!
  const relevantOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const fortyEightHoursAgo = now.getTime() - 48 * 3600 * 1000;

    return orders.filter((order) => {
      const u = getUnifiedStatus(order.orderStatus, order.shipmentStatus, order.paymentStatus);

      // 1. Status wiring
      if (statusFilter === 'pending') {
        // Only Confirmed orders waiting for kitchen prep (Delivered / Shipped / Cancelled NEVER included!)
        if (u !== 'Confirmed') return false;
      } else if (statusFilter === 'all-active') {
        // Active in kitchen: Confirmed (needs cooking) or Processing (packed, waiting for pickup)
        if (u !== 'Confirmed' && u !== 'Processing') return false;
      } else if (statusFilter === 'completed') {
        // Archive of orders where kitchen work is already delivered/shipped
        if (u !== 'Delivered' && u !== 'Shipped' && u !== 'Out for Delivery') return false;
      }

      // 2. Date filter
      const orderTime = new Date(order.createdAt).getTime();
      if (dateFilter === 'today' && orderTime < startOfToday) return false;
      if (dateFilter === '48h' && orderTime < fortyEightHoursAgo) return false;

      return true;
    });
  }, [orders, statusFilter, dateFilter]);

  // Aggregate products from filtered orders (Exact Product & Total KG)
  const aggregatedProducts: AggregatedBatchProduct[] = useMemo(() => {
    const map = new Map<string, AggregatedBatchProduct>();

    relevantOrders.forEach((order) => {
      if (!order.items || !Array.isArray(order.items)) return;

      const orderUStatus = getUnifiedStatus(order.orderStatus, order.shipmentStatus, order.paymentStatus);
      const isOrderUnpacked = orderUStatus === 'Confirmed';

      order.items.forEach((item) => {
        const prod = item.product || allProducts.find((p) => (item as any).productId === p.id);
        const prodId = prod?.id || (item as any).productId || `unknown-${item.quantity}`;
        const name = prod?.name || (item as any).productName || 'Traditional Creation';
        const packSize = prod?.packSize || (item as any).packSize || '250g';
        const category = prod?.category || 'baby-kids';
        const imageUrl = prod?.images?.primary || '/logo.png';
        const unitGrams = (prod?.productWeightGrams && prod.productWeightGrams > 0) ? prod.productWeightGrams : 250;
        const qty = item.quantity || 1;

        if (!map.has(prodId)) {
          map.set(prodId, {
            productId: prodId,
            productName: name,
            packSize,
            category,
            imageUrl,
            totalQuantity: qty,
            unitWeightGrams: unitGrams,
            totalGrams: qty * unitGrams,
            unpackedCount: isOrderUnpacked ? qty : 0,
            orderRefs: [
              {
                orderId: order.id,
                customerName: order.customerName || 'Patron',
                quantity: qty,
                city: order.shippingAddress?.city || 'Bengaluru',
                status: orderUStatus,
              },
            ],
          });
        } else {
          const existing = map.get(prodId)!;
          existing.totalQuantity += qty;
          existing.totalGrams += qty * unitGrams;
          if (isOrderUnpacked) {
            existing.unpackedCount += qty;
          }
          existing.orderRefs.push({
            orderId: order.id,
            customerName: order.customerName || 'Patron',
            quantity: qty,
            city: order.shippingAddress?.city || 'Bengaluru',
            status: orderUStatus,
          });
        }
      });
    });

    let list = Array.from(map.values());

    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.productId.toLowerCase().includes(q)
      );
    }

    // Completion filter (prepared vs unprepared)
    if (completionFilter === 'prepared') {
      list = list.filter((p) => !!preparedBatches[p.productId]);
    } else if (completionFilter === 'unprepared') {
      list = list.filter((p) => !preparedBatches[p.productId]);
    }

    // Sort by largest batch weight first (heaviest grinding work on top)
    list.sort((a, b) => b.totalGrams - a.totalGrams);

    return list;
  }, [relevantOrders, allProducts, categoryFilter, searchQuery, completionFilter, preparedBatches]);

  // Overall Batch Metrics
  const totalOrdersInBatch = relevantOrders.length;
  const totalPacksInBatch = aggregatedProducts.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalNetGramsInBatch = aggregatedProducts.reduce((sum, p) => sum + p.totalGrams, 0);

  // Preparation Progress
  const totalUniqueBatches = aggregatedProducts.length;
  const completedBatchesCount = aggregatedProducts.filter((p) => !!preparedBatches[p.productId]).length;
  const completionPercentage =
    totalUniqueBatches > 0 ? Math.round((completedBatchesCount / totalUniqueBatches) * 100) : 0;

  // Advance All Confirmed Orders for a specific Product Batch
  const handleAdvanceProductBatch = async (batch: AggregatedBatchProduct) => {
    const confirmedOrderIds = Array.from(
      new Set(
        batch.orderRefs
          .filter((ref) => ref.status === 'Confirmed')
          .map((ref) => ref.orderId)
      )
    );

    if (confirmedOrderIds.length === 0) {
      showToast(`All orders for ${batch.productName} are already marked as packed!`, 'info');
      return;
    }

    setAdvancingBatchId(batch.productId);
    showToast(`Marking ${confirmedOrderIds.length} orders for ${batch.productName} as packed...`, 'info');

    try {
      for (const orderId of confirmedOrderIds) {
        await onQuickAdvance(orderId, 'Processing');
      }

      // Automatically mark this product batch as prepared
      setPreparedBatches((prev) => {
        const updated = { ...prev, [batch.productId]: true };
        try {
          localStorage.setItem(`gf_kitchen_prepared_${todayKey}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      showToast(`Done! ${confirmedOrderIds.length} orders updated to Packed & Ready ✓`, 'success');
    } catch {
      showToast('Could not update some orders. Please try again.', 'error');
    } finally {
      setAdvancingBatchId(null);
    }
  };

  // Advance All Confirmed Orders to Processing (Cooked & Packed)
  const handleAdvanceAllBatch = async () => {
    const confirmedOrders = relevantOrders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Confirmed');
    if (confirmedOrders.length === 0) {
      showToast('All orders in this batch are already marked as packed!', 'info');
      return;
    }

    if (
      !window.confirm(
        `Mark all ${confirmedOrders.length} orders as cooked & packed? This will notify customers that their batch is ready for pickup.`
      )
    ) {
      return;
    }

    setIsAdvancingAll(true);
    showToast(`Marking ${confirmedOrders.length} orders as packed...`, 'info');

    try {
      for (const order of confirmedOrders) {
        await onQuickAdvance(order.id, 'Processing');
      }
      showToast(`Success! ${confirmedOrders.length} orders marked as packed & ready.`, 'success');
    } catch {
      showToast('Could not update some orders. Please try again.', 'error');
    } finally {
      setIsAdvancingAll(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <header className={styles.manifestHeaderStrip}>
        <div>
          <h1 className={styles.overviewTitle}>Daily Kitchen Prep Manifest</h1>
          <p className={styles.overviewDateText}>
            {todayFormatted}
            {totalCompletedOrders > 0 ? ` • ${totalCompletedOrders} dispatched or delivered` : ''}
          </p>
        </div>

        <div className={styles.manifestHeaderActions}>
          <button
            type="button"
            onClick={() => window.print()}
            className={styles.printBtn}
            title="Print clean A4 prep sheet for the kitchen clipboard"
          >
            <Printer size={14} />
            <span>Print Batch Sheet</span>
          </button>

          {statusFilter !== 'completed' && (
            <button
              type="button"
              onClick={handleAdvanceAllBatch}
              disabled={isAdvancingAll || relevantOrders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Confirmed').length === 0}
              className={styles.advanceAllBtn}
              title="Mark all confirmed orders in this list as packed and ready for dispatch"
            >
              <CheckCircle2 size={14} />
              <span>{isAdvancingAll ? 'Updating Orders...' : 'Mark All as Packed'}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Key Operational Metrics Deck */}
      <section className={styles.metricsGrid} aria-label="Kitchen Production Metrics">
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Weight to Prepare</span>
            <Scale size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>
            {totalNetGramsInBatch >= 1000
              ? `${(totalNetGramsInBatch / 1000).toFixed(2)} kg`
              : `${totalNetGramsInBatch} g`}
          </div>
          <div className={styles.metricSubtext}>
            {statusFilter === 'completed' ? 'Total volume already prepared' : 'Volume needed across active orders'}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Packets to Fill</span>
            <Package size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{totalPacksInBatch}</div>
          <div className={styles.metricSubtext}>Pouches to seal and label</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>
              {statusFilter === 'completed' ? 'Delivered Orders' : 'Orders Awaiting Prep'}
            </span>
            <Clock size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{totalOrdersInBatch}</div>
          <div className={styles.metricSubtext}>
            {statusFilter === 'completed' ? 'Kitchen prep finished' : 'Pending cooking & packing'}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Batch Prep Progress</span>
            <ChefHat size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{completionPercentage}%</div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${completionPercentage}%` }} />
          </div>
          <div className={styles.metricSubtext} style={{ marginTop: '6px' }}>
            {completedBatchesCount} of {totalUniqueBatches} product batches ready
          </div>
        </div>
      </section>

      {/* 3. Toolbar & Filtering Strip */}
      <div className={styles.toolbar}>
        <div className={styles.filtersGroup}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Order Flow:</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by order lifecycle status"
            >
              <option value="pending">Needs Kitchen Prep (Confirmed)</option>
              <option value="all-active">All Active in Kitchen (Confirmed + Packed)</option>
              <option value="completed">Completed &amp; Delivered (Prep Finished Archive)</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Kitchen Ticks:</label>
            <select
              className={styles.filterSelect}
              value={completionFilter}
              onChange={(e) => setCompletionFilter(e.target.value as any)}
              aria-label="Filter by kitchen completion status"
            >
              <option value="all">All Batches</option>
              <option value="unprepared">Pending Prep Only</option>
              <option value="prepared">Prepared Batches (Done)</option>
            </select>
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Category:</label>
            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              aria-label="Filter by product category"
            >
              <option value="all">All Categories</option>
              <option value="baby-kids">Baby &amp; Kids</option>
              <option value="nutrition-wellness">Health &amp; Wellness</option>
              <option value="pantry-beverages">Pantry &amp; Beverages</option>
              <option value="skin-bath">Skin &amp; Bath</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Production Batches Section (What Product, How Much KG) */}
      <section aria-label="Consolidated Production Batches">
        <div className={styles.sectionBlockHeader}>
          <div>
            <h2 className={styles.sectionBlockTitle}>
              {statusFilter === 'completed'
                ? `Completed Production Batches (${aggregatedProducts.length} Products)`
                : `Batch Production Deck (${aggregatedProducts.length} Products)`}
            </h2>
            <span className={styles.sectionBlockCount}>
              {todayFormatted} • Aggregated weights for roasting, milling, and packing
            </span>
          </div>
        </div>

        {aggregatedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h3 className={styles.emptyStateTitle}>
              {statusFilter === 'completed'
                ? 'No delivered orders in this range'
                : 'All Active Kitchen Prep is Done!'}
            </h3>
            <p className={styles.emptyStateText}>
              {statusFilter === 'completed'
                ? 'No past orders matched the filter criteria.'
                : 'All customer orders have been prepared and packed. New incoming orders will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className={styles.batchGrid}>
            {aggregatedProducts.map((batch) => {
              const isPrepared = !!preparedBatches[batch.productId];
              const totalKgFormatted =
                batch.totalGrams >= 1000
                  ? `${(batch.totalGrams / 1000).toFixed(2)} kg`
                  : `${batch.totalGrams} g`;

              const isBatchAdvancing = advancingBatchId === batch.productId;

              return (
                <article
                  key={batch.productId}
                  className={`${styles.productBatchCard} ${isPrepared ? styles.productBatchCardDone : ''}`}
                >
                  {/* Main Product Info & Large Weight Callout */}
                  <div className={styles.batchMainRow}>
                    <div className={styles.batchProductIdentity}>
                      <img
                        src={batch.imageUrl}
                        alt={batch.productName}
                        className={styles.batchProductImg}
                      />
                      <div className={styles.batchProductDetails}>
                        <h3 className={styles.batchProductName}>{batch.productName}</h3>
                        <div className={styles.batchPackSizeNote}>
                          Standard pack: <strong>{batch.packSize}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Prominent High-Visibility Weight Box */}
                    <div className={styles.batchWeightBox}>
                      <span className={styles.batchWeightLabel}>Total to Prepare</span>
                      <span className={styles.batchWeightValue}>{totalKgFormatted}</span>
                    </div>
                  </div>

                  {/* Orders Cross-Reference */}
                  <div className={styles.batchOrdersSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.batchOrdersLabel}>
                        Needed for {batch.orderRefs.length} {batch.orderRefs.length === 1 ? 'order' : 'orders'}:
                      </span>
                      {batch.unpackedCount > 0 && (
                        <span style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700 }}>
                          {batch.unpackedCount} to pack
                        </span>
                      )}
                    </div>
                    <div className={styles.batchOrderPillsContainer}>
                      {batch.orderRefs.map((ref, idx) => {
                        const isDone = ref.status === 'Processing' || ref.status === 'Shipped' || ref.status === 'Delivered';
                        return (
                          <span
                            key={idx}
                            className={`${styles.batchOrderPill} ${isDone ? styles.batchOrderPillDone : ''}`}
                            title={`${ref.customerName} (${ref.city}) — ${ref.status}`}
                          >
                            <strong>#{ref.orderId.slice(-6)}</strong> ({ref.quantity}×){' '}
                            {isDone ? '✓' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action / Checkbox Bar */}
                  <div className={styles.batchActionBar}>
                    <button
                      type="button"
                      onClick={() => toggleBatchPrepared(batch.productId)}
                      className={`${styles.prepToggleBtn} ${isPrepared ? styles.prepToggleBtnDone : ''}`}
                    >
                      {isPrepared ? (
                        <>
                          <CheckSquare size={16} />
                          <span>Prepared &amp; Ready</span>
                        </>
                      ) : (
                        <>
                          <Square size={16} />
                          <span>Mark as Prepared</span>
                        </>
                      )}
                    </button>

                    {batch.unpackedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceProductBatch(batch)}
                        disabled={isBatchAdvancing}
                        className={styles.batchPackOrdersBtn}
                        title={`Mark all confirmed orders for ${batch.productName} as packed`}
                      >
                        <Package size={14} />
                        <span>
                          {isBatchAdvancing ? 'Updating...' : `Pack ${batch.unpackedCount} Orders`}
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Customer Orders Packing Breakdown Table */}
      <section aria-label="Customer Orders Packing Manifest" style={{ marginTop: 'var(--space-6)' }}>
        <div className={styles.sectionBlockHeader}>
          <div>
            <h2 className={styles.sectionBlockTitle}>
              Customer Orders Packing Manifest ({relevantOrders.length} Orders)
            </h2>
            <span className={styles.sectionBlockCount}>
              Pack each customer&apos;s parcel with their freshly prepared items and mark them ready for dispatch
            </span>
          </div>
        </div>

        <div className={styles.manifestTableWrapper}>
          <table className={styles.manifestTable}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer &amp; City</th>
                <th>Items to Pack</th>
                <th>Total Weight</th>
                <th>Kitchen Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {relevantOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No customer orders matching the current filter.
                  </td>
                </tr>
              ) : (
                relevantOrders.map((order) => {
                  const uStatus = getUnifiedStatus(order.orderStatus, order.shipmentStatus, order.paymentStatus);
                  const isConfirmed = uStatus === 'Confirmed';
                  const isProcessing = uStatus === 'Processing';
                  const isDelivered = uStatus === 'Delivered';
                  const isShipped = uStatus === 'Shipped' || uStatus === 'Out for Delivery';

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderIdBadge}>#{order.id}</span>
                        <div className={styles.orderTimeText}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div className={styles.customerNameCell}>{order.customerName}</div>
                        <div className={styles.customerCityCell}>
                          {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'KA'}
                        </div>
                      </td>

                      <td>
                        <ul className={styles.itemsBreakdownList}>
                          {order.items?.map((item, iIdx) => {
                            const prod = item.product;
                            const name = prod?.name || (item as any).productName || 'Traditional Creation';
                            const pack = prod?.packSize || (item as any).packSize || '250g';
                            return (
                              <li key={iIdx} className={styles.itemsBreakdownItem}>
                                <span className={styles.itemQty}>{item.quantity}×</span>
                                <span className={styles.itemName}>{name}</span>
                                <span className={styles.itemPackSize}>({pack})</span>
                              </li>
                            );
                          })}
                        </ul>
                      </td>

                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {order.weightGrams
                          ? order.weightGrams >= 1000
                            ? `${(order.weightGrams / 1000).toFixed(2)} kg`
                            : `${order.weightGrams}g`
                          : '500g'}
                      </td>

                      <td>
                        {isConfirmed && (
                          <span className={styles.statusPillConfirmed}>
                            Needs Prep &amp; Pack
                          </span>
                        )}
                        {isProcessing && (
                          <span className={styles.statusPillProcessing}>
                            Packed &amp; Ready
                          </span>
                        )}
                        {isShipped && (
                          <span className={styles.statusPillShipped}>
                            In Transit
                          </span>
                        )}
                        {isDelivered && (
                          <span className={styles.statusPillDelivered}>
                            ✓ Delivered
                          </span>
                        )}
                      </td>

                      <td>
                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => onQuickAdvance(order.id, 'Processing')}
                            className={styles.actionBtnPrepared}
                            title="Mark this order freshly cooked and packed"
                          >
                            Mark Packed ✓
                          </button>
                        )}
                        {isProcessing && (
                          <button
                            type="button"
                            onClick={() => onQuickAdvance(order.id, 'Shipped')}
                            className={styles.dispatchOrderBtn}
                            title="Hand over parcel for courier dispatch"
                          >
                            <Truck size={13} />
                            <span>Dispatch Order 🚚</span>
                          </button>
                        )}
                        {(isShipped || isDelivered) && (
                          <span className={styles.readyTag}>
                            Kitchen Prep Completed ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Clean Printable Kitchen Prep Sheet (Visible only when printed) */}
      <div className={styles.printOnlySection}>
        <div className={styles.printHeader}>
          <h1>GOOD FILLS — DAILY KITCHEN PREPARATION SHEET</h1>
          <p>Date: {todayFormatted} | Generated from Live Admin Console</p>
        </div>

        <table className={styles.printTable}>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Done</th>
              <th>Product Name</th>
              <th>Pack Size</th>
              <th>Total Weight</th>
              <th>Pouches</th>
              <th>Order Numbers</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedProducts.map((p, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center', fontSize: '1.2rem' }}>[ ]</td>
                <td><strong>{p.productName}</strong></td>
                <td>{p.packSize}</td>
                <td>
                  <strong>
                    {p.totalGrams >= 1000 ? `${(p.totalGrams / 1000).toFixed(2)} kg` : `${p.totalGrams} g`}
                  </strong>
                </td>
                <td>{p.totalQuantity} pkts</td>
                <td style={{ fontSize: '0.8rem' }}>
                  {p.orderRefs.map((r) => `#${r.orderId.slice(-6)}`).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
