'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  ExternalLink, 
  Check, 
  Search, 
  Lock, 
  RefreshCw,
  LogOut,
  Calendar,
  BarChart3,
  ListOrdered,
  Download,
  ArrowRight,
  TrendingUp,
  Scale,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';
import { Order, OrderStatus, ShipmentStatus } from '@/types';
import styles from './AdminDispatchView.module.css';

type DatePreset = 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom';
type ViewMode = 'orders' | 'analytics';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'name';

type UnifiedStatus = 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

const getUnifiedStatus = (orderStatus?: OrderStatus, shipmentStatus?: ShipmentStatus): UnifiedStatus => {
  if (orderStatus === 'Cancelled') return 'Cancelled';
  if (orderStatus === 'Delivered' || shipmentStatus === 'Delivered') return 'Delivered';
  if (shipmentStatus === 'Out for Delivery') return 'Out for Delivery';
  if (shipmentStatus === 'In Transit' || shipmentStatus === 'Handed Over' || orderStatus === 'Shipped') return 'Shipped';
  if (orderStatus === 'Processing' || orderStatus === 'Ready to Ship') return 'Processing';
  return 'Confirmed';
};

const getUnifiedStatusLabel = (orderStatus?: OrderStatus, shipmentStatus?: ShipmentStatus): string => {
  const s = getUnifiedStatus(orderStatus, shipmentStatus);
  switch (s) {
    case 'Processing':
      return 'Prepared & Packed';
    case 'Shipped':
      return 'In Transit';
    case 'Out for Delivery':
      return 'Out for Delivery';
    case 'Delivered':
      return 'Delivered';
    case 'Cancelled':
      return 'Cancelled';
    default:
      return 'Order Confirmed';
  }
};

