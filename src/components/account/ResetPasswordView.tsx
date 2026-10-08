'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import styles from './ResetPasswordView.module.css';

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetCode = searchParams.get('code');

  // Status Lifecycle
  const [status, setStatus] = useState<'checking' | 'ready' | 'success' | 'expired' | 'missing'>('checking');
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resetCode) {
      setStatus('missing');
      return;
    }

    const checkCode = async () => {
      try {
          const supabase = createSupabaseBrowserClient();
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(resetCode);
          if (exchangeError) throw exchangeError;
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user?.email) throw userError || new Error('Reset session is invalid.');
          setVerifiedEmail(user.email);
        setStatus('ready');
      } catch (err: any) {
        console.error('Password reset code validation error:', err);
        setStatus('expired');
      }
    };

    checkCode();
  }, [resetCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type your password carefully.');
      return;
    }

    setIsSubmitting(true);
    try {
        const { error } = await createSupabaseBrowserClient().auth.updateUser({ password: newPassword });
        if (error) throw error;
      setStatus('success');
    } catch (err: any) {
      console.error('Error confirming new password:', err);
        if (err.code === 'otp_expired' || err.code === 'invalid_grant') {
        setErrorMessage('This password reset link has expired. Please request a new one.');
        setStatus('expired');
        } else if (err.code === 'weak_password') {
        setErrorMessage('The chosen password is too weak. Please include numbers or letters.');
      } else {
        setErrorMessage(err.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.resetContainer}>
      <div className={styles.resetCard}>
        <div style={{ marginBottom: '16px' }}>
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Good Fills" 
              style={{
                height: '42px',
                width: 'auto',
                display: 'block'
              }}
            />
          </Link>
        </div>

        {/* Top Eyebrow */}
        <div className={styles.brandEyebrow}>
          <span>Good Fills Atelier · Security</span>
        </div>

        {/* STATE 1: CHECKING TOKEN */}
        {status === 'checking' && (
          <div className={styles.loadingBox}>
            <RefreshCw size={28} color="var(--accent-terracotta)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <h2 className={styles.cardTitle} style={{ fontSize: '1.4rem' }}>Verifying Security Token</h2>
              <p className={styles.cardSubtitle}>Confirming your encrypted password reset link...</p>
          </div>
        )}

        {/* STATE 2: EXPIRED OR INVALID TOKEN */}
        {status === 'expired' && (
          <div className={styles.expiredBox}>
            <div className={styles.cardIcon} style={{ color: '#dc2626', backgroundColor: '#fef2f2' }}>
              <AlertCircle size={22} />
            </div>
            <h2 className={styles.cardTitle}>Reset Link Expired</h2>
            <p className={styles.cardSubtitle} style={{ marginBottom: '24px' }}>
              This password reset link has expired, has already been used, or is malformed. Password reset links are valid for one hour for your security.
            </p>
            <Link href="/account" className={styles.actionBtnOutline}>
              <span>Request a New Reset Link</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* STATE 3: MISSING TOKEN */}
        {status === 'missing' && (
          <div className={styles.expiredBox}>
            <div className={styles.cardIcon} style={{ color: '#b45309', backgroundColor: '#fffbeb' }}>
              <KeyRound size={22} />
            </div>
            <h2 className={styles.cardTitle}>No Reset Code Provided</h2>
            <p className={styles.cardSubtitle} style={{ marginBottom: '24px' }}>
              To reset your password, please click the secure link sent to your registered email address, or enter your email on the sign-in page to request a fresh link.
            </p>
            <Link href="/account" className={styles.actionBtnOutline}>
              <span>Go to Sign In Page</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* STATE 4: SUCCESS */}
        {status === 'success' && (
          <div className={styles.successBox}>
            <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h2 className={styles.successTitle}>Password Updated Successfully!</h2>
            <p className={styles.successDesc}>
              Your account password has been updated. You can now use your new password to access your Good Fills account.
            </p>
            <Link href="/account" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
              <span>Proceed to Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* STATE 5: READY FORM */}
        {status === 'ready' && (
          <>
            <div className={styles.headerBlock}>
              <div className={styles.cardIcon}>
                <Lock size={22} />
              </div>
              <h1 className={styles.cardTitle}>Create New Password</h1>
              <p className={styles.cardSubtitle}>
                Please choose a strong, secure password for your Good Fills account.
              </p>
              {verifiedEmail && (
                <div className={styles.userEmailBadge}>
                  Account: <strong>{verifiedEmail}</strong>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className={styles.errorBox}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className={styles.textInput}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm New Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    className={styles.textInput}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    tabIndex={-1}
                    aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting || !newPassword || !confirmPassword}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
