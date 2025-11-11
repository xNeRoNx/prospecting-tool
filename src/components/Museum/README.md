# Museum Component

The Museum component has been refactored into smaller, more manageable pieces for better readability and maintainability.

## File Structure

```
Museum/
├── Museum.tsx              # Main component - logic and layout orchestration
├── MuseumSlotCard.tsx     # Single museum slot (card with selects)
├── MuseumOverviewDialog.tsx # Dialog showing overview of all ores
├── MuseumStatsCard.tsx    # Card displaying stat bonuses
├── types.ts               # Types and constants (RARITY_SLOT_COUNTS, RARITY_ORDER)
├── utils.ts               # Helper functions (initialization, grouping, etc.)
├── index.ts               # Main component export
└── README.md              # This documentation
```

## Components

### Museum.tsx
Main component orchestrating the museum functionality:
- Manages museum slot state
- Handles slot update/clear operations
- Renders layout with sections for different rarities
- Coordinates child components

**Key Features:**
- Automatic initialization of empty slots
- Prevents duplicate ore placement
- Real-time bonus calculation
- Responsive grid layout

### MuseumSlotCard.tsx
Represents a single museum display case:
- Ore selection dropdown
- Modifier selection
- Weight input field
- Effect display with calculations

**Props:**
- `slot`: MuseumSlot - slot data
- `index`: number - slot number
- `usedOres`: Set<string> - set of placed ores
- `rarity`: string - slot rarity tier
- `isLoading`: boolean - loading state
- `onUpdateSlot`: update function
- `onClearSlot`: clear function

**Features:**
- Filters ores by rarity
- Shows max weight requirements
- Displays calculated bonuses
- Prevents duplicate ore selection

### MuseumOverviewDialog.tsx
Dialog presenting all ores in the museum:
- Groups by rarity tier
- Shows effects and modifiers
- Displays weight information
- Calculates and shows bonuses

**Props:**
- `museumSlots`: MuseumSlot[] - all slots

**Features:**
- Rarity-based grouping
- Alphabetical sorting within rarities
- Weight-based bonus display
- Special effects handling
- Modifier bonus display

### MuseumStatsCard.tsx
Card with aggregate bonus summary:
- Displays all stat bonuses
- Toggle between max/weight modes
- Sticky positioning for easy reference

**Props:**
- `museumStats`: MuseumBonuses - calculated bonuses
- `showMaxStats`: boolean - display mode
- `onToggleMaxStats`: toggle function

**Features:**
- All stat categories displayed
- Max vs. weight-based toggle
- Formatted bonus display
- Sticky card positioning

## Types and Constants

### types.ts
```typescript
RARITY_SLOT_COUNTS - number of slots per rarity tier
RARITY_ORDER - display order for rarities
Rarity - rarity tier type
```

**Rarity Tiers:**
- Exotic: 1 slot
- Mythic: 2 slots
- Legendary: 3 slots
- Epic: 3 slots
- Rare: 3 slots
- Uncommon: 3 slots
- Common: 3 slots

## Helper Functions

### utils.ts
- `initializeMuseumSlots()` - creates empty slot structure
- `getRarityClass(rarity)` - returns CSS class for rarity
- `groupSlotsByRarity(museumSlots)` - groups slots by rarity tier
- `getUsedOres(museumSlots)` - returns Set of placed ore names

## Usage

```typescript
import { Museum } from '@/components/Museum';

// In your component
<Museum />
```

## Dependencies

- `@/hooks/useAppData` - data management hook
- `@/hooks/useLanguage` - translation hook
- `@/lib/gameData` - game data (ores, modifiers)
- UI components from `@/components/ui/*`

## Utility Functions

All utility functions including bonus calculations are located in `utils.ts`:
- `initializeMuseumSlots()` - creates empty slot structure
- `getRarityClass(rarity)` - returns CSS class for rarity
- `groupSlotsByRarity(museumSlots)` - groups slots by rarity tier
- `getUsedOres(museumSlots)` - returns Set of placed ore names
- `calculateMuseumBonuses(museumSlots)` - calculates all stat bonuses from museum

## Architecture Benefits

- **Separation of Concerns**: Each component has a single, clear responsibility
- **Reusability**: Components can be used independently
- **Maintainability**: Smaller files are easier to understand and modify
- **Testability**: Isolated components are easier to test
- **Type Safety**: Proper TypeScript interfaces throughout
- **Documentation**: Inline JSDoc comments and this README

## Future Enhancements

- Weight-based bonus calculation (currently shows max bonuses only)
- Drag-and-drop ore placement
- Export/import museum configurations
- Visual ore preview images
- Achievement tracking
