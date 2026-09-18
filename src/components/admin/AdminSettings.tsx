import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Phone,
  MessageCircle,
  Mail,
  Instagram,
  MapPin,
  Truck,
  DollarSign,
  Save,
  Check,
  Megaphone,
} from 'lucide-react';
import { StoreSettings } from '../../types';
import * as api from '../../lib/api';

interface AdminSettingsProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ showToast }) => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeNameAr: 'مكتبة الشاطئ الازرق',
    storeNameEn: 'Blue Beach Stationery',
    whatsapp: '+96597123698',
    phone: '+96597123698',
    email: 'info@bluebeachstationery.com',
    instagram: '@bluebeach_stationery',
    googleMapsUrl: 'https://maps.google.com/?q=Kuwait',
    currency: 'د.ك',
    shippingFee: 2.0,
    standardShippingFee: 2.0,
    freeShippingEnabled: true,
    freeShippingThreshold: 20.0,
    announcementText: 'توصيل سريع لجميع مناطق الكويت خلال 24-48 ساعة 🚚',
    enableOrders: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const res = await api.fetchAdminSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err: any) {
        showToast(err.message || 'فشل جلب إعدادات المتجر', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.saveAdminSettings(settings);
      if (res.success) {
        showToast('تم حفظ إعدادات المتجر بنجاح', 'success');
        setSettings(res.settings);
      }
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإعدادات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">جاري تحميل إعدادات المتجر...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>إعدادات المتجر وبيانات التواصل</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إدارة اسم المتجر، أرقام الواتساب والهاتف، أسعار التوصيل، وشريط الإعلانات
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Brand Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-sky-400 flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span>هوية المتجر</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                اسم المتجر (بالعربية)
              </label>
              <input
                type="text"
                value={settings.storeNameAr}
                onChange={e => setSettings({ ...settings, storeNameAr: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                اسم المتجر (بالإنجليزية)
              </label>
              <input
                type="text"
                value={settings.storeNameEn}
                onChange={e => setSettings({ ...settings, storeNameEn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Social Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>بيانات التواصل والواتساب</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                رقم الواتساب الرئيسي للطلبات
              </label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="+96597123698"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                رقم هاتف الاتصال المباشر
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+96597123698"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@maktabaq8.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                حساب انستغرام Instagram
              </label>
              <input
                type="text"
                value={settings.instagram}
                onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                placeholder="@maktaba_q8"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Shipping & Announcement */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-indigo-400 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>إعدادات الشحن والتوصيل وشريط الإعلانات</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Standard Shipping Fee */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                أ. رسوم التوصيل القياسية (د.ك)
              </label>
              <input
                type="number"
                step="0.250"
                min="0"
                value={settings.standardShippingFee ?? settings.shippingFee ?? 2.0}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setSettings({ ...settings, standardShippingFee: val, shippingFee: val });
                }}
                placeholder="2.000"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-slate-400">مثال: 1.500 أو 2.000 أو 3.000 د.ك</p>
            </div>

            {/* 2. Free Shipping Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                ب. تفعيل التوصيل المجاني
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.freeShippingEnabled !== false}
                    onChange={e => setSettings({ ...settings, freeShippingEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-200">
                  {settings.freeShippingEnabled !== false ? 'مفعل (مجاني فوق الحد)' : 'معطل (دفع الرسوم دائماً)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">إذا كان معطلاً، يدفع العميل الرسوم القياسية دائماً</p>
            </div>

            {/* 3. Free Shipping Threshold */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                ج. الحد الأدنى للتوصيل المجاني (د.ك)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                disabled={settings.freeShippingEnabled === false}
                value={settings.freeShippingThreshold}
                onChange={e => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                placeholder="20"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400">يصبح التوصيل مجاناً إذا تجاوزت السلة هذا المبلغ</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              نص شريط الإعلانات العلوي
            </label>
            <input
              type="text"
              value={settings.announcementText}
              onChange={e => setSettings({ ...settings, announcementText: e.target.value })}
              placeholder="مثال: توصيل سريع لجميع مناطق الكويت 🚚"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        
        {/* AI Chatbot Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-sky-400">🤖</span> إعدادات المساعد الذكي (AI Chatbot)
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.aiChatEnabled !== false}
                onChange={e => setSettings({ ...settings, aiChatEnabled: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
              <span className="ms-3 text-xs font-medium text-slate-300">
                {settings.aiChatEnabled !== false ? 'مفعل' : 'معطل'}
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">تعليمات النظام (System Prompt)</label>
            <p className="text-[10px] text-slate-500 mb-2">هذه التعليمات توجه الذكاء الاصطناعي (Gemini) لكيفية التحدث مع العملاء. يمكنك تحديد نبرة الصوت وتوجيهه لعدم الإجابة على الأسئلة الخارجة عن تخصص المكتبة.</p>
            <textarea
              value={settings.aiChatSystemPrompt || ''}
              onChange={e => setSettings({ ...settings, aiChatSystemPrompt: e.target.value })}
              rows={6}
              placeholder="أنت مساعد ذكي..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4">المساعد الصوتي</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">تفعيل المساعد الصوتي</h4>
                  <p className="text-[10px] text-slate-400 mt-1">تفعيل ميزة التحدث والاستماع داخل الشات</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.voiceAssistantEnabled !== false}
                    onChange={e => setSettings({ ...settings, voiceAssistantEnabled: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                  <span className="ms-3 text-xs font-medium text-slate-300">
                    {settings.voiceAssistantEnabled !== false ? 'مفعل' : 'معطل'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">الترحيب التلقائي بالمنتج</h4>
                  <p className="text-[10px] text-slate-400 mt-1">إرسال رسالة ترحيبية عند فتح العميل لمنتج معين</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.voiceAutoWelcomeEnabled !== false}
                    onChange={e => setSettings({ ...settings, voiceAutoWelcomeEnabled: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نص الترحيب بالمنتج (عربي)</label>
                <input
                  type="text"
                  value={settings.voiceAutoWelcomeTextAr || 'ممتاز، هذا المنتج متوفر حالياً. أقدر أساعدك إذا كان مناسب لاحتياجك.'}
                  onChange={e => setSettings({ ...settings, voiceAutoWelcomeTextAr: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نص الترحيب بالمنتج (إنجليزي)</label>
                <input
                  type="text"
                  value={settings.voiceAutoWelcomeTextEn || 'Great, this product is currently available. I can help you see if it fits your needs.'}
                  onChange={e => setSettings({ ...settings, voiceAutoWelcomeTextEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">مدة الانتظار قبل الترحيب (ثواني)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.voiceAutoWelcomeDelaySeconds ?? 3}
                  onChange={e => setSettings({ ...settings, voiceAutoWelcomeDelaySeconds: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ الإعدادات</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
