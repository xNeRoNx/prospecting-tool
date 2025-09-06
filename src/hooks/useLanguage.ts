import { useKV } from '@github/spark/hooks';
import { translations, type Language, type TranslationKey } from '../lib/translations';

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('language', 'en');
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
  
  return { language, setLanguage, t };
}