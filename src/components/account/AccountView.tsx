'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  LogOut,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Copy,
  Star,
  X,
  PenLine
} from 'lucide-react';
import { Order, ShippingAddress, Product } from '@/types';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { useCart } from '@/lib/cart-context';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword 
} from '@/lib/firebase-auth';
import styles from './AccountView.module.css';

export function AccountView() {
  const searchParams = useSearchParams();
  const { currentUser, orders, login, logout, updateUser, isLoading: isLoadingSession } = useCustomerAuth();
  const { addItem, openCart } = useCart();

  // Authentication state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(null);

  // 2-Way Authentication State (Google + Email/Password)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [resetSentMsg, setResetSentMsg] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'support'>('orders');

  // Profile editing
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Address management
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India',
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState<string | null>(null);

  // Rate & Review Product Modal State for Delivered Orders
  const [reviewedItems, setReviewedItems] = useState<Set<string>>(new Set());
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [reviewModalProduct, setReviewModalProduct] = useState<Product | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewChildAge, setReviewChildAge] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Load reviews for customer's delivered orders to show "Reviewed" badge
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const deliveredOrders = orders.filter(
      (o) => o.shipmentStatus === 'Delivered' || o.orderStatus === 'Delivered'
    );
    if (deliveredOrders.length === 0) return;

    Promise.all(
      deliveredOrders.map((o) =>
        fetch(`/api/reviews?orderId=${encodeURIComponent(o.id)}`)
          .then((res) => res.json())
          .catch(() => null)
      )
    ).then((results) => {
      const set = new Set<string>();
      results.forEach((res, idx) => {
        if (res && res.success && Array.isArray(res.reviews)) {
          res.reviews.forEach((r: any) => {
            const pId = (r.productId || '').toLowerCase();
            set.add(`${deliveredOrders[idx].id}_${pId}`);
          });
        }
      });
      setReviewedItems(set);
    });
  }, [orders]);

  const handleSubmitOrderReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalOrder || !reviewModalProduct) return;
    setReviewError(null);

    if (!reviewTitle.trim()) {
      setReviewError('Please provide a headline for your review.');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError('Please enter at least 5 characters of feedback.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: reviewModalOrder.id,
          productId: reviewModalProduct.id,
          productName: reviewModalProduct.name,
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
          authorName: currentUser?.name || reviewModalOrder.customerName || 'Verified Customer',
          location: reviewModalOrder.shippingAddress?.city
            ? `${reviewModalOrder.shippingAddress.city}, ${reviewModalOrder.shippingAddress.state || 'Karnataka'}`
            : 'Bengaluru, Karnataka',
          childAge: reviewChildAge.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      const cleanPId = reviewModalProduct.id.toLowerCase();
      setReviewedItems((prev) => new Set(prev).add(`${reviewModalOrder.id}_${cleanPId}`));
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOrder(null);
        setReviewModalProduct(null);
        setReviewSuccess(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewChildAge('');
        setReviewRating(5);
      }, 2000);
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Read tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'orders' || tabParam === 'profile' || tabParam === 'addresses' || tabParam === 'support') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync profile form inputs with authenticated user
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileEmail(currentUser.email || '');
      setProfilePhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // 1-Click Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();
      const fbUser = result.user;

      const res = await fetch('/api/account/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email,
          name: fbUser.displayName,
          photoUrl: fbUser.photoURL,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        login(data.user, data.orders || []);
      } else {
        setAuthError(data.error || 'Failed to authenticate customer with Google.');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setIsGoogleLoading(false);
        return;
      }
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError(
          'Google Provider is not enabled yet in your Firebase Console. In Firebase Console, go to Authentication → Sign-in method → Add Google → Enable.'
        );
        setIsGoogleLoading(false);
        return;
      }
      setAuthError(`Google Sign-In notice: ${err.message || 'Could not complete authentication.'}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email/Password Sign-In & Registration Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSentMsg(null);

    const email = emailInput.trim();
    const password = passwordInput;
    const name = nameInput.trim();

    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (authMode === 'register' && !name) {
      setAuthError('Please provide your name for account personalization.');
      return;
    }

    setIsEmailLoading(true);
    try {
      let fbUser;
      if (authMode === 'register') {
        const credential = await signUpWithEmail(email, password, name);
        fbUser = credential.user;
      } else {
        const credential = await signInWithEmail(email, password);
        fbUser = credential.user;
      }

      // Sync customer profile with server customer store
      const res = await fetch('/api/account/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email,
          name: authMode === 'register' ? name : (fbUser.displayName || 'Good Fills Customer'),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        login(data.user, data.orders || []);
      } else {
        setAuthError(data.error || 'Failed to authenticate account session.');
      }
    } catch (err: any) {
      console.error('Email authentication error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password. Please verify your credentials or register a new account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists. Please switch to Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password is too weak. Please use at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setAuthError(
          'Email/Password provider is not enabled yet in your Firebase Console. Go to Authentication → Sign-in method → Add Email/Password → Enable.'
        );
      } else {
        setAuthError(`Authentication notice: ${err.message || 'Could not complete login.'}`);
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      setAuthError('Please enter your email address in the field above to receive a password reset link.');
      return;
    }
    setAuthError(null);
    setResetSentMsg(null);
    try {
      await resetPassword(email);
      setResetSentMsg(`Password reset link sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setAuthError(`Password reset error: ${err.message || 'Could not send reset email.'}`);
    }
  };

  const handleSignOut = () => {
    logout();
    setActiveTab('orders');
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const res = await fetch('/api/account/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentUser.email || currentUser.phone,
          name: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        updateUser(data.user);
        setProfileSuccessMsg('Profile updated successfully.');
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        setProfileErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setProfileErrorMsg('Network error while saving profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Address Actions
  const handleOpenAddAddress = () => {
    setEditingAddressIndex(null);
    setAddressForm({
      fullName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      addressLine1: '',
      addressLine2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      country: 'India',
    });
    setShowAddressForm(true);
    setAddressFeedback(null);
  };

  const handleOpenEditAddress = (idx: number) => {
    if (!currentUser || !currentUser.addresses[idx]) return;
    const addr = currentUser.addresses[idx];
    setEditingAddressIndex(idx);
    setAddressForm({
      fullName: addr.fullName || currentUser.name,
      phone: addr.phone || currentUser.phone,
      email: addr.email || currentUser.email,
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || 'Bengaluru',
      state: addr.state || 'Karnataka',
      pincode: addr.pincode || '560038',
      country: addr.country || 'India',
    });
    setShowAddressForm(true);
    setAddressFeedback(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!addressForm.addressLine1.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      setAddressFeedback('Please complete street address, city, and pincode.');
      return;
    }

    setIsSavingAddress(true);
    setAddressFeedback(null);

    const action = editingAddressIndex !== null ? 'edit' : 'add';

    try {
      const res = await fetch('/api/account/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentUser.email || currentUser.phone,
          action,
          address: {
            ...addressForm,
            fullName: addressForm.fullName || currentUser.name,
            phone: addressForm.phone || currentUser.phone,
          },
          addressIndex: editingAddressIndex !== null ? editingAddressIndex : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        updateUser(data.user);
        setShowAddressForm(false);
        setEditingAddressIndex(null);
        setAddressFeedback('Address saved successfully.');
        setTimeout(() => setAddressFeedback(null), 3000);
      } else {
        setAddressFeedback(data.error || 'Failed to save address.');
      }
    } catch (err) {
      console.error('Address save error:', err);
      setAddressFeedback('Network error while saving address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (idx: number) => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to remove this delivery address?')) return;

    try {
      const res = await fetch('/api/account/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentUser.email || currentUser.phone,
          action: 'delete',
          addressIndex: idx,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        updateUser(data.user);
        setAddressFeedback('Address removed.');
        setTimeout(() => setAddressFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Address delete error:', err);
    }
  };

  const handleSetDefaultAddress = async (idx: number) => {
    if (!currentUser || idx === 0) return;

    try {
      const res = await fetch('/api/account/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentUser.email || currentUser.phone,
          action: 'setDefault',
          addressIndex: idx,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        updateUser(data.user);
        setAddressFeedback('Default delivery destination updated.');
        setTimeout(() => setAddressFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Set default address error:', err);
    }
  };

  // Status Badge mapping
  const getStatusBadge = (order: Order) => {
    const status = order.orderStatus;
    const shipment = order.shipmentStatus;

    if (status === 'Cancelled') {
      return <span className={`${styles.statusPill} ${styles.pillCancelled}`}>Cancelled</span>;
    }
    if (status === 'Delivered' || shipment === 'Delivered') {
      return <span className={`${styles.statusPill} ${styles.pillDelivered}`}>Delivered</span>;
    }
    if (shipment === 'Out for Delivery') {
      return <span className={`${styles.statusPill} ${styles.pillShipped}`}>Out for Delivery</span>;
    }
    if (shipment === 'In Transit' || shipment === 'Handed Over' || status === 'Shipped') {
      return <span className={`${styles.statusPill} ${styles.pillShipped}`}>In Transit</span>;
    }
    if (status === 'Processing' || status === 'Ready to Ship') {
      return <span className={`${styles.statusPill} ${styles.pillProcessing}`}>Prepared &amp; Packed</span>;
    }
    return <span className={`${styles.statusPill} ${styles.pillConfirmed}`}>Order Confirmed</span>;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'GF';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const handleCopyAwb = (awb: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(awb);
    setCopiedAwb(awb);
    setTimeout(() => setCopiedAwb(null), 2400);
  };

  const handleReorder = (order: Order) => {
    setReorderingOrderId(order.id);
    let itemsAdded = 0;
    order.items.forEach((item) => {
      if (item.product) {
        addItem(item.product, item.quantity);
        itemsAdded++;
      }
    });
    if (itemsAdded > 0) {
      openCart();
    }
    setTimeout(() => {
      setReorderingOrderId(null);
    }, 2200);
  };

  // Loading session check
  if (isLoadingSession) {
    return (
      <main className={styles.accountContainer}>
        <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <div>Loading your account...</div>
        </div>
      </main>
    );
  }

  // SCREEN 1: 2-WAY CUSTOMER SIGN IN (GOOGLE 1-CLICK + EMAIL & PASSWORD)
  if (!currentUser) {
    return (
      <main className={styles.accountContainer}>
        {/* Clean Login Box */}
        <div className={styles.loginContainer}>
          <div className={styles.loginHeader}>
            <div style={{ marginBottom: '16px' }}>
              <Link href="/">
                <img 
                  src="/logo.png" 
                  alt="Good Fills" 
                  style={{
                    height: '48px',
                    width: 'auto',
                    margin: '0 auto',
                    display: 'block'
                  }}
                />
              </Link>
            </div>
            <h1 className={styles.loginTitle}>Customer Sign In</h1>
            <p className={styles.loginDesc}>
              Sign in to track orders, view receipts, and manage addresses.
            </p>
          </div>

          {authError && (
            <div style={{ color: '#d9381e', fontSize: '0.84rem', marginBottom: '16px', lineHeight: '1.4', backgroundColor: '#fff5f5', border: '1px solid #fecaca', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
                <span style={{ color: '#991b1b', fontWeight: 500 }}>{authError}</span>
              </div>
            </div>
          )}

          {resetSentMsg && (
            <div className={styles.successBox}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
              <span>{resetSentMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isEmailLoading}
            className={styles.googleSignInBtn}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
              <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.9245 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"/>
            </svg>
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* Architectural Divider */}
          <div className={styles.dividerRow}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with email</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Segmented Auth Mode Switch */}
          <div className={styles.authModeToggle}>
            <button
              type="button"
              className={`${styles.authModeBtn} ${authMode === 'signin' ? styles.authModeBtnActive : ''}`}
              onClick={() => { setAuthMode('signin'); setAuthError(null); setResetSentMsg(null); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.authModeBtn} ${authMode === 'register' ? styles.authModeBtnActive : ''}`}
              onClick={() => { setAuthMode('register'); setAuthError(null); setResetSentMsg(null); }}
            >
              Create Account
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth}>
            {authMode === 'register' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={styles.formInput}
                required
                minLength={6}
              />
            </div>

            {authMode === 'signin' && (
              <div className={styles.formActionRow}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className={styles.forgotBtn}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isEmailLoading || isGoogleLoading}
              className={styles.primaryBtn}
              style={{ marginTop: authMode === 'register' ? '12px' : '0' }}
            >
              {isEmailLoading ? (
                <>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <span>🔒 Secure account access. Zero SMS spam or carrier delivery delays.</span>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--border-hairline)', textAlign: 'center' }}>
            <Link
              href="/track-order"
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
              <Truck size={14} /> Looking for quick order tracking? Track with Order ID or Mobile ↗
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // SCREEN 2: AUTHENTICATED CUSTOMER HUB (2-COLUMN E-COMMERCE LAYOUT)
  return (
    <main className={styles.accountContainer}>
      {/* 2-Column Main Workspace */}
      <div className={styles.accountLayout}>
        {/* LEFT SIDEBAR: CUSTOMER IDENTITY & NAVIGATION */}
        <aside className={styles.sidebarCard}>
          <div className={styles.sidebarHeader}>
            <div className={styles.userAvatar}>
              {getInitials(currentUser.name)}
            </div>
            <div className={styles.sidebarUserMeta}>
              <div className={styles.sidebarUserName}>{currentUser.name || 'Good Fills Customer'}</div>
              <div className={styles.verifiedPhoneTag}>
                <ShieldCheck size={13} /> {currentUser.email || 'Verified Account'}
              </div>
            </div>
          </div>

          <nav className={styles.sidebarNavList}>
            <button
              type="button"
              className={`${styles.sidebarNavBtn} ${activeTab === 'orders' ? styles.sidebarNavBtnActive : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={16} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              className={`${styles.sidebarNavBtn} ${activeTab === 'profile' ? styles.sidebarNavBtnActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Personal Profile</span>
            </button>

            <button
              type="button"
              className={`${styles.sidebarNavBtn} ${activeTab === 'addresses' ? styles.sidebarNavBtnActive : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={16} />
              <span>Saved Addresses ({currentUser.addresses?.length || 0})</span>
            </button>

            <button
              type="button"
              className={`${styles.sidebarNavBtn} ${activeTab === 'support' ? styles.sidebarNavBtnActive : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <MessageSquare size={16} />
              <span>Kitchen Concierge</span>
            </button>
          </nav>

          <button
            type="button"
            className={styles.sidebarLogoutBtn}
            onClick={handleSignOut}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* RIGHT CONTENT PANEL */}
        <section className={styles.contentPanel}>
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <div className={styles.panelHeaderRow}>
                <div>
                  <h2 className={styles.panelTitle}>Order History</h2>
                  <p className={styles.panelSubtitle}>
                    Review past shipments, packing receipts, and direct live courier tracking.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border-medium)' }}>
                  <Package size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px', fontWeight: 600 }}>No Orders Placed Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 20px' }}>
                    Orders placed with {currentUser.email} will automatically appear here with live tracking.
                  </p>
                  <Link href="/shop" className={styles.primaryBtn} style={{ display: 'inline-flex', width: 'auto', padding: '10px 24px' }}>
                    Browse Pantry Staples
                  </Link>
                </div>
              ) : (
                <div className={styles.ordersStack}>
                  {orders.map((order) => {
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

                    return (
                      <article key={order.id} className={styles.orderCard}>
                        {/* Top Bar */}
                        <div className={styles.orderCardTop}>
                          <div className={styles.orderIdDateGroup}>
                            <span className={styles.orderIdText}>{order.id}</span>
                            <span className={styles.orderDateText}>Placed on {formatDate(order.createdAt)}</span>
                          </div>
                          <div className={styles.orderCardTopRight}>
                            {order.trackingNumber && (
                              <div className={styles.dtdcAwbPill} title="DTDC Express Consignment Tracking">
                                <span className={styles.dtdcBrand}>DTDC</span>
                                <span className={styles.awbCode}>{order.trackingNumber}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyAwb(order.trackingNumber!, e)}
                                  className={styles.copyAwbBtn}
                                  title="Copy Consignment Number"
                                >
                                  {copiedAwb === order.trackingNumber ? <Check size={11} color="#27ae60" /> : <Copy size={11} />}
                                  <span>{copiedAwb === order.trackingNumber ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            )}
                            <div>{getStatusBadge(order)}</div>
                          </div>
                        </div>

                        {/* Order Body: Products + Summary */}
                        <div className={styles.orderCardBody}>
                          {/* Products List */}
                          <div className={styles.productsCol}>
                            {order.items.map((item, idx) => {
                              const isDelivered = order.shipmentStatus === 'Delivered' || order.orderStatus === 'Delivered';
                              const pId = (item.product?.id || (item as any).productId || '').toLowerCase();
                              const isItemReviewed = reviewedItems.has(`${order.id}_${pId}`);

                              return (
                                <div key={idx} className={styles.productRow}>
                                  {item.product.images?.primary ? (
                                    <img
                                      src={item.product.images.primary}
                                      alt={item.product.name}
                                      className={styles.productThumb}
                                    />
                                  ) : (
                                    <div className={styles.productThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Package size={18} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                  )}
                                  <div className={styles.productInfo}>
                                    <div className={styles.productName}>{item.product.name}</div>
                                    <div className={styles.productMeta}>
                                      Qty: {item.quantity} × {item.product.packSize || 'Standard'}
                                      <span style={{ margin: '0 6px' }}>•</span>
                                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                  </div>

                                  {isDelivered && (
                                    <div className={styles.itemReviewAction}>
                                      {isItemReviewed ? (
                                        <span className={styles.itemReviewedTag}>
                                          <Check size={12} strokeWidth={2.5} />
                                          <span>Reviewed</span>
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setReviewModalOrder(order);
                                            setReviewModalProduct(item.product);
                                            setReviewRating(5);
                                            setReviewTitle('');
                                            setReviewComment('');
                                            setReviewChildAge('');
                                            setReviewError(null);
                                            setReviewSuccess(false);
                                          }}
                                          className={styles.writeItemReviewBtn}
                                          title={`Rate & review ${item.product.name}`}
                                        >
                                          <Star size={12} fill="#d97706" color="#d97706" />
                                          <span>Write Review</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Summary & Actions */}
                          <div className={styles.orderSummaryCol}>
                            <div className={styles.summaryRow}>
                              <span style={{ color: 'var(--text-secondary)' }}>Items ({itemCount}):</span>
                              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className={styles.summaryRow}>
                              <span style={{ color: 'var(--text-secondary)' }}>Doorstep Courier:</span>
                              {order.shippingCost && order.shippingCost > 0 ? (
                                <span>₹{order.shippingCost.toLocaleString('en-IN')}</span>
                              ) : (
                                <span style={{ color: '#27ae60', fontWeight: 600 }}>FREE</span>
                              )}
                            </div>
                            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                              <span>Order Total:</span>
                              <span>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>

                            {/* Actions Group */}
                            <div className={styles.orderActionsRow}>
                              <Link href={`/track-order?id=${order.id}`} className={styles.trackActionBtn}>
                                <Truck size={14} /> Track Live Delivery ↗
                              </Link>

                              <div className={styles.secondaryActionsGroup}>
                                <Link 
                                  href={`/invoice/${order.id}`} 
                                  className={styles.invoiceActionBtn}
                                  title="View & Download Official Tax Invoice"
                                >
                                  <FileText size={13} />
                                  <span>Tax Invoice</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleReorder(order)}
                                  className={styles.reorderActionBtn}
                                  title="Reorder all items from this order into your cart"
                                >
                                  {reorderingOrderId === order.id ? (
                                    <>
                                      <Check size={13} style={{ color: '#27ae60' }} />
                                      <span>Added to Bag</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag size={13} />
                                      <span>Reorder Items</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Delivery Address Note */}
                            {order.shippingAddress && (
                              <div className={styles.deliveryAddressNote}>
                                <strong>Delivered to:</strong> {order.shippingAddress.fullName},{' '}
                                {order.shippingAddress.addressLine1}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <div className={styles.panelHeaderRow}>
                <div>
                  <h2 className={styles.panelTitle}>Personal Profile</h2>
                  <p className={styles.panelSubtitle}>
                    Manage your contact name and details for order notifications and dispatch receipts.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className={styles.profileForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <div className={styles.lockedPhoneRow}>
                    <span>{currentUser.email}</span>
                    <span style={{ color: '#27ae60', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Verified Account
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Dispatch notices and digital invoices will be sent to this email.
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Contact Phone (For Courier Delivery)</label>
                  <input
                    type="tel"
                    className={styles.formInput}
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="e.g. 98765 43210"
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Used by delivery personnel for doorstep delivery coordination.
                  </span>
                </div>

                {profileSuccessMsg && (
                  <div className={styles.saveSuccessAlert}>
                    <Check size={16} /> {profileSuccessMsg}
                  </div>
                )}

                {profileErrorMsg && (
                  <div style={{ color: '#d9381e', fontSize: '0.85rem', marginTop: '8px' }}>
                    <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {profileErrorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.saveChangesBtn}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div>
              <div className={styles.addressesHeaderRow}>
                <div>
                  <h2 className={styles.panelTitle}>Delivery Addresses</h2>
                  <p className={styles.panelSubtitle}>
                    Saved shipping destinations for 1-click doorstep delivery.
                  </p>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    className={styles.addAddressBtn}
                    onClick={handleOpenAddAddress}
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                )}
              </div>

              {addressFeedback && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-medium)', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {addressFeedback}
                </div>
              )}

              {/* Inline Add / Edit Form */}
              {showAddressForm && (
                <div className={styles.addressFormCard}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 16px', fontWeight: 600 }}>
                    {editingAddressIndex !== null ? 'Edit Address' : 'Add New Delivery Address'}
                  </h3>

                  <form onSubmit={handleSaveAddress}>
                    <div className={styles.formGrid2Col}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Recipient Full Name</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Contact Phone</label>
                        <input
                          type="tel"
                          className={styles.formInput}
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
                      <label className={styles.formLabel}>Street Address / Flat / Building</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        placeholder="Flat 302, Green Meadows, 14th Cross"
                        required
                      />
                    </div>

                    <div className={styles.formGrid2Col}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>City</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Pincode</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                      <button
                        type="submit"
                        className={styles.primaryBtn}
                        style={{ width: 'auto', padding: '10px 24px' }}
                        disabled={isSavingAddress}
                      >
                        {isSavingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        style={{ width: 'auto', padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-medium)' }}
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressIndex(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Saved Addresses Grid */}
              <div className={styles.addressCardsGrid}>
                {currentUser.addresses?.map((addr, idx) => {
                  const isDefault = idx === 0;

                  return (
                    <div key={idx} className={styles.addressCard}>
                      <div>
                        {isDefault && <span className={styles.defaultAddressBadge}>Default</span>}
                        <div className={styles.addressCardName}>{addr.fullName || currentUser.name}</div>
                        <div className={styles.addressCardBody}>
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                          <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                          <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Phone: +91 {addr.phone || currentUser.phone || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.addressCardActions}>
                        <button
                          type="button"
                          className={styles.addressActionBtn}
                          onClick={() => handleOpenEditAddress(idx)}
                        >
                          <Edit2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Edit
                        </button>

                        {!isDefault && (
                          <button
                            type="button"
                            className={styles.addressActionBtn}
                            onClick={() => handleSetDefaultAddress(idx)}
                          >
                            Set as Default
                          </button>
                        )}

                        <button
                          type="button"
                          className={styles.addressDeleteBtn}
                          onClick={() => handleDeleteAddress(idx)}
                        >
                          <Trash2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT */}
          {activeTab === 'support' && (
            <div>
              <div className={styles.panelHeaderRow}>
                <div>
                  <h2 className={styles.panelTitle}>Kitchen Concierge</h2>
                  <p className={styles.panelSubtitle}>
                    Direct line to our Bengaluru cold-pressing mill and customer dispatch team.
                  </p>
                </div>
              </div>

              <div className={styles.supportBox}>
                <div className={styles.supportCard}>
                  <h3 className={styles.supportTitle}>Direct WhatsApp Concierge</h3>
                  <p className={styles.supportDesc}>
                    Have a question regarding batch freshness, an active courier shipment, or bulk orders? Chat directly with our fulfilment lead on WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20Good%20Fills,%20I%20have%20an%20inquiry%20regarding%20my%20account/orders"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <MessageSquare size={16} /> Open WhatsApp Chat
                  </a>
                </div>

                <div className={styles.supportCard}>
                  <h3 className={styles.supportTitle}>Mill &amp; Dispatch Desk</h3>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                    <div><strong>Phone:</strong> +91 98765 43210</div>
                    <div><strong>Email:</strong> care@goodfills.in</div>
                    <div style={{ marginTop: '10px' }}>
                      <strong>Fulfilment Hours:</strong><br />
                      Monday to Saturday: 8:00 AM – 7:00 PM IST
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hairline)', paddingTop: '10px' }}>
                    Cold-press batches are milled fresh and dispatched with fast, trackable doorstep delivery.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* RATE & REVIEW DELIVERED PRODUCT MODAL */}
      {reviewModalOrder && reviewModalProduct && (
        <div className={styles.reviewModalOverlay} onClick={() => !isSubmittingReview && setReviewModalOrder(null)}>
          <div className={styles.reviewModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.reviewModalHeader}>
              <div>
                <h3 className={styles.reviewModalTitle}>Rate &amp; Review Product</h3>
                <p className={styles.reviewModalSubtitle}>
                  Verified Order #{reviewModalOrder.id} • Delivered
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingReview && setReviewModalOrder(null)}
                className={styles.closeModalBtn}
                aria-label="Close review modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Summary */}
            <div className={styles.reviewProductCallout}>
              <img
                src={reviewModalProduct.images?.primary || '/logo.png'}
                alt={reviewModalProduct.name}
                className={styles.reviewProductImg}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {reviewModalProduct.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Pack size: {reviewModalProduct.packSize || 'Standard'}
                </div>
              </div>
            </div>

            <div className={styles.verifiedBuyerNotice}>
              <ShieldCheck size={14} />
              <span>Verified Purchase Review — Published with your name &amp; location</span>
            </div>

            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Thank You!</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Your honest review has been published to the Good Fills product page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrderReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviewError && (
                  <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca', padding: '10px 12px', fontSize: '0.82rem', color: '#991b1b' }}>
                    {reviewError}
                  </div>
                )}

                {/* Star Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Your Overall Rating:
                  </label>
                  <div className={styles.reviewStarsDeck}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (reviewHoverRating || reviewRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          className={styles.starSelectBtn}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          title={`${star} Star${star > 1 ? 's' : ''}`}
                        >
                          <Star
                            size={26}
                            fill={active ? '#d97706' : 'none'}
                            color={active ? '#d97706' : 'var(--border-medium)'}
                          />
                        </button>
                      );
                    })}
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-terracotta)', marginLeft: '6px' }}>
                      {reviewRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Review Headline */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Review Headline:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Incredibly fresh and gentle on baby's tummy"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className={styles.formInput}
                    required
                    maxLength={100}
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Detailed Experience:
                  </label>
                  <textarea
                    placeholder="Share how this freshly milled batch worked for your family, the aroma, texture, and how you prepared it..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className={styles.formInput}
                    rows={4}
                    required
                    minLength={5}
                    maxLength={800}
                  />
                </div>

                {/* Family / Child Age (Optional) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Who was this for? (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Months baby, Toddler, Whole Family"
                    value={reviewChildAge}
                    onChange={(e) => setReviewChildAge(e.target.value)}
                    className={styles.formInput}
                    maxLength={40}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewModalOrder(null)}
                    disabled={isSubmittingReview}
                    className={styles.secondaryActionsGroup}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-medium)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={styles.primaryBtn}
                    style={{ width: 'auto', padding: '9px 20px' }}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
