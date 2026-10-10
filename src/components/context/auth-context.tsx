'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CustomerAuthContextType, CustomerUser, Order } from '@/types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const restoreInFlight = useRef<Promise<void> | null>(null);
  const restoredAuthUserId = useRef<string | null>(null);

  const restoreSession = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (restoreInFlight.current) return restoreInFlight.current;

    restoreInFlight.current = (async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          restoredAuthUserId.current = null;
          setCurrentUser(null);
          setOrders([]);
          return;
        }

        if (restoredAuthUserId.current === user.id) return;

        const res = await fetch(`/api/account/profile?id=${encodeURIComponent(user.id)}`);
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          restoredAuthUserId.current = user.id;
          setCurrentUser(data.user);
          setOrders(data.orders || []);
        } else {
          setCurrentUser(null);
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to restore patron session:', err);
      } finally {
        setIsLoading(false);
        restoreInFlight.current = null;
      }
    })();

    return restoreInFlight.current;
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        restoredAuthUserId.current = null;
        setCurrentUser(null);
        setOrders([]);
        setIsLoading(false);
        return;
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void restoreSession();
      }
    });
    return () => subscription.unsubscribe();
  }, [restoreSession]);

  const login = useCallback((user: CustomerUser, userOrders: Order[]) => {
    setCurrentUser(user);
    setOrders(userOrders || []);
  }, []);

  const logout = useCallback(async () => {
    await createSupabaseBrowserClient().auth.signOut();
    setCurrentUser(null);
    setOrders([]);
  }, []);

  const updateUser = useCallback((updatedUser: CustomerUser) => {
    setCurrentUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const identifier = currentUser?.id || currentUser?.email || currentUser?.phone;
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