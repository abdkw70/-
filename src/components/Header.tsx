import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  Package,
  Layers,
  MapPin,
  MessageCircle,
  XCircle,
  Award,
  Trophy,
  Globe,
  User,
  Shield,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useFreeChallenge } from '../context/FreeChallengeContext';
import { useLanguage } from '../context/LanguageContext';
import { Category } from '../types';
import * as api from '../lib/api';
import { HeaderGamificationWidget } from './gamification/HeaderGamificationWidget';

interface HeaderProps {
  categories: Category[];
  currentPath: string;
  onNavigate: (path: string, query?: Record<string, string>) => void;
}

export const Header: React.FC<HeaderProps> = ({ categories, currentPath, onNavigate }) => {
  const { totalItemsCount, openCart, wishlist, formatPrice } = useCart();
  const { user, userProfile, openAuthModal } = useAuth();
  const { wallet, profile } = useGamification();
  const { openChallenge } = useFreeChallenge();
  const { language, setLanguage, isRtl, dir, t, storeName, translateCategory, translateProductTitle } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Group categories into roots and children
  const rootCategories = categories.filter(c => !c.parentId);

  // Instant autocomplete debouncer
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.fetchProductSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate('/shop', { q: searchQuery.trim() });
    }
  };

  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs" dir={dir}>
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-1 min-w-0">
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs font-medium min-w-0">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-tight">{t('topbar.free_shipping_notice')}</span>
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-300 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('checkout.cod')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0 ms-auto sm:ms-0">
            {/* Clear Language Switcher Segmented Control */}
            <div
              id="language-switcher-topbar"
              className="inline-flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold shrink-0"
            >
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'ar'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="العربية"
              >
                العربية 🇦🇪
              </button>
              <span className="text-slate-600 px-0.5">|</span>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="English"
              >
                English 🇬🇧
              </button>
            </div>

            <a
              href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium transition-colors shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t('topbar.our_location')}</span>
            </a>
            <a
              href="https://wa.me/96597123698"
              target="_blank"
              rel="noreferrer"
              className="hidden xs:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span dir="ltr">+965 97123698</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 md:gap-8 min-w-0">
          {/* Mobile menu toggle & Logo */}
          <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink-0">
            <button
              id="btn_mobile_menu_toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer touch-manipulation shrink-0 active:scale-95"
              aria-label={t('nav.menu')}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Store Brand / Logo */}
            <button
              onClick={() => onNavigate('/')}
              className={`flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0 ${isRtl ? 'text-right' : 'text-left'}`}
              aria-label={storeName}
            >
              <img
                src="https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png"
                alt={storeName}
                className="h-8 sm:h-12 w-auto max-w-[100px] xs:max-w-[125px] sm:max-w-none object-contain shrink-0 transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('/favicon.svg')) {
                    target.src = '/favicon.svg';
                  }
                }}
              />
              <div className={`hidden sm:block ${isRtl ? 'text-right' : 'text-left'}`}>
                <span className="block text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {storeName}
                </span>
                <span className="block text-[10px] sm:text-[11px] font-semibold text-sky-700 uppercase tracking-wide">
                  {isRtl ? 'مكتبة ومستلزمات مدرسية في الكويت' : 'STATIONERY & SCHOOL SUPPLIES KUWAIT'}
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar with Live Suggestions */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder={t('nav.search_placeholder')}
                className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all shadow-xs ${
                  isRtl ? 'pr-11 pl-20' : 'pl-11 pr-20'
                }`}
              />
              <Search
                className={`w-5 h-5 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                  isRtl ? 'right-3.5' : 'left-3.5'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 ${
                    isRtl ? 'left-14' : 'right-14'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className={`absolute top-1/2 -translate-y-1/2 bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isRtl ? 'left-1.5' : 'right-1.5'
                }`}
              >
                {t('common.search')}
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50">
                  <span>{t('nav.search_results')}</span>
                  <span className="font-semibold text-sky-700">
                    {t('filter.showing_results', '', { count: suggestions.length })}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                        onNavigate(`/product/${encodeURIComponent(s.handle || s.id)}`);
                      }}
                      className={`w-full p-2.5 flex items-center gap-3 hover:bg-sky-50/60 transition-colors cursor-pointer ${
                        isRtl ? 'text-right' : 'text-left'
                      }`}
                    >
                      <img
                        src={s.image || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
                        alt={translateProductTitle(s)}
                        className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {translateProductTitle(s)}
                        </div>
                        {s.categoryName && (
                          <div className="text-xs text-slate-500">
                            {translateCategory(s.categoryName)}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-sky-700 shrink-0">
                        {formatPrice(s.price)}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
                  >
                    {t('common.view_all')} ("{searchQuery}")
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions (Gamification, Wishlist, Track Order, Cart) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <HeaderGamificationWidget onNavigate={(p) => onNavigate(p.startsWith('/') ? p : `/${p}`)} />

            <button
              id="btn_header_track_order"
              onClick={() => onNavigate('/track-order')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100/90 hover:text-sky-700 hover:bg-slate-200/90 border border-slate-200 rounded-xl transition-all cursor-pointer shrink-0 min-h-[38px] shadow-2xs"
              title={t('nav.track_order')}
            >
              <Package className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="whitespace-nowrap">{t('nav.track_order')}</span>
            </button>

            <button
              id="btn_header_wishlist"
              onClick={() => onNavigate('/shop', { wishlist: 'true' })}
              className="relative hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50/90 hover:bg-rose-100 border border-rose-200/90 rounded-xl transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 min-h-[38px] shadow-2xs"
              title={t('nav.wishlist')}
              aria-label={t('nav.wishlist')}
            >
              <div className="relative flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-500/20 shrink-0" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="whitespace-nowrap">{t('nav.wishlist', 'المفضلة')}</span>
            </button>

            {/* Admin Link for Admin Users */}
            {user && userProfile?.role === 'admin' && (
              <button
                id="btn_header_admin_dashboard_desktop"
                onClick={() => onNavigate('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs min-h-[38px]"
                title={isRtl ? 'مركز التحكم' : 'Admin'}
              >
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">{isRtl ? 'الإدارة' : 'Admin'}</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              id="btn_header_cart"
              onClick={openCart}
              className="flex items-center gap-2 bg-sky-700 hover:bg-sky-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 touch-manipulation min-h-[38px] justify-center active:scale-95 border border-sky-600"
              aria-label={t('nav.cart')}
              title={t('nav.cart')}
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 stroke-[2.2] shrink-0" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs ring-2 ring-sky-700">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="font-bold text-xs whitespace-nowrap">{t('nav.cart')}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('nav.search_placeholder')}
              className={`w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 text-slate-900 ${
                isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
            <Search
              className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                isRtl ? 'right-3' : 'left-3'
              }`}
            />
          </form>
        </div>
      </div>

      {/* Desktop Navigation Mega-Menu */}
      <nav className="hidden lg:block bg-slate-50/90 border-t border-slate-200/80 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs font-semibold text-slate-700 py-1">
            <li>
              <button
                onClick={() => onNavigate('/')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentPath === '/' ? 'text-sky-700 bg-sky-50 font-bold' : 'hover:text-sky-700 hover:bg-slate-100'
                }`}
              >
                <span>{t('nav.home')}</span>
              </button>
            </li>

            {rootCategories.map(cat => {
              const subcats = getSubcategories(cat.id);
              const hasSubs = subcats.length > 0;
              const isCatActive = currentPath === `/category/${cat.handle}`;
              const translatedCat = translateCategory(cat);

              return (
                <li
                  key={cat.id}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(cat.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => onNavigate(`/category/${cat.handle}`)}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      isCatActive
                        ? 'text-sky-700 bg-sky-50 font-bold'
                        : 'hover:text-sky-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{translatedCat}</span>
                    {hasSubs && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-700 transition-transform group-hover:rotate-180" />
                    )}
                  </button>

                  {/* Subcategories Dropdown */}
                  {hasSubs && (
                    <div
                      className={`absolute top-full w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50 ${
                        isRtl ? 'right-0 text-right' : 'left-0 text-left'
                      }`}
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                        {translatedCat}
                      </div>
                      {subcats.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => onNavigate('/shop', { category: cat.title, subcategory: sub.title })}
                          className={`w-full px-3.5 py-2 text-xs text-slate-700 hover:text-sky-700 hover:bg-sky-50/60 flex items-center justify-between transition-colors cursor-pointer ${
                            isRtl ? 'text-right' : 'text-left'
                          }`}
                        >
                          <span>{translateCategory(sub)}</span>
                          {sub.productCount ? (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                              {sub.productCount}
                            </span>
                          ) : null}
                        </button>
                      ))}
                      <div className="p-2 border-t border-slate-100 mt-1">
                        <button
                          onClick={() => onNavigate(`/category/${cat.handle}`)}
                          className="w-full text-center text-xs font-bold text-sky-700 hover:underline cursor-pointer"
                        >
                          {t('common.view_all')} ({translatedCat})
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}

            {/* Gamification Challenge Link in Desktop Nav */}
            <li>
              <button
                id="btn_desktop_nav_challenge"
                onClick={() => openChallenge('challenge')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 border border-amber-500/40 text-amber-700 hover:text-amber-900 hover:border-amber-500 transition-all text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <Award className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{t('nav.challenges')}</span>
              </button>
            </li>

            {/* Special highlight tabs */}
            <li>
              <button
                onClick={() => onNavigate('/shop', { hasDiscount: 'true' })}
                className="px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1 font-bold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('nav.deals')}</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => onNavigate('/shop', { isNewArrival: 'true' })}
                className="px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>{t('nav.new_arrivals')}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Slide-Out Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" dir={dir}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`fixed inset-y-0 w-[min(340px,88vw)] max-w-sm bg-white shadow-2xl p-4 pt-safe pb-safe flex flex-col justify-between overflow-y-auto overscroll-contain z-10 ${
                isRtl ? 'right-0' : 'left-0'
              }`}
            >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img
                    src="https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png"
                    alt={storeName}
                    className="h-8 w-auto object-contain"
                  />
                  <span className="font-bold text-sm text-slate-900">{storeName}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Language Switcher */}
              <div className="my-2.5 p-2 bg-slate-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-700" />
                  <span>{isRtl ? 'اللغة' : 'Language'}</span>
                </span>
                <div className="inline-flex items-center p-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      language === 'ar' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    العربية 🇦🇪
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      language === 'en' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English 🇬🇧
                  </button>
                </div>
              </div>

              {/* Mobile User Card / Login Action */}
              <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950 text-white shadow-sm">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                          {user.displayName ? user.displayName.substring(0, 1) : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold truncate max-w-[130px]">
                            {userProfile?.displayName || user.displayName || t('nav.account')}
                          </p>
                          <p className="text-[10px] text-sky-200">
                            {profile?.currentTier || (isRtl ? 'المستوى البرونزي' : 'Bronze Member')}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {formatPrice(wallet?.activeBalance ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onNavigate('/account');
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-center cursor-pointer"
                      >
                        {t('account.profile_tab')}
                      </button>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onNavigate('/wallet');
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-bold text-center cursor-pointer"
                      >
                        {t('nav.wallet')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{storeName}</p>
                      <p className="text-[10px] text-slate-300">
                        {isRtl ? 'سجّل دخولك لكسب المكافآت والنقاط' : 'Sign in to unlock rewards and points'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal('login');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold shadow-xs hover:bg-amber-300 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isRtl ? 'تسجيل الدخول' : 'Sign In'}
                    </button>
                  </div>
                )}
              </div>

              {/* Challenge Launcher Button in Mobile Menu */}
              <button
                id="btn_mobile_menu_challenge"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openChallenge('challenge');
                }}
                className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black text-xs shadow-md flex items-center justify-between border border-amber-400 active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <span className="block font-black text-slate-950 text-xs">
                      {isRtl ? '🎯 تحدّى واربح خصمك الفوري' : '🎯 Instant Discount Challenges'}
                    </span>
                    <span className="block text-[10px] text-slate-900 font-medium">
                      {isRtl ? 'أجب عن الألغاز واربح خصومات إضافية حتى 25%' : 'Solve quick puzzles to win up to 25% off'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-slate-950 text-amber-300 text-[10px] font-bold shrink-0">
                  {isRtl ? 'ابدأ' : 'Play'}
                </span>
              </button>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/');
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between cursor-pointer ${
                    isRtl ? 'text-right' : 'text-left'
                  }`}
                >
                  <span>{t('nav.home')}</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/shop');
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 flex items-center justify-between cursor-pointer ${
                    isRtl ? 'text-right' : 'text-left'
                  }`}
                >
                  <span>{t('nav.all_products')}</span>
                  <Layers className="w-4 h-4 text-slate-400" />
                </button>

                <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase">
                  {t('filter.categories')}
                </div>

                {rootCategories.map(cat => {
                  const subcats = getSubcategories(cat.id);
                  const isExpanded = openDropdown === cat.id;
                  const catTitle = translateCategory(cat);

                  return (
                    <div key={cat.id} className="border-b border-slate-50 pb-1">
                      <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg">
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onNavigate(`/category/${cat.handle}`);
                          }}
                          className={`text-xs font-semibold text-slate-800 flex-1 cursor-pointer ${
                            isRtl ? 'text-right' : 'text-left'
                          }`}
                        >
                          {catTitle}
                        </button>
                        {subcats.length > 0 && (
                          <button
                            onClick={() => setOpenDropdown(isExpanded ? null : cat.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {isExpanded && subcats.length > 0 && (
                        <div
                          className={`space-y-1 bg-slate-50/70 py-1.5 rounded-lg my-1 ${
                            isRtl ? 'pr-4 pl-2' : 'pl-4 pr-2'
                          }`}
                        >
                          {subcats.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                onNavigate('/shop', { category: cat.title, subcategory: sub.title });
                              }}
                              className={`w-full px-2.5 py-1.5 text-xs text-slate-600 hover:text-sky-700 block cursor-pointer ${
                                isRtl ? 'text-right' : 'text-left'
                              }`}
                            >
                              {translateCategory(sub)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-3 space-y-1">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('/shop', { hasDiscount: 'true' });
                    }}
                    className={`w-full px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 rounded-lg flex items-center justify-between cursor-pointer ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span>{t('nav.deals')}</span>
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('/track-order');
                    }}
                    className={`w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-between cursor-pointer ${
                      isRtl ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span>{t('nav.track_order')}</span>
                    <Package className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Contact & Maps */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <a
                href="https://wa.me/96597123698"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span dir="ltr">+965 97123698 ({isRtl ? 'واتساب' : 'WhatsApp'})</span>
              </a>

              <a
                href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                target="_blank"
                rel="noreferrer"
                className="w-full bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{t('topbar.our_location')}</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </header>
  );
};
