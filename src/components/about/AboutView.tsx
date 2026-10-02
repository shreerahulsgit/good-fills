'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// 4 Sacred Kitchen Rituals with high-resolution bespoke local photography
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
    step: 'RITUAL 01',
    tabLabel: '01 Washing & Soaking',
    ghostNum: '01',
    title: 'Multi-Water Washing & 12h Soaking',
    description:
      'Every grain and pulse is triple-washed in fresh water and submerged in antique brass urulis for an unhurried 12-hour soak. This classical bio-process breaks down phytic acid and lectins, unlocking bioavailable nutrition and ensuring gentle, colic-free infant digestion.',
    image: '/images/story/ritual-01-washing.jpg',
    benefit: 'Neutralizes Phytic Acid • Colic-Free Infant Digestion',
    icon: Droplets,
  },
  {
    id: 'ritual-02',
    step: 'RITUAL 02',
    tabLabel: '02 48h Natural Sprouting',
    ghostNum: '02',
    title: '48-Hour Natural Muslin Sprouting',
    description:
      'Washed grains are bundled into clean, handwoven unbleached cotton muslin to sprout in quiet darkness. Natural germination awakens dormant plant enzymes, multiplying bioavailable calcium, dietary iron, and natural vitamin C by up to 300%.',
    image: '/images/story/ritual-02-sprouting.jpg',
    benefit: 'Multiplies Calcium & Iron • Active Living Enzymes',
    icon: Leaf,
  },
  {
    id: 'ritual-03',
    step: 'RITUAL 03',
    tabLabel: '03 Open-Air Sun-Drying',
    ghostNum: '03',
    title: 'Sun-Drying Under Open Bengaluru Skies',
    description:
      'Rather than using artificial electric dehydrators that cook out delicate volatile oils, our sprouted harvest is spread evenly over clean cotton sheets under the warm sun. Slow natural evaporation seals in the deep, malty flavor of heirloom millets.',
    image: '/images/story/ritual-03-sundrying.jpg',
    benefit: 'Zero Thermal Scorching • Locks in Volatile Aromas',
    icon: Sun,
  },
  {
    id: 'ritual-04',
    step: 'RITUAL 04',
    tabLabel: '04 Iron Roasting & Milling',
    ghostNum: '04',
    title: 'Cast-Iron Kadhai Roasting & Stone-Milling',
    description:
      'Batches are slow-roasted in heavy seasoned cast-iron kadhais over a gentle flame to release aromatics, then milled cool on traditional granite stone chakki wheels. Low-friction grinding preserves living nutrients without high-heat damage.',
    image: '/images/story/ritual-04-roasting-milling.jpg',
    benefit: 'Low-Friction Cold Grinding • Zero Heat Degradation',
    icon: Flame,
  },
];

// 4 Heritage Ingredients with bespoke local photography
const INGREDIENTS = [
  {
    name: 'Sprouted Ragi (Finger Millet)',
    region: 'Dryland Karnataka Farmers',
    description:
      'Heirloom red ragi, sprouted for 48 hours. Packed with 10× more bioavailable calcium than polished white rice.',
    image: '/images/story/ingredient-ragi.jpg',
  },
  {
    name: 'Wood-Pressed Marachekku Oils',
    region: 'Traditional Tamil Nadu Ghani',
    description:
      'Cold-pressed in slow-turning wooden vats without chemical refining, petroleum solvents, or destructive friction heat.',
    image: '/images/story/ingredient-oil.jpg',
  },
  {
    name: 'Wild Western Ghats Forest Honey',
    region: 'Sustainably Gathered Raw Nectar',
    description:
      'Unpasteurized raw amber nectar, retaining active botanical propolis, live digestive pollen, and wild floral enzymes.',
    image: '/images/story/ingredient-honey.jpg',
  },
  {
    name: 'Wild Kasturi Manjal & Sandalwood',
    region: 'Kerala Foothills & Mysore Roots',
    description:
      'Hand-ground non-staining wild turmeric and cooling red sandalwood roots for gentle botanical infant and maternal skincare.',
    image: '/images/story/ingredient-turmeric.jpg',
  },
];

