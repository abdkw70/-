import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Gift,
  Tag,
  Users,
  Eye,
  RefreshCw,
  Info,
  Check,
  X,
  Zap,
} from 'lucide-react';
import { PromotionSettings } from '../../types';
import { fetchAdminPromotions, updateAdminPromotions } from '../../lib/api';

interface AdminPromotionsProps {
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPromotions: React.FC<AdminPromotionsProps> = ({ showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'preview'>('settings');

  // Preview interactive state
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar');
  const [previewSampleName, setPreviewSampleName] = useState('عبدالرحمن');

  // Input String State for Discount Value to avoid "0" coercion bugs and support "2.500", "10", empty, etc.
  const [discountValueInput, setDiscountValueInput] = useState<string>('15');

  // Form State
  const [formData, setFormData] = useState<PromotionSettings>({
    enabled: true,
    discountType: 'percentage',
    discountValue: 15,
    couponCode: 'WELCOME15',
    titleAr: 'هدية خاصة لك 🎁',
    titleEn: 'Special Gift For You 🎁',
    messageAr: 'مرحباً {name} 👋\nاحصل الآن على خصم {discount} واستخدم كود الخصم {code} عند الطلب!',
    messageEn: 'Welcome {name} 👋\nGet {discount} off your order using code {code} at checkout!',
    buttonTextAr: 'تسوق الآن واستفد من الخصم',
    buttonTextEn: 'Shop Now & Claim Discount',
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    showToAuthenticatedUsers: true,
    showToGuests: true,
    delaySeconds: 1,
    frequency: 'session_once',
  });

  const normalizeArabicNumbers = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[0-9]/g, d => '0123456789'.indexOf(d).toString())
      .replace(/,/g, '.');
  };

