import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  VisualPuzzleClient,
  FreeChallengeSettings,
  FreeChallengeRecentWinner,
  FreeChallengeUserStatus,
} from '../types';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

interface FreeChallengeContextType {
  isOpen: boolean;
  mode: 'challenge' | 'free_cart' | 'mystery_box' | 'duel' | 'practice';
  mysteryCategoryId?: string;
  sessionToken: string | null;
  activePuzzle: VisualPuzzleClient | null;
  activeGame: any | null;
  games: any[];
  isSubmitting: boolean;
  lastAnswerResult: {
    isCorrect?: boolean;
    isTimeout?: boolean;
    isCompleted?: boolean;
  } | null;
  isFinished: boolean;
  challengeResult: any;
  mysteryBoxProduct: any;
  activeWinCoupon: {
    couponCode: string;
    discountPercentage: number;
    token: string;
    expiresAt: string;
    rewardAmountKwd?: number;
  } | null;
  activeFreeVoucher: {
    voucherCode: string;
    token: string;
    expiresAt: string;
    maxAllowedSubtotal: number;
  } | null;
  activeWheelDiscount: {
    percentage: number;
    token: string;
    expiresAt: string;
    couponCode?: string;
  } | null;
  dailyAttemptsRemaining: number;
  maxDailyAttempts: number;
  recentWinners: FreeChallengeRecentWinner[];
  settings: FreeChallengeSettings | null;
  isAdWatching: boolean;
  openChallenge: (mode?: 'challenge' | 'free_cart' | 'mystery_box' | 'duel' | 'practice', mysteryCategory?: string, gameId?: string) => Promise<boolean>;
  closeChallenge: () => void;
  submitAnswer: (selectedIndex: number) => Promise<void>;
  reportSecurityEvent: (eventType: string, details: string, severity?: 'info' | 'warning' | 'danger') => void;
  claimExtraTimeFromFriend: (code: string) => Promise<boolean>;
  watchRewardedAd: () => Promise<boolean>;
  clearWinCoupon: () => void;
  clearFreeVoucher: () => void;
  clearWheelDiscount: () => void;
  fetchUserStatus: () => Promise<void>;
  fetchRecentWinners: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchGames: () => Promise<void>;
}

const FreeChallengeContext = createContext<FreeChallengeContextType | undefined>(undefined);

const WIN_COUPON_STORAGE_KEY = 'mq_active_win_coupon';
const VOUCHER_STORAGE_KEY = 'mq_active_free_voucher';
const DISCOUNT_STORAGE_KEY = 'mq_active_wheel_discount';

