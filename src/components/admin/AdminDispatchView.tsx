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
  Eye,
  Menu,
  ShoppingBag,
  Users,
  Grid,
  Mail,
  HelpCircle,
  Store,
  DollarSign,
  TrendingDown,
  PieChart as PieChartIcon,
  Printer
} from 'lucide-react';
import { Order, OrderStatus, ShipmentStatus } from '@/types';
import { PRODUCTS } from '@/data/products';
import { Inquiry } from '@/lib/inquiries';
import styles from './AdminDispatchView.module.css';

type DatePreset = 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom';
type SidebarTab = 'dashboard' | 'orders' | 'inquiries';
type OrderDateTab = 'all' | 'today' | 'yesterday' | 'week' | 'month';
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
  
  // Navigation: Sidebar Tab
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Orders View Sub-options
  const [manifestLayout, setManifestLayout] = useState<ManifestLayout>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDateTab, setActiveDateTab] = useState<OrderDateTab>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UnifiedStatus>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  // Inquiries Desk State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

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
        fetchInquiries();
      }
    } catch (err) {
      console.error('Fetch admin orders error:', err);
      setAuthError('Connection error to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const handleToggleInquiryStatus = async (inqId: string, currentStatus: Inquiry['status']) => {
    const nextStatus: Inquiry['status'] = currentStatus === 'new' ? 'replied' : 'new';
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inqId, status: nextStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === inqId ? { ...i, status: nextStatus } : i))
        );
        showToast(`Inquiry marked as ${nextStatus}!`, 'success');
      }
    } catch {
      showToast('Failed to update inquiry status', 'error');
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

    // Optimistic update
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

    // Call backend
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

  // Inline AWB save on button click, blur, or Enter
  const handleAwbSave = async (orderId: string, awbValue: string) => {
    const trimmed = (awbValue || '').trim();
    const existing = orders.find((o) => o.id === orderId);
    if (existing?.trackingNumber === trimmed && trimmed.length > 0) {
      setEditStates((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], justSaved: true },
      }));
      showToast(`DTDC Consignment for #${orderId} verified & up to date`, 'info');
      setTimeout(() => {
        setEditStates((prev) => ({
          ...prev,
          [orderId]: { ...prev[orderId], justSaved: false },
        }));
      }, 2000);
      return;
    }

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

  // Date-based helper for individual orders
  const isOrderInDateTab = (o: Order, tab: OrderDateTab): boolean => {
    if (tab === 'all') return true;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 3600 * 1000;
    const sevenDaysAgo = startOfToday - 6 * 24 * 3600 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const orderTime = new Date(o.createdAt).getTime();

    if (tab === 'today') return orderTime >= startOfToday;
    if (tab === 'yesterday') return orderTime >= startOfYesterday && orderTime < startOfToday;
    if (tab === 'week') return orderTime >= sevenDaysAgo;
    if (tab === 'month') return orderTime >= startOfMonth;
    return true;
  };

  // Dynamic counts for each date tab
  const dateTabCounts = useMemo(() => {
    return {
      all: orders.length,
      today: orders.filter((o) => isOrderInDateTab(o, 'today')).length,
      yesterday: orders.filter((o) => isOrderInDateTab(o, 'yesterday')).length,
      week: orders.filter((o) => isOrderInDateTab(o, 'week')).length,
      month: orders.filter((o) => isOrderInDateTab(o, 'month')).length,
    };
  }, [orders]);

  // Tab & Search Filtered Orders (Date-first approach)
  const processedOrders = useMemo(() => {
    let result = orders.filter((o) => {
      // 1. Primary Date Filter Tab (Today, Yesterday, This Week, etc.)
      if (!isOrderInDateTab(o, activeDateTab)) return false;

      // 2. Secondary Status Filter
      if (statusFilter !== 'all') {
        const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
        if (statusFilter === 'Shipped') {
          if (u !== 'Shipped' && u !== 'Out for Delivery') return false;
        } else if (u !== statusFilter) {
          return false;
        }
      }

      // 3. Search query
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
  }, [orders, activeDateTab, statusFilter, searchTerm, sortBy]);

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

  // Date preset filtering for Overview Dashboard
  const dateFilteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 3600 * 1000;
    const sevenDaysAgo = startOfToday - 6 * 24 * 3600 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      if (datePreset === 'today') return t >= startOfToday;
      if (datePreset === 'yesterday') return t >= startOfYesterday && t < startOfToday;
      if (datePreset === '7days') return t >= sevenDaysAgo;
      if (datePreset === 'month') return t >= startOfMonth;
      if (datePreset === 'custom') {
        if (customStartDate && t < new Date(customStartDate).getTime()) return false;
        if (customEndDate && t > new Date(customEndDate).getTime() + 86400000) return false;
        return true;
      }
      return true; // 'all'
    });
  }, [orders, datePreset, customStartDate, customEndDate]);

  // Analytics Calculations
  const analyticsData = useMemo(() => {
    const subset = dateFilteredOrders;
    const totalRevenue = subset.reduce((sum, o) => sum + (o.total || 0), 0);
    const subtotalRevenue = subset.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const shippingRevenue = subset.reduce((sum, o) => sum + (o.shippingCost || 0), 0);
    const aov = subset.length > 0 ? Math.round(totalRevenue / subset.length) : 0;

    let totalWeightGrams = 0;
    let totalPacksSold = 0;
    const productCounts: Record<string, { id: string; name: string; packSize: string; quantity: number; revenue: number; price: number; image?: string }> = {};

    subset.forEach((o) => {
      totalWeightGrams += o.weightGrams || 250;

      (o.items || []).forEach((it) => {
        totalPacksSold += it.quantity;
        const pId = it.product.id;
        if (!productCounts[pId]) {
          productCounts[pId] = {
            id: it.product.id,
            name: it.product.name,
            packSize: it.product.packSize,
            price: it.product.price,
            quantity: 0,
            revenue: 0,
            image: it.product.images?.primary || '/logo.png',
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

    // If top products has fewer than 4, fill in catalog products
    if (topProducts.length < 4) {
      PRODUCTS.forEach((p) => {
        if (!productCounts[p.id]) {
          topProducts.push({
            id: p.id,
            name: p.name,
            packSize: p.packSize,
            price: p.price,
            quantity: 0,
            revenue: 0,
            image: p.images?.primary || '/logo.png',
          });
        }
      });
    }

    // Recent 5 orders for Overview widget
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

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
      topProducts: topProducts.slice(0, 5),
      recentOrders,
    };
  }, [dateFilteredOrders, orders]);

  // Monthly Breakdown for Bar Chart
  const monthlyBarData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Compute actual orders & dispatches for each month
    const counts: Record<number, { orders: number; dispatched: number }> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const m = d.getMonth();
      if (!counts[m]) counts[m] = { orders: 0, dispatched: 0 };
      counts[m].orders += 1;
      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
      if (u === 'Shipped' || u === 'Out for Delivery' || u === 'Delivered') {
        counts[m].dispatched += 1;
      }
    });

    return monthNames.map((month, idx) => ({
      month,
      monthFull: fullNames[idx],
      orders: counts[idx]?.orders || 0,
      dispatched: counts[idx]?.dispatched || 0,
    }));
  }, [orders]);

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
        <div className={styles.adminTopBarMobile}>
          <div className={styles.brandWrap}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="Good Fills" style={{ height: '30px', width: 'auto', display: 'block' }} />
            </Link>
            <span className={styles.badgeAdmin}>Dispatch Console</span>
          </div>
          <Link href="/" className={styles.viewStoreBtn}>
            Back to Store <ArrowRight size={13} />
          </Link>
        </div>

        <div className={styles.loginWrapper}>
          <div style={{ marginBottom: '16px', color: 'var(--accent-terracotta)' }}>
            <Lock size={32} />
          </div>
          <h2 className={styles.loginTitle}>Kitchen Dispatch Login</h2>
          <p className={styles.loginSubtitle}>
            Enter the 4-digit manager PIN to access the Good Fills executive dashboard, order fulfillment, and DTDC consignments.
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

  // Today's formatted date for Overview header
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={styles.adminDashboardRoot}>
      {/* ====================================================================
          1. LEFT SIDEBAR (Desktop Fixed, Mobile Drawer)
          ==================================================================== */}
      <aside className={`${styles.sidebar} ${isMobileDrawerOpen ? styles.sidebarOpenMobile : ''}`}>
        <div className={styles.sidebarInner}>
          {/* Logo / Brand Header */}
          <div className={styles.sidebarBrand}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="Good Fills" style={{ height: '32px', width: 'auto' }} />
            </Link>
            <button
              type="button"
              className={styles.closeDrawerBtn}
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Navigation Menu */}
          <nav className={styles.sidebarNav}>
            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'dashboard' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveSidebarTab('dashboard');
                setIsMobileDrawerOpen(false);
              }}
            >
              <Grid size={18} />
              <span>Dashboard</span>
              {activeSidebarTab === 'dashboard' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'orders' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveSidebarTab('orders');
                setIsMobileDrawerOpen(false);
              }}
            >
              <ListOrdered size={18} />
              <span>Orders</span>
              <span className={styles.navCountBadge}>{orders.length}</span>
              {activeSidebarTab === 'orders' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'inquiries' ? styles.navItemActive : ''}`}
              onClick={() => {
                setActiveSidebarTab('inquiries');
                setIsMobileDrawerOpen(false);
              }}
            >
              <MessageCircle size={18} />
              <span>Inquiries</span>
              <span className={styles.navCountBadge}>{inquiries.length}</span>
              {activeSidebarTab === 'inquiries' && <div className={styles.activePillMarker} />}
            </button>
          </nav>

          {/* Lower Sidebar Shortcuts */}
          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarFooterTitle}>Shortcuts</div>
            <Link href="/shop" target="_blank" className={styles.footerLink}>
              <Store size={15} />
              <span>Live Store ↗</span>
            </Link>
            <Link href="/track" target="_blank" className={styles.footerLink}>
              <Eye size={15} />
              <span>Tracking Portal ↗</span>
            </Link>
            <button onClick={handleLogout} className={styles.footerLinkBtn}>
              <LogOut size={15} />
              <span>Lock Console</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileDrawerOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ====================================================================
          2. MAIN CONTENT STAGE
          ==================================================================== */}
      <div className={styles.mainContentStage}>
        {/* TOP MOBILE & TABLET HEADER BAR */}
        <header className={styles.mobileTopBar}>
          <div className={styles.mobileTopLeft}>
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className={styles.hamburgerBtn}
              aria-label="Open sidebar navigation"
            >
              <Menu size={20} />
            </button>
            <img src="/logo.png" alt="Good Fills" style={{ height: '24px', width: 'auto' }} />
          </div>

          <div className={styles.mobileTopRight}>
            <div className={styles.liveIndicatorDot}>
              <span className={styles.pulseDot} />
              <span>Live</span>
            </div>
            <button onClick={handleLogout} className={styles.mobileLockBtn} title="Lock">
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* MOBILE HORIZONTAL SCROLLABLE TAB STRIP (Instant 1-Tap Switching) */}
        <div className={styles.mobileTabStrip}>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'dashboard' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => setActiveSidebarTab('dashboard')}
          >
            <Grid size={14} />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'orders' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => setActiveSidebarTab('orders')}
          >
            <ListOrdered size={14} />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'inquiries' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => setActiveSidebarTab('inquiries')}
          >
            <MessageCircle size={14} />
            <span>Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* ====================================================================
            TAB A: DASHBOARD OVERVIEW (Matching reference image)
            ==================================================================== */}
        {activeSidebarTab === 'dashboard' && (
          <div className={styles.dashboardContainer}>
            {/* Overview Header with Date */}
            <div className={styles.overviewHeaderRow}>
              <div>
                <h1 className={styles.overviewTitle}>Overview</h1>
                <p className={styles.overviewDateText}>{todayFormatted}</p>
              </div>

              <div className={styles.dateDropdownWrapper}>
                <Calendar size={14} className={styles.dateIcon} />
                <select
                  className={styles.overviewDateSelect}
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* 4 COLORFUL STAT CARDS (2x2 on mobile, 4 in row on desktop) */}
            <div className={styles.statsCardsGrid}>
              {/* Card 1: Total Sales */}
              <div
                className={styles.statCardRef}
                onClick={() => {
                  setActiveSidebarTab('orders');
                  setActiveDateTab('all');
                }}
                role="button"
                tabIndex={0}
              >
                <div className={`${styles.statIconBadge} ${styles.badgePink}`}>
                  <ShoppingBag size={20} color="#E0567A" />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statTitleRef}>Total Sales</span>
                  <div className={styles.statNumberRef}>₹{analyticsData.totalRevenue.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Card 2: Total Orders */}
              <div
                className={styles.statCardRef}
                onClick={() => {
                  setActiveSidebarTab('orders');
                  setActiveDateTab('all');
                }}
                role="button"
                tabIndex={0}
              >
                <div className={`${styles.statIconBadge} ${styles.badgePurple}`}>
                  <ListOrdered size={20} color="#7952B3" />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statTitleRef}>Total Orders</span>
                  <div className={styles.statNumberRef}>{orders.length}</div>
                </div>
              </div>

              {/* Card 3: Total Items / Packs */}
              <div
                className={styles.statCardRef}
                onClick={() => {
                  setActiveSidebarTab('orders');
                  setActiveDateTab('all');
                }}
                role="button"
                tabIndex={0}
              >
                <div className={`${styles.statIconBadge} ${styles.badgeOrange}`}>
                  <Package size={20} color="#E67E22" />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statTitleRef}>Total Packs</span>
                  <div className={styles.statNumberRef}>{analyticsData.totalPacksSold}</div>
                </div>
              </div>

              {/* Card 4: DTDC Transit & Revenue */}
              <div
                className={styles.statCardRef}
                onClick={() => {
                  setActiveSidebarTab('orders');
                  setActiveDateTab('all');
                }}
                role="button"
                tabIndex={0}
              >
                <div className={`${styles.statIconBadge} ${styles.badgeBlue}`}>
                  <Truck size={20} color="#2980B9" />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statTitleRef}>DTDC In Transit</span>
                  <div className={styles.statNumberRef}>{analyticsData.shippedCount} orders</div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: TOTAL ORDERS ANALYTIC CHART (LEFT) & ORDER RECENTLY (RIGHT) */}
            <div className={styles.chartAndRecentRow}>
              {/* Left: Total Orders Trend Wave Chart */}
              <div className={styles.chartPanel}>
                <div className={styles.panelHeaderRow}>
                  <div className={styles.chartTitle}>Total Orders Analytics</div>
                  <div className={styles.chartLegendRow}>
                    <div className={styles.legendItem}>
                      <span className={styles.dotGreen} />
                      <span>Orders Received</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span className={styles.dotBlue} />
                      <span>DTDC Dispatched</span>
                    </div>
                  </div>
                </div>

                {/* Responsive SVG Bar Chart */}
                {(() => {
                  const maxVal = Math.max(...monthlyBarData.map((m) => Math.max(m.orders, m.dispatched)), 5);
                  const ceiling = Math.max(Math.ceil(maxVal * 1.25), 5);
                  const currentMonthIdx = new Date().getMonth();
                  const activeTooltipIdx = hoveredBarIdx !== null ? hoveredBarIdx : currentMonthIdx;
                  const activeItem = monthlyBarData[activeTooltipIdx] || monthlyBarData[0];
                  const slotWidth = 500 / 12; // 41.67
                  const activeSlotX = 20 + activeTooltipIdx * slotWidth;
                  const activeCenterX = activeSlotX + slotWidth / 2;
                  const activeMinY = Math.min(
                    175 - (activeItem.orders > 0 ? Math.max(4, (activeItem.orders / ceiling) * 135) : 0),
                    175 - (activeItem.dispatched > 0 ? Math.max(3, (activeItem.dispatched / ceiling) * 135) : 0)
                  );

                  return (
                    <div className={styles.svgChartContainer}>
                      <svg
                        viewBox="0 0 540 210"
                        className={styles.svgChart}
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="greenBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="blueBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#2563EB" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Reference Lines */}
                        <line x1="20" y1="40" x2="520" y2="40" stroke="#EEE8DE" strokeDasharray="3 3" />
                        <line x1="20" y1="85" x2="520" y2="85" stroke="#EEE8DE" strokeDasharray="3 3" />
                        <line x1="20" y1="130" x2="520" y2="130" stroke="#EEE8DE" strokeDasharray="3 3" />
                        <line x1="20" y1="175" x2="520" y2="175" stroke="#E5DEC9" strokeWidth="1.5" />

                        {/* Bar Columns */}
                        {monthlyBarData.map((m, i) => {
                          const slotX = 20 + i * slotWidth;
                          const barW = 10;
                          const gap = 3;
                          const pairW = barW * 2 + gap; // 23
                          const offset = (slotWidth - pairW) / 2; // ~9.33

                          const greenX = slotX + offset;
                          const blueX = greenX + barW + gap;

                          const greenH = m.orders > 0 ? Math.max(4, Math.round((m.orders / ceiling) * 135)) : 0;
                          const greenY = 175 - greenH;

                          const blueH = m.dispatched > 0 ? Math.max(3, Math.round((m.dispatched / ceiling) * 135)) : 0;
                          const blueY = 175 - blueH;

                          const isHovered = hoveredBarIdx === i;

                          return (
                            <g key={m.month}>
                              {/* Hover backdrop highlight */}
                              <rect
                                x={slotX + 3}
                                y={25}
                                width={slotWidth - 6}
                                height={150}
                                fill={isHovered ? 'rgba(0, 0, 0, 0.04)' : 'transparent'}
                                rx="2"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredBarIdx(i)}
                                onMouseLeave={() => setHoveredBarIdx(null)}
                              />

                              {/* Green Bar: Orders Received */}
                              {greenH > 0 && (
                                <rect
                                  x={greenX}
                                  y={greenY}
                                  width={barW}
                                  height={greenH}
                                  fill="url(#greenBarGrad)"
                                  rx="1"
                                  style={{
                                    transition: 'all 0.2s ease',
                                    opacity: hoveredBarIdx === null || isHovered ? 1 : 0.65,
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={() => setHoveredBarIdx(i)}
                                  onMouseLeave={() => setHoveredBarIdx(null)}
                                />
                              )}

                              {/* Blue Bar: DTDC Dispatched */}
                              {blueH > 0 && (
                                <rect
                                  x={blueX}
                                  y={blueY}
                                  width={barW}
                                  height={blueH}
                                  fill="url(#blueBarGrad)"
                                  rx="1"
                                  style={{
                                    transition: 'all 0.2s ease',
                                    opacity: hoveredBarIdx === null || isHovered ? 1 : 0.65,
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={() => setHoveredBarIdx(i)}
                                  onMouseLeave={() => setHoveredBarIdx(null)}
                                />
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* Interactive Tooltip Badge */}
                      <div
                        className={styles.chartBadgePeak}
                        style={{
                          left: `${(activeCenterX / 540) * 100}%`,
                          top: `${Math.max(14, ((activeMinY - 10) / 210) * 100)}%`,
                        }}
                      >
                        <span className={styles.barTooltipMonth}>{activeItem.monthFull}</span>
                        <div className={styles.barTooltipStats}>
                          <span className={styles.barTooltipOrders}>● {activeItem.orders} Orders</span>
                          <span className={styles.barTooltipDispatched}>● {activeItem.dispatched} Dispatched</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* X Axis Months */}
                <div className={styles.chartXLabels}>
                  {monthlyBarData.map((m, idx) => {
                    const activeTooltipIdx = hoveredBarIdx !== null ? hoveredBarIdx : 9;
                    return (
                      <span
                        key={m.month}
                        className={`${styles.chartXLabelItem} ${activeTooltipIdx === idx ? styles.chartXLabelActive : ''}`}
                        onMouseEnter={() => setHoveredBarIdx(idx)}
                        onMouseLeave={() => setHoveredBarIdx(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        {m.month}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Right: Order Recently Widget */}
              <div className={styles.recentOrdersPanel}>
                <div className={styles.panelHeaderRow}>
                  <div className={styles.chartTitle}>Recent Orders</div>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarTab('orders')}
                    className={styles.viewAllBtnSmall}
                  >
                    View All ➔
                  </button>
                </div>

                <div className={styles.recentOrdersList}>
                  {analyticsData.recentOrders.length === 0 ? (
                    <div style={{ padding: '36px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.82rem' }}>
                      No orders placed yet. Live orders will appear here automatically.
                    </div>
                  ) : (
                    analyticsData.recentOrders.map((o) => {
                      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
                      const firstItem = o.items?.[0]?.product.name || 'Stone-Milled Creation';
                      return (
                        <div key={o.id} className={styles.recentOrderItem}>
                          <div className={styles.recentItemThumb}>
                            <Package size={17} color="var(--accent-terracotta)" />
                          </div>
                          <div className={styles.recentItemInfo}>
                            <div className={styles.recentItemName}>{o.customerName}</div>
                            <div className={styles.recentItemSub}>
                              {firstItem} • {getRelativeDateLabel(o.createdAt)}
                            </div>
                          </div>
                          <div className={styles.recentItemRight}>
                            <div className={styles.recentItemPrice}>₹{o.total}</div>
                            <span
                              className={
                                u === 'Delivered'
                                  ? styles.pillDeliveredSmall
                                  : u === 'Shipped' || u === 'Out for Delivery'
                                  ? styles.pillShippedSmall
                                  : u === 'Processing'
                                  ? styles.pillProcessingSmall
                                  : styles.pillConfirmedSmall
                              }
                            >
                              {u === 'Processing' ? 'Packed' : u}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('orders')}
                  className={styles.viewAllOrdersBlockBtn}
                >
                  <span>Go to Full Orders Manifest ({orders.length})</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* BOTTOM ROW: ACTIVE DISPATCH QUEUE (LEFT) & FULFILLMENT STATUS (RIGHT) */}
            <div className={styles.productsAndDonutRow}>
              {/* Left: Active Dispatch Queue */}
              <div className={styles.topCreationsPanel}>
                <div className={styles.panelHeaderRow}>
                  <div className={styles.chartTitle}>Active Dispatch Queue</div>
                  <span className={styles.panelBadgeSmall}>
                    {orders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Delivered').length} Actionable
                  </span>
                </div>

                <div className={styles.tableResponsiveWrapSimple}>
                  <table className={styles.simpleTable}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Delivered').length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF', fontSize: '0.82rem' }}>
                            No actionable orders in the queue. All orders are fulfilled or pending placement.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus) !== 'Delivered')
                          .slice(0, 4)
                          .map((o) => {
                            const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus);
                            const next = getNextStatusConfig(u);
                            return (
                              <tr key={o.id}>
                                <td>
                                  <strong style={{ color: 'var(--accent-terracotta)' }}>#{o.id}</strong>
                                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                                    {o.items?.length || 1} items • ₹{o.total}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600, color: '#111827' }}>{o.customerName}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{o.shippingAddress?.city}</div>
                                </td>
                                <td>
                                  <span
                                    className={
                                      u === 'Shipped'
                                        ? styles.pillShippedSmall
                                        : u === 'Processing'
                                        ? styles.pillProcessingSmall
                                        : styles.pillConfirmedSmall
                                    }
                                  >
                                    {getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus)}
                                  </span>
                                </td>
                                <td>
                                  {next ? (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickAdvance(o.id, next.nextStatus)}
                                      className={`${styles.oneClickNextBtn} ${
                                        next.colorScheme === 'amber'
                                          ? styles.nextBtnAmber
                                          : next.colorScheme === 'blue'
                                          ? styles.nextBtnBlue
                                          : styles.nextBtnGreen
                                      }`}
                                      style={{ padding: '4px 9px', fontSize: '0.7rem' }}
                                    >
                                      <span>{next.label}</span>
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 700 }}>✓ Done</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Order Fulfillment Status Donut */}
              <div className={styles.donutPanel}>
                <div className={styles.panelHeaderRow}>
                  <div className={styles.chartTitle}>Kitchen Fulfillment</div>
                  <PieChartIcon size={16} color="var(--text-muted)" />
                </div>

                <div className={styles.donutChartContainer}>
                  {/* SVG Donut */}
                  <svg viewBox="0 0 160 160" className={styles.svgDonut}>
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#EBF5FB"
                      strokeWidth="20"
                    />
                    {/* Confirmed Segment */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#2471A3"
                      strokeWidth="20"
                      strokeDasharray="140 377"
                      strokeDashoffset="0"
                    />
                    {/* Packed Segment */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#B7950B"
                      strokeWidth="20"
                      strokeDasharray="90 377"
                      strokeDashoffset="-140"
                    />
                    {/* Shipped Segment */}
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#229954"
                      strokeWidth="20"
                      strokeDasharray="100 377"
                      strokeDashoffset="-230"
                    />
                  </svg>
                  <div className={styles.donutCenterLabel}>
                    <span className={styles.donutCenterSub}>Total</span>
                    <strong className={styles.donutCenterMain}>{analyticsData.orderCount}</strong>
                    <span className={styles.donutCenterSub}>Orders</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className={styles.donutLegendGrid}>
                  <div className={styles.donutLegendItem}>
                    <span className={styles.legendDotConfirmed} />
                    <span>Confirmed ({analyticsData.confirmedCount})</span>
                  </div>
                  <div className={styles.donutLegendItem}>
                    <span className={styles.legendDotPacked} />
                    <span>Packed ({analyticsData.processingCount})</span>
                  </div>
                  <div className={styles.donutLegendItem}>
                    <span className={styles.legendDotShipped} />
                    <span>In Transit ({analyticsData.shippedCount})</span>
                  </div>
                  <div className={styles.donutLegendItem}>
                    <span className={styles.legendDotDelivered} />
                    <span>Delivered ({analyticsData.deliveredCount})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB B: ORDERS MANIFEST (Full Control with 1-Click Status Advance)
            ==================================================================== */}
        {activeSidebarTab === 'orders' && (
          <div className={styles.manifestViewContainer}>
            {/* Header Strip with Period & Actions */}
            <div className={styles.manifestHeaderStrip}>
              <div>
                <h1 className={styles.overviewTitle}>Orders &amp; Dispatch Manifest</h1>
                <p className={styles.overviewDateText}>
                  {orders.length} total orders recorded • DTDC Pan-India Courier Hub
                </p>
              </div>

              <div className={styles.manifestHeaderActions}>
                <button type="button" onClick={exportManifestCSV} className={styles.exportBtn}>
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Controls Bar: Date Filter Tabs (Today, Yesterday, etc.), Search, Status & Sort */}
            <div className={styles.controlsBar}>
              <div className={styles.filterTabsScrollable}>
                {(['all', 'today', 'yesterday', 'week', 'month'] as const).map((tab) => {
                  const isActive = activeDateTab === tab;
                  const count = dateTabCounts[tab];
                  const tabLabelMap = {
                    all: 'All Orders',
                    today: 'Today',
                    yesterday: 'Yesterday',
                    week: 'This Week',
                    month: 'This Month',
                  };

                  return (
                    <button
                      key={tab}
                      type="button"
                      className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                      onClick={() => setActiveDateTab(tab)}
                    >
                      <span>{tabLabelMap[tab]}</span>
                      <span className={styles.filterCountBadge}>{count}</span>
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
                    placeholder="Search ID, name, phone, city, AWB..."
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

                <div className={styles.filtersDropdownRow}>
                  {/* Status Dropdown Filter */}
                  <select
                    className={styles.sortSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Packed</option>
                    <option value="Shipped">In Transit (DTDC)</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  {/* Sort Option */}
                  <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest (₹)</option>
                    <option value="lowest">Lowest (₹)</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* EMPTY STATE */}
            {processedOrders.length === 0 ? (
              <div className={styles.emptyManifestWrap}>
                <Package size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <h4 className={styles.emptyTitle}>No Orders Found</h4>
                <p className={styles.emptySubtitle}>Try resetting filters or searching with another term.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveDateTab('all');
                    setDatePreset('all');
                  }}
                  className={styles.resetFiltersBtn}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                {/* 1. DENSE TABLE (Shown on Desktop when Table selected) */}
                <div className={`${styles.desktopTableWrap} ${manifestLayout === 'cards' ? styles.hideOnDesktopIfCards : ''}`}>
                  <table className={styles.manifestTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '38px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.length > 0 && selectedOrderIds.length === processedOrders.length}
                            onChange={toggleSelectAll}
                            className={styles.checkboxInput}
                            title="Select All"
                          />
                        </th>
                        <th>Order ID &amp; Age</th>
                        <th>Customer &amp; City</th>
                        <th>Items &amp; Weight</th>
                        <th>Amount</th>
                        <th>Live Status</th>
                        <th style={{ minWidth: '170px' }}>1-Click Next Action</th>
                        <th style={{ minWidth: '140px' }}>DTDC Consignment</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
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
                          <tr key={o.id} className={`${styles.manifestRow} ${isSelected ? styles.manifestRowSelected : ''}`}>
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectOrder(o.id)}
                                className={styles.checkboxInput}
                              />
                            </td>

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

                            <td>
                              <div className={styles.tableCustomerCol}>
                                <span className={styles.tableCustomerName}>{o.customerName}</span>
                                <span className={styles.tableCustomerCity}>
                                  {o.shippingAddress?.city || 'Bengaluru'}, {o.shippingAddress?.pincode}
                                </span>
                                <span className={styles.tableCustomerPhone}>{o.customerPhone}</span>
                              </div>
                            </td>

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

                            <td>
                              <div className={styles.tableAmountCol}>
                                <span className={styles.tableTotalVal}>₹{o.total}</span>
                                <span className={styles.paymentMethodBadge}>
                                  {o.paymentMethod || 'Razorpay UPI'}
                                </span>
                              </div>
                            </td>

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
                                  title="Click to jump to any status"
                                >
                                  <span>{getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus)}</span>
                                  <ChevronDown size={11} />
                                </button>

                                {isStatusOpen && (
                                  <div className={styles.statusDropdownMenu}>
                                    <div className={styles.dropdownHeader}>Select Status</div>
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
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAwbSave(o.id, edit.trackingNumber);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAwbSave(o.id, edit.trackingNumber)}
                                  disabled={edit.isSaving}
                                  className={`${styles.awbSaveBtn} ${edit.justSaved ? styles.awbSaveBtnSaved : ''}`}
                                  title="Save DTDC Consignment Number"
                                >
                                  {edit.justSaved ? (
                                    <>
                                      <Check size={11} />
                                      <span>Saved</span>
                                    </>
                                  ) : edit.isSaving ? (
                                    <span className={styles.savingSpinnerMini} />
                                  ) : (
                                    <span>Save</span>
                                  )}
                                </button>
                              </div>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div className={styles.tableActionsRow}>
                                <Link
                                  href={`/invoice/${o.id}`}
                                  target="_blank"
                                  className={styles.actionIconBtn}
                                  title="Print Official Invoice / Packing Slip"
                                >
                                  <Printer size={13} color="#97411d" />
                                </Link>

                                <a
                                  href={getWhatsAppLink(o)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.actionIconBtn}
                                  title="WhatsApp Customer"
                                >
                                  <MessageCircle size={14} color="#25D366" />
                                </a>

                                <Link
                                  href={`/track?id=${o.id}`}
                                  target="_blank"
                                  className={styles.actionIconBtn}
                                  title="Live Tracking Page"
                                >
                                  <ExternalLink size={13} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 2. RESPONSIVE MOBILE & CARD CARDS (Always used on mobile for flawless touch experience) */}
                <div className={`${styles.mobileCardsList} ${manifestLayout === 'cards' ? styles.showOnDesktopIfCards : ''}`}>
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

                    const statusOrder: UnifiedStatus[] = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
                    const currentStageIndex = statusOrder.indexOf(
                      uStatus === 'Out for Delivery' ? 'Shipped' : uStatus
                    );

                    return (
                      <div
                        key={o.id}
                        className={`${styles.mobileOrderCard} ${isSelected ? styles.cardSelected : ''}`}
                      >
                        {/* Top ID & Live Status */}
                        <div className={styles.mobileCardHeader}>
                          <div className={styles.mobileIdWrap}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOrder(o.id)}
                              className={styles.checkboxInput}
                            />
                            <strong className={styles.mobileOrderIdText}>{o.id}</strong>
                            <span className={styles.dateAgeBadge}>{relativeAge}</span>
                          </div>

                          <span
                            className={
                              uStatus === 'Delivered'
                                ? styles.pillDeliveredSmall
                                : uStatus === 'Shipped' || uStatus === 'Out for Delivery'
                                ? styles.pillShippedSmall
                                : uStatus === 'Processing'
                                ? styles.pillProcessingSmall
                                : styles.pillConfirmedSmall
                            }
                          >
                            {getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus)}
                          </span>
                        </div>

                        {/* Customer & Items Brief */}
                        <div className={styles.mobileCardContent}>
                          <div className={styles.mobileCustomerRow}>
                            <span className={styles.mobileCustomerName}>{o.customerName}</span>
                            <span className={styles.mobileCustomerCity}>
                              {o.shippingAddress?.city || 'Bengaluru'}
                            </span>
                          </div>

                          <div className={styles.mobileAddressLine}>
                            {o.shippingAddress?.addressLine1}, {o.shippingAddress?.pincode} • Phone: <strong>{o.customerPhone}</strong>
                          </div>

                          {/* Items summary */}
                          <div className={styles.mobileItemsList}>
                            {o.items?.map((it, idx) => (
                              <div key={idx} className={styles.mobileItemChip}>
                                <span className={styles.chipQty}>{it.quantity}x</span>
                                <span>{it.product.name}</span>
                              </div>
                            ))}
                          </div>

                          {/* Stepper Progression Bar */}
                          <div className={styles.cardPipelineStepperMobile}>
                            {['Confirmed', 'Packed', 'In Transit', 'Delivered'].map((stepName, idx) => {
                              const isDone = currentStageIndex >= idx;
                              const isCurrent = currentStageIndex === idx;
                              return (
                                <div
                                  key={stepName}
                                  className={`${styles.miniStepNode} ${isDone ? styles.stepDone : ''} ${isCurrent ? styles.stepActive : ''}`}
                                >
                                  <div className={styles.miniStepCircle}>
                                    {isDone && !isCurrent ? <Check size={9} /> : idx + 1}
                                  </div>
                                  <span className={styles.miniStepLabel}>{stepName}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* 1-Click Fast Progression Button */}
                          <div className={styles.mobileAdvanceSection}>
                            {nextConfig ? (
                              <motion.button
                                type="button"
                                onClick={() => handleQuickAdvance(o.id, nextConfig.nextStatus)}
                                disabled={edit.isSaving}
                                className={`${styles.mobileBigAdvanceBtn} ${
                                  nextConfig.colorScheme === 'amber'
                                    ? styles.nextBtnAmber
                                    : nextConfig.colorScheme === 'blue'
                                    ? styles.nextBtnBlue
                                    : nextConfig.colorScheme === 'green'
                                    ? styles.nextBtnGreen
                                    : styles.nextBtnGray
                                }`}
                                whileTap={{ scale: 0.98 }}
                              >
                                {edit.isSaving ? (
                                  <span>Advancing...</span>
                                ) : (
                                  <>
                                    <span>{nextConfig.label}</span>
                                    <ArrowRight size={13} />
                                  </>
                                )}
                              </motion.button>
                            ) : (
                              <div className={styles.fulfilledCompleteBadgeMobile}>
                                <CheckCircle2 size={15} />
                                <span>Order Delivered &amp; Closed</span>
                              </div>
                            )}
                          </div>

                          {/* DTDC AWB & Fast Actions */}
                          <div className={styles.mobileCardActionsSection}>
                            {/* Tier 1: Consignment Tracking Input + Save Button */}
                            <div className={styles.mobileAwbInputGroup}>
                              <div className={styles.mobileAwbFieldWrap}>
                                <Truck size={14} className={styles.mobileAwbTruckIcon} />
                                <input
                                  type="text"
                                  className={`${styles.mobileAwbInput} ${edit.justSaved ? styles.awbSavedPulse : ''}`}
                                  placeholder="DTDC Consignment No."
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
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAwbSave(o.id, edit.trackingNumber);
                                    }
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAwbSave(o.id, edit.trackingNumber)}
                                disabled={edit.isSaving}
                                className={`${styles.mobileAwbSaveBtn} ${edit.justSaved ? styles.awbSaveBtnSaved : ''}`}
                                title="Save DTDC Consignment"
                              >
                                {edit.justSaved ? (
                                  <>
                                    <Check size={12} />
                                    <span>Saved</span>
                                  </>
                                ) : edit.isSaving ? (
                                  <span className={styles.savingSpinnerMini} />
                                ) : (
                                  <span>Save</span>
                                )}
                              </button>
                            </div>

                            {/* Tier 2: Action Buttons (WhatsApp, Official Invoice, Track) */}
                            <div className={styles.mobileCardActionButtonsRow}>
                              <a
                                href={getWhatsAppLink(o)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.mobileWhatsAppBtn}
                                title="WhatsApp Customer"
                              >
                                <MessageCircle size={15} />
                                <span>WhatsApp</span>
                              </a>

                              <Link
                                href={`/invoice/${o.id}`}
                                target="_blank"
                                className={styles.mobileInvoiceBtn}
                                title="Print Official Tax Invoice / Packing Slip"
                              >
                                <Printer size={15} color="#97411d" />
                                <span>Invoice</span>
                              </Link>

                              <Link
                                href={`/track?id=${o.id}`}
                                target="_blank"
                                className={styles.mobileTrackBtn}
                                title="Live Customer Track"
                              >
                                <ExternalLink size={15} />
                                <span>Track</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB C: INQUIRIES DESK (Real-Time Messages from Contact Page)
            ==================================================================== */}
        {activeSidebarTab === 'inquiries' && (
          <div className={styles.dashboardContainer}>
            <div className={styles.overviewHeaderRow}>
              <div>
                <h1 className={styles.overviewTitle}>Kitchen Inquiries Desk</h1>
                <p className={styles.overviewDateText}>
                  {inquiries.length} Patron inquiries received from Contact &amp; Atelier desk
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={fetchInquiries}
                  className={styles.exportBtn}
                  title="Reload inquiries"
                >
                  <span>{isLoadingInquiries ? 'Refreshing...' : 'Refresh ↻'}</span>
                </button>
                <Link href="/contact" target="_blank" className={styles.exportBtn}>
                  <ExternalLink size={13} />
                  <span>Open Contact Page ↗</span>
                </Link>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <MessageCircle size={32} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
                  No Inquiries Recorded Yet
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
                  Customer messages submitted from the Contact page will automatically appear here.
                </p>
              </div>
            ) : (
              <div className={styles.inquiriesListGrid}>
                {inquiries.map((inq) => {
                  const rawPhone = (inq.phone || '').replace(/[^0-9]/g, '');
                  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                  const firstName = inq.name ? inq.name.split(' ')[0] : 'Patron';
                  const waText = encodeURIComponent(
                    `Hello ${firstName}! Thank you for reaching out to Good Fills regarding "${inq.category}". `
                  );
                  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

                  const inqDate = new Date(inq.createdAt);
                  const timeFormatted = inqDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={inq.id} className={styles.inquiryCard}>
                      <div className={styles.inquiryHeader}>
                        <div>
                          <strong className={styles.inquiryName}>{inq.name}</strong>
                          <div className={styles.inquiryPhone}>
                            {inq.phone} {inq.email ? `• ${inq.email}` : ''}
                          </div>
                        </div>
                        <div className={styles.inquiryMetaRow}>
                          <span
                            className={
                              inq.status === 'replied'
                                ? styles.inquiryStatusBadgeReplied
                                : styles.inquiryStatusBadgeNew
                            }
                          >
                            {inq.status === 'replied' ? 'Replied' : 'New'}
                          </span>
                          <span className={styles.inquiryBadge}>{inq.category}</span>
                        </div>
                      </div>

                      {inq.orderId && (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSidebarTab('orders');
                              setActiveDateTab('all');
                              setSearchTerm(inq.orderId || '');
                            }}
                            className={styles.inquiryOrderRefBtn}
                            title="Click to view related order in manifest"
                          >
                            <span>Ref Order: #{inq.orderId} ↗</span>
                          </button>
                        </div>
                      )}

                      <p className={styles.inquiryBody}>&ldquo;{inq.message}&rdquo;</p>

                      <div className={styles.inquiryFooter}>
                        <span className={styles.inquiryTime}>{timeFormatted}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleInquiryStatus(inq.id, inq.status)}
                            className={styles.inquiryToggleBtn}
                            title="Toggle status"
                          >
                            {inq.status === 'replied' ? 'Mark New' : 'Mark Replied'}
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnWhatsApp}
                          >
                            <MessageCircle size={13} color="#25D366" />
                            <span>Reply via WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          3. FLOATING BULK ACTIONS BAR (When 1+ Orders Selected)
          ==================================================================== */}
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
                  <span>Mark as Packed</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkUpdate('Shipped')}
                  className={styles.bulkActionBtn}
                >
                  <Truck size={13} />
                  <span>Mark as In Transit</span>
                </button>

                <button
                  type="button"
                  onClick={exportManifestCSV}
                  className={styles.bulkActionBtnSecondary}
                >
                  <Download size={13} />
                  <span>Export</span>
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

      {/* ====================================================================
          4. FLOATING TOAST NOTIFICATION STACK
          ==================================================================== */}
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
    </div>
  );
}
