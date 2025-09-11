# Crafting Module Technical Documentation

This document describes the internal design of the Crafting feature. It is intended for contributors, **not** end‑users. End‑user copy lives in translation keys (see `infoCraftingDesc`).

## Overview
The Crafting module lets a player queue items to produce, track required vs owned materials, and know what can already be crafted based on current inventory. It supports two calculation modes: full cumulative totals and a *minimal* “one per item type” baseline.

## Core Data Structures
- **CraftableItem** (static game data): `{ name, rarity, cost, position, recipe[], stats? }`
- **CraftingItem** (runtime state): `{ id, item: CraftableItem, quantity, completed }`
- **ownedMaterials**: `Record<string, number>` – player‑entered current material counts.
- **MaterialSummaryEntry**: `{ needed: number, owned: number, weight?: number }`
- **MaterialSummary**: `Record<materialName, MaterialSummaryEntry>`

## State Sources / Hooks
- `useAppData()` supplies: `craftingItems`, `setCraftingItems`, `ownedMaterials`, `setOwnedMaterials`, `isLoading`.
- `useLanguage()` supplies translation resolver `t(key)`.

## Key Operations
### Adding an Item
`addToCraftingList(item, qty)`
1. Creates a unique `id` (`Date.now().toString()` – could be replaced by `crypto.randomUUID()` for robustness).
2. Pushes new `CraftingItem` into `craftingItems` array.
3. Resets selection & quantity UI state.

### Removing an Item
`removeCraftingItem(id)`
1. Filters the item out of `craftingItems`.
2. Re-evaluates which materials are still referenced by *remaining, not completed* items.
3. Deletes from `ownedMaterials` any material that is now unused (prevents stale entries in the UI).

### Toggling Completion
`toggleCompleted(id)` just flips `completed`. Completed entries are visually dimmed and ignored in calculations (cost, materials, craftability) but retained historically.

### Updating Quantity
`updateQuantity(id, newQty)` updates quantity or removes the item when `newQty <= 0` (guard clause). Changing quantity dynamically affects cost & material aggregates.

## Calculation Logic
### Cost (`calculateTotalCost`)
Two modes:
- **Full mode**: Sum of `item.cost * quantity` for all non‑completed items.
- **Minimal mode**: One cost per distinct `item.name` (baseline investment). Current implementation recomputes the set inside the loop; a micro‑optimization could prebuild the set once.

### Material Requirements (`calculateMaterialSummary`)
Iterates all non‑completed crafting items and their recipes.
- **Full mode**: Accumulates `amount * quantity` into `summary[material].needed`.
- **Minimal mode**: Tracks the maximum *per single item* requirement for each material across different item types, then assigns that max as the needed value.
Includes `owned` (from `ownedMaterials`) and keeps recipe `weight` if provided.

### Craftable Items (`calculateCraftableItems`)
For every non‑completed entry:
1. For each recipe line compute `Math.floor(owned / neededPerItem)`.
2. `maxCraftable` = minimum of those per-material quotients.
3. If `maxCraftable > 0`, push `{ item: craftingItem, maxQuantity: maxCraftable }` into result.
Displayed in the "Can Craft" panel.

## Rarity Sorting
Dialog shows items sorted by a predefined rarity order array to give consistent UX (Common → Exotic). Adjust by editing that order array.

## Formatting Stats
`formatStats` converts ranged stats arrays into readable strings, appending `%` for keys containing `Speed` or `Boost`.

## Edge Cases / Considerations
| Scenario | Current Behavior | Improvement Ideas |
|----------|------------------|-------------------|
| Duplicate entries of same item | Treated independently | Detect & merge on add (configurable) |
| Removing last referencing item for a material | Material removed from `ownedMaterials` | Add a user confirmation or soft delete flag |
| Large quantities (performance) | Linear iteration; acceptable for small lists | Debounce calculations, memoization |
| ID collisions (fast add) | Very low risk with `Date.now()` | Switch to UUID |
| Minimal mode semantics | Maximum single-item requirement per material | Option: show BOTH full + minimal side by side |

## Possible Enhancements
1. Partial crafting action that decrements `ownedMaterials` automatically.
2. Progress bars per material (Owned / Needed ratio).
3. Grouping / categorization (by rarity, by equipment slot).
4. Export/import of crafting plans separately from other save data.
5. Inline search & filters in add dialog.
6. Automatic suggestion of next best item based on material surplus.

## Testing Notes
- Unit tests should mock a small set of `craftingItems` + `ownedMaterials` and assert outputs of: `calculateTotalCost`, `calculateMaterialSummary`, `calculateCraftableItems` for both modes.
- Edge tests: empty list, all completed, zero owned, partial owned, duplicated items, minimal mode with overlapping materials.

## Internationalization
End-user wording is not embedded in logic; always call `t(key)`. The extended description lives in `infoCraftingDesc` and can be split later into multiple keys if needed.

## Accessibility / UX
- Consider `aria-live` region for "Can Craft" updates.
- Ensure buttons for quantity have accessible labels (e.g., aria-label="Increase quantity").
- Provide tooltip or inline help for Minimal Mode toggle.

## Performance
Current recalculations happen on each render; acceptable due to small input sizes. If scaling up, memoize calculations on dependencies (`craftingItems`, `ownedMaterials`, `showMinimalMaterials`).

---
_Last updated: autogenerated technical documentation for Crafting module._
