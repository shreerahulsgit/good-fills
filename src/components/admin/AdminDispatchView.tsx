'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Truck, 
  ExternalLink, 
  Check, 
  Search, 
  Lock, 
  LogOut, 
  Calendar, 
  BarChart3, 
  ListOrdered, 
  Download, 
  ArrowRight, 
  TrendingUp, 
  Scale, 
  AlertCircle,
  LayoutList,
  LayoutGrid,
  Sparkles,
  MessageCircle,
  Copy,
  ChevronDown,
  CheckCircle2,
  X,
  Eye
} from 'lucide-react';
import { Order, OrderStatus, ShipmentStatus } from '@/types';
import styles from './AdminDispatchView.module.css';

type DatePreset = 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom';
type ViewMode = 'orders' | 'analytics';
type ManifestLayout = 'table' | 'cards';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'name';

type UnifiedStatus = 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

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
      return 'In Transit (DTDC)';
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

const getNextStatusConfig = (current: UnifiedStatus): {
  nextStatus: UnifiedStatus;
  label: string;
  shortLabel: string;
  icon: string;
  colorScheme: 'amber' | 'blue' | 'green' | 'gray';
} | null => {
  switch (current) {
    case 'Confirmed':
      return {
        nextStatus: 'Processing',
        label: 'Mark Packed 📦',
        shortLabel: 'Pack 📦',
        icon: '📦',
        colorScheme: 'amber',
      };
    case 'Processing':
      return {
        nextStatus: 'Shipped',
        label: 'Dispatch DTDC 🚚',
        shortLabel: 'Dispatch 🚚',
        icon: '🚚',
        colorScheme: 'blue',
      };
    case 'Shipped':
    case 'Out for Delivery':
      return {
        nextStatus: 'Delivered',
        label: 'Mark Delivered ✅',
        shortLabel: 'Deliver ✅',
        icon: '✅',
        colorScheme: 'green',
      };
    case 'Cancelled':
      return {
        nextStatus: 'Confirmed',
        label: 'Reopen Order 🔄',
        shortLabel: 'Reopen',
        icon: '🔄',
        colorScheme: 'gray',
      };
    case 'Delivered':
    default:
      return null;
  }
};

