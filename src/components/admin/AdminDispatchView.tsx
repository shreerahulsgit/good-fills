'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Printer,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Star,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, ShipmentStatus, PaymentStatus, Product, ProductCategory, ProductAvailability } from '@/types';
import { PRODUCTS } from '@/data/products';
import { Inquiry } from '@/lib/inquiries';
import { AdminKitchenManifestView } from './AdminKitchenManifestView';
import { AdminReviewsModerationView } from './AdminReviewsModerationView';
import styles from './AdminDispatchView.module.css';

type DatePreset = 'all' | 'today' | 'yesterday' | '7days' | 'month' | 'custom';
type SidebarTab = 'dashboard' | 'orders' | 'kitchen' | 'products' | 'reviews' | 'inquiries';
type OrderDateTab = 'all' | 'today' | 'yesterday' | 'week' | 'month';
type ManifestLayout = 'table' | 'cards';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'name';

export type UnifiedStatus = 'Confirmed' | 'Processing' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Pending' | 'Failed';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export const getUnifiedStatus = (
  orderStatus?: OrderStatus, 
  shipmentStatus?: ShipmentStatus, 
  paymentStatus?: PaymentStatus
): UnifiedStatus => {
  if (paymentStatus === 'Failed' || orderStatus === 'Failed') return 'Failed';
  if (orderStatus === 'Cancelled') return 'Cancelled';
  if (paymentStatus === 'Pending' || orderStatus === 'Pending') return 'Pending';
  if (orderStatus === 'Completed' || shipmentStatus === 'Delivered') return 'Delivered';
  if (shipmentStatus === 'Out for Delivery') return 'Out for Delivery';
  if (shipmentStatus === 'In Transit') return 'In Transit';
  if (shipmentStatus === 'Handed Over' && orderStatus === 'Shipped') return 'Shipped';
  if (orderStatus === 'Ready to Ship') return 'Processing';
  return 'Confirmed';
};

export const getUnifiedStatusLabel = (
  orderStatus?: OrderStatus, 
  shipmentStatus?: ShipmentStatus, 
  paymentStatus?: PaymentStatus
): string => {
  const s = getUnifiedStatus(orderStatus, shipmentStatus, paymentStatus);
  switch (s) {
    case 'Failed':
      return 'Failed';
    case 'Pending':
      return 'Pending';
    case 'Processing':
      return 'Packed';
    case 'Shipped':
      return 'Shipped';
    case 'In Transit':
      return 'In Transit';
    case 'Out for Delivery':
      return 'Out for Delivery';
    case 'Delivered':
      return 'Delivered';
    case 'Cancelled':
      return 'Cancelled';
    case 'Confirmed':
    default:
      return 'Confirmed';
  }
};

export interface AdminDispatchViewProps {
  initialTab?: SidebarTab;
}

