import React, { useState, useEffect, useRef } from 'react';
import { useFreeChallenge } from '../../context/FreeChallengeContext';
import { useLanguage } from '../../context/LanguageContext';
import { VisualPuzzleRenderer } from './VisualPuzzleRenderer';
import { FreeChallengeWinModal } from './FreeChallengeWinModal';
import { FreeChallengeLossWheel } from './FreeChallengeLossWheel';
import {
  X,
  Clock,
  Sparkles,
  Trophy,
  AlertTriangle,
  Play,
  Share2,
  Tv,
  CheckCircle2,
  Flame,
  Coins,
} from 'lucide-react';

interface Props {
  onNavigate?: (path: string) => void;
}

export const FreeChallengeModal: React.FC<Props> = ({ onNavigate }) => {
  const {
    isOpen,
    mode,
    activePuzzle,
    activeGame,
    isSubmitting,
    isFinished,
    challengeResult,
    mysteryBoxProduct,
    isAdWatching,
    games,
    settings,
    dailyAttemptsRemaining,
    maxDailyAttempts,
    openChallenge,
    closeChallenge,
    submitAnswer,
    watchRewardedAd,
  } = useFreeChallenge();
  const { language, dir, isRtl, formatPrice, storeName } = useLanguage();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(8);
  const [timeFraction, setTimeFraction] = useState<number>(1);
  const [showAdView, setShowAdView] = useState(false);
  const [adSeconds, setAdSeconds] = useState(8);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset selected option when puzzle changes
  useEffect(() => {
    setSelectedOption(null);
  }, [activePuzzle?.puzzleId]);

  // Synchronized countdown timer based on server expiresAt
  useEffect(() => {
    if (!isOpen || !activePuzzle || isFinished || isSubmitting) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const expiresTime = new Date(activePuzzle.expiresAt).getTime();
    const totalDuration = activePuzzle.timeLimitSeconds || 8;

    const updateTimer = () => {
      const remainingMs = expiresTime - Date.now();
      const remainingSecs = Math.max(0, remainingMs / 1000);

      setSecondsLeft(Number(remainingSecs.toFixed(1)));
      setTimeFraction(Math.max(0, Math.min(1, remainingSecs / totalDuration)));

      if (remainingMs <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Timeout trigger: submit currently selected or -1 (no answer)
        submitAnswer(selectedOption !== null ? selectedOption : -1);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, activePuzzle, isFinished, isSubmitting, selectedOption, submitAnswer]);

  // Handle Option Click
  const handleSelectOption = (index: number) => {
    if (isSubmitting || isFinished) return;
    setSelectedOption(index);
    setTimeout(() => {
      submitAnswer(index);
    }, 180);
  };

  // Rewarded Ad Simulation
  const handleStartAd = async () => {
    setShowAdView(true);
    setAdSeconds(8);
    const interval = setInterval(() => {
      setAdSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowAdView(false);
          watchRewardedAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoToCheckout = () => {
    closeChallenge();
    if (onNavigate) {
      onNavigate('/checkout');
    } else {
      window.history.pushState({}, '', '/checkout');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (!isOpen) return null;

  const isUrgent = secondsLeft <= 3.0 && !isFinished;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" dir={dir}>
        {/* Animated Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>{activeGame?.title || (isRtl ? 'تحدّي التسوق المجاني' : 'Shopping Challenge')}</span>
                {mode === 'mystery_box' && (
                  <span className="text-[10px] text-purple-400 font-bold">
                    ({isRtl ? 'صندوق الغموض' : 'Mystery Box'})
                  </span>
                )}
              </h2>
              {activePuzzle && !isFinished && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {isRtl
                    ? `المرحلة ${activePuzzle.puzzleIndex} من ${activePuzzle.totalPuzzles}`
                    : `Round ${activePuzzle.puzzleIndex} of ${activePuzzle.totalPuzzles}`}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={closeChallenge}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Countdown Progress Bar (Active only during puzzle) */}
        {activePuzzle && !isFinished && !showAdView && (
          <div className="relative w-full h-2 bg-slate-800">
            <div
              className={`h-full transition-all duration-100 ease-linear ${
                isUrgent
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-md shadow-rose-500/50'
                  : 'bg-gradient-to-r from-amber-400 to-emerald-400'
              }`}
              style={{ width: `${timeFraction * 100}%` }}
            />
            {/* Pulsing Timer floating pill */}
            <div
              className={`absolute top-2.5 ${isRtl ? 'right-4' : 'left-4'} z-10 px-2.5 py-0.5 rounded-full text-xs font-mono font-black flex items-center gap-1 shadow-lg transition-colors ${
                isUrgent
                  ? 'bg-rose-500 text-white animate-bounce'
                  : 'bg-slate-800 text-amber-300 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{secondsLeft.toFixed(1)} {isRtl ? 'ثانية' : 's'}</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {/* 1. Rewarded Ad View */}
          {showAdView ? (
            <div className="flex flex-col items-center justify-center text-center py-8 text-white">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-xl mb-3 animate-pulse">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black mb-1">
                {isRtl ? `عرض خاص: تشكيلة أدوات فاخرة من ${storeName}` : `Special Offer: Premium stationery from ${storeName}`}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mb-4">
                {isRtl
                  ? 'شاهد العرض حتى النهاية للحصول على محاولة إضافية مجانية في التحدي!'
                  : 'Watch until the end to get an extra free attempt in the challenge!'}
              </p>
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-mono text-sm font-bold mb-4">
                {isRtl ? 'متبقي:' : 'Remaining:'} {adSeconds} {isRtl ? 'ثانية' : 's'}
              </div>
            </div>
          ) : isFinished ? (
            /* 2. Win / Loss Result States */
            challengeResult?.won ? (
              <FreeChallengeWinModal
                discountCoupon={challengeResult.discountCoupon}
                voucherCode={challengeResult.discountCoupon?.couponCode || challengeResult.freeCartVoucher?.voucherCode || 'WIN-CHALLENGE'}
                rewardAmount={challengeResult.rewardAmount || challengeResult.discountCoupon?.rewardAmountKwd || 1.0}
                newWalletBalance={challengeResult.newWalletBalance}
                cartSnapshotSubtotal={challengeResult.freeCartVoucher?.maxAllowedSubtotal}
                mysteryProduct={mysteryBoxProduct}
                onGoToCheckout={handleGoToCheckout}
                onClose={closeChallenge}
              />
            ) : (
              <FreeChallengeLossWheel
                discountPercentage={challengeResult?.discountWon?.percentage || 20}
                expiresAt={challengeResult?.discountWon?.expiresAt || new Date().toISOString()}
                onContinueShopping={closeChallenge}
                onGoToCheckout={handleGoToCheckout}
              />
            )
          ) : activePuzzle ? (
            /* 3. Active Visual Puzzle */
            <div className="space-y-3" dir={dir}>
              {/* Question Progress & In-Play Reward Ladder */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: activePuzzle.totalPuzzles || 4 }, (_, i) => i + 1).map((step) => {
                      const isPast = activePuzzle.puzzleIndex > step;
                      const isCurrent = activePuzzle.puzzleIndex === step;
                      return (
                        <div
                          key={step}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                            isPast
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : isCurrent
                              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/50 shadow-md scale-110'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isPast ? '✓' : step}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-slate-300 font-bold">
                    {isRtl
                      ? `السؤال ${activePuzzle.puzzleIndex} من ${activePuzzle.totalPuzzles}`
                      : `Question ${activePuzzle.puzzleIndex} of ${activePuzzle.totalPuzzles}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-slate-400">
                    {isRtl ? 'مكافأة المرحلة:' : 'Round reward:'}
                  </span>
                  <span className="text-xs font-black text-amber-300 font-mono">
                    +{formatPrice(activePuzzle.puzzleIndex * 0.250)}
                  </span>
                </div>
              </div>

              <VisualPuzzleRenderer
                puzzle={activePuzzle}
                selectedIndex={selectedOption}
                onSelectOption={handleSelectOption}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            /* 4. Game Selection Screen (عرض جميع الألعاب المفعلة) */
            <div className="space-y-4" dir={dir}>
              {/* Header Hero in Modal */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-500/20 border border-amber-500/30 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 text-xs font-black mb-2 border border-amber-400/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? `تحديات ${storeName} الكبرى` : `${storeName} Challenges`}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mb-1">
                  {isRtl
                    ? 'اختر لعبتك وتحدّى لتربح خصمك الفوري وجوائز المتجر 🏆'
                    : 'Choose your challenge, beat the clock & win instant discounts! 🏆'}
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {isRtl
                    ? 'اختر من بين الألعاب والمسابقات المتنوعة أدناه. حل الألغاز البصرية بالوقت المحدد واربح كوبونات خصم إضافية تصل إلى 25% فوراً!'
                    : 'Select a game below, solve visual puzzles within seconds, and unlock discount coupons up to 25% OFF instantly!'}
                </p>

                {/* User attempts status pill */}
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs">
                  <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-amber-300 font-bold border border-slate-700 shadow-xs">
                    {isRtl
                      ? `🎯 المحاولات اليومية المتبقية: ${dailyAttemptsRemaining} من ${maxDailyAttempts}`
                      : `🎯 Daily attempts remaining: ${dailyAttemptsRemaining} of ${maxDailyAttempts}`}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-900/90 text-emerald-400 font-bold border border-slate-700 shadow-xs">
                    {isRtl ? '🎡 عجلة الحظ مضمونة عند الخسارة' : '🎡 Lucky wheel guaranteed upon loss'}
                  </span>
                </div>
              </div>

              {/* Games Grid / List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span>
                    {isRtl
                      ? `الألعاب المفعلة المتاحة (${games.filter(g => g.enabled).length} ألعاب):`
                      : `Available Games (${games.filter(g => g.enabled).length} games):`}
                  </span>
                  <span>
                    {isRtl ? 'مدة السؤال: 7-10 ثوانٍ' : '7-10s per puzzle'}
                  </span>
                </div>

                {games.filter(g => g.enabled).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs bg-slate-800/40 rounded-2xl p-4 border border-slate-800">
                    {isRtl ? 'جاري تحميل الألعاب والتحديات المفعلة...' : 'Loading games and challenges...'}
                  </div>
                ) : (
                  games.filter(g => g.enabled).map((game, idx) => {
                    const hasAttempts = dailyAttemptsRemaining > 0;

                    return (
                      <div
                        key={game.id}
                        className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-400/50 transition-all shadow-md group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-md">
                              #{idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="text-sm font-black text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                                  {game.title}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                                  {game.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {game.description || (isRtl ? 'تحدَّ تركيزك وسرعة بديهتك بحل الألغاز البصرية بأسرع وقت.' : 'Test your speed and focus solving stationery visual puzzles.')}
                              </p>

                              {/* Game Specs Badges */}
                              <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] font-semibold text-slate-400">
                                <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700/50 text-sky-300">
                                  <Clock className="w-3 h-3 text-sky-400" />
                                  {game.timerSeconds || 8} {isRtl ? 'ثوانٍ / لغز' : 'sec / puzzle'}
                                </span>
                                <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700/50 text-amber-300">
                                  <Flame className="w-3 h-3 text-amber-400" />
                                  {game.questionsPerRound || 4} {isRtl ? 'أسئلة' : 'puzzles'}
                                </span>
                                <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700/50 text-emerald-300">
                                  <Trophy className="w-3 h-3 text-emerald-400" />
                                  {isRtl ? 'خصومات فورية حتى 25% + رصيد' : 'Up to 25% discount + credits'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end justify-center self-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (hasAttempts) {
                                  openChallenge('challenge', undefined, game.id);
                                } else {
                                  handleStartAd();
                                }
                              }}
                              disabled={isSubmitting}
                              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
                                hasAttempts
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                                  : 'bg-slate-700 hover:bg-slate-600 text-amber-300'
                              }`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>
                                {hasAttempts
                                  ? (isRtl ? 'ابدأ اللعبة' : 'Play Now')
                                  : (isRtl ? 'محاولة بإعلان' : 'Watch Ad to Play')}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer (Quick Actions) */}
        {!isFinished && !showAdView && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isRtl ? 'لا تغادر الصفحة لتجنب احتساب المحاولة' : 'Do not leave the page to avoid losing the attempt'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartAd}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isRtl ? 'مشاهدة إعلان لمزيد من الفرص' : 'Watch ad for extra chance'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
