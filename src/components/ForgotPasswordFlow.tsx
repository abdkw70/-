import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { checkAccountDetailed, verifyGoogleRecoveryApi, resetPasswordApi } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

export type ForgotStep =
  | 'enter_email'     // Step 1: User enters email, store checks if account exists
  | 'google_prompt'   // Step 2: Account confirmed found, user clicks "تأكيد عبر Google"
  | 'not_found'       // Account not found in store DB
  | 'mismatch'        // Google email does not match entered store email
  | 'new_password'    // Step 3: Verified with Google, enter and confirm new password
  | 'success';        // Step 4: Password successfully updated in store credentials

interface ForgotPasswordFlowProps {
  initialEmail?: string;
  onSuccessLogin?: (email: string) => void;
  onCancel?: () => void;
  onRegisterNew?: () => void;
}

const RECOVERY_STORAGE_KEY = 'maktaba_recovery_state';
const RECOVERY_ACTIVE_FLAG = 'maktaba_recovery_active';
const SESSION_RECOVERY_FLAG = 'in_password_recovery';
const RECOVERY_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes

interface StoredRecoveryState {
  email: string;
  step: 'google_prompt' | 'new_password';
  recoveryToken?: string;
  timestamp: number;
}

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({
  initialEmail = '',
  onSuccessLogin,
  onCancel,
  onRegisterNew,
}) => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';

  const [step, setStep] = useState<ForgotStep>('enter_email');
  const [targetEmail, setTargetEmail] = useState(initialEmail.trim().toLowerCase());
  const [validatedEmail, setValidatedEmail] = useState<string>(initialEmail.trim().toLowerCase());
  const [mismatchGoogleEmail, setMismatchGoogleEmail] = useState<string>('');
  const [notFoundEmail, setNotFoundEmail] = useState<string>('');
  const [recoveryToken, setRecoveryToken] = useState<string>('');

  // New Password form fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Helper translations
  const t = {
    title: isRtl ? '🔐 استعادة كلمة المرور' : '🔐 Password Recovery',
    subtitle: isRtl
      ? 'استعد حسابك في خطوات بسيطة وآمنة وموثقة.'
      : 'Recover your account safely in a few quick steps.',
    emailLabel: isRtl ? 'البريد الإلكتروني لحسابك في المتجر' : 'Your store account email',
    emailPlaceholder: 'name@example.com',
    checkAccountBtn: isRtl ? 'التحقق من الحساب والمتابعة' : 'Check Account & Continue',
    backBtn: isRtl ? 'رجوع' : 'Back',
    backToLogin: isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login',
    changeEmailBtn: isRtl ? 'تغيير البريد الإلكتروني' : 'Change email address',

    // Google verify step (exact texts requested)
    accountFoundTitle: isRtl ? '✓ تم العثور على بريدك الإلكتروني' : '✓ Email Located Successfully',
    googleVerifyPrompt: isRtl
      ? 'لأمان حسابك، يرجى تأكيد هويتك باستخدام Google لتغيير كلمة المرور.'
      : 'For account security, please confirm your identity using Google to reset your password.',
    googleBtn: isRtl ? 'تأكيد عبر Google' : 'Confirm via Google',
    googleLoadingBtn: isRtl ? 'جارٍ فتح نافذة Google...' : 'Opening Google window...',

    // Not Found
    notFoundTitle: isRtl ? '🔍 البريد غير مسجل في المتجر' : '🔍 Account Not Found',
    notFoundDesc: isRtl
      ? 'لم نتمكن من العثور على أي حساب مسجل بهذا البريد الإلكتروني في مكتبة الشاطئ الأزرق.'
      : 'No account was found with this email address in Blue Beach Stationery.',
    createAccountBtn: isRtl ? '✨ إنشاء حساب جديد' : '✨ Create New Account',
    tryAnotherEmailBtn: isRtl ? 'تجربة بريد إلكتروني آخر' : 'Try another email',

    // Mismatch
    mismatchTitle: isRtl ? '⚠️ حساب Google غير مطابق' : '⚠️ Google Account Mismatch',
    mismatchDesc: isRtl
      ? 'حساب Google الذي اخترته لا يطابق البريد الإلكتروني المطلوب استعادته.'
      : 'The selected Google account does not match the store account email you requested to recover.',
    targetEmailLabel: isRtl ? 'البريد المطلوب استعادته:' : 'Requested store email:',
    googleEmailLabel: isRtl ? 'بريد Google المختار:' : 'Selected Google email:',
    chooseAnotherGoogle: isRtl ? 'تأكيد بحساب Google آخر' : 'Confirm with another Google account',

    // New Password (exact texts requested)
    identityVerifiedTitle: isRtl ? '✓ تم التحقق من هويتك بنجاح' : '✓ Identity Verified Successfully',
    createPasswordTitle: isRtl ? 'إنشاء كلمة مرور جديدة' : 'Create New Password',
    passwordMinHint: isRtl ? 'يجب ألا تقل عن 6 أحرف أو أرقام' : 'At least 6 characters',
    newPasswordLabel: isRtl ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPasswordLabel: isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password',
    changePasswordBtn: isRtl ? 'حفظ كلمة المرور الجديدة' : 'Save New Password',
    passwordsMismatchErr: isRtl
      ? 'كلمتا المرور غير متطابقتين، يرجى التأكد من تطابقهما'
      : 'Passwords do not match. Please verify them.',
    passwordShortErr: isRtl
      ? 'كلمة المرور يجب أن تحتوي على 6 خانات على الأقل'
      : 'Password must be at least 6 characters long',

    // Success (exact texts requested)
    successTitle: isRtl ? '🎉 تم تغيير كلمة المرور بنجاح' : '🎉 Password Changed Successfully',
    successDesc: isRtl
      ? 'تم تحديث كلمة مرور حسابك في المتجر بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.'
      : 'Your store account password has been updated. You can now log in using your new password.',
    returnToLoginBtn: isRtl ? 'العودة إلى تسجيل الدخول' : 'Return to Login',

    // Security badge
    securityNotice: isRtl
      ? 'توثيق رسمي ومشفر ومحمي بكلمة مرور مشفرة بـ PBKDF2'
      : 'Encrypted verification and secure PBKDF2 credential storage',
  };

  // Restore state from persistent localStorage on mount if active within 15 minutes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(RECOVERY_STORAGE_KEY);
      if (!raw) return;

      const parsed: StoredRecoveryState = JSON.parse(raw);
      const isFresh = parsed.timestamp && (Date.now() - parsed.timestamp < RECOVERY_MAX_AGE_MS);

      if (isFresh && parsed.email) {
        setTargetEmail(parsed.email);
        setValidatedEmail(parsed.email);

        if (parsed.step === 'new_password' && parsed.recoveryToken) {
          setRecoveryToken(parsed.recoveryToken);
          setStep('new_password');
          // Maintain isolation flags
          localStorage.setItem(RECOVERY_ACTIVE_FLAG, 'true');
          sessionStorage.setItem(SESSION_RECOVERY_FLAG, 'true');
        } else if (parsed.step === 'google_prompt') {
          setStep('google_prompt');
          localStorage.setItem(RECOVERY_ACTIVE_FLAG, 'true');
          sessionStorage.setItem(SESSION_RECOVERY_FLAG, 'true');
        }
      } else {
        // Expired, clear out
        localStorage.removeItem(RECOVERY_STORAGE_KEY);
        localStorage.removeItem(RECOVERY_ACTIVE_FLAG);
        sessionStorage.removeItem(SESSION_RECOVERY_FLAG);
      }
    } catch (e) {
      console.warn('Could not restore recovery state:', e);
    }
  }, []);

  // Helper to save recovery state safely
  const persistRecoveryState = (data: Partial<StoredRecoveryState>) => {
    try {
      if (typeof window === 'undefined') return;
      const current: StoredRecoveryState = {
        email: validatedEmail || targetEmail,
        step: 'google_prompt',
        recoveryToken,
        timestamp: Date.now(),
        ...data,
      };
      localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(current));
      localStorage.setItem(RECOVERY_ACTIVE_FLAG, 'true');
      sessionStorage.setItem(SESSION_RECOVERY_FLAG, 'true');
    } catch (e) {
      console.warn('Could not persist recovery state:', e);
    }
  };

  // Helper to clear recovery state
  const clearRecoveryState = () => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(RECOVERY_STORAGE_KEY);
      localStorage.removeItem(RECOVERY_ACTIVE_FLAG);
      sessionStorage.removeItem(SESSION_RECOVERY_FLAG);
    } catch (e) {
      console.warn('Could not clear recovery state:', e);
    }
  };

  // STEP 1: Check if store account exists in database
  const handleCheckAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(isRtl ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const result = await checkAccountDetailed(cleanEmail);

      // Handle server/network errors explicitly without falsely showing "not found"
      if (result.error) {
        setError(result.error);
        return;
      }

      if (!result.exists) {
        setNotFoundEmail(cleanEmail);
        setStep('not_found');
        return;
      }

      setValidatedEmail(cleanEmail);
      persistRecoveryState({ email: cleanEmail, step: 'google_prompt', recoveryToken: '' });
      setStep('google_prompt');
    } catch (err: any) {
      console.error('Account check error:', err);
      setError(isRtl ? 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً' : 'Could not reach server, please try again later');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Initiate Google Authentication Popup for identity verification
  const handleGoogleVerify = async () => {
    setError(null);
    setInfoNotice(null);
    setLoading(true);

    // Flag session to strictly isolate recovery from AuthContext onAuthStateChanged
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_RECOVERY_FLAG, 'true');
      localStorage.setItem(RECOVERY_ACTIVE_FLAG, 'true');
    }

    try {
      // Force Google account picker so user selects the exact matching account
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);

      const authenticatedEmail = (result.user.email || '').trim().toLowerCase();

      // Immediately sign out Firebase session to prevent store session interference
      await signOut(auth);

      // Verify email matching
      const expectedEmail = (validatedEmail || targetEmail).trim().toLowerCase();
      if (authenticatedEmail !== expectedEmail) {
        setMismatchGoogleEmail(authenticatedEmail);
        setStep('mismatch');
        return;
      }

      // Exchange with backend for secure single-use recovery token
      try {
        const verifyRes = await verifyGoogleRecoveryApi({
          email: expectedEmail,
          googleEmail: authenticatedEmail,
        });

        setRecoveryToken(verifyRes.recoveryToken);
        persistRecoveryState({
          email: expectedEmail,
          step: 'new_password',
          recoveryToken: verifyRes.recoveryToken,
        });
        setStep('new_password');
      } catch (recErr: any) {
        if (recErr.code === 'account-not-found') {
          setNotFoundEmail(expectedEmail);
          setStep('not_found');
          return;
        }
        if (recErr.code === 'email-mismatch') {
          setMismatchGoogleEmail(authenticatedEmail);
          setStep('mismatch');
          return;
        }
        setError(recErr.message || (isRtl ? 'فشل إصدار رمز التحقق' : 'Failed to issue verification token'));
        setStep('google_prompt');
      }
    } catch (err: any) {
      console.warn('Google verification note:', err);

      // Handle popup closed or cancelled by user: DO NOT fail permanently, stay on step with button ready
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        setInfoNotice(
          isRtl
            ? 'تم إغلاق نافذة Google. اضغط على «تأكيد عبر Google» للمتابعة عند الاستعداد.'
            : 'Google popup was closed. Click "Confirm via Google" when you are ready.'
        );
        return;
      }

      // Handle popup blocked: Clear, helpful instructions
      if (err.code === 'auth/popup-blocked') {
        setError(
          isRtl
            ? 'تم حظر النافذة المنبثقة من قِبل المتصفح. يرجى السماح بالنوافذ المنبثقة للموقع ثم الضغط على «تأكيد عبر Google».'
            : 'Popup was blocked by the browser. Please enable popups for this site and click "Confirm via Google".'
        );
        return;
      }

      // Handle network errors
      if (err.code === 'auth/network-request-failed') {
        setError(
          isRtl
            ? 'تعذر الاتصال بخدمة Google بسبب ضعف الشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.'
            : 'Could not connect to Google service due to network issues. Please check your connection and retry.'
        );
        return;
      }

      // General fallback
      setError(
        isRtl
          ? 'تعذر إتمام التحقق عبر Google، يرجى المحاولة مرة أخرى أو التأكد من إعدادات المتصفح.'
          : 'Google verification could not be completed. Please try again or check browser settings.'
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Submit New Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

    if (!recoveryToken) {
      setError(isRtl ? 'انتهت صلاحية جلسة التحقق، يرجى إعادة التحقق عبر Google' : 'Session expired, please re-verify with Google');
      setStep('google_prompt');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordsMismatchErr);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.passwordShortErr);
      return;
    }

    setLoading(true);
    try {
      const effectiveEmail = (validatedEmail || targetEmail).trim().toLowerCase();

      // Reset password in store credentials repository
      await resetPasswordApi({
        email: effectiveEmail,
        recoveryToken,
        newPassword,
      });

      // Complete logout of any leftover sessions
      await signOut(auth);

      // Clean up recovery state completely
      clearRecoveryState();

      setStep('success');
    } catch (err: any) {
      console.error('Password reset submit error:', err);
      setError(err.message || (isRtl ? 'فشل حفظ كلمة المرور الجديدة' : 'Failed to set new password'));
    } finally {
      setLoading(false);
    }
  };

  // STEP 4: Finish and redirect to login
  const handleCompleteLogin = () => {
    clearRecoveryState();
    const finalEmail = (validatedEmail || targetEmail).trim().toLowerCase();
    if (onSuccessLogin) {
      onSuccessLogin(finalEmail);
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div id="forgot-password-flow-container" className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-base font-black text-slate-800 tracking-tight">{t.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{t.subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/* STEP 1: ENTER STORE EMAIL                                   */}
        {/* ============================================================ */}
        {step === 'enter_email' && (
          <motion.div
            key="step-enter-email"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs text-right">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleCheckAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    id="input-recovery-email"
                    value={targetEmail}
                    onChange={(e) => {
                      setTargetEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 font-mono text-right"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                id="btn-check-recovery-account"
                disabled={loading || !targetEmail.trim()}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.checkAccountBtn}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>

            {onCancel && (
              <button
                type="button"
                id="btn-cancel-recovery"
                onClick={() => {
                  clearRecoveryState();
                  onCancel();
                }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors text-center cursor-pointer"
              >
                {t.backToLogin}
              </button>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: GOOGLE PROMPT (ACCOUNT FOUND & CONFIRM VIA GOOGLE)  */}
        {/* ============================================================ */}
        {step === 'google_prompt' && (
          <motion.div
            key="step-google-prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 text-center"
          >
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs text-right">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {infoNotice && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800 text-xs text-right">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span className="leading-relaxed">{infoNotice}</span>
              </div>
            )}

            {/* Account Confirmed Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 space-y-2 text-right">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.accountFoundTitle}</span>
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 bg-white/90 py-1.5 px-2.5 rounded-lg border border-emerald-200/60 inline-block shadow-xs" dir="ltr">
                {validatedEmail}
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed pt-0.5">
                {t.googleVerifyPrompt}
              </p>
            </div>

            {/* Clear Action Button: تأكيد عبر Google (never hidden) */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="btn-verify-with-google"
                onClick={handleGoogleVerify}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black active:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{t.googleLoadingBtn}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{t.googleBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-back-to-enter-email"
                disabled={loading}
                onClick={() => {
                  clearRecoveryState();
                  setError(null);
                  setInfoNotice(null);
                  setStep('enter_email');
                }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {t.changeEmailBtn}
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STEP NOT FOUND                                              */}
        {/* ============================================================ */}
        {step === 'not_found' && (
          <motion.div
            key="step-not-found"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 text-center py-2"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 mb-1">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">{t.notFoundTitle}</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">{t.notFoundDesc}</p>

            {notFoundEmail && (
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono inline-block" dir="ltr">
                {notFoundEmail}
              </div>
            )}

            <div className="space-y-2 pt-3">
              {onRegisterNew && (
                <button
                  type="button"
                  id="btn-not-found-register"
                  onClick={onRegisterNew}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.createAccountBtn}</span>
                </button>
              )}

              <button
                type="button"
                id="btn-not-found-back"
                onClick={() => {
                  clearRecoveryState();
                  setError(null);
                  setInfoNotice(null);
                  setStep('enter_email');
                }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.tryAnotherEmailBtn}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STEP MISMATCH                                                */}
        {/* ============================================================ */}
        {step === 'mismatch' && (
          <motion.div
            key="step-mismatch"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4 text-center py-2"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 mb-1">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">{t.mismatchTitle}</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">{t.mismatchDesc}</p>

            {/* Comparison Box */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2 text-right">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-bold">{t.targetEmailLabel}</span>
                <span className="font-mono text-slate-800 font-semibold" dir="ltr">{validatedEmail || targetEmail}</span>
              </div>
              {mismatchGoogleEmail && (
                <div className="flex justify-between items-center text-rose-700">
                  <span className="font-bold">{t.googleEmailLabel}</span>
                  <span className="font-mono font-semibold" dir="ltr">{mismatchGoogleEmail}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                id="btn-mismatch-choose-other"
                onClick={handleGoogleVerify}
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-2xl shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? t.googleLoadingBtn : t.chooseAnotherGoogle}</span>
              </button>

              <button
                type="button"
                id="btn-mismatch-back"
                onClick={() => {
                  clearRecoveryState();
                  setError(null);
                  setInfoNotice(null);
                  setStep('enter_email');
                }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.changeEmailBtn}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STEP NEW PASSWORD (IDENTITY VERIFIED)                       */}
        {/* ============================================================ */}
        {step === 'new_password' && (
          <motion.div
            key="step-new-password"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Identity Verified Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-right">
              <div className="flex items-center gap-2 font-bold mb-1 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-black">{t.identityVerifiedTitle}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-mono text-[11px]" dir="ltr">
                <Mail className="w-3 h-3 text-emerald-600" />
                <span>{validatedEmail || targetEmail}</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs text-right">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="text-right">
                <h4 className="text-xs font-black text-slate-800 mb-0.5">{t.createPasswordTitle}</h4>
                <p className="text-[11px] text-slate-500">{t.passwordMinHint}</p>
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-right">
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    id="input-new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 font-mono text-left"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-right">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    id="input-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 font-mono text-left"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-submit-change-password"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.changePasswordBtn}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STEP SUCCESS                                                 */}
        {/* ============================================================ */}
        {step === 'success' && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-4 space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mb-1 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-lg font-black text-slate-800 tracking-tight">{t.successTitle}</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">{t.successDesc}</p>

            <div className="pt-2">
              <button
                type="button"
                id="btn-success-to-login"
                onClick={handleCompleteLogin}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.returnToLoginBtn}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="truncate">{t.securityNotice}</span>
      </div>
    </div>
  );
};
