'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Lock,
  MapPin,
  Plus,
  Minus,
  Trash2,
  X,
  Check,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '@/lib/data/shop';
import { useCart } from '@/components/context/cart-context';
import { useCustomerAuth } from '@/components/context/auth-context';
import { formatCurrency } from '@/lib/dispatch/shipping';
import { loadRazorpayScript } from '@/lib/store/razorpay';
import { ShippingAddress } from '@/types';
import { OlaAddressSearch } from './address-search';
import { GooglePayLogo, PhonePeLogo, PaytmLogo, UpiLogo, NetBankingLogo } from './payment-methods';
import styles from '@/components/checkout/checkout-view.module.css';

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
    updateQuantity,
    removeItem,
    addItem,
    clearCart
  } = useCart();

  const { currentUser, updateUser } = useCustomerAuth();
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'porter'>('standard');
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState<string>('all');
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('good_fills_checkout_draft_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData && !currentUser) {
          setFormData((prev) => ({ ...prev, ...parsed.formData }));
        }
        if (parsed.activeStep && (parsed.activeStep === 1 || parsed.activeStep === 2 || parsed.activeStep === 3)) {
          setActiveStep(parsed.activeStep);
        }
      }
    } catch (e) {
      console.error('Error loading checkout draft', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        'good_fills_checkout_draft_v1',
        JSON.stringify({ formData, activeStep })
      );
    } catch (e) {
      console.error('Error persisting checkout draft', e);
    }
  }, [formData, activeStep]);

  const filteredQuickAddProducts = quickAddCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === quickAddCategory);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string>('');

  const atelierPhone = '9742068899';

  const getInternationalWhatsAppUrl = () => {
    let msg = `Hello Good Fills! 🌿\n\nI would like to place an International Order for delivery outside India.\n\n`;

    if (items.length > 0) {
      msg += `📦 Cart Items:\n`;
      items.forEach((item) => {
        msg += `• ${item.quantity}x ${item.product.name} (${item.product.packSize || ''}) - ₹${item.product.price * item.quantity}\n`;
      });
      msg += `\n⚖️ Estimated Weight: ~${totalWeightGrams}g\n`;
      msg += `💰 Products Total: ₹${subtotal}\n\n`;
    }

    if (formData.fullName.trim() || formData.city.trim()) {
      msg += `📍 Delivery Destination:\n`;
      if (formData.fullName.trim()) msg += `• Recipient: ${formData.fullName.trim()}\n`;
      if (formData.city.trim()) msg += `• City: ${formData.city.trim()}\n`;
      if (formData.addressLine1.trim()) msg += `• Address: ${formData.addressLine1.trim()}\n`;
      msg += `\n`;
    }

    msg += `Please share the international shipping quote and payment link. Thank you!`;
    return `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(msg)}`;
  };

  const isBengaluruPincode = formData.pincode.replace(/\D/g, '').startsWith('560');
  const checkoutTotal = deliveryMethod === 'porter' ? subtotal : grandTotal;

  useEffect(() => {
    if (!isBengaluruPincode && deliveryMethod === 'porter') {
      setDeliveryMethod('standard');
    }
  }, [isBengaluruPincode, deliveryMethod]);

  const getSameDayPorterWhatsAppUrl = () => {
    let msg = `Hello Good Fills! 🌿\n\nI would like to request *Same-Day Instant Delivery via Porter / Uber* in Bengaluru.\n\n`;

    const fullAddr = [
      formData.addressLine1.trim(),
      formData.addressLine2?.trim(),
      formData.city.trim(),
      formData.pincode.trim() ? `PIN: ${formData.pincode.trim()}` : '',
    ].filter(Boolean).join(', ');

    if (formData.fullName.trim() || formData.phone.trim() || fullAddr) {
      msg += `📍 *Delivery Destination:*\n`;
      if (formData.fullName.trim()) msg += `• Recipient: ${formData.fullName.trim()}\n`;
      if (formData.phone.trim()) msg += `• Phone: +91 ${formData.phone.trim()}\n`;
      if (fullAddr) msg += `• Address: ${fullAddr}\n`;
      msg += `\n`;
    }

    if (items.length > 0) {
      msg += `📦 *Order Items:*\n`;
      items.forEach((item) => {
        msg += `• ${item.quantity}x ${item.product.name} (${item.product.packSize || ''}) - ₹${item.product.price * item.quantity}\n`;
      });
      msg += `\n⚖️ Total Weight: ~${totalWeightGrams}g\n`;
      msg += `💰 Products Total: ₹${subtotal}\n\n`;
    }

    msg += `⚡ *Same-Day Delivery Notice:* I understand that Porter / Uber delivery charges apply & vary based on live distance from your Indiranagar kitchen. Please confirm the delivery fare and dispatch availability. Thank you!`;

    return `https://wa.me/91${atelierPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'pincode') {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: clean }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

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
      newErrors.phone = 'Valid 10-digit mobile number required for delivery & tracking SMS';
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

  const handleProceedToStep2 = () => {
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0] || 'fullName';
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setActiveStep(2);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep: 1 | 2 | 3) => {
    if (targetStep === activeStep) return;
    if (targetStep === 1) {
      setActiveStep(1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    if (targetStep === 3 && deliveryMethod === 'porter') {
      return;
    }
    if (!validateForm()) {
      setActiveStep(1);
      const firstErrorKey = Object.keys(errors)[0] || 'fullName';
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setActiveStep(targetStep);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      if (activeStep === 1) {
        e.preventDefault();
        handleProceedToStep2();
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setActiveStep(1);
      const firstErrorKey = Object.keys(errors)[0] || 'fullName';
      const el = document.getElementById(firstErrorKey);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPaymentError(null);
    setIsSubmitting(true);
    setIsVerifying(true);
    setVerifyStatus('Connecting to Razorpay Secure Gateway...');

    await maybeSaveNewAddress();

    try {
      const res = await fetch('/api/razorpay/create', {
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

        clearCart();
        router.push(`/order/confirmation/${orderData.internalOrderId}`);
        return;
      }

      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please check your network connection.');
      }

      setVerifyStatus('Launching Razorpay UPI Checkout...');
      setIsVerifying(false);

      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Good Fills',
        description: 'Bengaluru Artisanal Homemade Preparation',
        image: '/logo.png',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: '#97411D',
        },
        config: {
          display: {
            blocks: {
              upi_block: {
                name: 'Pay via UPI (Instant QR / App)',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
              bank_block: {
                name: 'Net Banking / Bank Transfer',
                instruments: [
                  {
                    method: 'netbanking',
                  },
                ],
              },
            },
            sequence: ['block.upi_block', 'block.bank_block'],
            preferences: {
              show_default_blocks: false,
            },
          },
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
                method: response.method,
                internalOrderId: orderData.internalOrderId,
                customer: {
                  fullName: formData.fullName.trim(),
                  email: formData.email.trim(),
                  phone: formData.phone.trim(),
                },
                shippingAddress: {
                  addressLine1: formData.addressLine1.trim(),
                  addressLine2: (formData.addressLine2 || '').trim() || undefined,
                  city: formData.city.trim(),
                  state: formData.state.trim(),
                  pincode: formData.pincode.trim(),
                },
                items: items.map((i) => ({
                  productId: i.product.id,
                  quantity: i.quantity,
                })),
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              setPaymentError(verifyData.error || 'Payment could not be completed. Please try again.');
              setIsVerifying(false);
              setIsSubmitting(false);
              return;
            }

            try {
              sessionStorage.removeItem('good_fills_checkout_draft_v1');
            } catch (e) {}
            clearCart();
            router.push(`/order/confirmation/${verifyData.orderId}`);
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
        <div className={styles.pageHeader}>
          <span className={styles.pageEyebrow}>ATELIER COMMERCE · ORDER CHECKOUT</span>
          <h1 className={styles.pageTitle}>Review &amp; Place Your Order</h1>
          <p className={styles.pageSubtitle}>
            Every batch is prepared fresh to order in our Bengaluru home kitchen. Dispatched safely via tracked express courier.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} onKeyDown={handleFormKeyDown} className={styles.checkoutGrid}>
          <div className={styles.formColumn}>
            <div className={styles.checkoutStepper} role="tablist" aria-label="Checkout Progress">
              <button
                type="button"
                role="tab"
                aria-selected={activeStep === 1}
                onClick={() => handleStepClick(1)}
                className={`${styles.stepperTab} ${activeStep === 1 ? styles.stepperTabActive : ''} ${activeStep > 1 ? styles.stepperTabCompleted : ''}`}
              >
                <div className={styles.stepperBadge}>
                  {activeStep > 1 ? <CheckCircle2 size={16} /> : '01'}
                </div>
                <div className={styles.stepperMeta}>
                  <span className={styles.stepperStepNum}>Step 01</span>
                  <span className={styles.stepperStepTitle}>Delivery Address</span>
                </div>
              </button>

              <div className={`${styles.stepperConnector} ${activeStep > 1 ? styles.stepperConnectorActive : ''}`} />

              <button
                type="button"
                role="tab"
                aria-selected={activeStep === 2}
                onClick={() => handleStepClick(2)}
                className={`${styles.stepperTab} ${activeStep === 2 ? styles.stepperTabActive : ''} ${activeStep > 2 ? styles.stepperTabCompleted : ''} ${activeStep < 2 ? styles.stepperTabDisabled : ''}`}
              >
                <div className={styles.stepperBadge}>
                  {activeStep > 2 ? <CheckCircle2 size={16} /> : '02'}
                </div>
                <div className={styles.stepperMeta}>
                  <span className={styles.stepperStepNum}>Step 02</span>
                  <span className={styles.stepperStepTitle}>Courier Method</span>
                </div>
              </button>

              <div className={`${styles.stepperConnector} ${activeStep > 2 ? styles.stepperConnectorActive : ''}`} />

              <button
                type="button"
                role="tab"
                aria-selected={activeStep === 3}
                onClick={() => handleStepClick(3)}
                className={`${styles.stepperTab} ${activeStep === 3 ? styles.stepperTabActive : ''} ${activeStep < 3 ? styles.stepperTabDisabled : ''}`}
              >
                <div className={styles.stepperBadge}>
                  03
                </div>
                <div className={styles.stepperMeta}>
                  <span className={styles.stepperStepNum}>Step 03</span>
                  <span className={styles.stepperStepTitle}>Payment</span>
                </div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeStep === 1 && (
                <motion.div
                  key="checkout-step-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className={styles.sectionCard}
                >
                  <div className={styles.sectionHeader}>
                    <div className={styles.stepTagRow}>
                      <span className={styles.stepBadge}>STEP 01 OF 03</span>
                      <span className={styles.stepTagLine} />
                    </div>
                <h2 className={styles.sectionTitle}>Where should we deliver your order?</h2>
                <p className={styles.sectionSubtitle}>
                  Enter your doorstep address for direct delivery &amp; tracking updates
                </p>
              </div>

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
                    Required for delivery SMS &amp; tracking updates.
                  </span>
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>

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

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <OlaAddressSearch
                    onSelectAddress={(place) => {
                      setFormData((prev) => ({
                        ...prev,
                        addressLine1: place.addressLine1 || prev.addressLine1,
                        addressLine2: place.addressLine2 || prev.addressLine2,
                        city: place.city || prev.city,
                        state: place.state || prev.state,
                        pincode: place.pincode || prev.pincode,
                      }));

                      setErrors((prev) => {
                        const next = { ...prev };
                        if (place.city) delete next.city;
                        if (place.state) delete next.state;
                        if (place.pincode) delete next.pincode;
                        if (place.addressLine1) delete next.addressLine1;
                        return next;
                      });
                    }}
                  />
                </div>

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
                    placeholder="Near BDA Complex, 2nd Main"
                    className={styles.textInput}
                  />
                </div>

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

                <div className={styles.inputGroup}>
                  <label htmlFor="pincode" className={styles.inputLabel}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit PIN (e.g. 560038)"
                    className={`${styles.textInput} ${errors.pincode ? styles.inputError : ''}`}
                    required
                  />
                  {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
                </div>

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

              <div className={styles.intlNotice}>
                <span className={styles.intlNoticeText}>
                  Need delivery outside India? We fulfill international orders with custom courier rates<br></br>(or call{' '}
                  <a href={`tel:+91${atelierPhone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    +91 {atelierPhone}
                  </a>).
                </span>
                <a
                  href={getInternationalWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.intlWhatsAppBtn}
                >
                  <span>International Request</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className={styles.stepBtnRow}>
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className={styles.nextStepBtn}
                >
                  <span>Continue to Shipping Method</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="checkout-step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepSummaryRecap}>
                <div className={styles.recapLeft}>
                  <div className={styles.recapIconBox}>
                    <MapPin size={16} />
                  </div>
                  <div className={styles.recapInfo}>
                    <div className={styles.recapHeader}>
                      <span className={styles.recapLabel}>Delivering To</span>
                      <span className={styles.recapName}>{formData.fullName} • +91 {formData.phone}</span>
                    </div>
                    <p className={styles.recapText}>
                      {formData.addressLine1}{formData.addressLine2 ? `, ${formData.addressLine2}` : ''}, {formData.city}, {formData.state} – {formData.pincode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(1);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={styles.recapEditBtn}
                >
                  Change
                </button>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.stepTagRow}>
                    <span className={styles.stepBadge}>STEP 02 OF 03</span>
                    <span className={styles.stepTagLine} />
                  </div>
                  <h2 className={styles.sectionTitle}>Select Delivery Method</h2>
                  <p className={styles.sectionSubtitle}>
                    Choose between standard tracked courier or same-day instant delivery in Bengaluru
                  </p>
                </div>

                <div className={styles.deliveryMethodsList}>
                  {isBengaluruPincode && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setDeliveryMethod('porter')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setDeliveryMethod('porter');
                      }}
                      className={`${styles.deliveryOptionCard} ${styles.deliverySelectableCard} ${styles.porterOptionCard} ${deliveryMethod === 'porter' ? styles.deliveryOptionCardActive : ''}`}
                    >
                      <div className={styles.deliveryRadioWrap}>
                        <input
                          type="radio"
                          id="delivery-porter"
                          name="deliveryMethod"
                          checked={deliveryMethod === 'porter'}
                          onChange={() => setDeliveryMethod('porter')}
                          className={styles.deliveryRadioInput}
                        />
                      </div>
                      <div className={styles.deliveryIconBox}>
                        <Zap size={18} strokeWidth={2} />
                      </div>
                      <div className={styles.deliveryMeta}>
                        <div className={styles.deliveryHeaderRow}>
                          <div className={styles.porterTitleWrap}>
                            <h3 className={styles.deliveryTitle}>
                              Same-Day Delivery (Porter / Uber)
                            </h3>
                            <span className={styles.sameDayPill}>
                              BENGALURU
                            </span>
                          </div>
                        </div>
                        <p className={styles.deliveryDesc}>
                          Need it urgently today? Dispatched directly from our Indiranagar kitchen. <strong>Delivery charges apply &amp; vary based on your live distance</strong> via Porter or Uber.
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setDeliveryMethod('standard')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setDeliveryMethod('standard');
                    }}
                    className={`${styles.deliveryOptionCard} ${styles.deliverySelectableCard} ${styles.standardOptionCard} ${deliveryMethod === 'standard' ? styles.standardOptionCardActive : ''}`}
                  >
                    <div className={styles.deliveryRadioWrap}>
                      <input
                        type="radio"
                        id="delivery-standard"
                        name="deliveryMethod"
                        checked={deliveryMethod === 'standard'}
                        onChange={() => setDeliveryMethod('standard')}
                        className={styles.deliveryRadioInput}
                      />
                    </div>
                    <div className={styles.deliveryIconBox}>
                      <Truck size={20} strokeWidth={2} />
                    </div>
                    <div className={styles.deliveryMeta}>
                      <div className={styles.deliveryHeaderRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3 className={styles.deliveryTitle}>Standard Delivery (DTDC)</h3>
                          <span className={styles.primaryPill}>PAN INDIA</span>
                        </div>
                        <span className={styles.deliveryBadge}>
                          {formatCurrency(shipping.shippingCost)}
                        </span>
                      </div>
                      <p className={styles.deliveryDesc}>
                        Delivered in <strong>2–4 business days</strong> following fresh kitchen preparation. Calculated strictly by net package weight ({totalWeightGrams}g). Consignment tracking SMS sent upon courier dispatch.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.stepBtnRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStep(1);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={styles.backStepBtn}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Address</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (deliveryMethod === 'porter') {
                        window.location.href = getSameDayPorterWhatsAppUrl();
                        return;
                      }
                      setActiveStep(3);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={styles.nextStepBtn}
                  >
                    {deliveryMethod === 'porter' ? (
                      <>
                        <span>Continue on WhatsApp</span>
                        <ExternalLink size={13} />
                      </>
                    ) : (
                      <>
                        <span>Continue to Payment</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="checkout-step-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.stepSummaryRecap}>
                <div className={styles.recapLeft}>
                  <div className={styles.recapIconBox}>
                    <MapPin size={16} />
                  </div>
                  <div className={styles.recapInfo}>
                    <div className={styles.recapHeader}>
                      <span className={styles.recapLabel}>Delivery Destination</span>
                      <span className={styles.recapName}>{formData.fullName} • +91 {formData.phone}</span>
                    </div>
                    <p className={styles.recapText}>
                      {formData.addressLine1}{formData.addressLine2 ? `, ${formData.addressLine2}` : ''}, {formData.city}, {formData.state} – {formData.pincode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(1);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={styles.recapEditBtn}
                >
                  Change
                </button>
              </div>

              <div className={styles.stepSummaryRecap}>
                <div className={styles.recapLeft}>
                  <div className={styles.recapIconBox}>
                    <Truck size={16} />
                  </div>
                  <div className={styles.recapInfo}>
                    <div className={styles.recapHeader}>
                      <span className={styles.recapLabel}>Shipping Courier</span>
                      <span className={styles.recapName}>
                        {deliveryMethod === 'porter'
                          ? 'Same-Day Delivery (Porter / Uber)'
                          : 'DTDC Doorstep Courier'}
                      </span>
                    </div>
                    <p className={styles.recapText}>
                      {deliveryMethod === 'porter'
                        ? 'Dispatched today from Indiranagar kitchen • Delivery fee paid on WhatsApp / at actuals'
                        : `${totalWeightGrams}g package weight • ${formatCurrency(shipping.shippingCost)} • Estimated delivery in 2–4 business days`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(2);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className={styles.recapEditBtn}
                >
                  Change
                </button>
              </div>

              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.stepTagRow}>
                    <span className={styles.stepBadge}>STEP 03 OF 03</span>
                    <span className={styles.stepTagLine} />
                  </div>
                <h2 className={styles.sectionTitle}>Pay with UPI or Bank Transfer</h2>
                <p className={styles.sectionSubtitle}>
                  Secure payment powered by Razorpay. Encrypted &amp; verified instantly.
                </p>
              </div>

              <div className={styles.upiGatewayCard}>
                <div className={styles.upiHeaderRow}>
                  <div className={styles.upiTitleGroup}>
                    <h3 className={styles.upiTitle}>Instant Payment Gateway</h3>
                    <span className={styles.upiMethodPill}>Razorpay</span>
                  </div>
                </div>

                <div className={styles.upiSupportedBox}>
                  <div className={styles.upiSupportedHeader}>
                    <span className={styles.upiSupportedLabel}>Accepted Payment Rails</span>
                  </div>

                  <div className={styles.upiRailsList}>
                    <span className={styles.upiRailItem} style={{ paddingLeft: '4px' }}>
                      <span className={styles.upiRailLogo}><GooglePayLogo size={17} /></span>
                      Google Pay
                    </span>
                    <span className={styles.upiRailItem}>
                      <span className={styles.upiRailLogo}><PhonePeLogo size={18} /></span>
                      PhonePe
                    </span>
                    <span className={styles.upiRailItem}>
                      <span className={styles.upiRailLogo}><PaytmLogo size={16} /></span>
                      Paytm
                    </span>
                    <span className={styles.upiRailItem}>
                      <span className={styles.upiRailLogo}><UpiLogo size={16} /></span>
                      Any UPI QR / App
                    </span>
                    <span className={styles.upiRailItem}>
                      <span className={styles.upiRailLogo}><NetBankingLogo size={17} /></span>
                      Net Banking (All Indian Banks)
                    </span>
                  </div>

                  <p className={styles.upiInstructionText}>
                    Clicking <strong>Pay via UPI / Netbanking</strong> opens the secure Razorpay modal. You can scan an instant dynamic UPI QR code, choose your mobile UPI app, or select direct Net Banking across SBI, HDFC, ICICI, Axis, and all major Indian banks.
                  </p>
                </div>
              </div>

              {paymentError && (
                <div className={styles.paymentErrorNotice}>
                  {paymentError}
                </div>
              )}

              {isVerifying && (
                <div className={styles.verifyingBox}>
                  <div className={styles.verifyingSpinner} />
                  <span className={styles.verifyingStatusText}>{verifyStatus}</span>
                  <span className={styles.verifyingSubText}>
                    Please do not refresh or close this window.
                  </span>
                </div>
              )}

              {!isVerifying && (
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitOrderBtn}
                  >
                    <Lock size={17} />
                    <span>Pay {formatCurrency(checkoutTotal)} via UPI / Netbanking</span>
                    <ArrowRight size={17} />
                  </button>
                  <p className={styles.legalDisclaimer}>
                    By confirming payment, you agree to our{' '}
                    <Link href="/terms-of-service" target="_blank" className={styles.legalLink}>
                      Terms
                    </Link>
                    ,{' '}
                    <Link href="/privacy-policy" target="_blank" className={styles.legalLink}>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>

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
                        <div className={styles.itemQtyStepper}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className={styles.qtyStepperBtn}
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            <Minus size={11} />
                          </button>
                          <span className={styles.itemQtyVal}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className={styles.qtyStepperBtn}
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className={styles.itemRemoveBtn}
                          aria-label={`Remove ${item.product.name} from order`}
                          title="Remove item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <span className={styles.itemPrice}>
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.addMoreRow}>
                <button
                  type="button"
                  onClick={() => setIsAddProductsOpen(true)}
                  className={styles.addMoreBtn}
                >
                  <Plus size={13} />
                  <span>Add More Products</span>
                </button>
                <Link href="/shop" className={styles.browseStoreLink}>
                  <span>Browse Store</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className={styles.costBreakdown}>
                <div className={styles.costRow}>
                  <span>Product Subtotal</span>
                  <span className={styles.costValue}>{formatCurrency(subtotal)}</span>
                </div>

                <div className={styles.costRow}>
                  <div>
                    <span>
                      {deliveryMethod === 'porter'
                        ? 'Same-Day (Porter / Uber)'
                        : 'DTDC Doorstep Courier'}
                    </span>
                    <span className={styles.shippingSlabNote}>
                      {deliveryMethod === 'porter'
                        ? 'Delivery fee paid on WhatsApp / at actuals'
                        : `${totalWeightGrams}g net (${shipping.slabDescription})`}
                    </span>
                  </div>
                  <strong style={{ color: 'var(--accent-terracotta)' }}>
                    {deliveryMethod === 'porter'
                      ? 'Actuals'
                      : formatCurrency(shipping.shippingCost)}
                  </strong>
                </div>

                <div className={styles.totalRow}>
                  <div className={styles.totalLabelBlock}>
                    <span className={styles.totalLabel}>Total Payable</span>
                    <span className={styles.totalTaxNote}>
                      {deliveryMethod === 'porter'
                        ? <>Taxes included; Delivery fee charged<br></br>separately at actuals</>
                        : <>Inclusive of all taxes &amp; shipping</>}
                    </span>
                  </div>
                  <span className={styles.totalAmount}>
                    {formatCurrency(checkoutTotal)}
                  </span>
                </div>
              </div>

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
                  <span>Fast doorstep delivery in 2–4 business days</span>
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

      <AnimatePresence>
        {isAddProductsOpen && (
          <div
            className={styles.quickAddModalOverlay}
            onClick={() => setIsAddProductsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Add products to your order"
          >
            <motion.div
              className={styles.quickAddModalCard}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.quickAddHeader}>
                <div>
                  <div className={styles.quickAddBadge}>ATELIER PANTRY</div>
                  <h3 className={styles.quickAddTitle}>Add Products to Your Order</h3>
                  <p className={styles.quickAddSubtitle}>
                    Select any handcrafted blend to include in this delivery
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductsOpen(false)}
                  className={styles.quickAddCloseBtn}
                  aria-label="Close add products modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.quickAddCategoryFilter}>
                <button
                  type="button"
                  onClick={() => setQuickAddCategory('all')}
                  className={`${styles.filterPill} ${quickAddCategory === 'all' ? styles.filterPillActive : ''}`}
                >
                  All Blends ({PRODUCTS.length})
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setQuickAddCategory(cat.id)}
                    className={`${styles.filterPill} ${quickAddCategory === cat.id ? styles.filterPillActive : ''}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className={styles.quickAddProductList}>
                {filteredQuickAddProducts.map((prod) => {
                  const inCartItem = items.find((i) => i.product.id === prod.id);
                  const inCartQty = inCartItem ? inCartItem.quantity : 0;
                  return (
                    <div key={prod.id} className={styles.quickAddProductCard}>
                      <img
                        src={prod.images.primary}
                        alt={prod.name}
                        className={styles.quickAddThumb}
                      />
                      <div className={styles.quickAddInfo}>
                        <h4 className={styles.quickAddName}>{prod.name}</h4>
                        <div className={styles.quickAddMeta}>
                          <span>{prod.packSize}</span>
                          <span>•</span>
                          <span>{prod.productWeightGrams}g</span>
                        </div>
                        <div className={styles.quickAddPrice}>
                          {formatCurrency(prod.price)}
                        </div>
                      </div>

                      <div className={styles.quickAddAction}>
                        {inCartQty > 0 ? (
                          <div className={styles.quickAddInCartRow}>
                            <div className={styles.quickAddMiniStepper}>
                              <button
                                type="button"
                                onClick={() => updateQuantity(prod.id, inCartQty - 1)}
                                className={styles.miniStepperBtn}
                                aria-label={`Decrease quantity of ${prod.name}`}
                              >
                                <Minus size={11} />
                              </button>
                              <span className={styles.miniStepperVal}>{inCartQty}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(prod.id, inCartQty + 1)}
                                className={styles.miniStepperBtn}
                                aria-label={`Increase quantity of ${prod.name}`}
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            <span className={styles.inBagBadge}>In Bag</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              addItem(prod, 1);
                              setAddedNoticeId(prod.id);
                              setTimeout(() => setAddedNoticeId(null), 1200);
                            }}
                            className={styles.quickAddBtn}
                          >
                            <Plus size={13} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.quickAddFooter}>
                <div className={styles.quickAddTotalPreview}>
                  <span>Total in Basket: <strong>{items.reduce((s, i) => s + i.quantity, 0)} items</strong></span>
                  <span className={styles.quickAddGrandTotal}>{formatCurrency(checkoutTotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductsOpen(false)}
                  className={styles.quickAddDoneBtn}
                >
                  <span>Done Reviewing</span>
                  <Check size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}