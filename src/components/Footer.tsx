import React from 'react';
import { Phone, Mail, Instagram, MapPin, ShieldCheck, Truck, RotateCcw, MessageCircle, ExternalLink } from 'lucide-react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  categories: Category[];
  onNavigate: (path: string, query?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ categories, onNavigate }) => {
  const { language, dir, isRtl, t, translateCategory } = useLanguage();
  const rootCategories = categories.filter(c => !c.parentId).slice(0, 6);

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800" dir={dir}>
      {/* Value Proposition Features Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-slate-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تغطية شاملة لجميع مناطق ومحافظات الكويت' : 'Comprehensive coverage across all Kuwait areas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'ar' ? 'دفع عند الاستلام' : 'Cash on Delivery'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'ادفع نقدًا عند استلام طلبك بكل راحة وأمان' : 'Pay in cash upon receipt with ease and security'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'ar' ? 'استرجاع واستبدال مرن' : 'Flexible Returns'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'وفق الشروط والضوابط لضمان رضاكم' : 'According to clear terms to ensure your satisfaction'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'ar' ? 'خدمة عملاء وطلب مباشر' : '24/7 Support & Direct Order'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تواصل مباشر عبر الواتساب على مدار الساعة' : 'Direct communication via WhatsApp anytime'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://assets.wuiltstore.com/clqvb10wk0zhh01o1ed177fz2__D8_B4_D8_B9_D8_A7_D8_B14.png"
                alt="مكتبة الشاطئ الازرق"
                className="h-10 w-auto object-contain bg-white/5 p-1 rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('/favicon.svg')) {
                    target.src = '/favicon.svg';
                  }
                }}
              />
              <div>
                <span className="block text-base font-bold text-white leading-tight">
                  {language === 'ar' ? 'مكتبة الشاطئ الازرق' : 'Blue Beach Stationery'}
                </span>
                <span className="block text-xs text-sky-400 uppercase tracking-wide">BLUE BEACH STATIONERY</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              {language === 'ar'
                ? 'وجهتكم الأولى في دولة الكويت لكافة مستلزمات القرطاسية، الشنط المدرسية الفاخرة، أدوات الرسم والفنون التشكيلية، الألعاب التعليمية والتربوية، والمستلزمات المكتبية بجودة عالية وأسعار تنافسية.'
                : 'Your premier destination in Kuwait for stationery, premium school backpacks, art and painting supplies, educational games, and office essentials at competitive prices.'}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-300 underline flex items-center gap-1 transition-colors"
                >
                  <span>{language === 'ar' ? 'موقع المتجر على خرائط جوجل (Google Maps)' : 'Store location on Google Maps'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/96597123698"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-300 font-bold transition-colors"
                  dir="ltr"
                >
                  +965 97123698
                </a>
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? '(واتساب مباشر)' : '(Direct WhatsApp)'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:bbstq8@gmail.com" className="hover:text-white transition-colors">
                  bbstq8@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/maktaba_q8"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-rose-600 hover:to-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/96597123698"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-800"
                aria-label="Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">
              {language === 'ar' ? 'أهم الأقسام' : 'Top Categories'}
            </h4>
            <ul className="space-y-2 text-xs">
              {rootCategories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/category/${cat.handle}`)}
                    className={`hover:text-sky-400 transition-colors cursor-pointer ${isRtl ? 'text-right' : 'text-left'}`}
                  >
                    {translateCategory(cat.title)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('/shop', { hasDiscount: 'true' })}
                  className="text-rose-400 hover:text-rose-300 transition-colors font-semibold cursor-pointer"
                >
                  {language === 'ar' ? 'العروض والتخفيضات' : 'Sale & Discounts'}
                </button>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'جميع المنتجات' : 'All Products'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/track-order')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'تتبع الشحنة والطلب' : 'Track Order'}
                </button>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/KNmkE9nq7CbD2Ws69?g_st=ic"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-400 transition-colors flex items-center gap-1"
                >
                  <span>{language === 'ar' ? 'زيارة المتجر (الخريطة)' : 'Store on Maps'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 border-b border-slate-800 pb-2">
              {language === 'ar' ? 'السياسات والضمان' : 'Policies & Terms'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/policy/refund')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'سياسة الاسترجاع والاستبدال' : 'Refund & Exchange Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/policy/privacy')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/policy/terms')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/policy/shipping')} className="hover:text-sky-400 transition-colors cursor-pointer">
                  {language === 'ar' ? 'سياسة الشحن والتوصيل' : 'Shipping & Delivery'}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Payment Badges & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mt-6 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {language === 'ar'
              ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} مكتبة الشاطئ الأزرق`
              : `All Rights Reserved © ${new Date().getFullYear()} Blue Beach Stationery`}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 mx-2">
              {language === 'ar' ? 'طرق الدفع المعتمدة:' : 'Payment Methods:'}
            </span>
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <span>{language === 'ar' ? 'الدفع عند الاستلام (كاش)' : 'Cash on Delivery (COD)'}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <span>{language === 'ar' ? 'الطلب عبر الواتساب' : 'WhatsApp Order'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

