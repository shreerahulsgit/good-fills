'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ShippingCalculation } from '@/types';
import { calculateDomesticShipping } from '@/lib/shipping';

export interface AddedToastData {
  product: Product;
  quantity: number;
  timestamp: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, options?: { openDrawer?: boolean }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  refreshProducts: () => Promise<boolean>;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalWeightGrams: number;
  subtotal: number;
  shipping: ShippingCalculation;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  lastAddedItem: AddedToastData | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'good_fills_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore cart on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading cart from storage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save cart changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error persisting cart', e);
      }
    }
  }, [items, isHydrated]);

  const [lastAddedItem, setLastAddedItem] = useState<AddedToastData | null>(null);

  const addItem = (product: Product, quantity = 1, options?: { openDrawer?: boolean }) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex((i) => i.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...currentItems];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...currentItems, { product, quantity }];
    });

    setLastAddedItem({
      product,
      quantity,
      timestamp: Date.now(),
    });

    // Only force open full drawer if caller explicitly requests it (e.g. from buy now / reorder)
    if (options?.openDrawer) {
      setIsCartOpen(true);
    }
  };

  const dismissToast = () => setLastAddedItem(null);

  const getItemQuantity = (productId: string): number => {
    const item = items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(current => 
      current.map(item => item.product.id === productId ? { ...item, quantity } : item)
    );
  };

  const removeItem = (productId: string) => {
    setItems(current => current.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const refreshProducts = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/products', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.products)) return false;

      const productsById = new Map<string, Product>(data.products.map((product: Product) => [product.id, product]));
      setItems((currentItems) => currentItems.flatMap((item) => {
        const currentProduct = productsById.get(item.product.id);
        return currentProduct ? [{ ...item, product: currentProduct }] : [];
      }));
      return true;
    } catch (error) {
      console.error('Error refreshing cart products:', error);
      return false;
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Weight calculation based ONLY on product weight
  const totalWeightGrams = items.reduce(
    (sum, item) => sum + (item.product.productWeightGrams * item.quantity), 
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );

  const shipping = calculateDomesticShipping(totalWeightGrams);
  const grandTotal = subtotal + shipping.shippingCost;

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshProducts,
        getItemQuantity,
        totalItems,
        totalWeightGrams,
        subtotal,
        shipping,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        lastAddedItem,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
