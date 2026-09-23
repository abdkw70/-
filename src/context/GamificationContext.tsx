import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserXPRecord,
  Season,
  GameConfig,
  XpRulesConfig,
  DailyChallengeConfig,
  LeaderboardUserEntry,
} from '../types';
import { useAuth } from './AuthContext';

interface LevelProgressInfo {
  currentLevel: number;
  currentLevelMinXp: number;
  nextLevelMinXp: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
}

interface UserRankInfo {
  rank: number;
  seasonXp: number;
  totalXp: number;
  level: number;
  xpToNextRank: number | null;
}

interface GamificationContextType {
  userId: string;
  displayName: string;
  userXp: UserXPRecord | null;
  levelProgress: LevelProgressInfo | null;
  activeSeason: Season | null;
  userRank: UserRankInfo | null;
  dailyChallenges: Array<DailyChallengeConfig & { completed: boolean }>;
  allChallengesCompleted: boolean;
  xpRules: XpRulesConfig | null;
  games: GameConfig[];
  leaderboard: LeaderboardUserEntry[];
  loading: boolean;
  refreshGamification: () => Promise<void>;
  claimDailyLogin: () => Promise<any>;
  playGameAction: (gameId: string, actionResult?: any) => Promise<any>;
  recordProductViewXp: (productId: string) => Promise<any>;
  submitProductReviewXp: (params: { productId: string; reviewId?: string; rating: number; comment: string }) => Promise<any>;
  playSound: (type: 'correct' | 'wrong' | 'complete' | 'level_up' | 'xp_gain') => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();

  const userId = user ? user.uid : 'guest_user';
  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'متسابق المكتبة';

  const [userXp, setUserXp] = useState<UserXPRecord | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelProgressInfo | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [userRank, setUserRank] = useState<UserRankInfo | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<Array<DailyChallengeConfig & { completed: boolean }>>([]);
  const [allChallengesCompleted, setAllChallengesCompleted] = useState<boolean>(false);
  const [xpRules, setXpRules] = useState<XpRulesConfig | null>(null);
  const [games, setGames] = useState<GameConfig[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUserEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshGamification = useCallback(async () => {
    try {
      const [statusRes, gamesRes, leadRes] = await Promise.all([
        fetch(`/api/xp/status?userId=${encodeURIComponent(userId)}&displayName=${encodeURIComponent(displayName)}`),
        fetch('/api/games'),
        fetch('/api/leaderboard?limit=20'),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        if (data.success) {
          setUserXp(data.userXp);
          setLevelProgress(data.levelProgress);
          setActiveSeason(data.activeSeason);
          setUserRank(data.userRank);
          if (data.dailyChallenges) {
            setDailyChallenges(data.dailyChallenges.challenges || []);
            setAllChallengesCompleted(Boolean(data.dailyChallenges.allCompleted));
          }
          setXpRules(data.xpRules);
        }
      }

      if (gamesRes.ok) {
        const gData = await gamesRes.json();
        if (gData.success && Array.isArray(gData.games)) {
          setGames(gData.games);
        }
      }

      if (leadRes.ok) {
        const lData = await leadRes.json();
        if (lData.success && Array.isArray(lData.leaderboard)) {
          setLeaderboard(lData.leaderboard);
        }
      }
    } catch (err) {
      console.error('Failed to load XP gamification status:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, displayName]);

  useEffect(() => {
    refreshGamification();
  }, [refreshGamification]);

  const claimDailyLogin = useCallback(async () => {
    try {
      const res = await fetch('/api/xp/daily-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, displayName }),
      });
      const data = await res.json();
      if (data.success) {
        playSound('level_up');
        await refreshGamification();
      }
      return data;
    } catch (err) {
      console.error('Daily login claim error:', err);
      return { success: false, error: 'تعذر الاتصال بالسيرفر' };
    }
  }, [userId, displayName, refreshGamification]);

  const playGameAction = useCallback(async (gameId: string, actionResult?: any) => {
    try {
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, gameId, actionResult, displayName }),
      });
      const data = await res.json();
      if (data.success) {
        playSound('xp_gain');
        await refreshGamification();
      }
      return data;
    } catch (err) {
      console.error('Game play error:', err);
      return { success: false, error: 'تعذر الاتصال بالسيرفر' };
    }
  }, [userId, displayName, refreshGamification]);

  const recordProductViewXp = useCallback(async (productId: string) => {
    try {
      const res = await fetch('/api/xp/product-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, displayName }),
      });
      const data = await res.json();
      if (data.success && data.xpAwarded > 0) {
        refreshGamification();
      }
      return data;
    } catch (err) {
      return { success: false };
    }
  }, [userId, displayName, refreshGamification]);

  const submitProductReviewXp = useCallback(async (params: { productId: string; reviewId?: string; rating: number; comment: string }) => {
    try {
      const res = await fetch('/api/xp/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, displayName, ...params }),
      });
      const data = await res.json();
      if (data.success) {
        playSound('complete');
        await refreshGamification();
      }
      return data;
    } catch (err) {
      console.error('Review XP error:', err);
      return { success: false, error: 'تعذر إرسال التقييم' };
    }
  }, [userId, displayName, refreshGamification]);

  const playSound = useCallback((type: 'correct' | 'wrong' | 'complete' | 'level_up' | 'xp_gain') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'xp_gain' || type === 'correct') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'level_up' || type === 'complete') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioContext fallback ignored
    }
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        userId,
        displayName,
        userXp,
        levelProgress,
        activeSeason,
        userRank,
        dailyChallenges,
        allChallengesCompleted,
        xpRules,
        games,
        leaderboard,
        loading,
        refreshGamification,
        claimDailyLogin,
        playGameAction,
        recordProductViewXp,
        submitProductReviewXp,
        playSound,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
