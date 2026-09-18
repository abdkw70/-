import React, { useState, useEffect } from 'react';
import { useFreeChallenge } from '../../context/FreeChallengeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Trophy, Sparkles, Gift, Flame, Award } from 'lucide-react';

export const LiveWinnersTicker: React.FC = () => {
  const { recentWinners, settings } = useFreeChallenge();
  const { t, isRtl, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const tickerConfig = settings?.tickerSettings || {
    enabled: true,
    speedSeconds: 25,
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    showAvatar: true,
    showPrizeAmount: true,
    showTimestamp: true,
    customPrefixText: t('games.recent_winners'),
  };

  useEffect(() => {
    if (!recentWinners || recentWinners.length === 0) return;
    const intervalTime = Math.max(3000, Math.floor((tickerConfig.speedSeconds || 25) * 200));
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentWinners.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [recentWinners, tickerConfig.speedSeconds]);

  if (settings && !settings.gameEnabled) return null;
  if (tickerConfig.enabled === false) return null;
  if (!recentWinners || recentWinners.length === 0) return null;

  const currentWinner = recentWinners[currentIndex];
  if (!currentWinner) return null;

  const timeAgoFormatted = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
      if (diff <= 1) return t('games.just_now');
      if (diff < 60) return t('games.mins_ago', '', { diff });
      const hours = Math.floor(diff / 60);
      return t('games.hours_ago', '', { hours });
    } catch {
      return '';
    }
  };

  const prefixText = tickerConfig.customPrefixText
    ? tickerConfig.customPrefixText
    : t('games.recent_winners');

  return (
    <div
      id="live_winners_ticker"
      style={{
        backgroundColor: tickerConfig.backgroundColor || '#0f172a',
        color: tickerConfig.textColor || '#f8fafc',
      }}
      className="w-full border-y border-amber-500/20 py-2 px-4 overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Dynamic Label Badge */}
        <div className="flex items-center gap-1.5 text-amber-400 font-black shrink-0">
          <Flame className="w-4 h-4 animate-bounce text-amber-400" />
          <span className="hidden sm:inline">{prefixText}</span>
          <span className="sm:hidden">{t('games.winners_label')}</span>
        </div>

        {/* Dynamic Winner Message with Fade transition */}
        <div
          key={currentIndex}
          className="flex-1 flex items-center justify-center sm:justify-start gap-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {tickerConfig.showAvatar !== false && (
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-[10px] font-black shrink-0">
              {currentWinner.userName ? currentWinner.userName.charAt(0) : '🎁'}
            </div>
          )}

          <span className="font-bold shrink-0 opacity-95">
            {currentWinner.userName}
          </span>

          <span className="opacity-40 shrink-0">•</span>

          <span className="font-semibold truncate text-amber-300">
            {currentWinner.rewardTitle}
          </span>

          {tickerConfig.showTimestamp !== false && currentWinner.timestamp && (
            <span className="text-[10px] opacity-60 shrink-0 hidden md:inline">
              ({timeAgoFormatted(currentWinner.timestamp)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
