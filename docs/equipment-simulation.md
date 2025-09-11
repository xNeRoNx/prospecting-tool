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

## Base Stat Assembly (Updated Order)
`calculateBaseStats()` constructs an accumulator with canonical stat keys:
```
{
  luck, digStrength, digSpeed, shakeStrength, shakeSpeed,
  capacity, sellBoost, sizeBoost, modifierBoost, toughness
}
```
Computation Order (layered):
1. Shovel – foundational tool layer (digStrength, digSpeed, toughness).
2. Pan – adds luck, capacity, shakeStrength, shakeSpeed and parsed passive boosts (Size / Modifier) via regex `(±\d+)%`.
3. Enchant – additive effects applied after both tools so they build on the aggregated tool baseline.
4. Custom Stats – ad‑hoc flat injections before jewellery so subsequent gear impact remains visible separately.
5. Equipment Items (Rings / Necklace / Charm) – each stat range contributes its max value (optimistic modelling) added last to complete base layer.

Result: A base stats object (pre‑museum, pre‑events). Museum multipliers and events are applied in subsequent stages outside this function.

## Museum Application
Toggle `showMaxMuseum` selects source multipliers:
- Max mode: `sharedCalculateMuseumBonuses(museumSlots)` returns decimal fractions (0.25 = +25%).
- Weight mode: placeholder zeros (future weight scaling pending).

Formula per stat:
```
withMuseum = base + (base * museumMultiplier)  // base * (1 + m)
```
Executed AFTER the full base assembly (steps 1–5 above) and BEFORE events.

## Event Multipliers
`calculateEventBonuses(finalStats)` applies post‑museum multiplicative stacking:
```
stat := stat * eventMultiplier
```
Multiple events multiply sequentially (commutative across the same stat). Events therefore represent the final stage of the pipeline.

## Final Stat Display
Panels:
1. Base Stats – Output of updated base pipeline (steps 1–5).
2. With Museum Bonuses – Base adjusted by museum multipliers (Max or Weight placeholder).
3. With Event Bonuses – Final numbers after multiplicative event effects.

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
Planned function:
```
calcWeightScaled(slots) => { stat: scaledDecimal }
scaled = clamp(weight / maxWeight, 0, 1) * maxMultiplier
```
Special multi‑stat effects scale per component. UI will likely show `current (scaled) / max` for transparency. Floating precision should be normalized (e.g. round to 1e-4 for intermediate, 1 decimal for display).

## Potential Refactors
- Extract calculation pipeline into pure utility for unit testing.
- Maintain a `STAT_KEYS` constant reused across functions to avoid drift.
- Add memoization for derived stats to avoid recalculation on unrelated state changes.
- Introduce type guards for custom stats.
- Localise passive parsing; store passive effects structured in dataset.

## Edge Cases
- Empty equipment: returns zeros gracefully (all layers become no‑ops).
- Unknown enchant or pan after data shift: safe lookup failure leaves stats unchanged.
- Custom stat unexpected key: currently ignored on add (UI validation) but defensive code would still merge; keep whitelist in sync.
- Multiple events same stat: multiplicative escalation; monitor for balance issues.
- Museum empty: multipliers all zero → withMuseum panel equals Base panel.

## Testing Scenarios
1. Shovel only → verify only its three stats populated.
2. Add pan → incremental luck/capacity/shake stats + parsed boosts.
3. Add enchant → additive overlay after pan values (diff = enchant.effects).
4. Insert custom stat (e.g. luck +10) → appears before jewellery; then add ring with luck range (max appended).
5. Add jewellery → max roll increments appear; base panel changes accordingly.
6. Toggle museum Max → museum panel > base when multipliers > 0.
7. Activate two events on same stat → base 100, events 1.1 and 1.2 → final 132.
8. Weight mode (placeholder) → museum panel identical to base.
9. Passive parsing pan with both Size & Modifier → both boosts aggregated.
10. Remove an event → final panel recalculates correctly.

## Performance Considerations
Current dataset small; recalculation unproblematic. If scaling: memoize based on shallow equality of relevant slices (equipment, museumSlots, events, toggle). Avoid parsing passives repeatedly by precomputing structured passive effects.

## Security / Safety
All operations local; no external I/O. Inputs constrained by UI selects except custom stats name/value pair.

---
This document should be updated once weight-based museum scaling or non-linear formulas are introduced.
