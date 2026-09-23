import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Crown,
  Gamepad2,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Eye,
  MessageSquare,
  Flame,
  Shield,
  Star,
  Play,
  RotateCw,
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useLanguage } from '../context/LanguageContext';

import { getGameModule } from '../components/games/GameRegistry';

interface GamesPageProps {
  onNavigate: (path: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ onNavigate, showToast }) => {
  const { language, isRtl } = useLanguage();
  const {
    displayName,
    userXp,
    levelProgress,
    activeSeason,
    userRank,
    dailyChallenges,
    games,
    leaderboard,
    loading,
    claimDailyLogin,
    playGameAction,
    playSound,
  } = useGamification();

  const [activeGameModal, setActiveGameModal] = useState<string | null>(null);
  const [claimingLogin, setClaimingLogin] = useState<boolean>(false);

  const handleClaimDaily = async () => {
    setClaimingLogin(true);
    try {
      const res = await claimDailyLogin();
      if (res.success) {
        showToast(
          isRtl
            ? `🎉 تم تسجيل دخولك اليومي وحصلت على +${res.xpAwarded} XP!`
            : `🎉 Daily login claimed! You earned +${res.xpAwarded} XP!`,
          'success'
        );
      } else {
        showToast(res.error || (isRtl ? 'لقد قمت باستلام مكافأة اليوم بالفعل' : 'Already claimed today'), 'info');
      }
    } catch (err) {
      showToast(isRtl ? 'تعذر استلام المكافأة اليومية' : 'Failed to claim daily reward', 'error');
    } finally {
      setClaimingLogin(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-sky-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-black border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isRtl ? 'مركز الألعاب والتنافس الموسمية' : 'Games & XP Season Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {isRtl ? 'تنافس، العب، وارتقِ بمستواك في المكتبة!' : 'Play, Earn XP & Rank Up the Leaderboard!'}
            </h1>
            <p className="text-sm text-sky-100/80 leading-relaxed">
              {isRtl
                ? 'جمع نقاط الخبرة (XP) من الألعاب والتحديات اليومية لرفع مستواك والتنافس على جوائز الموسم القيمة للأوائل.'
                : 'Earn Experience Points (XP) from mini-games and daily activities to level up and win exclusive seasonal rewards.'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4 w-full md:w-auto">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
              <Zap className="w-8 h-8 fill-amber-400" />
            </div>
            <div>
              <span className="text-xs text-sky-200 block font-bold">{isRtl ? 'مجموع نقاطك' : 'Your Total XP'}</span>
              <span className="text-2xl font-black text-white">{userXp?.totalXp || 0} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: User Level Card & Active Season Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Level Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                {userXp?.level || 1}
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">
                  {displayName} <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">المستوى {userXp?.level || 1}</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {isRtl ? 'الرتبة الموسمية:' : 'Season Rank:'} <strong className="text-indigo-600">#{userRank?.rank || 'غير محدد'}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={handleClaimDaily}
              disabled={claimingLogin}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all transform active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>{claimingLogin ? (isRtl ? 'جاري الاستلام...' : 'Claiming...') : (isRtl ? 'تسجيل الدخول اليومي (+50 XP)' : 'Daily Check-in (+50 XP)')}</span>
            </button>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>المستوى {levelProgress?.currentLevel || 1}</span>
              <span className="text-amber-600 font-black">{levelProgress?.xpInCurrentLevel || 0} / {levelProgress?.xpRequiredForNextLevel || 200} XP</span>
              <span>المستوى {(levelProgress?.currentLevel || 1) + 1}</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${levelProgress?.progressPercent || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center pt-1">
              {isRtl
                ? `باقي ${(levelProgress?.xpRequiredForNextLevel || 200) - (levelProgress?.xpInCurrentLevel || 0)} XP للانتقال إلى المستوى التالي`
                : `${(levelProgress?.xpRequiredForNextLevel || 200) - (levelProgress?.xpInCurrentLevel || 0)} XP needed for next level`}
            </p>
          </div>
        </div>

        {/* Season Info Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-sm border border-indigo-800/40 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 font-black text-xs rounded-full border border-amber-400/30">
                🏆 {isRtl ? 'الموسم الحالي' : 'Active Season'}
              </span>
              <span className="text-xs text-indigo-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {isRtl ? 'مستمر الان' : 'Live Now'}
              </span>
            </div>

            <h3 className="font-black text-xl text-white">{activeSeason?.nameAr || 'موسم المكتبة الشتوي'}</h3>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              {activeSeason?.prizeDescriptionAr || 'جوائز عينية فاخرة وقسائم شراء للأوائل في متصدرين الموسم.'}
            </p>
          </div>

          <div className="pt-4 border-t border-indigo-800/60 flex items-center justify-between text-xs">
            <span className="text-indigo-200">{isRtl ? 'عدد الفائزين بالجوائز:' : 'Prizes for Top:'}</span>
            <span className="font-black text-amber-300 text-sm">{activeSeason?.numberOfWinners || 3} {isRtl ? 'متسابقين' : 'winners'}</span>
          </div>
        </div>
      </div>

      {/* Daily XP Tasks Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <span>{isRtl ? 'المهام اليومية وكسب النقاط' : 'Daily Tasks & XP Rewards'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{isRtl ? 'تصفح المنتجات' : 'Browse Products'}</h4>
                <p className="text-xs text-slate-400">{isRtl ? '+10 XP لكل منتج' : '+10 XP per view'}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
            >
              {isRtl ? 'تصفح الآن' : 'Browse'}
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{isRtl ? 'إضافة تقييم منتج' : 'Write a Review'}</h4>
                <p className="text-xs text-slate-400">{isRtl ? '+100 XP لكل تقييم' : '+100 XP per review'}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
            >
              {isRtl ? 'قيم منتجاً' : 'Review'}
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{isRtl ? 'تسجيل الدخول' : 'Daily Check-in'}</h4>
                <p className="text-xs text-slate-400">{isRtl ? '+50 XP يومياً' : '+50 XP daily'}</p>
              </div>
            </div>
            <button
              onClick={handleClaimDaily}
              disabled={claimingLogin}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold"
            >
              {isRtl ? 'استلام' : 'Claim'}
            </button>
          </div>
        </div>
      </div>

      {/* Mini Games Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-indigo-600" />
          <span>{isRtl ? 'الألعاب المصغرة التنافسية' : 'Competitive Mini-Games'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.filter(g => g.enabled).map(game => (
            <div
              key={game.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {game.icon === 'Disc' ? '🎡' : game.icon === 'HelpCircle' ? '🧠' : game.icon === 'Layers' ? '🃏' : '📚'}
                </div>
                <h3 className="font-black text-slate-800 text-lg">
                  {language === 'ar' ? game.nameAr : game.nameEn}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'ar' ? game.descriptionAr : game.descriptionEn}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-100 pt-2">
                  <span>المحاولات اليومية:</span>
                  <span className="text-indigo-600 font-extrabold">{game.dailyAttemptsLimit || 5} جولات</span>
                </div>
                <button
                  onClick={() => setActiveGameModal(game.id)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isRtl ? `العب الآن (+${game.xpPerAction || 100} XP)` : 'Play Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            <div>
              <h3 className="font-black text-slate-800 text-xl">{isRtl ? 'متصدرو الموسم الحالي' : 'Season Leaderboard'}</h3>
              <p className="text-xs text-slate-500">{isRtl ? 'أفضل 20 متسابقاً حائزاً على أعلى نقاط XP هذا الموسم' : 'Top 20 players this season'}</p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            🔒 {isRtl ? 'حماية الخصوصية مفعلة' : 'Privacy Protected'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                <th className="p-3.5 rounded-r-xl"># {isRtl ? 'الترتيب' : 'Rank'}</th>
                <th className="p-3.5">{isRtl ? 'اللاعب' : 'Player'}</th>
                <th className="p-3.5">{isRtl ? 'المستوى' : 'Level'}</th>
                <th className="p-3.5 text-left rounded-l-xl">{isRtl ? 'نقاط الموسم' : 'Season XP'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((item) => (
                <tr
                  key={item.userId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.isCurrentUser ? 'bg-amber-50/70 font-bold border-r-4 border-amber-500' : ''
                  }`}
                >
                  <td className="p-3.5">
                    {item.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-400 text-white rounded-full font-black text-xs shadow-sm">🥇 1</span>
                    ) : item.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-slate-300 text-slate-800 rounded-full font-black text-xs shadow-sm">🥈 2</span>
                    ) : item.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-700 text-white rounded-full font-black text-xs shadow-sm">🥉 3</span>
                    ) : (
                      <span className="font-bold text-slate-500 px-2">#{item.rank}</span>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">
                    {item.displayName}
                    {item.isCurrentUser && <span className="mr-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">(أنت)</span>}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-100">
                      المستوى {item.level}
                    </span>
                  </td>
                  <td className="p-3.5 text-left font-black text-amber-600 text-base">
                    {item.seasonXp.toLocaleString()} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC INTERACTIVE GAME MODAL */}
      {activeGameModal && (() => {
        const GameComponent = getGameModule(activeGameModal);
        const currentGameConfig = games.find(g => g.id === activeGameModal) || {
          id: activeGameModal,
          nameAr: 'اللعبة التفاعلية',
          xpPerAction: 100,
        };

        if (!GameComponent) {
          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 text-white rounded-3xl p-6 text-center space-y-4 max-w-sm w-full">
                <p className="font-bold text-sm">اللعبة قيد التحديث والبرمجة</p>
                <button
                  onClick={() => setActiveGameModal(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <GameComponent
              game={currentGameConfig}
              onClose={() => setActiveGameModal(null)}
              showToast={showToast}
              onGameComplete={async (score, metadata) => {
                const res = await playGameAction(activeGameModal, { score, ...metadata });
                if (res.success) {
                  playSound('xp_gain');
                }
                return res;
              }}
            />
          </div>
        );
      })()}
    </div>
  );
};
