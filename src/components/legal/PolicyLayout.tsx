'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  MessageCircle, 
  ArrowRight 
} from 'lucide-react';
import styles from './PolicyLayout.module.css';

export type PolicyKey = 'shipping' | 'refund' | 'privacy' | 'terms';

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  activePolicy?: PolicyKey;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function PolicyLayout({
  title,
  subtitle,
  activePolicy,
  children,
}: PolicyLayoutProps) {

  return (
    <div className={styles.policyPageWrapper}>
      <div className={styles.policyContainer}>

        {/* 3. HERO TITLE BLOCK */}
        <div className={styles.heroBlock}>
          <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: title }} />
          <p className={styles.heroLead}>{subtitle}</p>
        </div>

        {/* 4. MAIN ARTICLE CONTENT */}
        <article className={`${styles.policyArticle} ${activePolicy === 'shipping' ? styles.shippingPolicyArticle : ''}`}>
          {children}
        </article>

        {/* 5. ATELIER CONCIERGE HELP CARD */}
        {activePolicy !== 'shipping' && <section className={styles.supportCard}>
          <div className={styles.supportLeft}>
            <div className={styles.supportEyebrow}>
              <ShieldCheck size={13} />
              <span>Grievance &amp; Concierge Desk</span>
            </div>
            <h3 className={styles.supportTitle}>Questions Regarding Our Atelier Policies?</h3>
            <p className={styles.supportDesc}>
              Reach our Bengaluru kitchen directly via WhatsApp or email. We are available Monday to Saturday, 9:00 AM – 7:00 PM IST.
            </p>
          </div>

          <div className={styles.supportActions}>
            <a
              href="https://wa.me/919742068899?text=Hello%20Good%20Fills,%20I%20have%20a%20question%20regarding%20an%20atelier%20policy."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <MessageCircle size={15} />
              <span>WhatsApp Concierge</span>
            </a>

            <Link href="/contact-us" className={styles.contactPageBtn}>
              <span>Contact Page</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>}
      </div>
    </div>
  );
}
