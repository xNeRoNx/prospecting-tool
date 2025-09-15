## Prospecting! Tools

Lightweight single-page application (Vite + React 19 + TypeScript) supporting planning and simulation for the game Prospecting! – crafting planner, museum configuration, equipment (stat simulation) and material tracking. Provides local persistence, export/import (JSON + compressed URL), theming, i18n (EN/PL/ID/PT), basic SEO and an offline shell via a Service Worker.

## Demo / Deploy
Production: https://prospecting-tool.vercel.app

## Key Features
- Tabs: Crafting, Museum, Equipment, Info (hash routing: `#crafting`, `#museum`, ...)
- Dynamic meta (title + description) based on active tab & language
- I18n: language path prefix (`/en`, `/pl`, `/id`, `/pt`) + remembered in localStorage
- Themes: light / dark + several variants (CSS variables + Tailwind 4) – `useTheme` hook
- Data persistence: localStorage + save slots + automatic backup before import
- Export / Import: JSON file or URL (compressed via `pako` in hash `#data=`) + per‑category selection
- Museum & Equipment: multiplier planning (Max mode live – Weight mode placeholder)
- Crafting: dynamic list + material computation & “Can craft” panel
- UI: Radix + customized shadcn/ui components; notifications via `sonner`
- Analytics & performance: `@vercel/analytics/react`, `@vercel/speed-insights/react`
- PWA‑ish: simple Service Worker caching app shell + locale manifests

## Tech Stack
- React 19, TypeScript, Vite 6
- Tailwind CSS 4, Radix UI, shadcn/ui
- Forms / validation: React Hook Form, Zod
- Visualization / animation: Recharts, D3, Framer Motion, Embla Carousel
- Icons: Phosphor, Lucide, Heroicons
- Utils: `pako` (compression), `uuid`, `date-fns`

## Requirements
- Node.js >= 18.18 (LTS recommended)

## Quick Start (dev)
```powershell
npm install
npm run dev
```
Vite dev server will display the local URL in the terminal.

## Production Build & Preview
```powershell
npm run build
npm run preview
```

## Additional Scripts
```powershell
npm run lint       # ESLint
npm run optimize   # Pre-bundle dependency optimization
```

## Directory Structure (short)
```
public/            # favicons, manifests, images, offline.html
src/
  components/      # screens + ui/ (shadcn + Radix wrappers)
  hooks/           # useLanguage, useTheme, useAppData, useLocalStorage
  lib/             # gameData, translations, utils, urlCompression
  styles/          # theme.css (color/theme variables)
  sw.ts            # Service Worker
  App.tsx          # layout + tabs + SEO + canonical/hreflang
```

## Application Architecture
Presentation layer = components + Radix `Tabs`. Global data context (`useAppData`) aggregates: craftingItems, museumSlots, equipment, ownedMaterials – each persisted in localStorage via `useLocalStorageState`.

Startup flow:
1. Load data from localStorage (or create defaults) -> set `isLoading=false` after all are ready.
2. `useLanguage` resolves language from URL first segment or stored preference.
3. `App.tsx` sets `lang`, canonical + `hreflang` links, swaps locale manifest, updates meta description.
4. Tab hash (`#crafting` etc.) determines active view & enables deep‑linking.
5. Service Worker pre-caches shell & icons (network-first HTML, cache-first assets).

## I18n
- File: `src/lib/translations.ts` – object `translations[lang][key]`.
- Access: `useLanguage()` -> `t(key)`.
- Changing language updates first path segment & stores selection in localStorage.
- `hreflang` links generated dynamically; locale manifests swapped (`/manifest-pl.webmanifest`, etc.).

Adding a new language:
1. Add code (e.g. `es`) to the `Language` type + translation object.
2. (Optional) Create `manifest-es.webmanifest` in `public/`.
3. Update validation logic in `useLanguage` / `LanguageUrlSync`.

## Persistence & Data Management
- `useAppData` exposes API: export/import (file, URL), save slots (0–4) + backup slot (5).
- Every import / load triggers auto‑backup (slot 5).
- Selective operations let you move only chosen categories.
- URL export stores compressed JSON (`pako`) after `#data=` – never auto‑imports (preview first).

## Service Worker / Offline
- `src/sw.ts` emitted as `sw.js` (forced name via `vite.config.ts`).
- Caches: `core-<hash>` (shell, manifests, icons, offline.html) + `assets-<hash>` (hashed build files).
- Strategy: network-first HTML (offline fallback) & cache-first for assets/manifests/icons.
- Build hash (`__BUILD_HASH__`) from `git rev-parse` (random hex fallback) invalidates caches between deploys.

## Crafting (logic summary)
- Each entry has `quantity`, `craftedCount`, `completed` – edits recalc material needs.
- Materials panel shows only missing counts (completed portions excluded).
- “Can craft” calculates how many full items you can finish immediately with current inventory.

## Museum (logic summary)
- Slots per rarity, no duplicates, Weight mode placeholder (currently only Max multipliers active).
- Modifiers boost effect based on the ore's base rarity.
- Stats panel aggregates totals per stat.

## Equipment Simulation (logic summary)
Layer order: Shovel -> Pan -> Enchant -> Custom Stats -> Equipment Items -> Museum (Max) -> Events.
Weight mode currently returns 0 (planned). Items use top end of stat ranges (optimistic best roll scenario).

## Themes
- Color variables in `styles/theme.css` + Tailwind classes.
- `useTheme` hook persists preference & applies classes to `document.documentElement`.

## Testing / Quality
No formal unit / E2E tests yet. Potential future stack: Vitest + Testing Library.

## Contributing
Pull requests welcome. Suggested workflow:
1. Fork & create feature branch
2. `npm install` / `npm run dev`
3. Implement changes + lint: `npm run lint`
4. Update README / docs if applicable
5. Open PR (describe what / why / limitations)

### Project Policies & Docs
- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)
- [License (MIT)](./LICENSE)

TL;DR Conduct: Be respectful; no harassment or discrimination. Report privately via Discord `x_neron_x`.

## FAQ
Q: Are my data sent to a server?  
A: No. Everything stays in the browser unless you explicitly export (file or URL).

Q: I lost data after an import—can I revert?  
A: Yes, the auto‑backup (slot 5) is created before each import/load. Load that slot.

Q: Shared export URL does not work for someone.  
A: Ensure the entire fragment after `#data=` was copied intact.

Q: Can I add a new language?  
A: Yes – see the I18n section (add code + optional manifest).

## Security
No backend / tokens. Main risk is localStorage overwrite or clearing. Perform periodic exports.

## License
See the `LICENSE` file.

---
If this tool helps you, consider supporting the author (button inside the app). Thank you!
