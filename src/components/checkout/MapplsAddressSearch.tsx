'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, CheckCircle2, X, Building2, Sparkles } from 'lucide-react';
import styles from './MapplsAddressSearch.module.css';

export interface MapplsSelectedAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  eLoc?: string;
  formattedAddress: string;
}

interface MapplsAddressSearchProps {
  onSelectAddress: (data: MapplsSelectedAddress) => void;
  className?: string;
}

const KNOWN_STATES = [
  'Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal',
  'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Bihar',
  'Odisha', 'Assam', 'Goa', 'Himachal Pradesh', 'Uttarakhand',
  'Jammu and Kashmir', 'Chandigarh', 'Puducherry'
];

function parseMapplsPlace(item: any): MapplsSelectedAddress {
  const placeName = (item.placeName || item.name || '').trim();
  const rawAddress = (item.placeAddress || item.address || '').trim();
  const eLoc = item.eLoc || '';

  // Extract 6-digit Indian PIN code
  const pinMatch = rawAddress.match(/\b([1-9][0-9]{5})\b/);
  const pincode = pinMatch ? pinMatch[1] : '';

  // Clean address removing pincode
  const cleanAddr = rawAddress.replace(/\b[1-9][0-9]{5}\b/g, '').replace(/,\s*,/g, ',').trim();
  const parts = cleanAddr.split(',').map((s: string) => s.trim()).filter(Boolean);

  let state = '';
  let city = '';
  let locality = '';

  // Scan backwards for State match
  for (let i = parts.length - 1; i >= 0; i--) {
    const matchedState = KNOWN_STATES.find(s => parts[i].toLowerCase().includes(s.toLowerCase()));
    if (matchedState) {
      state = matchedState;
      parts.splice(i, 1);
      break;
    }
  }

  // The next part backwards is usually City / District
  if (parts.length > 0) {
    city = parts.pop() || '';
  }

  // Whatever remains is locality / sub-locality
  if (parts.length > 0) {
    locality = parts.join(', ');
  }

  return {
    addressLine1: placeName || rawAddress,
    addressLine2: locality || undefined,
    city: city || 'Bengaluru',
    state: state || 'Karnataka',
    pincode,
    eLoc,
    formattedAddress: placeName ? `${placeName}, ${rawAddress}` : rawAddress,
  };
}

export function MapplsAddressSearch({ onSelectAddress, className = '' }: MapplsAddressSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<MapplsSelectedAddress | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MAPPLS_KEY || 'uodgpbltkptpkxjykguwjzzuwaxvtmlocbyv';

    const loadScripts = () => {
      const win = window as any;

      const initSearch = () => {
        if (!win.mappls || !win.mappls.search || !inputRef.current || isInitialized.current) return;
        isInitialized.current = true;
        setIsScriptReady(true);

        try {
          win.mappls.search(inputRef.current, {
            region: 'IND',
            hyperLocal: true,
          }, (data: any) => {
            if (Array.isArray(data) && data.length > 0) {
              const parsed = parseMapplsPlace(data[0]);
              setSelectedPlace(parsed);
              onSelectAddress(parsed);
            } else if (data && typeof data === 'object') {
              const parsed = parseMapplsPlace(data);
              setSelectedPlace(parsed);
              onSelectAddress(parsed);
            }
          });
        } catch (err) {
          console.warn('[Mappls] Search widget attach error:', err);
        }
      };

      // Check if SDK already loaded
      if (win.mappls && win.mappls.search) {
        initSearch();
        return;
      }

      // 1. Load Main Web SDK
      const existingSdk = document.querySelector('script[src*="sdk.mappls.com/map/sdk/web"]');
      if (!existingSdk) {
        const sdkScript = document.createElement('script');
        sdkScript.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${key}`;
        sdkScript.async = true;
        sdkScript.onload = () => {
          // 2. Load Place Search Plugin
          const pluginScript = document.createElement('script');
          pluginScript.src = `https://sdk.mappls.com/map/sdk/plugins?v=3.0&libraries=place_search&access_token=${key}`;
          pluginScript.async = true;
          pluginScript.onload = () => {
            initSearch();
          };
          document.body.appendChild(pluginScript);
        };
        document.body.appendChild(sdkScript);
      } else {
        // Plugin might still need to load
        const existingPlugin = document.querySelector('script[src*="libraries=place_search"]');
        if (!existingPlugin) {
          const pluginScript = document.createElement('script');
          pluginScript.src = `https://sdk.mappls.com/map/sdk/plugins?v=3.0&libraries=place_search&access_token=${key}`;
          pluginScript.async = true;
          pluginScript.onload = () => {
            initSearch();
          };
          document.body.appendChild(pluginScript);
        } else {
          // Poll briefly until ready
          const interval = setInterval(() => {
            if (win.mappls && win.mappls.search) {
              clearInterval(interval);
              initSearch();
            }
          }, 200);
          setTimeout(() => clearInterval(interval), 4000);
        }
      }
    };

    loadScripts();
  }, [onSelectAddress]);

  const handleClear = () => {
    setSelectedPlace(null);
    setSearchValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.searchHeader}>
        <span className={styles.label}>
          <Building2 size={16} style={{ color: 'var(--accent-terracotta, #b85034)' }} />
          Apartment / Society / Street Search
        </span>
        <span className={styles.badge}>
          <Sparkles size={11} />
          Powered by Mappls
        </span>
      </div>

      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={inputRef}
          id="mappls-apartment-search"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Start typing your apartment, society, or street (e.g. Prestige Green, Indiranagar)..."
          className={styles.searchInput}
          autoComplete="off"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {selectedPlace && (
        <div className={styles.selectedCard}>
          <div className={styles.selectedContent}>
            <CheckCircle2 size={18} className={styles.selectedIcon} />
            <div className={styles.selectedDetails}>
              <span className={styles.selectedName}>{selectedPlace.addressLine1}</span>
              <span className={styles.selectedAddress}>{selectedPlace.formattedAddress}</span>
              {selectedPlace.eLoc && (
                <span className={styles.elocBadge}>
                  eLoc Digital Address: {selectedPlace.eLoc}
                </span>
              )}
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
