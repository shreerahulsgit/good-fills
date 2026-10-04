'use client';

import React, { useState } from 'react';
import { Navigation, MapPin, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import styles from './LocationDetector.module.css';

export interface DetectedLocationData {
  pincode?: string;
  city?: string;
  state?: string;
  addressLine1?: string;
  addressLine2?: string;
  formattedSummary?: string;
}

interface LocationDetectorProps {
  onLocationDetected: (data: DetectedLocationData) => void;
  className?: string;
}

type DetectionStatus = 'idle' | 'locating' | 'geocoding' | 'success' | 'error';

export function LocationDetector({ onLocationDetected, className = '' }: LocationDetectorProps) {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedSummary, setDetectedSummary] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser. Please enter your PIN code manually.');
      return;
    }

    setStatus('locating');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setStatus('geocoding');
          const { latitude, longitude } = pos.coords;

          const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();

          if (!res.ok || !data.success || !data.location) {
            throw new Error(data.error || 'Could not resolve address from coordinates.');
          }

          const loc = data.location;
          const detectedData: DetectedLocationData = {
            pincode: loc.pincode,
            city: loc.city,
            state: loc.state,
            addressLine1: loc.road ? loc.road : undefined,
            addressLine2: loc.locality ? loc.locality : undefined,
            formattedSummary: loc.formattedSummary,
          };

          onLocationDetected(detectedData);

          const displayLabel = [loc.locality || loc.road, loc.city, loc.pincode ? `PIN: ${loc.pincode}` : '']
            .filter(Boolean)
            .join(', ');

          setDetectedSummary(displayLabel || loc.formattedSummary || 'Address detected');
          setStatus('success');
        } catch (err: any) {
          console.error('Reverse geocode error:', err);
          setStatus('error');
          setErrorMessage(err.message || 'Could not fetch address details for your location. Please enter manually.');
        }
      },
      (geoError) => {
        setStatus('error');
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setErrorMessage('Location access was denied. Please enable location permission in your browser or enter your PIN code manually.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            setErrorMessage('GPS signal unavailable. Please enter your delivery PIN code manually.');
            break;
          case geoError.TIMEOUT:
            setErrorMessage('Location request timed out. Please try again or enter your PIN code manually.');
            break;
          default:
            setErrorMessage('Could not determine current location. Please enter your PIN code manually.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const isLoading = status === 'locating' || status === 'geocoding';

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.detectorCard}>
        <div className={styles.detectorInfo}>
          <div className={styles.iconCircle}>
            <Navigation size={18} />
          </div>
          <div className={styles.textGroup}>
            <div className={styles.title}>Fast-Fill Delivery Destination</div>
            <div className={styles.subtitle}>
              Use GPS to auto-populate PIN code, City, State, and Locality in 1 click
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isLoading}
          className={styles.detectBtn}
          title="Detect current location using device GPS"
        >
          {isLoading ? (
            <>
              <div className={styles.spinner} />
              <span>{status === 'locating' ? 'Locating GPS...' : 'Resolving Address...'}</span>
            </>
          ) : (
            <>
              <MapPin size={14} />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification */}
      {status === 'success' && detectedSummary && (
        <div className={styles.successBanner} role="status">
          <div className={styles.successLeft}>
            <CheckCircle2 size={16} className={styles.successIcon} />
            <div>
              <div className={styles.successTitle}>Location Detected: {detectedSummary}</div>
              <p className={styles.successDesc}>
                PIN code, City, State, and Locality auto-filled. Please add your specific Door No., Apartment / House name below.
              </p>
              <button
                type="button"
                onClick={handleDetectLocation}
                className={styles.redetectLink}
              >
                Re-detect location
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className={styles.closeBtn}
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {status === 'error' && errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorLeft}>
            <AlertCircle size={16} className={styles.errorIcon} />
            <div>
              <div className={styles.errorTitle}>Location Detection Notice</div>
              <p className={styles.errorDesc}>{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setErrorMessage(null);
            }}
            className={styles.closeBtn}
            title="Dismiss error"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
