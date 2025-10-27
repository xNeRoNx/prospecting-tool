import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Check, X, Hammer, Wrench, Broom, Trash, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import type { CraftingItem, MaterialSummary } from '@/hooks/useAppData.tsx';
import { craftableItems, ores, type CraftableItem } from '@/lib/gameData';

export function Crafting() {
  const { t } = useLanguage();
  const { isLoading, craftingItems, setCraftingItems, ownedMaterials, setOwnedMaterials } = useAppData();
  const [selectedItem, setSelectedItem] = useState<CraftableItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMinimalMaterials, setShowMinimalMaterials] = useState(false);
  const [consumedMaterials, setConsumedMaterials] = useState<Record<string, Record<string, number>>>({});
  
  // Helper to check if item data is outdated by comparing with current gameData
  const isItemDataOutdated = (item: CraftableItem) => {
    // Find the current version of this item in gameData
    const currentItem = craftableItems.find(i => i.name === item.name && i.position === item.position);
    
    // If item doesn't exist in gameData anymore, it's outdated
    if (!currentItem) return true;
    
    // Check if sixStarStats exists in current data but not in saved item
    if (currentItem.sixStarStats && !item.sixStarStats) return true;
    
    // Compare stats structure - check if all stat keys match
    const savedStatsKeys = Object.keys(item.stats || {}).sort();
    const currentStatsKeys = Object.keys(currentItem.stats || {}).sort();
    
    if (savedStatsKeys.join(',') !== currentStatsKeys.join(',')) return true;
    
    // Compare sixStarStats structure if both exist
    if (item.sixStarStats && currentItem.sixStarStats) {
      const savedSixStatsKeys = Object.keys(item.sixStarStats).sort();
      const currentSixStatsKeys = Object.keys(currentItem.sixStarStats).sort();
      
      if (savedSixStatsKeys.join(',') !== currentSixStatsKeys.join(',')) return true;
    }
    
    // Compare stat values (ranges)
    for (const [key, value] of Object.entries(currentItem.stats)) {
      const savedValue = item.stats?.[key];
      if (!savedValue || !Array.isArray(value) || !Array.isArray(savedValue)) continue;
      
      const [currentMin, currentMax] = value as [number, number];
      const [savedMin, savedMax] = savedValue as [number, number];
      
      if (currentMin !== savedMin || currentMax !== savedMax) return true;
    }
    
    // Compare sixStarStats values if both exist
    if (item.sixStarStats && currentItem.sixStarStats) {
      for (const [key, value] of Object.entries(currentItem.sixStarStats)) {
        const savedValue = item.sixStarStats[key];
        if (!savedValue || !Array.isArray(value) || !Array.isArray(savedValue)) continue;
        
        const [currentMin, currentMax] = value as [number, number];
        const [savedMin, savedMax] = savedValue as [number, number];
        
        if (currentMin !== savedMin || currentMax !== savedMax) return true;
      }
    }
    
    // Compare recipe structure
    if (item.recipe && currentItem.recipe) {
      if (item.recipe.length !== currentItem.recipe.length) return true;
      
      // Check if all recipe materials and amounts match
      for (let i = 0; i < item.recipe.length; i++) {
        const savedRecipe = item.recipe[i];
        const currentRecipe = currentItem.recipe[i];
        
        if (savedRecipe.material !== currentRecipe.material ||
            savedRecipe.amount !== currentRecipe.amount ||
            savedRecipe.weight !== currentRecipe.weight) {
          return true;
        }
      }
    }
    
    // Compare cost
    if (item.cost !== currentItem.cost) return true;
    
    return false;
  };

  const addToCraftingList = (item: CraftableItem, qty: number) => {
    const id = Date.now().toString();
    const newCraftingItem: CraftingItem = {
      item,
      quantity: qty,
      completed: false,
      id,
      craftedCount: 0
    };
    
    setCraftingItems(current => [...(current ?? []), newCraftingItem]);
    setSelectedItem(null);
    setQuantity(1);
  };

  const removeCraftingItem = (id: string) => {
    const itemToRemove = craftingItems.find(item => item.id === id);
    if (!itemToRemove) return;
    setCraftingItems(current => (current ?? []).filter(item => item.id !== id));

    // Clear the record of consumed materials (if any) — we do not restore them
    setConsumedMaterials(prev => {
      if (!(id in prev)) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    // From inventory, remove only those materials from the removed crafting's recipe that have quantity 0
    setOwnedMaterials(current => {
      const updated: Record<string, number> = { ...current } as any;
      const recipeMaterials = new Set(itemToRemove.item.recipe.map(r => r.material));
      recipeMaterials.forEach(m => {
        if (updated[m] === 0) {
          delete updated[m];
        }
      });
      return updated;
    });
  };

  const toggleCompleted = (id: string) => {
    setCraftingItems(current => {
      const list = current ?? [];
      const before = list.find(ci => ci.id === id);
      const updated = list.map(ci => ci.id === id ? { ...ci, completed: !ci.completed } : ci);
      const after = updated.find(ci => ci.id === id);
      if (!before || !after) return updated;

      // Transition to completed -> consume materials
      if (!before.completed && after.completed) {
        const remainingToCraft = after.quantity - (before.craftedCount || 0);
        if (remainingToCraft > 0) {
          const additionalConsumed: Record<string, number> = {};
          setOwnedMaterials(mat => {
            const copy: Record<string, number> = { ...mat } as any;
            after.item.recipe.forEach(r => {
              const need = r.amount * remainingToCraft;
              additionalConsumed[r.material] = need;
              if (copy[r.material] !== undefined) {
                copy[r.material] = Math.max(0, (copy[r.material] || 0) - need);
              }
            });
            return copy;
          });
          // Merge with existing consumed (for partial progression)
          setConsumedMaterials(prev => {
            const prevForItem = prev[id] || {};
            const merged: Record<string, number> = { ...prevForItem };
            Object.entries(additionalConsumed).forEach(([m, amt]) => {
              merged[m] = (merged[m] || 0) + amt;
            });
            return { ...prev, [id]: merged };
          });
          // Set craftedCount = quantity
          setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? { ...ci, craftedCount: ci.quantity } : ci));
        }
      }
      // Transition from completed -> active (uncheck) -> refund materials
      else if (before.completed && !after.completed) {
        const consumed = consumedMaterials[id];
        if (consumed) {
          setOwnedMaterials(mat => {
            const copy: Record<string, number> = { ...mat } as any;
            Object.entries(consumed).forEach(([m, amt]) => {
              copy[m] = (copy[m] || 0) + amt;
            });
            return copy;
          });
          setConsumedMaterials(prev => {
            const c = { ...prev };
            delete c[id];
            return c;
          });
          // Reset craftedCount to 0
          setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? { ...ci, craftedCount: 0 } : ci));
        }
      }
      return updated;
    });
  };

  // Craft exactly one item (partial progression)
  const craftOne = (id: string) => {
    const craftingItem = craftingItems.find(ci => ci.id === id);
    if (!craftingItem) return;
    if (craftingItem.completed) return; // already fully crafted
    const crafted = craftingItem.craftedCount || 0;
    if (crafted >= craftingItem.quantity) return;
    // Check if we have materials for 1 unit
    for (const r of craftingItem.item.recipe) {
      if ((ownedMaterials[r.material] || 0) < r.amount) return; // not enough materials
    }
    // Consume materials for 1 unit
    setOwnedMaterials(mat => {
      const copy: Record<string, number> = { ...mat } as any;
      craftingItem.item.recipe.forEach(r => {
        copy[r.material] = Math.max(0, (copy[r.material] || 0) - r.amount);
      });
      return copy;
    });
    // Record consumption in consumedMaterials (incremental)
    setConsumedMaterials(prev => {
      const prevForItem = prev[id] || {};
      const updated: Record<string, number> = { ...prevForItem };
      craftingItem.item.recipe.forEach(r => {
        updated[r.material] = (updated[r.material] || 0) + r.amount;
      });
      return { ...prev, [id]: updated };
    });
    // Increment craftedCount
    setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? { ...ci, craftedCount: (ci.craftedCount || 0) + 1 } : ci));
    // If the full quantity is reached — mark as completed
    setCraftingItems(cur => (cur ?? []).map(ci => ci.id === id ? ( (ci.craftedCount || 0) >= ci.quantity ? { ...ci, completed: true } : ci) : ci));
  };

  // Undo craft of exactly one item
  const undoOne = (id: string) => {
    const craftingItem = craftingItems.find(ci => ci.id === id);
    if (!craftingItem) return;
    const crafted = craftingItem.craftedCount || 0;
    if (crafted <= 0) return;
    // Restore materials for 1 unit
    const recipeMap: Record<string, number> = {};
    craftingItem.item.recipe.forEach(r => { recipeMap[r.material] = r.amount; });
    setOwnedMaterials(mat => {
      const copy: Record<string, number> = { ...mat } as any;
      Object.entries(recipeMap).forEach(([m, amt]) => {
        copy[m] = (copy[m] || 0) + amt;
      });
      return copy;
    });
    // Decrease the recorded consumption
    setConsumedMaterials(prev => {
      const prevForItem = prev[id] || {};
      const updated: Record<string, number> = { ...prevForItem };
      Object.entries(recipeMap).forEach(([m, amt]) => {
        updated[m] = (updated[m] || 0) - amt;
        if (updated[m] <= 0) delete updated[m];
      });
      if (Object.keys(updated).length === 0) {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      }
      return { ...prev, [id]: updated };
    });
    // Decrement craftedCount and, if it was completed, unmark when dropping below quantity
    setCraftingItems(cur => (cur ?? []).map(ci => {
      if (ci.id !== id) return ci;
      const newCrafted = Math.max(0, (ci.craftedCount || 0) - 1);
      const stillCompleted = newCrafted >= ci.quantity; // jeśli mniej niż quantity to nie completed
      return { ...ci, craftedCount: newCrafted, completed: stillCompleted };
    }));
  };

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
          // If the new quantity is less than already crafted — clamp craftedCount
          craftedCount: Math.min(item.craftedCount || 0, newQuantity),
          // If reducing quantity below craftedCount and it was completed, keep completed only if craftedCount == newQuantity
          completed: (item.completed ? (Math.min(item.craftedCount || 0, newQuantity) === newQuantity) : item.completed)
        } : item
      )
    );
  };

  const calculateTotalCost = (): number => {
    let totalCost = 0;
    
    craftingItems.forEach(craftingItem => {
      if (craftingItem.completed) return;
      
      if (showMinimalMaterials) {
        // For minimal mode, calculate cost for one of each unique item type
        const uniqueItems = new Set<string>();
        craftingItems.forEach(ci => {
          if (!ci.completed) {
            uniqueItems.add(ci.item.name);
          }
        });
        
        if (uniqueItems.has(craftingItem.item.name)) {
          totalCost += craftingItem.item.cost;
        }
      } else {
        // For total mode, multiply by quantity
        totalCost += craftingItem.item.cost * craftingItem.quantity;
      }
    });
    
    return totalCost;
  };

  const calculateMaterialSummary = (): MaterialSummary => {
    const summary: MaterialSummary = {};
    const materialMaxNeeded: { [key: string]: number } = {};

    craftingItems.forEach(craftingItem => {
      if (craftingItem.completed) return; // nothing needed for completed items
      const crafted = craftingItem.craftedCount || 0;
      const remainingQty = Math.max(0, craftingItem.quantity - crafted);
      if (remainingQty === 0) return; // no remaining units

      craftingItem.item.recipe.forEach(recipe => {
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
          // minimal mode — only the amount for one unit of each item
            materialMaxNeeded[materialName] = Math.max(materialMaxNeeded[materialName], recipe.amount);
        } else {
          // total mode — only for the remaining uncrafted units
          summary[materialName].needed += recipe.amount * remainingQty;
        }
      });
    });

    if (showMinimalMaterials) {
      Object.keys(materialMaxNeeded).forEach(material => {
        summary[material].needed = materialMaxNeeded[material];
      });
    }
    // Remove materials that are no longer needed
    Object.keys(summary).forEach(m => { if (summary[m].needed === 0) delete summary[m]; });
    return summary;
  };

  const materialSummary = calculateMaterialSummary();
  const totalCost = calculateTotalCost();

  const updateOwnedMaterial = (material: string, amount: number) => {
    setOwnedMaterials(current => ({
      ...current,
      [material]: Math.max(0, amount)
    }));
  };

  const calculateCraftableItems = () => {
    const craftableItems: Array<{ item: CraftingItem; maxQuantity: number }> = [];
    
    craftingItems.forEach(craftingItem => {
      if (craftingItem.completed) return;
      
      let maxCraftable = craftingItem.quantity;
      
      // Check each recipe requirement
      for (const recipe of craftingItem.item.recipe) {
        const owned = ownedMaterials[recipe.material] || 0;
        const neededPerItem = recipe.amount;
        const maxPossible = Math.floor(owned / neededPerItem);
        maxCraftable = Math.min(maxCraftable, maxPossible);
      }
      
      if (maxCraftable > 0) {
        craftableItems.push({ item: craftingItem, maxQuantity: maxCraftable });
      }
    });
    
    return craftableItems;
  };

  const formatStats = (item: CraftableItem) => {
    const baseStats: Record<string, any> = (item as any).stats || {};
    const extStats: Record<string, any> = (item as any).sixStarStats || {};
    const keys = Array.from(new Set([...Object.keys(baseStats), ...Object.keys(extStats)]));
    return keys.map(key => {
      const baseVal = baseStats[key];
      const extVal = extStats[key];
      const lowerKey = key.toLowerCase();
      const suffix = (lowerKey.includes('speed') || lowerKey.includes('boost')) ? '%' : '';

      if (Array.isArray(baseVal) && Array.isArray(extVal)) {
        const [bMin, bMax] = baseVal;
        const [eMin, eMax] = extVal;
        return `${t(key as any) || key}: ${bMin}${suffix} - ${bMax}${suffix} [${eMin}${suffix} - ${eMax}${suffix}]`;
      } else if (Array.isArray(baseVal)) {
        const [bMin, bMax] = baseVal;
        return `${t(key as any) || key}: ${bMin}${suffix} - ${bMax}${suffix}`;
      } else return '';
    }).filter(Boolean);
  };

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`;
  };

  const getMaterialRarity = (materialName: string): string => {
    const ore = ores.find(ore => ore.name === materialName);
    return ore ? ore.rarity : 'Common'; // Default to Common if not found
  };

  const canCraftItems = () => {
    return calculateCraftableItems();
  };

  // We are temporarily hiding items whose name ends with "6*"
  const craftableItemsSorted = [...craftableItems]
    .filter(item => !/6\*$/.test(item.name.trim()))
    .sort((a, b) => {
      // Sort from rarest to most common
      const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Exotic'];
      return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
    });

  // List of materials that can be added (filtering out those already owned)
  const addableMaterials = useMemo(() => {
    return ores
      .filter(o => !(o.name in ownedMaterials))
      .sort((a, b) => {
        const order = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
        return order.indexOf(a.rarity) - order.indexOf(b.rarity);
      });
  }, [ownedMaterials]);

  const addMaterialManually = (name: string) => {
    setOwnedMaterials(current => ({ ...current, [name]: 0 }));
  };

  const removeMaterialManually = (name: string) => {
    // Do not remove if the material is still needed in active (unfinished) recipes
    const neededInActive = craftingItems.some(ci => !ci.completed && ci.item.recipe.some(r => r.material === name));
    if (neededInActive) return; // safety — UI warning can be added later
    setOwnedMaterials(current => {
      const copy = { ...current };
      delete copy[name];
      return copy;
    });
  };

  const materialIsRemovable = (name: string) => {
    return !craftingItems.some(ci => !ci.completed && ci.item.recipe.some(r => r.material === name));
  };

  const clearUnusedMaterials = () => {
    if (!confirm(t('clearUnusedConfirm') + '\n\n' + t('clearUnusedInfo'))) return;
    // Collect the set of materials used by active (unfinished) craftings
    const needed = new Set<string>();
    craftingItems.forEach(ci => {
      if (!ci.completed) {
        ci.item.recipe.forEach(r => needed.add(r.material));
      }
    });
    setOwnedMaterials(current => {
      const filtered: { [k: string]: number } = {};
      Object.entries(current).forEach(([k, v]) => {
        if (needed.has(k)) filtered[k] = v as number;
      });
      return filtered;
    });
  };

  const clearZeroMaterials = () => {
    // Inform the user
    alert(t('clearZeroInfo'));
    // Build the set of materials needed in active (unfinished) craftings
    const needed = new Set<string>();
    craftingItems.forEach(ci => {
      if (!ci.completed) {
        ci.item.recipe.forEach(r => needed.add(r.material));
      }
    });
    setOwnedMaterials(current => {
      const filtered: { [k: string]: number } = {};
      Object.entries(current).forEach(([k, v]) => {
        const amount = v as number;
        // Keep if > 0, or if 0 but still needed
        if (amount > 0 || needed.has(k)) {
          filtered[k] = amount;
        }
      });
      return filtered;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('crafting')}</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              {t('addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('addItem')}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {craftableItemsSorted.map(item => (
                  <Card 
                    key={item.name}
                    className={`cursor-pointer transition-colors hover:bg-accent/10 ${
                      selectedItem?.name === item.name ? 'bg-accent/20 border-accent' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getRarityClass(item.rarity)} variant="outline">
                              {item.rarity}
                            </Badge>
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="secondary">{item.position}</Badge>
                          </div>
                          
                          <div className="text-xs space-y-1">
                            {formatStats(item).map((stat, index) => (
                              <div key={index} className="text-muted-foreground">{stat}</div>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-green-600">${item.cost.toLocaleString()}</span>
                            <Wrench size={12} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {item.recipe.map(r => `${r.amount} ${r.material}`).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <p className='text-xs text-muted-foreground'>*{t('statsInfo')}</p>
              
              {selectedItem && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="quantity">{t('quantity')}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20"
                      disabled={isLoading}
                    />
                    
                    <Button 
                      onClick={() => addToCraftingList(selectedItem, quantity)}
                      disabled={isLoading}
                    >
                      {t('add')}
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('recipe')}</h4>
                    <div className="text-sm space-y-1">
                      {selectedItem.recipe.map(recipe => (
                        <div key={recipe.material} className="flex items-center justify-between">
                          <span>{recipe.material}</span>
                          <span>
                            {recipe.amount * quantity}
                            {recipe.weight && ` (+${recipe.weight * quantity}kg)`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('craftingList')}</h3>
          </div>

          {canCraftItems().length > 0 && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4">
                <h4 className="font-medium text-green-400 flex items-center gap-2 mb-3">
                  <Check size={16} />
                  {t('canCraft')}
                </h4>
                <div className="space-y-1">
                  {canCraftItems().map(({ item, maxQuantity }) => (
                    <div key={item.id} className="text-sm flex items-center gap-2 text-green-400">
                      <Hammer size={14} />
                      <span className="truncate">
                        {item.item.name} x{maxQuantity}
                        {(() => {
                          const crafted = item.craftedCount || 0;
                          const remaining = Math.max(0, item.quantity - crafted);
                          return maxQuantity < remaining && remaining > 0 ? (
                            <span className="text-xs text-muted-foreground ml-1">
                              (of {remaining} wanted)
                            </span>
                          ) : null;
                        })()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {craftingItems.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  {t('noItems')}
                </CardContent>
              </Card>
            ) : (
              craftingItems.map(craftingItem => (
                <Card key={craftingItem.id} className={`${craftingItem.completed ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Mobile-friendly layout */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={craftingItem.completed}
                            onCheckedChange={() => toggleCompleted(craftingItem.id)}
                            className="mt-1"
                            disabled={isLoading}
                          />
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getRarityClass(craftingItem.item.rarity)} variant="outline">
                                {craftingItem.item.rarity}
                              </Badge>
                              <span className="font-medium break-words">{craftingItem.item.name}</span>
                              <Badge variant="secondary" className="text-xs">{craftingItem.item.position}</Badge>
                            </div>
                            
                            {isItemDataOutdated(craftingItem.item) && (
                              <div className="text-xs text-amber-500 flex items-center gap-1">
                                <span>⚠️ {t('outdatedItemWarning')}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <span>{t('quantity')}: {(craftingItem.craftedCount || 0)}/{craftingItem.quantity}</span>
                              <span>
                                {t('cost')}: $
                                {showMinimalMaterials 
                                  ? craftingItem.item.cost.toLocaleString()
                                  : (craftingItem.item.cost * craftingItem.quantity).toLocaleString()
                                }
                              </span>
                            </div>
                            
                            <div className="text-xs">
                              <div className="flex items-center gap-1 mb-1">
                                <Wrench size={12} className="text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground font-medium">Materials:</span>
                              </div>
                              <div className="text-muted-foreground break-words">
                                {showMinimalMaterials 
                                  ? craftingItem.item.recipe.map(r => 
                                      `${r.amount} ${r.material}${r.weight ? ` (+${r.weight}kg)` : ''}`
                                    ).join(', ')
                                  : craftingItem.item.recipe.map(r => 
                                      `${r.amount * craftingItem.quantity} ${r.material}${r.weight ? ` (+${r.weight * craftingItem.quantity}kg)` : ''}`
                                    ).join(', ')
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2 mr-6">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => craftOne(craftingItem.id)}
                            className="h-8 w-8 p-0"
                            disabled={isLoading || craftingItem.completed || (craftingItem.craftedCount || 0) >= craftingItem.quantity}
                            title={t('craftOne')}
                          >
                            <Hammer size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => undoOne(craftingItem.id)}
                            className="h-8 w-8 p-0"
                            disabled={isLoading || (craftingItem.craftedCount || 0) <= 0}
                            title={t('undoOne')}
                          >
                            <ArrowCounterClockwise size={12} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(craftingItem.id, craftingItem.quantity - 1)}
                            className="h-8 w-8 p-0"
                            disabled={isLoading}
                          >
                            <Minus size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(craftingItem.id, craftingItem.quantity + 1)}
                            className="h-8 w-8 p-0"
                            disabled={isLoading}
                          >
                            <Plus size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeCraftingItem(craftingItem.id)}
                            className="h-8 w-8 p-0 text-destructive"
                            disabled={isLoading}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('materialsSummary')}</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="minimal-materials"
                checked={showMinimalMaterials}
                onCheckedChange={setShowMinimalMaterials}
                disabled={isLoading}
              />
              <Label htmlFor="minimal-materials" className="text-sm">
                {t('minimalNeeded')}
              </Label>
            </div>
          </div>
          
          {Object.keys(materialSummary).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t('noMaterials')}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Object.entries(materialSummary)
                  .sort(([materialA], [materialB]) => {
                    const rarityOrder = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
                    const rarityA = getMaterialRarity(materialA);
                    const rarityB = getMaterialRarity(materialB);
                    return rarityOrder.indexOf(rarityA) - rarityOrder.indexOf(rarityB);
                  })
                  .map(([material, data]) => (
                  <div key={material} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge 
                          className={getRarityClass(getMaterialRarity(material))} 
                          variant="outline"
                        >
                          {getMaterialRarity(material)}
                        </Badge>
                        <span className="font-medium min-w-0 break-words flex-1">{material}</span>
                      </div>
                      <div className="flex flex-col gap-1 items-end flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOwnedMaterial(material, data.owned - 1)}
                            className="h-6 w-6 p-0"
                            disabled={data.owned <= 0 || isLoading}
                          >
                            <Minus size={12} />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={data.owned}
                            onChange={(e) => updateOwnedMaterial(material, parseInt(e.target.value) || 0)}
                            className="w-14 h-6 text-xs text-center"
                            placeholder="0"
                            disabled={isLoading}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOwnedMaterial(material, data.owned + 1)}
                            className="h-6 w-6 p-0"
                            disabled={isLoading}
                          >
                            <Plus size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOwnedMaterial(material, data.needed)}
                            className="h-6 px-1 text-xs"
                            title="Set to max needed"
                            disabled={isLoading}
                          >
                            Max
                          </Button>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            / {data.needed}
                            {data.weight && ` (+${data.weight}kg)`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, (data.owned / data.needed) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t('totalCost')}</span>
                    <span className="text-green-600 font-mono">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4 col-span-1 xl:col-span-2">
          {/* Materials inventory section */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 gap-4">
              <div>
                <CardTitle className="text-lg">{t('inventory')} – {t('ownedMaterials')}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed hidden sm:block">{t('materialsInventoryHint')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={clearUnusedMaterials} disabled={isLoading} title={t('clearUnusedMaterials')} className="h-8 w-8 p-0 flex items-center justify-center">
                  <Broom size={16} />
                </Button>
                <Button size="sm" variant="outline" onClick={clearZeroMaterials} disabled={isLoading} title={t('clearZeroMaterials')} className="h-8 w-8 p-0 flex items-center justify-center">
                  <Trash size={16} />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" disabled={isLoading || addableMaterials.length === 0}>
                      <Plus size={14} /> {t('addMaterial')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('addMaterial')}</DialogTitle>
                    </DialogHeader>
                    {addableMaterials.length === 0 ? (
                      <div className="text-sm text-muted-foreground">{t('noMaterials')}</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addableMaterials.map(ore => (
                          <Button
                            key={ore.name}
                            variant="outline"
                            className="justify-start h-auto py-2 px-3 flex flex-col items-start gap-1 text-left"
                            onClick={() => addMaterialManually(ore.name)}
                            disabled={isLoading}
                          >
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Badge className={getRarityClass(ore.rarity)} variant="outline">{ore.rarity}</Badge>
                              {ore.name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {Object.keys(ownedMaterials).length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">{t('inventoryEmpty')}</div>
              ) : (
                Object.entries(ownedMaterials)
                  .sort(([nameA], [nameB]) => {
                    const order = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
                    const rarityA = getMaterialRarity(nameA);
                    const rarityB = getMaterialRarity(nameB);
                    const diff = order.indexOf(rarityA) - order.indexOf(rarityB);
                    if (diff !== 0) return diff;
                    return nameA.localeCompare(nameB); // tie-breaker alphabetically
                  })
                  .map(([name, value]) => {
                    const rarity = getMaterialRarity(name);
                    const removable = materialIsRemovable(name);
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <Badge className={getRarityClass(rarity)} variant="outline">{rarity}</Badge>
                        <span className="flex-1 min-w-0 truncate" title={name}>{name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => updateOwnedMaterial(name, value - 1)}
                            disabled={isLoading || value <= 0}
                          >
                            <Minus size={12} />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            value={value}
                            onChange={(e) => updateOwnedMaterial(name, parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-xs text-center"
                            disabled={isLoading}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => updateOwnedMaterial(name, value + 1)}
                            disabled={isLoading}
                          >
                            <Plus size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => removeMaterialManually(name)}
                            disabled={!removable || isLoading}
                            title={removable ? t('removeMaterial') : t('alreadyAdded')}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}