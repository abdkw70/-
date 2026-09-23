import React from 'react';
import { Award, Sparkles, X, ArrowRight, ArrowLeft, ShieldCheck, Coins } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useLanguage } from '../../context/LanguageContext';

export const EntryChallengeBanner: React.FC = () => {
  const { showEntryBanner, dismissEntryBanner, settings } = useGamification();
  const { t, dir, isRtl } = useLanguage();

  if (!showEntryBanner || settings?.isEnabled === false) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 shadow-md border-b border-amber-400" dir={dir}>
      <div className="max-w-7xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-2 gap-y-1.5 min-w-0">
        {/* Banner Left Info */}
        <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-950/10 border border-slate-950/20 flex items-center justify-center text-slate-950 shrink-0">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm text-slate-950">
                {t('games.banner_title')}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 shrink-0">
                {t('games.banner_badge')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-900/90 line-clamp-1 sm:line-clamp-none">
              {t('games.banner_subtitle')}
            </p>
          </div>
        </div>

        {/* Banner Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ms-auto sm:ms-0">
          <button
            id="btn_entry_challenge_start"
            onClick={() => {
              window.history.pushState({}, '', '/games');
              window.dispatchEvent(new Event('popstate'));
            }}
            className="py-1 sm:py-1.5 px-2.5 sm:px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer touch-manipulation whitespace-nowrap"
          >
            <span>{t('games.start_now')}</span>
            {isRtl ? <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>
          <button
            onClick={dismissEntryBanner}
            className="p-1 sm:p-1.5 text-slate-900 hover:text-slate-950 hover:bg-slate-950/10 rounded-lg transition-colors cursor-pointer touch-manipulation shrink-0"
            title={t('games.dismiss')}
            aria-label={t('games.dismiss')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