export function AdminDispatchView({ initialTab = 'dashboard' }: AdminDispatchViewProps) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const hasBootstrappedAdminSession = useRef(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Navigation: Sidebar Tab with direct URL endpoint synchronization
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>(initialTab);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveSidebarTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.replace(/\/$/, '');
        const segments = path.split('/');
        const last = segments[segments.length - 1];
        const validTabs: SidebarTab[] = ['dashboard', 'orders', 'kitchen', 'products', 'reviews', 'inquiries'];
        if (validTabs.includes(last as SidebarTab)) {
          setActiveSidebarTab(last as SidebarTab);
          if (last === 'products') {
            fetchProducts();
          }
        } else if (last === 'console') {
          setActiveSidebarTab('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: SidebarTab) => {
    setActiveSidebarTab(tab);
    setIsMobileDrawerOpen(false);
    if (tab === 'products') {
      fetchProducts();
    }
    if (typeof window !== 'undefined') {
      const targetUrl = tab === 'dashboard' ? '/console/dashboard' : `/console/${tab}`;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    }
  };
  
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
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [isResettingData, setIsResettingData] = useState(false);

  // Products Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [productAvailabilityFilter, setProductAvailabilityFilter] = useState<'all' | ProductAvailability>('all');
  const [productFeaturedFilter, setProductFeaturedFilter] = useState<'all' | 'featured'>('all');

  // Product Edit / Create Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Form Fields for Modal
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('baby-kids');
  const [formPrice, setFormPrice] = useState<number>(250);
  const [formPackSize, setFormPackSize] = useState('250g');
  const [formWeightGrams, setFormWeightGrams] = useState<number>(250);
  const [formAvailability, setFormAvailability] = useState<ProductAvailability>('available');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formShelfLife, setFormShelfLife] = useState('6 months');
  const [formStorage, setFormStorage] = useState('Store in an airtight container in a cool, dry place.');
  const [formPrimaryImage, setFormPrimaryImage] = useState('');
  const [formPackagingImage, setFormPackagingImage] = useState('');

  // Multi-select state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Kitchen batch count calculation (orders needing made-to-order prep)
  const pendingKitchenBatchCount = useMemo(() => {
    return orders.filter((o) => {
      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
      return u === 'Confirmed' || u === 'Processing';
    }).length;
  }, [orders]);

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

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const handleNavigateToOrderFromReview = useCallback((orderId: string) => {
    handleTabChange('orders');
    setActiveDateTab('all');
    setSearchTerm(orderId);
  }, []);

  // Bootstrap the server-side console session on mount.
  useEffect(() => {
      if (hasBootstrappedAdminSession.current) return;
      hasBootstrappedAdminSession.current = true;

    if (typeof window !== 'undefined') {
      fetchOrders(false, false);
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pin.trim();
    if (!clean) return;
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid console passcode.');
        return;
      }
      setPin('');
      await fetchOrders();
    } catch {
      setAuthError('Connection error to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async (showError = true, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (showError) setAuthError(data.error || 'Invalid console session.');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
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
        fetchProducts();
      }
    } catch (err) {
      console.error('Fetch admin orders error:', err);
      if (showError) setAuthError('Connection error to server. Please try again.');
    } finally {
      setIsCheckingAuth(false);
      if (showLoading) setIsLoading(false);
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

  const handleResetTestData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to erase all test data?\n\nThis will completely wipe:\n- All customer orders & dispatch consignments\n- All patron accounts & saved addresses\n- All contact inquiries & messages\n- All test reviews\n\nYour 13 artisanal product creations will remain intact.'
    );
    if (!confirmed) return;

    setIsResettingData(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders([]);
        setEditStates({});
        setSelectedOrderIds([]);
        setInquiries([]);
        try {
          localStorage.removeItem('good_fills_orders');
          localStorage.removeItem('gf_patron_auth');
          localStorage.removeItem('gf_cart');
          localStorage.removeItem('gf_helpful_reviews');
        } catch {}
        showToast('All test orders, customers, and inquiries erased!', 'success');
      } else {
        throw new Error(data.error || 'Failed to erase data');
      }
    } catch (err: any) {
      showToast(err.message || 'Error erasing test data', 'error');
    } finally {
      setIsResettingData(false);
    }
  };

  // Products Management Methods
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch(`/api/admin/products?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleToggleAvailability = async (productId: string, newAvailability: ProductAvailability) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, availability: newAvailability } : p))
    );

    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          updates: { availability: newAvailability },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.product) {
          setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
        }
        showToast(`Stock updated: ${newAvailability}`, 'success');
      } else {
        throw new Error(data.error || 'Failed to update stock');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating stock', 'error');
      fetchProducts();
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    const target = products.find((p) => p.id === productId);
    const prodName = target?.name || 'Creation';
    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, featured: nextFeatured } : p
    );
    setProducts(updatedProducts);

    try {
      const res = await fetch('/api/admin/products/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          updates: { featured: nextFeatured },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.product) {
          setProducts((prev) => prev.map((p) => (p.id === productId ? data.product : p)));
        }
        const count = updatedProducts.filter((p) => p.featured).length;
        if (nextFeatured) {
          showToast(`★ "${prodName}" pinned to Homepage! (${count} creations now featured)`, 'success');
        } else {
          showToast(`"${prodName}" unpinned from Homepage (${count} remaining)`, 'info');
        }
      } else {
        throw new Error(data.error || 'Failed to update featured state');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating featured state', 'error');
      fetchProducts();
    }
  };

  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setFormName('');
    setFormCategory('baby-kids');
    setFormPrice(250);
    setFormPackSize('250g');
    setFormWeightGrams(250);
    setFormAvailability('available');
    setFormFeatured(false);
    setFormShortDescription('');
    setFormDescription('');
    setFormIngredients('');
    setFormShelfLife('6 months');
    setFormStorage('Store in an airtight container in a cool, dry place. Keep away from moisture.');
    setFormPrimaryImage('');
    setFormPackagingImage('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormPackSize(prod.packSize || '250g');
    setFormWeightGrams(prod.productWeightGrams || 250);
    setFormAvailability(prod.availability || 'available');
    setFormFeatured(Boolean(prod.featured));
    setFormShortDescription(prod.shortDescription || '');
    setFormDescription(prod.description || '');
    setFormIngredients(Array.isArray(prod.ingredients) ? prod.ingredients.join(', ') : '');
    setFormShelfLife(prod.shelfLife || '6 months');
    setFormStorage(prod.storageInstructions || 'Store in an airtight container in a cool, dry place.');
    setFormPrimaryImage(prod.images?.primary || '');
    setFormPackagingImage(prod.images?.packaging || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (formPrice < 0 || isNaN(formPrice)) {
      showToast('Price must be a valid non-negative number', 'error');
      return;
    }
    if (formWeightGrams <= 0 || isNaN(formWeightGrams)) {
      showToast('Gross weight in grams is required for shipping calculations', 'error');
      return;
    }

    setIsSavingProduct(true);
    const ingredientsList = formIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingProductId) {
        const updates: Partial<Product> = {
          name: formName.trim(),
          category: formCategory,
          price: Number(formPrice),
          packSize: formPackSize.trim() || '250g',
          productWeightGrams: Number(formWeightGrams),
          availability: formAvailability,
          featured: formFeatured,
          shortDescription: formShortDescription.trim(),
          description: formDescription.trim(),
          ingredients: ingredientsList,
          ingredientsVerified: ingredientsList.length > 0,
          shelfLife: formShelfLife.trim() || '6 months',
          storageInstructions: formStorage.trim(),
        };

        if (formPrimaryImage.trim() || formPackagingImage.trim()) {
          updates.images = {
            primary: formPrimaryImage.trim() || '/logo.png',
            packaging: formPackagingImage.trim() || undefined,
          };
        }

        const res = await fetch('/api/admin/products/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingProductId,
            updates,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`Updated "${formName.trim()}" successfully!`, 'success');
          setIsProductModalOpen(false);
          if (data.product) {
            setProducts((prev) =>
              prev.map((p) => (p.id === editingProductId ? data.product : p))
            );
          }
          fetchProducts();
        } else {
          throw new Error(data.error || 'Failed to update product');
        }
      } else {
        const payload: any = {
          name: formName.trim(),
          category: formCategory,
          price: Number(formPrice),
          packSize: formPackSize.trim() || '250g',
          productWeightGrams: Number(formWeightGrams),
          availability: formAvailability,
          featured: formFeatured,
          shortDescription: formShortDescription.trim(),
          description: formDescription.trim(),
          ingredients: ingredientsList,
          ingredientsVerified: ingredientsList.length > 0,
          shelfLife: formShelfLife.trim() || '6 months',
          storageInstructions: formStorage.trim(),
          images: {
            primary: formPrimaryImage.trim() || '/logo.png',
            packaging: formPackagingImage.trim() || undefined,
          },
        };

        const res = await fetch('/api/admin/products/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`Created creation "${formName.trim()}"!`, 'success');
          setIsProductModalOpen(false);
          if (data.product) {
            setProducts((prev) => [data.product, ...prev]);
          }
          fetchProducts();
        } else {
          throw new Error(data.error || 'Failed to create product');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving product', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      const res = await fetch('/api/admin/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productToDelete.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Removed "${productToDelete.name}" from catalog`, 'success');
        const deletedId = productToDelete.id;
        setProducts((prev) => prev.filter((p) => p.id !== deletedId));
        setProductToDelete(null);
        fetchProducts();
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting product', 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const getDtdcTierLabel = (grams: number) => {
    if (grams <= 500) return '0–500g (₹100)';
    if (grams <= 1000) return '501g–1kg (₹200)';
    if (grams <= 2000) return '1.01–2kg (₹400)';
    if (grams <= 3000) return '2.01–3kg (₹600)';
    const extraKg = Math.ceil((grams - 3000) / 1000);
    return `>3kg (₹${600 + extraKg * 200})`;
  };

  const getAvailabilityClass = (avail: ProductAvailability) => {
    switch (avail) {
      case 'available':
        return styles.availAvailable;
      case 'sold-out':
        return styles.availSoldOut;
      case 'temporarily-unavailable':
        return styles.availTempUnavailable;
      case 'coming-soon':
        return styles.availComingSoon;
      default:
        return '';
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productFeaturedFilter === 'featured' && !p.featured) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q) || (p.shortDescription || '').toLowerCase().includes(q);
        const matchIng = (p.ingredients || []).some((ing) => ing.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchIng) return false;
      }
      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) {
        return false;
      }
      if (productAvailabilityFilter !== 'all') {
        const pAvail = p.availability || ((p as any).isAvailable === false ? 'sold-out' : 'available');
        if (pAvail !== productAvailabilityFilter) return false;
      }
      return true;
    });
  }, [products, productSearch, productCategoryFilter, productAvailabilityFilter, productFeaturedFilter]);

  const filteredInquiries = useMemo(() => {
    if (inquiryFilter === 'all') return inquiries;
    return inquiries.filter((inquiry) => inquiry.status === inquiryFilter);
  }, [inquiries, inquiryFilter]);

  const handleLogout = () => {
    void fetch('/api/admin/auth/logout', { method: 'POST' }).finally(() => {
      setIsAuthenticated(false);
      setPin('');
    });
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
        newOrderStatus = 'Ready to Ship';
        newShipmentStatus = 'Not Shipped';
        break;
      case 'Shipped':
        newOrderStatus = 'Shipped';
        newShipmentStatus = 'Handed Over';
        break;
      case 'Out for Delivery':
        newOrderStatus = 'Shipped';
        newShipmentStatus = 'Out for Delivery';
        break;
      case 'Delivered':
        newOrderStatus = 'Completed';
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

    showToast(`Order #${orderId} marked as ${getUnifiedStatusLabel(newOrderStatus, newShipmentStatus, 'Paid')}`, 'success');

    // Call backend
    try {
      const res = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        fetchOrders();
      }
    } catch {
      showToast('Network error while saving order status.', 'error');
      fetchOrders();
    }
  };

  // Inline AWB save on button click, blur, or Enter
  const handleAwbSave = async (orderId: string, awbValue: string) => {
    const trimmed = (awbValue || '').trim();
    const existing = orders.find((o) => o.id === orderId);
    if (existing && getUnifiedStatus(existing.orderStatus, existing.shipmentStatus, existing.paymentStatus) === 'Failed') {
      return;
    }
    if (existing?.trackingNumber === trimmed && trimmed.length > 0) {
      setEditStates((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], justSaved: true },
      }));
      showToast(`Consignment for #${orderId} verified & up to date`, 'info');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: current.orderStatus,
          shipmentStatus: current.shipmentStatus,
          trackingNumber: trimmed,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o)));
        setEditStates((prev) => ({
          ...prev,
          [orderId]: { ...prev[orderId], isSaving: false, justSaved: true },
        }));
        showToast(`AWB tracking saved for #${orderId}`, 'success');
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

  // WhatsApp concierge generator
  const getWhatsAppLink = (order: Order) => {
    const rawPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const firstName = order.customerName ? order.customerName.split(' ')[0] : 'Customer';
    const status = getUnifiedStatus(order.orderStatus, order.shipmentStatus, order.paymentStatus);

    let message = `Hello ${firstName}! `;
    if (status === 'Confirmed') {
      message += `Your Good Fills freshly milled order #${order.id} is confirmed. Our kitchen is roasting and milling your ingredients fresh! Track live: https://goodfills.in/track-order?id=${order.id}`;
    } else if (status === 'Processing') {
      message += `Your Good Fills order #${order.id} has been freshly milled, sealed warm, and packed for dispatch! Track live: https://goodfills.in/track-order?id=${order.id}`;
    } else if (status === 'Shipped') {
      message += `Your Good Fills order #${order.id} has been dispatched via DTDC Express${order.trackingNumber ? ` (AWB: ${order.trackingNumber})` : ''}. Track live here: https://goodfills.in/track-order?id=${order.id}`;
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
        const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
        if (statusFilter === 'Shipped') {
          if (u !== 'Shipped' && u !== 'In Transit' && u !== 'Out for Delivery') return false;
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
    // CRITICAL: Analytics revenue, AOV, and sales metrics strictly require PAID status
    const paidSubset = dateFilteredOrders.filter((o) => o.paymentStatus === 'Paid');
    const totalRevenue = paidSubset.reduce((sum, o) => sum + (o.total || 0), 0);
    const subtotalRevenue = paidSubset.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const shippingRevenue = paidSubset.reduce((sum, o) => sum + (o.shippingCost || 0), 0);
    const aov = paidSubset.length > 0 ? Math.round(totalRevenue / paidSubset.length) : 0;

    let totalWeightGrams = 0;
    let totalPacksSold = 0;
    const productCounts: Record<string, { id: string; name: string; packSize: string; quantity: number; revenue: number; price: number; image?: string }> = {};

    paidSubset.forEach((o) => {
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

    const confirmedCount = paidSubset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Confirmed').length;
    const processingCount = paidSubset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Processing').length;
    const shippedCount = paidSubset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Shipped' || 'In Transit' || getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Out for Delivery').length;
    const deliveredCount = paidSubset.filter((o) => getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus) === 'Delivered').length;

    const shippedTotal = paidSubset.filter((o) => o.orderStatus === 'Shipped' || o.orderStatus === 'Completed').length;
    const assignedAwbCount = paidSubset.filter((o) => o.trackingNumber && o.trackingNumber.trim().length > 0).length;
    const awbRate = shippedTotal > 0 ? Math.round((assignedAwbCount / shippedTotal) * 100) : 100;

    // Top products array sorted by quantity
    const topProducts = Object.values(productCounts).sort((a, b) => b.quantity - a.quantity);

    // If top products has fewer than 4, fill in catalog products
    if (topProducts.length < 4) {
      const catalogSource = products.length > 0 ? products : PRODUCTS;
      catalogSource.forEach((p) => {
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
      .slice(0, 3);

    return {
      totalRevenue,
      subtotalRevenue,
      shippingRevenue,
      aov,
      orderCount: paidSubset.length,
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

    // Compute actual orders & dispatches for each month (Strictly Paid Orders)
    const counts: Record<number, { orders: number; dispatched: number }> = {};
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const m = d.getMonth();
      if (!counts[m]) counts[m] = { orders: 0, dispatched: 0 };
      counts[m].orders += 1;
      const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
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
      'AWB / Tracking Number',
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
      getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus, o.paymentStatus),
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
  if (isCheckingAuth) {
    return (
     <main className={styles.adminContainer}>
        <div className={styles.adminTopBarMobile}>
          <div className={styles.brandWrap}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="Good Fills" style={{ height: '42px', width: 'auto', display: 'block' }} />
            </Link>
            <span className={styles.badgeAdmin}>Dispatch Cockpit</span>
          </div>
          <Link href="/" className={styles.viewStoreBtn}>
            <span>Back to Store</span>
            <ArrowRight size={13} />
          </Link>
        </div>
          <div className={styles.consoleAuthBufferCenter} aria-hidden="true">
            <div className={styles.consoleAuthBufferSpinner} />
          </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.adminContainer}>
        <div className={styles.adminTopBarMobile}>
          <div className={styles.brandWrap}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="Good Fills" style={{ height: '42px', width: 'auto', display: 'block' }} />
            </Link>
            <span className={styles.badgeAdmin}>Dispatch Cockpit</span>
          </div>
          <Link href="/" className={styles.viewStoreBtn}>
            <span>Back to Store</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className={styles.loginCenterCanvas}>
          <div className={styles.loginWrapper}>
            <div className={styles.loginCardAccentLine} />
            <div className={styles.loginLogoWrap}>
              <img
                src="/logo.png"
                alt="Good Fills Homemade Products"
                className={styles.loginBrandLogo}
              />
            </div>
            <h2 className={styles.loginTitle}>Dispatch Sign In</h2>
            <p className={styles.loginSubtitle}>
              Sign in to access the operations console, order fulfillment,<br></br>and dispatch tools.
            </p>

            <form onSubmit={handleUnlock}>
              <div className={styles.pinInputWrap}>
              <label className={styles.formLabel}>Access Code</label>
                <input
                  type="password"
                  className={styles.pinInput}
                  placeholder="••••••••"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPin(val);
                  }}
                  autoFocus
                />
              </div>

              {authError && (
                <div className={styles.loginErrorAlert}>
                  <AlertCircle size={14} />
                  <span>{authError}</span>
                </div>
              )}

              <button type="submit" className={styles.unlockBtn} disabled={isLoading}>
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--border-hairline)', textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--accent-terracotta)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Encrypted Session + Good Fills Atelier Operations
              </div>
            </div>
          </div>
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
              <img src="/logo.png" alt="Good Fills" style={{ height: '42px', width: 'auto' }} />
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
              onClick={() => handleTabChange('dashboard')}
            >
              <Grid size={18} />
              <span>Dashboard</span>
              {activeSidebarTab === 'dashboard' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'orders' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <ListOrdered size={18} />
              <span>Orders</span>
              <span className={styles.navCountBadge}>{orders.length}</span>
              {activeSidebarTab === 'orders' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'kitchen' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('kitchen')}
              title="Daily kitchen cooking, roasting, and milling planner"
            >
              <Flame size={18} />
              <span>Kitchen Prep</span>
              {pendingKitchenBatchCount > 0 && (
                <span className={styles.navCountBadge} style={{ backgroundColor: 'var(--accent-terracotta)', color: '#FFFFFF' }}>
                  {pendingKitchenBatchCount}
                </span>
              )}
              {activeSidebarTab === 'kitchen' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'products' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <ShoppingBag size={18} />
              <span>Products</span>
              <span className={styles.navCountBadge}>{products.length}</span>
              {activeSidebarTab === 'products' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'reviews' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('reviews')}
              title="Customer feedback, ratings, and testimonial moderation"
            >
              <Star size={18} />
              <span>Reviews</span>
              {activeSidebarTab === 'reviews' && <div className={styles.activePillMarker} />}
            </button>

            <button
              type="button"
              className={`${styles.navItem} ${activeSidebarTab === 'inquiries' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('inquiries')}
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
              <span>Open the Store</span>
            </Link>
            <button onClick={handleLogout} className={styles.footerLinkBtn}>
              <LogOut size={15} />
              <span>Lock Console</span>
            </button>
            {/* <button
              type="button"
              onClick={handleResetTestData}
              disabled={isResettingData}
              className={styles.footerLinkBtn}
              style={{ color: '#DC2626', marginTop: '6px' }}
              title="Wipe test orders, customers, and inquiries for a clean slate"
            >
              <Trash2 size={15} />
              <span>{isResettingData ? 'Erasing...' : 'Reset Test Data'}</span>
            </button>*/}
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
            onClick={() => handleTabChange('dashboard')}
          >
            <Grid size={14} />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'orders' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <ListOrdered size={14} />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'kitchen' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => handleTabChange('kitchen')}
          >
            <Flame size={14} />
            <span>Kitchen ({pendingKitchenBatchCount})</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'products' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => handleTabChange('products')}
          >
            <ShoppingBag size={14} />
            <span>Products ({products.length})</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'reviews' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            <Star size={14} />
            <span>Reviews</span>
          </button>
          <button
            type="button"
            className={`${styles.mobileTabBtn} ${activeSidebarTab === 'inquiries' ? styles.mobileTabBtnActive : ''}`}
            onClick={() => handleTabChange('inquiries')}
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
                <h1 className={styles.overviewTitle}>Dashboard Overview</h1>
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
                  handleTabChange('orders');
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
                  handleTabChange('orders');
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
                  handleTabChange('orders');
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
                  handleTabChange('orders');
                  setActiveDateTab('all');
                }}
                role="button"
                tabIndex={0}
              >
                <div className={`${styles.statIconBadge} ${styles.badgeBlue}`}>
                  <Truck size={20} color="#2980B9" />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statTitleRef}>In Transit</span>
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
                      <span>Dispatched</span>
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
                    onClick={() => handleTabChange('orders')}
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
                      const firstItem = o.items?.[0]?.product.name || 'Freshly Milled Creation';
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
                  onClick={() => handleTabChange('orders')}
                  className={styles.viewAllOrdersBlockBtn}
                >
                  <span>Go to Orders Section ({orders.length})</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* BOTTOM ROW: ACTIVE DISPATCH QUEUE (LEFT) & FULFILLMENT STATUS (RIGHT) */}
            <div className={styles.productsAndDonutRow}>
              {/* Left: Active Dispatch Queue (STRICTLY PAID ORDERS ONLY) */}
              <div className={styles.topCreationsPanel}>
                <div className={styles.panelHeaderRow}>
                  <div className={styles.chartTitle}>Dispatch Queue</div>
                  <span className={styles.panelBadgeSmall}>
                    {orders.filter((o) => {
                      const status = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
                      return o.paymentStatus === 'Paid' && ['Confirmed', 'Processing', 'Shipped'].includes(status);
                    }).length} In Progress
                  </span>
                </div>

                <div className={styles.tableResponsiveWrapSimple}>
                  <table className={styles.simpleTable}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Shipping Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter((o) => {
                        const status = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
                        return o.paymentStatus === 'Paid' && ['Confirmed', 'Processing', 'Shipped'].includes(status);
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF', fontSize: '0.82rem' }}>
                            No in-progress orders in the queue. All orders are fulfilled or pending placement.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter((o) => {
                            const status = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
                            return o.paymentStatus === 'Paid' && ['Confirmed', 'Processing', 'Shipped'].includes(status);
                          })
                          .map((o) => {
                            const u = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
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
                                    {getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus, o.paymentStatus)}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45 }}>
                                    <div>
                                      {o.shippingAddress?.addressLine1}
                                      {o.shippingAddress?.addressLine2 && `, ${o.shippingAddress.addressLine2}`}
                                    </div>
                                    <div>
                                      {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}
                                    </div>
                                    <div>{o.shippingAddress?.country}</div>
                                  </div>
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
                  {orders.length} total orders recorded • Pan-India Courier Dispatch
                </p>
              </div>

              <div className={styles.manifestHeaderActions}>
                <button type="button" onClick={exportManifestCSV} className={styles.exportBtn}>
                  <Download size={15} />
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
                    <option value="Shipped">In Transit</option>
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
                        <th style={{ minWidth: '125px' }}>Amount</th>
                        <th>Order Status</th>
                        <th style={{ minWidth: '140px' }}>Consignment / AWB</th>
                        <th style={{ textAlign: 'left' }}>Actions</th>
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
                        const uStatus = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
                        const relativeAge = getRelativeDateLabel(o.createdAt);
                        const isSelected = selectedOrderIds.includes(o.id);

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
                                <div className={styles.tablePaymentMetaRow}>
                                  <span className={styles.paymentMethodBadge}>
                                    {o.paymentMethod || 'UPI'}
                                  </span>
                                  {o.paymentStatus === 'Paid' ? (
                                    <span className={styles.paymentBadgePaid}>
                                      <span>Paid</span>
                                    </span>
                                  ) : (
                                    <span className={styles.paymentBadgeUnpaid}>
                                      <span>Unpaid</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                                <div className={styles.statusPopoverContainer}>
                                  <span className={`${styles.statusInteractivePill} ${
                                      uStatus === 'Delivered'
                                        ? styles.pillDelivered
                                        : uStatus === 'Shipped' || uStatus === 'Out for Delivery'
                                        ? styles.pillShipped
                                        : uStatus === 'Processing'
                                        ? styles.pillProcessing
                                        : uStatus === 'In Transit'
                                        ? styles.pillInTransit
                                        : uStatus === 'Cancelled'
                                        ? styles.pillCancelled
                                        : uStatus === 'Failed'
                                        ? styles.pillFailed
                                        : uStatus === 'Pending'
                                        ? styles.pillPending
                                        : styles.pillConfirmed
                                    }`}>
                                  <span>{getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus, o.paymentStatus)}</span>
                                  </span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.tableAwbWrap}>
                                <input
                                  type="text"
                                  className={`${styles.tableAwbInput} ${edit.justSaved ? styles.awbSavedPulse : ''}`}
                                  placeholder="e.g. D12345678"
                                  value={edit.trackingNumber}
                                  disabled={uStatus === 'Failed'}
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
                                  disabled={edit.isSaving || uStatus === 'Failed'}
                                  className={`${styles.awbSaveBtn} ${edit.justSaved ? styles.awbSaveBtnSaved : ''}`}
                                  title="Save Consignment Number"
                                >
                                  {edit.justSaved ? (
                                    <>
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

                            <td style={{ textAlign: 'left' }}>
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
                                  href={`/track-order?id=${o.id}`}
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
                    const uStatus = getUnifiedStatus(o.orderStatus, o.shipmentStatus, o.paymentStatus);
                    const relativeAge = getRelativeDateLabel(o.createdAt);
                    const isSelected = selectedOrderIds.includes(o.id);

                    const statusOrder: UnifiedStatus[] = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];
                    const currentStageIndex = statusOrder.indexOf(
                              uStatus === 'In Transit' || uStatus === 'Out for Delivery' ? 'Shipped' : uStatus
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
                                : uStatus === 'In Transit'
                                ? styles.pillInTransitSmall
                                : uStatus === 'Cancelled'
                                ? styles.pillCancelledSmall
                                : uStatus === 'Failed'
                                ? styles.pillFailedSmall
                                : uStatus === 'Pending'
                                ? styles.pillPendingSmall
                                : styles.pillConfirmedSmall
                            }
                          >
                            {getUnifiedStatusLabel(o.orderStatus, o.shipmentStatus, o.paymentStatus)}
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

                            <div className={styles.mobileAdvanceSection}>
                              {uStatus === 'Pending' ? (
                              <div className={styles.unpaidAlertBadgeMobile}>
                                <span>Awaiting Payment — Do Not Pack</span>
                              </div>
                            ) : uStatus === 'Cancelled' ? (
                              <div className={styles.cancelledBadgeMobile}>
                                <span>Order Cancelled / Failed</span>
                              </div>
                            ) : (
                              <div className={styles.fulfilledCompleteBadgeMobile}>
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
                                  placeholder="Consignment / AWB No."
                                  value={edit.trackingNumber}
                                  disabled={uStatus === 'Failed'}
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
                                disabled={edit.isSaving || uStatus === 'Failed'}
                                className={`${styles.mobileAwbSaveBtn} ${edit.justSaved ? styles.awbSaveBtnSaved : ''}`}
                                title="Save Consignment"
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
                                href={`/track-order?id=${o.id}`}
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
            TAB KITCHEN: BATCH PREP MANIFEST & MILLING PLANNER
            ==================================================================== */}
        {activeSidebarTab === 'kitchen' && (
          <AdminKitchenManifestView
            orders={orders}
            allProducts={products.length > 0 ? products : PRODUCTS}
            onQuickAdvance={handleQuickAdvance}
            showToast={showToast}
          />
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

              <div className={styles.inquiryHeaderActions}>
                <button
                  type="button"
                  onClick={fetchInquiries}
                  className={styles.exportBtn}
                  title="Reload inquiries"
                >
                  <RefreshCw size={14} className={isLoadingInquiries ? styles.spin : ''} />
                  <span>{isLoadingInquiries ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open('/contact-us', '_blank', 'noopener,noreferrer')}
                  className={styles.addCreationBtn}
                >
                  <ExternalLink size={14} />
                  <span>Contact Page</span>
                </button>
              </div>
            </div>

            <div className={styles.inquirySummaryGrid}>
              <button
                type="button"
                className={`${styles.inquirySummaryCard} ${inquiryFilter === 'all' ? styles.inquirySummaryCardActive : ''}`}
                onClick={() => setInquiryFilter('all')}
              >
                <span className={styles.inquirySummaryLabel}>All messages</span>
                <strong>{inquiries.length}</strong>
              </button>
              <button
                type="button"
                className={`${styles.inquirySummaryCard} ${inquiryFilter === 'new' ? styles.inquirySummaryCardActive : ''}`}
                onClick={() => setInquiryFilter('new')}
              >
                <span className={styles.inquirySummaryLabel}>Needs reply</span>
                <strong>{inquiries.filter((inquiry) => inquiry.status === 'new').length}</strong>
              </button>
              <button
                type="button"
                className={`${styles.inquirySummaryCard} ${inquiryFilter === 'replied' ? styles.inquirySummaryCardActive : ''}`}
                onClick={() => setInquiryFilter('replied')}
              >
                <span className={styles.inquirySummaryLabel}>Replied</span>
                <strong>{inquiries.filter((inquiry) => inquiry.status === 'replied').length}</strong>
              </button>
            </div>

            {isLoadingInquiries && inquiries.length === 0 ? (
              <div className={styles.inquiryEmptyState}>
                <RefreshCw size={24} className={styles.spinningIcon} />
                <h3>Loading inquiries</h3>
                <p>Syncing messages from the Atelier desk.</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className={styles.inquiryEmptyState}>
                <MessageCircle size={28} />
                <h3>{inquiries.length === 0 ? 'No inquiries recorded yet' : 'No messages in this view'}</h3>
                <p>
                  {inquiries.length === 0
                    ? 'Customer messages submitted from the Contact page will appear here.'
                    : 'Try another status filter to see more messages.'}
                </p>
              </div>
            ) : (
              <div className={styles.inquiriesListGrid}>
                {filteredInquiries.map((inq) => {
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
                    <article
                      key={inq.id}
                      className={`${styles.inquiryCard} ${inq.status === 'new' ? styles.inquiryCardNew : ''}`}
                    >
                      <div className={styles.inquiryHeader}>
                        <div className={styles.inquiryIdentity}>
                          <strong className={styles.inquiryName}>{inq.name}</strong>
                          <div className={styles.inquiryContact}>
                            {inq.phone}
                            {inq.email && `, ${inq.email}`}
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
                            {inq.status === 'replied' ? 'Replied' : 'Not Replied'}
                          </span>
                          <span className={styles.inquiryBadge}>{inq.category}</span>
                        </div>
                      </div>

                      {inq.orderId && (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              handleTabChange('orders');
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

                      <div className={styles.inquiryMessageBlock}>
                        <span className={styles.inquiryMessageLabel}>Message</span>
                        <p className={styles.inquiryBody}>&ldquo;{inq.message}&rdquo;</p>
                      </div>

                      <div className={styles.inquiryFooter}>
                        <span className={styles.inquiryTime}>{timeFormatted}</span>
                        <div className={styles.inquiryActionGroup}>
                          <button
                            type="button"
                            onClick={() => handleToggleInquiryStatus(inq.id, inq.status)}
                            className={styles.inquiryToggleBtn}
                            title="Toggle status"
                          >
                            {inq.status === 'replied' ? 'Mark Pending' : 'Mark Solved'}
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnWhatsApp}
                          >
                            <MessageCircle size={13} color="currentColor" />
                            <span>Reply via WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB C: PRODUCT & CREATION MANAGEMENT CONSOLE
            ==================================================================== */}
        {activeSidebarTab === 'products' && (
          <div className={styles.creationsContainer}>
            {/* Products Header */}
            <header className={styles.manifestHeaderStrip}>
              <div>
                <h1 className={styles.overviewTitle}>Products &amp; Creations</h1>
                <p className={styles.overviewDateText}>
                  {products.length} creations in catalog • Manage storefront availability and featured products
                </p>
              </div>

              <div className={styles.manifestHeaderActions}>
                <button
                  type="button"
                  onClick={() => fetchProducts()}
                  disabled={isLoadingProducts}
                  className={styles.refreshCreationBtn}
                  title="Force refresh catalog from server"
                >
                  <RefreshCw size={13} className={isLoadingProducts ? styles.spinningIcon : ''} />
                  <span>{isLoadingProducts ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateProduct}
                  className={styles.addCreationBtn}
                >
                  <Plus size={15} />
                  <span>Add Creation</span>
                </button>
              </div>
            </header>

            {/* Top Stats Strip */}
            <div className={styles.creationsStatsRow}>
              <div className={styles.creationStatCard}>
                <div className={styles.creationStatIcon}>
                  <Package size={22} />
                </div>
                <div>
                  <div className={styles.creationStatVal}>{products.length}</div>
                  <div className={styles.creationStatLabel}>Total Creations</div>
                </div>
              </div>

              <div className={styles.creationStatCard}>
                <div className={styles.creationStatIcon} style={{ color: '#059669', backgroundColor: '#ECFDF5' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className={styles.creationStatVal}>
                    {products.filter((p) => (p.availability || 'available') === 'available').length}
                  </div>
                  <div className={styles.creationStatLabel}>Live & Available</div>
                </div>
              </div>

              <div className={styles.creationStatCard}>
                <div className={styles.creationStatIcon} style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}>
                  <AlertCircle size={22} />
                </div>
                <div>
                  <div className={styles.creationStatVal}>
                    {products.filter((p) => p.availability === 'sold-out' || p.availability === 'temporarily-unavailable').length}
                  </div>
                  <div className={styles.creationStatLabel}>Unavailable / Sold Out</div>
                </div>
              </div>

              <div
                className={`${styles.creationStatCard} ${styles.clickableStatCard} ${
                  productFeaturedFilter === 'featured' ? styles.creationStatCardActive : ''
                }`}
                onClick={() => setProductFeaturedFilter((prev) => (prev === 'featured' ? 'all' : 'featured'))}
                title="Click to view only creations pinned to Homepage"
              >
                <div className={styles.creationStatIcon} style={{ color: '#D97706', backgroundColor: '#FFFBEB' }}>
                  <Star size={22} fill={productFeaturedFilter === 'featured' ? '#F59E0B' : 'none'} />
                </div>
                <div>
                  <div className={styles.creationStatVal}>
                    {products.filter((p) => p.featured).length}
                  </div>
                  <div className={styles.creationStatLabel}>
                    Featured on Home {productFeaturedFilter === 'featured' ? '● Active' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className={styles.creationsToolbar}>
              <div className={styles.creationsFilters}>
                <div className={styles.creationSearchWrap}>
                  <Search size={15} className={styles.creationSearchIcon} />
                  <input
                    type="text"
                    placeholder="Search creations or ingredients..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className={styles.creationSearchInput}
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value as any)}
                  className={styles.creationSelect}
                >
                  <option value="all">All Categories</option>
                  <option value="baby-kids">Baby & Kids</option>
                  <option value="nutrition-wellness">Nutrition & Wellness</option>
                  <option value="skin-bath">Skin & Bath</option>
                  <option value="pantry-beverages">Pantry & Beverages</option>
                </select>

                <select
                  value={productAvailabilityFilter}
                  onChange={(e) => setProductAvailabilityFilter(e.target.value as any)}
                  className={styles.creationSelect}
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="available">Available</option>
                  <option value="temporarily-unavailable">Temporarily Unavailable</option>
                  <option value="sold-out">Sold Out</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>

                <button
                  type="button"
                  onClick={() => setProductFeaturedFilter((prev) => (prev === 'featured' ? 'all' : 'featured'))}
                  className={`${styles.featuredFilterToggle} ${
                    productFeaturedFilter === 'featured' ? styles.featuredFilterToggleActive : ''
                  }`}
                  title={productFeaturedFilter === 'featured' ? 'Show all creations' : 'Show only creations pinned to Homepage'}
                >
                  <Star size={13} fill={productFeaturedFilter === 'featured' ? '#F59E0B' : 'none'} />
                  <span>Pinned to Home ({products.filter((p) => p.featured).length})</span>
                </button>
              </div>

            </div>

            {/* Loading / Empty States */}
            {isLoadingProducts && products.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
                <div className={styles.spinner} style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>Loading Good Fills creations catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280', background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
                <Package size={36} color="#9CA3AF" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No creations match your search or filter.</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>Try clearing your filters or add a new creation above.</p>
              </div>
            ) : (
              <div className={styles.creationsGrid}>
                {filteredProducts.map((p) => {
                  const currentAvail = (p.availability as ProductAvailability) || 'available';
                  const primaryImg = p.images?.primary || '/logo.png';
                  const dtdcLabel = getDtdcTierLabel(p.productWeightGrams || 250);

                  return (
                    <div key={p.id} className={`${styles.creationCard} ${p.featured ? styles.creationCardFeatured : ''}`}>
                      <div className={styles.creationCardHeader}>
                        <img
                          src={primaryImg}
                          alt={p.name}
                          className={styles.creationCardThumb}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                        <div className={styles.creationCardMainInfo}>
                          <div className={styles.creationCardCategory}>
                            {p.category.replace('-', ' ')}
                          </div>
                          <h3 className={styles.creationCardTitle} title={p.name}>
                            {p.name}
                          </h3>
                          <div className={styles.creationCardMeta}>
                            <span className={styles.creationCardPrice}>₹{p.price}</span>
                            <span className={styles.creationCardPack}>/ {p.packSize || '250g'}</span>
                          </div>
                        </div>

                        {/* Pinned Featured Toggle */}
                        <button
                          type="button"
                          className={`${styles.featuredStarBtn} ${p.featured ? styles.featuredStarActive : ''}`}
                          onClick={() => handleToggleFeatured(p.id, Boolean(p.featured))}
                          title={p.featured ? 'Pinned on Homepage (Click to unpin)' : 'Click to Pin on Homepage'}
                          aria-label={p.featured ? 'Unpin from homepage' : 'Pin to homepage'}
                        >
                          <Star size={19} fill={p.featured ? '#F59E0B' : 'none'} />
                        </button>
                      </div>

                      <div className={styles.creationCardBody}>
                        <p className={styles.creationDescText}>
                          {p.shortDescription || p.description || 'No description provided.'}
                        </p>

                        <div className={styles.creationBadgesRow}>
                          {p.featured && (
                            <span className={styles.pinnedBadge} title="Featured on Homepage Signature section">
                              <Star size={10} fill="#B45309" />
                              <span>PINNED TO HOME</span>
                            </span>
                          )}
                          <span className={styles.creationWeightBadge} title="Product weight used for Courier Tier">
                            <Scale size={11} />
                            <span>{p.productWeightGrams || 250}g • {dtdcLabel}</span>
                          </span>
                        </div>
                      </div>

                      <div className={styles.creationCardFooter}>
                        {/* 1-Click Availability Selector */}
                        <select
                          className={`${styles.availabilitySelect} ${getAvailabilityClass(currentAvail)}`}
                          value={currentAvail}
                          onChange={(e) => handleToggleAvailability(p.id, e.target.value as ProductAvailability)}
                        >
                          <option value="available">● Available</option>
                          <option value="temporarily-unavailable">◐ Temp. Unavailable</option>
                          <option value="sold-out">✕ Sold Out</option>
                          <option value="coming-soon">◌ Coming Soon</option>
                        </select>

                        <div className={styles.cardActionButtons}>
                          <button
                            type="button"
                            className={styles.cardIconBtn}
                            onClick={() => handleOpenEditProduct(p)}
                            title="Edit Creation Details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.cardIconBtn} ${styles.cardIconBtnDanger}`}
                            onClick={() => setProductToDelete(p)}
                            title="Delete Creation"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB REVIEWS: CUSTOMER REVIEWS & TESTIMONIALS MODERATION CONSOLE
            ==================================================================== */}
        {activeSidebarTab === 'reviews' && (
          <AdminReviewsModerationView
            showToast={showToast}
            onNavigateToOrder={handleNavigateToOrderFromReview}
          />
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
          MODALS: PRODUCT EDIT/CREATE & DELETE CONFIRMATION
          ==================================================================== */}
      {isProductModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.productModalBox}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingProductId ? 'Edit Artisanal Creation' : 'Add New Artisanal Creation'}
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsProductModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className={styles.modalScrollBody}>
                {/* Name & Category */}
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Creation Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Sprouted Ragi Malt"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                      className={styles.formSelect}
                    >
                      <option value="baby-kids">Baby & Kids</option>
                      <option value="nutrition-wellness">Nutrition & Wellness</option>
                      <option value="skin-bath">Skin & Bath</option>
                      <option value="pantry-beverages">Pantry & Beverages</option>
                    </select>
                  </div>
                </div>

                {/* Price, Pack Size & Weight */}
                <div className={styles.formGrid3}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Pack Size Label</label>
                    <input
                      type="text"
                      value={formPackSize}
                      onChange={(e) => setFormPackSize(e.target.value)}
                      placeholder="e.g. 250g, 500g"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Gross Weight (Grams) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formWeightGrams}
                      onChange={(e) => setFormWeightGrams(Number(e.target.value))}
                      className={styles.formInput}
                    />
                    <span className={styles.formHelper}>Critical: used for Courier Shipping Tariff</span>
                  </div>
                </div>

                {/* Stock Availability & Featured */}
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Live Stock Status</label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as ProductAvailability)}
                      className={styles.formSelect}
                    >
                      <option value="available">Available (In Stock)</option>
                      <option value="temporarily-unavailable">Temporarily Unavailable</option>
                      <option value="sold-out">Sold Out</option>
                      <option value="coming-soon">Coming Soon</option>
                    </select>
                  </div>

                  <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-terracotta)' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
                        Pin as Featured on Store Homepage
                      </span>
                    </label>
                  </div>
                </div>

                {/* Short & Detailed Description */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Short Tagline / Summary</label>
                  <input
                    type="text"
                    value={formShortDescription}
                    onChange={(e) => setFormShortDescription(e.target.value)}
                    placeholder="Brief 1-sentence description..."
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Artisanal preparation, process, and taste notes..."
                    className={styles.formTextarea}
                  />
                </div>

                {/* Ingredients & Shelf Life */}
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ingredients (Comma Separated)</label>
                    <input
                      type="text"
                      value={formIngredients}
                      onChange={(e) => setFormIngredients(e.target.value)}
                      placeholder="e.g. Sprouted Ragi, Cardamom, Almonds"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Shelf Life</label>
                    <input
                      type="text"
                      value={formShelfLife}
                      onChange={(e) => setFormShelfLife(e.target.value)}
                      placeholder="e.g. 6 months from milling"
                      className={styles.formInput}
                    />
                  </div>
                </div>

                {/* Storage Instructions */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Storage Instructions</label>
                  <input
                    type="text"
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    placeholder="e.g. Store in an airtight container in a cool, dry place."
                    className={styles.formInput}
                  />
                </div>

                {/* Images */}
                <div className={styles.formGrid2}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Primary Photo URL / Path</label>
                    <input
                      type="text"
                      value={formPrimaryImage}
                      onChange={(e) => setFormPrimaryImage(e.target.value)}
                      placeholder="e.g. /images/products/baby-cereal.png"
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Packaging / Back Photo URL</label>
                    <input
                      type="text"
                      value={formPackagingImage}
                      onChange={(e) => setFormPackagingImage(e.target.value)}
                      placeholder="e.g. /images/products/baby-cereal-pack.png"
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSavingProduct}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalSaveBtn}
                  disabled={isSavingProduct}
                >
                  {isSavingProduct ? (
                    <>
                      <div className={styles.spinner} style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                      <span>Saving Creation...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{editingProductId ? 'Update Creation' : 'Publish Creation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className={styles.modalBackdrop}>
          <div className={styles.productModalBox} style={{ maxWidth: '440px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ color: '#DC2626' }}>
                Delete Creation?
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setProductToDelete(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px 22px' }}>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#374151', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong>"{productToDelete.name}"</strong> ({productToDelete.id}) from the catalog?
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
                This creation will no longer appear on the live storefront or be available for checkout.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setProductToDelete(null)}
                disabled={isDeletingProduct}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeletingProduct}
                style={{
                  padding: '8px 20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isDeletingProduct ? 'Deleting...' : 'Delete Creation'}
              </button>
            </div>
          </div>
        </div>
      )}

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
