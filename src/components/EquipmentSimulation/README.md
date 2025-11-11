# EquipmentSimulation Module

This module contains the refactored Equipment Simulation feature split into smaller, maintainable components.

## Structure

### Core Files
- **`types.ts`** - Type definitions and interfaces (StatMap, EquipmentStats, EventMultipliers)
- **`utils.ts`** - Utility functions for calculations and formatting
  - `calculateBaseStats()` - Calculates base equipment stats
  - `calculateLuckEfficiency()` - Calculates luck efficiency metric
  - `separateEventMultipliers()` - Separates PRE and POST event multipliers
  - `applyEventMultipliers()` - Applies event multipliers to stats
  - `formatStatValue()` - Formats stat values for display
  - `getRarityClass()` - Returns CSS class for rarity
  - `sortByRarity()` - Sorts items by rarity

### Component Files
- **`ShovelCard.tsx`** - Shovel selection and stats display
- **`PanCard.tsx`** - Pan and enchant selection with stats
- **`RingsCard.tsx`** - Ring slots management (8 slots with 5★/6★ toggle)
- **`JewelryCard.tsx`** - Generic jewelry component for Necklace and Charm
- **`PotionsCard.tsx`** - Active potions selection
- **`EventsCard.tsx`** - Active events selection
- **`CustomStatsCard.tsx`** - Custom stat boosts management
- **`StatsDisplay.tsx`** - Stats display with museum and event bonuses
- **`index.ts`** - Module exports

## Key Features

- **Modular Design**: Each component handles a specific piece of equipment
- **Type Safety**: Strong TypeScript types throughout
- **Reusability**: JewelryCard is reused for both Necklace and Charm
- **Separation of Concerns**: Business logic in utils, UI in components
- **Maintainability**: Small focused files easy to understand and modify

## Event System

The module handles two types of event multipliers:
- **PRE-museum events**: Luck Totem, Strength Totem (affect base stats only)
- **POST-museum events**: Meteor Shower, Admin Shower, Perfect Dig, etc. (affect final stats)