export function AdminDispatchView() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('orders');
  const [manifestLayout, setManifestLayout] = useState<ManifestLayout>('table');

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered'>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Multi-select state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Popover state for individual status selectors
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  // Form states for AWB inputs
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

  // Toast feedback state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Close status popover when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.statusPopoverContainer}`)) {
        setOpenStatusMenuId(null);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

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

  // 1-Click Status Progression Handler with Optimistic UI updates
  const handleQuickAdvance = async (orderId: string, targetStatus: UnifiedStatus) => {
    let newOrderStatus: OrderStatus = 'Confirmed';
    let newShipmentStatus: ShipmentStatus = 'Not Shipped';

    switch (targetStatus) {
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

    const currentAwb = editStates[orderId]?.trackingNumber || '';

    // 1. Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, orderStatus: newOrderStatus, shipmentStatus: newShipmentStatus }
          : o
      )
    );

    setEditStates((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || { trackingNumber: '', justSaved: false }),
        orderStatus: newOrderStatus,
        shipmentStatus: newShipmentStatus,
        isSaving: true,
      },
    }));

    setOpenStatusMenuId(null);
    showToast(`Order #${orderId} marked as ${getUnifiedStatusLabel(newOrderStatus, newShipmentStatus)}`, 'success');

    // 2. Call backend
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({
          orderId,
          orderStatus: newOrderStatus,
          shipmentStatus: newShipmentStatus,
          trackingNumber: currentAwb,
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
        }, 2000);
      } else {
        showToast(data.error || 'Server error updating status. Reverting.', 'error');
        fetchOrders(pin);
      }
    } catch {
      showToast('Network error while saving order status.', 'error');
      fetchOrders(pin);
    }
  };

  // Inline AWB save on blur or Enter
  const handleAwbSave = async (orderId: string, awbValue: string) => {
    const trimmed = awbValue.trim();
    const existing = orders.find((o) => o.id === orderId);
    if (existing?.trackingNumber === trimmed) return;

    const current = editStates[orderId] || {
      orderStatus: existing?.orderStatus || 'Confirmed',
      shipmentStatus: existing?.shipmentStatus || 'Not Shipped',
    };

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
          trackingNumber: trimmed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, trackingNumber: trimmed } : o))
        );
        setEditStates((prev) => ({
          ...prev,
          [orderId]: { ...prev[orderId], isSaving: false, justSaved: true },
        }));
        showToast(`DTDC AWB saved for #${orderId}`, 'success');
        setTimeout(() => {
          setEditStates((prev) => ({
            ...prev,
            [orderId]: { ...prev[orderId], justSaved: false },
          }));
        }, 2000);
      }
    } catch {
      setEditStates((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], isSaving: false },
      }));
    }
  };

  // Bulk Status Update
  const handleBulkUpdate = async (targetStatus: UnifiedStatus) => {
    if (selectedOrderIds.length === 0) return;

    const ids = [...selectedOrderIds];
    showToast(`Updating ${ids.length} orders to ${targetStatus}...`, 'info');

    let successCount = 0;
    for (const orderId of ids) {
      await handleQuickAdvance(orderId, targetStatus);
      successCount++;
    }

    setSelectedOrderIds([]);
    showToast(`Successfully updated ${successCount} orders to ${targetStatus}!`, 'success');
  };

  // WhatsApp concierge generator
  const getWhatsAppLink = (order: Order) => {
    const rawPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const firstName = order.customerName ? order.customerName.split(' ')[0] : 'Customer';
    const status = getUnifiedStatus(order.orderStatus, order.shipmentStatus);

    let message = `Hello ${firstName}! `;
    if (status === 'Confirmed') {
      message += `Your Good Fills freshly milled order #${order.id} is confirmed. Our kitchen is roasting and stone-milling your ingredients fresh! Track live: https://goodfills.in/track?id=${order.id}`;
    } else if (status === 'Processing') {
      message += `Your Good Fills order #${order.id} has been freshly milled, sealed warm, and packed for dispatch! Track live: https://goodfills.in/track?id=${order.id}`;
    } else if (status === 'Shipped') {
      message += `Your Good Fills order #${order.id} has been dispatched via DTDC Express${order.trackingNumber ? ` (AWB: ${order.trackingNumber})` : ''}. Track live here: https://goodfills.in/track?id=${order.id}`;
    } else if (status === 'Delivered') {
      message += `Your Good Fills freshly prepared order #${order.id} has been delivered. Enjoy the pure traditional freshness! Feel free to WhatsApp us anytime for recipes.`;
    } else {
      message += `Regarding your Good Fills order #${order.id}: `;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  // Selection toggle
  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === processedOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(processedOrders.map((o) => o.id));
    }
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

      if (datePreset === 'today') return orderTime >= startOfToday;
      if (datePreset === 'yesterday') return orderTime >= startOfYesterday && orderTime < startOfToday;
      if (datePreset === '7days') return orderTime >= sevenDaysAgo;
      if (datePreset === 'month') return orderTime >= startOfMonth;
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
      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
      if (activeTab === 'Confirmed' && u !== 'Confirmed') return false;
      if (activeTab === 'Processing' && u !== 'Processing') return false;
      if (activeTab === 'Shipped' && u !== 'Shipped' && u !== 'Out for Delivery') return false;
      if (activeTab === 'Delivered' && u !== 'Delivered') return false;

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

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'highest') return (b.total || 0) - (a.total || 0);
      if (sortBy === 'lowest') return (a.total || 0) - (b.total || 0);
      if (sortBy === 'name') return (a.customerName || '').localeCompare(b.customerName || '');
      return 0;
    });

    return result;
  }, [dateFilteredOrders, activeTab, searchTerm, sortBy]);

  // Analytics Calculations
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

    // Check if any confirmed order has been waiting > 24 hours
    const now = Date.now();
    const hasUrgentAgingOrders = subset.some((o) => {
      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
      if (u !== 'Confirmed') return false;
      const ageHours = (now - new Date(o.createdAt).getTime()) / (1000 * 3600);
      return ageHours >= 24;
    });

    const shippedTotal = subset.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered').length;
    const assignedAwbCount = subset.filter((o) => o.trackingNumber && o.trackingNumber.trim().length > 0).length;
    const awbRate = shippedTotal > 0 ? Math.round((assignedAwbCount / shippedTotal) * 100) : 100;

    const topProducts = Object.values(productCounts).sort((a, b) => b.quantity - a.quantity);
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
      hasUrgentAgingOrders,
      awbRate,
      topProducts,
      topCities,
    };
  }, [dateFilteredOrders]);

  // Relative Date Helper
  const getRelativeDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 3600));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    const daysAgo = Math.floor(diffHours / 24);
    return `${daysAgo}d ago`;
  };

  // CSV Export Function
  const exportManifestCSV = () => {
    if (processedOrders.length === 0) {
      showToast('No orders to export in current selection.', 'error');
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
    link.setAttribute('download', `GoodFills_Dispatch_Manifest_${datePreset}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${processedOrders.length} orders to CSV`, 'success');
  };

  // If not authenticated, show PIN login
  if (!isAuthenticated) {
    return (
      <main className={styles.adminContainer}>
        <div className={styles.adminHeaderBar}>
          <div className={styles.headerBarInner}>
            <div className={styles.brandWrap}>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Good Fills" style={{ height: '32px', width: 'auto', display: 'block' }} />
              </Link>
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
      {/* 1. TOP DEDICATED ADMIN COCKPIT HEADER */}
      <header className={styles.adminHeaderBar}>
        <div className={styles.headerBarInner}>
          <div className={styles.brandWrap}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="Good Fills" style={{ height: '30px', width: 'auto', display: 'block' }} />
            </Link>
            <div className={styles.headerDivider} />
            <div className={styles.adminTitleBlock}>
              <span className={styles.adminHeaderTitle}>Atelier Dispatch Console</span>
              <div className={styles.liveHearthBadge}>
                <span className={styles.pulseDot} />
                <span>Live Sync Active</span>
              </div>
            </div>
          </div>

          {/* View Switcher: Orders vs Analytics */}
          <div className={styles.viewSwitchGroup}>
            <button
              type="button"
              className={`${styles.viewSwitchBtn} ${currentView === 'orders' ? styles.viewSwitchBtnActive : ''}`}
              onClick={() => setCurrentView('orders')}
            >
              <ListOrdered size={15} />
              <span>Manifest ({orders.length})</span>
            </button>
            <button
              type="button"
              className={`${styles.viewSwitchBtn} ${currentView === 'analytics' ? styles.viewSwitchBtnActive : ''}`}
              onClick={() => setCurrentView('analytics')}
            >
              <BarChart3 size={15} />
              <span>Sales &amp; Logistics</span>
            </button>
          </div>

          {/* Header Action Shortcuts */}
          <div className={styles.headerActions}>
            <Link href="/track" target="_blank" className={styles.viewStoreBtn} title="Open Customer Order Tracking">
              <Eye size={13} />
              <span>Tracking Portal</span>
            </Link>
            <Link href="/shop" target="_blank" className={styles.viewStoreBtn} title="View Live Store">
              <span>Store ↗</span>
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Lock Dispatch Console">
              <LogOut size={12} />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.adminMain}>
        {/* 2. DATE FILTER & MANIFEST CONTROLS BAR */}
        <div className={styles.dateFilterBar}>
          <div className={styles.datePresets}>
            <span className={styles.dateFilterLabel}>
              <Calendar size={13} />
              <span>Period:</span>
            </span>

            {(['all', 'today', 'yesterday', '7days', 'month', 'custom'] as DatePreset[]).map((preset) => {
              const labelMap: Record<DatePreset, string> = {
                all: `All Time (${orders.length})`,
                today: 'Today',
                yesterday: 'Yesterday',
                '7days': 'Last 7 Days',
                month: 'This Month',
                custom: 'Custom Range',
              };
              return (
                <button
                  key={preset}
                  className={`${styles.datePresetBtn} ${datePreset === preset ? styles.datePresetBtnActive : ''}`}
                  onClick={() => setDatePreset(preset)}
                >
                  {labelMap[preset]}
                </button>
              );
            })}
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

          <div className={styles.dateBarRight}>
            {/* View Mode Toggle (Table vs Cards) */}
            {currentView === 'orders' && (
              <div className={styles.layoutToggleGroup}>
                <button
                  type="button"
                  className={`${styles.layoutToggleBtn} ${manifestLayout === 'table' ? styles.layoutToggleActive : ''}`}
                  onClick={() => setManifestLayout('table')}
                  title="Dense Manifest Table View"
                >
                  <LayoutList size={14} />
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  className={`${styles.layoutToggleBtn} ${manifestLayout === 'cards' ? styles.layoutToggleActive : ''}`}
                  onClick={() => setManifestLayout('cards')}
                  title="Detailed Dispatch Cards View"
                >
                  <LayoutGrid size={14} />
                  <span>Cards</span>
                </button>
              </div>
            )}

            <button type="button" onClick={exportManifestCSV} className={styles.exportBtn}>
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 3. INTERACTIVE CLICK-TO-FILTER METRICS COCKPIT */}
        <div className={styles.statsRow}>
          {/* Card 1: Gross Sales */}
          <div
            className={`${styles.statCard} ${activeTab === 'all' ? styles.statCardSelected : ''}`}
            onClick={() => setActiveTab('all')}
            role="button"
            tabIndex={0}
            title="Click to view All Orders"
          >
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Gross Sales Volume</span>
              <TrendingUp size={15} className={styles.statIcon} />
            </div>
            <div className={styles.statVal}>₹{analyticsData.totalRevenue.toLocaleString('en-IN')}</div>
            <div className={styles.statSub}>
              Subtotal: ₹{analyticsData.subtotalRevenue.toLocaleString('en-IN')} • Shipping: ₹{analyticsData.shippingRevenue.toLocaleString('en-IN')}
            </div>
            <div className={styles.cardFilterHint}>Showing {orders.length} total orders</div>
          </div>

          {/* Card 2: Kitchen Action Required (Confirmed) */}
          <div
            className={`${styles.statCard} ${styles.statCardUrgent} ${activeTab === 'Confirmed' ? styles.statCardSelected : ''}`}
            onClick={() => setActiveTab('Confirmed')}
            role="button"
            tabIndex={0}
            title="Click to filter Confirmed orders requiring roasting & stone-milling"
          >
            <div className={styles.statHeader}>
              <span className={styles.statLabel} style={{ color: 'var(--accent-terracotta)' }}>
                Roasting &amp; Milling Queue
              </span>
              {analyticsData.hasUrgentAgingOrders ? (
                <span className={styles.urgentPulseBadge} title="Orders waiting > 24h">
                  <AlertCircle size={14} />
                  <span>Priority</span>
                </span>
              ) : (
                <Package size={15} className={styles.statIcon} />
              )}
            </div>
            <div className={styles.statVal} style={{ color: 'var(--accent-terracotta)' }}>
              {analyticsData.confirmedCount} orders
            </div>
            <div className={styles.statSub}>
              Awaiting packaging &amp; dispatch • AOV: <strong>₹{analyticsData.aov}</strong>
            </div>
            <div className={styles.cardFilterHint}>Click to view Confirmed Queue ➔</div>
          </div>

          {/* Card 3: Prepared & Packed */}
          <div
            className={`${styles.statCard} ${activeTab === 'Processing' ? styles.statCardSelected : ''}`}
            onClick={() => setActiveTab('Processing')}
            role="button"
            tabIndex={0}
            title="Click to filter orders ready for DTDC pickup"
          >
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Prepared &amp; Packed</span>
              <Scale size={15} className={styles.statIcon} />
            </div>
            <div className={styles.statVal} style={{ color: '#b7950b' }}>
              {analyticsData.processingCount} orders
            </div>
            <div className={styles.statSub}>
              {analyticsData.totalPacksSold} packs ready • <strong>{analyticsData.totalWeightKg} kg</strong>
            </div>
            <div className={styles.cardFilterHint}>Ready for DTDC pickup ➔</div>
          </div>

          {/* Card 4: DTDC In Transit & Delivered */}
          <div
            className={`${styles.statCard} ${activeTab === 'Shipped' ? styles.statCardSelected : ''}`}
            onClick={() => setActiveTab('Shipped')}
            role="button"
            tabIndex={0}
            title="Click to filter active DTDC transit orders"
          >
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>In Transit (DTDC)</span>
              <Truck size={15} className={styles.statIcon} />
            </div>
            <div className={styles.statVal} style={{ color: '#27ae60' }}>
              {analyticsData.shippedCount} active
            </div>
            <div className={styles.statSub}>
              AWB Rate: <strong>{analyticsData.awbRate}%</strong> • {analyticsData.deliveredCount} Delivered
            </div>
            <div className={styles.cardFilterHint}>Click to view In Transit ➔</div>
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
                  <div
                    className={styles.pipelineSegConfirmed}
                    style={{
                      width: `${(analyticsData.confirmedCount / (analyticsData.orderCount || 1)) * 100}%`,
                    }}
                    title={`Confirmed: ${analyticsData.confirmedCount}`}
                  />
                  <div
                    className={styles.pipelineSegProcessing}
                    style={{
                      width: `${(analyticsData.processingCount / (analyticsData.orderCount || 1)) * 100}%`,
                    }}
                    title={`Prepared: ${analyticsData.processingCount}`}
                  />
                  <div
                    className={styles.pipelineSegShipped}
                    style={{
                      width: `${(analyticsData.shippedCount / (analyticsData.orderCount || 1)) * 100}%`,
                    }}
                    title={`In Transit: ${analyticsData.shippedCount}`}
                  />
                  <div
                    className={styles.pipelineSegDelivered}
                    style={{
                      width: `${(analyticsData.deliveredCount / (analyticsData.orderCount || 1)) * 100}%`,
                    }}
                    title={`Delivered: ${analyticsData.deliveredCount}`}
                  />
                </div>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className={styles.analyticsGrid2Col}>
              <div className={styles.analyticsPanel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Most Ordered Creations</h3>
                  <span className={styles.panelBadge}>{analyticsData.topProducts.length} Items</span>
                </div>
                <div className={styles.topProductsList}>
                  {analyticsData.topProducts.map((p, i) => (
                    <div key={i} className={styles.topProductRow}>
                      <span className={styles.productRank}>#{i + 1}</span>
                      <div className={styles.productDetails}>
                        <div className={styles.productName}>{p.name}</div>
                        <div className={styles.productPack}>{p.packSize}</div>
                      </div>
                      <div className={styles.productStats}>
                        <div className={styles.productUnits}>{p.quantity} packs</div>
                        <div className={styles.productRev}>₹{p.revenue.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.analyticsPanel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Dispatch Health &amp; Operations</h3>
                  <span className={styles.panelBadge}>DTDC Express Hub</span>
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
                    <span className={styles.healthVal}>Bengaluru, Karnataka (560041)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4B. ORDERS LIST & MANIFEST VIEW */}
        {currentView === 'orders' && (
          <section>
            {/* Filter Tabs & Search Controls */}
            <div className={styles.controlsBar}>
              <div className={styles.filterTabs}>
                {(['all', 'Confirmed', 'Processing', 'Shipped', 'Delivered'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  const count =
                    tab === 'all'
                      ? dateFilteredOrders.length
                      : dateFilteredOrders.filter((o) => {
                          const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
                          if (tab === 'Shipped') return u === 'Shipped' || u === 'Out for Delivery';
                          return u === tab;
                        }).length;

                  const tabLabelMap = {
                    all: 'All Orders',
                    Confirmed: 'Confirmed',
                    Processing: 'Prepared & Packed',
                    Shipped: 'In Transit',
                    Delivered: 'Delivered',
                  };

                  return (
                    <button
                      key={tab}
                      type="button"
                      className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterPill"
                          className={styles.activePillBackground}
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className={styles.tabText}>
                        {tabLabelMap[tab]} ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.searchSortGroup}>
                <div className={styles.searchWrap}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.adminSearchInput}
                    placeholder="Search Order ID, name, phone, city, or AWB..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className={styles.searchClearBtn}
                      title="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

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

            {/* EMPTY STATE */}
            {processedOrders.length === 0 ? (
              <div className={styles.emptyManifestWrap}>
                <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h4 className={styles.emptyTitle}>No Orders Found</h4>
                <p className={styles.emptySubtitle}>
                  Try clearing your search term or selecting a different date range.
                </p>
                {(searchTerm || activeTab !== 'all' || datePreset !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveTab('all');
                      setDatePreset('all');
                    }}
                    className={styles.resetFiltersBtn}
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : manifestLayout === 'table' ? (
              /* ============================================================
                 A. DENSE MANIFEST TABLE VIEW (Fast Processing & Dispatch)
                 ============================================================ */
              <div className={styles.tableResponsiveWrap}>
                <table className={styles.manifestTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.length > 0 && selectedOrderIds.length === processedOrders.length}
                          onChange={toggleSelectAll}
                          className={styles.checkboxInput}
                          title="Select All Orders"
                        />
                      </th>
                      <th>Order ID &amp; Age</th>
                      <th>Customer &amp; Destination</th>
                      <th>Creations &amp; Weight</th>
                      <th>Amount</th>
                      <th>Live Status</th>
                      <th style={{ minWidth: '180px' }}>1-Click Next Step</th>
                      <th style={{ minWidth: '160px' }}>DTDC AWB Consignment</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {processedOrders.map((o) => {
                        const edit = editStates[o.id] || {
                          orderStatus: o.orderStatus || 'Confirmed',
                          shipmentStatus: o.shipmentStatus || 'Not Shipped',
                          trackingNumber: o.trackingNumber || '',
                          isSaving: false,
                          justSaved: false,
                        };
                        const uStatus = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
                        const nextConfig = getNextStatusConfig(uStatus);
                        const relativeAge = getRelativeDateLabel(o.createdAt);
                        const isSelected = selectedOrderIds.includes(o.id);
                        const isStatusOpen = openStatusMenuId === o.id;

                        return (
                          <motion.tr
                            key={o.id}
                            className={`${styles.manifestRow} ${isSelected ? styles.manifestRowSelected : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Checkbox */}
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOrder(o.id)}
                                className={styles.checkboxInput}
                              />
                            </td>

                            {/* Order ID & Time */}
                            <td>
                              <div className={styles.tableIdCol}>
                                <span className={styles.tableOrderId}>{o.id}</span>
                                <div className={styles.tableDateRow}>
                                  <span className={styles.tableAgeBadge}>{relativeAge}</span>
                                  <span className={styles.tableDateText}>
                                    {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Customer & City */}
                            <td>
                              <div className={styles.tableCustomerCol}>
                                <span className={styles.tableCustomerName}>{o.customerName}</span>
                                <span className={styles.tableCustomerCity}>
                                  {o.shippingAddress?.city || 'Bengaluru'}, {o.shippingAddress?.pincode}
                                </span>
                                <span className={styles.tableCustomerPhone}>{o.customerPhone}</span>
                              </div>
                            </td>

                            {/* Items & Weight */}
                            <td>
                              <div className={styles.tableItemsCol}>
                                <span className={styles.tablePacksBadge}>
                                  {o.items?.length || 1} items • {o.weightGrams || 250}g
                                </span>
                                <div className={styles.tableItemsTooltip}>
                                  {o.items?.map((it, idx) => (
                                    <div key={idx} className={styles.tableItemLine}>
                                      {it.quantity}x {it.product.name} ({it.product.packSize})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>

                            {/* Amount & Payment */}
                            <td>
                              <div className={styles.tableAmountCol}>
                                <span className={styles.tableTotalVal}>₹{o.total}</span>
                                <span className={styles.paymentMethodBadge}>
                                  {o.paymentMethod || 'Razorpay UPI'}
                                </span>
                              </div>
                            </td>

                            {/* Live Status Pill with Quick Selector */}
                            <td>
                              <div className={styles.statusPopoverContainer}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenStatusMenuId(isStatusOpen ? null : o.id);
                                  }}
                                  className={`${styles.statusInteractivePill} ${
                                    uStatus === 'Delivered'
                                      ? styles.pillDelivered
                                      : uStatus === 'Shipped' || uStatus === 'Out for Delivery'
                                      ? styles.pillShipped
                                      : uStatus === 'Processing'
                                      ? styles.pillProcessing
                                      : uStatus === 'Cancelled'
                                      ? styles.pillCancelled
                                      : styles.pillConfirmed
                                  }`}
                                  title="Click to jump to any status directly"
                                >
                                  <span>{getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus)}</span>
                                  <ChevronDown size={11} />
                                </button>

                                {/* Dropdown menu to jump to any status */}
                                {isStatusOpen && (
                                  <div className={styles.statusDropdownMenu}>
                                    <div className={styles.dropdownHeader}>Change Status</div>
                                    <button
                                      type="button"
                                      className={styles.statusOptionBtn}
                                      onClick={() => handleQuickAdvance(o.id, 'Confirmed')}
                                    >
                                      <span>Order Confirmed</span>
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.statusOptionBtn}
                                      onClick={() => handleQuickAdvance(o.id, 'Processing')}
                                    >
                                      <span>Prepared &amp; Packed</span>
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.statusOptionBtn}
                                      onClick={() => handleQuickAdvance(o.id, 'Shipped')}
                                    >
                                      <span>In Transit (DTDC)</span>
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.statusOptionBtn}
                                      onClick={() => handleQuickAdvance(o.id, 'Delivered')}
                                    >
                                      <span>Delivered</span>
                                    </button>
                                    <div className={styles.dropdownDivider} />
                                    <button
                                      type="button"
                                      className={`${styles.statusOptionBtn} ${styles.statusOptionCancel}`}
                                      onClick={() => handleQuickAdvance(o.id, 'Cancelled')}
                                    >
                                      <span>Mark Cancelled</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 1-Click Status Progression Action */}
                            <td>
                              {nextConfig ? (
                                <motion.button
                                  type="button"
                                  onClick={() => handleQuickAdvance(o.id, nextConfig.nextStatus)}
                                  disabled={edit.isSaving}
                                  className={`${styles.oneClickNextBtn} ${
                                    nextConfig.colorScheme === 'amber'
                                      ? styles.nextBtnAmber
                                      : nextConfig.colorScheme === 'blue'
                                      ? styles.nextBtnBlue
                                      : nextConfig.colorScheme === 'green'
                                      ? styles.nextBtnGreen
                                      : styles.nextBtnGray
                                  }`}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.96 }}
                                  title={`Advance order to ${nextConfig.nextStatus}`}
                                >
                                  {edit.isSaving ? (
                                    <span className={styles.savingSpinnerMini} />
                                  ) : (
                                    <>
                                      <span>{nextConfig.label}</span>
                                      <ArrowRight size={12} />
                                    </>
                                  )}
                                </motion.button>
                              ) : (
                                <span className={styles.fulfilledCompleteBadge}>
                                  <CheckCircle2 size={13} />
                                  <span>Fulfilled</span>
                                </span>
                              )}
                            </td>

                            {/* DTDC AWB Consignment Field */}
                            <td>
                              <div className={styles.tableAwbWrap}>
                                <input
                                  type="text"
                                  className={`${styles.tableAwbInput} ${edit.justSaved ? styles.awbSavedPulse : ''}`}
                                  placeholder="e.g. D12345678"
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
                                  onBlur={(e) => handleAwbSave(o.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAwbSave(o.id, (e.target as HTMLInputElement).value);
                                    }
                                  }}
                                />
                                {edit.justSaved && (
                                  <span className={styles.awbCheckFeedback}>
                                    <Check size={12} />
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Quick Customer Communication Actions */}
                            <td style={{ textAlign: 'right' }}>
                              <div className={styles.tableActionsRow}>
                                <a
                                  href={getWhatsAppLink(o)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.actionIconBtn}
                                  title="Send WhatsApp update to customer"
                                >
                                  <MessageCircle size={14} color="#25D366" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(
                                      `${o.customerName}\n${o.customerPhone}\n${o.shippingAddress?.addressLine1}\n${o.shippingAddress?.city}, ${o.shippingAddress?.state} - ${o.shippingAddress?.pincode}`,
                                      'Shipping Address'
                                    )
                                  }
                                  className={styles.actionIconBtn}
                                  title="Copy courier address to clipboard"
                                >
                                  <Copy size={13} />
                                </button>

                                <Link
                                  href={`/track?id=${o.id}`}
                                  target="_blank"
                                  className={styles.actionIconBtn}
                                  title="Open live customer tracking page"
                                >
                                  <ExternalLink size={13} />
                                </Link>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              /* ============================================================
                 B. DETAILED DISPATCH CARDS VIEW (Full Inspection)
                 ============================================================ */
              <div className={styles.ordersList}>
                <AnimatePresence>
                  {processedOrders.map((o) => {
                    const edit = editStates[o.id] || {
                      orderStatus: o.orderStatus || 'Confirmed',
                      shipmentStatus: o.shipmentStatus || 'Not Shipped',
                      trackingNumber: o.trackingNumber || '',
                      isSaving: false,
                      justSaved: false,
                    };

                    const uStatus = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
                    const nextConfig = getNextStatusConfig(uStatus);
                    const relativeAge = getRelativeDateLabel(o.createdAt);
                    const isSelected = selectedOrderIds.includes(o.id);

                    const formattedDate = new Date(o.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    // Stage indices for pipeline stepper
                    const statusOrder: UnifiedStatus[] = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
                    const currentStageIndex = statusOrder.indexOf(
                      uStatus === 'Out for Delivery' ? 'Shipped' : uStatus
                    );

                    return (
                      <motion.div
                        key={o.id}
                        className={`${styles.orderRowCard} ${isSelected ? styles.cardSelected : ''}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                      >
                        {/* CARD TOP HEADER */}
                        <div className={styles.orderCardTop}>
                          <div className={styles.orderMainId}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOrder(o.id)}
                              className={styles.checkboxInput}
                            />
                            <span>{o.id}</span>
                            <div className={styles.orderDateWrap}>
                              <span className={styles.orderDate}>{formattedDate}</span>
                              <span className={styles.dateAgeBadge}>{relativeAge}</span>
                            </div>
                          </div>

                          <div className={styles.cardHeaderRight}>
                            <span className={styles.paymentMethodBadge}>
                              {o.paymentMethod || 'Razorpay UPI'} • {o.paymentStatus || 'Paid'}
                            </span>
                            <span
                              className={
                                uStatus === 'Delivered'
                                  ? styles.pillDelivered
                                  : uStatus === 'Shipped' || uStatus === 'Out for Delivery'
                                  ? styles.pillShipped
                                  : uStatus === 'Processing'
                                  ? styles.pillProcessing
                                  : uStatus === 'Cancelled'
                                  ? styles.pillCancelled
                                  : styles.pillConfirmed
                              }
                            >
                              {getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus)}
                            </span>
                          </div>
                        </div>

                        {/* VISUAL PIPELINE STEPPER BAR */}
                        <div className={styles.cardPipelineStepper}>
                          {[
                            { key: 'Confirmed', label: '1. Confirmed' },
                            { key: 'Processing', label: '2. Packed' },
                            { key: 'Shipped', label: '3. In Transit' },
                            { key: 'Delivered', label: '4. Delivered' },
                          ].map((step, idx) => {
                            const isDone = currentStageIndex >= idx;
                            const isCurrent = currentStageIndex === idx;

                            return (
                              <div
                                key={step.key}
                                className={`${styles.pipelineStepNode} ${
                                  isDone ? styles.stepDone : ''
                                } ${isCurrent ? styles.stepActive : ''}`}
                              >
                                <div className={styles.stepCircle}>
                                  {isDone && !isCurrent ? <Check size={11} /> : idx + 1}
                                </div>
                                <span className={styles.stepLabel}>{step.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* CARD BODY (3 COLUMNS) */}
                        <div className={styles.orderCardBody}>
                          {/* Column 1: Customer Details & Contact Actions */}
                          <div className={styles.customerBlock}>
                            <div className={styles.customerName}>{o.customerName}</div>
                            <div className={styles.customerContact}>
                              Phone: <strong>{o.customerPhone}</strong>
                            </div>
                            <div className={styles.customerContact}>{o.customerEmail}</div>
                            <div className={styles.customerAddress}>
                              {o.shippingAddress?.addressLine1}, {o.shippingAddress?.city}{' '}
                              ({o.shippingAddress?.pincode})
                            </div>

                            {/* Customer Communication Buttons */}
                            <div className={styles.customerActionRow}>
                              <a
                                href={getWhatsAppLink(o)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.btnWhatsApp}
                              >
                                <MessageCircle size={13} color="#25D366" />
                                <span>WhatsApp Update</span>
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    `${o.customerName}\n${o.customerPhone}\n${o.shippingAddress?.addressLine1}\n${o.shippingAddress?.city}, ${o.shippingAddress?.state} - ${o.shippingAddress?.pincode}`,
                                    'Address'
                                  )
                                }
                                className={styles.btnCopyAddress}
                              >
                                <Copy size={12} />
                                <span>Copy Address</span>
                              </button>
                            </div>
                          </div>

                          {/* Column 2: Items Ordered Breakdown */}
                          <div className={styles.itemsBlock}>
                            <div className={styles.itemsSummaryHeader}>Stone-Milled Batch Checklist:</div>
                            <div className={styles.itemsSummary}>
                              {o.items?.map((it, idx) => (
                                <div key={idx} className={styles.itemRow}>
                                  <span className={styles.itemQtyBadge}>{it.quantity}x</span>
                                  <div className={styles.itemInfo}>
                                    <span className={styles.itemTitle}>{it.product.name}</span>
                                    <span className={styles.itemPack}>({it.product.packSize})</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className={styles.orderTotalAmount}>
                              Total: <strong>₹{o.total}</strong>{' '}
                              <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                                ({o.weightGrams || 250}g net)
                              </span>
                            </div>
                          </div>

                          {/* Column 3: Dispatch & Status Control Hub */}
                          <div className={styles.dispatchBlock}>
                            {/* 1-Click Fast Progression Action */}
                            <div className={styles.controlFieldGroup}>
                              <label className={styles.fieldLabel}>Next Stage Progression</label>
                              {nextConfig ? (
                                <motion.button
                                  type="button"
                                  onClick={() => handleQuickAdvance(o.id, nextConfig.nextStatus)}
                                  disabled={edit.isSaving}
                                  className={`${styles.bigAdvanceBtn} ${
                                    nextConfig.colorScheme === 'amber'
                                      ? styles.nextBtnAmber
                                      : nextConfig.colorScheme === 'blue'
                                      ? styles.nextBtnBlue
                                      : nextConfig.colorScheme === 'green'
                                      ? styles.nextBtnGreen
                                      : styles.nextBtnGray
                                  }`}
                                  whileHover={{ scale: 1.01, y: -1 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {edit.isSaving ? (
                                    <span>Saving Status...</span>
                                  ) : (
                                    <>
                                      <span>{nextConfig.label}</span>
                                      <ArrowRight size={14} />
                                    </>
                                  )}
                                </motion.button>
                              ) : (
                                <div className={styles.fulfilledCompleteBadgeLarge}>
                                  <CheckCircle2 size={16} />
                                  <span>Order Fully Delivered &amp; Closed</span>
                                </div>
                              )}
                            </div>

                            {/* DTDC AWB Consignment Field */}
                            <div className={styles.controlFieldGroup}>
                              <div className={styles.fieldLabelRow}>
                                <label className={styles.fieldLabel}>DTDC Consignment AWB</label>
                                {edit.trackingNumber && (
                                  <a
                                    href={`https://www.dtdc.in/tracking/shipment-tracking.asp?trNo=${edit.trackingNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.dtdcVerifyLink}
                                  >
                                    Verify on DTDC ↗
                                  </a>
                                )}
                              </div>
                              <div className={styles.tableAwbWrap}>
                                <input
                                  type="text"
                                  className={`${styles.awbInput} ${edit.justSaved ? styles.awbSavedPulse : ''}`}
                                  placeholder="e.g. D12345678"
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
                                  onBlur={(e) => handleAwbSave(o.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAwbSave(o.id, (e.target as HTMLInputElement).value);
                                    }
                                  }}
                                />
                                {edit.justSaved && (
                                  <span className={styles.awbCheckFeedback}>
                                    <Check size={14} />
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Secondary Actions */}
                            <div className={styles.actionBtnGroup}>
                              <select
                                className={styles.selectInputSmall}
                                value={uStatus}
                                onChange={(e) =>
                                  handleQuickAdvance(o.id, e.target.value as UnifiedStatus)
                                }
                                title="Change status to any stage"
                              >
                                <option value="Confirmed">Order Confirmed</option>
                                <option value="Processing">Prepared &amp; Packed</option>
                                <option value="Shipped">In Transit (DTDC)</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        )}
      </div>

      {/* 5. FLOATING BULK ACTIONS BAR (When 1+ Orders Selected) */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div
            className={styles.bulkActionBar}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className={styles.bulkBarInner}>
              <div className={styles.bulkSelectedCount}>
                <span className={styles.bulkCountNumber}>{selectedOrderIds.length}</span>
                <span>orders selected</span>
              </div>

              <div className={styles.bulkActionsGroup}>
                <button
                  type="button"
                  onClick={() => handleBulkUpdate('Processing')}
                  className={styles.bulkActionBtn}
                >
                  <Package size={13} />
                  <span>Mark as Prepared &amp; Packed</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkUpdate('Shipped')}
                  className={styles.bulkActionBtn}
                >
                  <Truck size={13} />
                  <span>Mark as In Transit (DTDC)</span>
                </button>

                <button
                  type="button"
                  onClick={exportManifestCSV}
                  className={styles.bulkActionBtnSecondary}
                >
                  <Download size={13} />
                  <span>Export Selection</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderIds([])}
                  className={styles.bulkDeselectBtn}
                >
                  <X size={13} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. FLOATING TOAST NOTIFICATION STACK */}
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`${styles.toastItem} ${
                toast.type === 'error'
                  ? styles.toastError
                  : toast.type === 'info'
                  ? styles.toastInfo
                  : styles.toastSuccess
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {toast.type === 'error' ? (
                <AlertCircle size={15} />
              ) : toast.type === 'info' ? (
                <Sparkles size={15} />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
