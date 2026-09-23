import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Award,
  Sparkles,
  ShoppingBag,
  Info,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Gift,
  Zap,
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchWalletDetails } from '../lib/api';
import { UserWallet } from '../types';

interface WalletPageProps {
  onNavigate: (page: string) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onNavigate }) => {
  const { userId, refreshGamification, profile, settings } = useGamification();
  const { user, openAuthModal } = useAuth();
  const { dir, isRtl, language, t, formatPrice } = useLanguage();

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadWallet = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchWalletDetails(userId);
      if (data.success) {
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [userId]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshGamification();
    await loadWallet();
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6" dir={dir}>
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <Wallet className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800">
            {isRtl ? 'سجّل دخولك للوصول إلى محفظتك' : 'Sign in to access your wallet'}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isRtl
              ? 'اربح رصيد مشتريات حقيقي من خلال لعب ألعاب وتحديات مسابقة مكتبة الشاطئ الازرق، واستخدم الرصيد لخصم مشترياتك في السلة.'
              : 'Earn real shopping credit by playing Blue Beach Stationery challenges, and use your balance to discount your cart purchases.'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('auth.login_submit')}</span>
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('auth.register_submit')}</span>
          </button>
        </div>
      </div>
    );
  }

  const activeItems = (wallet?.items || []).filter(i => (i.status === 'active' || i.status === 'partially_used') && i.amount > 0);
  const expiringSoonItem = activeItems.find(i => i.isExpiringSoon);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8" dir={dir}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {isRtl ? 'محفظة مكافآت الألعاب' : 'Gaming Rewards Wallet'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'رصيدك المكتسب من جوائز وتحديات الألعاب الذكية البصرية - جاهز للاستخدام المباشر في المشتريات'
                : 'Your balance earned from smart visual game challenges — ready for instant use on your orders'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm cursor-pointer"
            title={isRtl ? 'تحديث الرصيد' : 'Refresh balance'}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn_wallet_earn_more"
            onClick={() => onNavigate('/games')}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>{isRtl ? 'العب الألعاب واكسب نقاط' : 'Play Games & Earn XP'}</span>
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md shadow-sky-700/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isRtl ? 'تسوق واستخدم الرصيد' : 'Shop & Use Credit'}</span>
          </button>
        </div>
      </div>

      {/* Wallet Usage Rules Card */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Info className="w-4 h-4 text-sky-600" />
          <span>{isRtl ? 'كيف تعمل محفظة المكافآت والمشتروات؟' : 'How does the Wallet & Rewards work?'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>{isRtl ? '1. المكافآت النقدية من الألعاب والفعاليات' : '1. Cash Rewards from Games & Events'}</span>
            </div>
            <p className="leading-relaxed">
              {isRtl
                ? 'تنافس في الألعاب المصغرة والمواسم واجمع نقاط XP. عند فوزك أو تحقيق مراتب متقدمة في لائحة المتصدرين، تودَع المكافآت المالية مباشرة في محفظتك.'
                : 'Compete in mini-games and seasons to collect XP. Winning or ranking high on the leaderboard awards cash directly into your wallet.'}
            </p>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{isRtl ? '2. الاستخدام المباشر عند الشراء' : '2. Instant Payment at Checkout'}</span>
            </div>
            <p className="leading-relaxed">
              {isRtl
                ? `يمكنك استخدام رصيد محفظتك المتاح مباشرة لخصم وقضاء قيمة مشترياتك بالسلة بمرونة وسهولة عند إتمام الطلب.`
                : `You can use your available wallet balance directly to pay for purchases at checkout easily.`}
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Ledger / Transactions History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              {isRtl ? 'سجل المكافآت وحركات الرصيد' : 'Rewards Ledger & Activity'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {isRtl
              ? `${wallet?.transactions?.length || 0} حركة مسجلة`
              : `${wallet?.transactions?.length || 0} records`}
          </span>
        </div>

        {(!wallet?.transactions || wallet.transactions.length === 0) ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Coins className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                {isRtl ? 'لا توجد حركات مسجلة بعد' : 'No transactions recorded yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {isRtl
                  ? 'ابدأ بلعب تحديات الألعاب الذكية الآن لتكسب رصيد مكافآت حقيقي في محفظتك!'
                  : 'Start playing smart challenges now to earn real reward credit in your wallet!'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/games')}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isRtl ? 'ابدأ التحدي الآن' : 'Start Challenge Now'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {wallet.transactions.map(tx => (
              <div
                key={tx.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'credit'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : tx.type === 'debit'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{tx.description}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleString(language === 'ar' ? 'ar-KW' : 'en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </div>

                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <div
                    className={`font-mono font-bold text-base ${
                      tx.type === 'credit'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'debit'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(3)} {t('common.kwd')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isRtl ? 'الرصيد بعد الحركة: ' : 'Balance after: '}
                    {tx.balanceAfter.toFixed(3)} {t('common.kwd')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
