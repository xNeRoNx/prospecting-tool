# Contributing Guidelines

> Current status: the project accepts pull requests, but EVERY change merged into `main` must be manually approved by the maintainer (`x_neron_x`). Branch `main` = production (automatic deploy after merge).

## Table of Contents
1. Purpose
2. General Principles
3. Environment / Setup
4. Branching & Flow
5. Commit Convention
6. Pull Request Checklist
7. Code Standards
8. I18n / Translations
9. Adding New Data (item / ore)
10. UI Style / Components
11. Performance & Bundling
12. Code of Conduct
13. Issue Reporting
14. Contributor FAQ

---
## 1. Purpose
Provide a consistent, predictable contribution process and maintain high quality for code and data.

## 2. General Principles
- Before starting a larger feature open an issue summarising the proposed solution.
- Keep scope minimal (avoid unrelated refactors inside feature PRs).
- Respect existing style & structure (consistency > personal taste).

## 3. Environment / Setup
```powershell
npm install
npm run dev
```
Requires Node >= 18.18. Verify the app runs locally before opening a PR.

## 4. Branching & Flow
- Do not commit directly to `main` – always create a branch: `feature/<short-desc>` / `fix/<issue>` / `docs/<area>`.
- When work is ready: open a PR targeting `main`.
- Merge is performed only by the maintainer (manual approval).

## 5. Commit Convention
Adopt a simplified Conventional Commits style:
```
<type>(optional-scope): short imperative summary
```
Suggested types:
- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation (README, PRD, CONTRIBUTING, etc.)
- `refactor`: internal change without altering behaviour
- `perf`: performance / bundle optimisation
- `style`: formatting / cosmetic (no logic)
- `test`: add / update tests
- `chore`: maintenance, config updates, tooling

Examples:
```
feat(crafting): add minimal materials summary toggle
fix(museum): prevent duplicate ore selection
```

## 6. Pull Request Checklist
- [ ] No stray files (logs, editor configs, build artefacts)
- [ ] Documentation / README updated if behaviour changes
- [ ] No unnecessary large synchronous imports
- [ ] PR description: what + why + manual test scope

## 7. Code Standards
- TypeScript: avoid `any` when a precise type is feasible
- Imports: use `@` alias for `src` (avoid deep relative chains)
- Functional components & hooks only (no class components)
- Avoid side effects in render; use `useEffect` / `useMemo` judiciously
- De‑duplicate logic – extract to `lib/utils` or custom hooks

## 8. I18n / Translations
- Translation keys: `src/lib/translations.ts`.
- When adding a key: add to EN then mirror to PL / ID / PT (can temporarily duplicate EN text but do not leave missing).
- Reuse existing keys where semantics match instead of creating near‑duplicates.

## 9. Adding New Data (item / ore)
1. Add definition in `lib/gameData.ts` (or appropriate future file) with full stat ranges, rarity, cost, recipe.
2. Maintain schema consistency (naming & ordering).
3. If UI label required – add translation key in all languages.
4. Manually verify material calculations & equipment/museum impacts.
5. Document data source in PR (official / community / inferred).

## 10. UI Style / Components
- Use existing wrappers in `src/components/ui` (shadcn + Radix) for consistency.
- Preserve semantic HTML (buttons as `<button>`, lists as `<ul>` ...).
- Avoid overriding global styles without justification.
- For new style variants prefer `class-variance-authority` over ad‑hoc conditional class chains.

## 11. Performance & Bundling
- Heavy libraries (`recharts`, `d3`, `three`) – prefer dynamic imports if used conditionally.
- Minimise recomputation; apply `useMemo` / `useCallback` only when profiling or dependency complexity warrants it.
- Avoid storing large derived structures in state if they can be computed on demand.

## 12. Code of Conduct
Participation implies agreement with:
- [English](./CODE_OF_CONDUCT.md)
- [Polski](./CODE_OF_CONDUCT.pl.md)

**TL;DR**: Be respectful, no harassment or discrimination, value others’ time. Report issues via Discord `x_neron_x`.

## 13. Issue Reporting
- Search existing issues before opening a new one.
- Bug report should include: reproduction steps, expected vs actual result, screenshots (if relevant), browser/OS.
- Feature proposal: describe use‑case, impact, alternatives considered.

## 14. Contributor FAQ
**Q: Can I push directly to main?**  
A: No. Only the maintainer merges to `main` (auto deploy).

**Q: Must I translate all new keys immediately?**  
A: Provide EN + placeholders for others (duplicated text acceptable temporarily) but do not omit keys.

**Q: How do I report conduct violations?**  
A: Private Discord message to `x_neron_x`.

**Q: Are there tests?**  
A: Not yet.

---
Thanks for contributing! Keep PRs small, focused and well documented – reviews & merges will be faster.
