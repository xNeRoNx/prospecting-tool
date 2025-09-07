import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Check, X, Hammer, Wrench } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import type { CraftingItem, MaterialSummary } from '@/hooks/useAppData';
import { craftableItems, ores, type CraftableItem } from '@/lib/gameData';

export function Crafting() {
  const { t } = useLanguage();
  const { isLoading, craftingItems, setCraftingItems, ownedMaterials, setOwnedMaterials } = useAppData();
  const [selectedItem, setSelectedItem] = useState<CraftableItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMinimalMaterials, setShowMinimalMaterials] = useState(false);
  const addToCraftingList = (item: CraftableItem, qty: number) => {
    const id = Date.now().toString();
    const newCraftingItem: CraftingItem = {
      item,
      quantity: qty,
      completed: false,
      id
    };
    
    setCraftingItems(current => [...current, newCraftingItem]);
    setSelectedItem(null);
    setQuantity(1);
  };

  const removeCraftingItem = (id: string) => {
    const itemToRemove = craftingItems.find(item => item.id === id);
    if (!itemToRemove) return;

    // Remove the item from crafting list
    setCraftingItems(current => current.filter(item => item.id !== id));
    
    // Check if any materials are only used by the removed item and reset their quantity
    const remainingItems = craftingItems.filter(item => item.id !== id);
    const materialsStillNeeded = new Set<string>();
    
    // Collect all materials still needed by remaining items
    remainingItems.forEach(craftingItem => {
      if (!craftingItem.completed) {
        craftingItem.item.recipe.forEach(recipe => {
          materialsStillNeeded.add(recipe.material);
        });
      }
    });
    
    // Reset materials that are no longer needed
    const materialsToReset: string[] = [];
    itemToRemove.item.recipe.forEach(recipe => {
      if (!materialsStillNeeded.has(recipe.material)) {
        materialsToReset.push(recipe.material);
      }
    });
    
    if (materialsToReset.length > 0) {
      setOwnedMaterials(current => {
        const updated = { ...current };
        materialsToReset.forEach(material => {
          delete updated[material];
        });
        return updated;
      });
    }
  };

  const toggleCompleted = (id: string) => {
    setCraftingItems(current =>
      current.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCraftingItem(id);
      return;
    }
    
    setCraftingItems(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
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
    
    // Calculate totals or maximums based on showMinimalMaterials flag
    craftingItems.forEach(craftingItem => {
      if (craftingItem.completed) return;
      
      craftingItem.item.recipe.forEach(recipe => {
        const materialName = recipe.material;
        const needed = recipe.amount * craftingItem.quantity;
        
        if (!summary[materialName]) {
          summary[materialName] = {
            needed: 0,
            owned: ownedMaterials[materialName] || 0,
            weight: recipe.weight
          };
          materialMaxNeeded[materialName] = 0;
        }
        
        if (showMinimalMaterials) {
          // For minimal materials, keep track of the maximum amount needed per item
          const neededPerItem = recipe.amount;
          materialMaxNeeded[materialName] = Math.max(materialMaxNeeded[materialName], neededPerItem);
        } else {
          // For total materials, sum all needed amounts
          summary[materialName].needed += needed;
        }
      });
    });

    // If showing minimal materials, use the maximum needed per item type
    if (showMinimalMaterials) {
      Object.keys(materialMaxNeeded).forEach(material => {
        summary[material].needed = materialMaxNeeded[material];
      });
    }

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
    return Object.entries(item.stats).map(([key, value]) => {
      if (Array.isArray(value)) {
        const [min, max] = value;
        const suffix = key.includes('Speed') || key.includes('Boost') ? '%' : '';
        return `${key}: ${min}${suffix} - ${max}${suffix}`;
      }
      return '';
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

  const craftableItemsSorted = [...craftableItems].sort((a, b) => {
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Exotic'];
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });

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
          <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
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
                        {maxQuantity < item.quantity && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (of {item.quantity} wanted)
                          </span>
                        )}
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
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <span>{t('quantity')}: {craftingItem.quantity}</span>
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
                        
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
      </div>
    </div>
  );
}