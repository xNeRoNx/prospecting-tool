# Inventory Generator

## Overview

The Inventory Generator is an automated optimization tool that finds the best equipment setup and museum layout to maximize luck efficiency (`calculateLuckEfficiency`).

## Features

### Equipment Optimization
- **Ring Slots**: Configure 0-8 ring slots for optimization
- **Jewelry Slots**: Necklace and Charm optimization
- **Tools**: Shovel, Pan, and Enchant selection
- **6★ Support**: Automatically uses 6★ item stats when available
- **Locked Items**: Force specific items to be selected in any slot
- **Include/Exclude Slots**: Choose which equipment slots to optimize
  - Excluded slots preserve current equipment values
  - All slots are included in efficiency calculations
- **Rarity Filter**: Choose which item rarities to consider (Common to Exotic)

### Museum Optimization
- Automatically arranges ores by rarity tiers
- Selects optimal modifiers for each ore
- **Does NOT set weight values** - leaves them empty for manual entry
- Respects one-ore-per-slot constraint

### Optimization Algorithm

The generator uses a smart combination of:
1. **Greedy Selection**: Pre-sorts items by potential contribution score
2. **Top-N Pruning**: Tests only the most promising items (top 20 rings, top 10 necklaces/charms)
3. **Locked Item Respect**: Always includes user-specified items
4. **Museum Integration**: For each equipment combo, finds the best museum layout

#### Scoring System
Items are scored based on weighted stats:
- Luck: ×2.0
- Capacity: ×0.5
- Dig/Shake Speed: ×0.3 each
- Dig/Shake Strength: ×0.2 each
- Modifier Boost: ×0.15
- Size Boost: ×0.1

### Safety Features
- **Automatic Backup**: Creates backup before applying changes
- **Preview Results**: Shows stats before applying
- **Preserve Options**: Keep active potions and events

## Usage

1. Open the generator from the Header button (sparkle icon)
2. Configure equipment slots:
   - Set number of rings to optimize (0-8)
   - Check/uncheck slots to include in optimization
   - **Unchecked slots preserve your current equipment** but are still counted in calculations
3. (Optional) Lock specific items you want to force in any slot
4. (Optional) Filter by item rarity (Common to Exotic)
5. (Optional) Enable museum optimization
6. Configure options:
   - 6★ items usage
   - Preserve potions/events
7. Click "Generate Optimal Setup"
8. Review results (efficiency, stats preview)
9. Click "Apply Changes" to update your equipment
10. **Important**: If museum was optimized, manually set weight values for each ore

## Technical Details

### Files
- `InventoryGenerator.tsx`: Main UI component with all controls
- `optimizer.ts`: Core optimization algorithms
- `types.ts`: TypeScript interfaces for constraints and results

### Performance
- Typical optimization completes in 2-5 seconds
- Tests 100-1000 equipment combinations depending on constraints
- Museum optimization adds ~1-2 seconds

### Limitations
- Uses theoretical maximum stat rolls (not average)
- Does not account for material availability
- Cannot optimize custom stats
- Unchecked equipment slots are preserved from current equipment, not optimized

## Future Improvements
- [ ] Average roll optimization mode
- [ ] Multi-objective optimization (efficiency + cost)
- [ ] Optimize selection of top 5 pans
- [ ] Optimize selection of top 5 shovels
- [ ] Improve scoring system calculation accuracy