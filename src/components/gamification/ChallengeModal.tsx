import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Coins,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGamification } from '../../context/GamificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedText } from '../../utils/translation';
import { startChallenge, submitChallengeAnswer, cancelChallenge, checkActiveChallenge } from '../../lib/api';
import { ClientQuestion } from '../../types';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShop?: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToShop,
}) => {
  const { userId, displayName, refreshGamification, playSound } = useGamification();
  const { language, t, dir, isRtl, formatPrice, storeName } = useLanguage();

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'answered' | 'completed' | 'cancelled' | 'error'>('intro');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ClientQuestion | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    isTimeout?: boolean;
    rewardEarned: number;
    xpEarned: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [totalReward, setTotalReward] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [timeoutCount, setTimeoutCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expiresAtMsRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);

  // Clear timer helper
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Handle Page/Tab Departure & Route Leave Warning (Anti-Cheat)
  useEffect(() => {
    if (!isOpen || gameState !== 'playing' || !sessionToken) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      cancelChallenge(sessionToken, 'Browser closed or page refreshed');
      e.preventDefault();
      e.returnValue = t('games.leaving_warning_alert');
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, gameState, sessionToken, isRtl]);

  // Reset or Resume state on modal open
  useEffect(() => {
    if (isOpen) {
      setGameState('intro');
      setSessionToken(null);
      setCurrentQuestion(null);
      setSelectedOptionIndex(null);
      setLastAnswerResult(null);
      setTotalReward(0);
      setTotalXp(0);
      setCorrectCount(0);
      setWrongCount(0);
      setTimeoutCount(0);
      setErrorMessage('');
      setShowExitConfirm(false);
      setSessionSummary(null);
      isSubmittingRef.current = false;

      // Check if user already has an active ongoing session to resume
      checkActiveChallenge(userId).then(res => {
        if (res.success && res.hasActiveSession && res.currentQuestion && res.sessionToken) {
          setSessionToken(res.sessionToken);
          setCurrentQuestion(res.currentQuestion);
          setGameState('playing');
          const remainingSec = res.currentQuestion.remainingSeconds !== undefined
            ? res.currentQuestion.remainingSeconds
            : (res.timeLimitSeconds || 15);
          startTimerWithExpiry(res.currentQuestion.questionExpiresAt, remainingSec);
        } else if (res.isCompleted && res.sessionSummary) {
          setSessionSummary(res.sessionSummary);
          setGameState('completed');
        }
      }).catch(() => {});
    } else {
      clearTimer();
    }
  }, [isOpen, userId, clearTimer]);

  // High precision timer countdown using server expiration timestamp
  const startTimerWithExpiry = (expiresAtStr?: string, initialSeconds = 15) => {
    clearTimer();
    isSubmittingRef.current = false;

    if (expiresAtStr) {
      expiresAtMsRef.current = new Date(expiresAtStr).getTime();
    } else {
      expiresAtMsRef.current = Date.now() + initialSeconds * 1000;
    }

    const computeRemaining = () => {
      const now = Date.now();
      const diffMs = expiresAtMsRef.current - now;
      return Math.max(0, Math.ceil(diffMs / 1000));
    };

    const initialRem = computeRemaining();
    setTimeLeft(initialRem);

    if (initialRem <= 0) {
      handleTimeOut();
      return;
    }

    timerRef.current = setInterval(() => {
      const rem = computeRemaining();
      setTimeLeft(rem);
      if (rem <= 0) {
        clearTimer();
        handleTimeOut();
      }
    }, 250);
  };

  // Start Challenge Action
  const handleStartGame = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await startChallenge(userId, displayName);
      if (data.success) {
        setSessionToken(data.sessionToken);
        setCurrentQuestion(data.firstQuestion);
        setGameState('playing');
        startTimerWithExpiry(data.firstQuestion.questionExpiresAt, data.timeLimitSeconds || 15);
      }
    } catch (err: any) {
      setErrorMessage(err.message || (t('games.err_start')));
      setGameState('error');
    } finally {
      setLoading(false);
    }
  };

  // When time runs out - automatically advance and register timeout
  const handleTimeOut = async () => {
    if (isSubmittingRef.current || gameState === 'completed' || gameState === 'cancelled' || !sessionToken || !currentQuestion) {
      return;
    }
    await submitAnswerAction(-1, true);
  };

  // Select Option & Submit
  const handleSelectOption = async (index: number) => {
    if (isSubmittingRef.current || gameState !== 'playing' || selectedOptionIndex !== null || timeLeft <= 0) {
      return;
    }
    setSelectedOptionIndex(index);
    clearTimer();
    await submitAnswerAction(index, false);
  };

  const submitAnswerAction = async (chosenIndex: number, isTimeoutEvent = false) => {
    if (!sessionToken || !currentQuestion || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    clearTimer();

    const timeSpent = Math.max(0, Math.min(15, 15 - timeLeft));
    setGameState('answered');

    try {
      const result = await submitChallengeAnswer(
        sessionToken,
        currentQuestion.questionId,
        chosenIndex,
        timeSpent
      );

      const wasTimeout = isTimeoutEvent || result.isTimeout;

      if (result.isCorrect && !wasTimeout) {
        playSound('correct');
        setTotalReward(prev => Number((prev + result.rewardEarned).toFixed(3)));
        setTotalXp(prev => prev + result.xpEarned);
        setCorrectCount(prev => prev + 1);
      } else {
        playSound('wrong');
        if (wasTimeout) {
          setTimeoutCount(prev => prev + 1);
        } else {
          setWrongCount(prev => prev + 1);
        }
      }

      setLastAnswerResult({
        isCorrect: result.isCorrect && !wasTimeout,
        isTimeout: wasTimeout,
        rewardEarned: result.rewardEarned,
        xpEarned: result.xpEarned,
      });

      // Advance after 1.5 seconds visual feedback
      setTimeout(() => {
        isSubmittingRef.current = false;

        if (result.isCompleted) {
          playSound('complete');
          setSessionSummary(result.sessionSummary);
          setGameState('completed');
          refreshGamification();
        } else if (result.nextQuestion) {
          setCurrentQuestion(result.nextQuestion);
          setSelectedOptionIndex(null);
          setLastAnswerResult(null);
          setGameState('playing');
          startTimerWithExpiry(result.nextQuestion.questionExpiresAt, result.nextQuestion.timeLimitSeconds || 15);
        }
      }, 1500);
    } catch (err: any) {
      isSubmittingRef.current = false;
      setErrorMessage(err.message || (t('games.err_submit')));
      setGameState('error');
    }
  };

  // Exit with cancellation
  const confirmExitAndCancel = async () => {
    if (sessionToken && gameState === 'playing') {
      await cancelChallenge(sessionToken, 'Manually exited');
      refreshGamification();
    }
    setShowExitConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="challenge_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" dir={dir}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{t('games.challenge_win_credit')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {storeName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t('games.answer_earn_xp')}
              </p>
            </div>
          </div>

          {gameState === 'playing' ? (
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={t('games.cancel')}
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content Switch */}
        <div className="p-6">
          {/* 1. INTRO STATE */}
          {gameState === 'intro' && (
            <div className="text-center space-y-6">
              <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/40">
                  <Sparkles className="w-10 h-10 text-slate-950 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {t('games.ready_trivia')}
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {t('games.trivia_desc')}
                </p>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                  <div className="text-amber-400 font-bold text-base mb-1">{formatPrice(0.5)}</div>
                  <div className="text-xs text-slate-400">
                    {t('games.per_correct')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                  <div className="text-cyan-400 font-bold text-base mb-1">
                    {t('games.15_sec')}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('games.time_per_question')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center">
                  <div className="text-emerald-400 font-bold text-base mb-1">
                    {t('games.48_hours')}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('games.credit_validity')}
                  </div>
                </div>
              </div>

              {/* Warning box */}
              <div className={`p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200 ${isRtl ? 'text-right' : 'text-left'}`}>
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {t('games.leave_warning')}
                </span>
              </div>

              <button
                id="btn_start_challenge_now"
                onClick={handleStartGame}
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('games.start_now')}</span>
                    {isRtl ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </>
                )}
              </button>
            </div>
          )}

          {/* 2. PLAYING / ANSWERED STATE */}
          {(gameState === 'playing' || gameState === 'answered') && currentQuestion && (
            <div className="space-y-5">
              {/* Question Header & Live Pot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400">
                    {t('games.question_x_of_y', '', { current: currentQuestion.questionIndex, total: currentQuestion.totalQuestions })}
                  </span>
                  <span className="text-xs text-slate-400">{currentQuestion.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{formatPrice(totalReward)}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>+{totalXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Circular Timer & Time Bar */}
              <div className="relative">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('games.time_left')}</span>
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                      timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                    style={{ width: `${(timeLeft / 15) * 100}%` }}
                  />
                </div>
              </div>

              {/* The Question Text */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 min-h-[90px] flex items-center justify-center text-center">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {getLocalizedText(currentQuestion.question, language)}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  let btnStyle = 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200';

                  if (gameState === 'answered') {
                    if (isSelected) {
                      btnStyle = lastAnswerResult?.isCorrect
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                        : 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20';
                    } else {
                      btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={gameState === 'answered'}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3.5 rounded-xl border font-medium text-sm transition-all flex items-center justify-between gap-3 active:scale-[0.99] cursor-pointer ${
                        isRtl ? 'text-right' : 'text-left'
                      } ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{getLocalizedText(option, language)}</span>
                      </div>

                      {gameState === 'answered' && isSelected && (
                        <div className="shrink-0">
                          {lastAnswerResult?.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 animate-shake" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback Banner */}
              <AnimatePresence>
                {gameState === 'answered' && lastAnswerResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm ${
                      lastAnswerResult.isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {lastAnswerResult.isCorrect ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>
                          {isRtl
                            ? t('games.correct_answer_reward', `إجابة صحيحة وممتازة! (+${formatPrice(lastAnswerResult.rewardEarned)} و +${lastAnswerResult.xpEarned} XP)`, { reward: formatPrice(lastAnswerResult.rewardEarned), xp: lastAnswerResult.xpEarned })
                            : `Excellent! Correct answer! (+${formatPrice(lastAnswerResult.rewardEarned)} & +${lastAnswerResult.xpEarned} XP)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>
                          {t('games.incorrect_answer')}
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 3. COMPLETED STATE */}
          {gameState === 'completed' && (
            <div className="text-center space-y-6 py-2">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25 border border-emerald-300/40 animate-bounce">
                <Award className="w-10 h-10 text-slate-950" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white">
                  {t('games.congrats_completed')}
                </h3>
                <p className="text-xs text-slate-300">
                  {t('games.reward_added')}
                </p>
              </div>

              {/* Results Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-xs text-slate-400 mb-1">
                    {t('games.earned_credit')}
                  </div>
                  <div className="text-base font-bold text-emerald-400">{formatPrice(totalReward)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-xs text-slate-400 mb-1">
                    {t('games.xp_points')}
                  </div>
                  <div className="text-base font-bold text-cyan-400">+{totalXp} XP</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-xs text-slate-400 mb-1">
                    {t('games.correct_answers')}
                  </div>
                  <div className="text-base font-bold text-amber-400">{correctCount} / 10</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-xs text-slate-400 mb-1">
                    {t('games.validity')}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {t('games.48_hours')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn_shop_with_reward"
                  onClick={() => {
                    onClose();
                    if (onNavigateToShop) onNavigateToShop();
                  }}
                  className="flex-1 py-3 px-5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('games.shop_now_credit')}</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                >
                  {t('games.close')}
                </button>
              </div>
            </div>
          )}

          {/* 4. ERROR STATE */}
          {gameState === 'error' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">{t('games.notice')}</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">{errorMessage}</p>
              </div>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                {t('games.ok_got_it')}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Warning Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" dir={dir}>
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-sm text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-white text-base">
                {t('games.sure_exit')}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('games.leaving_warning')}
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={confirmExitAndCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {t('games.yes_exit')}
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                {t('games.continue_challenge')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
