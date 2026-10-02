'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/shipping';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const filtered = PRODUCTS.filter(product => {
      const matchName = product.name.toLowerCase().includes(trimmed);
      const matchCategory = product.category.toLowerCase().includes(trimmed);
      const matchDesc = product.shortDescription.toLowerCase().includes(trimmed);
      const matchIngredients = product.ingredients.some(ing => ing.toLowerCase().includes(trimmed));
      return matchName || matchCategory || matchDesc || matchIngredients;
    });

    setResults(filtered);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(26, 24, 22, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-12) var(--space-4)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-hairline)',
          boxShadow: '0 24px 48px -12px rgba(26, 24, 22, 0.18)',
          overflow: 'hidden'
        }}
      >
        {/* Search Input Bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--border-hairline)',
            gap: 'var(--space-4)'
          }}
        >
          <Search size={22} style={{ color: 'var(--accent-terracotta)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search homemade products, ingredients (e.g. ragi, honey, coffee)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              background: 'transparent'
            }}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              style={{ color: 'var(--text-muted)', padding: '4px' }}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <button 
            onClick={onClose}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            Esc
          </button>
        </div>

        {/* Results / Default State Container */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: 'var(--space-6)' }}>
          {query.trim() === '' ? (
            <div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span className="eyebrow" style={{ marginBottom: 'var(--space-2)' }}>
                  Popular Inquiries
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                  {['Ragi', 'Filter Coffee', 'ImmuniTea', 'Bath Powder', 'Protein', 'Honey', 'Ubtan'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.88rem',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--text-primary)',
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hairline-divider" style={{ margin: 'var(--space-6) 0' }} />

              <div>
                <span className="eyebrow">Explore Categories</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.id}`}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-3) var(--space-4)',
                        backgroundColor: 'var(--bg-canvas)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-hairline)',
                        fontSize: '0.92rem',
                        fontWeight: 500
                      }}
                    >
                      <span>{cat.name}</span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                Found {results.length} handcrafted {results.length === 1 ? 'product' : 'products'}:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {results.map(prod => (
                  <Link
                    key={prod.id}
                    href={`/products/${prod.slug}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-hairline)',
                      backgroundColor: 'var(--bg-canvas)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-terracotta)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-hairline)')}
                  >
                    <img 
                      src={prod.images.primary} 
                      alt={prod.name} 
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-xs)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{prod.name}</h4>
                        <span className="badge" style={{ fontSize: '0.7rem' }}>{prod.packSize}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 0' }}>
                        {prod.shortDescription}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                        {formatCurrency(prod.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                No homemade products matching &ldquo;{query}&rdquo;
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                Try searching for ingredients like &ldquo;ragi&rdquo;, &ldquo;turmeric&rdquo;, or &ldquo;coffee&rdquo;, or explore our 4 core categories.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="btn btn-primary"
                style={{ display: 'inline-flex' }}
              >
                Browse All 13 Products <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
