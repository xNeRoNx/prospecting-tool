import { useState } from 'react';
import type { CraftableItem } from '@/lib/gameData';
import type { CraftingItem } from '@/hooks/useAppData';

/**
 * Custom hook that manages all crafting business logic
 * Handles adding/removing items, crafting progression, material consumption, and inventory management
 * 
 * @param craftingItems - Current list of items being crafted
 * @param setCraftingItems - Function to update the crafting items list
 * @param ownedMaterials - Materials currently in player's inventory
 * @param setOwnedMaterials - Function to update owned materials
 * @param resolveItem - Function to resolve a CraftingItem reference to full CraftableItem data
 * @returns Object containing all crafting management functions
 */
export function useCraftingLogic(
  craftingItems: CraftingItem[],
  setCraftingItems: (items: CraftingItem[] | ((current: CraftingItem[]) => CraftingItem[])) => void,
  ownedMaterials: Record<string, number>,
  setOwnedMaterials: (materials: Record<string, number> | ((current: Record<string, number>) => Record<string, number>)) => void,
  resolveItem: (craftingItem: CraftingItem) => CraftableItem | null
) {
  // Track materials consumed for each crafting item (for undo functionality)
  const [consumedMaterials, setConsumedMaterials] = useState<Record<string, Record<string, number>>>({});

  /**
   * Adds a new item to the crafting list
   * @param item - The craftable item to add
   * @param qty - Quantity to craft
   */
  const addToCraftingList = (item: CraftableItem, qty: number) => {
    const id = Date.now().toString();
    const newCraftingItem: CraftingItem = {
      itemName: item.name,
      itemPosition: item.position,
      quantity: qty,
      completed: false,
      id,
      craftedCount: 0
    };
    
    setCraftingItems(current => [...(current ?? []), newCraftingItem]);
  };

  /**
   * Removes an item from the crafting list
   * Also cleans up consumed materials tracking and removes zero-quantity materials from inventory
   * @param id - ID of the crafting item to remove
   */
  const removeCraftingItem = (id: string) => {
    const itemToRemove = craftingItems.find(item => item.id === id);
    if (!itemToRemove) return;
    const fullItem = resolveItem(itemToRemove);
    if (!fullItem) return;
    
    setCraftingItems(current => (current ?? []).filter(item => item.id !== id));

    // Clear consumed materials record for this item
    setConsumedMaterials(prev => {
      if (!(id in prev)) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    // Remove materials with zero quantity from inventory
    setOwnedMaterials(current => {
      const updated: Record<string, number> = { ...current } as any;
      const recipeMaterials = new Set(fullItem.recipe.map(r => r.material));
      recipeMaterials.forEach(m => {
        if (updated[m] === 0) {
          delete updated[m];
        }
      });
      return updated;
    });
  };

  /**
   * Toggles the completed state of a crafting item
   * When marking as completed: consumes remaining materials
   * When unmarking: refunds all consumed materials
   * @param id - ID of the crafting item to toggle
   */
  const toggleCompleted = (id: string) => {
    setCraftingItems(current => {
      const list = current ?? [];
      const before = list.find(ci => ci.id === id);
      const updated = list.map(ci => ci.id === id ? { ...ci, completed: !ci.completed } : ci);
      const after = updated.find(ci => ci.id === id);
      if (!before || !after) return updated;

      const fullItem = resolveItem(after);
      if (!fullItem) return updated;

      // Marking as completed - consume remaining materials
      if (!before.completed && after.completed) {
        const remainingToCraft = after.quantity - (before.craftedCount || 0);
        if (remainingToCraft > 0) {
          const additionalConsumed: Record<string, number> = {};
          // Deduct materials from inventory
          setOwnedMaterials(mat => {
            const copy: Record<string, number> = { ...mat } as any;
            fullItem.recipe.forEach(r => {
              const need = r.amount * remainingToCraft;
              additionalConsumed[r.material] = need;
              if (copy[r.material] !== undefined) {
                copy[r.material] = Math.max(0, (copy[r.material] || 0) - need);
              }
            });
            return copy;
          });
          // Track consumed materials for undo functionality
          setConsumedMaterials(prev => {
            const prevForItem = prev[id] || {};
            const merged: Record<string, number> = { ...prevForItem };
            Object.entries(additionalConsumed).forEach(([m, amt]) => {
              merged[m] = (merged[m] || 0) + amt;
            });
            return { ...prev, [id]: merged };
          });
          // Set crafted count to full quantity
          setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? { ...ci, craftedCount: ci.quantity } : ci));
        }
      } 
      // Unmarking as completed - refund all consumed materials
      else if (before.completed && !after.completed) {
        const consumed = consumedMaterials[id];
        if (consumed) {
          // Return materials to inventory
          setOwnedMaterials(mat => {
            const copy: Record<string, number> = { ...mat } as any;
            Object.entries(consumed).forEach(([m, amt]) => {
              copy[m] = (copy[m] || 0) + amt;
            });
            return copy;
          });
          // Clear consumed materials record
          setConsumedMaterials(prev => {
            const c = { ...prev };
            delete c[id];
            return c;
          });
          // Reset crafted count to 0
          setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? { ...ci, craftedCount: 0 } : ci));
        }
      }
      return updated;
    });
  };

  /**
   * Crafts exactly one unit of an item (partial progression)
   * Consumes materials for one unit and increments crafted count
   * Automatically marks as completed when all units are crafted
   * @param id - ID of the crafting item
   */
  const craftOne = (id: string) => {
    const craftingItem = craftingItems.find(ci => ci.id === id);
    if (!craftingItem) return;
    const fullItem = resolveItem(craftingItem);
    if (!fullItem) return;
    
    // Don't craft if already completed
    if (craftingItem.completed) return;
    const crafted = craftingItem.craftedCount || 0;
    if (crafted >= craftingItem.quantity) return;
    
    // Check if we have enough materials for one unit
    for (const r of fullItem.recipe) {
      if ((ownedMaterials[r.material] || 0) < r.amount) return;
    }
    
    // Consume materials for one unit
    setOwnedMaterials(mat => {
      const copy: Record<string, number> = { ...mat } as any;
      fullItem.recipe.forEach(r => {
        copy[r.material] = Math.max(0, (copy[r.material] || 0) - r.amount);
      });
      return copy;
    });
    
    // Track consumed materials
    setConsumedMaterials(prev => {
      const prevForItem = prev[id] || {};
      const updated: Record<string, number> = { ...prevForItem };
      fullItem.recipe.forEach(r => {
        updated[r.material] = (updated[r.material] || 0) + r.amount;
      });
      return { ...prev, [id]: updated };
    });
    
    // Increment crafted count
    setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? { ...ci, craftedCount: (ci.craftedCount || 0) + 1 } : ci));
    // Mark as completed if we've reached the target quantity
    setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? ( (ci.craftedCount || 0) >= ci.quantity ? { ...ci, completed: true } : ci) : ci));
  };

  /**
   * Undoes crafting of exactly one unit (reverses craftOne)
   * Returns materials to inventory and decrements crafted count
   * Removes completed status if count drops below quantity
   * @param id - ID of the crafting item
   */
  const undoOne = (id: string) => {
    const craftingItem = craftingItems.find(ci => ci.id === id);
    if (!craftingItem) return;
    const fullItem = resolveItem(craftingItem);
    if (!fullItem) return;
    
    const crafted = craftingItem.craftedCount || 0;
    if (crafted <= 0) return;
    
    // Build recipe map for refund
    const recipeMap: Record<string, number> = {};
    fullItem.recipe.forEach(r => { recipeMap[r.material] = r.amount; });
    
    // Return materials to inventory
    setOwnedMaterials(mat => {
      const copy: Record<string, number> = { ...mat } as any;
      Object.entries(recipeMap).forEach(([m, amt]) => {
        copy[m] = (copy[m] || 0) + amt;
      });
      return copy;
    });
    
    // Decrease consumed materials tracking
    setConsumedMaterials(prev => {
      const prevForItem = prev[id] || {};
      const updated: Record<string, number> = { ...prevForItem };
      Object.entries(recipeMap).forEach(([m, amt]) => {
        updated[m] = (updated[m] || 0) - amt;
        if (updated[m] <= 0) delete updated[m];
      });
      // Remove the tracking entry if no materials are consumed
      if (Object.keys(updated).length === 0) {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      }
      return { ...prev, [id]: updated };
    });
    
    // Decrement crafted count and update completed status
    setCraftingItems(cur => (cur ?? []).map(ci => {
      if (ci.id !== id) return ci;
      const newCrafted = Math.max(0, (ci.craftedCount || 0) - 1);
      const stillCompleted = newCrafted >= ci.quantity;
      return { ...ci, craftedCount: newCrafted, completed: stillCompleted };
    }));
  };

  /**
   * Updates the target quantity for a crafting item
   * Automatically removes the item if quantity is set to 0 or less
   * Adjusts crafted count and completed status if needed
   * @param id - ID of the crafting item
   * @param newQuantity - New target quantity
   */
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCraftingItem(id);
      return;
    }
    
    setCraftingItems(current =>
      (current ?? []).map(item =>
        item.id === id ? { 
          ...item, 
          quantity: newQuantity,
          // Clamp crafted count to new quantity
          craftedCount: Math.min(item.craftedCount || 0, newQuantity),
          // Keep completed only if crafted count equals new quantity
          completed: (item.completed ? (Math.min(item.craftedCount || 0, newQuantity) === newQuantity) : item.completed)
        } : item
      )
    );
  };

  /**
   * Updates the quantity of a specific material in inventory
   * @param material - Name of the material
   * @param amount - New amount (will be clamped to minimum of 0)
   */
  const updateOwnedMaterial = (material: string, amount: number) => {
    setOwnedMaterials(current => ({
      ...current,
      [material]: Math.max(0, amount)
    }));
  };

  /**
   * Manually adds a material to inventory with quantity 0
   * @param name - Name of the material to add
   */
  const addMaterialManually = (name: string) => {
    setOwnedMaterials(current => ({ ...current, [name]: 0 }));
  };

  /**
   * Removes a material from inventory (only if not needed in active crafts)
   * @param name - Name of the material to remove
   */
  const removeMaterialManually = (name: string) => {
    // Check if material is needed in any active (non-completed) crafting
    const neededInActive = craftingItems.some(ci => {
      if (ci.completed) return false;
      const fullItem = resolveItem(ci);
      return fullItem && fullItem.recipe.some(r => r.material === name);
    });
    if (neededInActive) return;
    
    setOwnedMaterials(current => {
      const copy = { ...current };
      delete copy[name];
      return copy;
    });
  };

  /**
   * Checks if a material can be safely removed from inventory
   * Returns false if the material is needed in any active crafting
   * @param name - Name of the material to check
   * @returns true if removable, false otherwise
   */
  const materialIsRemovable = (name: string) => {
    return !craftingItems.some(ci => {
      if (ci.completed) return false;
      const fullItem = resolveItem(ci);
      return fullItem && fullItem.recipe.some(r => r.material === name);
    });
  };

  /**
   * Removes all materials from inventory that are not needed in active crafts
   * Shows confirmation dialog before clearing
   * @param t - Translation function for confirmation messages
   */
  const clearUnusedMaterials = (t: (key: string) => string) => {
    if (!confirm(t('clearUnusedConfirm') + '\n\n' + t('clearUnusedInfo'))) return;
    
    // Build set of needed materials from active crafts
    const needed = new Set<string>();
    craftingItems.forEach(ci => {
      if (!ci.completed) {
        const fullItem = resolveItem(ci);
        if (fullItem) {
          fullItem.recipe.forEach(r => needed.add(r.material));
        }
      }
    });
    
    // Keep only needed materials
    setOwnedMaterials(current => {
      const filtered: { [k: string]: number } = {};
      Object.entries(current).forEach(([k, v]) => {
        if (needed.has(k)) filtered[k] = v as number;
      });
      return filtered;
    });
  };

  /**
   * Removes materials with quantity 0 from inventory (keeps those needed in active crafts)
   * Shows info alert before clearing
   * @param t - Translation function for info message
   */
  const clearZeroMaterials = (t: (key: string) => string) => {
    alert(t('clearZeroInfo'));
    
    // Build set of needed materials from active crafts
    const needed = new Set<string>();
    craftingItems.forEach(ci => {
      if (!ci.completed) {
        const fullItem = resolveItem(ci);
        if (fullItem) {
          fullItem.recipe.forEach(r => needed.add(r.material));
        }
      }
    });
    
    // Keep materials with quantity > 0 or those that are needed
    setOwnedMaterials(current => {
      const filtered: { [k: string]: number } = {};
      Object.entries(current).forEach(([k, v]) => {
        const amount = v as number;
        if (amount > 0 || needed.has(k)) {
          filtered[k] = amount;
        }
      });
      return filtered;
    });
  };

  return {
    addToCraftingList,
    removeCraftingItem,
    toggleCompleted,
    craftOne,
    undoOne,
    updateQuantity,
    updateOwnedMaterial,
    addMaterialManually,
    removeMaterialManually,
    materialIsRemovable,
    clearUnusedMaterials,
    clearZeroMaterials
  };
}
