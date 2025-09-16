// i18n aggregator with lazy‑loaded language packs
// - EN is bundled eagerly as baseline and source of TranslationKey
// - Other languages are code‑split via dynamic imports in ensureLanguage()
// - Non‑EN packs are Partial to allow seamless fallback to EN
import { en } from "./translations/en";

// Types derived from the English baseline to keep key safety
// Keys are derived from EN to ensure compile‑time safety
export type TranslationKey = keyof typeof en;
export type Language = "en" | "pl" | "id" | "pt";

// Allow non-EN packs to be partial; EN should be the complete baseline
// Non‑EN languages can be incomplete at runtime; EN is the complete baseline
export type LanguagePack = Partial<Record<TranslationKey, string>>;

// Runtime store with only EN eagerly loaded; others fill in on demand
// Runtime cache; starts with EN and fills on demand
export const translations: Partial<Record<Language, LanguagePack>> = {
  en,
};

/**
 * Ensure the language pack is loaded. EN is bundled by default; other languages
 * are code-split and dynamically imported when requested.
 */
// Dynamically load the requested language pack (no‑op if already cached)
export async function ensureLanguage(lang: Language): Promise<void> {
  if (lang === "en" || translations[lang]) return;
  switch (lang) {
    case "pl": {
      const mod = await import("./translations/pl");
      translations.pl = mod.pl;
      return;
    }
    case "id": {
      const mod = await import("./translations/id");
      translations.id = mod.id;
      return;
    }
    case "pt": {
      const mod = await import("./translations/pt");
      translations.pt = mod.pt;
      return;
    }
    default:
      return;
  }
}