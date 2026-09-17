import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserWallet, GamificationSettings } from '../types';
import { fetchGamificationStatus } from '../lib/api';
import { useAuth } from './AuthContext';

interface GamificationContextType {
  userId: string;
  displayName: string;
  setDisplayName: (name: string) => void;
  profile: UserProfile | null;
  wallet: UserWallet | null;
  settings: GamificationSettings | null;
  loading: boolean;
  isChallengeModalOpen: boolean;
  openChallengeModal: () => void;
  closeChallengeModal: () => void;
  refreshGamification: () => Promise<void>;
  playSound: (type: 'correct' | 'wrong' | 'complete' | 'level_up') => void;
  showEntryBanner: boolean;
  dismissEntryBanner: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const BANNER_SEEN_KEY = 'maktaba_q8_challenge_banner_seen';

const DEFAULT_SETTINGS: GamificationSettings = {
  isEnabled: true,
  questionsPerChallenge: 10,
  timePerQuestionSeconds: 15,
  dailyAttemptsLimit: 3,
  rewardExpiryHours: 48,
  maxWalletUsagePercent: 50,
  autoShowChallengeOnEntry: true,
  autoShowFrequency: 'once_per_session',
  enableAchievements: true,
  enableLeaderboard: true,
  defaultRewardAmount: 0.5,
  defaultXpPerCorrectAnswer: 10,
  challengeCompletionBonusXp: 50,
  tiers: [
    {
      id: 'bronze',
      name: 'المستوى البرونزي',
      minXp: 0,
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      iconName: 'Shield',
      perksDescription: 'مكافأة 0.500 د.ك لكل إجابة صحيحة',
    },
    {
      id: 'silver',
      name: 'المستوى الفضي',
      minXp: 200,
      badgeColor: '#64748b',
      badgeBg: '#f1f5f9',
      iconName: 'ShieldCheck',
      perksDescription: 'مكافأة 0.500 د.ك + 10% بونص نقاط خبرة',
    },
    {
      id: 'gold',
      name: 'المستوى الذهبي',
      minXp: 500,
      badgeColor: '#f59e0b',
      badgeBg: '#fffbeb',
      iconName: 'Crown',
      perksDescription: 'مكافأة 0.500 د.ك + 20% بونص نقاط خبرة',
    },
    {
      id: 'platinum',
      name: 'المستوى البلاتيني',
      minXp: 1200,
      badgeColor: '#06b6d4',
      badgeBg: '#ecfeff',
      iconName: 'Sparkles',
      perksDescription: 'مكافأة 0.500 د.ك + محاولات إضافية يومياً',
    },
    {
      id: 'diamond',
      name: 'المستوى الماسي',
      minXp: 2500,
      badgeColor: '#8b5cf6',
      badgeBg: '#f5f3ff',
      iconName: 'Gem',
      perksDescription: 'أعلى نسبة خصم ومكافآت حصرية لرواد المكتبة',
    },
  ],
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, wallet: authWallet, openAuthModal } = useAuth();

  const userId = user ? user.uid : '';
  const displayName = (userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'عميل المتجر');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [settings, setSettings] = useState<GamificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [showEntryBanner, setShowEntryBanner] = useState<boolean>(true);
  const [pendingChallengeStart, setPendingChallengeStart] = useState<boolean>(false);

  const setDisplayName = useCallback((_name: string) => {
    // Synced via AuthContext
  }, []);

  const refreshGamification = useCallback(async () => {
    try {
      const data = await fetchGamificationStatus(userId || 'guest_user', displayName);
      if (data.success) {
        if (data.profile && userId) setProfile(data.profile);
        if (data.wallet && userId) setWallet(data.wallet);
        if (data.settings) setSettings(data.settings);

        // Check if entry banner should be shown
        if (data.settings?.isEnabled !== false) {
          const hasSeen = sessionStorage.getItem(BANNER_SEEN_KEY);
          if (!hasSeen) {
            setShowEntryBanner(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load gamification status:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, displayName]);

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
    if (authWallet) {
      setWallet(authWallet);
    }
  }, [userProfile, authWallet]);

  useEffect(() => {
    refreshGamification();
    const handleRefresh = () => {
      refreshGamification();
    };
    window.addEventListener('wallet-refresh', handleRefresh);
    window.addEventListener('gamification-refresh', handleRefresh);
    return () => {
      window.removeEventListener('wallet-refresh', handleRefresh);
      window.removeEventListener('gamification-refresh', handleRefresh);
    };
  }, [refreshGamification]);

  // If user logs in while having a pending challenge start, open challenge modal immediately
  useEffect(() => {
    if (user && pendingChallengeStart) {
      setPendingChallengeStart(false);
      setIsChallengeModalOpen(true);
      setShowEntryBanner(false);
    }
  }, [user, pendingChallengeStart]);

  const openChallengeModal = useCallback(() => {
    if (!user) {
      setPendingChallengeStart(true);
      openAuthModal('login');
      return;
    }
    setIsChallengeModalOpen(true);
    setShowEntryBanner(false);
  }, [user, openAuthModal]);

  const closeChallengeModal = useCallback(() => {
    setIsChallengeModalOpen(false);
    refreshGamification();
  }, [refreshGamification]);

  const dismissEntryBanner = useCallback(() => {
    setShowEntryBanner(false);
    sessionStorage.setItem(BANNER_SEEN_KEY, 'true');
  }, []);

  // Web Audio Synth for subtle native sound effects
  const playSound = useCallback((type: 'correct' | 'wrong' | 'complete' | 'level_up') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.25); // D3
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'complete' || type === 'level_up') {
        // Arpeggio chime
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const startTime = ctx.currentTime + idx * 0.08;
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });
      }
    } catch {
      // Ignore audio context errors if blocked by browser policy
    }
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        userId,
        displayName,
        setDisplayName,
        profile,
        wallet,
        settings,
        loading,
        isChallengeModalOpen,
        openChallengeModal,
        closeChallengeModal,
        refreshGamification,
        playSound,
        showEntryBanner,
        dismissEntryBanner,
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
