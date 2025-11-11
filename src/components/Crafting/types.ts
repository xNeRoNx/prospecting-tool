/**
 * Type definitions for Crafting components
 * These interfaces define the props and data structures used throughout the crafting system
 */

import type { CraftableItem } from '@/lib/gameData';
import type { CraftingItem } from '@/hooks/useAppData';

/** Crafting item with calculated maximum craftable quantity */
export interface CraftableItemWithQuantity {
  item: CraftingItem;
  maxQuantity: number;
}

/** Props for MaterialsInventory component */
export interface MaterialInventoryProps {
  ownedMaterials: Record<string, number>;
  isLoading: boolean;
  onUpdateMaterial: (material: string, amount: number) => void;
  onRemoveMaterial: (name: string) => void;
  onClearUnused: () => void;
  onClearZero: () => void;
  getMaterialRarity: (materialName: string) => string;
  materialIsRemovable: (name: string) => boolean;
}

/** Props for MaterialsSummary component */
export interface MaterialsSummaryProps {
  materialSummary: Record<string, { needed: number; owned: number; weight: number }>;
  totalCost: number;
  showMinimalMaterials: boolean;
  isLoading: boolean;
  onToggleMinimal: (checked: boolean) => void;
  onUpdateMaterial: (material: string, amount: number) => void;
  getMaterialRarity: (materialName: string) => string;
}

/** Props for CraftingListItem component */
export interface CraftingListItemProps {
  craftingItem: CraftingItem;
  fullItem: CraftableItem;
  onRemove: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onCraftOne: (id: string) => void;
  onUndoOne: (id: string) => void;
  getMaterialRarity: (materialName: string) => string;
  isLoading: boolean;
}

/** Props for AddItemDialog component */
export interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: CraftableItem | null;
  quantity: number;
  isLoading: boolean;
  onSelectItem: (item: CraftableItem | null) => void;
  onQuantityChange: (quantity: number) => void;
  onAdd: (item: CraftableItem, quantity: number) => void;
  formatStats: (item: CraftableItem) => string[];
  getMaterialRarity: (materialName: string) => string;
}
