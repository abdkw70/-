import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCategoryTitle,
  getProductTitle,
  getProductDescription,
  getOptionName,
  getOptionValue,
} from '../utils/translationUtils';
import { translations, Language } from '../i18n/translations';

export type { Language };

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  storeName: string;
  currency: string;
  formatPrice: (amount: number | string | undefined | null) => string;
  translateCategory: (cat: { title: string; titleEn?: string } | string | undefined | null) => string;
  translateProductTitle: (product: { title: string; titleEn?: string } | string | null | undefined) => string;
  translateProductDesc: (product: { description: string; descriptionEn?: string } | null | undefined) => string;
  translateOptionName: (name: string) => string;
  translateOptionValue: (value: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mq_language');
      return saved === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const isRtl = language === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('mq_language', newLang);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.setAttribute('data-lang', language);

    // Dynamic Title and Meta Description update
    if (language === 'ar') {
      document.title = 'مكتبة الشاطئ الأزرق | الأدوات المدرسية والمكتبية والهدايا في الكويت';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'أكبر تشكيلة من الأدوات المدرسية والمكتبية والفنية في دولة الكويت - توصيل سريع ودفع عند الاستلام.');
      }
    } else {
      document.title = 'Blue Beach Stationery | School, Office & Art Supplies in Kuwait';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'The premier stationery, school, art, and office supplies store in Kuwait. Fast delivery & cash on delivery.');
      }
    }
  }, [dir, language]);

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      let text = translations[language]?.[key] || translations['ar']?.[key];
      
      if (!text) {
        if (fallback) {
          text = fallback;
        } else {
          // Smart fallback for missing keys to avoid showing technical keys like 'shop.sort_default'
          if (language === 'ar') {
             if (key.includes('sort')) text = 'ترتيب';
             else if (key.includes('filter')) text = 'تصفية';
             else if (key.includes('search')) text = 'بحث';
             else if (key.includes('cart')) text = 'السلة';
             else if (key.includes('checkout')) text = 'الدفع';
             else if (key.includes('shop') || key.includes('product')) text = 'المنتجات';
             else if (key.includes('auth') || key.includes('login')) text = 'الحساب';
             else text = ''; // Don't show English keys in Arabic UI
          } else {
            // For English, format the key to look like normal text (e.g., shop.sort_default -> Sort Default)
            text = key.split('.').pop()?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || key;
          }
        }
      }

      if (params && text) {
        Object.entries(params).forEach(([paramKey, val]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }
      
      return text || '';
    },
    [language]
  );

  const storeName = language === 'ar' ? 'مكتبة الشاطئ الأزرق' : 'Blue Beach Stationery';
  const currency = language === 'ar' ? 'د.ك' : 'KWD';

  const formatPrice = useCallback(
    (amount: number | string | undefined | null): string => {
      const val = Number(amount || 0);
      const formattedNum = val.toFixed(3);
      return language === 'ar' ? `${formattedNum} د.ك` : `${formattedNum} KWD`;
    },
    [language]
  );

  const translateCategory = useCallback(
    (cat: { title: string; titleEn?: string } | string | undefined | null): string => {
      return getCategoryTitle(cat, language);
    },
    [language]
  );

  const translateProductTitle = useCallback(
    (product: { title: string; titleEn?: string } | string | null | undefined): string => {
      if (!product) return '';
      if (typeof product === 'string') {
        return language === 'ar' ? product : getProductTitle({ title: product }, language);
      }
      return getProductTitle(product, language);
    },
    [language]
  );

  const translateProductDesc = useCallback(
    (product: { description: string; descriptionEn?: string } | null | undefined): string => {
      return getProductDescription(product, language);
    },
    [language]
  );

  const translateOptionName = useCallback(
    (name: string): string => {
      return getOptionName(name, language);
    },
    [language]
  );

  const translateOptionValue = useCallback(
    (value: string): string => {
      return getOptionValue(value, language);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isRtl,
        dir,
        t,
        storeName,
        currency,
        formatPrice,
        translateCategory,
        translateProductTitle,
        translateProductDesc,
        translateOptionName,
        translateOptionValue,
      }}
    >
      <div dir={dir} className={isRtl ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
