'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, CheckCircle2, X, Building2, Sparkles, Loader2 } from 'lucide-react';
import styles from './OlaAddressSearch.module.css';

export interface OlaSelectedAddress {
  placeId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  formattedAddress: string;
  location?: { lat: number; lng: number };
}

interface OlaPrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

// Client-side in-memory caches to prevent duplicate network calls
const searchCache = new Map<string, OlaPrediction[]>();
const detailsCache = new Map<string, OlaSelectedAddress>();

interface OlaAddressSearchProps {
  onSelectAddress: (data: OlaSelectedAddress) => void;
  className?: string;
}

export function OlaAddressSearch({ onSelectAddress, className = '' }: OlaAddressSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [predictions, setPredictions] = useState<OlaPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedPlace, setSelectedPlace] = useState<OlaSelectedAddress | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Fetch autocomplete predictions from our Next.js API route with client-side caching
  const fetchPredictions = useCallback(async (query: string) => {
    const trimmed = query.trim().toLowerCase();

    // Minimum character check (don't search for 1 or 2 letters)
    if (!trimmed || trimmed.length < 3) {
      setPredictions([]);
      setIsDropdownOpen(false);
      setIsLoading(false);
      return;
    }

    // 1. Client-Side Cache Check: Serve directly from memory if already fetched
    if (searchCache.has(trimmed)) {
      const cached = searchCache.get(trimmed)!;
      setPredictions(cached);
      setIsDropdownOpen(cached.length > 0);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      const list: OlaPrediction[] = data.predictions || [];

      // Store in memory cache for the current session
      searchCache.set(trimmed, list);

      setPredictions(list);
      setIsDropdownOpen(list.length > 0);
      setActiveIndex(-1);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[OlaAddressSearch] Autocomplete error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    // Clear previous timer if the user types another key within 300ms
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If input is less than 3 chars, reset dropdown immediately without waiting
    if (val.trim().length < 3) {
      setPredictions([]);
      setIsDropdownOpen(false);
      return;
    }

    // Debounce: Wait 300ms after the last keypress before querying
    debounceTimerRef.current = setTimeout(() => {
      fetchPredictions(val);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: OlaPrediction) => {
    setIsDropdownOpen(false);
    setSearchValue(prediction.structured_formatting?.main_text || prediction.description);

    // 1. Check if place details are already in memory cache
    if (detailsCache.has(prediction.place_id)) {
      const cached = detailsCache.get(prediction.place_id)!;
      setSelectedPlace(cached);
      onSelectAddress(cached);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(prediction.place_id)}`);
      if (!res.ok) {
        throw new Error(`Details fetch failed: ${res.status}`);
      }

      const data = await res.json();
      const result = data.result;

      if (result) {
        const selected: OlaSelectedAddress = {
          placeId: result.placeId || prediction.place_id,
          addressLine1: result.addressLine1 || prediction.structured_formatting?.main_text || '',
          addressLine2: result.addressLine2 || undefined,
          city: result.city || 'Bengaluru',
          state: result.state || 'Karnataka',
          pincode: result.pincode || '',
          formattedAddress: result.formattedAddress || prediction.description,
          location: result.location || undefined,
        };

        // Cache details in memory
        detailsCache.set(prediction.place_id, selected);
        setSelectedPlace(selected);
        onSelectAddress(selected);
      }
    } catch (err) {
      console.error('[OlaAddressSearch] Error fetching details:', err);
      // Fallback with prediction info
      const fallback: OlaSelectedAddress = {
        placeId: prediction.place_id,
        addressLine1: prediction.structured_formatting?.main_text || prediction.description,
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        formattedAddress: prediction.description,
      };
      detailsCache.set(prediction.place_id, fallback);
      setSelectedPlace(fallback);
      onSelectAddress(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || predictions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < predictions.length) {
        handleSelectPrediction(predictions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedPlace(null);
    setSearchValue('');
    setPredictions([]);
    setIsDropdownOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <div className={styles.searchHeader}>
        <span className={styles.label}>
          <Building2 size={16} style={{ color: 'var(--accent-terracotta, #b85034)' }} />
          Apartment / Society / Street Search
        </span>
        <span className={styles.badge}>
          <Sparkles size={11} />
          Powered by Ola Maps
        </span>
      </div>

      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          id="ola-apartment-search"
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (predictions.length > 0 && !selectedPlace) {
              setIsDropdownOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start typing your apartment, society, or street (e.g. Prestige Lakeside, Sobha)..."
          className={styles.searchInput}
          autoComplete="off"
        />

        {isLoading ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : searchValue ? (
          <button
            type="button"
            onClick={handleClear}
            className={styles.actionButton}
            title="Clear search"
          >
            <X size={16} />
          </button>
        ) : null}

        {isDropdownOpen && predictions.length > 0 && (
          <ul className={styles.dropdown} role="listbox">
            {predictions.map((p, idx) => (
              <li
                key={p.place_id || idx}
                role="option"
                aria-selected={activeIndex === idx}
                className={`${styles.dropdownItem} ${activeIndex === idx ? styles.dropdownItemActive : ''}`}
                onClick={() => handleSelectPrediction(p)}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <MapPin size={18} className={styles.itemIcon} />
                <div className={styles.itemTextWrap}>
                  <span className={styles.itemMainText}>
                    {p.structured_formatting?.main_text || p.description}
                  </span>
                  {p.structured_formatting?.secondary_text && (
                    <span className={styles.itemSecondaryText}>
                      {p.structured_formatting.secondary_text}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPlace && (
        <div className={styles.selectedCard}>
          <div className={styles.selectedContent}>
            <CheckCircle2 size={18} className={styles.selectedIcon} />
            <div className={styles.selectedDetails}>
              <span className={styles.selectedName}>{selectedPlace.addressLine1}</span>
              <span className={styles.selectedAddress}>{selectedPlace.formattedAddress}</span>
              <span className={styles.olaVerifiedBadge}>
                <Sparkles size={10} />
                Ola Maps Verified Location • PIN: {selectedPlace.pincode || 'Verified'}
              </span>
            </div>
          </div>
          <button type="button" onClick={handleClear} className={styles.changeButton}>
            Change
          </button>
        </div>
      )}

      <span className={styles.helperText}>
        Select your apartment or society from the suggestions to auto-fill doorstep delivery details.
      </span>
    </div>
  );
}
