## Prospecting! Tools

Lekka aplikacja SPA zbudowana na Vite + React 19 + TypeScript. Zestaw narzędzi do planowania i symulacji (crafting, muzeum, wyposażenie, kolekcje) z lokalnym zapisem stanu, motywami i prostym i18n.

### Funkcje
- Zakładki: Crafting, Museum, Equipment, Collectibles (ikony Phosphor)
- SEO/UX: dynamiczny tytuł strony i meta description per zakładka
- Deep-linking: aktywna zakładka w hashu URL (`#crafting`, `#museum`, ...)
- Motywy: wsparcie dla trybu jasny/ciemny (Tailwind + hook `useTheme`)
- Dane: lokalny stan i cache (hooki `useAppData`, `useLocalStorage`)
- UI: komponenty oparte o Radix i Tailwind (shadcn/ui w `src/components/ui`)
- Powiadomienia: `sonner`
- Analityka i wydajność: `@vercel/analytics/react`, `@vercel/speed-insights/react`

### Stos technologiczny
- React 19, TypeScript, Vite 6
- Tailwind CSS 4, Radix UI, shadcn/ui
- TanStack Query, Zod, React Hook Form
- Recharts, D3, Framer Motion, Embla Carousel
- Phosphor Icons, Lucide Icons

### Wymagania wstępne
- Node.js >= 18.18 (zalecane LTS) i npm

### Szybki start
```powershell
npm install
npm run dev
```
Aplikacja uruchomi się na lokalnym serwerze Vite i wyświetli adres w terminalu.

### Budowanie i podgląd produkcyjny
```powershell
npm run build
npm run preview
```

### Dodatkowe skrypty
```powershell
npm run lint
npm run optimize
```

### Struktura katalogów (skrót)
```
public/            # ikony, manifest PWA, favicony
src/
	components/      # ekrany i UI (shadcn/ui)
	hooks/           # useLanguage, useTheme, useAppData, useLocalStorage
	lib/             # gameData, translations, utils
	styles/          # style motywu
	App.tsx          # layout zakładek, SEO, routing po hashu
```

### I18n i routing
- Język PL dodaje prefiks ścieżki `/pl` i ustawia `document.documentElement.lang = 'pl'`.
- Aktywna zakładka jest trzymana w hashu (`#crafting`, `#museum`, `#equipment`, `#collectibles`).

### Motyw i stylowanie
- Tailwind 4 + CSS zmienne motywu (`styles/theme.css`).
- Hook `useTheme` stosuje motyw na starcie aplikacji.

### Analityka
- Używany jest wariant React: `@vercel/analytics/react` oraz `@vercel/speed-insights/react` (bez Next.js).

### Wskazówki dotyczące rozmiaru bundla
Jeśli zobaczysz ostrzeżenie o dużych chunkach (>500 kB), rozważ:
- dynamiczne importy dla ciężkich bibliotek (`recharts`, `d3`, `three`),
- konfigurację `manualChunks` w `vite.config.ts`.

### Licencja
Zobacz plik `LICENSE` w repozytorium.
