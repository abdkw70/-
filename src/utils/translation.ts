export type LocalizedText = string | { ar: string; en: string };

export function getLocalizedText(text: LocalizedText | undefined | null, language: string): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[language as 'ar' | 'en'] || text.ar || '';
}
