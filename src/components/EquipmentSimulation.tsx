import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Calculator } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import { craftableItems, shovels, pans, enchants, type CraftableItem } from '@/lib/gameData';

export function EquipmentSimulation() {
  const { t } = useLanguage();
  const { equipment, setEquipment, museumSlots, craftingItems } = useAppData();
  const [customStatName, setCustomStatName] = useState('');
  const [customStatValue, setCustomStatValue] = useState(0);

  const updateEquipment = (updates: Partial<typeof equipment>) => {
    setEquipment(current => ({ ...current, ...updates }));
  };

  const equipItem = (item: CraftableItem, position: 'rings' | 'necklace' | 'charm', slotIndex?: number) => {
    if (position === 'rings' && typeof slotIndex === 'number') {
      const newRings = [...equipment.rings];
      newRings[slotIndex] = item;
      updateEquipment({ rings: newRings });
    } else if (position === 'necklace') {
      updateEquipment({ necklace: item });
    } else if (position === 'charm') {
      updateEquipment({ charm: item });
    }
  };

  const unequipItem = (position: 'rings' | 'necklace' | 'charm', slotIndex?: number) => {
    if (position === 'rings' && typeof slotIndex === 'number') {
      const newRings = [...equipment.rings];
      newRings[slotIndex] = null;
      updateEquipment({ rings: newRings });
    } else if (position === 'necklace') {
      updateEquipment({ necklace: null });
    } else if (position === 'charm') {
      updateEquipment({ charm: null });
    }
  };

  const addCustomStat = () => {
    if (!customStatName.trim() || customStatValue === 0) return;
    
    updateEquipment({
      customStats: {
        ...equipment.customStats,
        [customStatName]: customStatValue
      }
    });
    
    setCustomStatName('');
    setCustomStatValue(0);
  };

  const removeCustomStat = (statName: string) => {
    const newStats = { ...equipment.customStats };
    delete newStats[statName];
    updateEquipment({ customStats: newStats });
  };

  const calculateBaseStats = () => {
    const stats: { [key: string]: number } = {
      luck: 0,
      digStrength: 0,
      digSpeed: 0,
      shakeStrength: 0,
      shakeSpeed: 0,
      capacity: 0,
      sellBoost: 0,
      sizeBoost: 0,
      modifierBoost: 0,
      toughness: 0
    };

    // Equipment stats
    [...equipment.rings, equipment.necklace, equipment.charm].forEach(item => {
      if (item) {
        Object.entries(item.stats).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // Use max value from range
            const maxValue = value[1];
            if (stats[key] !== undefined) {
              stats[key] += maxValue;
            }
          }
        });
      }
    });

    // Shovel stats
    if (equipment.shovel) {
      const shovel = shovels.find(s => s.name === equipment.shovel);
      if (shovel) {
        stats.digStrength += shovel.stats.digStrength;
        stats.digSpeed += shovel.stats.digSpeed;
        stats.toughness += shovel.stats.toughness;
      }
    }

    // Pan stats (with enchant if selected)
    if (equipment.pan) {
      const pan = pans.find(p => p.name === equipment.pan);
      if (pan) {
        stats.luck += pan.stats.luck;
        stats.capacity += pan.stats.capacity;
        stats.shakeStrength += pan.stats.shakeStrength;
        stats.shakeSpeed += pan.stats.shakeSpeed;
        
        // Parse passive effects
        if (pan.passive) {
          if (pan.passive.includes('Size boost')) {
            const match = pan.passive.match(/\(([+-]\d+)%\)/);
            if (match) {
              stats.sizeBoost += parseInt(match[1]);
            }
          }
          if (pan.passive.includes('Modifier boost')) {
            const match = pan.passive.match(/\(([+-]\d+)%\)/);
            if (match) {
              stats.modifierBoost += parseInt(match[1]);
            }
          }
        }
        
        // Apply enchant if selected
        if (equipment.enchant) {
          const enchant = enchants.find(e => e.name === equipment.enchant);
          if (enchant) {
            Object.entries(enchant.effects).forEach(([key, value]) => {
              if (stats[key] !== undefined) {
                stats[key] += value;
              }
            });
          }
        }
      }
    }

    // Custom stats
    Object.entries(equipment.customStats).forEach(([key, value]) => {
      if (stats[key] !== undefined) {
        stats[key] += value;
      } else {
        stats[key] = value;
      }
    });

    return stats;
  };

  const calculateMuseumBonuses = () => {
    const museumBonuses: { [key: string]: number } = {
      luck: 0,
      digStrength: 0,
      digSpeed: 0,
      shakeStrength: 0,
      shakeSpeed: 0,
      capacity: 0,
      sellBoost: 0,
      sizeBoost: 0,
      modifierBoost: 0
    };

    // This would be calculated from museum slots - simplified for now
    // In a real implementation, you'd calculate based on the Museum component's logic
    
    return museumBonuses;
  };

  const calculateFinalStats = () => {
    const baseStats = calculateBaseStats();
    const museumBonuses = calculateMuseumBonuses();
    const finalStats: { [key: string]: number } = {};

    Object.keys(baseStats).forEach(key => {
      const base = baseStats[key] || 0;
      const bonus = museumBonuses[key] || 0;
      finalStats[key] = base + (base * bonus);
    });

    return { baseStats, finalStats };
  };

  const availableItems = [...craftableItems, ...craftingItems.map(ci => ci.item)];
  const { baseStats, finalStats } = calculateFinalStats();

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`;
  };

  const formatStatValue = (key: string, value: number) => {
    const suffix = key.includes('Speed') || key.includes('Boost') ? '%' : '';
    return `${value.toFixed(1)}${suffix}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('equipment')}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Rings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('rings')} (8)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipment.rings.map((ring, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-3">
                      {ring ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={getRarityClass(ring.rarity)} variant="outline">
                              {ring.rarity}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => unequipItem('rings', index)}
                              className="h-6 w-6 p-0"
                            >
                              <X size={12} />
                            </Button>
                          </div>
                          <p className="text-sm font-medium">{ring.name}</p>
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full h-16 border-dashed">
                              <Plus size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Select Ring</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {availableItems
                                .filter(item => item.position === 'Ring')
                                .map(item => (
                                  <Button
                                    key={item.name}
                                    variant="outline"
                                    onClick={() => equipItem(item, 'rings', index)}
                                    className="w-full justify-start"
                                  >
                                    <Badge className={getRarityClass(item.rarity)} variant="outline" size="sm">
                                      {item.rarity}
                                    </Badge>
                                    <span className="ml-2">{item.name}</span>
                                  </Button>
                                ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Necklace and Charm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('necklace')}</CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.necklace ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getRarityClass(equipment.necklace.rarity)} variant="outline">
                        {equipment.necklace.rarity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unequipItem('necklace')}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                    <p className="font-medium">{equipment.necklace.name}</p>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-24 border-dashed">
                        <Plus size={20} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Necklace</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableItems
                          .filter(item => item.position === 'Necklace')
                          .map(item => (
                            <Button
                              key={item.name}
                              variant="outline"
                              onClick={() => equipItem(item, 'necklace')}
                              className="w-full justify-start"
                            >
                              <Badge className={getRarityClass(item.rarity)} variant="outline" size="sm">
                                {item.rarity}
                              </Badge>
                              <span className="ml-2">{item.name}</span>
                            </Button>
                          ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('charm')}</CardTitle>
              </CardHeader>
              <CardContent>
                {equipment.charm ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getRarityClass(equipment.charm.rarity)} variant="outline">
                        {equipment.charm.rarity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unequipItem('charm')}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                    <p className="font-medium">{equipment.charm.name}</p>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-24 border-dashed">
                        <Plus size={20} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Charm</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableItems
                          .filter(item => item.position === 'Charm')
                          .map(item => (
                            <Button
                              key={item.name}
                              variant="outline"
                              onClick={() => equipItem(item, 'charm')}
                              className="w-full justify-start"
                            >
                              <Badge className={getRarityClass(item.rarity)} variant="outline" size="sm">
                                {item.rarity}
                              </Badge>
                              <span className="ml-2">{item.name}</span>
                            </Button>
                          ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('shovel')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={equipment.shovel || ''}
                  onValueChange={(value) => updateEquipment({ shovel: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shovel" />
                  </SelectTrigger>
                  <SelectContent>
                    {shovels.map(shovel => (
                      <SelectItem key={shovel.name} value={shovel.name}>
                        {shovel.name} - ${shovel.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('pan')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select
                    value={equipment.pan || ''}
                    onValueChange={(value) => updateEquipment({ pan: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pan" />
                    </SelectTrigger>
                    <SelectContent>
                      {pans.map(pan => (
                        <SelectItem key={pan.name} value={pan.name}>
                          {pan.name} - ${pan.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {equipment.pan && (
                    <Select
                      value={equipment.enchant || ''}
                      onValueChange={(value) => updateEquipment({ enchant: value || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select enchant" />
                      </SelectTrigger>
                      <SelectContent>
                        {enchants.map(enchant => (
                          <SelectItem key={enchant.name} value={enchant.name}>
                            {enchant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('customStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Stat name"
                  value={customStatName}
                  onChange={(e) => setCustomStatName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={customStatValue}
                  onChange={(e) => setCustomStatValue(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <Button onClick={addCustomStat}>
                  <Plus size={16} />
                </Button>
              </div>
              
              {Object.entries(equipment.customStats).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span>{name}: {value}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeCustomStat(name)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Stats Display */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator size={20} />
                {t('baseStats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(baseStats).map(([stat, value]) => (
                <div key={stat} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-mono">
                    {formatStatValue(stat, value)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-accent">{t('withMuseum')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(finalStats).map(([stat, value]) => (
                <div key={stat} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-mono text-accent">
                    {formatStatValue(stat, value)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}