import { translations } from '@/app/translations'

export function translate(key: keyof typeof translations.en, language: 'en' | 'zh') {
  return translations[language][key];
} 