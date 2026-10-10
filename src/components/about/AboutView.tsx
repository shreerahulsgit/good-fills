'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  Droplets,
  Flame,
  LucideIcon,
} from 'lucide-react';
import styles from './AboutView.module.css';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

// 4 Traditional Kitchen Steps with clear, easy-to-understand explanations
interface RitualItem {
  id: string;
  step: string;
  tabLabel: string;
  ghostNum: string;
  title: string;
  description: string;
  image: string;
  benefit: string;
  icon: LucideIcon;
}

const RITUALS: RitualItem[] = [
  {
    id: 'ritual-01',
    step: 'STEP 01',
    tabLabel: '01 Washing & Soaking',
    ghostNum: '01',
    title: 'Triple-Washing & 12-Hour Soaking',
    description:
      'We wash every grain and pulse three times in clean water and soak them for 12 full hours. Soaking softens the grains naturally, breaks down heavy starches, and makes them very gentle on your baby’s little tummy—preventing colic and gas.',
    image: '/images/story/ritual-01-washing.jpg',
    benefit: 'Easy to Digest • Gentle on Baby’s Tummy',
    icon: Droplets,
  },
  {
    id: 'ritual-02',
    step: 'STEP 02',
    tabLabel: '02 Natural Sprouting',
    ghostNum: '02',
    title: '48-Hour Natural Cotton Sprouting',
    description:
      'We tie the soaked grains in clean, soft cotton cloth and let them sprout naturally for two days. Sprouting brings grains to life—naturally multiplying calcium, iron, and essential vitamins so your child gets real, wholesome nourishment.',
    image: '/images/story/ritual-02-sprouting.jpg',
    benefit: 'Boosts Natural Calcium & Iron • Rich in Living Vitamins',
    icon: Leaf,
  },
  {
    id: 'ritual-03',
    step: 'STEP 03',
    tabLabel: '03 Open Sun-Drying',
    ghostNum: '03',
    title: 'Sun-Drying Under Bengaluru Sun',
    description:
      'We spread the sprouted grains over clean cotton sheets to dry naturally under the open sun. We never use high-heat electric dryers that destroy vitamins and natural flavors. Slow sun-drying preserves the rich, traditional taste.',
    image: '/images/story/ritual-03-sundrying.jpg',
    benefit: 'Preserves Natural Nutrients • Authentic Homemade Taste',
    icon: Sun,
  },
  {
    id: 'ritual-04',
    step: 'STEP 04',
    tabLabel: '04 Roasting & Milling',
    ghostNum: '04',
    title: 'Slow Iron Roasting & Gentle Milling',
    description:
      'We slow-roast each batch in heavy iron pans on a gentle flame until fragrant, then mill them to a fine, digestible texture. Milling at low temperatures keeps all the natural fiber, healthy oils, and nutrients completely safe.',
    image: '/images/story/ritual-04-roasting-milling.jpg',
    benefit: 'Gently Milled • Zero Heat Damage',
    icon: Flame,
  },
];

// 4 Natural Ingredients matching the Good Fills catalog
const INGREDIENTS = [
  {
    name: 'Sprouted Ragi & Ancient Grains',
    region: 'Sprouted for Strong Bones',
    description:
      'Heirloom ragi and wholesome grains, naturally sprouted and sun-dried for easy digestion and healthy baby growth.',
    image: '/images/story/ingredient-ragi.jpg',
  },
  {
    name: 'Pure Mountain Honey',
    region: '100% Pure & Raw',
    description:
      'Single-origin pure honey with natural aroma and deep golden color. 100% natural, unheated, with zero added sugar.',
    image: '/images/story/ingredient-honey.jpg',
  },
  {
    name: 'Pure Sandalwood & Wild Turmeric',
    region: 'Soothing Natural Bath Care',
    description:
      'Real sandalwood, wild turmeric, white turmeric, and sun-dried rose petals for soft, soap-free, calming skincare.',
    image: '/images/story/ingredient-turmeric.jpg',
  },
  {
    name: 'Tree Nuts & Wholesome Power Seeds',
    region: 'Daily Energy & Growth',
    description:
      'Whole almonds, walnuts, pistachios, cashews, and power seeds, lightly sweetened with traditional rock candy (Kempu Kallsakre).',
    image: '/images/story/ingredient-nuts-seeds.jpg',
  },
];

