'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  ExternalLink,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { AnnouncementConfig } from '@/types';
import styles from '@/components/console/announcement-view.module.css';

interface AdminAnnouncementViewProps {
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export function AdminAnnouncementView({ showToast }: AdminAnnouncementViewProps) {
  const [config, setConfig] = useState<AnnouncementConfig>({
    id: 'post-0001',
    enabled: false,
    image_url: '',
    title: '',
    link_url: '',
    show_button: false,
    button_text: '',
    show_once: false,
    updated_at: '',
  });
  const updateConfig = (updates: Partial<AnnouncementConfig>) => {
    setConfig((current) => ({ ...current, ...updates }));
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/console/announcement', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success && data.config) {
        setConfig(data.config);
        setImageError(false);
      } else {
        showToast(data.error || 'Failed to fetch announcement settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not connect to announcement settings server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.image_url?.trim()) {
      showToast('Please provide an image URL for the announcement poster.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/console/announcement/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        showToast('Announcement popup configuration published successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to update configuration.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while saving settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerStrip}>
        <div>
          <h1 className={styles.title}>Announcement Popup &amp; Poster</h1>
          <p className={styles.subtitle}>
            Show a festival greeting, closure notice, or promotion on your storefront.
          </p>
        </div>

        <div className={styles.headerActions}>
          <a
            href="/?preview_poster=true"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondaryBtn}
            title="Open storefront and force-test the popup modal"
          >
            <Eye size={14} />
            <span>Test Modal</span>
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            onClick={fetchConfig}
            disabled={isLoading || isSaving}
            className={styles.secondaryBtn}
            title="Reload current settings"
          >
            <RefreshCw size={13} className={isLoading ? styles.spinningIcon : ''} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={styles.primaryBtn}
          >
            {isSaving ? (
              <>
                <span className={styles.spinner} />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>SAVE &amp; PUBLISH</span>
              </>
            )}
          </button>
        </div>
      </header>

      <form onSubmit={handleSave}>
        <div className={styles.splitLayout}>
          <div className={styles.formColumn}>
            <div className={styles.statusCard}>
              <div className={styles.statusInfo}>
                <div
                  className={`${styles.statusDot} ${
                    !config.enabled ? styles.statusDotDisabled : ''
                  }`}
                />
                <div>
                  <h3 className={styles.statusTitle}>
                    {config.enabled ? 'Popup Modal is Active' : 'Popup Modal is Disabled'}
                  </h3>
                  <p className={styles.statusDesc}>
                    {config.enabled
                      ? 'Visitors will see this poster in front of the site after the preloader lifts.'
                      : 'The popup is completely hidden from storefront visitors.'}
                  </p>
                </div>
              </div>

              <label className={styles.switch} aria-label="Toggle popup active status">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) =>
                    updateConfig({ enabled: e.target.checked })
                  }
                />
                <span className={styles.slider} />
              </label>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <ImageIcon size={18} />
                <span>Poster Configuration</span>
              </h2>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="poster-url-input">
                  Poster Image URL *
                </label>
                <input
                  id="poster-url-input"
                  type="text"
                  className={styles.textInput}
                  value={config.image_url}
                  onChange={(e) => {
                    updateConfig({ image_url: e.target.value });
                    setImageError(false);
                  }}
                  placeholder="e.g. /images/announcement-poster.jpg or https://..."
                  required
                />
                <p className={styles.fieldHelp}>
                  Enter the relative image path in the <code>public/</code> folder or any public external image link.
                </p>


              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="poster-title-input">
                  Announcement Title &amp; Alt Text <span className={styles.fieldOptional}>(Optional)</span>
                </label>
                <input
                  id="poster-title-input"
                  type="text"
                  className={styles.textInput}
                  value={config.title || ''}
                  onChange={(e) =>
                    updateConfig({ title: e.target.value })
                  }
                  placeholder="e.g. Happy Dasara! Closed for Orders Till Oct 28th"
                />
                <p className={styles.fieldHelp}>
                  Descriptive text for accessibility, modal dialog labels, and SEO.
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="poster-link-input">
                  Destination Link URL <span className={styles.fieldOptional}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="poster-link-input"
                    type="text"
                    className={styles.textInput}
                    value={config.link_url || ''}
                    onChange={(e) =>
                      updateConfig({ link_url: e.target.value })
                    }
                    placeholder="e.g. /shop or /contact-us (Leave empty for pure announcement)"
                  />
                </div>
                <p className={styles.fieldHelp}>
                  If set, clicking the poster or the button will navigate the customer to this page.
                </p>
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: '22px' }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={config.show_once}
                    onChange={(e) =>
                      updateConfig({ show_once: e.target.checked })
                    }
                  />
                  <span>
                    <strong>Show once</strong>
                    <br />
                    <span style={{ color: '#6B7280', fontSize: '0.76rem' }}>
                      Shows the announcement only once during each active user session.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h2 className={styles.cardTitle} style={{ margin: 0 }}>
                  <ExternalLink size={18} />
                  <span>Action Button</span>
                </h2>

                <label className={styles.switch} aria-label="Toggle action button">
                  <input
                    type="checkbox"
                    checked={config.show_button !== false}
                    onChange={(e) =>
                      updateConfig({ show_button: e.target.checked })
                    }
                  />
                  <span className={styles.slider} />
                </label>
              </div>

              <p className={styles.fieldHelp} style={{ margin: '0 0 16px 0' }}>
                {config.show_button !== false
                  ? 'The action button is currently visible below the poster.'
                  : 'The action button is turned OFF. The modal will display only the announcement poster image.'}
              </p>

              {config.show_button !== false && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="button-label-input">
                    Button Label <span className={styles.fieldOptional}>(Optional)</span>
                  </label>
                  <input
                    id="button-label-input"
                    type="text"
                    className={styles.textInput}
                    value={config.button_text || ''}
                    onChange={(e) =>
                      updateConfig({ button_text: e.target.value })
                    }
                    placeholder="e.g. Continue to Store"
                  />
                  <p className={styles.fieldHelp}>
                    Defaults to &ldquo;Continue to Store&rdquo; (or &ldquo;Explore Products&rdquo; if a link URL is set).
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.previewColumn}>
            <div className={styles.previewSticky}>
              <div className={styles.previewHeader}>
                <div className={styles.previewBadge}>
                  <Sparkles size={11} />
                  <span>Real-Time Visitor Preview</span>
                </div>
                {!config.enabled && (
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>
                    (Currently Disabled)
                  </span>
                )}
              </div>

              <div className={styles.previewCanvas}>
                <div className={styles.previewModalMockup}>
                  <div className={styles.previewCloseMockup}>✕</div>

                  {config.image_url && !imageError ? (
                    <img
                      src={config.image_url}
                      alt={config.title || 'Announcement'}
                      className={styles.previewImage}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className={styles.previewImagePlaceholder}>
                      <AlertCircle size={28} />
                      <span>{imageError ? 'Invalid image path / URL' : 'No image configured'}</span>
                    </div>
                  )}

                  {config.show_button !== false && (
                    <div className={styles.previewFooterMockup}>
                      <div className={styles.previewMockupBtn}>
                        {config.button_text || (config.link_url ? 'Explore Products →' : 'Continue to Store')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' }}>
                Shows exactly how the modal framing render over the website.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
