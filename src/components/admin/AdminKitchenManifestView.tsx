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

// Simple, Everyday Kitchen Preparation Instructions
const KITCHEN_RECIPES: Record<string, {
  roastProfile: string;
  millingTexture: string;
  sproutingTime: string;
  packagingGuidance: string;
}> = {
  'prod-01': {
    sproutingTime: 'Sprouted Green Moong & Ragi',
    roastProfile: 'Slow roast on iron pan until warm and nutty',
    millingTexture: 'Grind very fine and silky smooth (gentle for baby tummy)',
    packagingGuidance: 'Let it cool down completely, then seal in 250g pouches',
  },
  'prod-02': {
    sproutingTime: 'Sprouted Mandya Ragi (Finger Millet)',
    roastProfile: 'Slow roast on low flame until grains pop and smell fresh',
    millingTexture: 'Stone grind into soft smooth powder with zero lumps',
    packagingGuidance: 'Seal tightly in airtight pouch with today’s date stamp',
  },
  'prod-03': {
    sproutingTime: 'Sprouted Millets with Almonds & Cashews',
    roastProfile: 'Roast nuts and seeds gently on low flame to keep good oils',
    millingTexture: 'Grind into soft powder and mix well with saffron & cardamom',
    packagingGuidance: 'Seal pouch immediately to keep aroma fresh',
  },
  'prod-04': {
    sproutingTime: 'Sprouted Whole Green Moong',
    roastProfile: 'Light golden roast so it is very easy on digestion',
    millingTexture: 'Grind into smooth flour and sieve out rough skins',
    packagingGuidance: 'Seal tightly in 250g moisture-proof pouch',
  },
  'prod-05': {
    sproutingTime: 'Sprouted Ragi & Traditional Red Rice',
    roastProfile: 'Slow roast over low flame until fragrant',
    millingTexture: 'Grind and sieve twice for soft, smooth porridge flour',
    packagingGuidance: 'Pack in pouch and attach batch label',
  },
  'prod-06': {
    sproutingTime: '5 Millets (Foxtail, Kodo, Little, Barnyard, Proso)',
    roastProfile: 'Clean grains and slow roast evenly on low flame',
    millingTexture: 'Grind into fine porridge powder',
    packagingGuidance: 'Pack tightly in 250g airtight pouches',
  },
  'prod-07': {
    sproutingTime: 'Wild Kasturi Turmeric & Sun-Dried Rose Petals',
    roastProfile: 'Do not heat — keep natural herbs raw and dry',
    millingTexture: 'Grind fine and sieve 3 times for silky smooth powder',
    packagingGuidance: 'Pack in foil pouch to protect natural herbal scent',
  },
  'prod-08': {
    sproutingTime: 'Neem Leaves, Green Moong & Cooling Herbs',
    roastProfile: 'Do not heat — keep botanicals fresh and dry',
    millingTexture: 'Grind to a gentle bath scrub texture (not too fine)',
    packagingGuidance: 'Pack in 200g pouch and seal securely',
  },
  'prod-09': {
    sproutingTime: 'Sprouted Soya, Chickpeas & Seeds',
    roastProfile: 'Roast on pan to make light and easy to digest',
    millingTexture: 'Grind into fine smooth health drink powder',
    packagingGuidance: 'Seal in 400g moisture-proof pouch',
  },
  'prod-10': {
    sproutingTime: '13 Herbs (Ashwagandha, Tulsi, Licorice, Mulethi)',
    roastProfile: 'Clean and naturally dry herbs (no direct flame)',
    millingTexture: 'Crush into small pieces for tea decoction (do not make fine powder)',
    packagingGuidance: 'Pack in 150g resealable freshness pouch',
  },
  'prod-11': {
    sproutingTime: 'Chikmagalur Arabica & Robusta Coffee Beans',
    roastProfile: 'Dark roast coffee beans blended with 20% roasted chicory',
    millingTexture: 'Grind coarse for traditional South Indian filter coffee',
    packagingGuidance: 'Pack in 500g coffee pouch and seal tight',
  },
  'prod-12': {
    sproutingTime: 'Pure Forest Wild Honey',
    roastProfile: 'Unheated, 100% raw wild honey',
    millingTexture: 'Filter through clean cotton cloth (never apply heat)',
    packagingGuidance: 'Pour into clean 500g glass jar and seal lid tightly',
  },
};

