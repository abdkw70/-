import React from 'react';
import { Home, Grid, Award, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath, onNavigate }) => {
  const { cart, openCart, wishlist } = useCart();
  const { t, isRtl } = useLanguage();
  const { openChallengeModal } = useGamification();

  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  const isHome = currentPath === '/' || currentPath === '';
  const isShop = currentPath === '/shop' || currentPath.startsWith('/category/');

  return (
    <nav
      id="mobile_bottom_nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-all"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {/* 1. Home */}
        <button
          id="btn_bottom_nav_home"
          type="button"
          onClick={() => onNavigate('/')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 h-full rounded-xl transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
            isHome
              ? 'text-sky-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-label={t('nav.home')}
          aria-current={isHome ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center">
            <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isHome && (
              <span className="absolute -bottom-1 w-1 h-1 bg-sky-700 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {t('nav.home')}
          </span>
        </button>

        {/* 2. Shop / Catalog */}
        <button
          id="btn_bottom_nav_shop"
          type="button"
          onClick={() => onNavigate('/shop')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 h-full rounded-xl transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
            isShop
              ? 'text-sky-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-label={t('nav.shop')}
          aria-current={isShop ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center">
            <Grid className={`w-5 h-5 transition-transform ${isShop ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isShop && (
              <span className="absolute -bottom-1 w-1 h-1 bg-sky-700 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {t('nav.shop')}
          </span>
        </button>

        {/* 3. Games / XP Hub */}
        <button
          id="btn_bottom_nav_challenge"
          type="button"
          onClick={() => onNavigate('/games')}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 h-full rounded-xl text-amber-600 hover:text-amber-700 font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-95 group"
          aria-label={t('games.play_win')}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[64px] text-amber-700 font-extrabold">
            {t('games.play_win_short')}
          </span>
        </button>

        {/* 4. Wishlist */}
        <button
          id="btn_bottom_nav_wishlist"
          type="button"
          onClick={() => onNavigate('/shop', { wishlist: 'true' })}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 h-full rounded-xl text-slate-500 hover:text-rose-600 font-medium transition-all cursor-pointer touch-manipulation select-none active:scale-95"
          aria-label={t('nav.wishlist')}
        >
          <div className="relative flex items-center justify-center">
            <Heart className="w-5 h-5 stroke-[1.8]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[64px]">
            {t('nav.wishlist')}
          </span>
        </button>

        {/* 5. Cart (PRIMARY ACTION) */}
        <button
          id="btn_bottom_nav_cart"
          type="button"
          onClick={openCart}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 h-full rounded-xl text-sky-800 hover:text-sky-950 font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-95 relative"
          aria-label={t('nav.cart')}
        >
          <div className="relative flex items-center justify-center">
            <div className="p-1 rounded-xl bg-sky-50 text-sky-700">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-in zoom-in-50">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[64px] font-extrabold text-sky-900">
            {t('nav.cart')}
          </span>
        </button>
      </div>
    </nav>
  );
};