export function AdminDispatchView() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('orders');

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Form states for each order being edited
  const [editStates, setEditStates] = useState<
    Record<
      string,
      {
        orderStatus: OrderStatus;
        shipmentStatus: ShipmentStatus;
        trackingNumber: string;
        isSaving: boolean;
        justSaved: boolean;
      }
    >
  >({});

  // Check saved session PIN on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem('goodfills_admin_pin');
    if (savedPin) {
      setPin(savedPin);
      fetchOrders(savedPin);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    fetchOrders(pin.trim());
  };

  const fetchOrders = async (adminPin: string) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-pin': adminPin },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid Admin PIN. (Default PIN: 2026)');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        sessionStorage.setItem('goodfills_admin_pin', adminPin);
        setOrders(data.orders || []);

        // Initialize edit states for each order
        const initialEditStates: Record<string, any> = {};
        (data.orders || []).forEach((o: Order) => {
          initialEditStates[o.id] = {
            orderStatus: o.orderStatus || 'Confirmed',
            shipmentStatus: o.shipmentStatus || 'Not Shipped',
            trackingNumber: o.trackingNumber || '',
            isSaving: false,
            justSaved: false,
          };
        });
        setEditStates(initialEditStates);
      }
    } catch (err) {
      console.error('Fetch admin orders error:', err);
      setAuthError('Connection error to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('goodfills_admin_pin');
    setIsAuthenticated(false);
    setPin('');
  };

  const handleSaveOrder = async (orderId: string) => {
    const current = editStates[orderId];
    if (!current) return;

    setEditStates((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], isSaving: true },
    }));

    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({
          orderId,
          orderStatus: current.orderStatus,
          shipmentStatus: current.shipmentStatus,
          trackingNumber: current.trackingNumber,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );

        setEditStates((prev) => ({
          ...prev,
          [orderId]: { ...prev[orderId], isSaving: false, justSaved: true },
        }));

        setTimeout(() => {
          setEditStates((prev) => ({
            ...prev,
            [orderId]: { ...prev[orderId], justSaved: false },
          }));
        }, 2200);
      } else {
        alert(data.error || 'Failed to update order');
        setEditStates((prev) => ({
          ...prev,
          [orderId]: { ...prev[orderId], isSaving: false },
        }));
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error updating order');
      setEditStates((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], isSaving: false },
      }));
    }
  };

  const handleUnifiedStatusChange = (orderId: string, value: UnifiedStatus) => {
    setEditStates((prev) => {
      const current = prev[orderId] || { trackingNumber: '', isSaving: false, justSaved: false };
      let newOrderStatus: OrderStatus = 'Confirmed';
      let newShipmentStatus: ShipmentStatus = 'Not Shipped';

      switch (value) {
        case 'Confirmed':
          newOrderStatus = 'Confirmed';
          newShipmentStatus = 'Not Shipped';
          break;
        case 'Processing':
          newOrderStatus = 'Processing';
          newShipmentStatus = 'Not Shipped';
          break;
        case 'Shipped':
          newOrderStatus = 'Shipped';
          newShipmentStatus = 'In Transit';
          break;
        case 'Out for Delivery':
          newOrderStatus = 'Shipped';
          newShipmentStatus = 'Out for Delivery';
          break;
        case 'Delivered':
          newOrderStatus = 'Delivered';
          newShipmentStatus = 'Delivered';
          break;
        case 'Cancelled':
          newOrderStatus = 'Cancelled';
          newShipmentStatus = 'Not Shipped';
          break;
      }

      return {
        ...prev,
        [orderId]: {
          ...current,
          orderStatus: newOrderStatus,
          shipmentStatus: newShipmentStatus,
        },
      };
    });
  };

  // Date Filtering Logic
  const dateFilteredOrders = useMemo(() => {
    if (datePreset === 'all') return orders;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 3600 * 1000;
    const sevenDaysAgo = now.getTime() - 7 * 24 * 3600 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();

      if (datePreset === 'today') {
        return orderTime >= startOfToday;
      }
      if (datePreset === 'yesterday') {
        return orderTime >= startOfYesterday && orderTime < startOfToday;
      }
      if (datePreset === '7days') {
        return orderTime >= sevenDaysAgo;
      }
      if (datePreset === 'month') {
        return orderTime >= startOfMonth;
      }
      if (datePreset === 'custom') {
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate).getTime() : 0;
        const end = customEndDate ? new Date(customEndDate).getTime() + 24 * 3600 * 1000 : Infinity;
        return orderTime >= start && orderTime <= end;
      }
      return true;
    });
  }, [orders, datePreset, customStartDate, customEndDate]);

  // Tab & Search Filtered Orders
  const processedOrders = useMemo(() => {
    let result = dateFilteredOrders.filter((o) => {
      // Tab filter
      if (activeTab === 'Confirmed' && getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Confirmed') return false;
      if (activeTab === 'Processing' && getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Processing') return false;
      if (activeTab === 'Shipped' && getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Shipped' && getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Out for Delivery') return false;
      if (activeTab === 'Delivered' && getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Delivered') return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchName = (o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.customerPhone || '').includes(q);
        const matchAwb = (o.trackingNumber || '').toLowerCase().includes(q);
        const matchCity = (o.shippingAddress?.city || '').toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchAwb || matchCity;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === 'lowest') {
        return (a.total || 0) - (b.total || 0);
      }
      if (sortBy === 'name') {
        return (a.customerName || '').localeCompare(b.customerName || '');
      }
      return 0;
    });

    return result;
  }, [dateFilteredOrders, activeTab, searchTerm, sortBy]);

  // Comprehensive Analytics Calculations
  const analyticsData = useMemo(() => {
    const subset = dateFilteredOrders;
    const totalRevenue = subset.reduce((sum, o) => sum + (o.total || 0), 0);
    const subtotalRevenue = subset.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const shippingRevenue = subset.reduce((sum, o) => sum + (o.shippingCost || 0), 0);
    const aov = subset.length > 0 ? Math.round(totalRevenue / subset.length) : 0;

    let totalWeightGrams = 0;
    let totalPacksSold = 0;
    const productCounts: Record<string, { name: string; packSize: string; quantity: number; revenue: number }> = {};
    const cityCounts: Record<string, number> = {};

    subset.forEach((o) => {
      totalWeightGrams += o.weightGrams || 250;
      const city = o.shippingAddress?.city || 'Bengaluru';
      cityCounts[city] = (cityCounts[city] || 0) + 1;

      (o.items || []).forEach((it) => {
        totalPacksSold += it.quantity;
        const pId = it.product.id;
        if (!productCounts[pId]) {
          productCounts[pId] = {
            name: it.product.name,
            packSize: it.product.packSize,
            quantity: 0,
            revenue: 0,
          };
        }
        productCounts[pId].quantity += it.quantity;
        productCounts[pId].revenue += it.quantity * it.product.price;
      });
    });

    const confirmedCount = subset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Confirmed').length;
    const processingCount = subset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Processing').length;
    const shippedCount = subset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Shipped' || getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Out for Delivery').length;
    const deliveredCount = subset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Delivered').length;

    const shippedTotal = subset.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered').length;
    const assignedAwbCount = subset.filter((o) => o.trackingNumber && o.trackingNumber.trim().length > 0).length;
    const awbRate = shippedTotal > 0 ? Math.round((assignedAwbCount / shippedTotal) * 100) : 100;

    // Top products array sorted by quantity
    const topProducts = Object.values(productCounts).sort((a, b) => b.quantity - a.quantity);

    // City array sorted
    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRevenue,
      subtotalRevenue,
      shippingRevenue,
      aov,
      orderCount: subset.length,
      totalPacksSold,
      totalWeightKg: (totalWeightGrams / 1000).toFixed(1),
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      awbRate,
      topProducts,
      topCities,
    };
  }, [dateFilteredOrders]);

  // CSV Export Function
  const exportManifestCSV = () => {
    if (processedOrders.length === 0) {
      alert('No orders to export in current selection.');
      return;
    }

    const headers = [
      'Order ID',
      'Created Date',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'State',
      'Pincode',
      'Items',
      'Weight (g)',
      'Subtotal (INR)',
      'Shipping (INR)',
      'Total (INR)',
      'Payment Status',
      'Order Status',
      'DTDC AWB',
    ];

    const rows = processedOrders.map((o) => [
      o.id,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${o.customerName || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${(o.shippingAddress?.addressLine1 || '').replace(/"/g, '""')}"`,
      `"${o.shippingAddress?.city || ''}"`,
      `"${o.shippingAddress?.state || ''}"`,
      `"${o.shippingAddress?.pincode || ''}"`,
      `"${(o.items || []).map((it) => `${it.quantity}x ${it.product.name}`).join('; ')}"`,
      o.weightGrams || 250,
      o.subtotal || 0,
      o.shippingCost || 0,
      o.total || 0,
      o.paymentStatus || 'Paid',
      getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus),
      `"${o.trackingNumber || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `goodfills-manifest-${datePreset}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Relative Date Helper
  const getRelativeDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 3600);

    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return 'Today';
    }
    if (diffHours < 48) {
      return 'Yesterday';
    }
    const daysAgo = Math.floor(diffHours / 24);
    return `${daysAgo}d ago`;
  };

  // If not authenticated, show clean PIN entrance
  if (!isAuthenticated) {
    return (
      <main className={styles.adminContainer}>
        <div className={styles.adminHeaderBar}>
          <div className={styles.headerBarInner}>
            <div className={styles.brandWrap}>
              <h1 className={styles.brandTitle}>Good Fills</h1>
              <span className={styles.badgeAdmin}>Dispatch Console</span>
            </div>
            <Link href="/" className={styles.viewStoreBtn}>
              Back to Store <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className={styles.loginWrapper}>
          <div style={{ marginBottom: '16px', color: 'var(--accent-terracotta)' }}>
            <Lock size={32} />
          </div>
          <h2 className={styles.loginTitle}>Kitchen Dispatch Login</h2>
          <p className={styles.loginSubtitle}>
            Enter the 4-digit manager PIN to access order fulfillment, analytics, and DTDC consignment updates.
          </p>

          <form onSubmit={handleUnlock}>
            <input
              type="password"
              className={styles.pinInput}
              placeholder="••••"
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />

            {authError && (
              <p style={{ color: '#d9381e', fontSize: '0.82rem', marginBottom: '16px' }}>
                {authError}
              </p>
            )}

            <button type="submit" className={styles.unlockBtn} disabled={isLoading || !pin.trim()}>
              {isLoading ? 'Verifying...' : 'Unlock Dispatch Console'}
            </button>
          </form>

          <p className={styles.pinHint}>Default Access PIN: <strong>2026</strong></p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.adminContainer}>
      {/* 1. TOP HEADER BAR */}
      <div className={styles.adminHeaderBar}>
        <div className={styles.headerBarInner}>
          <div className={styles.brandWrap}>
            <h1 className={styles.brandTitle}>Good Fills</h1>
            <span className={styles.badgeAdmin}>Kitchen Operations</span>
          </div>

          {/* View Switcher: Orders vs Analytics */}
          <div className={styles.viewSwitchGroup}>
            <button
              type="button"
              className={`${styles.viewSwitchBtn} ${currentView === 'orders' ? styles.viewSwitchBtnActive : ''}`}
              onClick={() => setCurrentView('orders')}
            >
              <ListOrdered size={15} />
              <span>Orders Manifest ({processedOrders.length})</span>
            </button>
            <button
              type="button"
              className={`${styles.viewSwitchBtn} ${currentView === 'analytics' ? styles.viewSwitchBtnActive : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              <BarChart3 size={15} />
              <span>Sales &amp; Logistics Analytics</span>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className={styles.headerActions}>
            <Link href="/track" target="_blank" className={styles.viewStoreBtn}>
              Customer Tracking Portal ↗
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Lock
            </button>
          </div>
        </div>
      </div>

      <div className={styles.adminMain}>
        {/* 2. DATE RANGE INTELLIGENCE BAR */}
        <div className={styles.dateFilterBar}>
          <div className={styles.datePresets}>
            <span className={styles.dateFilterLabel}>
              <Calendar size={13} />
              <span>Date Filter:</span>
            </span>

            <button
              className={`${styles.datePresetBtn} ${datePreset === 'all' ? styles.datePresetBtnActive : ''}`}
              onClick={() => setDatePreset('all')}
            >
              All Time ({orders.length})
            </button>
            <button
              className={`${styles.datePresetBtn} ${datePreset === 'today' ? styles.datePresetBtnActive : ''}`}
              onClick={() => setDatePreset('today')}
            >
              Today
            </button>
            <button
              className={`${styles.datePresetBtn} ${datePreset === 'yesterday' ? styles.datePresetBtnActive : ''}`}
              onClick={() => setDatePreset('yesterday')}
            >
              Yesterday
            </button>
            <button
              className={`${styles.datePresetBtn} ${datePreset === '7days' ? styles.datePresetBtnActive : ''}`}
              onClick={() => setDatePreset('7days')}
            >
              Last 7 Days
            </button>
            <button
              className={`${styles.datePresetBtn} ${datePreset === 'month' ? styles.datePresetBtnActive : ''}`}
              onClick={() => setDatePreset('month')}
            >
              This Month
            </button>
            <button
              className={`${styles.datePresetBtn} ${datePreset === 'custom' ? styles.datePresetBtnActive : ''}`}
              onClick={() => setDatePreset('custom')}
            >
              Custom Range
            </button>
          </div>

          {datePreset === 'custom' && (
            <div className={styles.customDateInputs}>
              <input
                type="date"
                className={styles.datePickerInput}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                className={styles.datePickerInput}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          )}

          <div>
            <button type="button" onClick={exportManifestCSV} className={styles.exportBtn}>
              <Download size={13} />
              <span>Export Manifest (CSV)</span>
            </button>
          </div>
        </div>

        {/* 3. KEY PERFORMANCE METRICS BAR */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Gross Sales Volume</div>
            <div className={styles.statVal}>₹{analyticsData.totalRevenue.toLocaleString('en-IN')}</div>
            <div className={styles.statSub}>
              Subtotal: ₹{analyticsData.subtotalRevenue.toLocaleString('en-IN')} • Shipping: ₹{analyticsData.shippingRevenue.toLocaleString('en-IN')}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Orders Placed</div>
            <div className={styles.statVal}>{analyticsData.orderCount}</div>
            <div className={styles.statSub}>
              Avg. Order Value (AOV): <strong>₹{analyticsData.aov}</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Packs Dispatched</div>
            <div className={styles.statVal} style={{ color: 'var(--accent-terracotta)' }}>
              {analyticsData.totalPacksSold} packs
            </div>
            <div className={styles.statSub}>
              Net Weight: <strong>{analyticsData.totalWeightKg} kg</strong>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>DTDC Transit &amp; Delivered</div>
            <div className={styles.statVal} style={{ color: '#27ae60' }}>
              {analyticsData.shippedCount + analyticsData.deliveredCount} orders
            </div>
            <div className={styles.statSub}>
              AWB Recording Rate: <strong>{analyticsData.awbRate}%</strong>
            </div>
          </div>
        </div>

        {/* 4A. ANALYTICS EXTENDED VIEW */}
        {currentView === 'analytics' && (
          <section className={styles.analyticsSection}>
            {/* Visual Pipeline Bar */}
            <div className={styles.analyticsPanel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Order Fulfillment Pipeline</h3>
                <span className={styles.panelBadge}>Live Logistics Funnel</span>
              </div>

              <div className={styles.pipelineBarWrap}>
                <div className={styles.pipelineLabels}>
                  <span>Confirmed: {analyticsData.confirmedCount}</span>
                  <span>Prepared &amp; Packed: {analyticsData.processingCount}</span>
                  <span>In Transit: {analyticsData.shippedCount}</span>
                  <span>Delivered: {analyticsData.deliveredCount}</span>
                </div>

                <div className={styles.pipelineTrack}>
                  {analyticsData.orderCount > 0 && (
                    <>
                      <div
                        className={styles.pipelineSegConfirmed}
                        style={{ width: `${(analyticsData.confirmedCount / analyticsData.orderCount) * 100}%` }}
                        title={`Confirmed: ${analyticsData.confirmedCount}`}
                      />
                      <div
                        className={styles.pipelineSegProcessing}
                        style={{ width: `${(analyticsData.processingCount / analyticsData.orderCount) * 100}%` }}
                        title={`Processing: ${analyticsData.processingCount}`}
                      />
                      <div
                        className={styles.pipelineSegShipped}
                        style={{ width: `${(analyticsData.shippedCount / analyticsData.orderCount) * 100}%` }}
                        title={`Shipped: ${analyticsData.shippedCount}`}
                      />
                      <div
                        className={styles.pipelineSegDelivered}
                        style={{ width: `${(analyticsData.deliveredCount / analyticsData.orderCount) * 100}%` }}
                        title={`Delivered: ${analyticsData.deliveredCount}`}
                      />
                    </>
                  )}
                </div>

                <div className={styles.pipelineLegend}>
                  <span><span className={styles.legendDot} style={{ backgroundColor: '#2471a3' }} />Confirmed ({analyticsData.confirmedCount})</span>
                  <span><span className={styles.legendDot} style={{ backgroundColor: '#d4ac0d' }} />Processing &amp; Packaging ({analyticsData.processingCount})</span>
                  <span><span className={styles.legendDot} style={{ backgroundColor: '#27ae60' }} />In DTDC Transit ({analyticsData.shippedCount})</span>
                  <span><span className={styles.legendDot} style={{ backgroundColor: '#196f3d' }} />Delivered ({analyticsData.deliveredCount})</span>
                </div>
              </div>
            </div>

            {/* 2-Column Split: Top Products Leaderboard & Destination Cities */}
            <div className={styles.analyticsGrid2Col}>
              {/* Product Leaderboard */}
              <div className={styles.analyticsPanel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Product Demand Leaderboard</h3>
                  <span className={styles.panelBadge}>By Units Ordered</span>
                </div>

                <table className={styles.productTable}>
                  <thead>
                    <tr>
                      <th className={styles.productRank}>#</th>
                      <th>Product</th>
                      <th>Pack Size</th>
                      <th>Packs Sold</th>
                      <th>Sales (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          No sales recorded in this date range.
                        </td>
                      </tr>
                    ) : (
                      analyticsData.topProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td className={styles.productRank}>0{idx + 1}</td>
                          <td className={styles.productNameCell}>{p.name}</td>
                          <td>{p.packSize}</td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-terracotta)' }}>{p.quantity}</td>
                          <td style={{ fontWeight: 600 }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Delivery Operations & Regional Hubs */}
              <div className={styles.analyticsPanel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Regional Logistics &amp; Health</h3>
                  <span className={styles.panelBadge}>DTDC Pan-India</span>
                </div>

                <div className={styles.healthList}>
                  <div className={styles.healthRow}>
                    <span className={styles.healthKey}>Carrier Courier Partner</span>
                    <span className={styles.healthVal}>DTDC Express Limited</span>
                  </div>
                  <div className={styles.healthRow}>
                    <span className={styles.healthKey}>Dispatch Turnaround Target</span>
                    <span className={styles.healthVal}>24 to 48 Hours</span>
                  </div>
                  <div className={styles.healthRow}>
                    <span className={styles.healthKey}>AWB Number Recording Rate</span>
                    <span className={styles.healthVal}>{analyticsData.awbRate}%</span>
                  </div>
                  <div className={styles.healthRow}>
                    <span className={styles.healthKey}>Active Delivery Destinations</span>
                    <span className={styles.healthVal}>
                      {analyticsData.topCities.map((c) => `${c.name} (${c.count})`).join(', ') || 'Bengaluru'}
                    </span>
                  </div>
                  <div className={styles.healthRow}>
                    <span className={styles.healthKey}>Payment Verification Rate</span>
                    <span className={styles.healthVal} style={{ color: '#27ae60' }}>
                      100% UPI (Razorpay Verified)
                    </span>
                  </div>
                  <div className={styles.healthRow}>
                    <span className={styles.healthKey}>Kitchen Origin Hub</span>
                    <span className={styles.healthVal}>Indiranagar, Bengaluru (560038)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4B. ORDERS LIST VIEW */}
        {currentView === 'orders' && (
          <section>
            {/* Search, Filter Tabs & Sort Controls */}
            <div className={styles.controlsBar}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterBtn} ${activeTab === 'all' ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All ({dateFilteredOrders.length})
                </button>
                <button
                  className={`${styles.filterBtn} ${activeTab === 'Confirmed' ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveTab('Confirmed')}
                >
                  Confirmed ({dateFilteredOrders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Confirmed').length})
                </button>
                <button
                  className={`${styles.filterBtn} ${activeTab === 'Processing' ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveTab('Processing')}
                >
                  Prepared &amp; Packed ({dateFilteredOrders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Processing').length})
                </button>
                <button
                  className={`${styles.filterBtn} ${activeTab === 'Shipped' ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveTab('Shipped')}
                >
                  In Transit ({dateFilteredOrders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Shipped' || getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Out for Delivery').length})
                </button>
                <button
                  className={`${styles.filterBtn} ${activeTab === 'Delivered' ? styles.filterBtnActive : ''}`}
                  onClick={() => setActiveTab('Delivered')}
                >
                  Delivered ({dateFilteredOrders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) === 'Delivered').length})
                </button>
              </div>

              <div className={styles.searchSortGroup}>
                <input
                  type="text"
                  className={styles.adminSearchInput}
                  placeholder="Search Order ID, name, phone, city, or AWB..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="highest">Sort: Highest Value (₹)</option>
                  <option value="lowest">Sort: Lowest Value (₹)</option>
                  <option value="name">Sort: Customer Name</option>
                </select>
              </div>
            </div>

            {/* Orders Row Cards */}
            <div className={styles.ordersList}>
              {processedOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px var(--space-4)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
                  <Package size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: '0 0 6px' }}>No Orders Found</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Try adjusting your date range filter or search term.
                  </p>
                </div>
              ) : (
                processedOrders.map((o) => {
                  const edit = editStates[o.id] || {
                    orderStatus: o.orderStatus || 'Confirmed',
                    shipmentStatus: o.shipmentStatus || 'Not Shipped',
                    trackingNumber: o.trackingNumber || '',
                    isSaving: false,
                    justSaved: false,
                  };

                  const formattedDate = new Date(o.createdAt).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  const relativeDate = getRelativeDateLabel(o.createdAt);

                  return (
                    <div key={o.id} className={styles.orderRowCard}>
                      {/* Top Header of Card */}
                      <div className={styles.orderCardTop}>
                        <div className={styles.orderMainId}>
                          <span>{o.id}</span>
                          <div className={styles.orderDateWrap}>
                            <span className={styles.orderDate}>{formattedDate}</span>
                            <span className={styles.dateAgeBadge}>{relativeDate}</span>
                          </div>
                        </div>

                        <div className={styles.statusPills}>
                          <span
                            className={
                              o.orderStatus === 'Delivered' || o.shipmentStatus === 'Delivered'
                                ? styles.pillDelivered
                                : o.shipmentStatus === 'In Transit' || o.shipmentStatus === 'Out for Delivery' || o.shipmentStatus === 'Handed Over' || o.orderStatus === 'Shipped'
                                ? styles.pillShipped
                                : o.orderStatus === 'Processing' || o.orderStatus === 'Ready to Ship'
                                ? styles.pillProcessing
                                : o.orderStatus === 'Cancelled'
                                ? styles.pillCancelled
                                : styles.pillConfirmed
                            }
                          >
                            {getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Body of Card */}
                      <div className={styles.orderCardBody}>
                        {/* Customer Information */}
                        <div className={styles.customerBlock}>
                          <div className={styles.customerName}>{o.customerName}</div>
                          <div className={styles.customerContact}>
                            Phone: {o.customerPhone} • {o.customerEmail}
                          </div>
                          <div className={styles.customerAddress}>
                            {o.shippingAddress?.addressLine1}, {o.shippingAddress?.city}{' '}
                            ({o.shippingAddress?.pincode})
                          </div>
                        </div>

                        {/* Items Ordered */}
                        <div className={styles.itemsBlock}>
                          <div className={styles.itemsSummary}>
                            {o.items?.map((it, idx) => (
                              <div key={idx}>
                                • {it.quantity}x {it.product.name} ({it.product.packSize})
                              </div>
                            ))}
                          </div>
                          <div className={styles.orderTotalAmount}>
                            Total: ₹{o.total} ({o.paymentMethod || 'Razorpay UPI'} - {o.paymentStatus})
                          </div>
                        </div>

                        {/* Dispatch Action Panel */}
                        <div className={styles.dispatchBlock}>
                          <div className={styles.controlFieldGroup}>
                            <label className={styles.fieldLabel}>Order Status</label>
                            <select
                              className={styles.selectInput}
                              value={getUnifiedStatus(edit.orderStatus, edit.shipmentStatus)}
                              onChange={(e) =>
                                handleUnifiedStatusChange(o.id, e.target.value as UnifiedStatus)
                              }
                            >
                              <option value="Confirmed">Order Confirmed</option>
                              <option value="Processing">Prepared &amp; Packed</option>
                              <option value="Shipped">In Transit (DTDC Courier)</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div className={styles.controlFieldGroup}>
                            <label className={styles.fieldLabel}>DTDC Consignment AWB No.</label>
                            <input
                              type="text"
                              className={styles.awbInput}
                              placeholder="e.g. D62984105"
                              value={edit.trackingNumber}
                              onChange={(e) =>
                                setEditStates((prev) => ({
                                  ...prev,
                                  [o.id]: {
                                    ...prev[o.id],
                                    trackingNumber: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>

                          <div className={styles.actionBtnGroup}>
                            <button
                              type="button"
                              className={`${styles.saveUpdateBtn} ${
                                edit.justSaved ? styles.savedFeedback : ''
                              }`}
                              disabled={edit.isSaving}
                              onClick={() => handleSaveOrder(o.id)}
                            >
                              {edit.isSaving ? (
                                'Saving...'
                              ) : edit.justSaved ? (
                                <>
                                  <Check size={14} />
                                  <span>Updated!</span>
                                </>
                              ) : (
                                'Save & Update'
                              )}
                            </button>

                            <Link
                              href={`/track?id=${o.id}`}
                              target="_blank"
                              className={styles.viewTrackingLink}
                            >
                              <span>Customer View</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
