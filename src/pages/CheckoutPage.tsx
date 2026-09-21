import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Lock, AlertCircle, ShoppingBag, MessageCircle, MapPin, Wallet, Coins, Plus, Minus, Trash2, X, Star, Bookmark, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useGamification } from '../context/GamificationContext';
import { useFreeChallenge } from '../context/FreeChallengeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as api from '../lib/api';
import { UserAddress, CartItem } from '../types';

const KUWAIT_GOVERNORATES: Record<string, string[]> = {
  'العاصمة': ['مدينة الكويت', 'شرق', 'دسمان', 'المرقاب', 'القبلة', 'بنيد القار', 'الدسمة', 'الدعية', 'المنصورية', 'عبدالله السالم', 'النزهة', 'الفيحاء', 'الشامية', 'الروضة', 'العديلية', 'الخالدية', 'كيفان', 'القادسية', 'قرطبة', 'السرة', 'اليرموك', 'الشويخ', 'غرناطة', 'الصليبيخات', 'الدوحة', 'النهضة', 'شمال غرب الصليبيخات', 'جابر الأحمد'],
  'حولي': ['حولي', 'السالمية', 'الرميثية', 'الجابرية', 'مشرف', 'بيان', 'البدع', 'الشعب', 'السلام', 'حطين', 'الشهداء', 'الزهراء', 'الصديق', 'مبارك العبدالله غرب مشرف', 'سلوى'],
  'الفروانية': ['الفروانية', 'خيطان', 'الأندلس', 'إشبيلية', 'جليب الشيوخ', 'الرقعي', 'الرابية', 'الرحاب', 'العارضية', 'صباح الناصر', 'الفردوس', 'عبدالله المبارك (غرب الجليب)', 'العمرية', 'الضجيج'],
  'الأحمدي': ['الأحمدي', 'الفحيحيل', 'المنقف', 'أبو حليفة', 'الفنطاس', 'المهبولة', 'الصباحية', 'الرقة', 'هدية', 'الظهر', 'العقيلة', 'علي صباح السالم (أم الهيمان)', 'صباح الأحمد السكنية', 'الخيران', 'الوفرة'],
  'مبارك الكبير': ['مبارك الكبير', 'العدان', 'القصور', 'القرين', 'صباح السالم', 'المسيلة', 'أبو فطيرة', 'الفنيطيس', 'أبو الحصانية', 'المسايل', 'صبحان'],
  'الجهراء': ['الجهراء', 'الواحة', 'العيون', 'القصر', 'النسيم', 'تيماء', 'النعيم', 'سعد العبدالله', 'الصليبية', 'كبد', 'المطلاع'],
};

const GOVERNORATES_EN: Record<string, string> = {
  'العاصمة': 'Capital (Al Asimah)',
  'حولي': 'Hawalli',
  'الفروانية': 'Farwaniya',
  'الأحمدي': 'Ahmadi',
  'مبارك الكبير': 'Mubarak Al-Kabeer',
  'الجهراء': 'Jahra',
};