const DEFAULT_RECIPE = {
  sproutingTime: 'Clean whole grains & ingredients',
  roastProfile: 'Roast gently on low heat',
  millingTexture: 'Grind smooth on stone mill',
  packagingGuidance: 'Seal fresh in pouch with date stamp',
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
      showToast('All orders in this list are already marked as packed!', 'info');
      return;
    }

    if (
      !window.confirm(
        `Mark ${confirmedOrders.length} orders as cooked & packed? This will update the customer tracking page so they know their order is ready.`
      )
    ) {
      return;
    }

    setIsAdvancingAll(true);
    showToast(`Updating ${confirmedOrders.length} orders in kitchen...`, 'info');

    try {
      for (const order of confirmedOrders) {
        await onQuickAdvance(order.id, 'Processing');
      }
      showToast(`Done! All ${confirmedOrders.length} orders marked as cooked & packed.`, 'success');
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
      {/* 1. Header Banner */}
      <header className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>Good Fills Kitchen</span>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span>Live Kitchen Shift</span>
            </span>
          </div>
          <h1 className={styles.title}>Kitchen Prep &amp; Daily Milling Guide</h1>
          <p className={styles.subtitle}>
            Everything you need to cook, roast, grind, and pack today for customer orders. All orders are combined so you can see the exact weights to weigh and packets to fill.
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
            <span>Print Prep Sheet</span>
          </button>

          <button
            type="button"
            onClick={handleAdvanceAllBatch}
            disabled={isAdvancingAll || relevantOrders.length === 0}
            className={styles.advanceAllBtn}
            title="Mark all confirmed orders in this list as packed and ready"
          >
            <CheckCircle2 size={15} />
            <span>{isAdvancingAll ? 'Updating Orders...' : 'Mark All as Packed ✓'}</span>
          </button>
        </div>
      </header>

      {/* 2. Real-Time Metrics Deck */}
      <section className={styles.metricsGrid} aria-label="Kitchen Batch Metrics">
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Orders to Cook &amp; Pack</span>
            <Clock size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{totalOrdersInBatch}</div>
          <div className={styles.metricSubtext}>Orders waiting for kitchen prep</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Packets to Fill</span>
            <Package size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{totalPacksInBatch}</div>
          <div className={styles.metricSubtext}>Total pouches to fill and seal</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Grain Weight</span>
            <Scale size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>
            {totalNetGramsInBatch >= 1000
              ? `${(totalNetGramsInBatch / 1000).toFixed(2)} kg`
              : `${totalNetGramsInBatch} g`}
          </div>
          <div className={styles.metricSubtext}>Total ingredients to weigh &amp; grind</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Kitchen Progress</span>
            <ChefHat size={16} className={styles.metricIcon} />
          </div>
          <div className={styles.metricValue}>{checklistPercent}%</div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${checklistPercent}%` }} />
          </div>
          <div className={styles.metricSubtext} style={{ marginTop: '4px' }}>
            {completedChecklistItems} of {totalChecklistItems} prep steps done
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
            <option value="pending">Waiting to be Prepared</option>
            <option value="all-active">In Progress &amp; Packed</option>
            <option value="all">All Recent Orders</option>
          </select>

          <select
            className={styles.filterSelect}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            aria-label="Filter by date range"
          >
            <option value="all">All Pending Orders</option>
            <option value="today">Today&apos;s Orders</option>
            <option value="48h">Past 2 Days</option>
          </select>

          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="baby-kids">Baby &amp; Kids</option>
            <option value="nutrition-wellness">Health &amp; Wellness</option>
            <option value="pantry-beverages">Pantry &amp; Beverages</option>
            <option value="skin-bath">Skin &amp; Bath</option>
          </select>
        </div>

        <div className={styles.searchBox}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by item or ingredient..."
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
              Items to Roast &amp; Grind Today ({aggregatedProducts.length} items)
            </h2>
            <span className={styles.sectionBlockCount}>{todayFormatted} • Made Fresh for Today&apos;s Orders</span>
          </div>
        </div>

        {aggregatedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700 }}>
              All Kitchen Prep is Done!
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              There are no orders waiting to be cooked or ground right now.
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
                            Pack size: {batch.packSize}
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
                          {batch.totalQuantity} {batch.totalQuantity === 1 ? 'packet' : 'packets'} to pack
                        </span>
                      </div>
                    </div>

                    {/* How to prepare & make */}
                    <div className={styles.recipeGuideBox} style={{ marginTop: 'var(--space-3)' }}>
                      <span className={styles.recipeTitle}>How to Prepare &amp; Make:</span>
                      <div>• <strong>Ingredients:</strong> {batch.recipe.sproutingTime}</div>
                      <div>• <strong>Roasting:</strong> {batch.recipe.roastProfile}</div>
                      <div>• <strong>Grinding:</strong> {batch.recipe.millingTexture}</div>
                      <div>• <strong>Packing:</strong> {batch.recipe.packagingGuidance}</div>
                    </div>
                  </div>

                  <div>
                    {/* Kitchen Production Checklist */}
                    <div className={styles.checklistGroup}>
                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'weighed')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.weighed ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.weighed && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>1. Weigh ingredients ({batch.totalGrams}g)</span>
                      </label>

                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'roasted')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.roasted ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.roasted && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>2. Roast on pan</span>
                      </label>

                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'milled')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.milled ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.milled && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>3. Grind on stone mill &amp; sieve</span>
                      </label>

                      <label className={styles.checklistItem} onClick={() => toggleChecklistStep(batch.productId, 'packed')}>
                        <span className={`${styles.customCheckbox} ${itemCheck.packed ? styles.customCheckboxChecked : ''}`}>
                          {itemCheck.packed && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span>4. Pack in pouches &amp; label ({batch.totalQuantity} packets)</span>
                      </label>
                    </div>

                    {/* Associated Customer Orders */}
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                        Needed for orders:
                      </span>
                      <div className={styles.orderRefsDeck}>
                        {batch.orderRefs.map((ref, idx) => (
                          <span key={idx} className={styles.orderRefPill} title={`${ref.customerName} (${ref.city})`}>
                            Order #{ref.orderId.slice(-6)} ({ref.quantity} pack)
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
              Customer Orders &amp; Packing List ({relevantOrders.length} Orders)
            </h2>
            <span className={styles.sectionBlockCount}>Check each customer&apos;s order and mark them as packed once ready</span>
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
                            Needs Cooking
                          </span>
                        )}
                        {isProcessing && (
                          <span className={styles.statusPillProcessing}>
                            Packed &amp; Ready
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
                            title="Mark this order freshly cooked and packed"
                          >
                            Mark Packed ✓
                          </button>
                        )}
                        {isProcessing && (
                          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700 }}>
                            Ready for Courier Pickup
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
