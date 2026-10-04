'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame,
  Printer,
  CheckCircle2,
  Scale,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
  Package,
  Filter,
  Calendar,
  ArrowRight,
  Search,
  FileText,
  Leaf,
  ChefHat,
  Coffee,
  Heart,
  Droplets,
} from 'lucide-react';
import { Order, Product, ProductCategory } from '@/types';
import styles from './AdminKitchenManifestView.module.css';

interface AdminKitchenManifestViewProps {
  orders: Order[];
  allProducts: Product[];
  onQuickAdvance: (orderId: string, targetStatus: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  adminPin?: string;
}

// Authentic Atelier Culinary Specifications for Made-to-Order Bangalore Kitchen
const KITCHEN_RECIPES: Record<string, {
  roastProfile: string;
  millingTexture: string;
  sproutingTime: string;
  packagingGuidance: string;
}> = {
  'prod-01': {
    sproutingTime: '24-hour Sprouted Moong & Ragi',
    roastProfile: 'Gentle iron skillet roast until nutty grain aroma',
    millingTexture: 'Ultra-fine 100-mesh silky flour for baby digestion',
    packagingGuidance: 'Cool completely before sealing in 250g gold airtight pouches',
  },
  'prod-02': {
    sproutingTime: '48-hour Sprouted Mandya Finger Millet',
    roastProfile: 'Slow wood-fired / iron skillet roast until popping aroma',
    millingTexture: 'Velvety stone-milled powder, 100% lump-free',
    packagingGuidance: 'Airtight nitrogen flush seal with 6-month batch stamp',
  },
  'prod-03': {
    sproutingTime: 'Sprouted Millets & Raw Himalayan Nuts',
    roastProfile: 'Cold-roast seeds; dry roast nuts separately to preserve oils',
    millingTexture: 'Medium-fine digestible texture with saffron infusion',
    packagingGuidance: 'Seal immediately to preserve delicate saffron & cardamom volatiles',
  },
  'prod-04': {
    sproutingTime: '36-hour Dharwad Whole Green Gram',
    roastProfile: 'Light golden roast to deactivate oligosaccharides',
    millingTexture: 'Silky digestible flour, zero coarse husks',
    packagingGuidance: 'Double-sealed moisture barrier pouch (250g)',
  },
  'prod-05': {
    sproutingTime: 'Traditional Karnataka Sprouted Ragi & Red Rice',
    roastProfile: 'Slow malt roasting over low flame',
    millingTexture: 'Double-sieved malt extract flour',
    packagingGuidance: 'Gold zipper pouch; pack with batch dispatch label',
  },
  'prod-06': {
    sproutingTime: '5 Ancient Millets (Kodo, Foxtail, Little, Barnyard, Proso)',
    roastProfile: 'De-husked and multi-grain slow flame roasted',
    millingTexture: 'Nutrient-dense fine porridge meal',
    packagingGuidance: 'Pack tightly in 250g nitrogen-sealed bags',
  },
  'prod-07': {
    sproutingTime: 'Wild Kasturi Turmeric & Sun-Dried Rose Petals',
    roastProfile: 'Zero heat processing — purely shade dried botanical blending',
    millingTexture: 'Stone-pulverized, sieved 3 times through silk mesh',
    packagingGuidance: 'Airtight foil pack to preserve natural essential oils',
  },
  'prod-08': {
    sproutingTime: 'Cooling Botanicals, Neem & Green Moong',
    roastProfile: 'Zero heat botanical shade drying',
    millingTexture: 'Gentle body scrub grain, 100% soap-free',
    packagingGuidance: '200g standing pouch with tamper-evident seal',
  },
  'prod-09': {
    sproutingTime: 'Sprouted Soya, Chickpeas & Raw Cold Seeds',
    roastProfile: 'Flash roasted to eliminate phytates while keeping protein intact',
    millingTexture: 'High-bioavailability micro-particle grind',
    packagingGuidance: '400g moisture barrier pouch',
  },
  'prod-10': {
    sproutingTime: '13 Himalayan & Western Ghats Wild Herbs',
    roastProfile: 'Shade-dried Ashwagandha, Tulsi, Licorice, Mulethi',
    millingTexture: 'Coarse botanical decoction cut (not powdered)',
    packagingGuidance: '150g resealable aromatic pouch',
  },
  'prod-11': {
    sproutingTime: 'Chikmagalur Plantation A Arabica & Robusta',
    roastProfile: 'Artisan medium-dark drum roast + 20% roasted chicory',
    millingTexture: 'Traditional South Indian brass filter drip coarse grind',
    packagingGuidance: 'Pack warm in 500g one-way valve degassing foil bags',
  },
  'prod-12': {
    sproutingTime: 'Wild Western Ghats Forest Apiary',
    roastProfile: 'Unheated, cold-settled multifloral raw honey',
    millingTexture: 'Natural raw nectar, muslin gravity-strained',
    packagingGuidance: '500g glass jar with tamper-proof wooden-top seal',
  },
};

const DEFAULT_RECIPE = {
  sproutingTime: 'Hand-selected traditional whole grains',
  roastProfile: 'Small-batch artisanal pan roasting',
  millingTexture: 'Traditional stone-ground fine texture',
  packagingGuidance: 'Sealed fresh to order with batch dispatch code',
};

interface AggregatedBatchProduct {
  productId: string;
  productName: string;
  packSize: string;
  category: ProductCategory;
  imageUrl: string;
  totalQuantity: number;
  unitWeightGrams: number;
  totalGrams: number;
  recipe: typeof DEFAULT_RECIPE;
  orderRefs: Array<{
    orderId: string;
    customerName: string;
    quantity: number;
    city: string;
  }>;
}

export function AdminKitchenManifestView({
  orders,
  allProducts,
  onQuickAdvance,
  showToast,
}: AdminKitchenManifestViewProps) {
  // Filters
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all-active' | 'all'>('pending');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '48h'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancingAll, setIsAdvancingAll] = useState(false);

  // Today's Date String for localStorage keys
  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Checklist state saved in localStorage
  const [checklist, setChecklist] = useState<Record<string, {
    weighed?: boolean;
    roasted?: boolean;
    milled?: boolean;
    packed?: boolean;
  }>>({});

  // Load saved checklist on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`gf_kitchen_checklist_${todayKey}`);
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [todayKey]);

