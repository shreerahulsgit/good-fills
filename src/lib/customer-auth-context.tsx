'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomerUser, Order } from '@/types';

interface CustomerAuthContextType {
  currentUser: CustomerUser | null;
  orders: Order[];
  isLoading: boolean;
  login: (user: CustomerUser, orders: Order[]) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: CustomerUser) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'goodfills_patron_phone';

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on client mount
  const restoreSession = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const savedPhone = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!savedPhone) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/account/profile?id=${encodeURIComponent(savedPhone.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setOrders(data.orders || []);
        // Ensure synchronized storage
        localStorage.setItem(AUTH_STORAGE_KEY, savedPhone.trim());
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setCurrentUser(null);
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to restore patron session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();

    // Listen for storage changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        restoreSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [restoreSession]);

  const login = useCallback((user: CustomerUser, userOrders: Order[]) => {
    setCurrentUser(user);
    setOrders(userOrders || []);
    const identifier = user.email || user.phone || user.id;
    if (identifier) {
      localStorage.setItem(AUTH_STORAGE_KEY, identifier);
      sessionStorage.setItem(AUTH_STORAGE_KEY, identifier);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setOrders([]);
  }, []);

  const updateUser = useCallback((updatedUser: CustomerUser) => {
    setCurrentUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const identifier = currentUser?.email || currentUser?.phone || currentUser?.id;
    if (!identifier) return;
    try {
      const res = await fetch(`/api/account/profile?id=${encodeURIComponent(identifier)}`);
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, [currentUser]);

  return (
    <CustomerAuthContext.Provider
      value={{
        currentUser,
        orders,
        isLoading,
        login,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
