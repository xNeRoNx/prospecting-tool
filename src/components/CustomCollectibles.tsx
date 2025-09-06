import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Minus, X, Check } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import type { CollectibleOre } from '@/hooks/useAppData';
import { ores, modifiers } from '@/lib/gameData';

export function CustomCollectibles() {
  const { t } = useLanguage();
  const { collectibles, setCollectibles } = useAppData();
  const [selectedOre, setSelectedOre] = useState('');
  const [selectedModifier, setSelectedModifier] = useState('');
  const [quantity, setQuantity] = useState(1);

  const addOre = () => {
    if (!selectedOre) return;
    
    const id = Date.now().toString();
    const newCollectible: CollectibleOre = {
      ore: selectedOre,
      quantity,
      completed: false,
      modifier: selectedModifier || undefined,
      id
    };
    
    setCollectibles(current => [...current, newCollectible]);
    setSelectedOre('');
    setSelectedModifier('');
    setQuantity(1);
  };

  const removeOre = (id: string) => {
    setCollectibles(current => current.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeOre(id);
      return;
    }
    
    setCollectibles(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleCompleted = (id: string) => {
    setCollectibles(current =>
      current.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`;
  };

  const getOreRarity = (oreName: string) => {
    const ore = ores.find(o => o.name === oreName);
    return ore?.rarity || 'Common';
  };

  const groupedOres = ores.reduce((groups, ore) => {
    if (!groups[ore.rarity]) {
      groups[ore.rarity] = [];
    }
    groups[ore.rarity].push(ore);
    return groups;
  }, {} as { [key: string]: typeof ores });

  const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Exotic'];

  const getCompletionStats = () => {
    const total = collectibles.length;
    const completed = collectibles.filter(item => item.completed).length;
    const totalQuantity = collectibles.reduce((sum, item) => sum + item.quantity, 0);
    const completedQuantity = collectibles
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      itemsCompleted: completed,
      totalItems: total,
      quantityCompleted: completedQuantity,
      totalQuantity
    };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('collectibles')}</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              {t('addOre')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('addOre')}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="ore-select">{t('selectOre')}</Label>
                <Select value={selectedOre} onValueChange={setSelectedOre}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectOre')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {rarityOrder.map(rarity => {
                      const rarityOres = groupedOres[rarity] || [];
                      if (rarityOres.length === 0) return null;
                      
                      return (
                        <div key={rarity}>
                          <div className={`px-2 py-1 text-xs font-semibold ${getRarityClass(rarity)}`}>
                            {rarity}
                          </div>
                          {rarityOres.map(ore => (
                            <SelectItem key={ore.name} value={ore.name}>
                              {ore.name}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="modifier-select">{t('modifier')} (Optional)</Label>
                <Select value={selectedModifier} onValueChange={setSelectedModifier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select modifier" />
                  </SelectTrigger>
                  <SelectContent>
                    {modifiers.map(modifier => (
                      <SelectItem key={modifier.name} value={modifier.name}>
                        {modifier.name} ({modifier.effect})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">{t('quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              
              <Button onClick={addOre} disabled={!selectedOre} className="w-full">
                {t('add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stats.totalItems > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-accent">{stats.itemsCompleted}</p>
                <p className="text-sm text-muted-foreground">Items {t('completed')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-sm text-muted-foreground">{t('total')} Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{stats.quantityCompleted}</p>
                <p className="text-sm text-muted-foreground">{t('quantity')} {t('completed')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuantity}</p>
                <p className="text-sm text-muted-foreground">{t('total')} {t('quantity')}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-accent h-3 rounded-full transition-all"
                  style={{ 
                    width: `${stats.totalItems > 0 ? (stats.itemsCompleted / stats.totalItems) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {stats.totalItems > 0 ? Math.round((stats.itemsCompleted / stats.totalItems) * 100) : 0}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('oreList')}</h3>
        
        {collectibles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No ores added yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {collectibles.map(collectible => {
              const rarity = getOreRarity(collectible.ore);
              
              return (
                <Card 
                  key={collectible.id} 
                  className={`${collectible.completed ? 'opacity-60' : ''} transition-opacity`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={collectible.completed}
                          onCheckedChange={() => toggleCompleted(collectible.id)}
                        />
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getRarityClass(rarity)} variant="outline">
                              {rarity}
                            </Badge>
                            <span className={`font-medium ${collectible.completed ? 'line-through' : ''}`}>
                              {collectible.ore}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{t('quantity')}: {collectible.quantity}</span>
                            {collectible.modifier && (
                              <Badge variant="outline" size="sm">
                                {collectible.modifier}
                              </Badge>
                            )}
                            {collectible.completed && (
                              <Badge variant="secondary" size="sm">
                                <Check size={12} className="mr-1" />
                                {t('completed')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(collectible.id, collectible.quantity - 1)}
                          disabled={collectible.quantity <= 1}
                        >
                          <Minus size={14} />
                        </Button>
                        
                        <span className="w-8 text-center text-sm font-mono">
                          {collectible.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(collectible.id, collectible.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeOre(collectible.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {collectibles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rarityOrder.map(rarity => {
            const rarityCollectibles = collectibles.filter(c => getOreRarity(c.ore) === rarity);
            if (rarityCollectibles.length === 0) return null;
            
            const completed = rarityCollectibles.filter(c => c.completed).length;
            const total = rarityCollectibles.length;
            
            return (
              <Card key={rarity}>
                <CardContent className="p-3">
                  <div className="text-center space-y-2">
                    <Badge className={getRarityClass(rarity)} variant="outline">
                      {rarity}
                    </Badge>
                    <p className="text-lg font-bold">
                      {completed}/{total}
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all bg-${rarity.toLowerCase()}-500`}
                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}