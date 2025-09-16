import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// Language hook with on-demand language pack loading
// - Uses ensureLanguage() to code-split non-EN packs
// - Falls back to EN while loading or for missing keys
// - packVersion forces re-computation of t() after dynamic import resolves
import { translations, ensureLanguage, type Language, type TranslationKey } from '../lib/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initial language resolution: URL (/en or /pl) takes precedence over storage
    if (typeof window !== 'undefined') {
      const seg = window.location.pathname.split('/').filter(Boolean)[0] as Language | undefined;
    if (seg === 'en' || seg === 'pl' || seg === 'id' || seg === 'pt') return seg;
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === 'en' || stored === 'pl' || stored === 'id' || stored === 'pt')) return stored;
    }
    return 'en';
  });

  useEffect(() => {
    try { 
      localStorage.setItem(STORAGE_KEY, language); 
    } catch { 
      /* ignore */ 
    }
  }, [language]);

  // Optional: could expose 'loading' via context if useful for UI
  const [loading, setLoading] = useState(false);
  const [packVersion, setPackVersion] = useState(0);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(prev => (prev === lang ? prev : lang));
  }, []);

  // Memoized translator: current lang -> EN fallback -> raw key
  const t = useMemo(() => (key: TranslationKey) => {
    // 1. Attempt current language (may be partially loaded)
    const current = translations[language];
    if (current && current[key]) return current[key]!;
    // 2. Fallback to English (complete set)
    const enPack = translations['en'];
    if (enPack && enPack[key]) return enPack[key]!;
    // 3. Final fallback: raw key
    return key;
  }, [language, packVersion]);

  // Load language pack on change (if not already loaded)
  // Load language pack when switching to a not-yet-cached language
  useEffect(() => {
    let active = true;
    if (language === 'en' || translations[language]) return; 
    setLoading(true);
    ensureLanguage(language).finally(() => {
      if (!active) return;
      setLoading(false);
      // force consumers to re-render with freshly loaded pack
      setPackVersion(v => v + 1);
    });
    return () => { active = false; };
  }, [language]);

  const value: LanguageContextValue = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (<LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>);
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}

// Sync URL <-> language state
// - When language changes, ensure pathname starts with /en or /pl
// - On browser navigation (popstate), update language from URL
export function LanguageUrlSync() {
  const { language, setLanguage } = useLanguage();

  // Update URL when language changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { pathname, search, hash } = window.location;
    const parts = pathname.split('/').filter(Boolean);
    const hasLang = parts[0] === 'en' || parts[0] === 'pl' || parts[0] === 'id' || parts[0] === 'pt';
    const nextParts = [...parts];
    if (hasLang) {
      if (parts[0] !== language) {
        nextParts[0] = language;
      }
    } else {
      nextParts.unshift(language);
    }
    const nextPath = '/' + nextParts.join('/');
    if (nextPath !== pathname) {
      window.history.replaceState(null, '', `${nextPath}${search || ''}${hash || ''}`);
    }
  }, [language]);

  // Update language when URL changes via back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPop = () => {
      const seg = window.location.pathname.split('/').filter(Boolean)[0];
      if (seg === 'en' || seg === 'pl' || seg === 'id' || seg === 'pt') {
        setLanguage(seg);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setLanguage]);

  return null;
}
