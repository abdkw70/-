import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, BookOpen, Palette, Backpack, Award, Trophy, Coins, Zap } from 'lucide-react';
import { HeroSlider } from '../components/HeroSlider';
import { ProductCard } from '../components/ProductCard';
import { Category } from '../types';
import * as api from '../lib/api';
import { useGamification } from '../context/GamificationContext';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  categories: Category[];
  onNavigate: (path: string, query?: Record<string, string>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ categories, onNavigate }) => {
  const { openChallengeModal, profile, wallet, settings } = useGamification();
  const { dir, isRtl, language, t, formatPrice, translateCategory } = useLanguage();
  const [featuredData, setFeaturedData] = useState<api.FeaturedResponse | null>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'best' | 'discount'>('new');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.fetchFeatured();
        if (data.success) {
          setFeaturedData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const rootCategories = categories.filter(c => !c.parentId).slice(0, 8);

  const getCategoryIcon = (name: string) => {
    if (name.includes('شنط') || name.toLowerCase().includes('bag')) return <Backpack className="w-6 h-6 text-sky-600" />;
    if (name.includes('رسم') || name.includes('لوحات') || name.toLowerCase().includes('art')) return <Palette className="w-6 h-6 text-amber-600" />;
    if (name.includes('تعليم') || name.toLowerCase().includes('educat')) return <Award className="w-6 h-6 text-emerald-600" />;
    return <BookOpen className="w-6 h-6 text-indigo-600" />;
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-12 pb-16" dir={dir}>
      {/* Hero Banner Slider */}
      {featuredData?.heroBanners && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <HeroSlider banners={featuredData.heroBanners} onNavigate={onNavigate} />
        </section>
      )}

      {/* Top Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t('home.top_categories')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('home.top_categories_subtitle')}</p>
          </div>
          <button
            onClick={() => onNavigate('/shop')}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('home.view_all_categories')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {rootCategories.map(cat => {
            const catTitle = translateCategory(cat.title);
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate(`/category/${cat.handle}`)}
                className="group bg-white p-3.5 rounded-2xl border border-slate-100 hover:border-sky-300 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors overflow-hidden p-2 border border-slate-100">
                  {cat.image ? (
                    <img src={cat.image} alt={catTitle} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    getCategoryIcon(cat.title)
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-1">
                    {catTitle}
                  </h3>
                  {cat.productCount ? (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {cat.productCount} {t('common.products_count_suffix', 'منتج')}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Dynamic Showcase (Tabs: وصل حديثاً / الأكثر مبيعاً / التخفيضات) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border border-slate-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t('home.featured_picks')}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t('home.featured_picks_subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'new' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('home.new_arrivals')}
              </button>
              <button
                onClick={() => setActiveTab('best')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'best' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('home.best_sellers')}
              </button>
              <button
                onClick={() => setActiveTab('discount')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'discount' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('home.discounts')}
              </button>
            </div>
          </div>

          {/* Tab Content Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {activeTab === 'new' &&
              featuredData?.newArrivals.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}

            {activeTab === 'best' &&
              featuredData?.bestSellers.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}

            {activeTab === 'discount' &&
              featuredData?.discounts.slice(0, 12).map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('/shop', activeTab === 'discount' ? { hasDiscount: 'true' } : {})}
              className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 px-6 rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('home.explore_more')}</span>
              <ArrowIcon className="w-3.5 h-3.5 text-sky-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Category Spotlights */}
      {featuredData?.categorySections.map((section: any, idx) => {
        if (!section.products || section.products.length === 0) return null;
        const sectionTitle = language === 'en' && section.titleEn ? section.titleEn : section.title;
        const sectionCat = translateCategory(section.category);

        return (
          <section key={idx} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">{sectionTitle}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl ? `تصفح أفضل منتجات قسم ${sectionCat}` : `Browse top products in ${sectionCat}`}
                </p>
              </div>
              <button
                onClick={() => onNavigate('/shop', { category: section.category })}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{t('home.view_all_cat')}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {section.products.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Gamification Games & XP Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-sky-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden border border-sky-500/30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.2),transparent_60%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className={`space-y-3 max-w-xl ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 backdrop-blur-xs border border-sky-400/30 text-xs font-bold text-sky-200">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>
                  {isRtl ? '🎮 مركز الألعاب والـ XP التنافسي' : '🎮 Games & XP Competitive Center'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {isRtl
                  ? 'العب الألعاب اليومية واكسب نقاط الخبرة (XP) وتصدّر الموسم!'
                  : 'Play daily games, earn XP, and climb the season leaderboard!'}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                {isRtl
                  ? 'تحدَّ مهاراتك في عجلة الحظ، واختبار المعلومات، ولعبة الذاكرة، والتثبيت. اكسب نقاط XP فارتقِ بمستواك وادخل قائمة أفضل 3 فائزين للموسم الحالي!'
                  : 'Test your skills in Wheel of Fortune, Trivia Quiz, Memory Cards, and Stationery Catcher. Earn XP, rank up your level, and compete for the top 3 leaderboard spots!'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2 text-white/90">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>
                    {isRtl ? `نقاط XP الخاصة بك: ${profile?.xp || 0} XP` : `Your XP: ${profile?.xp || 0} XP`}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span>
                    {isRtl ? `المستوى الحالي: ${profile?.level || 1}` : `Level: ${profile?.level || 1}`}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                id="btn_home_start_games"
                onClick={() => onNavigate('/games')}
                className="py-3.5 px-8 rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-slate-950 animate-pulse" />
                <span>{isRtl ? 'دخول مركز الألعاب 🎮' : 'Enter Games Center 🎮'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Maktaba Q8 Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className={`relative z-10 max-w-2xl space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block">
              {isRtl ? 'جودة كويتية أصيلة' : 'Authentic Kuwaiti Quality'}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight">
              {isRtl ? 'لماذا يفضل الآلاف التسوق من مكتبة الشاطئ الازرق؟' : 'Why Thousands Choose Blue Beach Stationery?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isRtl
                ? 'نوفر جميع المستلزمات المدرسية والمكتبية والفنية الأصلية بأعلى معايير الجودة مع توصيل سريع وموثوق لجميع محافظات ومناطق دولة الكويت.'
                : 'We provide genuine school, office, and fine art supplies with top quality standards and fast, reliable delivery across all Kuwait areas.'}
            </p>
            <div className="pt-3 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('/shop')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t('home.shop_all_now')}
              </button>
              <a
                href="https://wa.me/96597123698"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
              >
                {isRtl ? 'تواصل واتساب (+965 97123698)' : 'WhatsApp (+965 97123698)'}
              </a>
              <a
                href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors border border-white/20"
              >
                {t('topbar.our_location')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
