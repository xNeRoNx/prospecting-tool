import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import type { CraftingItem } from '@/hooks/useAppData.tsx';
import { craftableItems, type CraftableItem, getItemByReference } from '@/lib/gameData';
import { AddItemDialog } from './AddItemDialog';
import { CraftingListItem } from './CraftingListItem';
import { MaterialsSummary } from './MaterialsSummary';
import { MaterialsInventory } from './MaterialsInventory';
import { CraftableItemsInfo } from './CraftableItemsInfo';
import { useCraftingLogic } from './useCraftingLogic';
import {
  calculateMaterialSummary,
  calculateTotalCost,
  calculateCraftableItems,
  formatStats,
  getMaterialRarity,
  sortCraftableItems,
} from './utils';

/**
 * Main Crafting component
 * Manages the crafting workflow including adding items, tracking materials,
 * and handling the crafting progression
 */
export function Crafting() {
  const { t } = useLanguage();
  const { isLoading, craftingItems, setCraftingItems, ownedMaterials, setOwnedMaterials } = useAppData();
  
  // Local UI state
  const [selectedItem, setSelectedItem] = useState<CraftableItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMinimalMaterials, setShowMinimalMaterials] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  /**
   * Resolves a crafting item reference to its full data
   * @param craftingItem - The crafting item reference
   * @returns Full craftable item data or null if not found
   */
  const resolveItem = (craftingItem: CraftingItem): CraftableItem | null => {
    return getItemByReference({
      name: craftingItem.itemName,
      position: craftingItem.itemPosition
    });
  };

  // Initialize crafting logic hook with all required dependencies
  const craftingLogic = useCraftingLogic(
    craftingItems,
    setCraftingItems,
    ownedMaterials,
    setOwnedMaterials,
    resolveItem
  );

  /**
   * Handles adding a new item to the crafting list
   * Resets the dialog state after adding
   */
  const handleAddItem = (item: CraftableItem, qty: number) => {
    craftingLogic.addToCraftingList(item, qty);
    setSelectedItem(null);
    setQuantity(1);
    setIsAddDialogOpen(false);
  };

  // Calculate derived data for UI display
  const materialSummary = calculateMaterialSummary(
    craftingItems, 
    ownedMaterials, 
    showMinimalMaterials,
    resolveItem
  );
  
  const totalCost = calculateTotalCost(
    craftingItems,
    showMinimalMaterials,
    resolveItem
  );

  const craftableItemsList = calculateCraftableItems(
    craftingItems,
    ownedMaterials,
    resolveItem
  );

  const craftableItemsSorted = sortCraftableItems(craftableItems);

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('crafting')}</h2>
        
        <AddItemDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          selectedItem={selectedItem}
          quantity={quantity}
          isLoading={isLoading}
          craftableItemsSorted={craftableItemsSorted}
          onSelectItem={setSelectedItem}
          onQuantityChange={setQuantity}
          onAdd={handleAddItem}
          formatStats={(item) => formatStats(item, t)}
          t={t}
        />
      </div>

      {/* Main grid layout: crafting list on left, materials summary on right */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Crafting List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('craftingList')}</h3>
          </div>

          {/* Info box showing items ready to craft */}
          <CraftableItemsInfo
            craftableItems={craftableItemsList}
            resolveItem={resolveItem}
            t={t}
          />

          {/* List of items being crafted */}
          <div className="space-y-3">
            {craftingItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  {t('noItems')}
                </CardContent>
              </Card>
            ) : (
              craftingItems.map(craftingItem => {
                const fullItem = resolveItem(craftingItem);
                if (!fullItem) return null;
                
                return (
                  <CraftingListItem
                    key={craftingItem.id}
                    craftingItem={craftingItem}
                    fullItem={fullItem}
                    showMinimalMaterials={showMinimalMaterials}
                    isLoading={isLoading}
                    onToggleCompleted={craftingLogic.toggleCompleted}
                    onCraftOne={craftingLogic.craftOne}
                    onUndoOne={craftingLogic.undoOne}
                    onUpdateQuantity={craftingLogic.updateQuantity}
                    onRemove={craftingLogic.removeCraftingItem}
                    t={t}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Materials Summary Section */}
        <MaterialsSummary
          materialSummary={materialSummary}
          totalCost={totalCost}
          showMinimalMaterials={showMinimalMaterials}
          isLoading={isLoading}
          onToggleMinimal={setShowMinimalMaterials}
          onUpdateMaterial={craftingLogic.updateOwnedMaterial}
          getMaterialRarity={getMaterialRarity}
          t={t}
        />

        {/* Materials Inventory Section */}
        <MaterialsInventory
          ownedMaterials={ownedMaterials}
          isLoading={isLoading}
          onUpdateMaterial={craftingLogic.updateOwnedMaterial}
          onRemoveMaterial={craftingLogic.removeMaterialManually}
          onClearUnused={() => craftingLogic.clearUnusedMaterials(t)}
          onClearZero={() => craftingLogic.clearZeroMaterials(t)}
          onAddMaterial={craftingLogic.addMaterialManually}
          getMaterialRarity={getMaterialRarity}
          materialIsRemovable={craftingLogic.materialIsRemovable}
          t={t}
        />
      </div>
    </div>
  );
}
