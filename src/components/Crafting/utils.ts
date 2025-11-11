import type { CraftableItem } from '@/lib/gameData';
import { ores } from '@/lib/gameData';
import type { CraftingItem, MaterialSummary } from '@/hooks/useAppData';

/**
 * Calculates the summary of materials needed for crafting
 * @param craftingItems - List of items to be crafted
 * @param ownedMaterials - Materials currently owned by the player
 * @param showMinimalMaterials - If true, shows minimum materials needed (one of each type), otherwise shows total
 * @param resolveItem - Function to resolve a CraftingItem to a full CraftableItem
 * @returns Object with material names as keys and their needed/owned quantities as values
 */
export function calculateMaterialSummary(
  craftingItems: CraftingItem[],
  ownedMaterials: Record<string, number>,
  showMinimalMaterials: boolean,
  resolveItem: (craftingItem: CraftingItem) => CraftableItem | null
): MaterialSummary {
  const summary: MaterialSummary = {};
  const materialMaxNeeded: { [key: string]: number } = {};

  craftingItems.forEach(craftingItem => {
    // Skip completed items
    if (craftingItem.completed) return;
    const fullItem = resolveItem(craftingItem);
    if (!fullItem) return;
    
    // Calculate remaining quantity to craft
    const crafted = craftingItem.craftedCount || 0;
    const remainingQty = Math.max(0, craftingItem.quantity - crafted);
    if (remainingQty === 0) return;

    // Process each material in the recipe
    fullItem.recipe.forEach(recipe => {
      const materialName = recipe.material;
      if (!summary[materialName]) {
        summary[materialName] = {
          needed: 0,
          owned: ownedMaterials[materialName] || 0,
          weight: recipe.weight
        };
        materialMaxNeeded[materialName] = 0;
      }
      if (showMinimalMaterials) {
        // For minimal mode: track the maximum amount needed for one unit of each item type
        materialMaxNeeded[materialName] = Math.max(materialMaxNeeded[materialName], recipe.amount);
      } else {
        // For total mode: sum up all materials needed for remaining quantity
        summary[materialName].needed += recipe.amount * remainingQty;
      }
    });
  });

  // Apply minimal materials calculation if enabled
  if (showMinimalMaterials) {
    Object.keys(materialMaxNeeded).forEach(material => {
      summary[material].needed = materialMaxNeeded[material];
    });
  }
  
  // Remove materials with zero needed quantity
  Object.keys(summary).forEach(m => { 
    if (summary[m].needed === 0) delete summary[m]; 
  });
  
  return summary;
}

/**
 * Calculates the total cost of all items in the crafting list
 * @param craftingItems - List of items to be crafted
 * @param showMinimalMaterials - If true, calculates cost for one of each item type, otherwise total cost
 * @param resolveItem - Function to resolve a CraftingItem to a full CraftableItem
 * @returns Total cost in game currency
 */
export function calculateTotalCost(
  craftingItems: CraftingItem[],
  showMinimalMaterials: boolean,
  resolveItem: (craftingItem: CraftingItem) => CraftableItem | null
): number {
  let totalCost = 0;
  
  craftingItems.forEach(craftingItem => {
    // Skip completed items
    if (craftingItem.completed) return;
    const fullItem = resolveItem(craftingItem);
    if (!fullItem) return;
    
    if (showMinimalMaterials) {
      // For minimal mode: count each unique item type only once
      const uniqueItems = new Set<string>();
      craftingItems.forEach(ci => {
        if (!ci.completed) {
          uniqueItems.add(ci.itemName);
        }
      });
      
      if (uniqueItems.has(craftingItem.itemName)) {
        totalCost += fullItem.cost;
      }
    } else {
      // For total mode: multiply cost by quantity
      totalCost += fullItem.cost * craftingItem.quantity;
    }
  });
  
  return totalCost;
}

/**
 * Finds all items that can currently be crafted with available materials
 * @param craftingItems - List of items to be crafted
 * @param ownedMaterials - Materials currently owned by the player
 * @param resolveItem - Function to resolve a CraftingItem to a full CraftableItem
 * @returns Array of items with their maximum craftable quantities
 */
