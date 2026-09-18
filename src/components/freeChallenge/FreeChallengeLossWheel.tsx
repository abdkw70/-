import React, { useState, useEffect } from 'react';
import { Gift, Clock, Sparkles, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFreeChallenge } from '../../context/FreeChallengeContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  discountPercentage: number;
  expiresAt: string;
  onContinueShopping: () => void;
  onGoToCheckout: () => void;
}

export const FreeChallengeLossWheel: React.FC<Props> = ({
  discountPercentage,
  expiresAt,
  onContinueShopping,
  onGoToCheckout,
}) => {
  const { cart } = useCart();
  const { settings } = useFreeChallenge();
  const { t, dir, isRtl, formatPrice } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(true);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // Slices dynamically derived from server settings or default percentages
  const configuredValues = settings?.discountWheelValues && settings.discountWheelValues.length > 0
    ? settings.discountWheelValues
    : [5, 10, 15, 20, 25];

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'];

  const segments = configuredValues.map((val, idx) => ({
    percent: val,
    label: t('games.discount_val', '', { val }),
    color: colors[idx % colors.length],
  }));

  useEffect(() => {
    // Start wheel spin automatically
    const targetIdx = segments.findIndex(s => s.percent === discountPercentage);
    const sliceAngle = 360 / (segments.length || 1);
    const finalAngle = 360 * 5 + (targetIdx >= 0 ? 360 - (targetIdx * sliceAngle + sliceAngle / 2) : 0);

    setRotationDegrees(finalAngle);

    const timer = setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
    }, 3200);

    return () => clearTimeout(timer);
  }, [discountPercentage, segments.length]);

  // Live 10-min countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = new Date(expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr(t('games.expired'));
        return;
      }
      const mins = Math.floor(remainingMs / (1000 * 60));
      const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
      setTimeLeftStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, isRtl]);

  const estimatedSavedKwd = cart ? ((cart.subtotal * discountPercentage) / 100) : 0;

  // Build conic gradient string for dynamic slices
  const conicGradient = segments.map((seg, i) => {
    const step = 360 / segments.length;
    return `${seg.color} ${i * step}deg ${(i + 1) * step}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center text-center p-2 text-white" dir={dir}>
      {/* Header Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-3">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        <span>{t('games.instant_lucky_wheel')}</span>
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-black text-amber-300 mb-2 whitespace-pre-line leading-snug">
        {t('games.effort_rewarded')}
        <span className="block text-white text-lg sm:text-xl font-bold mt-1">
          {t('games.spin_wheel')}
        </span>
      </h3>
      <p className="text-xs text-slate-400 mb-4 max-w-sm">
        {t('games.loss_wheel_desc')}
      </p>

      {/* Interactive Wheel Graphic */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-2 flex items-center justify-center">
        {/* Pointer Triangle */}
        <div className="absolute -top-3 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-md" />

        {/* Rotating Wheel Circle */}
        <div
          className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative transition-transform duration-[3200ms] ease-out"
          style={{
            transform: `rotate(${rotationDegrees}deg)`,
            background: `conic-gradient(${conicGradient})`,
          }}
        >
          {/* Slice text markings */}
          {segments.map((seg, i) => {
            const step = 360 / segments.length;
            return (
              <div
                key={i}
                className="absolute w-full h-full text-center text-white font-extrabold text-[11px] drop-shadow-md pt-2"
                style={{
                  transform: `rotate(${i * step + step / 2}deg)`,
                }}
              >
                {seg.label}
              </div>
            );
          })}
        </div>

        {/* Center Hub */}
        <div className="absolute w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 flex flex-col items-center justify-center z-10 shadow-lg">
          <Gift className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Result Card (After Spin) */}
      {hasSpun && (
        <div className="w-full max-w-md bg-slate-800/90 border border-amber-400/40 rounded-2xl p-4 mt-3 shadow-xl animate-in fade-in zoom-in-90">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span className="text-xs text-slate-300 font-semibold">
              {t('games.earned_discount')}
            </span>
            <span className="text-xl font-black text-amber-300">
              {t('games.discount_val', '', { val: discountPercentage })}
            </span>
          </div>

          {cart && cart.subtotal > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>{t('games.estimated_savings')}</span>
              <span className="font-bold text-emerald-400">-{formatPrice(estimatedSavedKwd)}</span>
            </div>
          )}

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900/80 rounded-xl border border-slate-700/60 mb-3 text-amber-300 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t('games.valid_for')}</span>
            <span className="text-base text-white font-black">{timeLeftStr}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onGoToCheckout}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('games.checkout_discount')}</span>
            </button>
            <button
              type="button"
              onClick={onContinueShopping}
              className="py-3 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{t('games.continue_shopping')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