  const handleDiscountInputChange = (rawVal: string) => {
    const normalized = normalizeArabicNumbers(rawVal);
    setDiscountValueInput(normalized);

    const parsed = Number(normalized);
    if (!isNaN(parsed) && normalized.trim() !== '') {
      setFormData(prev => ({ ...prev, discountValue: parsed }));
    }
  };

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminPromotions();
      if (res.success && res.promotion) {
        const p = res.promotion;
        setFormData({
          ...p,
          startAt: p.startAt ? new Date(p.startAt).toISOString().slice(0, 16) : '',
          endAt: p.endAt ? new Date(p.endAt).toISOString().slice(0, 16) : '',
        });
        setDiscountValueInput(p.discountValue !== undefined && p.discountValue !== null ? String(p.discountValue) : '');
      }
    } catch (err: any) {
      showToast?.(err.message || 'فشل تحميل إعدادات العروض', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.couponCode.trim()) {
      showToast?.('يرجى إدخال كود الخصم', 'error');
      return;
    }

    const trimmedDiscount = discountValueInput.trim();
    if (!trimmedDiscount) {
      showToast?.('يرجى إدخال قيمة الخصم.', 'error');
      return;
    }

    const normalizedDiscount = normalizeArabicNumbers(trimmedDiscount);
    const numDiscount = Number(normalizedDiscount);

    if (isNaN(numDiscount) || !isFinite(numDiscount)) {
      showToast?.('أدخل رقماً صحيحاً.', 'error');
      return;
    }

    if (formData.discountType === 'percentage') {
      if (numDiscount < 0) {
        showToast?.('يجب ألا تقل نسبة الخصم عن 0%.', 'error');
        return;
      }
      if (numDiscount > 100) {
        showToast?.('لا يمكن أن تتجاوز نسبة الخصم 100%.', 'error');
        return;
      }
    } else {
      if (numDiscount < 0) {
        showToast?.('لا يمكن أن تكون قيمة الخصم سالبة.', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Partial<PromotionSettings> = {
        ...formData,
        discountValue: numDiscount,
        couponCode: formData.couponCode.toUpperCase().trim(),
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : null,
      };

      const res = await updateAdminPromotions(payload);
      if (res.success && res.promotion) {
        showToast?.(res.message || 'تم حفظ إعدادات العرض المنبثق بنجاح!', 'success');
        const p = res.promotion;
        setFormData({
          ...p,
          startAt: p.startAt ? new Date(p.startAt).toISOString().slice(0, 16) : '',
          endAt: p.endAt ? new Date(p.endAt).toISOString().slice(0, 16) : '',
        });
        setDiscountValueInput(String(p.discountValue));
      } else {
        throw new Error(res.error || 'تعذر الحفظ');
      }
    } catch (err: any) {
      showToast?.(err.message || 'حدث خطأ أثناء حفظ الإعدادات', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Helper to substitute template variables for Preview
  const getSubstitutedText = (rawText: string, lang: 'ar' | 'en', nameOverride?: string) => {
    const currentNum = Number(normalizeArabicNumbers(discountValueInput.trim())) || 0;
    const formattedDiscount =
      formData.discountType === 'percentage'
        ? `${currentNum}%`
        : `${currentNum.toFixed(3)} ${lang === 'ar' ? 'د.ك' : 'KWD'}`;

    const effectiveName = nameOverride && nameOverride.trim()
      ? nameOverride.trim()
      : (lang === 'ar' ? 'مرحباً بك' : 'Welcome');

    let text = rawText || '';
    // Replace {name}
    text = text.replace(/\{name\}/g, effectiveName);
    // Replace {discount}
    text = text.replace(/\{discount\}/g, formattedDiscount);
    // Replace {code}
    text = text.replace(/\{code\}/g, formData.couponCode.toUpperCase().trim() || 'WELCOME15');

    return text;
  };

  const insertVariable = (fieldName: 'messageAr' | 'messageEn', variable: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName] + ` ${variable}`,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mb-3" />
        <p className="text-sm font-medium">جاري تحميل إعدادات العروض والخصومات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12" dir="rtl">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  نظام العرض المنبثق والخصومات التفاعلية
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${
                  formData.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {formData.enabled ? '🟢 مفعّل حالياً' : '🔴 متوقف'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                أنشئ نافذة خصم منبثقة أنيقة ومخصصة باسم المستخدم المسجل، واربطها مباشرة بنظام الكوبونات والخصومات الحقيقي للمتجر مع التحكم في المواعيد والجمهور المستهدف.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 touch-manipulation active:scale-95 shrink-0"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings vs Live Preview Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-sky-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>لوحة التحكم والإعدادات</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400" />
          <span>المعاينة الحية للنافذة (Live Preview)</span>
        </button>
      </div>

      {/* Main Settings Form */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Status & Audience Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">1. حالة العرض والجمهور المستهدف</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Master Switch */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-sm text-white">تفعيل النافذة المنبثقة</span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {formData.enabled ? 'تظهر للمتسوقين حسب المواعيد' : 'مغلقة تماماً عن جميع المستخدمين'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Authenticated Users */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-sm text-white">المستخدمون المسجلون</span>
                    <span className="block text-xs text-slate-400 mt-0.5">إظهار العرض المخصص باسم العميل</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showToAuthenticatedUsers}
                      onChange={e => setFormData({ ...formData, showToAuthenticatedUsers: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* Guest Users */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="block font-bold text-sm text-white">الزوار والضيوف (غير المسجلين)</span>
                    <span className="block text-xs text-slate-400 mt-0.5">إظهار العرض بصيغة ترحيبية عامة أنيقة (مثل: مرحباً بك 👋)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showToGuests}
                      onChange={e => setFormData({ ...formData, showToGuests: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Discount & Coupon Integration */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-sky-400" />
                  <h2 className="text-base font-bold text-white">2. نوع الخصم وكود الكوبون الحقيقي</h2>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  مربوط بنظام الكوبونات
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Discount Type */}
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">نوع الخصم</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formData.discountType === 'percentage'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      نسبة %
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: 'fixed_amount' })}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        formData.discountType === 'fixed_amount'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      مبلغ د.ك
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    قيمة الخصم {formData.discountType === 'percentage' ? '(%)' : '(د.ك KWD)'}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountValueInput}
                    onChange={e => handleDiscountInputChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-hidden focus:border-sky-500"
                    placeholder={formData.discountType === 'percentage' ? 'مثال: 10' : 'مثال: 2.500'}
                    dir="ltr"
                  />
                </div>

                {/* Coupon Code */}
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">كود الكوبون الحقيقي</label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={e => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono font-black text-sm uppercase focus:outline-hidden focus:border-amber-500"
                    placeholder="مثال: WELCOME15"
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-start gap-2.5 text-xs text-sky-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
                <p>
                  عند حفظ التغييرات، سيقوم النظام تلقائياً بتحديث أو إنشائه كـ <strong>كوبون مفعّل حقيقي</strong> في قاعدة بيانات المتجر لتيسير استخدامه أثناء عملية الدفع (Checkout) وسلة المشتريات.
                </p>
              </div>
            </div>

            {/* 3. Titles & Messages (Localized with Template Variables) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-rose-400" />
                  <h2 className="text-base font-bold text-white">3. عناوين ونصوص العرض (عربي وإنجليزي)</h2>
                </div>
              </div>

              {/* Template Variable Helper Chips */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="block text-xs font-bold text-slate-300">المتغيرات الديناميكية المتاحة (انقر لإضافتها للنص):</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertVariable('messageAr', '{name}')}
                    className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    + &#123;name&#125; (الاسم)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('messageAr', '{discount}')}
                    className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    + &#123;discount&#125; (قيمة الخصم)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertVariable('messageAr', '{code}')}
                    className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    + &#123;code&#125; (كود الخصم)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arabic Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">العنوان الرئيسي (عربي)</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-hidden focus:border-sky-500"
                    placeholder="هدية خاصة لك 🎁"
                    dir="rtl"
                  />
                </div>

                {/* English Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm focus:outline-hidden focus:border-sky-500"
                    placeholder="Special Gift For You 🎁"
                    dir="ltr"
                  />
                </div>

                {/* Arabic Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">النص والتفاصيل (عربي)</label>
                  <textarea
                    rows={3}
                    value={formData.messageAr}
                    onChange={e => setFormData({ ...formData, messageAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-sky-500"
                    placeholder="مرحباً {name} 👋..."
                    dir="rtl"
                  />
                </div>

                {/* English Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Message & Details (English)</label>
                  <textarea
                    rows={3}
                    value={formData.messageEn}
                    onChange={e => setFormData({ ...formData, messageEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-medium focus:outline-hidden focus:border-sky-500"
                    placeholder="Welcome {name} 👋..."
                    dir="ltr"
                  />
                </div>

                {/* Button Text Arabic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">نص زر الإجراء (عربي)</label>
                  <input
                    type="text"
                    value={formData.buttonTextAr}
                    onChange={e => setFormData({ ...formData, buttonTextAr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-hidden focus:border-sky-500"
                    placeholder="تسوق الآن"
                    dir="rtl"
                  />
                </div>

                {/* Button Text English */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Button Text (English)</label>
                  <input
                    type="text"
                    value={formData.buttonTextEn}
                    onChange={e => setFormData({ ...formData, buttonTextEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-hidden focus:border-sky-500"
                    placeholder="Shop Now"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right / Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Schedule & Timing */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">4. توقيت ومواعيد العرض</h2>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">تاريخ ووقت البدء</label>
                  <input
                    type="datetime-local"
                    value={formData.startAt || ''}
                    onChange={e => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">تاريخ ووقت الانتهاء</label>
                  <input
                    type="datetime-local"
                    value={formData.endAt || ''}
                    onChange={e => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="block text-[11px] font-bold text-slate-400">اختصارات التوقيت السريعة:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const week = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                        setFormData({
                          ...formData,
                          startAt: now.toISOString().slice(0, 16),
                          endAt: week.toISOString().slice(0, 16),
                        });
                      }}
                      className="px-2 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium rounded-lg text-center cursor-pointer transition-colors"
                    >
                      لمدة أسبوع
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const month = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                        setFormData({
                          ...formData,
                          startAt: now.toISOString().slice(0, 16),
                          endAt: month.toISOString().slice(0, 16),
                        });
                      }}
                      className="px-2 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium rounded-lg text-center cursor-pointer transition-colors"
                    >
                      لمدة شهر
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          endAt: '',
                        });
                      }}
                      className="col-span-2 px-2 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-400 font-medium rounded-lg text-center cursor-pointer transition-colors"
                    >
                      بلا تاريخ انتهاء (مفتوح)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delay & Frequency */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">5. طريقة وتكرار الظهور</h2>
              </div>

              <div className="space-y-4">
                {/* Delay */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">التأخير قبل الظهور (ثوانٍ)</label>
                  <select
                    value={formData.delaySeconds}
                    onChange={e => setFormData({ ...formData, delaySeconds: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-hidden focus:border-sky-500 cursor-pointer"
                  >
                    <option value={0}>0 ثوانٍ (فوري عند دخول الصفحة)</option>
                    <option value={1}>1 ثانية (مستحسن)</option>
                    <option value={2}>2 ثوانٍ</option>
                    <option value={3}>3 ثوانٍ</option>
                    <option value={5}>5 ثوانٍ</option>
                  </select>
                </div>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">تكرار العرض للمتسوق</label>
                  <select
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:outline-hidden focus:border-sky-500 cursor-pointer"
                  >
                    <option value="every_visit">في كل زيارة / فتح للموقع</option>
                    <option value="session_once">مرة واحدة في الجلسة (Session)</option>
                    <option value="daily_once">مرة واحدة يومياً (Once Daily)</option>
                    <option value="user_once">مرة واحدة فقط لكل حساب/مستخدم</option>
                    <option value="until_closed">لا يظهر مجدداً بعد إغلاقه (Until Closed)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Submit Action */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 touch-manipulation active:scale-95"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>حفظ واعتماد التغييرات</span>
            </button>
          </div>
        </form>
      )}

      {/* Live Interactive Preview Tab */}
      {activeTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                المعاينة التفاعلية المباشرة (Live Popup Preview)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                اختبر كيف ستبدو النافذة للمتسوقين قبل تفعيلها أو حفظ الإعدادات.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Language Switch */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setPreviewLang('ar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewLang === 'ar' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  العربية (RTL)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewLang === 'en' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English (LTR)
                </button>
              </div>

              {/* Sample User Input */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 shrink-0">اسم تجريبي:</span>
                <input
                  type="text"
                  value={previewSampleName}
                  onChange={e => setPreviewSampleName(e.target.value)}
                  className="w-32 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-hidden focus:border-amber-500"
                  placeholder="عبدالرحمن"
                />
              </div>
            </div>
          </div>

          {/* Simulated Browser Viewport Stage */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 min-h-[420px] flex items-center justify-center relative overflow-hidden backdrop-blur-md">
            {/* Stage Background Store Placeholder */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col p-6 space-y-4">
              <div className="h-10 bg-slate-800 rounded-xl w-full" />
              <div className="h-40 bg-slate-800 rounded-2xl w-full" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-28 bg-slate-800 rounded-xl" />
                <div className="h-28 bg-slate-800 rounded-xl" />
                <div className="h-28 bg-slate-800 rounded-xl" />
              </div>
            </div>

            {/* Floating Popup Preview */}
            <div
              className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-200/60 z-20 transition-all duration-300"
              dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Close Button X */}
              <button
                type="button"
                className="absolute top-4 start-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Top Badge Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shadow-xl">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-500">
                    <Gift className="w-8 h-8 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-center text-slate-900 font-cairo tracking-tight">
                {previewLang === 'ar' ? formData.titleAr || 'هدية خاصة لك 🎁' : formData.titleEn || 'Special Gift For You 🎁'}
              </h3>

              {/* Message */}
              <div className="mt-3 text-center text-slate-600 text-sm font-tajawal leading-relaxed whitespace-pre-line">
                {getSubstitutedText(
                  previewLang === 'ar' ? formData.messageAr : formData.messageEn,
                  previewLang,
                  previewSampleName
                )}
              </div>

              {/* Highlight Coupon Box */}
              <div className="mt-5 p-3.5 bg-gradient-to-r from-amber-50 via-rose-50 to-sky-50 border-2 border-dashed border-amber-300 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {previewLang === 'ar' ? 'كود الخصم المتاح:' : 'PROMO CODE:'}
                  </span>
                  <span className="text-lg font-black font-mono text-amber-700 tracking-wider">
                    {formData.couponCode.toUpperCase().trim() || 'WELCOME15'}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs">
                  {formData.discountType === 'percentage'
                    ? `${formData.discountValue}% ${previewLang === 'ar' ? 'خصم' : 'OFF'}`
                    : `${formData.discountValue.toFixed(3)} ${previewLang === 'ar' ? 'د.ك' : 'KWD'}`}
                </div>
              </div>

              {/* Shop Now CTA Button */}
              <button
                type="button"
                className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <span>
                  {previewLang === 'ar'
                    ? formData.buttonTextAr || 'تسوق الآن'
                    : formData.buttonTextEn || 'Shop Now'}
                </span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
