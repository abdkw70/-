import React from 'react';
import { Award, Wallet, Crown, Sparkles, Gem, Shield, ShieldCheck, User as UserIcon, LogIn } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderGamificationWidgetProps {
  onNavigate: (page: string) => void;
}

export const HeaderGamificationWidget: React.FC<HeaderGamificationWidgetProps> = ({ onNavigate }) => {
  const { wallet, profile, settings, openChallengeModal } = useGamification();
  const { user, openAuthModal } = useAuth();
  const { isRtl, t } = useLanguage();

  const isChallengeEnabled = settings?.isEnabled !== false;
  const activeBalance = wallet?.activeBalance ?? 0;
  const currentTier = profile?.currentTier || (isRtl ? 'المستوى البرونزي' : 'Bronze Tier');

  // Get tier icon
  const getTierIcon = () => {
    if (currentTier.includes('ماسي') || currentTier.toLowerCase().includes('diamond')) {
      return <Gem className="w-3.5 h-3.5 text-violet-400" />;
    }
    if (currentTier.includes('بلاتيني') || currentTier.toLowerCase().includes('platinum')) {
      return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
    if (currentTier.includes('ذهبي') || currentTier.toLowerCase().includes('gold')) {
      return <Crown className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (currentTier.includes('فضي') || currentTier.toLowerCase().includes('silver')) {
      return <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />;
    }
    return <Shield className="w-3.5 h-3.5 text-amber-600" />;
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* 1. Challenge & Win Trigger */}
      {isChallengeEnabled && (
        <button
          id="btn_header_challenge"
          onClick={openChallengeModal}
          className="relative group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 border border-amber-500/40 text-amber-700 hover:text-amber-900 hover:border-amber-500 transition-all text-xs font-extrabold shadow-xs cursor-pointer active:scale-95"
          title={isRtl ? 'العب واربح رصيد مشتريات' : 'Play & win shopping credit'}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Award className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">{isRtl ? 'تحدّى واربح' : 'Play & Win'}</span>
          <span className="sm:hidden">{isRtl ? 'تحدّى' : 'Play'}</span>
        </button>
      )}

      {/* 2. Wallet Balance Badge (if logged in or has balance) */}
      {user && (
        <button
          id="btn_header_wallet"
          onClick={() => onNavigate('wallet')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeBalance > 0
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title={isRtl ? 'محفظة الرصيد والمكافآت' : 'Rewards Wallet'}
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-mono">{activeBalance.toFixed(3)}</span>
          <span className="text-[10px] text-slate-500 hidden xs:inline">{t('common.kwd')}</span>
        </button>
      )}

      {/* 3. User Account or Login Button */}
      {user ? (
        <button
          id="btn_header_account"
          onClick={() => onNavigate('account')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          title={isRtl ? 'حسابي والمستويات' : 'My Account & Tiers'}
        >
          {getTierIcon()}
          <span className="max-w-[70px] truncate hidden sm:inline">
            {profile?.displayName || user.displayName || t('nav.account')}
          </span>
          <span className="sm:hidden">
            <UserIcon className="w-3.5 h-3.5 text-slate-600" />
          </span>
        </button>
      ) : (
        <button
          id="btn_header_login"
          onClick={() => openAuthModal('login')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-xs font-bold text-slate-700 hover:text-amber-700 transition-all cursor-pointer"
          title={isRtl ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
        >
          <LogIn className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('nav.login')}</span>
        </button>
      )}
    </div>
  );
};
