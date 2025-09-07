import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, type Language, type TranslationKey } from '../lib/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as Language | null) : null;
    return stored && stored in translations ? stored : 'en';
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* ignore */ }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(prev => (prev === lang ? prev : lang));
  }, []);

  const t = useMemo(() => (key: TranslationKey) => translations[language]?.[key] ?? key, [language]);

  const value: LanguageContextValue = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (<LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>);
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}
