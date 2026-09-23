import React from 'react';
import { Zap, Crown, Award, User as UserIcon, LogIn } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderGamificationWidgetProps {
  onNavigate: (page: string) => void;
}

export const HeaderGamificationWidget: React.FC<HeaderGamificationWidgetProps> = ({ onNavigate }) => {
  const { userXp, levelProgress } = useGamification();
  const { user, openAuthModal } = useAuth();
  const { isRtl } = useLanguage();

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      {/* Games & XP Hub Button */}
      <button
        id="btn_header_games"
        onClick={() => onNavigate('/games')}
        className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 border border-amber-500/40 text-amber-800 hover:text-amber-950 hover:border-amber-500 transition-all text-xs font-black shadow-2xs cursor-pointer active:scale-95 shrink-0 touch-manipulation min-h-[36px] justify-center"
        title={isRtl ? 'الألعاب ونقاط XP' : 'Games & XP Hub'}
      >
        <Zap className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="whitespace-nowrap">
          {userXp ? `${userXp.totalXp} XP` : (isRtl ? 'الألعاب والجوائز' : 'Games Hub')}
        </span>
        {levelProgress && (
          <span className="bg-amber-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full">
            L{levelProgress.currentLevel}
          </span>
        )}
      </button>

      {/* Account / Login button */}
      {!user ? (
        <button
          onClick={openAuthModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer min-h-[36px]"
        >
          <LogIn className="w-4 h-4 text-slate-600" />
          <span>{isRtl ? 'دخول' : 'Sign In'}</span>
        </button>
      ) : (
        <button
          onClick={() => onNavigate('/account')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer min-h-[36px]"
        >
          <UserIcon className="w-4 h-4 text-indigo-600" />
          <span>{isRtl ? 'حسابي' : 'Account'}</span>
        </button>
      )}
    </div>
  );
};
