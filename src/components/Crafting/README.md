# Crafting Component - Structure

This folder contains the `Crafting` component split into smaller, more manageable modules.

## File Structure

### `Crafting.tsx` (main component)
Main component that orchestrates all subcomponents and logic. Responsible for:
- Managing local state (selectedItem, quantity, showMinimalMaterials)
- Coordinating between subcomponents
- Rendering the layout

### `types.ts`
TypeScript type definitions used in components:
- `CraftableItemWithQuantity` - item with information about maximum craftable quantity
- `MaterialInventoryProps` - props for the materials inventory component
- `MaterialsSummaryProps` - props for the materials summary component
- `CraftingListItemProps` - props for a single crafting list item
- `AddItemDialogProps` - props for the add item dialog

### `utils.ts`
Helper and calculation functions:
- `calculateMaterialSummary()` - calculates summary of required materials
- `calculateTotalCost()` - calculates total crafting cost
- `calculateCraftableItems()` - finds items that can be crafted
- `formatStats()` - formats item statistics
- `getRarityClass()` - returns CSS class for rarity
- `getMaterialRarity()` - gets material rarity
- `getAddableMaterials()` - list of materials that can be added
- `sortCraftableItems()` - sorts items by rarity

### `useCraftingLogic.ts`
Custom hook containing all crafting business logic:
- `addToCraftingList()` - adds item to crafting list
- `removeCraftingItem()` - removes item from list
- `toggleCompleted()` - toggles completion state
- `craftOne()` - crafts one unit (partial progress)
- `undoOne()` - undoes crafting of one unit
- `updateQuantity()` - updates item quantity
- `updateOwnedMaterial()` - updates owned material amount
- `addMaterialManually()` - manually adds material to inventory
- `removeMaterialManually()` - removes material from inventory
- `materialIsRemovable()` - checks if material can be removed
- `clearUnusedMaterials()` - removes unused materials
- `clearZeroMaterials()` - removes materials with quantity 0

### UI Components

#### `AddItemDialog.tsx`
Dialog for adding new items to the crafting list:
- List of all available items to craft
- Filtering and sorting by rarity
- Quantity selection
- Recipe preview

#### `CraftingListItem.tsx`
Single crafting list item:
- Displays item information (name, rarity, position)
- Shows crafting progress (completed/total)
- Management buttons (craft one, undo, change quantity, remove)
- Checkbox for marking as completed
- Displays recipe with required materials

#### `CraftableItemsInfo.tsx`
Info component showing items ready to be crafted:
- Displays list of items that can currently be crafted
- Shows maximum craftable quantity
- Highlighted in green color

#### `MaterialsSummary.tsx`
Summary of required materials:
- List of all required materials with quantities
- Progress bars showing owned/needed
- Toggle button for minimal/total mode
- Direct material quantity editing
- "Max" button to set maximum needed quantity
- Total crafting cost

#### `MaterialsInventory.tsx`
Material inventory management:
- List of all materials in inventory
- Edit quantity for each material
- Manually add new materials
- Remove unused materials
- Clear materials with quantity 0
- Sorting by rarity and alphabetically

### `index.ts`
Export file for easier importing of components and types.

## Data Flow

```
Crafting.tsx (main)
    ├── useAppData (hook) - global state
    ├── useCraftingLogic (hook) - business logic
    │
    ├── AddItemDialog
    │   └── displays sortCraftableItems
    │
    ├── CraftableItemsInfo
    │   └── displays calculateCraftableItems
    │
    ├── CraftingListItem (for each item)
    │   └── uses functions from useCraftingLogic
    │
    ├── MaterialsSummary
    │   └── uses calculateMaterialSummary and calculateTotalCost
    │
    └── MaterialsInventory
        └── uses functions from useCraftingLogic
```

## Benefits of This Structure

1. **Separation of Concerns** - each file has a clearly defined purpose
2. **Ease of Testing** - functions and components can be tested separately
3. **Reusability** - helper functions and UI components can be easily reused elsewhere
4. **Maintainability** - easier to find and fix bugs in smaller files
5. **Readability** - code is better organized and easier to understand
6. **Scalability** - easy to add new functionality without modifying existing files
