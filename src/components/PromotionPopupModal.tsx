import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, X, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchActivePromotion } from '../lib/api';
import { PromotionSettings } from '../types';

interface PromotionPopupModalProps {
  language?: 'ar' | 'en';
  onNavigate?: (path: string) => void;
}

export const PromotionPopupModal: React.FC<PromotionPopupModalProps> = ({
  language = 'ar',
  onNavigate,
}) => {
  const { user, userProfile } = useAuth();
  const { applyCouponCode, cart } = useCart();

  const [promotion, setPromotion] = useState<PromotionSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Extract and clean display name
  const extractCleanName = (): string | null => {
    const candidate = (userProfile?.displayName || user?.displayName || '').trim();
    if (!candidate) return null;

    const lower = candidate.toLowerCase();
    const invalidKeywords = [
      'undefined',
      'null',
      'user',
      'anonymous',
      'guest',
      'عميل المتجر',
      'store customer',
      'عميل',
      'متسوق',
    ];

    if (invalidKeywords.some(kw => lower === kw || lower.includes('@'))) {
      return null;
    }

    // Clean up long names or return trimmed
    return candidate;
  };

  const cleanName = extractCleanName();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkAndShowPromotion = async () => {
      // Prevent duplicate popups across re-renders
      if ((window as any).__promoPopupOpen) return;

      const res = await fetchActivePromotion();
      if (!res.success || !res.active || !res.promotion) {
        return;
      }

      const promo = res.promotion;

      // 1. Check Target Audience
      const isAuthenticated = Boolean(user);
      if (isAuthenticated && !promo.showToAuthenticatedUsers) return;
      if (!isAuthenticated && !promo.showToGuests) return;

      // 2. Check Frequency
      const nowStr = new Date().toISOString().slice(0, 10);
      const codeKey = promo.couponCode.toUpperCase().trim();

      if (promo.frequency === 'session_once') {
        if (sessionStorage.getItem(`promo_session_${codeKey}`)) return;
      } else if (promo.frequency === 'daily_once') {
        const lastDate = localStorage.getItem(`promo_date_${codeKey}`);
        if (lastDate === nowStr) return;
      } else if (promo.frequency === 'user_once') {
        const userKey = user?.uid || 'guest';
        if (localStorage.getItem(`promo_user_once_${codeKey}_${userKey}`)) return;
      } else if (promo.frequency === 'until_closed') {
        if (localStorage.getItem(`promo_closed_${codeKey}`)) return;
      }

      // 3. Set delay before showing
      const delayMs = (promo.delaySeconds || 0) * 1000;
      timer = setTimeout(() => {
        (window as any).__promoPopupOpen = true;
        setPromotion(promo);
        setIsOpen(true);
      }, delayMs);
    };

    checkAndShowPromotion();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user?.uid, userProfile?.displayName]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    if (promotion) {
      const codeKey = promotion.couponCode.toUpperCase().trim();
      const nowStr = new Date().toISOString().slice(0, 10);

      if (promotion.frequency === 'session_once') {
        sessionStorage.setItem(`promo_session_${codeKey}`, 'true');
      } else if (promotion.frequency === 'daily_once') {
        localStorage.setItem(`promo_date_${codeKey}`, nowStr);
      } else if (promotion.frequency === 'user_once') {
        const userKey = user?.uid || 'guest';
        localStorage.setItem(`promo_user_once_${codeKey}_${userKey}`, 'true');
      } else if (promotion.frequency === 'until_closed') {
        localStorage.setItem(`promo_closed_${codeKey}`, 'true');
      }
    }

    (window as any).__promoPopupOpen = false;
    setIsOpen(false);
  };

  const handleShopNow = async () => {
    if (!promotion) return;
    const code = promotion.couponCode.toUpperCase().trim();

    setIsApplying(true);
    try {
      // Store pending code for automatic apply on cart add if cart is empty
      localStorage.setItem('pending_promo_code', code);

      // If cart has items, apply right now
      if (cart && cart.items && cart.items.length > 0) {
        await applyCouponCode(code);
      }
    } catch {
      // ignore
    } finally {
      setIsApplying(false);
      handleClose();

      if (onNavigate) {
        onNavigate('/shop');
      } else {
        window.location.hash = '#shop';
      }
    }
  };

  if (!isOpen || !promotion) return null;

  const isRtl = language === 'ar';
  const discountStr =
    promotion.discountType === 'percentage'
      ? `${promotion.discountValue}%`
      : `${promotion.discountValue.toFixed(3)} ${isRtl ? 'د.ك' : 'KWD'}`;

  // Formatted substituted text
  const formatText = (template: string) => {
    let t = template || '';
    if (cleanName) {
      t = t.replace(/\{name\}/g, cleanName);
    } else {
      t = t.replace(/\{name\}/g, isRtl ? 'بك' : '');
      // Clean double spaces or leading spaces if fallback was empty
      t = t.replace(/مرحباً بك/g, 'مرحباً بك').replace(/Welcome /g, 'Welcome ');
    }
    t = t.replace(/\{discount\}/g, discountStr);
    t = t.replace(/\{code\}/g, promotion.couponCode.toUpperCase().trim());
    return t;
  };

  const titleText = isRtl
    ? promotion.titleAr || 'هدية خاصة لك 🎁'
    : promotion.titleEn || 'Special Gift For You 🎁';

  const messageText = formatText(
    isRtl
      ? promotion.messageAr || 'مرحباً {name} 👋\nاحصل الآن على خصم {discount} واستخدم كود الخصم {code}'
      : promotion.messageEn || 'Welcome {name} 👋\nGet {discount} off your order using code {code}'
  );

  const buttonText = isRtl
    ? promotion.buttonTextAr || 'تسوق الآن'
    : promotion.buttonTextEn || 'Shop Now';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200/80 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button X */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 start-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="إغلاق النافذة"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Decorative Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-xl">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-500">
              <Gift className="w-8 h-8 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Header Title */}
        <h3 className="text-xl sm:text-2xl font-black text-center text-slate-900 font-cairo tracking-tight">
          {titleText}
        </h3>

        {/* Message Body */}
        <div className="mt-3 text-center text-slate-600 text-sm sm:text-base font-tajawal leading-relaxed whitespace-pre-line">
          {messageText}
        </div>

        {/* Highlight Coupon Banner Box */}
        <div className="mt-5 p-4 bg-gradient-to-r from-amber-50 via-rose-50 to-sky-50 border-2 border-dashed border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isRtl ? 'كود الخصم المعتمد:' : 'PROMO CODE:'}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-700 tracking-wider">
              {promotion.couponCode.toUpperCase().trim()}
            </span>
          </div>

          <div className="px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs shrink-0">
            {discountStr} {isRtl ? 'خصم' : 'OFF'}
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleShopNow}
          disabled={isApplying}
          className="mt-6 w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation active:scale-98 disabled:opacity-50"
        >
          <ShoppingBag className="w-5 h-5 text-amber-300" />
          <span>{buttonText}</span>
          {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
