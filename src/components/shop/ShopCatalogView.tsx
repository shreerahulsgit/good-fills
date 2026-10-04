'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Check,
  SlidersHorizontal,
  Clock,
  Truck,
  ShieldCheck,
  X,
  ArrowRight,
  Leaf,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { useCart } from '@/lib/cart-context';
import { Product, ProductCategory } from '@/types';

const luxuryEase = [0.16, 1, 0.3, 1] as const;

interface ShopCatalogViewProps {
  initialCategory?: ProductCategory | 'all';
  initialProducts?: Product[];
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export function ShopCatalogView({ initialCategory = 'all', initialProducts }: ShopCatalogViewProps) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const [productsList, setProductsList] = useState<Product[]>(initialProducts || PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Sync if initialCategory changes from route
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Revalidate live products from server API
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.error('Error refreshing live products:', err));
  }, []);

  const categoryTabs = useMemo(() => [
    { id: 'all' as const, label: 'All Creations', count: productsList.length },
    { id: 'baby-kids' as const, label: 'Baby & Kids', count: productsList.filter((p) => p.category === 'baby-kids').length },
    {
      id: 'nutrition-wellness' as const,
      label: 'Nutrition & Wellness',
      count: productsList.filter((p) => p.category === 'nutrition-wellness').length,
    },
    { id: 'skin-bath' as const, label: 'Skin & Bath', count: productsList.filter((p) => p.category === 'skin-bath').length },
    {
      id: 'pantry-beverages' as const,
      label: 'Pantry & Beverages',
      count: productsList.filter((p) => p.category === 'pantry-beverages').length,
    },
  ], [productsList]);

  const activeCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort order
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [productsList, selectedCategory, sortBy]);

  const handleTabChange = (catId: 'all' | ProductCategory) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      router.push('/shop', { scroll: false });
    } else {
      router.push(`/shop/${catId}`, { scroll: false });
    }
  };

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1400);
    openCart();
  };

  return (
    <div className="shop-page-wrapper">
      <div className="container">
        {/* Breadcrumb Trail — Grounded & stable */}
        <nav className="shop-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" className="shop-breadcrumb-link">
            Home
          </Link>
          <span className="shop-breadcrumb-sep">/</span>
          <Link href="/shop" className="shop-breadcrumb-link">
            Shop
          </Link>
          {activeCategoryInfo && (
            <>
              <span className="shop-breadcrumb-sep">/</span>
              <span className="shop-breadcrumb-current">{activeCategoryInfo.name}</span>
            </>
          )}
        </nav>

        {/* Editorial Grand Header — Reduced animation, grounded & clean */}
        <div className="shop-editorial-header">
          <div className="shop-eyebrow-row">
            <span className="eyebrow">THE ARTISANAL CATALOG</span>
            <span className="shop-header-dot">•</span>
            <span className="shop-provenance-tag">BENGALURU ATELIER</span>
          </div>

          <h1 className="shop-page-title">
            {activeCategoryInfo ? activeCategoryInfo.name : 'All Handcrafted Creations'}
          </h1>

          <p className="shop-page-desc">
            {activeCategoryInfo
              ? activeCategoryInfo.description
              : 'Every single product is prepared strictly to order in our Bengaluru kitchen. Zero warehouse stockpiling, zero artificial additives, and a natural 6-month shelf life.'}
          </p>
        </div>
      </div>

      {/* Sticky Category Navigator — Clean, pure category tabs */}
      <div className="shop-sticky-bar">
        <div className="container">
          <div className="shop-toolbar-inner">
            <div className="shop-tabs-scroll-area">
              <div className="shop-tabs-pill-track">
                {categoryTabs.map((tab) => {
                  const isActive = tab.id === selectedCategory;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`shop-tab-pill ${isActive ? 'is-active' : ''}`}
                    >
                      <span className="shop-tab-label">{tab.label}</span>
                      <span className="shop-tab-counter">{tab.count}</span>

                      {isActive && (
                        <motion.div
                          layoutId="activeShopPill"
                          className="shop-tab-active-indicator"
                          transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Dynamic Category Manifesto Card (When a Category is Active) */}
        <AnimatePresence mode="wait">
          {activeCategoryInfo && (
            <motion.div
              key={activeCategoryInfo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: luxuryEase }}
              className="shop-category-manifesto"
            >
              <div className="manifesto-left">
                <span className="manifesto-eyebrow">FAMILY PHILOSOPHY</span>
                <p className="manifesto-tagline">&ldquo;{activeCategoryInfo.tagline}&rdquo;</p>
              </div>

              <div className="manifesto-right">
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className="manifesto-reset-btn"
                >
                  <span>View All Categories</span>
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Metadata Bar — SORT FEATURE BROUGHT DOWN HERE */}
        <div className="shop-meta-strip">
          <div className="shop-meta-left">
            <span className="shop-meta-count">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{productsList.length}</strong> creations
            </span>
          </div>

          <div className="shop-meta-right">
            {/* Sort Dropdown Brought Down Here */}
            <div className="shop-sort-box">
              <SlidersHorizontal size={13} className="shop-sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="shop-sort-select"
                aria-label="Sort creations"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid with Fluid Layout Animations */}
        <motion.div layout className="shop-products-grid">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const isAdded = addedId === product.id;
              const ingredientHighlights =
                product.ingredients && product.ingredients.length > 0
                  ? product.ingredients.slice(0, 3).join(' • ')
                  : null;

              return (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: luxuryEase }}
                  whileHover={{ y: -6 }}
                  className="product-card group"
                >
                  <Link href={`/product/${product.slug}`} className="product-card-link">
                    {/* Image Frame */}
                    <div className="product-image-wrap">
                      <img
                        src={product.images.primary}
                        alt={product.name}
                        className="product-img"
                        loading="lazy"
                      />

                      {/* Weight Chip */}
                      <div className="product-badge-size">
                        <span>{product.packSize}</span>
                      </div>

                      {/* Availability status badge */}
                      {product.availability === 'sold-out' ? (
                        <div className="product-badge-made" style={{ backgroundColor: 'rgba(220, 38, 38, 0.95)', color: '#FFFFFF' }}>
                          <span>Sold Out</span>
                        </div>
                      ) : product.availability === 'temporarily-unavailable' ? (
                        <div className="product-badge-made" style={{ backgroundColor: 'rgba(217, 119, 6, 0.95)', color: '#FFFFFF' }}>
                          <span>Temp. Unavailable</span>
                        </div>
                      ) : product.availability === 'coming-soon' ? (
                        <div className="product-badge-made" style={{ backgroundColor: 'rgba(37, 99, 235, 0.95)', color: '#FFFFFF' }}>
                          <span>Coming Soon</span>
                        </div>
                      ) : product.madeToOrder ? (
                        <div className="product-badge-made">
                          <span className="badge-made-dot" />
                          <span>Made to Order</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Information Body */}
                    <div className="product-info">
                      <div className="product-meta-row">
                        <span className="product-category-label">
                          {product.category.replace('-', ' & ')}
                        </span>
                      </div>

                      <h3 className="product-name">{product.name}</h3>

                      <p className="product-desc">{product.shortDescription}</p>

                      {/* Ingredient Preview Strip */}
                      {ingredientHighlights && (
                        <div className="product-ingredients-preview">
                          <Leaf size={11} strokeWidth={2} className="ing-leaf-icon" />
                          <span className="ing-text">{ingredientHighlights}</span>
                        </div>
                      )}

                      {/* Price & Action Row */}
                      <div className="product-price-row">
                        <div className="product-price-block">
                          <div className="product-price-wrap">
                            <span className="product-currency">₹</span>
                            <span className="product-amount">{product.price}</span>
                          </div>
                          <span className="product-weight-sub">per {product.packSize}</span>
                        </div>

                        {/* Action Button: Live stock aware */}
                        {product.availability && product.availability !== 'available' ? (
                          <button
                            type="button"
                            disabled
                            className="product-add-btn"
                            style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#9CA3AF' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <span>
                              {product.availability === 'sold-out'
                                ? 'Sold Out'
                                : product.availability === 'coming-soon'
                                ? 'Coming Soon'
                                : 'Unavailable'}
                            </span>
                          </button>
                        ) : (
                          <motion.button
                            type="button"
                            onClick={(e) => handleAdd(e, product)}
                            className={`product-add-btn ${isAdded ? 'btn-added' : ''}`}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                            aria-label={`Add ${product.name} to bag`}
                          >
                            {isAdded ? (
                              <>
                                <Check size={14} strokeWidth={2.5} />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} strokeWidth={2} />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State (If filter yields no results) */}
        {filteredProducts.length === 0 && (
          <div className="shop-empty-state">
            <h3 className="empty-title">No creations found in this category</h3>
            <p className="empty-desc">Explore our complete catalog of 13 homemade food, nutrition, and bath essentials.</p>
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className="empty-reset-btn"
            >
              <span>View All Creations</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Bottom Trust & Provenance Bar */}
        <div className="shop-bottom-trust">
          <div className="shop-trust-item">
            <div className="shop-trust-icon-box">
              <Clock size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="shop-trust-title">Made to Order</h4>
              <p className="shop-trust-desc">Batches are milled and roasted only after checkout — never stored in warehouses.</p>
            </div>
          </div>

          <div className="shop-trust-item">
            <div className="shop-trust-icon-box">
              <Truck size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="shop-trust-title">DTDC Pan-India</h4>
              <p className="shop-trust-desc">Transparent weight rates (₹100/500g) with live consignment SMS tracking.</p>
            </div>
          </div>

          <div className="shop-trust-item">
            <div className="shop-trust-icon-box">
              <Leaf size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="shop-trust-title">6-Month Freshness</h4>
              <p className="shop-trust-desc">Sealed warm in barrier pouches without chemical preservatives or artificial aromas.</p>
            </div>
          </div>

          <div className="shop-trust-item">
            <div className="shop-trust-icon-box">
              <ShieldCheck size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h4 className="shop-trust-title">FSSAI Registered</h4>
              <p className="shop-trust-desc">Prepared strictly adhering to traditional hygiene and safety compliance in Bengaluru.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
