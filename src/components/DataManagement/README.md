# DataManagement Component Structure

This directory contains a modular implementation of the DataManagement component, which handles data export/import and save slot management for the Prospecting Tool application.

## File Structure

```
DataManagement/
├── types.ts                     # TypeScript interfaces and types
├── DataSelectionForm.tsx        # Reusable form for selecting data types to export/import
├── SaveSlotsTab.tsx            # Tab for managing save slots
├── ExportTab.tsx               # Tab for exporting data
├── ImportTab.tsx               # Tab for importing data (wrapper)
├── ImportPreview.tsx           # Preview component for import data
├── SaveDialog.tsx              # Dialog for saving to a slot
├── DeleteConfirmDialog.tsx     # Confirmation dialog for deleting saves
├── useDataManagement.ts        # Custom hook containing all business logic
├── DataManagement.tsx          # Main component (orchestrator)
├── index.ts                    # Public exports
└── README.md                   # This file
```

## Component Responsibilities

### `types.ts`
- Defines all TypeScript interfaces used across the module
- Exports: `DataSelection`, `SaveMetadata`, `ImportData`, `ImportPreview`

### `DataSelectionForm.tsx`
- Reusable component for selecting which data types to export or import
- Handles checkboxes for: crafting items, museum slots, equipment, owned materials
- Displays item counts for each data type
- Props: selection state, update handlers, loading state, counts

### `SaveSlotsTab.tsx`
- Displays all save slots (5 regular + 1 backup)
- Shows metadata for each save (name, date, description)
- Provides buttons to: Save, Load, Delete
- Props: saves array, handlers, loading state

### `ExportTab.tsx`
- Combines save metadata form with data selection
- Provides two export options: to file (JSON) or to URL (compressed)
- Props: metadata state, selection state, handlers, counts

### `ImportTab.tsx`
- Wrapper that shows either import options or preview
- Import options: file upload or URL paste
- Delegates to `ImportPreview` when data is loaded
- Props: preview state, URL input, selection state, handlers

### `ImportPreview.tsx`
- Shows metadata and contents of data to be imported
- Displays source (file/URL), name, date, description
- Shows available data with counts
- Includes `DataSelectionForm` for selective import
- Props: import preview data, selection state, handlers

### `SaveDialog.tsx`
- Modal dialog for saving to a specific slot
- Shows warning when overwriting existing save
- Collects save name and description
- Props: slot number, existing save, metadata state, handlers

### `DeleteConfirmDialog.tsx`
- Confirmation modal before deleting a save
- Shows save details to confirm deletion
- Props: slot number, save data, delete handler

### `useDataManagement.ts`
- Custom hook that encapsulates all business logic
- Manages state for dialogs, tabs, selections, metadata
- Handles file operations, URL encoding/decoding
- Processes save/load/delete operations
- Returns all state and handlers needed by components

### `DataManagement.tsx`
- Main orchestrator component
- Renders the dialog with tabs
- Delegates rendering to sub-components
- Minimal logic - mostly composition
- Uses `useDataManagement` hook for all state and logic

### `index.ts`
- Public API for the module
- Exports main component and types

## Architecture Benefits

1. **Separation of Concerns**: Each component has a single, clear responsibility
2. **Reusability**: Components like `DataSelectionForm` can be used in multiple contexts
3. **Testability**: Logic separated in hook, UI in presentational components
4. **Maintainability**: Easy to locate and modify specific functionality
5. **Readability**: Smaller files are easier to understand and navigate
6. **Type Safety**: Centralized types ensure consistency

## Usage

```tsx
import { DataManagement } from '@/components/DataManagement';

function App() {
  return <DataManagement />;
}
```

The component can also be imported from the old location for backward compatibility:

```tsx
import { DataManagement } from '@/components/DataManagement.tsx';
```

## State Flow

1. User opens DataManagement dialog
2. `useDataManagement` hook initializes state
3. User interacts with tabs (Slots, Export, Import)
4. Each tab renders appropriate sub-component
5. Sub-components call handlers from hook
6. Hook processes business logic and updates state
7. Components re-render with new state

## Data Flow

### Export Flow
1. User selects data types in `ExportTab`
2. User enters metadata (name, description)
3. User clicks "Export to File" or "Export to URL"
4. Hook gathers selected data and packages with metadata
5. For file: creates JSON blob and triggers download
6. For URL: compresses data and copies to clipboard

### Import Flow
1. User selects file or pastes URL in `ImportTab`
2. Hook decodes data and creates `ImportPreview`
3. `ImportPreview` displays metadata and available data
4. User selects which data types to import
5. User confirms import
6. Hook applies selected data to application state

### Save Slot Flow
1. User clicks "Save" on a slot in `SaveSlotsTab`
2. `SaveDialog` opens for metadata entry
3. User enters name and description
4. Hook saves data with metadata to slot
5. Save list refreshes to show new save

## Future Improvements

- Add unit tests for `useDataManagement` hook
- Add integration tests for component interactions
- Consider adding data validation before import
- Add progress indicators for large imports/exports
- Add preview for export (show what will be exported)
- Consider versioning strategy for save format changes
