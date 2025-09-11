# Equipment Simulation (Technical Documentation)

This document details the logic of `EquipmentSimulation.tsx` focusing on data flow, calculation order, extension points, and edge cases.

## Objectives
Provide a deterministic, inspectable calculation pipeline for final player stats combining:
- Base equipment items (rings, necklace, charm)
- Tool choices (shovel, pan, enchant)
- Parsed passive bonuses
- Custom (ad‑hoc) stat injections
- Museum multipliers (currently max-only)
- Event multipliers (stacking)

## Data Sources
- `equipment` state from `useAppData()` includes: `rings[]`, `necklace`, `charm`, `shovel`, `pan`, `enchant`, `customStats{}`, `activeEvents[]`.
- `museumSlots` for integrating museum multipliers via shared `sharedCalculateMuseumBonuses` (aliased here as `sharedCalculateMuseumBonuses`).
- Static datasets: `craftableItems`, `pans`, `shovels`, `enchants`, `events` (events file assumed external— code references `events.find`).

## Base Stat Assembly
`calculateBaseStats()` builds an accumulator object with known stat keys:
```
{
  luck, digStrength, digSpeed, shakeStrength, shakeSpeed,
  capacity, sellBoost, sizeBoost, modifierBoost, toughness
}
```
Process:
1. Iterate equipped rings + necklace + charm. For each stat range `[min,max]` pick `max` (optimistic best roll modelling). Add to accumulator.
2. Shovel: add its flat stats (digStrength, digSpeed, toughness).
3. Pan: add its base stats; parse passive string for patterns `(±\d+)%` following 'Size boost' / 'Modifier boost'; convert to int and aggregate into corresponding boost stats.
4. Enchant: add each effect's value to accumulator.
5. Custom stats: merge; if key unrecognised it is still added (defensive fallback). Consider filtering in future.

## Museum Application
`showMaxMuseum` toggles between:
- Max mode: `museumBonusesMax = sharedCalculateMuseumBonuses(museumSlots)` (assumed returns decimal multipliers per stat, e.g. `{ luck: 0.25 }`).
- Weight mode: placeholder zeros. Future integration will supply weight-scaled multipliers.

Computation:
```
finalWithoutEvents[stat] = base[stat] + (base[stat] * museumMultiplier)
```
Equivalent to `base * (1 + multiplier)`. Stored separately then passed into event stage.

## Event Multipliers
`calculateEventBonuses(finalStats)` clones `finalStats` and for each active event multiplies targeted stats:
```
stat = stat * eventMultiplier
```
Chaining multiplicatively across events ensures commutativity but not additivity; order does not matter.

## Final Stat Display
Three panels conceptually:
1. Base Stats (pre museum, pre events)
2. Museum-adjusted Stats (`finalStats` in code) — (naming might be refined)
3. Event-adjusted Stats (`eventStats`)

Percent vs Flat Formatting:
- Keys containing `Speed` or `Boost` suffixed with `%` for readability.
- Others shown as raw numbers; future might localise.

## Custom Stats Management
- Added through form: validates stat name existence in predefined whitelist (in code for add). However remove path allows any key.
- Aggregate addition: repeats add to same key sums values.
- Removal clones object and deletes key.

## Pan Passive Parsing
Current regex: `/\(([+-]\d+)%\)/` extracts first percentage found. If multiple modifiers appear, logic may need expansion (multi-match). Passive text must include recognizable tokens 'Size boost' or 'Modifier boost'. Suggest converting to structured metadata in source data long-term.

## Weight Mode (Future)
Add branch where `museumBonusesDisplayed` is produced by a function:
```
calcWeightScaled(slots) => { stat: scaledDecimal }
scaled = clamp(weight / maxWeight, 0, 1) * maxMultiplier
```
Special effects arrays: apply scaling per stat. Ensure floating precision < 1e-6 rounding for UI.

## Potential Refactors
- Extract calculation pipeline into pure utility for unit testing.
- Maintain a `STAT_KEYS` constant reused across functions to avoid drift.
- Add memoization for derived stats to avoid recalculation on unrelated state changes.
- Introduce type guards for custom stats.
- Localise passive parsing; store passive effects structured in dataset.

## Edge Cases
- Empty equipment: returns zeros gracefully.
- Unknown enchant or pan after data shift: lookups fail silently (no crash).
- Custom stat with unexpected key: currently accepted (document or clamp). Could filter to known list.
- Multiple events touching same stat: multiplicative stacking can escalate; ensure design intent.

## Testing Scenarios
1. Single ring with stat ranges -> verify max side used.
2. Add enchant -> expected additive change.
3. Toggle museum mode -> stats identical in base, changed only in panel 2 (future: difference when Weight implemented).
4. Activate two events on same stat -> confirm multiplication (e.g., base 100 *1.1 *1.2 = 132).
5. Passive parsing: create pan with both Size & Modifier boosts -> ensure both captured.
6. Custom stat add/remove idempotency.

## Performance Considerations
Current dataset small; recalculation unproblematic. If scaling: memoize based on shallow equality of relevant slices (equipment, museumSlots, events, toggle). Avoid parsing passives repeatedly by precomputing structured passive effects.

## Security / Safety
All operations local; no external I/O. Inputs constrained by UI selects except custom stats name/value pair.

---
This document should be updated once weight-based museum scaling or non-linear formulas are introduced.
