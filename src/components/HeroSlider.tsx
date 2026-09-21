import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  image: string;
  badge: string;
  color: string;
  titleEn?: string;
  subtitleEn?: string;
  buttonTextEn?: string;
  badgeEn?: string;
}

interface HeroSliderProps {
  banners: Banner[];
  onNavigate: (path: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners, onNavigate }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { dir, isRtl, language, t } = useLanguage();

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[currentIdx];

  const handlePrev = () => {
    setCurrentIdx(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % banners.length);
  };

  const displayTitle = language === 'en' && current.titleEn ? current.titleEn : current.title;
  const displaySubtitle = language === 'en' && current.subtitleEn ? current.subtitleEn : current.subtitle;
  const displayBadge = language === 'en' && current.badgeEn ? current.badgeEn : current.badge;
  const displayButtonText = language === 'en' && current.buttonTextEn ? current.buttonTextEn : current.buttonText;

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 bg-slate-900" dir={dir}>
      {/* Background Image & Gradient with fluid responsive height */}
      <div className="relative w-full min-h-[260px] xs:min-h-[300px] sm:min-h-[380px] md:min-h-[440px] flex items-center">
        <img
          src={current.image}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 scale-105"
        />

        <div className={`absolute inset-0 bg-gradient-to-r ${current.color} mix-blend-multiply opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-transparent" />

        {/* Slide Content: Padded with dedicated bottom clearance for navigation controls */}
        <div className={`relative z-10 w-full max-w-2xl p-4 sm:p-8 md:p-12 pb-14 sm:pb-10 space-y-2.5 sm:space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          {displayBadge && (
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/20">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">{displayBadge}</span>
            </div>
          )}

          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-snug drop-shadow-sm line-clamp-2 sm:line-clamp-none">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-medium max-w-xl drop-shadow-xs line-clamp-2 sm:line-clamp-none">
            {displaySubtitle}
          </p>

          <div className="pt-1 sm:pt-2">
            <button
              onClick={() => onNavigate(current.link)}
              className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs sm:text-sm font-bold py-2 sm:py-3 px-4 sm:px-7 rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all flex items-center gap-2 group cursor-pointer touch-manipulation"
            >
              <span>{displayButtonText}</span>
              {isRtl ? (
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Clean, non-colliding layout */}
      {banners.length > 1 && (
        <>
          {/* Desktop & Tablet Side Arrows (Hidden on narrow mobile to prevent covering text) */}
          <button
            onClick={handlePrev}
            className={`hidden sm:flex absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs items-center justify-center transition-all z-20 border border-white/10 cursor-pointer touch-manipulation`}
            aria-label="Previous slide"
          >
            {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <button
            onClick={handleNext}
            className={`hidden sm:flex absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs items-center justify-center transition-all z-20 border border-white/10 cursor-pointer touch-manipulation`}
            aria-label="Next slide"
          >
            {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Unified Bottom Control Bar (Arrows + Dots on Mobile, Dots on Desktop) */}
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none px-3 py-1 rounded-full border border-white/10 sm:border-none">
            {/* Mobile Prev Arrow */}
            <button
              onClick={handlePrev}
              className="sm:hidden text-white/80 hover:text-white p-1 cursor-pointer touch-manipulation"
              aria-label="Previous slide"
            >
              {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer touch-manipulation ${
                    currentIdx === idx ? 'w-6 sm:w-8 bg-amber-400' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Mobile Next Arrow */}
            <button
              onClick={handleNext}
              className="sm:hidden text-white/80 hover:text-white p-1 cursor-pointer touch-manipulation"
              aria-label="Next slide"
            >
              {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
