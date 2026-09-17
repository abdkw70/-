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
    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-900" dir={dir}>
      {/* Background Image & Gradient */}
      <div className="relative min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex items-center">
        <img
          src={current.image}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 scale-105"
        />

        <div className={`absolute inset-0 bg-gradient-to-r ${current.color} mix-blend-multiply opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />

        {/* Slide Content */}
        <div className={`relative z-10 max-w-2xl p-6 sm:p-10 md:p-14 space-y-4 ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{displayBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-medium max-w-xl drop-shadow-xs">
            {displaySubtitle}
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate(current.link)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold py-3 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>{displayButtonText}</span>
              {isRtl ? (
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all z-20 border border-white/10 cursor-pointer`}
            aria-label="Previous"
          >
            {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <button
            onClick={handleNext}
            className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all z-20 border border-white/10 cursor-pointer`}
            aria-label="Next"
          >
            {isRtl ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIdx === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
