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
import { useAppData } from '@/hooks/useAppData.tsx';
import type { CollectibleOre } from '@/hooks/useAppData.tsx';
import { ores, modifiers } from '@/lib/gameData';

export function CustomCollectibles() {
  const { t } = useLanguage();
  const { isLoading, collectibles, setCollectibles } = useAppData();
  const [selectedOre, setSelectedOre] = useState('');
  const [selectedModifier, setSelectedModifier] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ownedQuantity, setOwnedQuantity] = useState(0);
  const [weight, setWeight] = useState<number | undefined>(undefined);

  const addOre = () => {
    if (!selectedOre) return;
    
    const id = Date.now().toString();
    const newCollectible: CollectibleOre = {
      ore: selectedOre,
      quantity,
      completed: false,
      modifier: selectedModifier || undefined,
      ownedQuantity: ownedQuantity || 0,
      weight: weight || undefined,
      id
    };
    
    setCollectibles(current => [...(current ?? []), newCollectible]);
    setSelectedOre('');
    setSelectedModifier('');
    setQuantity(1);
    setOwnedQuantity(0);
    setWeight(undefined);
  };

  const removeOre = (id: string) => {
    setCollectibles(current => (current ?? []).filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeOre(id);
      return;
    }
    
    setCollectibles(current =>
      (current ?? []).map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateOwnedQuantity = (id: string, newOwnedQuantity: number) => {
    setCollectibles(current =>
      (current ?? []).map(item =>
        item.id === id ? { ...item, ownedQuantity: Math.max(0, newOwnedQuantity) } : item
      )
    );
  };

  const updateWeight = (id: string, newWeight: number | undefined) => {
    setCollectibles(current =>
      (current ?? []).map(item =>
        item.id === id ? { ...item, weight: newWeight } : item
      )
    );
  };

  const toggleCompleted = (id: string) => {
    setCollectibles(current =>
      (current ?? []).map(item =>
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
            <Button className="gap-2" disabled={isLoading}>
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
                <Select value={selectedOre} onValueChange={setSelectedOre} disabled={isLoading}>
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
                <Select value={selectedModifier} onValueChange={setSelectedModifier} disabled={isLoading}>
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
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="owned-quantity">Owned Quantity</Label>
                <Input
                  id="owned-quantity"
                  type="number"
                  min="0"
                  value={ownedQuantity}
                  onChange={(e) => setOwnedQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Optional"
                  value={weight || ''}
                  onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) || 0 : undefined)}
                  disabled={isLoading}
                />
              </div>
              
              <Button onClick={addOre} disabled={!selectedOre || isLoading} className="w-full">
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
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={collectible.completed}
                          onCheckedChange={() => toggleCompleted(collectible.id)}
                          className="mt-1 flex-shrink-0"
                          disabled={isLoading}
                        />
                        
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getRarityClass(rarity)} variant="outline">
                              {rarity}
                            </Badge>
                            <span className={`font-medium break-words ${collectible.completed ? 'line-through' : ''}`}>
                              {collectible.ore}
                            </span>
                            {collectible.modifier && (
                              <Badge variant="outline" className="text-xs">
                                {collectible.modifier}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            <span>{t('quantity')}: {collectible.quantity}</span>
                            {collectible.ownedQuantity !== undefined && (
                              <span>Owned: {collectible.ownedQuantity}</span>
                            )}
                            {collectible.weight && (
                              <span>Weight: {collectible.weight}kg</span>
                            )}
                            {collectible.completed && (
                              <Badge variant="secondary" className="text-xs">
                                <Check size={12} className="mr-1" />
                                {t('completed')}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Editable fields for owned quantity and weight */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-1">
                              <Label className="text-xs whitespace-nowrap">Owned:</Label>
                              <Input
                                type="number"
                                min="0"
                                max={collectible.quantity}
                                value={collectible.ownedQuantity || 0}
                                onChange={(e) => updateOwnedQuantity(collectible.id, parseInt(e.target.value) || 0)}
                                className="w-16 h-6 text-xs"
                                disabled={isLoading}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-xs whitespace-nowrap">Weight:</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0"
                                value={collectible.weight || ''}
                                onChange={(e) => updateWeight(collectible.id, e.target.value ? parseFloat(e.target.value) || 0 : undefined)}
                                className="w-16 h-6 text-xs"
                                disabled={isLoading}
                              />
                              <span className="text-xs text-muted-foreground">kg</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(collectible.id, collectible.quantity - 1)}
                            disabled={collectible.quantity <= 1 || isLoading}
                            className="h-8 w-8 p-0"
                          >
                            <Minus size={12} />
                          </Button>
                          
                          <span className="w-8 text-center text-sm font-mono">
                            {collectible.quantity}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(collectible.id, collectible.quantity + 1)}
                            className="h-8 w-8 p-0"
                            disabled={isLoading}
                          >
                            <Plus size={12} />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeOre(collectible.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            disabled={isLoading}
                          >
                            <X size={12} />
                          </Button>
                        </div>
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