  // Toggle step in checklist
  const toggleChecklistStep = (productId: string, step: 'weighed' | 'roasted' | 'milled' | 'packed') => {
    setChecklist((prev) => {
      const current = prev[productId] || {};
      const updated = {
        ...prev,
        [productId]: {
          ...current,
          [step]: !current[step],
        },
      };
      try {
        localStorage.setItem(`gf_kitchen_checklist_${todayKey}`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Filter orders for kitchen batch preparation
  const relevantOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const fortyEightHoursAgo = now.getTime() - 48 * 3600 * 1000;

    return orders.filter((order) => {
      // Status filter
      if (statusFilter === 'pending') {
        // Only orders that are confirmed and need preparation
        if (order.orderStatus !== 'Confirmed') return false;
      } else if (statusFilter === 'all-active') {
        // Confirmed or Processing (being packed)
        if (order.orderStatus !== 'Confirmed' && order.orderStatus !== 'Processing') return false;
      }

      // Date filter
      const orderTime = new Date(order.createdAt).getTime();
      if (dateFilter === 'today' && orderTime < startOfToday) return false;
      if (dateFilter === '48h' && orderTime < fortyEightHoursAgo) return false;

      return true;
    });
  }, [orders, statusFilter, dateFilter]);

  // Aggregate products from filtered orders
  const aggregatedProducts: AggregatedBatchProduct[] = useMemo(() => {
    const map = new Map<string, AggregatedBatchProduct>();

    relevantOrders.forEach((order) => {
      if (!order.items || !Array.isArray(order.items)) return;

      order.items.forEach((item) => {
        const prod = item.product || allProducts.find((p) => (item as any).productId === p.id);
        const prodId = prod?.id || (item as any).productId || `unknown-${item.quantity}`;
        const name = prod?.name || (item as any).productName || 'Traditional Creation';
        const packSize = prod?.packSize || (item as any).packSize || '250g';
        const category = prod?.category || 'baby-kids';
        const imageUrl = prod?.images?.primary || '/logo.png';
        const unitGrams = prod?.productWeightGrams || 250;
        const qty = item.quantity || 1;

        const recipe = KITCHEN_RECIPES[prodId] || KITCHEN_RECIPES[prod?.id || ''] || DEFAULT_RECIPE;

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
            recipe,
            orderRefs: [
              {
                orderId: order.id,
                customerName: order.customerName || 'Patron',
                quantity: qty,
                city: order.shippingAddress?.city || 'Bengaluru',
              },
            ],
          });
        } else {
          const existing = map.get(prodId)!;
          existing.totalQuantity += qty;
          existing.totalGrams += qty * unitGrams;
          existing.orderRefs.push({
            orderId: order.id,
            customerName: order.customerName || 'Patron',
            quantity: qty,
            city: order.shippingAddress?.city || 'Bengaluru',
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

    // Sort by largest batch weight first
    list.sort((a, b) => b.totalGrams - a.totalGrams);

    return list;
  }, [relevantOrders, allProducts, categoryFilter, searchQuery]);

  // Overall Batch Metrics
  const totalOrdersInBatch = relevantOrders.length;
  const totalPacksInBatch = aggregatedProducts.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalNetGramsInBatch = aggregatedProducts.reduce((sum, p) => sum + p.totalGrams, 0);

  // Compute Completed Checklist Steps
  const totalChecklistItems = aggregatedProducts.length * 4;
  let completedChecklistItems = 0;
  aggregatedProducts.forEach((p) => {
    const c = checklist[p.productId];
    if (c?.weighed) completedChecklistItems++;
    if (c?.roasted) completedChecklistItems++;
    if (c?.milled) completedChecklistItems++;
    if (c?.packed) completedChecklistItems++;
  });
  const checklistPercent = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  // Advance All Confirmed Orders to Processing (Prepared & Packed)
  const handleAdvanceAllBatch = async () => {
    const confirmedOrders = relevantOrders.filter((o) => o.orderStatus === 'Confirmed');
    if (confirmedOrders.length === 0) {
      showToast('All batch orders are already marked as Prepared & Packed!', 'info');
      return;
    }

    if (
      !window.confirm(
        `Advance ${confirmedOrders.length} orders to "Prepared & Packed (Processing)"? This updates customer live tracking portals.`
      )
    ) {
      return;
    }

    setIsAdvancingAll(true);
    showToast(`Advancing ${confirmedOrders.length} orders in kitchen queue...`, 'info');

    try {
      for (const order of confirmedOrders) {
        await onQuickAdvance(order.id, 'Processing');
      }
      showToast(`Batch updated! All ${confirmedOrders.length} orders marked Prepared & Packed.`, 'success');
    } catch {
      showToast('Error updating some orders in batch.', 'error');
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
      {/* 1. Header Banner */}
      <header className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>Bengaluru Atelier Production Deck</span>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span>Live Kitchen Shift</span>
            </span>
          </div>
          <h1 className={styles.title}>Kitchen Batch Prep Manifest & Daily Milling Planner</h1>
          <p className={styles.subtitle}>
            Live made-to-order production queue. Aggregates all open patron orders into exact raw milling weights, pan-roasting batches, and packaging slips for zero warehouse storage.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => window.print()}
            className={styles.printBtn}
            title="Print clean A4 kitchen clipboard sheet"
          >
            <Printer size={15} />
            <span>Print Kitchen Sheet</span>
          </button>

          <button
            type="button"
            onClick={handleAdvanceAllBatch}
            disabled={isAdvancingAll || relevantOrders.length === 0}
            className={styles.advanceAllBtn}
            title="Advance all confirmed orders in this batch to Prepared & Packed"
          >
            <CheckCircle2 size={15} />
            <span>{isAdvancingAll ? 'Updating Orders...' : 'Mark Batch Prepared & Packed'}</span>
          </button>
        </div>
      </header>

      {/* 2. Real-Time Metrics Deck */}
      <section className={styles.metricsGrid} aria-label="Kitchen Batch Metrics">
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Batch Queue</span>
            <Clock size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{totalOrdersInBatch}</div>
          <div className={styles.metricSubtext}>Open patron orders to prepare</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Packs to Fill</span>
            <Package size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{totalPacksInBatch}</div>
          <div className={styles.metricSubtext}>Airtight pouches to seal warm</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Raw Milling Weight</span>
            <Scale size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>
            {totalNetGramsInBatch >= 1000
              ? `${(totalNetGramsInBatch / 1000).toFixed(2)} kg`
              : `${totalNetGramsInBatch} g`}
          </div>
          <div className={styles.metricSubtext}>Total sprouted grains & botanicals</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Prep Checklist</span>
            <ChefHat size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{checklistPercent}%</div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${checklistPercent}%` }} />
          </div>
          <div className={styles.metricSubtext} style={{ marginTop: '4px' }}>
            {completedChecklistItems} of {totalChecklistItems} kitchen steps completed
          </div>
        </div>
      </section>

      {/* 3. Toolbar & Filtering Strip */}
      <div className={styles.toolbar}>
        <div className={styles.filtersGroup}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter by order status"
          >
            <option value="pending">Queue: Confirmed (Needs Prep)</option>
            <option value="all-active">Queue: Confirmed + Packed</option>
            <option value="all">Queue: All Recent Orders</option>
          </select>

          <select
            className={styles.filterSelect}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            aria-label="Filter by date range"
          >
            <option value="all">All Pending Fulfillment</option>
            <option value="today">Today&apos;s Orders Only</option>
            <option value="48h">Past 48 Hours</option>
          </select>

          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="baby-kids">Baby &amp; Kids</option>
            <option value="nutrition-wellness">Nutrition &amp; Wellness</option>
            <option value="pantry-beverages">Pantry &amp; Beverages</option>
            <option value="skin-bath">Skin &amp; Bath</option>
          </select>
        </div>

        <div className={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search grain or recipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 4. Milling & Roasting Aggregation Cards (The Core Kitchen Prep Deck) */}
      <section aria-label="Milling & Roasting Batches">
        <div className={styles.sectionBlockHeader}>
          <div>
            <h2 className={styles.sectionBlockTitle}>
              Today&apos;s Roasting &amp; Milling Deck ({aggregatedProducts.length} Creations)
            </h2>
            <span className={styles.sectionBlockCount}>{todayFormatted} • Small-Batch Made-to-Order</span>
          </div>
        </div>

        {aggregatedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700 }}>
              All Kitchen Batches Complete!
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              There are no pending confirmed orders waiting for kitchen preparation under the selected filters.
            </p>
          </div>
        ) : (
          <div className={styles.batchGrid}>
            {aggregatedProducts.map((batch) => {
              const itemCheck = checklist[batch.productId] || {};
              const isAllChecked = itemCheck.weighed && itemCheck.roasted && itemCheck.milled && itemCheck.packed;

              return (
                <article
                  key={batch.productId}
                  className={styles.productPrepCard}
                  style={isAllChecked ? { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.02)' } : undefined}
                >
                  <div>
                    {/* Top Row: Product Info & Quantity Weight Callout */}
                    <div className={styles.cardTopRow}>
                      <div className={styles.cardProductInfo}>
                        <img
                          src={batch.imageUrl}
                          alt={batch.productName}
                          className={styles.cardProductImg}
                        />
                        <div>
                          <span className={styles.cardProductCategory}>{batch.category.replace('-', ' & ')}</span>
                          <h3 className={styles.cardProductName}>{batch.productName}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Pack: {batch.packSize}
                          </span>
                        </div>
                      </div>

                      <div className={styles.weightCallout}>
                        <span className={styles.weightAmount}>
                          {batch.totalGrams >= 1000
                            ? `${(batch.totalGrams / 1000).toFixed(2)} kg`
                            : `${batch.totalGrams} g`}
                        </span>
                        <span className={styles.weightPacksLabel}>
                          {batch.totalQuantity} {batch.totalQuantity === 1 ? 'pack' : 'packs'} to fill
                        </span>
                      </div>
                    </div>

                    {/* Atelier Kitchen Preparation Specs */}
                    <div className={styles.recipeGuideBox} style={{ marginTop: 'var(--space-3)' }}>
                      <span className={styles.recipeTitle}>Traditional Roasting &amp; Milling Specs:</span>
                      <div>• <strong>Grain:</strong> {batch.recipe.sproutingTime}</div>
                      <div>• <strong>Roast:</strong> {batch.recipe.roastProfile}</div>
                      <div>• <strong>Grind:</strong> {batch.recipe.millingTexture}</div>
                      <div>• <strong>Pack:</strong> {batch.recipe.packagingGuidance}</div>
                    </div>
                  </div>

                  <div>
                    {/* Kitchen Production Checklist */}
                    <div className={styles.checklistGroup}>
                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'weighed')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.weighed ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.weighed && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>1. Weighed Raw Grains ({batch.totalGrams}g)</span>
                      </label>

                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'roasted')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.roasted ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.roasted && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>2. Pan / Skillet Roasted Warm</span>
                      </label>

                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'milled')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.milled ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.milled && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>3. Stone Milled &amp; Mesh Sieved</span>
                      </label>

                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'packed')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.packed ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.packed && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>4. Foil Sealed &amp; Labeled ({batch.totalQuantity} pouches)</span>
                      </label>
                    </div>

                    {/* Associated Patron Orders */}
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Required for Orders:
                      </span>
                      <div className={styles.orderRefsDeck}>
                        {batch.orderRefs.map((ref, idx) => (
                          <span key={idx} className={styles.orderRefPill} title={`${ref.customerName} (${ref.city})`}>
                            #{ref.orderId.slice(-6)} ({ref.quantity}x)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Kitchen Order Packing Cross-Reference Table */}
      <section aria-label="Kitchen Orders Packing Manifest" style={{ marginTop: 'var(--space-6)' }}>
        <div className={styles.sectionBlockHeader}>
          <div>
            <h2 className={styles.sectionBlockTitle}>
              Order Packaging Slips ({relevantOrders.length} Orders)
            </h2>
            <span className={styles.sectionBlockCount}>Cross-reference individual parcels and pack contents</span>
          </div>
        </div>

        <div className={styles.manifestTableWrapper}>
          <table className={styles.manifestTable}>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Patron &amp; City</th>
                <th>Kitchen Creations Breakdown</th>
                <th>Net Weight</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {relevantOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No orders match current filter.
                  </td>
                </tr>
              ) : (
                relevantOrders.map((order) => {
                  const isConfirmed = order.orderStatus === 'Confirmed';
                  const isProcessing = order.orderStatus === 'Processing';

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderIdBadge}>#{order.id}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                                <span>{item.quantity}× {name}</span>{' '}
                                <span className={styles.itemsBreakdownPack}>({pack})</span>
                              </li>
                            );
                          })}
                        </ul>
                      </td>

                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {order.weightGrams ? `${order.weightGrams}g` : '500g'}
                      </td>

                      <td>
                        {isConfirmed && (
                          <span className={styles.statusPillConfirmed}>
                            Needs Prep
                          </span>
                        )}
                        {isProcessing && (
                          <span className={styles.statusPillProcessing}>
                            Prepared &amp; Packed
                          </span>
                        )}
                        {!isConfirmed && !isProcessing && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {order.orderStatus}
                          </span>
                        )}
                      </td>

                      <td>
                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => onQuickAdvance(order.id, 'Processing')}
                            className={styles.actionBtnPrepared}
                            title="Mark this order freshly prepared and packed"
                          >
                            Mark Packed ✓
                          </button>
                        )}
                        {isProcessing && (
                          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
                            Ready for DTDC
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
    </div>
  );
}
