import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Check, X, Hammer } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import type { CraftingItem, MaterialSummary } from '@/hooks/useAppData';
import { craftableItems, type CraftableItem } from '@/lib/gameData';

export function Crafting() {
  const { t } = useLanguage();
  const { craftingItems, setCraftingItems, ownedMaterials, setOwnedMaterials } = useAppData();
  const [selectedItem, setSelectedItem] = useState<CraftableItem | null>(null);
  const [quantity, setQuantity] = useState(1);
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
    setCraftingItems(current => current.filter(item => item.id !== id));
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

  const calculateMaterialSummary = (): MaterialSummary => {
    const summary: MaterialSummary = {};
    
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
        }
        
        summary[materialName].needed += needed;
      });
    });

    return summary;
  };

  const materialSummary = calculateMaterialSummary();

  const updateOwnedMaterial = (material: string, amount: number) => {
    setOwnedMaterials(current => ({
      ...current,
      [material]: Math.max(0, amount)
    }));
  };

  const canCraftItems = () => {
    return craftingItems.filter(craftingItem => {
      if (craftingItem.completed) return false;
      
      return craftingItem.item.recipe.every(recipe => {
        const owned = ownedMaterials[recipe.material] || 0;
        const needed = recipe.amount * craftingItem.quantity;
        return owned >= needed;
      });
    });
  };

  const formatStats = (item: CraftableItem) => {
    const stats = [];
    Object.entries(item.stats).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const [min, max] = value;
        const suffix = key.includes('Speed') || key.includes('Boost') ? '%' : '';
        stats.push(`${key}: ${min}${suffix} - ${max}${suffix}`);
      }
    });
    return stats.join(', ');
  };

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`;
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
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getRarityClass(item.rarity)} variant="outline">
                              {item.rarity}
                            </Badge>
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="secondary">{item.position}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatStats(item)}
                          </p>
                          <p className="text-sm font-medium">
                            ${item.cost.toLocaleString()}
                          </p>
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
                    />
                    
                    <Button onClick={() => addToCraftingList(selectedItem, quantity)}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {canCraftItems().map(item => (
                  <div key={item.id} className="text-sm flex items-center gap-2 text-green-400">
                    <Hammer size={14} />
                    {item.item.name} x{item.quantity}
                  </div>
                ))}
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
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={craftingItem.completed}
                            onCheckedChange={() => toggleCompleted(craftingItem.id)}
                          />
                          <Badge className={getRarityClass(craftingItem.item.rarity)} variant="outline">
                            {craftingItem.item.rarity}
                          </Badge>
                          <span className="font-medium">{craftingItem.item.name}</span>
                          <Badge variant="secondary">{craftingItem.item.position}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{t('quantity')}: {craftingItem.quantity}</span>
                          <span>{t('cost')}: ${(craftingItem.item.cost * craftingItem.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(craftingItem.id, craftingItem.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(craftingItem.id, craftingItem.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeCraftingItem(craftingItem.id)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('materialsSummary')}</h3>
          
          {Object.keys(materialSummary).length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t('noMaterials')}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 space-y-3">
                {Object.entries(materialSummary).map(([material, data]) => (
                  <div key={material} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{material}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={data.owned}
                          onChange={(e) => updateOwnedMaterial(material, parseInt(e.target.value) || 0)}
                          className="w-20 h-8"
                          placeholder="0"
                        />
                        <span className="text-sm text-muted-foreground">
                          / {data.needed}
                          {data.weight && ` (+${data.weight}kg)`}
                        </span>
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}