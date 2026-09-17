import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  Trophy,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordFlow } from '../components/ForgotPasswordFlow';

interface LoginPageProps {
  onNavigate?: (path: string) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, initialMode = 'login' }) => {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  // If already logged in, redirect (except during password recovery)
  React.useEffect(() => {
    if (user && mode !== 'forgot') {
      navigateTo('/');
    }
  }, [user, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        await signInWithEmail(email, password);
        navigateTo('/');
      } else if (mode === 'register') {
        if (!displayName.trim()) throw new Error('يرجى إدخال الاسم الكامل');
        if (!email || !password) throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        if (password.length < 6) throw new Error('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام');
        await signUpWithEmail(email, password, displayName.trim(), phone.trim());
        navigateTo('/');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigateTo('/');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول عبر Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center" dir="rtl">
      <div className="w-full max-w-md">
        {/* Brand & Gamification Hook */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/20 mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {mode === 'login' && 'تسجيل الدخول إلى حسابك'}
            {mode === 'register' && 'إنشاء حساب جديد في متجر مكتبة الشاطئ الازرق'}
            {mode === 'forgot' && 'استعادة كلمة المرور'}
          </h2>
          <p className="mt-2 text-xs text-slate-600 max-w-xs mx-auto">
            {mode === 'login' && 'سجّل دخولك لمتابعة طلباتك، ورصيد محفظتك والتحديات اليومية'}
            {mode === 'register' && 'أنشئ حسابك فوراً والعب تحدي مكتبة الشاطئ الازرق لتربح رصيد مشتريات حقيقي'}
            {mode === 'forgot' && 'استعادة حسابك بسهولة وأمان عبر التحقق الفوري من Google'}
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          {mode === 'forgot' ? (
            <ForgotPasswordFlow
              initialEmail={email}
              onSuccessLogin={(finalEmail) => {
                if (finalEmail) setEmail(finalEmail);
                setPassword('');
                setError(null);
                setMode('login');
              }}
              onCancel={() => {
                setError(null);
                setMode('login');
              }}
              onRegisterNew={() => {
                setError(null);
                setMode('register');
              }}
            />
          ) : (
            <>
              {/* Tabs */}
              <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setError(null); setMode('login'); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => { setError(null); setMode('register'); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  حساب جديد
                </button>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="مثال: فهد المطيري"
                        className="w-full pl-3 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800"
                      />
                      <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-3 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 text-left placeholder:text-right"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (اختياري)</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765432"
                        className="w-full pl-3 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800 text-left placeholder:text-right"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setError(null); setMode('forgot'); }}
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                      >
                        نسيت كلمة المرور؟
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
                      className="w-full pl-3 pr-10 py-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-800"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'تسجيل الدخول'}
                        {mode === 'register' && 'إنشاء الحساب ومتابعة'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium">أو المتابعة السريعة</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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
                  <span>متابعة بواسطة Google</span>
                </button>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>بياناتك محمية ومشفرة وفق أعلى معايير الأمان</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigateTo('/')}
            className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
          >
            ← العودة إلى المتجر الرئيسي
          </button>
        </div>
      </div>
    </div>
  );
};
