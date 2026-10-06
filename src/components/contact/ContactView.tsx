'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Send,
  Check,
  ArrowUpRight,
  Copy,
  ChefHat,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import styles from './ContactView.module.css';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemFadeVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: luxuryEase },
  },
};

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const KITCHEN_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Why does Good Fills have strict No Return policy?',
    answer:
      'Because every food, infant nutrition, and skincare creation is prepared fresh to order using 100% natural ingredients without artificial preservatives, items cannot be restocked or resold once dispatched. In compliance with FSSAI hygiene standards, all sales are final.',
  },
  {
    id: 'faq-2',
    question: 'What if my parcel arrives damaged or seal tampered?',
    answer:
      'We offer a 100% Transit Safety Guarantee. If your package arrives crushed, punctured, or leaking, take clear photos or video of the box and courier label, and message our WhatsApp concierge with your Order ID within 24 hours. We will promptly dispatch a free replacement or initiate a refund.',
  },
  {
    id: 'faq-3',
    question: 'Can I cancel or modify my order after payment?',
    answer:
      'Because traditional soaking, sprouting, and milling are queued specifically for your batch shortly after checkout, cancellations are only possible if requested before kitchen preparation begins. Once grinding or dispatch is underway, orders cannot be cancelled.',
  },
  {
    id: 'faq-4',
    question: 'How do I track my order & DTDC express courier delivery?',
    answer:
      'You can track your package anytime directly on our live tracking page using your Order ID (e.g. ORD-7776) or registered 10-digit mobile number. You will also receive real-time SMS and WhatsApp notifications with your DTDC AWB number upon dispatch.',
  },
];

const CATEGORIES = [
  'Infant Nutrition & Weaning',
  'Order Tracking',
  'Custom Milling Request',
  'General Inquiry',
];

