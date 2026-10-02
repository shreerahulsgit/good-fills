'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  ArrowRight,
  Clock,
  Smartphone,
  ShoppingBag,
  ExternalLink,
  Lock,
  CheckCircle,
  XCircle,
  MapPin,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { formatCurrency } from '@/lib/shipping';
import { saveOrder } from '@/lib/orders';
import { loadRazorpayScript } from '@/lib/loadRazorpayScript';
import { ShippingAddress } from '@/types';
import styles from './CheckoutView.module.css';

const INDIAN_STATES = [
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Assam',
  'Goa',
  'Himachal Pradesh',
  'Uttarakhand',
  'Other State / Union Territory'
];

export function CheckoutView() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shipping,
    grandTotal,
    totalWeightGrams,
    clearCart
  } = useCart();

  const { currentUser, updateUser } = useCustomerAuth();
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    country: 'India',
  });

  // Auto-prefill customer details & default address when authenticated user is present
  useEffect(() => {
    if (currentUser) {
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        const def = currentUser.addresses[0];
        setSelectedAddressIndex(0);
        setFormData({
          fullName: def.fullName || currentUser.name || '',
          phone: def.phone || currentUser.phone || '',
          email: def.email || currentUser.email || '',
          addressLine1: def.addressLine1 || '',
          addressLine2: def.addressLine2 || '',
          city: def.city || 'Bengaluru',
          state: def.state || 'Karnataka',
          pincode: def.pincode || '',
          country: 'India',
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || currentUser.name || '',
          email: prev.email || currentUser.email || '',
          phone: prev.phone || currentUser.phone || '',
        }));
      }
    }
  }, [currentUser]);

  const handleSelectSavedAddress = (idx: number) => {
    if (!currentUser?.addresses[idx]) return;
    const addr = currentUser.addresses[idx];
    setSelectedAddressIndex(idx);
    setFormData({
      fullName: addr.fullName || currentUser.name || '',
      phone: addr.phone || currentUser.phone || '',
      email: addr.email || currentUser.email || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || 'Bengaluru',
      state: addr.state || 'Karnataka',
      pincode: addr.pincode || '',
      country: 'India',
    });
    setErrors({});
  };

  const handleEnterNewAddress = () => {
    setSelectedAddressIndex(null);
    setFormData({
      fullName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      addressLine1: '',
      addressLine2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      country: 'India',
    });
  };

  const maybeSaveNewAddress = async () => {
    if (currentUser && saveAddressToAccount && selectedAddressIndex === null) {
      try {
        const identifier = currentUser.email || currentUser.phone;
        if (identifier && formData.addressLine1.trim()) {
          const res = await fetch('/api/account/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier,
              action: 'add',
              address: {
                ...formData,
                fullName: formData.fullName || currentUser.name,
                phone: formData.phone || currentUser.phone,
              },
            }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.user) {
            updateUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Could not auto-save address to account:', err);
      }
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Loading & Verification State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string>('');

  const atelierPhone = '9742068899';

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Valid 10-digit mobile number required for DTDC SMS';
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email required for digital invoice';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    const cleanPin = formData.pincode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      newErrors.pincode = 'Valid 6-digit PIN code required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0] || 'fullName';
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPaymentError(null);
    setIsSubmitting(true);
    setIsVerifying(true);
    setVerifyStatus('Connecting to Razorpay Secure Gateway...');

    // Optionally save new address in customer profile
    await maybeSaveNewAddress();

    try {
      // 1. Create Order with Server-Authoritative Total (clientTotal is NOT trusted)
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customer: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
          shippingAddress: {
            ...formData,
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Payment could not be completed. Please try again.');
      }

      // 2. Handle Atelier Sandbox Mode (DEVELOPMENT ONLY)
      if (orderData.isMock) {
        setVerifyStatus('Atelier Sandbox: Authorizing Simulated UPI Payment...');
        await new Promise((r) => setTimeout(r, 850));

        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: `pay_sandbox_${Date.now()}`,
            isMock: true,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.verified) {
          throw new Error(verifyData.error || 'Payment could not be completed. Please try again.');
        }

        if (verifyData.order) {
          saveOrder(verifyData.order);
        }
        clearCart();
        router.push(`/order-confirmation/${orderData.internalOrderId}`);
        return;
      }

      // 3. Genuine Gateway Mode with Razorpay Standard Checkout SDK
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
      }

      setVerifyStatus('Launching Razorpay UPI Checkout...');
      setIsVerifying(false);

      // Phase 1 Non-negotiable: UPI ONLY Checkout Configuration
      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Good Fills',
        description: 'Bengaluru Artisanal Homemade Preparation',
        image: '/favicon.ico',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: '#97411D', // Good Fills Artisanal Terracotta
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setIsSubmitting(false);
            setIsVerifying(false);
            setPaymentError('Payment could not be completed. Please try again.');
          },
        },
        handler: async (response: any) => {
          setIsSubmitting(true);
          setIsVerifying(true);
          setVerifyStatus('Verifying Cryptographic Payment Signature & State...');

          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              setPaymentError(verifyData.error || 'Payment could not be completed. Please try again.');
              setIsVerifying(false);
              setIsSubmitting(false);
              return;
            }

            if (verifyData.order) {
              saveOrder(verifyData.order);
            }
            clearCart();
            router.push(`/order-confirmation/${verifyData.orderId}`);
          } catch (err: any) {
            console.error('Verification error:', err);
            setPaymentError('Payment could not be completed. Please try again.');
            setIsVerifying(false);
            setIsSubmitting(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (resp: any) => {
        console.error('Payment failed response:', resp.error);
        setPaymentError('Payment could not be completed. Please try again.');
        setIsSubmitting(false);
        setIsVerifying(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Razorpay initialization error:', err);
      setPaymentError(err.message || 'Payment could not be completed. Please try again.');
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  /**
   * Development-only sandbox simulator helper (Requirement 19).
   * Enables immediate simulation of payment success or failure on desktop without
   * being blocked by Razorpay test QR code scanning limitations or NPCI VPA phase-out.
   */
  const handleSimulatePayment = async (shouldSucceed: boolean) => {
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0] || 'fullName';
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPaymentError(null);
    setIsSubmitting(true);
    setIsVerifying(true);
    setVerifyStatus('Atelier Sandbox: Creating Server-Authoritative Order...');

    // Optionally save new address in customer profile
    await maybeSaveNewAddress();

    try {
      // 1. Authoritative order creation via server pricing engine
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          customer: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
          shippingAddress: {
            ...formData,
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
          },
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Payment could not be completed. Please try again.');
      }

      if (!shouldSucceed) {
        // Enforce Requirement 15: Exact retry copy
        setVerifyStatus('Simulating Payment Decline / Abandonment...');
        await new Promise((r) => setTimeout(r, 600));
        setPaymentError('Payment could not be completed. Please try again.');
        setIsSubmitting(false);
        setIsVerifying(false);
        return;
      }

      // Enforce Requirement 16: Verification & transition to Paid / Confirmed
      setVerifyStatus('Atelier Sandbox: Authorizing Simulated UPI Payment...');
      await new Promise((r) => setTimeout(r, 750));

      const verifyRes = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          isMock: true,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || 'Payment could not be completed. Please try again.');
      }

      if (verifyData.order) {
        saveOrder(verifyData.order);
      }
      clearCart();
      router.push(`/order-confirmation/${orderData.internalOrderId}`);
    } catch (err: any) {
      console.error('Simulation error:', err);
      setPaymentError(err.message || 'Payment could not be completed. Please try again.');
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  // If cart is empty and not submitting
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className={styles.checkoutContainer}>
        <div className="container">
          <div className={styles.emptyState}>
            <ShoppingBag size={48} strokeWidth={1.5} style={{ color: 'var(--accent-terracotta)' }} />
            <h1 className={styles.emptyTitle}>Your Bag is Empty</h1>
            <p className={styles.emptyText}>
              Add our freshly prepared, made-to-order creations to your bag before proceeding to checkout.
            </p>
            <Link href="/shop" className="btn btn-primary">
              Browse Atelier Creations <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className="container">
        {/* Minimal Editorial Top Brand Bar */}
        <div className={styles.topBar}>
          <Link href="/" className={styles.brandLink}>
            <span className={styles.brandName}>GOOD FILLS</span>
            <span className={styles.brandSub}>HOMEMADE · BENGALURU</span>
          </Link>

          <div className={styles.headerBadges}>
            <div className={styles.atelierBeacon}>
              <span className={styles.beaconDot} />
              <span>Bengaluru Atelier • Made to Order</span>
            </div>

            <div className={styles.secureNotice}>
              <ShieldCheck size={14} className={styles.secureIcon} />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>

        {/* Page Header Hero */}
        <div className={styles.pageHeader}>
          <Link href="/shop" className={styles.backLink}>
            <ArrowLeft size={14} />
            <span>Return to Catalog</span>
          </Link>
          <span className={styles.pageEyebrow}>ATELIER COMMERCE · ORDER CHECKOUT</span>
          <h1 className={styles.pageTitle}>Review &amp; Place Your Order</h1>
          <p className={styles.pageSubtitle}>
            Every batch is prepared fresh to order in our Bengaluru home kitchen. Dispatched safely via DTDC express domestic courier.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className={styles.checkoutGrid}>
          {/* Left Column: Form Steps */}
          <div className={styles.formColumn}>
            {/* Step 1: Customer Contact & Delivery Address */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.stepTagRow}>
                  <span className={styles.stepBadge}>STEP 01</span>
                  <span className={styles.stepTagLine} />
                </div>
                <h2 className={styles.sectionTitle}>Where should we deliver your order?</h2>
                <p className={styles.sectionSubtitle}>
                  Enter your doorstep address for direct DTDC consignment updates
                </p>
              </div>

              {/* Customer Account Strip */}
              {currentUser ? (
                <div className={styles.customerNoticeStrip}>
                  <div className={styles.customerNoticeInfo}>
                    <CheckCircle2 size={16} className={styles.customerNoticeIcon} />
                    <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
                  </div>
                  <Link href="/account" className={styles.customerNoticeLink}>
                    Manage Account
                  </Link>
                </div>
              ) : (
                <div className={styles.guestNoticeStrip}>
                  <span>Have a Good Fills account?</span>
                  <Link href="/account" className={styles.guestNoticeLink}>
                    Sign in for faster 1-click checkout <ArrowRight size={12} />
                  </Link>
                </div>
              )}

              {/* Saved Addresses Selector (If available) */}
              {currentUser?.addresses && currentUser.addresses.length > 0 && (
                <div className={styles.savedAddressesBox}>
                  <div className={styles.savedAddressesLabel}>
                    <MapPin size={14} /> Deliver to a saved address:
                  </div>
                  <div className={styles.savedAddressesList}>
                    {currentUser.addresses.map((addr, idx) => {
                      const isSelected = selectedAddressIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSavedAddress(idx)}
                          className={`${styles.savedAddressCard} ${isSelected ? styles.savedAddressCardActive : ''}`}
                        >
                          <div className={styles.savedAddressCardTop}>
                            <span className={styles.savedAddressCardName}>
                              {addr.fullName || currentUser.name}
                            </span>
                            {idx === 0 && <span className={styles.defaultBadge}>Default</span>}
                          </div>
                          <div className={styles.savedAddressCardText}>
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                          </div>
                          <div className={styles.savedAddressCardCity}>
                            {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                          {addr.phone && (
                            <div className={styles.savedAddressCardPhone}>
                              📞 +91 {addr.phone}
                            </div>
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleEnterNewAddress}
                      className={`${styles.savedAddressCard} ${selectedAddressIndex === null ? styles.savedAddressCardActive : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Plus size={14} /> Deliver to a new address
                      </div>
                      <div className={styles.savedAddressCardText}>
                        Enter custom or alternate delivery destination below
                      </div>
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.inputGrid}>
                {/* Full Name */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label htmlFor="fullName" className={styles.inputLabel}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ananya Rao"
                    className={`${styles.textInput} ${errors.fullName ? styles.inputError : ''}`}
                    required
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                {/* Mobile Phone */}
                <div className={styles.inputGroup}>
                  <label htmlFor="phone" className={styles.inputLabel}>
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={`${styles.textInput} ${errors.phone ? styles.inputError : ''}`}
                    required
                  />
                  <span className={styles.inputHelp}>
                    Required for DTDC consignment SMS tracking updates.
                  </span>
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>

                {/* Email Address */}
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. ananya@example.com"
                    className={`${styles.textInput} ${errors.email ? styles.inputError : ''}`}
                    required
                  />
                  <span className={styles.inputHelp}>
                    Order confirmation &amp; digital invoice sent here.
                  </span>
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                {/* Street Address */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label htmlFor="addressLine1" className={styles.inputLabel}>
                    Door No., Apartment / House, Street *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="Flat 302, Green Meadows, 5th Cross"
                    className={`${styles.textInput} ${errors.addressLine1 ? styles.inputError : ''}`}
                    required
                  />
                  {errors.addressLine1 && (
                    <span className={styles.errorText}>{errors.addressLine1}</span>
                  )}
                </div>

                {/* Address Line 2 */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label htmlFor="addressLine2" className={styles.inputLabel}>
                    Landmark / Locality <span className={styles.inputLabelOptional}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2 || ''}
                    onChange={handleInputChange}
                    placeholder="Near BDA Complex, Indiranagar"
                    className={styles.textInput}
                  />
                </div>

                {/* City */}
                <div className={styles.inputGroup}>
                  <label htmlFor="city" className={styles.inputLabel}>
                    City / Town *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru"
                    className={`${styles.textInput} ${errors.city ? styles.inputError : ''}`}
                    required
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>

                {/* PIN Code */}
                <div className={styles.inputGroup}>
                  <label htmlFor="pincode" className={styles.inputLabel}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN code"
                    className={`${styles.textInput} ${errors.pincode ? styles.inputError : ''}`}
                    required
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>

                {/* State */}
                <div className={styles.inputGroup}>
                  <label htmlFor="state" className={styles.inputLabel}>
                    State / Territory *
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={styles.selectInput}
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className={styles.inputGroup}>
                  <label htmlFor="country" className={styles.inputLabel}>
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    readOnly
                    className={styles.textInput}
                    style={{ backgroundColor: 'rgba(34, 24, 19, 0.04)', color: 'var(--text-muted)' }}
                  />
                </div>

                {/* Checkbox to save new address to account */}
                {currentUser && selectedAddressIndex === null && (
                  <label className={styles.saveAddressCheckboxRow}>
                    <input
                      type="checkbox"
                      checked={saveAddressToAccount}
                      onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                    />
                    <span>Save this delivery address to my account for future orders</span>
                  </label>
                )}
              </div>

              {/* International Order Callout */}
              <div className={styles.intlNotice}>
                <span className={styles.intlNoticeText}>
                  Need delivery outside India? We fulfill international orders with custom courier rates.
                </span>
                <a
                  href={`https://wa.me/91${atelierPhone}?text=Hello%20Good%20Fills!%20I%20would%20like%20to%20place%20an%20international%20order%20for%20delivery%20outside%20India.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.intlWhatsAppBtn}
                >
                  <span>International Request</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Step 2: Delivery Courier Method */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.stepTagRow}>
                  <span className={styles.stepBadge}>STEP 02</span>
                  <span className={styles.stepTagLine} />
                </div>
                <h2 className={styles.sectionTitle}>DTDC Express Domestic Courier</h2>
                <p className={styles.sectionSubtitle}>
                  Calculated strictly by net product weight ({totalWeightGrams}g)
                </p>
              </div>

              <div className={styles.deliveryOptionCard}>
                <div className={styles.deliveryIconBox}>
                  <Truck size={20} strokeWidth={2} />
                </div>
                <div className={styles.deliveryMeta}>
                  <div className={styles.deliveryHeaderRow}>
                    <h3 className={styles.deliveryTitle}>DTDC Express Doorstep Delivery</h3>
                    <span className={styles.deliveryBadge}>
                      {formatCurrency(shipping.shippingCost)}
                    </span>
                  </div>
                  <p className={styles.deliveryDesc}>
                    Estimated delivery in <strong>2–4 business days</strong> following fresh kitchen preparation. Consignment tracking SMS sent directly to your phone upon courier dispatch.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Secure UPI Payment powered by Razorpay */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.stepTagRow}>
                  <span className={styles.stepBadge}>STEP 03</span>
                  <span className={styles.stepTagLine} />
                </div>
                <h2 className={styles.sectionTitle}>Pay with UPI</h2>
                <p className={styles.sectionSubtitle}>
                  Secure UPI payment powered by Razorpay. Encrypted &amp; verified instantly.
                </p>
              </div>

              {/* UPI Gateway Card */}
              <div className={styles.upiGatewayCard}>
                <div className={styles.upiHeaderRow}>
                  <div className={styles.upiTitleGroup}>
                    <span className={styles.upiMethodPill}>UPI 2.0</span>
                    <h3 className={styles.upiTitle}>Direct UPI Gateway</h3>
                  </div>
                  <div className={styles.upiSecureBadge}>
                    <ShieldCheck size={13} />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                </div>

                <div className={styles.upiSupportedBox}>
                  <div className={styles.upiSupportedHeader}>
                    <span className={styles.upiSupportedLabel}>Accepted UPI Apps</span>
                  </div>

                  <div className={styles.upiRailsList}>
                    <span className={styles.upiRailItem}>
                      <Smartphone size={13} style={{ color: 'var(--accent-terracotta)' }} />
                      Google Pay
                    </span>
                    <span className={styles.upiRailItem}>
                      <Smartphone size={13} style={{ color: 'var(--accent-terracotta)' }} />
                      PhonePe
                    </span>
                    <span className={styles.upiRailItem}>
                      <Smartphone size={13} style={{ color: 'var(--accent-terracotta)' }} />
                      Paytm
                    </span>
                    <span className={styles.upiRailItem}>
                      <Smartphone size={13} style={{ color: 'var(--accent-terracotta)' }} />
                      BHIM
                    </span>
                    <span className={styles.upiRailItem}>
                      <Smartphone size={13} style={{ color: 'var(--accent-terracotta)' }} />
                      Cred UPI
                    </span>
                    <span className={styles.upiRailItem}>
                      <Smartphone size={13} style={{ color: 'var(--accent-terracotta)' }} />
                      Any UPI ID / VPA
                    </span>
                  </div>

                  <p className={styles.upiInstructionText}>
                    Clicking <strong>Pay via UPI</strong> opens the secure Razorpay payment modal. On desktop browsers, an instant dynamic UPI QR code is presented to scan. On mobile devices, your preferred UPI app opens directly via UPI Intent.
                  </p>
                </div>

                {/* Development Sandbox Indicator & Immediate Desktop Test Controls */}
                {process.env.NODE_ENV !== 'production' && (
                  <div className={styles.sandboxNotice}>
                    <div className={styles.sandboxTitle}>
                      <ShieldCheck size={15} />
                      <span>Atelier Development Sandbox Controls (Active on Localhost)</span>
                    </div>
                    <div>
                      In Razorpay sandbox test mode, dynamic QR codes cannot be scanned by real mobile banking apps, and NPCI phased out manual UPI ID entry in 2026. Use these test buttons to verify confirmed and declined order states:
                    </div>
                    <div className={styles.sandboxActions}>
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment(true)}
                        disabled={isSubmitting}
                        className={styles.simSuccessBtn}
                      >
                        <CheckCircle size={14} />
                        <span>Success (Simulate Confirmed Order)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulatePayment(false)}
                        disabled={isSubmitting}
                        className={styles.simFailureBtn}
                      >
                        <XCircle size={14} />
                        <span>Failure (Simulate Declined Payment)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Error Callout */}
              {paymentError && (
                <div className={styles.paymentErrorNotice}>
                  {paymentError}
                </div>
              )}

              {/* Verifying Animation Box */}
              {isVerifying && (
                <div className={styles.verifyingBox}>
                  <div className={styles.verifyingSpinner} />
                  <span className={styles.verifyingStatusText}>{verifyStatus}</span>
                  <span className={styles.verifyingSubText}>
                    Please do not refresh or close this window.
                  </span>
                </div>
              )}

              {/* Submit Button */}
              {!isVerifying && (
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitOrderBtn}
                  >
                    <Lock size={17} />
                    <span>Pay {formatCurrency(grandTotal)} via UPI</span>
                    <ArrowRight size={17} />
                  </button>
                  <p className={styles.legalDisclaimer}>
                    By confirming payment, you agree to our{' '}
                    <Link href="/terms" target="_blank" className={styles.legalLink}>
                      Terms
                    </Link>
                    ,{' '}
                    <Link href="/privacy" target="_blank" className={styles.legalLink}>
                      Privacy
                    </Link>
                    , and acknowledge our made-to-order{' '}
                    <Link href="/refund-policy" target="_blank" className={styles.legalLink}>
                      Strict Non-Returnable Policy
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Bespoke Atelier Summary Ledger */}
          <aside className={styles.summaryColumn}>
            <div className={styles.summaryDeck}>
              <div className={styles.summaryHeader}>
                <div>
                  <span className={styles.summaryEyebrow}>ATELIER BASKET</span>
                  <h3 className={styles.summaryTitle}>Order Summary</h3>
                </div>
                <span className={styles.itemCountBadge}>
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>

              {/* Items List */}
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.product.id} className={styles.itemRow}>
                    <img
                      src={item.product.images.primary}
                      alt={item.product.name}
                      className={styles.itemThumb}
                    />
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.product.name}</h4>
                      <div className={styles.itemMetaRow}>
                        <span className={styles.itemPackTag}>{item.product.packSize}</span>
                        <span className={styles.itemQty}>× {item.quantity}</span>
                      </div>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className={styles.costBreakdown}>
                <div className={styles.costRow}>
                  <span>Product Subtotal</span>
                  <span className={styles.costValue}>{formatCurrency(subtotal)}</span>
                </div>

                <div className={styles.costRow}>
                  <div>
                    <span>DTDC Domestic Courier</span>
                    <span className={styles.shippingSlabNote}>
                      {totalWeightGrams}g net ({shipping.slabDescription})
                    </span>
                  </div>
                  <strong style={{ color: 'var(--accent-terracotta)' }}>
                    {formatCurrency(shipping.shippingCost)}
                  </strong>
                </div>

                <div className={styles.totalRow}>
                  <div className={styles.totalLabelBlock}>
                    <span className={styles.totalLabel}>Total Payable</span>
                    <span className={styles.totalTaxNote}>(Inclusive of all taxes &amp; shipping)</span>
                  </div>
                  <span className={styles.totalAmount}>
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className={styles.trustPills}>
                <div className={styles.trustPillItem}>
                  <span className={styles.trustPillDot} />
                  <span>Freshly made to order in small batches only</span>
                </div>
                <div className={styles.trustPillItem}>
                  <span className={styles.trustPillDot} />
                  <span>Sealed airtight in food-grade barrier pouches</span>
                </div>
                <div className={styles.trustPillItem}>
                  <span className={styles.trustPillDot} />
                  <span>Doorstep delivery in 2–4 business days via DTDC</span>
                </div>
                <div className={styles.trustPillItem}>
                  <span className={styles.trustPillDot} />
                  <span>Traditional Bengaluru kitchen adhering to FSSAI standards</span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
