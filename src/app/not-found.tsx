import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShoppingBag,
  ArrowRight,
  Home,
  Truck,
  Sparkles,
  Heart,
  Coffee,
  MessageCircle,
} from 'lucide-react';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found — Good Fills Atelier Bengaluru',
  description:
    'The requested artisanal recipe or page could not be found. Explore our fresh homemade porridge, bath powders, honey, and filter coffee.',
};

export default function NotFound() {
  return (
    <main className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.eyebrowTag}>
          <span className={styles.dot} />
          <span>Atelier Directory · Error 404</span>
        </div>

        <div className={styles.bigCode}>404</div>

        <h1 className={styles.title}>
          This Creation <em>Could Not Be Found.</em>
        </h1>

        <p className={styles.description}>
          The recipe or page you are looking for may have been moved, renamed, or is currently being prepared fresh in our Bengaluru workshop.
        </p>

        <div className={styles.actionRow}>
          <Link href="/shop" className={styles.primaryBtn}>
            <span>Explore All Creations</span>
            <ArrowRight size={15} />
          </Link>

          <Link href="/" className={styles.secondaryBtn}>
            <Home size={15} />
            <span>Return to Homepage</span>
          </Link>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerLabel}>Or Browse By Category</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.categoryGrid}>
          <Link href="/shop?category=baby-kids" className={styles.categoryCard}>
            <Heart size={20} className={styles.categoryIcon} />
            <span className={styles.categoryName}>Baby &amp; Kids</span>
            <span className={styles.categorySub}>Sprouted Cereals</span>
          </Link>

          <Link href="/shop?category=nutrition-wellness" className={styles.categoryCard}>
            <Sparkles size={20} className={styles.categoryIcon} />
            <span className={styles.categoryName}>Nutrition &amp; Wellness</span>
            <span className={styles.categorySub}>Herbal &amp; Protein</span>
          </Link>

          <Link href="/shop?category=skin-bath" className={styles.categoryCard}>
            <ShoppingBag size={20} className={styles.categoryIcon} />
            <span className={styles.categoryName}>Skin &amp; Bath</span>
            <span className={styles.categorySub}>Pure Ubtan &amp; Sandal</span>
          </Link>

          <Link href="/shop?category=pantry-beverages" className={styles.categoryCard}>
            <Coffee size={20} className={styles.categoryIcon} />
            <span className={styles.categoryName}>Pantry &amp; Beverages</span>
            <span className={styles.categorySub}>Mountain Honey &amp; Roast</span>
          </Link>
        </div>

        <div className={styles.supportFooter}>
          <span>Looking for a bespoke batch or custom recipe?</span>
          <a
            href="https://wa.me/919742068899?text=Hello%20Good%20Fills%20Atelier!%20I%20am%20looking%20for%20a%20product%20on%20your%20store."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.supportLink}
          >
            <MessageCircle size={14} />
            <span>Chat directly with Alankrutha on WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
}