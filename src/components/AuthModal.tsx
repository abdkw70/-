import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trophy,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ForgotPasswordFlow } from './ForgotPasswordFlow';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth();
  const { dir, isRtl, language, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessNotice(null);
  };

  const handleModeChange = (mode: 'login' | 'register' | 'forgot') => {
    resetForm();
    openAuthModal(mode);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        if (!email || !password) {
          throw new Error(isRtl ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password');
        }
        await signInWithEmail(email, password);
      } else if (authModalMode === 'register') {
        if (!displayName.trim()) {
          throw new Error(isRtl ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
        }
        if (!email || !password) {
          throw new Error(isRtl ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password');
        }
        if (password.length < 6) {
          throw new Error(isRtl ? 'كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام' : 'Password must be at least 6 characters');
        }
        await signUpWithEmail(email, password, displayName.trim(), phone.trim());
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'An error occurred, please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || (isRtl ? 'فشل تسجيل الدخول بواسطة Google' : 'Failed to sign in with Google'));
    } finally {
      setLoading(false);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-8"
          dir={dir}
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center">
            <button
              onClick={closeAuthModal}
              className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer`}
              aria-label={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mb-3 text-white shadow-inner">
              <Trophy className="w-6 h-6 text-amber-100" />
            </div>

            <h3 className="text-xl font-black tracking-tight">
              {authModalMode === 'login' && (isRtl ? 'تسجيل الدخول' : 'Sign In')}
              {authModalMode === 'register' && (isRtl ? 'إنشاء حساب جديد' : 'Create an Account')}
              {authModalMode === 'forgot' && (isRtl ? 'استعادة كلمة المرور' : 'Password Recovery')}
            </h3>
            <p className="text-xs text-amber-100 mt-1 font-medium">
              {authModalMode === 'login' && (isRtl ? 'سجّل دخولك للوصول إلى محفظتك ورصيد التحديات' : 'Sign in to access your rewards wallet and challenge bonuses')}
              {authModalMode === 'register' && (isRtl ? 'انضم إلينا والعب التحدي اليومي واربح رصيد مشتريات' : 'Join us, play the daily challenge, and earn store credit')}
              {authModalMode === 'forgot' && (isRtl ? 'استعادة حسابك بسهولة وأمان عبر التحقق الفوري من Google' : 'Easily and securely recover your account with Google verification')}
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {authModalMode === 'forgot' ? (
              <ForgotPasswordFlow
                initialEmail={email}
                onSuccessLogin={(finalEmail) => {
                  if (finalEmail) setEmail(finalEmail);
                  setPassword('');
                  setError(null);
                  setSuccessNotice(isRtl ? 'تم تعيين كلمة المرور الجديدة بنجاح! سجّل دخولك الآن بكلمة المرور الجديدة.' : 'Password updated successfully! Please sign in with your new password.');
                  openAuthModal('login');
                }}
                onCancel={() => handleModeChange('login')}
                onRegisterNew={() => handleModeChange('register')}
              />
            ) : (
              <>
                {/* Mode Switcher Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      authModalMode === 'login'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t('auth.login_tab')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      authModalMode === 'register'
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t('auth.register_tab')}
                  </button>
                </div>

                {/* Success Notice Message */}
                {successNotice && authModalMode === 'login' && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-800 text-xs leading-relaxed font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successNotice}</span>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                  {/* Register Display Name */}
                  {authModalMode === 'register' && (
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('auth.full_name')}</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={isRtl ? 'مثال: محمد الأحمد' : 'e.g. Mohammed Al-Ahmad'}
                          className={`w-full ${isRtl ? 'pl-3 pr-9' : 'pr-3 pl-9'} py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800`}
                        />
                        <UserIcon className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-3`} />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('auth.email')}</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full ${isRtl ? 'pl-3 pr-9 text-left placeholder:text-right' : 'pr-3 pl-9 text-left'} py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800`}
                        dir="ltr"
                      />
                      <Mail className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-3`} />
                    </div>
                  </div>

                  {/* Phone for Register */}
                  {authModalMode === 'register' && (
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('auth.phone')} ({isRtl ? 'اختياري' : 'Optional'})
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={isRtl ? 'مثال: 98765432' : 'e.g. 98765432'}
                          className={`w-full ${isRtl ? 'pl-3 pr-9 text-left placeholder:text-right' : 'pr-3 pl-9 text-left'} py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800`}
                          dir="ltr"
                        />
                        <Phone className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-3`} />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">{t('auth.password')}</label>
                      {authModalMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => handleModeChange('forgot')}
                          className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          {t('auth.forgot_password')}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full ${isRtl ? 'pl-3 pr-9' : 'pr-3 pl-9'} py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800`}
                      />
                      <Lock className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-3`} />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>
                          {authModalMode === 'login' && t('auth.login_submit')}
                          {authModalMode === 'register' && t('auth.register_submit')}
                        </span>
                        <ArrowIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Google Sign In Divider & Button */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-400 font-medium">{t('auth.or_with')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>{t('auth.google_signin')}</span>
                  </button>
                </div>
              </>
            )}

            {/* Trust badge */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isRtl ? 'مصادقة آمنة ومشفرة عبر Firebase و Google Cloud' : 'Secure encrypted authentication with Firebase & Google Cloud'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
