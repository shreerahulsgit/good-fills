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
} from 'lucide-react';
import styles from './ContactView.module.css';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const KITCHEN_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How fast is my order stone-milled and dispatched?',
    answer:
      'We never warehouse finished stock. We soak, sprout, and cold-stone mill in micro-batches in Bengaluru within 24–48 hours of checkout, sealing every pouch warm before handing it to DTDC express.',
  },
  {
    id: 'faq-2',
    question: 'Can I request custom grinding fineness or grain exclusion?',
    answer:
      'Yes. You can contact us immediately on WhatsApp with your Order ID to request custom flour fineness (ultra-fine for initial infant weaning vs textured for toddlers) or exclude specific seeds.',
  },
  {
    id: 'faq-3',
    question: 'How do I track my DTDC courier delivery?',
    answer:
      'As soon as your package is dispatched from our atelier, DTDC assigns a consignment tracking number. An SMS and WhatsApp alert is sent to your mobile with a live tracking link.',
  },
];

const CATEGORIES = [
  'Infant Nutrition & Weaning',
  'Order Status & DTDC Courier',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const ref = `GF-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedRef(ref);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className={styles.contactPageWrapper}>
      <div className={styles.contactContainer}>
        {/* ========================================================
            1. MINIMAL EDITORIAL HEADER (NO PUFFY HEROES)
            ======================================================== */}
        <header className={styles.minimalHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEyebrow}>
              ATELIER CONCIERGE · BENGALURU
            </span>
            <h1 className={styles.pageTitle}>
              Contact the Atelier
            </h1>
            <p className={styles.pageSubtitle}>
              Direct communication for infant weaning questions, custom stone-milling ratios,
              freshness timelines, and DTDC parcel assistance.
            </p>
          </div>

          <div className={styles.headerDirectActions}>
            <a
              href="https://wa.me/919742068899?text=Hello%20Good%20Fills!%20I%20have%20an%20inquiry%20regarding%20your%20homemade%20preparations."
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.headerDirectBtn} ${styles.headerDirectBtnPrimary}`}
            >
              <MessageCircle size={16} />
              <span>WhatsApp Direct</span>
              <ArrowUpRight size={14} />
            </a>

            <a href="tel:+919742068899" className={styles.headerDirectBtn}>
              <Phone size={15} />
              <span>+91 97420 68899</span>
            </a>
          </div>
        </header>

        {/* ========================================================
            2. RESTRUCTURED TWO-COLUMN SPLIT
            ======================================================== */}
        <div className={styles.splitGrid}>
          {/* LEFT: MINIMALIST FORM DESK */}
          <div className={styles.formPane}>
            <h2 className={styles.formPaneTitle}>Send an Atelier Note</h2>
            <p className={styles.formPaneDesc}>
              We read every message directly in our Bengaluru kitchen and respond within 2–4 daylight hours.
            </p>

            {submittedRef ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <Check size={22} />
                </div>
                <h3 className={styles.successTitle}>Note Received</h3>
                <p className={styles.successText}>
                  Thank you, {formData.name || 'friend'}. Reference code: <strong>{submittedRef}</strong>.
                  Our team will reach out via WhatsApp or Email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedRef(null);
                    setFormData({ name: '', phone: '', email: '', orderId: '', message: '' });
                  }}
                  className="btn btn-outline"
                  style={{ borderRadius: 0, padding: '8px 18px', fontSize: '0.8rem', marginTop: 8 }}
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <span className={styles.categoryLabel}>Subject:</span>
                <div className={styles.categoryGroup}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`${styles.categoryBtn} ${
                        selectedCategory === cat ? styles.categoryBtnActive : ''
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
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

                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? (
                    <span>Sending Note...</span>
                  ) : (
                    <>
                      <span>Submit Kitchen Inquiry</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: DIRECT COORDINATES & KITCHEN FAQS */}
          <div className={styles.infoPane}>
            <div className={styles.coordinatesCard}>
              <h3 className={styles.coordinatesTitle}>Kitchen Direct Coordinates</h3>
              <ul className={styles.contactDetailList}>
                <li className={styles.contactDetailItem}>
                  <MapPin size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Atelier Hearth</span>
                    <span className={styles.detailValue}>Bengaluru, Karnataka 560041, India</span>
                  </div>
                </li>

                <li className={styles.contactDetailItem}>
                  <MessageCircle size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>WhatsApp Concierge</span>
                    <a
                      href="https://wa.me/919742068899"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.detailValue} ${styles.detailValueLink}`}
                    >
                      +91 97420 68899
                    </a>
                  </div>
                </li>

                <li className={styles.contactDetailItem}>
                  <Mail size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Email Dispatch</span>
                    <a
                      href="mailto:goodfillsproducts@gmail.com"
                      className={`${styles.detailValue} ${styles.detailValueLink}`}
                    >
                      goodfillsproducts@gmail.com
                    </a>
                  </div>
                </li>

                <li className={styles.contactDetailItem}>
                  <Clock size={18} className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Kitchen &amp; Support Hours</span>
                    <span className={styles.detailValue}>Monday – Saturday: 9:00 AM – 7:00 PM IST</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Kitchen FAQs */}
            <div className={styles.faqsContainer}>
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
                        <ChevronDown
                          size={16}
                          className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: luxuryEase }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
