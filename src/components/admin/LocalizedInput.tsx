import React from 'react';
import { LocalizedText } from '../../utils/translation';

interface LocalizedInputProps {
  label: string;
  value: LocalizedText | undefined;
  onChange: (value: LocalizedText) => void;
  type?: 'text' | 'textarea';
  placeholderAr?: string;
  placeholderEn?: string;
  theme?: 'light' | 'dark';
}

export const LocalizedInput: React.FC<LocalizedInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholderAr = 'العربية',
  placeholderEn = 'English',
  theme = 'dark',
}) => {
  const safeValue = (typeof value === 'string') 
    ? { ar: value, en: value } 
    : (value || { ar: '', en: '' });

  const handleChange = (lang: 'ar' | 'en', text: string) => {
    onChange({
      ...safeValue,
      [lang]: text,
    });
  };

  const isDark = theme === 'dark';
  const labelColor = isDark ? 'text-slate-300' : 'text-slate-700';
  const inputBg = isDark ? 'bg-slate-800' : 'bg-slate-50';
  const inputBorder = isDark ? 'border-slate-700' : 'border-slate-200';
  const inputText = isDark ? 'text-white' : 'text-slate-800';

  const baseInputClass = `w-full py-2 ${inputBg} border ${inputBorder} rounded-xl ${inputText} text-xs focus:outline-none`;

  return (
    <div className="space-y-2">
      <label className={`font-bold block ${labelColor}`}>{label}</label>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <span className="absolute right-3 top-2.5 text-[10px] font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">AR</span>
          {type === 'textarea' ? (
            <textarea
              value={safeValue.ar || ''}
              onChange={(e) => handleChange('ar', e.target.value)}
              placeholder={placeholderAr}
              dir="rtl"
              rows={2}
              className={`${baseInputClass} pl-3 pr-10 focus:border-amber-500`}
            />
          ) : (
            <input
              type="text"
              value={safeValue.ar || ''}
              onChange={(e) => handleChange('ar', e.target.value)}
              placeholder={placeholderAr}
              dir="rtl"
              className={`${baseInputClass} pl-3 pr-10 focus:border-amber-500`}
            />
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[10px] font-bold bg-sky-500/20 text-sky-500 px-1.5 py-0.5 rounded">EN</span>
          {type === 'textarea' ? (
            <textarea
              value={safeValue.en || ''}
              onChange={(e) => handleChange('en', e.target.value)}
              placeholder={placeholderEn}
              dir="ltr"
              rows={2}
              className={`${baseInputClass} pr-3 pl-10 focus:border-sky-500 text-left`}
            />
          ) : (
            <input
              type="text"
              value={safeValue.en || ''}
              onChange={(e) => handleChange('en', e.target.value)}
              placeholder={placeholderEn}
              dir="ltr"
              className={`${baseInputClass} pr-3 pl-10 focus:border-sky-500 text-left`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