interface CheckoutPageProps {
  onNavigate: (path: string, query?: Record<string, string>) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, removeItem, updateItemQuantity, showToast } = useCart();
  const { userId, wallet, settings, refreshGamification } = useGamification();
  const { user, userProfile } = useAuth();
  const { challengeResult } = useFreeChallenge();
  const { dir, isRtl, language, t, formatPrice, translateProductTitle } = useLanguage();

  const effectiveUserId = user?.uid || userProfile?.id || userId || localStorage.getItem('mq_user_id') || 'guest';

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [saveThisAddress, setSaveThisAddress] = useState(true);
  const [addressTitle, setAddressTitle] = useState('المنزل');

  const [customerName, setCustomerName] = useState(userProfile?.displayName || user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [governorate, setGovernorate] = useState('العاصمة');
  const [area, setArea] = useState(KUWAIT_GOVERNORATES['العاصمة'][0] || '');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [avenue, setAvenue] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'whatsapp'>('cash_on_delivery');
  const [useWalletBalance, setUseWalletBalance] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Auto-fill user profile info if available
  useEffect(() => {
    if (userProfile?.displayName && !customerName) {
      setCustomerName(userProfile.displayName);
    }
    if (userProfile?.phone && !customerPhone) {
      setCustomerPhone(userProfile.phone);
    }
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
  }, [userProfile, user]);

  // Load saved addresses for user
  useEffect(() => {
    if (effectiveUserId && effectiveUserId !== 'guest') {
      api.fetchUserAddresses(effectiveUserId).then(res => {
        if (res.success && res.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find(a => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            applyAddress(defaultAddr);
            setSelectedAddressId(defaultAddr.id);
          }
        }
      }).catch(() => {});
    }
  }, [effectiveUserId]);

  const applyAddress = (addr: UserAddress) => {
    if (addr.customerName) setCustomerName(addr.customerName);
    if (addr.customerPhone) setCustomerPhone(addr.customerPhone);
    if (addr.governorate) {
      setGovernorate(addr.governorate);
      setArea(addr.area || (KUWAIT_GOVERNORATES[addr.governorate] ? KUWAIT_GOVERNORATES[addr.governorate][0] : ''));
    }
    setBlock(addr.block || '');
    setStreet(addr.street || '');
    setAvenue(addr.avenue || '');
    setBuilding(addr.building || '');
    setFloor(addr.floor || '');
    if (addr.notes) setNotes(addr.notes);
  };

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === 'new') {
      setBlock('');
      setStreet('');
      setAvenue('');
      setBuilding('');
      setFloor('');
    } else {
      const addr = savedAddresses.find(a => a.id === id);
      if (addr) {
        applyAddress(addr);
      }
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  // Challenge reward discount (if from wheel discount)
  let challengeDiscount = 0;
  if (challengeResult?.discountWon?.percentage) {
    challengeDiscount = Number(((subtotal * challengeResult.discountWon.percentage) / 100).toFixed(3));
  }

  const remainingAfterChallenge = Math.max(0, subtotal - (cart?.discount || 0) - challengeDiscount);

  const activeWalletBalance = wallet?.activeBalance ?? 0;
  const maxUsagePercent = settings?.maxWalletUsagePercent || 100;
  const maxWalletAllowed = Number(((remainingAfterChallenge * maxUsagePercent) / 100).toFixed(3));
  const applicableWalletDiscount = useWalletBalance && activeWalletBalance > 0 && remainingAfterChallenge > 0
    ? Number(Math.min(activeWalletBalance, maxWalletAllowed, remainingAfterChallenge).toFixed(3))
    : 0;

  const totalDiscount = Number(((cart?.discount || 0) + challengeDiscount + applicableWalletDiscount).toFixed(3));
  const finalPayableTotal = Number(Math.max(0, subtotal - totalDiscount + (cart?.shippingFee || 0)).toFixed(3));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4" dir={dir}>
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{t('cart.empty_title')}</h2>
        <p className="text-xs text-slate-500">{t('cart.empty_desc')}</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="bg-sky-700 hover:bg-sky-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors cursor-pointer"
        >
          {t('cart.start_shopping')}
        </button>
      </div>
    );
  }

  const handleGovernorateChange = (gov: string) => {
    setGovernorate(gov);
    const areas = KUWAIT_GOVERNORATES[gov] || [];
    setArea(areas[0] || '');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim() || !block.trim() || !street.trim() || !building.trim()) {
      setErrorMsg(isRtl ? 'يرجى ملء جميع الحقول الإلزامية بالعنوان وبيانات العميل' : 'Please fill in all required customer and address fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save address if requested and new
      if (saveThisAddress && effectiveUserId && selectedAddressId === 'new') {
        try {
          await api.saveUserAddress({
            userId: effectiveUserId,
            title: addressTitle.trim() || (isRtl ? 'المنزل' : 'Home'),
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            governorate,
            area,
            block: block.trim(),
            street: street.trim(),
            avenue: avenue.trim() || undefined,
            building: building.trim(),
            floor: floor.trim() || undefined,
            notes: notes.trim() || undefined,
            isDefault: savedAddresses.length === 0,
          });
        } catch (e) {
          console.warn('Address auto-save notice:', e);
        }
      }

      const sessionId = localStorage.getItem('mq_session_id') || 'guest';
      const res = await api.submitCheckout({
        sessionId,
        userId: effectiveUserId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        governorate,
        area,
        block: block.trim(),
        street: street.trim(),
        avenue: avenue.trim() || undefined,
        building: building.trim(),
        floor: floor.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentMethod,
        useWalletBalance: applicableWalletDiscount > 0,
        challengeId: challengeResult?.challengeId,
        voucherCode: challengeResult?.discountWon?.token,
      });

      if (res.success && res.order) {
        showToast(isRtl ? 'تم استلام طلبك بنجاح!' : 'Your order has been placed successfully!', 'success');
        refreshGamification();

        // If payment method is WhatsApp, prepare the WhatsApp message redirect
        if (paymentMethod === 'whatsapp') {
          const itemsSummary = items.map(i => `• ${translateProductTitle(i)} (${i.quantity}x)`).join('%0A');
          let walletNote = '';
          if (applicableWalletDiscount > 0) {
            walletNote = isRtl
              ? `%0Aخصم رصيد المحفظة: -${formatPrice(applicableWalletDiscount)}`
              : `%0AWallet Credit Discount: -${formatPrice(applicableWalletDiscount)}`;
          }

          const govName = language === 'en' ? (GOVERNORATES_EN[governorate] || governorate) : governorate;
          const waHeader = isRtl
            ? `مرحباً مكتبة الشاطئ الازرق، أود تأكيد طلبي رقم #${res.order.orderNumber}:%0Aالاسم: ${customerName}%0Aالهاتف: ${customerPhone}%0Aالعنوان: ${govName} - ${area} - ق ${block} - ش ${street} - منزل ${building}%0Aالأصناف:%0A`
            : `Hello Blue Beach Stationery, I would like to confirm my order #${res.order.orderNumber}:%0AName: ${customerName}%0APhone: ${customerPhone}%0AAddress: ${govName} - ${area} - Block ${block} - St ${street} - Bldg ${building}%0AItems:%0A`;

          const waFooter = isRtl
            ? `%0Aالمبلغ الصافي للدفع: ${formatPrice(res.order.total)}`
            : `%0ANet Total to Pay: ${formatPrice(res.order.total)}`;

          const waText = encodeURI(waHeader) + itemsSummary + walletNote + encodeURI(waFooter);
          window.open(`https://wa.me/96597123698?text=${waText}`, '_blank');
        }

        onNavigate(`/order-confirmation/${res.order.id}`);
      }
    } catch (err: any) {
      const msg = err.message || (isRtl ? 'حدث خطأ أثناء معالجة الطلب' : 'An error occurred while processing order');
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t('checkout.title')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl ? 'توصيل سريع لكافة محافظات ومناطق دولة الكويت' : 'Fast and reliable delivery to all Kuwait areas'}
          </p>
        </div>

        {/* Support & Continue Shopping quick buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn_checkout_continue_shopping"
            type="button"
            onClick={() => onNavigate('/shop')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4 text-sky-700" />
            <span>{isRtl ? 'العودة للتسوق' : 'Continue Shopping'}</span>
          </button>
          <a
            href="https://wa.me/96597123698"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors min-h-[40px]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>{isRtl ? 'استفسار بالواتساب' : 'WhatsApp Support'}</span>
          </a>
          <a
            href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl border border-sky-200 transition-colors min-h-[40px]"
          >
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>{t('topbar.our_location')}</span>
          </a>
        </div>
      </div>

      {challengeResult?.discountWon && !challengeResult.won && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md border border-amber-300 flex items-center gap-3">
          <Gift className="w-6 h-6 text-slate-950 shrink-0" />
          <div className={isRtl ? 'text-right' : 'text-left'}>
            <h3 className="text-xs font-black">
              {isRtl
                ? `جائزة عجلة التحدي مفعلة: خصم ${challengeResult.discountWon.percentage}% على طلبك!`
                : `Challenge Wheel reward active: ${challengeResult.discountWon.percentage}% off your order!`}
            </h3>
            <p className="text-[11px] text-slate-900 font-medium mt-0.5">
              {isRtl
                ? 'تم تطبيق الخصم فوراً على سلتك تقديراً لمشاركتك في التحدي.'
                : 'Discount applied immediately to your cart in recognition of your challenge play.'}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Checkout Form & Order Summary */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer & Address Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Addresses Quick Selector */}
          {savedAddresses.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-sky-600" />
                  <span>{isRtl ? 'عناويني المحفوظة' : 'My Saved Addresses'}</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  {isRtl ? 'اختر عنواناً للتعبئة التلقائية' : 'Select an address for autofill'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map(addr => {
                  const isSelected = selectedAddressId === addr.id;
                  const govDisplay = language === 'en' ? (GOVERNORATES_EN[addr.governorate] || addr.governorate) : addr.governorate;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-slate-900">{addr.title}</span>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{isRtl ? 'الافتراضي' : 'Default'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {govDisplay} - {addr.area} - {isRtl ? 'ق' : 'Blk'} {addr.block} - {isRtl ? 'ش' : 'St'} {addr.street} - {isRtl ? 'منزل' : 'Bldg'} {addr.building}
                      </p>
                    </div>
                  );
                })}

                {/* Add New Address Button Option */}
                <div
                  onClick={() => handleSelectSavedAddress('new')}
                  className={`p-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    selectedAddressId === 'new'
                      ? 'border-sky-600 bg-sky-50/50 text-sky-700'
                      : 'border-slate-300 hover:border-slate-400 text-slate-600'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold">{isRtl ? 'عنوان جديد آخر' : 'Use Another Address'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 1. Customer Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>{isRtl ? 'معلومات العميل للتواصل' : 'Customer Contact Information'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t('checkout.full_name')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={isRtl ? 'مثال: يوسف العازمي' : 'e.g. Yousef Al-Azmi'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t('checkout.phone')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder={isRtl ? 'مثال: 90065390' : 'e.g. 90065390'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className={`sm:col-span-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {t('checkout.email')} ({isRtl ? 'اختياري لاستلام الفاتورة' : 'Optional, for invoice'})
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Address in Kuwait */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>{t('checkout.shipping_address')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.governorate')} <span className="text-rose-600">*</span></label>
                <select
                  value={governorate}
                  onChange={e => handleGovernorateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 font-bold cursor-pointer"
                >
                  {Object.keys(KUWAIT_GOVERNORATES).map(gov => (
                    <option key={gov} value={gov}>
                      {language === 'en' ? (GOVERNORATES_EN[gov] || gov) : `محافظة ${gov}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.area')} <span className="text-rose-600">*</span></label>
                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 font-bold cursor-pointer"
                >
                  {(KUWAIT_GOVERNORATES[governorate] || []).map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.block')} <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  required
                  value={block}
                  onChange={e => setBlock(e.target.value)}
                  placeholder={isRtl ? 'مثال: قطعة 4' : 'e.g. Block 4'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.street')} <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder={isRtl ? 'مثال: شارع سالم المبارك' : 'e.g. Salem Al Mubarak St'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.avenue')} ({isRtl ? 'اختياري' : 'Optional'})</label>
                <input
                  type="text"
                  value={avenue}
                  onChange={e => setAvenue(e.target.value)}
                  placeholder={isRtl ? 'مثال: جادة 2' : 'e.g. Avenue 2'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.building')} <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  required
                  value={building}
                  onChange={e => setBuilding(e.target.value)}
                  placeholder={isRtl ? 'مثال: منزل 12 / عمارة 5' : 'e.g. House 12 / Building 5'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.floor')} ({isRtl ? 'اختياري' : 'Optional'})</label>
                <input
                  type="text"
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                  placeholder={isRtl ? 'مثال: الدور 3، شقة 5' : 'e.g. Floor 3, Apt 5'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              {selectedAddressId === 'new' && (
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">{isRtl ? 'تسمية العنوان (اختياري)' : 'Address Label (Optional)'}</label>
                  <input
                    type="text"
                    value={addressTitle}
                    onChange={e => setAddressTitle(e.target.value)}
                    placeholder={isRtl ? 'مثال: المنزل، المكتب، الشاليه' : 'e.g. Home, Office, Chalet'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                </div>
              )}

              <div className={`sm:col-span-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('checkout.notes')} ({isRtl ? 'اختياري' : 'Optional'})</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={isRtl ? 'أي تعليمات للمندوب عند الوصول...' : 'Special delivery instructions...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              {selectedAddressId === 'new' && (
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={saveThisAddress}
                      onChange={e => setSaveThisAddress(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>{isRtl ? 'حفظ هذا العنوان في قائمة عناويني لاستخدامه في الطلبات القادمة' : 'Save this address for future orders'}</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 3. Wallet Balance Redemption */}
          {activeWalletBalance > 0 && (
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2.5 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t('checkout.wallet_balance')}</h3>
                    <p className="text-xs text-slate-500">
                      {isRtl ? 'لديك رصيد متاح بقيمة ' : 'Available balance: '}
                      <span className="font-bold text-emerald-700 font-mono">{formatPrice(activeWalletBalance)}</span>
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWalletBalance}
                    onChange={e => setUseWalletBalance(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {useWalletBalance ? (
                <div className="p-3 rounded-2xl bg-white border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? 'الخصم المطبق من المحفظة على هذا الطلب:' : 'Applied wallet discount:'}</span>
                  </span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    -{formatPrice(applicableWalletDiscount)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  {isRtl
                    ? 'تم إلغاء تفعيل الخصم من المحفظة لهذا الطلب. يمكنك الاحتفاظ برصيدك لطلب قادم.'
                    : 'Wallet discount disabled for this order. You can keep your balance for a future purchase.'}
                </p>
              )}
            </div>
          )}

          {/* 4. Payment Method */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-xs flex items-center justify-center font-bold">
                {activeWalletBalance > 0 ? '4' : '3'}
              </span>
              <span>{t('checkout.payment_method')}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash On Delivery */}
              <label
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                    {paymentMethod === 'cash_on_delivery' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <span className="text-xs font-extrabold text-slate-900 block">{t('checkout.cod')}</span>
                    <span className="text-[11px] text-slate-500">
                      {isRtl ? 'تسليم المبلغ نقداً لمندوب التوصيل' : 'Pay in cash upon courier delivery'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-lg">
                  {isRtl ? 'كاش' : 'Cash'}
                </span>
              </label>

              {/* WhatsApp Order */}
              <label
                onClick={() => setPaymentMethod('whatsapp')}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'whatsapp'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                    {paymentMethod === 'whatsapp' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <span className="text-xs font-extrabold text-slate-900 block">{t('checkout.whatsapp_order')}</span>
                    <span className="text-[11px] text-slate-500">
                      {isRtl ? 'إرسال الفاتورة والمتابعة مباشرة' : 'Send invoice & follow up directly'}
                    </span>
                  </div>
                </div>
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              </label>
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              {isRtl
                ? `ملخص الأصناف (${items.reduce((s, i) => s + i.quantity, 0)})`
                : `Items Summary (${items.reduce((s, i) => s + i.quantity, 0)})`}
            </h3>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 space-y-2">
              {items.map(item => {
                const itemDisplayTitle = translateProductTitle(item);
                return (
                  <div key={item.id} className="pt-2.5 flex items-start gap-3 group/item">
                    <img
                      src={item.image || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
                      alt={itemDisplayTitle}
                      className="w-13 h-13 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                    />
                    <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={itemDisplayTitle}>
                          {itemDisplayTitle}
                        </h4>
                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                          title={isRtl ? 'حذف هذا المنتج من الطلب' : 'Remove item from order'}
                          aria-label={isRtl ? 'حذف هذا المنتج' : 'Delete item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedOptionsSummary && (
                        <span className="text-[10px] text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded font-medium inline-block my-0.5">
                          {item.selectedOptionsSummary}
                        </span>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        {/* Quantity adjuster */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateItemQuantity(item.id, item.quantity - 1);
                              } else {
                                setItemToDelete(item);
                              }
                            }}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title={isRtl ? 'إنقاص الكمية' : 'Decrease'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title={isRtl ? 'زيادة الكمية' : 'Increase'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price calculation */}
                        <span className="text-xs font-extrabold text-sky-900 font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
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

              {challengeDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isRtl
                        ? `خصم عجلة التحدي (${challengeResult?.discountWon?.percentage}%):`
                        : `Wheel Discount (${challengeResult?.discountWon?.percentage}%):`}
                    </span>
                  </span>
                  <span>-{formatPrice(challengeDiscount)}</span>
                </div>
              )}

              {applicableWalletDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    <span>{isRtl ? 'خصم رصيد المحفظة:' : 'Wallet Credit Discount:'}</span>
                  </span>
                  <span className="font-bold">-{formatPrice(applicableWalletDiscount)}</span>
                </div>
              )}

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
                <span className="text-sky-900 text-lg font-mono">{formatPrice(finalPayableTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 min-h-[48px] rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-[0.99]"
            >
              {paymentMethod === 'whatsapp' ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (isRtl ? 'جاري إرسال الطلب...' : 'Sending order...')
                      : (isRtl ? 'إتمام الطلب ومتابعة عبر واتساب' : 'Complete Order via WhatsApp')}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (isRtl ? 'جاري معالجة الطلب...' : 'Processing order...')
                      : t('checkout.confirm_order')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal: Delete item from order */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            dir={dir}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>{isRtl ? 'تأكيد إزالة المنتج من الطلب' : 'Confirm Item Removal'}</span>
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src={itemToDelete.image || 'https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png'}
                alt={itemToDelete.title}
                className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-100 shrink-0"
              />
              <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {translateProductTitle(itemToDelete)}
                </h4>
                {itemToDelete.selectedOptionsSummary && (
                  <span className="text-[10px] text-sky-800 bg-sky-100/60 px-1.5 py-0.5 rounded font-medium inline-block mt-0.5">
                    {itemToDelete.selectedOptionsSummary}
                  </span>
                )}
                <p className="text-xs font-extrabold text-sky-800 mt-1 font-mono">
                  {formatPrice(itemToDelete.price * itemToDelete.quantity)} ({itemToDelete.quantity} × {formatPrice(itemToDelete.price)})
                </p>
              </div>
            </div>

            <p className={`text-xs text-slate-600 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
              {isRtl
                ? 'هل تريد بالتأكيد حذف هذا المنتج من طلبك الحالي؟ سيتم تحديث الإجمالي وإلغاء أي تكاليف مرتبطة به فوراً.'
                : 'Are you sure you want to remove this item from your current order? The grand total will be updated immediately.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {isRtl ? 'إلغاء وتراجع' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await removeItem(itemToDelete.id);
                  setItemToDelete(null);
                  showToast(isRtl ? 'تم حذف المنتج من الطلب' : 'Item removed from order', 'info');
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRtl ? 'نعم، احذف المنتج' : 'Yes, Remove Item'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
