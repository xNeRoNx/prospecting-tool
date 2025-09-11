# Prospecting! Companion Tools — PRD

A comprehensive companion app for the Prospecting! game providing crafting planning, museum optimization and equipment simulation.

**Experience Qualities**
1. Organized — clear categorization and intuitive navigation across game aspects
2. Efficient — streamlined workflows for planning crafting and optimizing builds
3. Comprehensive — complete toolset covering major mechanics and calculations

**Complexity Level: Light Application (multiple features with basic state)**
- Multi-feature SPA with persistent data storage and import/export functionality

## Essential Features

### Language Selection
- Functionality: Toggle between Polish and English UI text
- Purpose: Accessibility for international players
- Trigger: Language selector in the header
- Progression: Click toggle → UI updates instantly → Preference saved
- Success criteria: All UI text translates while preserving in‑game terms

### Data Management
- Functionality: Import/export all app data via JSON file or shareable URL
- Purpose: Backup, sharing builds, and cross‑device sync
- Trigger: Import/Export buttons in the header
- Progression: Export → Generate JSON → Download / Import → Select file or paste URL → Data loaded
- Success criteria: Complete data preservation across cycles; graceful merge strategy without data loss

### Crafting System
- Functionality: Build a crafting queue with material requirements and cost calculations
- Purpose: Optimize crafting order and resource allocation
- Trigger: Add items to crafting from the item database
- Progression: Select item → Add to list → View required materials → Mark as crafted → Auto‑remove from calculations
- Success criteria: Accurate owned/needed material totals, duplicate items auto‑stack, costs computed per game rules

### Museum Optimizer
- Functionality: Plan display cases with modifiers and stat calculations
- Purpose: Maximize museum stat bonuses
- Trigger: Place ores in display cases
- Progression: Select rarity → Choose ore → Apply modifier → View total stats
- Success criteria: Correct stat outputs per official formulas; clear validation for invalid setups

### Equipment Simulator
- Functionality: Equip items and calculate total stats, including museum bonuses
- Purpose: Theory‑craft builds and compare setups
- Trigger: Equip items from crafted list or database
- Progression: Select slot → Choose item → View stats → Apply museum bonuses
- Success criteria: Totals match in‑game mechanics; easy comparison between saved builds

## Edge Case Handling
- Empty States: Helpful prompts guiding users to add their first items
- Invalid Data: Graceful handling of corrupted imports with actionable errors
- Duplicate Items: Automatic quantity stacking for identical crafting entries
- Missing Dependencies: Clear indicators when required materials aren’t owned

## Design Direction
Clean, game‑inspired interface with a dark theme reminiscent of mining/cave aesthetics, emphasizing data density and quick access to information over visual flourishes.

## Color Selection
Analogous color scheme using deep blues and purples to evoke underground mining themes while maintaining readability.

- Primary Color: Deep Mining Blue `oklch(0.3 0.1 240)` — depth and exploration
- Secondary Colors: Slate Gray `oklch(0.4 0.02 240)` (backgrounds), Ore Gold `oklch(0.7 0.15 60)` (highlights)
- Accent Color: Rare Gem Purple `oklch(0.6 0.2 280)` for key actions and rare indicators
- Foreground/Background Pairings:
  - Background (Dark Blue #0F1419): Light Gray text (#E5E7EB) — 12.5:1 ✓
  - Card (Slate #1E293B): White text (#FFFFFF) — 15.8:1 ✓
  - Primary (Mining Blue #1E40AF): White text (#FFFFFF) — 8.2:1 ✓
  - Accent (Gem Purple #7C3AED): White text (#FFFFFF) — 7.1:1 ✓

## Font Selection
Technical yet readable typeface evoking industrial/mining themes with excellent legibility for data‑heavy UIs.

- Typographic Hierarchy:
  - H1 (Sections): Inter Bold / 24px / tight letter spacing
  - H2 (Subsections): Inter SemiBold / 18px / normal spacing
  - Body (Lists): Inter Regular / 14px / relaxed line height
  - Captions (Stats): Inter Medium / 12px / tight spacing

## Animations
Subtle, functional animations that provide feedback without distraction, emphasizing efficiency.

- Purposeful Meaning: Smooth transitions maintain context; button feedback confirms actions
- Hierarchy of Movement: Focus on form interactions and data updates; minimal decoration

## Component Selection
- Components: Tabs (main navigation), Cards (item displays), Tables (materials), Dialogs (details), Selects (filters), Buttons (actions), Checkboxes (completion)
- Customizations: Item cards with stat summaries, museum grid layout, equipment slot visualization
- States: Clear hover/active/disabled states for all interactive elements
- Icons: Plus/Minus (quantity), Check (completed), Import/Export, Language toggle
- Spacing: Consistent 4px grid; generous padding in cards (16px), tight in lists (8px)
- Mobile: Responsive tabs stacking vertically, cards expanding to full width, touch‑friendly controls