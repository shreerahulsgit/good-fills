import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

let auth: Auth | null = null;

export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    if (!auth) {
      auth = getAuth(app);
      auth.useDeviceLanguage();
    }
    return auth;
  } catch (err) {
    console.error('Firebase Auth initialization error:', err);
    return null;
  }
};

/**
 * 1-Click Google Sign In
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured. Please check .env.local keys.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return await signInWithPopup(firebaseAuth, provider);
};

/**
 * Sign In with Email & Password
 */
export const signInWithEmail = async (email: string, pass: string): Promise<UserCredential> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured. Please check .env.local keys.');
  }
  return await signInWithEmailAndPassword(firebaseAuth, email.trim(), pass);
};

/**
 * Sign Up with Email, Password & Patron Name
 */
export const signUpWithEmail = async (
  email: string, 
  pass: string, 
  name: string
): Promise<UserCredential> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured. Please check .env.local keys.');
  }
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), pass);
  if (name.trim() && credential.user) {
    try {
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (err) {
      console.warn('Could not update user display name:', err);
    }
  }
  return credential;
};

/**
 * Password Reset Email
 */
export const resetPassword = async (email: string): Promise<void> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured. Please check .env.local keys.');
  }
  
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'http://localhost:3000';

  const actionCodeSettings = {
    url: `${origin}/account/reset-password`,
    handleCodeInApp: true,
  };

  try {
    await sendPasswordResetEmail(firebaseAuth, email.trim(), actionCodeSettings);
  } catch (err: any) {
    // If custom action URL fails or is not whitelisted, fallback to default handler
    console.warn('Reset with action settings notice:', err?.message);
    await sendPasswordResetEmail(firebaseAuth, email.trim());
  }
};

/**
 * Verify Password Reset Code from Email Link
 */
export const verifyResetCode = async (oobCode: string): Promise<string> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured.');
  }
  return await verifyPasswordResetCode(firebaseAuth, oobCode);
};

/**
 * Confirm and set new password with oobCode
 */
export const confirmNewPassword = async (oobCode: string, newPass: string): Promise<void> => {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured.');
  }
  await confirmPasswordReset(firebaseAuth, oobCode, newPass);
};
