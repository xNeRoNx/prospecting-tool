# Museum System (Technical Documentation)

This document describes the internal logic of the Museum feature as implemented in `Museum.tsx` plus related utility logic.

## Goals
Provide a structured UI for placing unique ores into rarity‑scoped slots, optionally attaching a modifier and recording a weight. Aggregate resulting stat multipliers for equipment/stat simulations (current version uses max theoretical values only).

## Data Model
`MuseumSlot` (inferred from usage):
```
{
  id: string;            // composed as `${rarity.toLowerCase()}-${index}`
  ore?: string;          // name of the ore placed
  modifier?: string;     // name of the modifier
  weight?: number;       // actual mined weight for future scaling
}
```
Slots are created once (lazy initialization) using a fixed mapping of rarity -> count:
```
Exotic:1, Mythic:2, Legendary:3, Epic:3, Rare:3, Uncommon:3, Common:3
```
The order matters (rarest first) for UI planning priority.

## Initialization Flow
1. Component mounts.
2. If `museumSlots` empty and not loading, build array via `initializeMuseumSlots()`.
3. Persist to global state via `setMuseumSlots` (from `useAppData`).

## State & Hooks
- `museumSlots` and `setMuseumSlots` come from shared app state hook allowing persistence across sessions (saved along with other user data).
- `showMaxStats` local `useState(true)` toggles between theoretical max mode and (future) weight‑scaled mode.
- `usedOres` memo ensures same ore cannot appear twice.

## Slot Management
`updateSlot(id, updates)`:
- Prevents duplicates: if updates contain an `ore` already in another slot, abort.
- Otherwise shallow merges updates for the matching slot.

`clearSlot(id)` resets ore, modifier and weight to `undefined`.

`groupSlotsByRarity()` reconstructs grouped structure each render to drive layout; it ensures stable ordering and fills any missing definitions (defensive).

## Overview Dialog
Derived with `getMuseumOverview()`:
1. Filters slots containing an ore.
2. Maps to enriched objects including: base ore data, modifier data, museum effect, special effects, max weight, current weight, and computed modifier bonus (via `getModifierBonus(ore.rarity)`).
3. Groups by rarity respecting a fixed rarity order list.
4. Sorts ores within each rarity alphabetically.

This dataset feeds the modal list. Missing pieces (like truncated code for special effects rendering) show a pattern: conditional blocks for multi‑stat handling vs single stat effect.

## Bonus Calculation
`calculateMuseumStats()` delegates to `calculateMuseumBonuses(museumSlots)` (external utility not shown here) expected contract:
```
(input slots[]) => { statName: totalMultiplierNumber }
```
Current behaviour: Uses each ore's max effect or special effect set WITHOUT scaling by weight (weight mode placeholder). Future extension: pass weight & maxWeight and compute partial multiplier (e.g. linear scaling or custom function) when `showMaxStats === false`.

## Weight Handling Strategy (Planned)
- UI already captures `weight` per slot.
- '@ {maxWeight}kg' hint marks the cap threshold.
- Planned algorithm example (linear): `effective = Math.min(enteredWeight / maxWeight, 1) * maxMultiplier` for single stat; for special multi‑stats apply separately.
- Nonlinear possibilities (e.g. diminishing returns) could be slotted behind a strategy function.

## Modifiers
`modifierBonus` determined by rarity using helper `getModifierBonus(rarity)`. The UI shows `+{modifierBonus}x` under the modifier label inside overview lines. This is additive to ore's effect multiplier (implementation detail: either added or separate stat—needs alignment with equipment calculator expectations).

## Rarity Styling
`getRarityClass(rarity)` -> `rarity-${rarity.toLowerCase()}` enabling Tailwind/utility classes mapped through global stylesheet for consistent color coding.

## Toggle (Max vs Weight)
`showMaxStats` currently only switches label and value sourcing. Weight mode simply shows 0 placeholders with an informational note. Future revision:
1. Branch inside map: if weight mode, derive scaled value using weight & maxWeight.
2. Keep pure max numbers for comparison or debugging.
3. Possibly show both (current / max) for each stat.

## Edge Cases
- Duplicate ore placement prevented.
- Missing ore definition or modifier gracefully skipped (returns null entry filtered out).
- Partially filled slot (ore set, no modifier, no weight) still valid.
- Clearing a slot preserves ordering and ID; avoids index shifting bugs.

## Potential Improvements
- Persist `showMaxStats` preference in global state/localStorage.
- Add inline validation for weight exceeding maxWeight (currently allowed logic may overflag 'isMax').
- Display (current / max) weight progress bar.
- Debounce weight input updates to reduce state churn.
- Unit tests for `calculateMuseumBonuses` ensuring correct aggregation with & without modifiers.
- Introduce abstraction for rarity slot config (single source exportable constant).

## Testing Ideas
1. Place unique ores in all slots -> verify overview groups & stat sums.
2. Try duplicate ore -> ensure it is blocked.
3. Add and remove modifiers -> confirm bonus presence toggles in overview and totals (after logic ties in).
4. Switch toggle -> confirm placeholder zeros & explanatory note.
5. Enter edge weights: 0, maxWeight, > maxWeight (decide clamping rule in future).

## Save/Import Interaction
Since museumSlots are part of user data categories, exporting & importing preserves ore placements. Automatic backup slot protects against destructive changes when experimenting with different museum configurations.

## Security/Integrity
No remote calls. All data local. Input constrained to known ore & modifier lists.

---
This file will evolve once weight-based scaling is implemented.