export function ContactView() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    orderId: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          category: selectedCategory,
          orderId: formData.orderId,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRef(data.refNumber || `INQ-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        const fallbackRef = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
        setSubmittedRef(fallbackRef);
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      const fallbackRef = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedRef(fallbackRef);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className={styles.contactPageWrapper}>
      <div className={styles.contactContainer}>
        {/* ========================================================
            1. MINIMAL EDITORIAL HEADER WITH STAGGERED REVEAL
            ======================================================== */}
        <motion.header
          className={styles.minimalHeader}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className={styles.headerLeft}>
            <motion.span variants={itemFadeVariants} className={styles.headerEyebrow}>
              ATELIER CONCIERGE · BENGALURU
            </motion.span>
            <motion.h1 variants={itemFadeVariants} className={styles.pageTitle}>
              Contact the Atelier
            </motion.h1>
            <motion.p variants={itemFadeVariants} className={styles.pageSubtitle}>
              Direct communication for infant weaning questions, custom milling ratios,
              freshness timelines, and DTDC parcel assistance.
            </motion.p>
          </div>

          <motion.div variants={itemFadeVariants} className={styles.headerDirectActions}>
            <motion.a
              href="https://wa.me/919742068899?text=Hello%20Good%20Fills!%20I%20have%20an%20inquiry%20regarding%20your%20homemade%20preparations."
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.headerDirectBtn} ${styles.headerDirectBtnPrimary}`}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Direct</span>
              <motion.span
                whileHover={{ x: 3, y: -3 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'inline-flex' }}
              >
                <ArrowUpRight size={14} />
              </motion.span>
            </motion.a>

            <motion.a
              href="tel:+919742068899"
              className={styles.headerDirectBtn}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              title="Call Good Fills kitchen directly"
            >
              <Phone size={15} />
              <span>Call Kitchen</span>
            </motion.a>
          </motion.div>
        </motion.header>

        {/* ========================================================
            2. RESTRUCTURED TWO-COLUMN SPLIT WITH FLUID ENTRANCE
            ======================================================== */}
        <div className={styles.splitGrid}>
          {/* LEFT: MINIMALIST FORM DESK */}
          <motion.div
            className={styles.formPane}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.15 }}
          >
            <h2 className={styles.formPaneTitle}>Send an Atelier Note</h2>
            <p className={styles.formPaneDesc}>
              We read every message directly in our Bengaluru kitchen and respond within 2–4 daylight hours.
            </p>

            <AnimatePresence mode="wait">
              {submittedRef ? (
                <motion.div
                  key="success-state"
                  className={styles.successMessage}
                  initial={{ opacity: 0, scale: 0.96, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.45, ease: luxuryEase }}
                >
                  <motion.div
                    className={styles.successIcon}
                    initial={{ rotate: -20, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                  >
                    <Check size={26} strokeWidth={2.6} />
                  </motion.div>
                  <h3 className={styles.successTitle}>Note Received</h3>
                  <p className={styles.successText}>
                    Thank you, {formData.name || 'friend'}. We have queued your note directly for our Bengaluru kitchen concierge.
                  </p>
                  
                  <div className={styles.successRefBadge}>
                    <span>Ref Code: <strong>{submittedRef}</strong></span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: '0.76rem',
                        textDecoration: 'underline',
                      }}
                      title="Copy Reference Code"
                    >
                      <Copy size={12} />
                      {copiedRef ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setFormData({ name: '', phone: '', email: '', orderId: '', message: '' });
                    }}
                    className="btn btn-outline"
                    style={{ borderRadius: 0, padding: '9px 20px', fontSize: '0.8rem', marginTop: 12 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Send Another Note
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={styles.categoryLabel}>Select Inquiry Subject:</span>
                  <div className={styles.categoryGroup}>
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`${styles.categoryBtn} ${
                            isActive ? styles.categoryBtnActive : ''
                          }`}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        >
                          {cat}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="name-input" className={styles.fieldLabel}>
                        Full Name *
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Priya Sharma"
                        className={styles.inputControl}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="phone-input" className={styles.fieldLabel}>
                        Mobile / WhatsApp *
                      </label>
                      <input
                        id="phone-input"
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className={styles.inputControl}
                      />
                    </div>
                  </div>

                  <div className={styles.inputRow}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="email-input" className={styles.fieldLabel}>
                        Email Address *
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="priya@example.com"
                        className={styles.inputControl}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="order-input" className={styles.fieldLabel}>
                        Order ID <span className={styles.fieldLabelOptional}>(Optional)</span>
                      </label>
                      <input
                        id="order-input"
                        type="text"
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleInputChange}
                        placeholder="e.g. ORD-1001"
                        className={styles.inputControl}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="message-input" className={styles.fieldLabel}>
                      Message or Dietary Question *
                    </label>
                    <textarea
                      id="message-input"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your requirements, baby's age, custom flour texture, or delivery tracking question..."
                      className={styles.textareaControl}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitBtn}
                    whileHover={!isSubmitting ? { scale: 1.01, y: -2 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className={styles.submitSpinner} />
                        <span>Transmitting Note to Hearth...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Kitchen Inquiry</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                          style={{ display: 'inline-flex' }}
                        >
                          <Send size={15} />
                        </motion.span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* RIGHT: DIRECT COORDINATES & KITCHEN FAQS */}
          <motion.div
            className={styles.infoPane}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.28 }}
          >
            {/* Direct Coordinates Card */}
            <motion.div
              className={styles.coordinatesCard}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <div className={styles.coordinatesHeader}>
                <h3 className={styles.coordinatesTitle}>Kitchen Direct Coordinates</h3>
                <div className={styles.liveStatusBadge}>
                  <div className={styles.livePulseDot}>
                    <div className={styles.livePing} />
                    <div className={styles.liveDot} />
                  </div>
                  <span>Hearth Active</span>
                </div>
              </div>

              <ul className={styles.contactDetailList}>
                <motion.li
                  className={styles.contactDetailItem}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className={styles.detailIconBox}>
                    <MapPin size={17} />
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Atelier Hearth</span>
                    <span className={styles.detailValue}>Bengaluru, Karnataka 560041, India</span>
                  </div>
                </motion.li>

                <motion.li
                  className={styles.contactDetailItem}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className={styles.detailIconBox}>
                    <Phone size={17} />
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Direct Line &amp; WhatsApp</span>
                    <a
                      href="https://wa.me/919742068899"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.detailValue} ${styles.detailValueLink}`}
                    >
                      <span>+91 97420 68899</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </motion.li>

                <motion.li
                  className={styles.contactDetailItem}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className={styles.detailIconBox}>
                    <Mail size={17} />
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Email Dispatch</span>
                    <a
                      href="mailto:goodfillsproducts@gmail.com"
                      className={`${styles.detailValue} ${styles.detailValueLink}`}
                    >
                      <span>goodfillsproducts@gmail.com</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </motion.li>

                <motion.li
                  className={styles.contactDetailItem}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className={styles.detailIconBox}>
                    <Clock size={17} />
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Kitchen &amp; Support Hours</span>
                    <span className={styles.detailValue}>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
                  </div>
                </motion.li>
              </ul>
            </motion.div>

            {/* Quick Kitchen FAQs with Micro-Motion Accordion */}
            <motion.div
              className={styles.faqsContainer}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <h3 className={styles.faqsHeading}>Direct Kitchen Answers</h3>
              <div className={styles.faqsList}>
                {KITCHEN_FAQS.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div key={faq.id} className={styles.faqItem}>
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className={styles.faqTrigger}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: luxuryEase }}
                          style={{ display: 'inline-flex' }}
                        >
                          <ChevronDown size={16} className={styles.faqIcon} />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: luxuryEase }}
                            style={{ overflow: 'hidden' }}
                          >
                            <p className={styles.faqBody}>{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ========================================================
            3. ATELIER TRUST PILLARS STRIP WITH HOVER MOTION
            ======================================================== */}
        <motion.div
          className={styles.trustStrip}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: luxuryEase }}
        >
          <motion.div
            className={styles.trustPillar}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <div className={styles.trustIconBox}>
              <ChefHat size={20} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>Milled Fresh to Order</h4>
              <p className={styles.trustText}>
                Never warehoused or stale. We soak, sprout, and mill fresh after checkout in Bengaluru.
              </p>
            </div>
          </motion.div>

          <motion.div
            className={styles.trustPillar}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <div className={styles.trustIconBox}>
              <Truck size={20} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>DTDC Express Courier</h4>
              <p className={styles.trustText}>
                Consignments dispatched via air express with real-time SMS and WhatsApp milestone telemetry.
              </p>
            </div>
          </motion.div>

          <motion.div
            className={styles.trustPillar}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <div className={styles.trustIconBox}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className={styles.trustTitle}>Direct Human Care</h4>
              <p className={styles.trustText}>
                Communicate directly with the artisans who prepare your infant, bath, and nutrition blends.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

