# Prospecting Game Tools - PRD

A comprehensive companion app for the Prospecting game providing crafting planning, museum optimization, equipment simulation, and custom collectibles tracking.

**Experience Qualities**:
1. **Organized** - Clear categorization and intuitive navigation between different game aspects
2. **Efficient** - Streamlined workflows for planning crafting and optimizing builds  
3. **Comprehensive** - Complete toolset covering all major game mechanics and calculations

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected features with persistent data storage and import/export functionality

## Essential Features

### Language Selection
- **Functionality**: Toggle between Polish and English UI text
- **Purpose**: Accessibility for international players
- **Trigger**: Language selector in header
- **Progression**: Click toggle → UI updates instantly → Preference saved
- **Success criteria**: All UI text translates while preserving game terms

### Data Management  
- **Functionality**: Import/export all app data via JSON file or URL
- **Purpose**: Backup, sharing builds, and cross-device sync
- **Trigger**: Import/Export buttons in header
- **Progression**: Click export → Generate JSON → Download file / Click import → Select file → Data loaded
- **Success criteria**: Complete data preservation across import/export cycles

### Crafting System
- **Functionality**: Build crafting queue with material requirements and cost calculations
- **Purpose**: Optimize crafting order and resource allocation
- **Trigger**: Add items to crafting list from item database
- **Progression**: Select item → Add to list → View materials → Mark as crafted → Auto-remove from calculations
- **Success criteria**: Accurate material summation with owned/needed tracking

### Museum Optimizer
- **Functionality**: Plan museum display cases with modifier selection and stat calculations
- **Purpose**: Maximize museum stat bonuses
- **Trigger**: Place ores in display cases
- **Progression**: Select rarity → Choose ore → Apply modifier → View total stats
- **Success criteria**: Correct stat calculations following game formulas

### Equipment Simulator
- **Functionality**: Equip items and calculate total stats including museum bonuses
- **Purpose**: Theory-craft builds and compare equipment setups
- **Trigger**: Equip items from crafted list or item database
- **Progression**: Select equipment slot → Choose item → View stats → Apply museum bonuses
- **Success criteria**: Accurate stat calculations matching in-game mechanics

### Custom Collectibles
- **Functionality**: Track owned ore quantities with completion status
- **Purpose**: Inventory management and collection progress
- **Trigger**: Add ores to collection list
- **Progression**: Select ore → Set quantity → Mark completed → Remove if needed
- **Success criteria**: Persistent tracking with easy quantity updates

## Edge Case Handling

- **Empty States**: Helpful prompts to guide users toward adding their first items
- **Invalid Data**: Graceful handling of corrupted import files with error messages
- **Duplicate Items**: Automatic quantity stacking for identical crafting items
- **Missing Dependencies**: Clear indicators when required materials aren't owned

## Design Direction
Clean, game-inspired interface with dark theme reminiscent of mining/cave aesthetics, emphasizing data density and quick access to information over visual flourishes.

## Color Selection
Analogous color scheme using deep blues and purples to evoke underground mining themes while maintaining excellent readability.

- **Primary Color**: Deep Mining Blue `oklch(0.3 0.1 240)` - Represents depth and exploration
- **Secondary Colors**: Slate Gray `oklch(0.4 0.02 240)` for backgrounds, Ore Gold `oklch(0.7 0.15 60)` for highlights
- **Accent Color**: Rare Gem Purple `oklch(0.6 0.2 280)` for important actions and rare item indicators
- **Foreground/Background Pairings**: 
  - Background (Dark Blue #0F1419): Light Gray text (#E5E7EB) - Ratio 12.5:1 ✓
  - Card (Slate #1E293B): White text (#FFFFFF) - Ratio 15.8:1 ✓
  - Primary (Mining Blue #1E40AF): White text (#FFFFFF) - Ratio 8.2:1 ✓
  - Accent (Gem Purple #7C3AED): White text (#FFFFFF) - Ratio 7.1:1 ✓

## Font Selection
Technical yet readable typeface that evokes industrial/mining themes while maintaining excellent legibility for data-heavy interfaces.

- **Typographic Hierarchy**:
  - H1 (Section Headers): Inter Bold/24px/tight letter spacing
  - H2 (Subsections): Inter SemiBold/18px/normal spacing  
  - Body (Item Lists): Inter Regular/14px/relaxed line height
  - Captions (Stats): Inter Medium/12px/tight spacing

## Animations
Subtle functional animations that provide feedback without distraction, emphasizing efficiency over visual spectacle.

- **Purposeful Meaning**: Smooth transitions between sections maintain context, button feedback confirms interactions
- **Hierarchy of Movement**: Primary focus on form interactions and data updates, minimal decorative animation

## Component Selection

- **Components**: Tabs for main navigation, Cards for item displays, Tables for material lists, Dialogs for item details, Select dropdowns for filters, Buttons for actions, Checkboxes for completion tracking
- **Customizations**: Custom item cards with stat displays, specialized museum grid layout, equipment slot visualization
- **States**: Clear hover/active states for all interactive elements, disabled states for unavailable actions
- **Icon Selection**: Plus/Minus for quantity, Check for completed, Import/Export icons, Language toggle
- **Spacing**: Consistent 4px grid system with generous padding in cards (16px), tight spacing in lists (8px)
- **Mobile**: Responsive tabs that stack vertically, cards that expand to full width, touch-friendly button sizes (44px minimum)