export function AboutView() {
  const [activeRitualIndex, setActiveRitualIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextRitual = useCallback(() => {
    setActiveRitualIndex((prev) => (prev + 1) % RITUALS.length);
  }, []);

  const prevRitual = useCallback(() => {
    setActiveRitualIndex((prev) => (prev - 1 + RITUALS.length) % RITUALS.length);
  }, []);

  // Auto-advance spotlight every 7.5s, paused when hovering
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextRitual();
    }, 7500);
    return () => clearInterval(timer);
  }, [isPaused, nextRitual]);

  const activeRitual = RITUALS[activeRitualIndex];
  const ActiveIcon = activeRitual.icon;

  return (
    <div className={styles.aboutPageWrapper}>
      {/* ========================================================
          SECTION 1: THE ATELIER MANIFESTO HERO
          ======================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.heroAura} />
        <div className="container">
          <div className={styles.heroContent}>
            {/* Live Atelier Status Pill */}
            <motion.div
              className={styles.heroStatusPill}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: luxuryEase }}
            >
              <span className={styles.statusDot} />
              <span>Bengaluru Atelier · 100% Traditional Care · Made to Order</span>
            </motion.div>

            {/* Poetic Serif Headline */}
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: luxuryEase, delay: 0.12 }}
            >
              Before factory conveyor belts, food was made with{' '}
              <span className={styles.heroTitleEm}>memory, hands, and time.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: luxuryEase, delay: 0.24 }}
            >
              Good Fills was founded on a quiet, uncompromising pledge: to bring honest,
              homemade infant nutrition, heirloom millets, and Ayurvedic botanical care back to the
              everyday Indian family table—freshly prepared only after checkout.
            </motion.p>

            {/* Atelier Metric Strip with Square Silhouette */}
            <motion.div
              className={styles.statsRow}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: luxuryEase, delay: 0.36 }}
            >
              <div className={styles.statItem}>
                <span className={styles.statValue}>100%</span>
                <span className={styles.statLabel}>Made to Order</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>48h</span>
                <span className={styles.statLabel}>Sprouting Cycle</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>0%</span>
                <span className={styles.statLabel}>Preservatives</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>6 Mo</span>
                <span className={styles.statLabel}>Natural Freshness</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2: CHAPTER 01 — THE FOUNDER'S GENESIS
          ======================================================== */}
      <section className={styles.genesisSection}>
        <div className="container">
          <div className={styles.genesisGrid}>
            {/* Left Column: Narrative with Sequential Stagger */}
            <div className={styles.genesisNarrative}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: luxuryEase }}
              >
                <span className={styles.sectionEyebrow}>CHAPTER 01 · THE GENESIS</span>
                <h2 className={styles.sectionHeading}>
                  Walking Away from the Supermarket Aisle.
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: luxuryEase, delay: 0.15 }}
              >
                <p className={styles.narrativeText}>
                  When you walk down a typical baby food or health powder aisle today, you are looking
                  at the triumph of industrial logistics over life. Baby cereals and adult protein mixes
                  are engineered with maltodextrin bulking agents, anti-caking additives, and artificial
                  vanillin—designed to sit for 24 months in uncooled shipping containers.
                </p>
                <p className={styles.narrativeText} style={{ marginTop: 12 }}>
                  We asked ourselves a simple question: <em>When did feeding our children become an exercise in industrial shelf life?</em>
                </p>
              </motion.div>

              <motion.div
                className={styles.calloutQuote}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: luxuryEase, delay: 0.28 }}
              >
                &ldquo;If a recipe requires ingredients you cannot find in your grandmother’s kitchen, it does not belong in your home.&rdquo;
              </motion.div>

              <motion.p
                className={styles.narrativeText}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: luxuryEase, delay: 0.38 }}
              >
                That question gave birth to Good Fills. In our Bengaluru atelier, we abandoned the
                factory playbook entirely. We keep zero pre-packed inventory in warehouses. We wait for
                your order, soak the seeds, sprout the ragi, roast in small batches, and seal each pouch
                warm from the stone mill.
              </motion.p>
            </div>

            {/* Right Column: Square Architectural Visual Frame */}
            <motion.div
              className={styles.genesisVisualFrame}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: luxuryEase, delay: 0.2 }}
            >
              <img
                src="/images/story/genesis-kitchen.jpg"
                alt="Traditional Bengaluru kitchen atelier with earthen pots and fresh stone-ground grains"
                className={styles.genesisPhoto}
              />
              <motion.div
                className={styles.artisanBadgeOverlay}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className={styles.artisanText}>
                  Handcrafted in micro-batches adhering to FSSAI certified hygiene
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3: THE 4 SACRED RITUALS (SPOTLIGHT + CAROUSEL)
          ======================================================== */}
      <section
        className={styles.ritualsSection}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="container">
          <div className={styles.centerHeader}>
            <span className={styles.sectionEyebrow}>TIME-HONORED PREPARATION</span>
            <h2 className={styles.sectionHeading}>The 4 Sacred Kitchen Rituals</h2>
            <p className={styles.narrativeText}>
              Classical culinary Ayurveda understands that nourishment is determined by how an ingredient
              is treated. Every creation at Good Fills passes through these four uncompromising stages:
            </p>
          </div>

          {/* Interactive Stage Tabs */}
          <div className={styles.ritualTabsBar}>
            {RITUALS.map((ritual, idx) => (
              <button
                key={ritual.id}
                type="button"
                onClick={() => setActiveRitualIndex(idx)}
                className={`${styles.ritualTabBtn} ${
                  activeRitualIndex === idx ? styles.ritualTabBtnActive : ''
                }`}
              >
                <span className={styles.ritualTabNum}>0{idx + 1}</span>
                <span>{ritual.title.split('&')[0].trim()}</span>
              </button>
            ))}
          </div>

          {/* Interactive Featured Spotlight Card - Square Cut */}
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
                    aria-label="Previous ritual"
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
                        aria-label={`Go to ritual ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextRitual}
                    className={styles.navArrowBtn}
                    aria-label="Next ritual"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4-Card Overview Grid Below Spotlight - Square Mini Cards */}
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
          SECTION 4: THE TRANSPARENCY LEDGER (FACTORY VS ATELIER)
          ======================================================== */}
      <section className={styles.comparisonSection}>
        <div className="container">
          <div className={styles.centerHeader}>
            <span className={styles.sectionEyebrow}>THE TRANSPARENCY LEDGER</span>
            <h2 className={styles.sectionHeading}>Factory Standard vs. Good Fills Atelier</h2>
            <p className={styles.narrativeText}>
              We believe families deserve to know exactly how everyday food is made. Here is how our
              homemade preparation compares to commercial brand standards:
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
              <h3 className={styles.cardTitle}>Factory Standard</h3>

              <ul className={styles.comparisonList}>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>24-Month Shelf Life:</strong> Achieved through synthetic preservatives, chemical stabilizers, and BHA/BHT antioxidants.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>High-Heat Extrusion:</strong> Grains blasted through extreme industrial steam, destroying heat-sensitive vitamins and living enzymes.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>Bulking Fillers:</strong> Up to 40% maltodextrin, refined corn starch, and artificial vanilla flavoring added to pad margins.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <X size={18} className={styles.itemIconBad} />
                  <span>
                    <strong>Warehouse Stockpiling:</strong> Pallets sit in distributor hubs for months before reaching your grocery shelf.
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* The Good Fills Atelier Standard */}
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
                  OUR PHILOSOPHY
                </span>
                <span className={styles.atelierBadge}>GOOD FILLS</span>
              </div>
              <h3 className={styles.cardTitle}>Artisanal Atelier</h3>

              <ul className={styles.comparisonList}>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>6-Month Natural Freshness:</strong> Preserved purely through airtight, food-grade multi-layer barrier pouches—zero preservatives.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>Cold Stone-Milling:</strong> Slow, low-friction traditional milling preserves natural lipids, micronutrients, and delicate aromas.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>100% Whole Foods:</strong> Zero fillers, zero added refined sugars, zero synthetic fragrance, and zero emulsifiers.
                  </span>
                </li>
                <li className={styles.comparisonItem}>
                  <Check size={18} className={styles.itemIconGood} />
                  <span>
                    <strong>Freshly Made to Order:</strong> Prepared in Bengaluru only after your checkout and dispatched via DTDC express in 24–48 hours.
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5: INGREDIENT SANCTUARY (PURE 1:1 SQUARE PHOTOS)
          ======================================================== */}
      <section className={styles.ingredientSection}>
        <div className="container">
          <div className={styles.centerHeader}>
            <span className={styles.sectionEyebrow}>HERITAGE HARVEST</span>
            <h2 className={styles.sectionHeading}>The Ingredient Sanctuary</h2>
            <p className={styles.narrativeText}>
              Every creation begins at the source. We partner directly with organic farmer collectives
              and certified regional distillers across South India:
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
