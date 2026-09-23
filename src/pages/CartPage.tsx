import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag, Truck, CheckCircle2, MessageCircle, MapPin, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, storeSettings, updateItemQuantity, removeItem, applyCouponCode, removeCouponCode, formatPrice } = useCart();
  const { dir, isRtl, language, t, translateProductTitle } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  const isFreeShippingEnabled = storeSettings?.freeShippingEnabled === true;
  const freeShippingThreshold = typeof storeSettings?.freeShippingThreshold === 'number' ? storeSettings.freeShippingThreshold : 20;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressToFreeShipping = Math.min(100, (subtotal / (freeShippingThreshold || 1)) * 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    try {
      await applyCouponCode(couponCode.trim());
      setCouponCode('');
    } catch {
      // Toast handled by context
    } finally {
      setIsApplying(false);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5" dir={dir}>
        <div className="w-20 h-20 bg-sky-50 text-sky-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('cart.empty_title')}</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {t('cart.empty_desc')}
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 px-8 rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
        >
          {t('cart.start_shopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t('cart.title')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl
              ? `لديك ${items.reduce((s, i) => s + i.quantity, 0)} عنصر في السلة`
              : `You have ${items.reduce((s, i) => s + i.quantity, 0)} item(s) in your cart`}
          </p>
        </div>
        <button
          id="btn_cart_page_continue_shopping_top"
          onClick={() => onNavigate('/shop')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer touch-manipulation min-h-[40px]"
        >
          <span>{t('cart.continue_shopping', 'متابعة التسوق')}</span>
          <ArrowIcon className="w-4 h-4 text-sky-700" />
        </button>
      </div>

      {/* Free shipping banner or Standard Shipping notice */}
      {isFreeShippingEnabled ? (
        <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sky-700" />
              {remainingForFreeShipping === 0 ? (
                <span className="text-emerald-700">
                  {isRtl ? 'تهانينا! مؤهل للشحن المجاني داخل الكويت 🎉' : 'Congratulations! Qualified for free delivery in Kuwait 🎉'}
                </span>
              ) : (
                <span>
                  {isRtl ? (
                    <>أضف بـ <span className="text-sky-800">{formatPrice(remainingForFreeShipping)}</span> إضافية للتوصيل المجاني</>
                  ) : (
                    <>Add <span className="text-sky-800">{formatPrice(remainingForFreeShipping)}</span> more for free delivery</>
                  )}
                </span>
              )}
            </span>
            <span>{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="w-full h-2 bg-sky-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                remainingForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-sky-600'
              }`}
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              {isRtl
                ? `توصيل سريع وموثوق لكافة مناطق الكويت (رسوم التوصيل: ${formatPrice(storeSettings?.standardShippingFee ?? 2.0)})`
                : `Fast and reliable delivery across Kuwait (Delivery fee: ${formatPrice(storeSettings?.standardShippingFee ?? 2.0)})`}
            </span>
          </div>
          <span className="font-bold text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {isRtl ? 'توصيل خلال 24-48 ساعة 🚚' : 'Delivery within 24-48 hours 🚚'}
          </span>
        </div>
      )}

      {/* Grid: Cart Items List & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {items.map(item => {
              const itemTitle = translateProductTitle(item);
              return (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={item.image || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
                    alt={itemTitle}
                    className="w-20 h-20 rounded-2xl object-contain bg-slate-50 p-1.5 border border-slate-100 shrink-0"
                  />

                  <div className={`flex-1 min-w-0 space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <h3
                      onClick={() => onNavigate(`/product/${encodeURIComponent(item.handle || item.productId)}`)}
                      className="text-sm font-bold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer line-clamp-2"
                    >
                      {itemTitle}
                    </h3>
                    {item.selectedOptionsSummary && (
                      <p className="text-xs text-slate-500">{item.selectedOptionsSummary}</p>
                    )}
                    <span className="text-xs text-slate-400 font-medium block">
                      {isRtl ? `سعر الوحدة: ${formatPrice(item.price)}` : `Unit price: ${formatPrice(item.price)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0">
                    {/* Quantity */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-800 min-w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Line Price */}
                    <div className={`${isRtl ? 'text-right' : 'text-left'} min-w-24`}>
                      <span className="text-sm font-extrabold text-sky-900 block font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={isRtl ? 'إزالة' : 'Remove'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Side */}
        <div className="space-y-6">

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              {t('checkout.order_summary')}
            </h2>

            {/* Coupon Code input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {isRtl ? 'هل لديك كود خصم أو قسيمة؟' : 'Have a coupon code?'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder={t('cart.coupon_placeholder')}
                    className={`w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 ${
                      isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                    }`}
                  />
                  <Tag className={`w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                    isRtl ? 'right-2.5' : 'left-2.5'
                  }`} />
                </div>
                <button
                  type="submit"
                  disabled={isApplying || !couponCode.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {t('cart.apply_coupon')}
                </button>
              </div>
            </form>

            {cart?.couponCode && (
              <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                <span className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isRtl ? `كود الخصم مفعّل (${cart.couponCode})` : `Coupon active (${cart.couponCode})`}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsRemoving(true);
                      try {
                        await removeCouponCode();
                      } finally {
                        setIsRemoving(false);
                      }
                    }}
                    disabled={isRemoving}
                    className="p-0.5 rounded-full hover:bg-emerald-200/60 text-emerald-800 transition-colors mx-1 cursor-pointer"
                    title={isRtl ? 'إلغاء كود الخصم' : 'Remove Coupon'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="font-bold">-{formatPrice(cart.discount)}</span>
              </div>
            )}

            {/* Price lines */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
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

              <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>{t('cart.total')}:</span>
                <span className="text-sky-900 text-lg font-mono">{formatPrice(cart?.total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('cart.checkout')}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>

            {/* Quick WhatsApp & Maps & Continue Shopping buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href="https://wa.me/96597123698"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{isRtl ? 'إتمام الطلب عبر الواتساب' : 'WhatsApp Checkout'}</span>
              </a>
              <a
                href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                target="_blank"
                rel="noreferrer"
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-center"
              >
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>{t('topbar.our_location')}</span>
              </a>
            </div>

            <button
              id="btn_cart_page_continue_shopping_bottom"
              type="button"
              onClick={() => onNavigate('/shop')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer touch-manipulation min-h-[44px]"
            >
              <span>{t('cart.continue_shopping', 'متابعة التسوق واستعراض المنتجات')}</span>
              <ArrowIcon className="w-4 h-4 text-sky-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
