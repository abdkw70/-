import React from 'react';
import { useFreeChallenge } from '../../context/FreeChallengeContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, ArrowLeft, ArrowRight, Trophy, Ticket, Coins } from 'lucide-react';

interface Props {
  onStartClick?: () => void;
  compact?: boolean;
}

export const FreeChallengeCartBanner: React.FC<Props> = ({ onStartClick, compact = false }) => {
  const { settings, openChallenge } = useFreeChallenge();
  const { cart } = useCart();
  const { t, dir, isRtl } = useLanguage();

  if (settings && !settings.gameEnabled) return null;
  if (!cart || cart.items.length === 0) return null;

  const winDiscount = settings?.challengeWinDiscountPercentage || 25;

  const handleStart = () => {
    if (onStartClick) onStartClick();
    openChallenge('challenge');
  };

  return (
    <div
      dir={dir}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-slate-950 shadow-lg border border-amber-300 ${
        isRtl ? 'text-right' : 'text-left'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Decorative Sparkle BG */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-950/10 border border-slate-950/10 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {t('games.challenge_mind')}
              </span>
            </div>
            <p className="text-xs text-slate-900/90 font-medium mt-0.5 leading-snug">
              {isRtl
                ? t('games.cart_banner_desc', `حل ${settings?.puzzlesPerChallenge || 3} ألغاز بصرية سريعة واحصل على كوبون خصم ${winDiscount}% فوري لطلبك + رصيد نقدي في محفظتك!`, { count: settings?.puzzlesPerChallenge || 3, discount: winDiscount })
                : `Solve ${settings?.puzzlesPerChallenge || 3} visual puzzles and get an instant ${winDiscount}% discount coupon + wallet credit!`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Ticket className="w-4 h-4" />
          <span>{t('games.start_now')}</span>
          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
