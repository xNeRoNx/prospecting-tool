# Data Management Module – Technical Documentation

This document describes the internal behavior of the `DataManagement` component. End‑user oriented wording is provided through translation keys (`infoDataManagementTitle`, `infoDataManagementDesc`).

## Scope
Manages:
- Save slots (local persistence snapshots)
- Selective export to file or URL
- Selective import from file or URL (with preview & filtering)
- Basic metadata (name, description, createdAt, version)

Excluded: Actual schema definitions for crafting items, museum slots, equipment – those are owned by the global app data layer (`useAppData`).

## Key Data Interfaces
```
DataSelection { craftingItems: boolean; museumSlots: boolean; equipment: boolean; ownedMaterials: boolean }
SaveMetadata { name: string; description: string; createdAt: string; version: string }
ImportData { metadata?: SaveMetadata; craftingItems?: any[]; museumSlots?: any[]; equipment?: any; ownedMaterials?: any }
ImportPreview { data: ImportData; source: 'file' | 'url'; fileName?: string }
```

## Core Hooks & Dependencies
- `useAppData()` – supplies domain state + functions: `craftingItems`, `museumSlots`, `equipment`, `ownedMaterials`, `importDataSelective`, `getSaves`, `saveToSlot`, `loadFromSlot`, `deleteSave`.
- Local `useState` for dialog open flags, selections, metadata editing, active tab, preview.
- Side effects:
  1. On mount: loads saves (`getSaves()`).
  2. On dialog close: resets transient import state.
  3. On URL hash containing `#data=`: tries to decode import payload and opens preview (then cleans hash).

## Export Flow
1. User chooses categories (DataSelection) – default all true.
2. On export:
   - Build `selectedData` from current global state.
   - Wrap with fresh metadata (new `createdAt`).
3. Two targets:
   - File: JSON pretty-printed, downloaded via blob anchor.
   - URL: Data compressed/encoded (helper: `encodeDataForUrl`) placed in hash `#data=<payload>` and copied to clipboard.
4. Toast notifications on success/error (implementation via global toast hook – not covered here).

## Import Flow
1. Source triggers: File input (JSON) OR pasted URL/hash (string containing encoded payload).
2. Read & parse:
   - File: `FileReader` -> JSON.parse -> set `importPreview`.
   - URL: extract substring after `#data=` or directly if user pasted only the payload -> decode -> set `importPreview`.
3. Show preview card: metadata + counts per category.
4. User chooses which categories to import (independent selection from export selection state).
5. Confirm import: calls `importDataSelective(dataToImport, importSelection)`; metadata is ignored for merging purposes except maybe future version gating.
6. Close dialog / reset state.

## Save Slots
- UI lists a finite number (at least 6 with a special backup slot index based on code pattern – first 5 standard + backup?).
- `saveToSlot(slot, metadata)` persists a snapshot assembled internally by `useAppData` (not shown here) & refreshed in UI by re-calling `getSaves()`.
- Overwriting: If a slot already has data, dialog indicates overwrite.
- Deletion: Confirmation dialog ensures explicit action.

## Backup Slot Behavior
Snippet suggests index 5 (6th entry) acts as an automatic backup (visual accent styling). It is loaded-only (no overwrite button in snippet). Used before imports to keep a rollback point (logic presumably in `useAppData` or import function; confirm there if modifying behavior).

## Safety & Integrity
- Import never auto-applies: always requires explicit confirmation.
- Unknown / additional keys in imported JSON are ignored (only selected categories mapped).
- Clearing file input value after read allows re-importing same file.

## Encoding / Decoding
Two utility functions referenced (not defined in snippet):
- `encodeDataForUrl(data)` – likely compress + base64 + URI safe transform.
- `decodeDataFromUrl(payload)` – inverse.
If modifying schema, ensure backward compatibility or embed a `version` field (already present in metadata object) and branch decode logic.

## Edge Cases
| Case | Handling |
|------|----------|
| Empty selection export | Export buttons disabled. |
| Empty selection import | Confirm disabled until at least one category checked. |
| Invalid JSON file | Toast error, preview not shown. |
| Corrupt / truncated URL hash | Try/catch -> toast error. |
| Very large payload in URL | Risk of exceeding URL length; consider fallback to file export. |
| Duplicate imports | Overwrites selected categories only; non-selected remain intact. |
| Version mismatch (future) | Placeholder: could prompt user; currently ignored. |

## UX / Accessibility Considerations
- Buttons use icon + label; maintain text for screen readers.
- Tab navigation between Slots / Export / Import; ensure focus management when switching.
- Preview lists counts to help users gauge scale before applying.

## Future Enhancements
1. Delta import (merge rather than overwrite for certain categories).
2. Conflict detection (e.g., timestamp comparison, show diff counts).
3. Encryption passphrase for exported file/URL (privacy layer).
4. Cloud sync (opt-in) with user auth.
5. Automatic periodic snapshot (with rotation) and restore UI.
6. Compression ratio indicator for URL exports.
7. Drag-and-drop JSON onto dialog for import.

## Testing Recommendations
- Unit: Selection mapping, building export object, filtering import by selection.
- Integration: Simulate full export->import roundtrip (in-memory) verifying state parity.
- Negative: Invalid file, invalid hash, empty categories, large numeric values.

---
_Last updated: autogenerated technical documentation for Data Management module._
