import React from 'react';
import { Award, Sparkles, X, ArrowRight, ArrowLeft, ShieldCheck, Coins } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useFreeChallenge } from '../../context/FreeChallengeContext';
import { useLanguage } from '../../context/LanguageContext';

export const EntryChallengeBanner: React.FC = () => {
  const { showEntryBanner, dismissEntryBanner, settings } = useGamification();
  const { openChallenge } = useFreeChallenge();
  const { dir, isRtl } = useLanguage();

  if (!showEntryBanner || settings?.isEnabled === false) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 px-4 py-3 shadow-md border-b border-amber-400" dir={dir}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Banner Left Info */}
        <div className={`flex items-center gap-3 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="w-10 h-10 rounded-xl bg-slate-950/10 border border-slate-950/20 flex items-center justify-center text-slate-950 shrink-0">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-950">
                {isRtl ? '🏆 تحدّى واربح رصيدك الفوري!' : '🏆 Play & Win Instant Credit!'}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-amber-300">
                {isRtl ? 'خصم 25% + رصيد' : '25% Off + Credit'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-900/90 hidden sm:block">
              {isRtl
                ? 'اختر لعبتك المفضلة وحل الألغاز البصرية بالوقت المحدد واكسب كوبون خصمك الفوري ومكافأة محفظتك!'
                : 'Solve visual puzzles within the time limit and earn an instant discount coupon and wallet rewards!'}
            </p>
          </div>
        </div>

        {/* Banner Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn_entry_challenge_start"
            onClick={() => openChallenge('challenge')}
            className="py-1.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>{isRtl ? 'ابدأ التحدي الآن' : 'Start Challenge Now'}</span>
            {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={dismissEntryBanner}
            className="p-1.5 text-slate-900 hover:text-slate-950 hover:bg-slate-950/10 rounded-lg transition-colors cursor-pointer"
            title={isRtl ? 'إغلاق الإعلان' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