export const FreeChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { sessionId } = useCart();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'challenge' | 'free_cart' | 'mystery_box' | 'duel' | 'practice'>('challenge');
  const [mysteryCategoryId, setMysteryCategoryId] = useState<string | undefined>(undefined);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<VisualPuzzleClient | null>(null);
  const [activeGame, setActiveGame] = useState<any | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [challengeResult, setChallengeResult] = useState<any>(null);
  const [mysteryBoxProduct, setMysteryBoxProduct] = useState<any>(null);
  const [isAdWatching, setIsAdWatching] = useState(false);

  const [dailyAttemptsRemaining, setDailyAttemptsRemaining] = useState<number>(2);
  const [maxDailyAttempts, setMaxDailyAttempts] = useState<number>(2);
  const [recentWinners, setRecentWinners] = useState<FreeChallengeRecentWinner[]>([]);
  const [settings, setSettings] = useState<FreeChallengeSettings | null>(null);

  // Active Win Discount Coupon
  const [activeWinCoupon, setActiveWinCoupon] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(WIN_COUPON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  // Active Legacy Vouchers / Discounts
  const [activeFreeVoucher, setActiveFreeVoucher] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(VOUCHER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [activeWheelDiscount, setActiveWheelDiscount] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(DISCOUNT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const effectiveUserId = user?.id || user?.phone || sessionId;

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/free-challenge/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch challenge settings:', err);
    }
  }, []);

  // Fetch Games List
  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/free-challenge/games');
      const data = await res.json();
      if (data.success && Array.isArray(data.games)) {
        setGames(data.games);
      }
    } catch (err) {
      console.error('Failed to fetch challenge games:', err);
    }
  }, []);

  // Fetch Winners
  const fetchRecentWinners = useCallback(async () => {
    try {
      const res = await fetch('/api/free-challenge/winners');
      const data = await res.json();
      if (data.success && Array.isArray(data.winners)) {
        setRecentWinners(data.winners);
      }
    } catch (err) {
      console.error('Failed to fetch recent winners:', err);
    }
  }, []);

  // Fetch User Status
  const fetchUserStatus = useCallback(async () => {
    if (!effectiveUserId) return;
    try {
      const res = await fetch(`/api/free-challenge/user-status?userId=${encodeURIComponent(effectiveUserId)}&sessionId=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (data.success) {
        setDailyAttemptsRemaining(data.dailyAttemptsRemaining ?? 2);
        setMaxDailyAttempts(data.maxDailyAttempts ?? 2);
      }
    } catch (err) {
      console.error('Failed to fetch user status:', err);
    }
  }, [effectiveUserId, sessionId]);

  useEffect(() => {
    fetchSettings();
    fetchGames();
    fetchRecentWinners();
    fetchUserStatus();
  }, [fetchSettings, fetchGames, fetchRecentWinners, fetchUserStatus]);

  // Anti-Cheat & Visibility Monitor
  const reportSecurityEvent = useCallback(
    async (eventType: string, details: string, severity: 'info' | 'warning' | 'danger' = 'warning') => {
      try {
        await fetch('/api/free-challenge/security-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType,
            details,
            severity,
            userId: effectiveUserId,
          }),
        });
      } catch {}
    },
    [effectiveUserId]
  );

  useEffect(() => {
    if (!isOpen || !sessionToken || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportSecurityEvent('VISIBILITY_CHANGE', 'المستخدم غادر نافذة التحدي أو بدّل التبويب أثناء حل اللغز', 'warning');
      }
    };

    const handleBlur = () => {
      reportSecurityEvent('VISIBILITY_CHANGE', 'المتصفح فقد التركيز (Blur) أثناء التحدي', 'info');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isOpen, sessionToken, isFinished, reportSecurityEvent]);

  // Start / Open Challenge
  const openChallenge = async (
    targetMode: 'challenge' | 'free_cart' | 'mystery_box' | 'duel' | 'practice' = 'challenge',
    mysteryCat?: string,
    gameId?: string
  ): Promise<boolean> => {
    // If no gameId is provided, just open the Game Selection screen!
    if (!gameId) {
      setIsOpen(true);
      setActivePuzzle(null);
      setActiveGame(null);
      setSessionToken(null);
      setIsFinished(false);
      setChallengeResult(null);
      fetchGames();
      fetchUserStatus();
      return true;
    }

    try {
      setIsSubmitting(true);
      const guaranteedSessionId = sessionId || localStorage.getItem('mq_session_id') || `sess_${Date.now()}`;
      const activeUserId = user?.uid || (user as any)?.id || user?.email || user?.phoneNumber || guaranteedSessionId;

      const res = await fetch('/api/free-challenge/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUserId,
          displayName: user?.displayName || 'متسوق متميز',
          sessionId: guaranteedSessionId,
          mode: targetMode,
          mysteryCategoryId: mysteryCat,
          gameId,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success) {
        alert(data.error || 'تعذر بدء التحدي');
        return false;
      }

      setMode(targetMode);
      setMysteryCategoryId(mysteryCat);
      setSessionToken(data.sessionToken);
      setActivePuzzle(data.firstPuzzle);
      if (gameId && games.length > 0) {
        const foundGame = games.find((g) => g.id === gameId);
        setActiveGame(foundGame || data.game || null);
      } else {
        setActiveGame(data.game || null);
      }
      setLastAnswerResult(null);
      setIsFinished(false);
      setChallengeResult(null);
      setMysteryBoxProduct(null);
      setIsOpen(true);
      fetchUserStatus();
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      alert('حدث خطأ في الاتصال بالخادم، يرجى المحاولة مرة أخرى');
      return false;
    }
  };

  const closeChallenge = () => {
    setIsOpen(false);
    setActivePuzzle(null);
    setActiveGame(null);
    setSessionToken(null);
    setIsFinished(false);
    setLastAnswerResult(null);
    fetchUserStatus();
  };

  // Submit Answer
  const submitAnswer = async (selectedIndex: number) => {
    if (!sessionToken || !activePuzzle || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/free-challenge/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          puzzleId: activePuzzle.puzzleId,
          selectedIndex,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success && data.error) {
        alert(data.error);
        return;
      }

      setLastAnswerResult({
        isCorrect: data.isCorrect,
        isTimeout: data.isTimeout,
        isCompleted: data.isCompleted,
      });

      if (data.isCompleted) {
        setIsFinished(true);
        setChallengeResult(data.result);
        if (data.mysteryBoxProduct) {
          setMysteryBoxProduct(data.mysteryBoxProduct);
        }

        // If Won: save Discount Coupon
        if (data.result?.won && data.result?.discountCoupon) {
          const c = data.result.discountCoupon;
          setActiveWinCoupon(c);
          localStorage.setItem(WIN_COUPON_STORAGE_KEY, JSON.stringify(c));
          // Clear any conflicting discount
          setActiveWheelDiscount(null);
          localStorage.removeItem(DISCOUNT_STORAGE_KEY);
        } else if (data.result?.won && data.result?.freeCartVoucher) {
          // Legacy support
          const v = data.result.freeCartVoucher;
          setActiveFreeVoucher(v);
          localStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(v));
          setActiveWheelDiscount(null);
          localStorage.removeItem(DISCOUNT_STORAGE_KEY);
        }

        // If Lost: save Wheel Discount
        if (!data.result?.won && data.result?.discountWon) {
          const d = data.result.discountWon;
          setActiveWheelDiscount(d);
          localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(d));
        }

        fetchRecentWinners();
        fetchUserStatus();
        window.dispatchEvent(new CustomEvent('wallet-refresh'));
        window.dispatchEvent(new CustomEvent('gamification-refresh'));
      } else if (data.nextPuzzle) {
        // Smooth transition to next visual puzzle
        setTimeout(() => {
          setActivePuzzle(data.nextPuzzle);
          setLastAnswerResult(null);
        }, 700);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      alert('حدث خطأ في إرسال الإجابة');
    }
  };

  // Ask a Friend bonus (+5s time or retry)
  const claimExtraTimeFromFriend = async (code: string): Promise<boolean> => {
    // Simulated friend verification
    return true;
  };

  // Rewarded Ad Watch
  const watchRewardedAd = async (): Promise<boolean> => {
    setIsAdWatching(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsAdWatching(false);
        setDailyAttemptsRemaining((prev) => prev + 1);
        resolve(true);
      }, 8000); // 8-second interactive stationery showcase ad
    });
  };

  const clearWinCoupon = () => {
    setActiveWinCoupon(null);
    localStorage.removeItem(WIN_COUPON_STORAGE_KEY);
  };

  const clearFreeVoucher = () => {
    setActiveFreeVoucher(null);
    localStorage.removeItem(VOUCHER_STORAGE_KEY);
  };

  const clearWheelDiscount = () => {
    setActiveWheelDiscount(null);
    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
  };

  return (
    <FreeChallengeContext.Provider
      value={{
        isOpen,
        mode,
        mysteryCategoryId,
        sessionToken,
        activePuzzle,
        activeGame,
        games,
        isSubmitting,
        lastAnswerResult,
        isFinished,
        challengeResult,
        mysteryBoxProduct,
        activeWinCoupon,
        activeFreeVoucher,
        activeWheelDiscount,
        dailyAttemptsRemaining,
        maxDailyAttempts,
        recentWinners,
        settings,
        isAdWatching,
        openChallenge,
        closeChallenge,
        submitAnswer,
        reportSecurityEvent,
        claimExtraTimeFromFriend,
        watchRewardedAd,
        clearWinCoupon,
        clearFreeVoucher,
        clearWheelDiscount,
        fetchUserStatus,
        fetchRecentWinners,
        fetchSettings,
        fetchGames,
      }}
    >
      {children}
    </FreeChallengeContext.Provider>
  );
};

export const useFreeChallenge = () => {
  const context = useContext(FreeChallengeContext);
  if (!context) {
    return {
      isOpen: false,
      mode: 'challenge' as const,
      mysteryCategoryId: undefined,
      sessionToken: null,
      activePuzzle: null,
      activeGame: null,
      games: [],
      isSubmitting: false,
      lastAnswerResult: null,
      isFinished: false,
      challengeResult: null,
      mysteryBoxProduct: null,
      activeWinCoupon: null,
      activeFreeVoucher: null,
      activeWheelDiscount: null,
      dailyAttemptsRemaining: 0,
      maxDailyAttempts: 0,
      recentWinners: [],
      settings: null,
      isAdWatching: false,
      openChallenge: async () => false,
      closeChallenge: () => {},
      submitAnswer: async () => {},
      reportSecurityEvent: () => {},
      claimExtraTimeFromFriend: async () => false,
      watchRewardedAd: async () => false,
      clearWinCoupon: () => {},
      clearFreeVoucher: () => {},
      clearWheelDiscount: () => {},
      fetchUserStatus: async () => {},
      fetchRecentWinners: async () => {},
      fetchSettings: async () => {},
      fetchGames: async () => {},
    };
  }
  return context;
};
