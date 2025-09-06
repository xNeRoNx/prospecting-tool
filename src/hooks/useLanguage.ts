import { useKV } from '@github/spark/hooks';
import { translations, type Language, type TranslationKey } from '../lib/translations';
import { useMemo } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('language', 'en');
  
  const t = useMemo(() => {
    return (key: TranslationKey): string => {
      return translations[language][key] || key;
    };
  }, [language]);
  
  return { language, setLanguage, t };
}