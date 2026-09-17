import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag, Truck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { FreeChallengeCartBanner } from './freeChallenge/FreeChallengeCartBanner';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { cart, storeSettings, isCartOpen, closeCart, updateItemQuantity, removeItem, applyCouponCode, removeCouponCode } = useCart();
  const { t, dir, isRtl, language, formatPrice, translateProductTitle } = useLanguage();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingCoupon, setIsRemovingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  const isFreeShippingEnabled = storeSettings?.freeShippingEnabled === true;
  const freeShippingThreshold = typeof storeSettings?.freeShippingThreshold === 'number' ? storeSettings.freeShippingThreshold : 20;
  const progressToFreeShipping = Math.min(100, (subtotal / (freeShippingThreshold || 1)) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCouponCode(couponInput.trim());
      setCouponInput('');
    } catch {
      // Error handled by context toast
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir={dir}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div
        className={`fixed inset-y-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden duration-200 ${
          isRtl ? 'right-0 animate-in slide-in-from-right' : 'left-0 animate-in slide-in-from-left'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-700" />
            <h3 className="font-bold text-base text-slate-900">{t('cart.title')}</h3>
            <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)} {language === 'ar' ? 'منتج' : 'items'}
            </span>
          </div>

          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
            aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator or Standard Delivery Notice */}
        {isFreeShippingEnabled ? (
          <div className="bg-sky-50/70 p-3 border-b border-sky-100/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-sky-900">
                <Truck className="w-4 h-4 text-sky-600" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">
                    {language === 'ar' ? 'تهانينا! حصلت على توصيل مجاني لجميع مناطق الكويت 🎉' : 'Congratulations! Free delivery unlocked across Kuwait 🎉'}
                  </span>
                ) : (
                  <span>
                    {language === 'ar' ? (
                      <>أضف بـ <strong className="text-sky-800">{formatPrice(remainingForFreeShipping)}</strong> للحصول على توصيل مجاني</>
                    ) : (
                      <>Add <strong className="text-sky-800">{formatPrice(remainingForFreeShipping)}</strong> more for free delivery</>
                    )}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-sky-700">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-2 bg-sky-200/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  remainingForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-sky-600'
                }`}
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-2.5 px-3.5 border-b border-slate-200/70 flex items-center justify-between text-[11px] text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-sky-600" />
              <span>
                {language === 'ar'
                  ? `رسوم التوصيل: ${formatPrice(storeSettings?.standardShippingFee ?? 2.0)} لكافة مناطق الكويت`
                  : `Delivery fee: ${formatPrice(storeSettings?.standardShippingFee ?? 2.0)} across Kuwait`}
              </span>
            </span>
            <span className="font-bold text-sky-800 bg-sky-100/60 px-2 py-0.5 rounded-md">
              {language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}
            </span>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">{t('cart.empty_title')}</h4>
                <p className="text-xs text-slate-400">{t('cart.empty_desc')}</p>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('/shop');
                }}
                className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                {t('cart.start_shopping')}
              </button>
            </div>
          ) : (
            items.map(item => {
              const itemTitle = translateProductTitle(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <img
                    src={item.image || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
                    alt={itemTitle}
                    className="w-16 h-16 rounded-lg object-contain bg-white p-1 border border-slate-100 shrink-0"
                  />

                  <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {itemTitle}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {item.selectedOptionsSummary && (
                        <span className="text-[11px] text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded-md font-medium">
                          {item.selectedOptionsSummary}
                        </span>
                      )}
                      {item.sku && (
                        <span className="text-[10px] text-slate-400 font-mono italic">
                          {item.sku}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-sky-800 font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-800 min-w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title={language === 'ar' ? 'حذف' : 'Remove'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder={t('cart.coupon_placeholder')}
                  className={`w-full py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 ${
                    isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                  }`}
                />
                <Tag className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? 'right-2.5' : 'left-2.5'
                }`} />
              </div>
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                {t('cart.apply_coupon')}
              </button>
            </form>

            {cart?.couponCode && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? `كود الخصم: ${cart.couponCode}` : `Coupon: ${cart.couponCode}`}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsRemovingCoupon(true);
                      try {
                        await removeCouponCode();
                      } finally {
                        setIsRemovingCoupon(false);
                      }
                    }}
                    disabled={isRemovingCoupon}
                    className="p-0.5 rounded-full hover:bg-emerald-200/60 text-emerald-800 transition-colors mx-1 cursor-pointer"
                    title={language === 'ar' ? 'إلغاء كود الخصم' : 'Remove Coupon'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="font-bold">-{formatPrice(cart.discount)}</span>
              </div>
            )}

            {/* Free Shopping Challenge Banner */}
            <FreeChallengeCartBanner compact onStartClick={closeCart} />

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span>{t('cart.subtotal')}:</span>
                <span className="font-bold text-slate-900">{formatPrice(cart?.subtotal)}</span>
              </div>

              {cart?.discount ? (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>{t('cart.discount')}:</span>
                  <span className="font-bold">-{formatPrice(cart.discount)}</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span>{t('cart.shipping')}:</span>
                <span className="font-bold text-slate-900">
                  {cart?.shippingFee === 0 ? (
                    <span className="text-emerald-600">{language === 'ar' ? 'مجاني' : 'Free'}</span>
                  ) : (
                    formatPrice(cart?.shippingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>{t('cart.total')}:</span>
                <span className="text-sky-800 text-base font-mono">{formatPrice(cart?.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('/checkout');
                }}
                className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>{t('cart.checkout')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="https://wa.me/96597123698"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <span>{language === 'ar' ? 'طلب عبر الواتساب' : 'WhatsApp'}</span>
                </a>
                <a
                  href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <span>{t('topbar.our_location')}</span>
                </a>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  onNavigate('/cart');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition-colors text-center cursor-pointer"
              >
                {t('cart.view_cart')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
