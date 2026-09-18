import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db as firestoreDb } from '../lib/firebase';
import { UserProfile, UserWallet } from '../types';
import { loginWithEmailApi, registerWithEmailApi, checkSessionApi } from '../lib/api';

const SESSION_STORAGE_KEY = 'maktaba_auth_session';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  wallet: UserWallet | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserData: (data: { displayName?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  const openAuthModal = (mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Sync profile with backend and firestore
  const syncWithBackendAndFirestore = useCallback(async (
    firebaseUser: User,
    phone?: string,
    overrideDisplayName?: string,
    explicitProvider?: 'google' | 'email' | 'phone'
  ) => {
    try {
      const isExplicitUpdate = !!overrideDisplayName;
      // Prefer override (if explicitly updating), then saved profile name, then google name
      const activeDisplayName = overrideDisplayName || userProfile?.displayName || firebaseUser.displayName || 'عميل المتجر';
      const activePhone = phone || userProfile?.phone || firebaseUser.phoneNumber || '';

      const detectedProvider = explicitProvider || (
        firebaseUser.providerData?.some(p => p.providerId === 'google.com')
          ? 'google'
          : 'email'
      );

      const payload = {
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: activeDisplayName,
        phone: activePhone,
        role: firebaseUser.email === 'abdulrahmankw20@gmail.com' ? 'admin' : 'user',
        authProvider: detectedProvider,
        isExplicitUpdate,
      };

      // 1. Sync with Server Store DB
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let finalDisplayName = payload.displayName;
      let finalPhone = payload.phone;

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setUserProfile(data.profile);
          finalDisplayName = data.profile.displayName;
          finalPhone = data.profile.phone;
        }
        if (data.wallet) setWallet(data.wallet);
      }

      // 2. Sync to Firestore user document
      try {
        const userDocRef = doc(firestoreDb, 'users', firebaseUser.uid);
        const existingDoc = await getDoc(userDocRef);

        if (!existingDoc.exists()) {
          await setDoc(userDocRef, {
            userId: firebaseUser.uid,
            name: finalDisplayName,
            email: payload.email,
            phone: finalPhone,
            role: payload.role,
            authProvider: detectedProvider,
            xp: 0,
            currentTier: 'المستوى البرونزي',
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
        } else {
          await setDoc(userDocRef, {
            lastLoginAt: serverTimestamp(),
            name: finalDisplayName,
            phone: finalPhone,
            email: payload.email,
            authProvider: detectedProvider,
          }, { merge: true });
        }
      } catch (fErr) {
        console.warn('Firestore sync note:', fErr);
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
    }
  }, [userProfile]);

  const refreshProfile = useCallback(async () => {
    const activeUid = user?.uid || (auth.currentUser ? auth.currentUser.uid : null);
    if (!activeUid) return;
    try {
      const res = await fetch(`/api/users/profile?userId=${encodeURIComponent(activeUid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setUserProfile(data.profile);
        if (data.wallet) setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  }, [user]);

  // Session restoration and Firebase state listener
  useEffect(() => {
    let isSubscribed = true;

    const restoreLocalSession = async () => {
      try {
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.token) {
            const check = await checkSessionApi(parsed.token);
            if (check.success && check.user && isSubscribed) {
              const appUser = {
                uid: check.user.uid,
                email: check.user.email,
                displayName: check.user.displayName,
                phoneNumber: check.user.phone,
              } as unknown as User;
              setUser(appUser);
              if (check.profile) setUserProfile(check.profile);
              if (check.wallet) setWallet(check.wallet);
              setLoading(false);
              return true;
            }
          }
        }
      } catch (e) {
        console.warn('Session restoration note:', e);
      }
      return false;
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isSubscribed) return;

      // Check if password recovery flow is active across sessionStorage or localStorage
      const isRecoveryActive =
        typeof window !== 'undefined' && (
          sessionStorage.getItem('in_password_recovery') === 'true' ||
          localStorage.getItem('maktaba_recovery_active') === 'true'
        );

      if (isRecoveryActive) {
        // Strict isolation: Do not process temporary Google verification as store sign-in or session reset
        return;
      }

      if (currentUser) {
        setUser(currentUser);
        await syncWithBackendAndFirestore(currentUser);
        setLoading(false);
      } else {
        // If Firebase is null, check if local custom session exists
        const restored = await restoreLocalSession();
        if (!restored && isSubscribed) {
          setUser(null);
          setUserProfile(null);
          setWallet(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [syncWithBackendAndFirestore]);

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      // 1. Authenticate with Store Credentials DB
      const result = await loginWithEmailApi({ email: cleanEmail, password: pass });

      // Save local session
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        token: result.token,
        user: result.user,
      }));

      const appUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        phoneNumber: result.user.phone,
      } as unknown as User;

      setUser(appUser);
      setUserProfile(result.profile);
      setWallet(result.wallet);

      // 2. Try Firebase client sign in if available in project
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, pass);
      } catch (firebaseErr: any) {
        // Safe fallback: If Firebase email provider is not enabled in Firebase console, ignore Firebase-only error
        if (
          firebaseErr.code !== 'auth/operation-not-allowed' &&
          firebaseErr.code !== 'auth/configuration-not-found' &&
          firebaseErr.code !== 'auth/invalid-credential'
        ) {
          console.warn('Firebase email auth notice:', firebaseErr.message);
        }
      }

      closeAuthModal();
    } catch (err: any) {
      console.error('Sign in error:', err);
      let message = err.message || 'فشل تسجيل الدخول، يرجى التأكد من البريد الإلكتروني وكلمة المرور';
      if (err.code === 'user-not-found') {
        message = 'الحساب غير موجود، يرجى التحقق من البريد أو إنشاء حساب جديد';
      } else if (err.code === 'wrong-password') {
        message = 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد الإلكتروني وكلمة المرور';
      }
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, phone?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      // 1. Register with Store Credentials DB
      const result = await registerWithEmailApi({
        email: cleanEmail,
        password: pass,
        displayName,
        phone,
      });

      // Save local session
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        token: result.token,
        user: result.user,
      }));

      const appUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        phoneNumber: result.user.phone,
      } as unknown as User;

      setUser(appUser);
      setUserProfile(result.profile);
      setWallet(result.wallet);

      // 2. Try Firebase client sign up if available
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (displayName) {
          await updateProfile(cred.user, { displayName });
        }
      } catch (firebaseErr: any) {
        if (
          firebaseErr.code !== 'auth/operation-not-allowed' &&
          firebaseErr.code !== 'auth/configuration-not-found'
        ) {
          console.warn('Firebase email signup notice:', firebaseErr.message);
        }
      }

      closeAuthModal();
    } catch (err: any) {
      console.error('Sign up error:', err);
      let message = err.message || 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى';
      throw new Error(message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, googleProvider);
      await syncWithBackendAndFirestore(cred.user, undefined, undefined, 'google');
      closeAuthModal();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      throw new Error('فشل تسجيل الدخول عبر Google، يرجى المحاولة مرة أخرى');
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!user) {
      throw new Error('لا توجد جلسة مستخدم نشطة لتعديل كلمة المرور');
    }
    if (newPassword.length < 6) {
      throw new Error('كلمة المرور يجب أن تحتوي على 6 خانات على الأقل');
    }

    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPassword);
      } catch (err: any) {
        console.warn('Firebase updatePassword warning:', err);
      }
    }
  };

  const logout = async () => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: parsed.token }),
            });
          }
        } catch {
          // ignore
        }
      }
      localStorage.removeItem(SESSION_STORAGE_KEY);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setWallet(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUserData = async (data: { displayName?: string; phone?: string }) => {
    if (!user) return;
    try {
      if (data.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
      await syncWithBackendAndFirestore(user, data.phone, data.displayName);
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        wallet,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        updateUserPassword,
        logout,
        refreshProfile,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