export function calculateCraftableItems(
  craftingItems: CraftingItem[],
  ownedMaterials: Record<string, number>,
  resolveItem: (craftingItem: CraftingItem) => CraftableItem | null
): Array<{ item: CraftingItem; maxQuantity: number }> {
  const craftableItemsResult: Array<{ item: CraftingItem; maxQuantity: number }> = [];
  
  craftingItems.forEach(craftingItem => {
    // Skip completed items
    if (craftingItem.completed) return;
    const fullItem = resolveItem(craftingItem);
    if (!fullItem) return;
    
    let maxCraftable = craftingItem.quantity;
    
    // Check each material requirement and find the limiting factor
    for (const recipe of fullItem.recipe) {
      const owned = ownedMaterials[recipe.material] || 0;
      const neededPerItem = recipe.amount;
      const maxPossible = Math.floor(owned / neededPerItem);
      maxCraftable = Math.min(maxCraftable, maxPossible);
    }
    
    // Only include items that can be crafted at least once
    if (maxCraftable > 0) {
      craftableItemsResult.push({ item: craftingItem, maxQuantity: maxCraftable });
    }
  });
  
  return craftableItemsResult;
}

/**
 * Formats item statistics for display
 * @param item - The craftable item
 * @param t - Translation function
 * @returns Array of formatted stat strings
 */
export function formatStats(item: CraftableItem, t: (key: any) => string): string[] {
  const baseStats: Record<string, any> = (item as any).stats || {};
  const extStats: Record<string, any> = (item as any).sixStarStats || {};
  const keys = Array.from(new Set([...Object.keys(baseStats), ...Object.keys(extStats)]));
  
  return keys.map(key => {
    const baseVal = baseStats[key];
    const extVal = extStats[key];
    const lowerKey = key.toLowerCase();
    // Add percentage suffix for speed and boost stats
    const suffix = (lowerKey.includes('speed') || lowerKey.includes('boost')) ? '%' : '';

    // Format with both base and extended stats if available
    if (Array.isArray(baseVal) && Array.isArray(extVal)) {
      const [bMin, bMax] = baseVal;
      const [eMin, eMax] = extVal;
      return `${t(key as any) || key}: ${bMin}${suffix} - ${bMax}${suffix} [${eMin}${suffix} - ${eMax}${suffix}]`;
    } else if (Array.isArray(baseVal)) {
      const [bMin, bMax] = baseVal;
      return `${t(key as any) || key}: ${bMin}${suffix} - ${bMax}${suffix}`;
    } else return '';
  }).filter(Boolean);
}

/**
 * Returns the CSS class name for a given rarity
 * @param rarity - The rarity level (e.g., 'Common', 'Rare', 'Legendary')
 * @returns CSS class name
 */
export function getRarityClass(rarity: string): string {
  return `rarity-${rarity.toLowerCase()}`;
}

/**
 * Gets the rarity level of a material
 * @param materialName - Name of the material
 * @returns Rarity level (defaults to 'Common' if not found)
 */
export function getMaterialRarity(materialName: string): string {
  const ore = ores.find(ore => ore.name === materialName);
  return ore ? ore.rarity : 'Common';
}

/**
 * Gets list of materials that can be added to inventory (not currently owned)
 * @param ownedMaterials - Materials currently owned by the player
 * @returns Sorted array of materials that can be added (from rarest to most common)
 */
export function getAddableMaterials(ownedMaterials: Record<string, number>) {
  return ores
    .filter(o => !(o.name in ownedMaterials))
    .sort((a, b) => {
      const order = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
      return order.indexOf(a.rarity) - order.indexOf(b.rarity);
    });
}

/**
 * Sorts craftable items by rarity (rarest first) and filters out 6-star variants
 * @param items - Array of craftable items
 * @returns Sorted and filtered array of items
 */
export function sortCraftableItems(items: CraftableItem[]): CraftableItem[] {
  return [...items]
    .filter(item => !/6\*$/.test(item.name.trim())) // Filter out items ending with "6*"
    .sort((a, b) => {
      const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Exotic'];
      return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
    });
}