export function AboutView() {
  const [activeRitualIndex, setActiveRitualIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const ritualsSectionRef = useRef<HTMLElement>(null);

  const nextRitual = useCallback(() => {
    setActiveRitualIndex((prev) => (prev + 1) % RITUALS.length);
  }, []);

  const prevRitual = useCallback(() => {
    setActiveRitualIndex((prev) => (prev - 1 + RITUALS.length) % RITUALS.length);
  }, []);

  // Start auto-advance only after the ritual section becomes visible.
  useEffect(() => {
    const section = ritualsSectionRef.current;
    if (!section || isPaused) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !timer) {
          timer = setInterval(nextRitual, 7500);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [isPaused, nextRitual]);

  const activeRitual = RITUALS[activeRitualIndex];
  const ActiveIcon = activeRitual.icon;

  return (
    <div className={styles.aboutPageWrapper}>
      {/* ========================================================
          CHAPTER 01: OUR STORY — ALANKRUTHA & GOOD FILLS
          ======================================================== */}
      <section className={styles.storyHeroSection}>
        <div className="container">
          <div className={styles.storyHeroGrid}>
            {/* Left Column: Focused, Clean Narrative */}
            <div className={styles.storyNarrativeCol}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: luxuryEase }}
              >
                <span className={styles.sectionEyebrow}>OUR STORY • EST. 2016 • BENGALURU</span>
                <h1 className={styles.sectionHeading}>
                  Alankrutha: A Pioneer in Homemade Food.
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: luxuryEase, delay: 0.12 }}
              >
                <p className={styles.narrativeLead}>
                  In an era when supermarket shelves filled with mass-manufactured cereals loaded with chemical preservatives and artificial additives, Alankrutha founded Good Fills in Bengaluru—reviving the time-honored, wholesome kitchen foods grandmothers once lovingly prepared for newborn babies and young children.
                </p>
              </motion.div>

              {/* Founder's Authentic Quote */}
              <motion.div
                className={styles.calloutQuote}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: luxuryEase, delay: 0.22 }}
              >
                &ldquo;When my daughter was young, I looked everywhere for genuinely pure baby products. Finding none, I asked myself: &lsquo;Why shouldn’t I prepare them myself?&rsquo; That simple thought began Good Fills.&rdquo;
                <span className={styles.quoteAuthor}>— Alankrutha, Founder</span>
              </motion.div>

              <motion.div
                className={styles.heroActionRow}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: luxuryEase, delay: 0.3 }}
              >
                <Link href="/shop" className={styles.heroShopCta}>
                  <span>Explore Kitchen Preparations</span>
                  <ArrowRight size={15} />
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Full Newspaper Exhibit Frame */}
            <motion.div
              className={styles.newspaperExhibitCol}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, ease: luxuryEase, delay: 0.18 }}
            >
              <div className={styles.newspaperCard}>
                <div className={styles.newspaperHeaderBar}>
                  <span className={styles.newspaperHeaderTag}>REGIONAL PRESS ARCHIVE</span>
                  <span className={styles.newspaperHeaderMeta}>BENGALURU</span>
                </div>
                <div className={styles.newspaperImageWrapper}>
                  <img
                    src="/images/story/about-hero-editorial.jpg"
                    alt="Alankrutha featured in regional press - Pioneer in homemade food"
                    className={styles.newspaperFullImage}
                  />
                </div>
                <p className={styles.newspaperCaption}>
                  Original regional press article featuring founder Alankrutha and<br></br>Good Fills&apos; homemade philosophy.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CHAPTER 02: THE 4 TRADITIONAL STEPS
          ======================================================== */}
      <section
        ref={ritualsSectionRef}
        className={styles.ritualsSection}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container">
          <div className={styles.centerHeader}>
            <span className={styles.sectionEyebrow}>HOW WE MAKE OUR PRODUCTS</span>
            <h2 className={styles.sectionHeading}>Our 4 Traditional Kitchen Steps</h2>
            <p className={styles.narrativeText}>
              Real nourishment comes from care, patience, and traditional wisdom. Every Good Fills product
              goes through these four simple, time-tested steps:
            </p>
          </div>

          {/* Interactive Featured Spotlight Card */}
          <div className={styles.spotlightCard}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRitual.id + '-visual'}
                className={styles.spotlightVisualSide}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.65, ease: luxuryEase }}
              >
                <img
                  src={activeRitual.image}
                  alt={activeRitual.title}
                  className={styles.spotlightImg}
                />
                <span className={styles.spotlightOverlayPill}>
                  {activeRitual.step} OF 04
                </span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeRitual.id + '-content'}
                className={styles.spotlightContentSide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: luxuryEase }}
              >
                <span className={styles.ghostNumWatermark}>{activeRitual.ghostNum}</span>
                <span className={styles.spotlightStepEyebrow}>{activeRitual.step}</span>
                <h3 className={styles.spotlightTitle}>{activeRitual.title}</h3>
                <p className={styles.spotlightDesc}>{activeRitual.description}</p>

                <div className={styles.spotlightBenefitTag}>
                  <ActiveIcon size={16} />
                  <span>{activeRitual.benefit}</span>
                </div>

                {/* Next / Prev Controls & Pips */}
                <div className={styles.spotlightControls}>
                  <button
                    type="button"
                    onClick={prevRitual}
                    className={styles.navArrowBtn}
                    aria-label="Previous step"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div className={styles.pipIndicators}>
                    {RITUALS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveRitualIndex(idx)}
                        className={`${styles.pip} ${
                          activeRitualIndex === idx ? styles.pipActive : ''
                        }`}
                        aria-label={`Go to step ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextRitual}
                    className={styles.navArrowBtn}
                    aria-label="Next step"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4-Card Overview Grid Below Spotlight */}
          <div className={styles.ritualsGrid}>
            {RITUALS.map((ritual, idx) => (
              <motion.div
                key={ritual.id}
                onClick={() => setActiveRitualIndex(idx)}
                className={`${styles.miniRitualCard} ${
                  activeRitualIndex === idx ? styles.miniRitualCardActive : ''
                }`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: luxuryEase, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={styles.miniThumbWrapper}>
                  <img
                    src={ritual.image}
                    alt={ritual.title}
                    className={styles.miniThumb}
                  />
                </div>
                <div className={styles.miniCardBody}>
                  <span className={styles.miniStepTag}>{ritual.step}</span>
                  <h4 className={styles.miniTitle}>{ritual.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4: COMPARISON (SUPERMARKET VS GOOD FILLS)
          ======================================================== */}
      <section className={styles.comparisonSection}>
        <div className="container">
          <div className={styles.centerHeader}>
            <span className={styles.sectionEyebrow}>THE HONEST DIFFERENCE</span>
            <h2 className={styles.sectionHeading}>Supermarket Brands vs. Good Fills Homemade</h2>
            <p className={styles.narrativeText}>
              Every family deserves to know what goes into their food. Here is an honest look at how our
              fresh homemade method compares to commercial factory brands:
            </p>
          </div>

          <div className={styles.comparisonDeck}>
            {/* The Commercial Factory Standard */}
            <motion.div
              className={styles.factoryCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: luxuryEase, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardEyebrow}>COMMERCIAL BRANDS</span>
              </div>
              <h3 className={styles.cardTitle}>Factory Made</h3>

              <ul className={styles.comparisonList}>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>2-Year Shelf Life:</strong> Uses chemical preservatives and artificial stabilizers so products can sit on store shelves for years.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>High Factory Heat:</strong> Grains are blasted with extreme industrial heat, destroying natural vitamins and nutrients.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>Cheap Additives &amp; Fillers:</strong> Padded with refined maltodextrin, corn starch, and artificial flavoring to cut costs.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>Months in Warehouses:</strong> Boxes sit in godowns and transport hubs for months before you buy them.
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* The Good Fills Homemade Standard */}
            <motion.div
              className={styles.atelierCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: luxuryEase, delay: 0.25 }}
              whileHover={{ y: -4 }}
            >
              <div className={styles.cardTopRow}>
                <span className={styles.cardEyebrow} style={{ color: 'var(--accent-terracotta)' }}>
                  OUR PROMISE
                </span>
                <img src="/logo.png" alt="Good Fills" className={styles.atelierBadgeLogo} />
              </div>
              <h3 className={styles.cardTitle}>Freshly Homemade</h3>

              <ul className={styles.comparisonList}>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>Naturally Fresh for 6 Months:</strong> Kept fresh through clean, airtight food-grade pouches—100% natural with zero preservatives.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>Gentle Milling:</strong> Slow, traditional milling keeps grains cool, preserving natural fiber and nutrition.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>100% Real Food:</strong> Only pure grains, pulses, tree nuts, and herbs—zero refined sugars, chemicals, or fillers.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>Made Fresh After You Order:</strong> Prepared in Bengaluru only after your order is confirmed, then shipped straight to your door.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: INGREDIENTS
          ======================================================== */}
      <section className={styles.ingredientSection}>
        <div className="container">
          <div className={styles.centerHeader}>
            <span className={styles.sectionEyebrow}>100% PURE &amp; NATURAL</span>
            <h2 className={styles.sectionHeading}>Our Natural Ingredients</h2>
            <p className={styles.narrativeText}>
              Every Good Fills product starts with pure, traditional ingredients: heirloom grains,
              whole tree nuts, pure mountain honey, and sun-dried herbs—free from chemicals, additives, and factory shortcuts:
            </p>
          </div>

          <div className={styles.ingredientGrid}>
            {INGREDIENTS.map((item, idx) => (
              <motion.div
                key={item.name}
                className={styles.ingredientCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: luxuryEase, delay: idx * 0.12 }}
                whileHover={{ y: -8 }}
              >
                <div className={styles.ingredientImgBox}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.ingredientImg}
                  />
                </div>
                <div className={styles.ingredientBody}>
                  <span className={styles.ingredientRegion}>{item.region}</span>
                  <h3 className={styles.ingredientName}>{item.name}</h3>
                  <p className={styles.ingredientDesc}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
