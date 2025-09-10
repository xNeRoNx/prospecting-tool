import { useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, List } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import type { MuseumSlot } from '@/hooks/useAppData.tsx';
import { ores, modifiers, getModifierBonus } from '@/lib/gameData';

export function Museum() {
  const { t } = useLanguage();
  const { isLoading, museumSlots, setMuseumSlots } = useAppData();

  // Initialize museum slots if empty
  useEffect(() => {
    if (!isLoading && museumSlots.length === 0) {
      const slots = initializeMuseumSlots();
      setMuseumSlots(slots);
    }
  }, [museumSlots, setMuseumSlots, isLoading]);

  const initializeMuseumSlots = () => {
    const slots: MuseumSlot[] = [];
    
    // Get slot counts for each rarity (rarest to common)
    const raritySlotCounts = {
      'Exotic': 1,
      'Mythic': 2,
      'Legendary': 3,
      'Epic': 3,
      'Rare': 3,
      'Uncommon': 3,
      'Common': 3
    };

    Object.entries(raritySlotCounts).forEach(([rarity, slotsCount]) => {
      for (let i = 0; i < slotsCount; i++) {
        slots.push({ 
          id: `${rarity.toLowerCase()}-${i}`, 
          ore: undefined, 
          modifier: undefined 
        });
      }
    });
    
    return slots;
  };

  const updateSlot = (id: string, updates: Partial<MuseumSlot>) => {
    // Check if trying to place the same ore in different slots
    if (updates.ore) {
      const existingOreSlot = museumSlots.find(slot => slot.ore === updates.ore && slot.id !== id);
      if (existingOreSlot) {
        // Don't allow duplicate ores in different slots
        return;
      }
    }
    
  setMuseumSlots(current => (current || []).map(slot => slot.id === id ? { ...slot, ...updates } : slot));
  };

  const clearSlot = (id: string) => {
  setMuseumSlots(current => (current || []).map(slot => slot.id === id ? { ...slot, ore: undefined, modifier: undefined, weight: undefined } : slot));
  };

  const calculateMuseumStats = () => {
    const stats: { [key: string]: number } = {
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

    museumSlots.forEach(slot => {
      if (!slot.ore) return;
      
      const ore = ores.find(o => o.name === slot.ore);
      if (!ore) return;

      // Handle special multi-stat effects first
      if (ore.specialEffects) {
        Object.entries(ore.specialEffects).forEach(([stat, value]) => {
          if (stats[stat] !== undefined) {
            let effectValue = value;
            
            // Add modifier bonus if present
            if (slot.modifier) {
              effectValue += getModifierBonus(ore.rarity);
            }
            
            stats[stat] += effectValue;
          }
        });
      } else {
        // Handle normal single-stat effects
        let baseMultiplier = ore.museumEffect.maxMultiplier;
        
        // Apply the effect based on the ore's museum effect
        const effectStat = ore.museumEffect.stat.toLowerCase();
        
        if (effectStat.includes('luck')) {
          stats.luck += baseMultiplier;
        }
        if (effectStat.includes('dig strength')) {
          stats.digStrength += baseMultiplier;
        }
        if (effectStat.includes('dig speed')) {
          stats.digSpeed += baseMultiplier;
        }
        if (effectStat.includes('shake strength')) {
          stats.shakeStrength += baseMultiplier;
        }
        if (effectStat.includes('shake speed')) {
          stats.shakeSpeed += baseMultiplier;
        }
        if (effectStat.includes('capacity')) {
          stats.capacity += baseMultiplier;
        }
        if (effectStat.includes('sell boost')) {
          stats.sellBoost += baseMultiplier;
        }
        if (effectStat.includes('size boost')) {
          stats.sizeBoost += baseMultiplier;
        }
        if (effectStat.includes('modifier boost')) {
          stats.modifierBoost += baseMultiplier;
        }
      }

      // Apply modifier effects separately
      if (slot.modifier) {
        const modifier = modifiers.find(m => m.name === slot.modifier);
        if (modifier) {
          const modifierValue = getModifierBonus(ore.rarity);
          
          switch (modifier.effect) {
            case 'Dig Speed':
              stats.digSpeed += modifierValue;
              break;
            case 'Shake Strength':
              stats.shakeStrength += modifierValue;
              break;
            case 'Shake Speed':
              stats.shakeSpeed += modifierValue;
              break;
            case 'Dig Strength':
              stats.digStrength += modifierValue;
              break;
            case 'Luck':
              stats.luck += modifierValue;
              break;
            case 'Modifier Boost':
              stats.modifierBoost += modifierValue;
              break;
            case 'Dig and Shake Speed':
              stats.digSpeed += modifierValue;
              stats.shakeSpeed += modifierValue;
              break;
            case 'Luck and Capacity':
              stats.luck += modifierValue;
              stats.capacity += modifierValue;
              break;
          }
        }
      }
    });

    return stats;
  };

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`;
  };

  const groupSlotsByRarity = () => {
    const grouped: { [key: string]: MuseumSlot[] } = {};
    
    const raritySlotCounts = {
      'Exotic': 1,
      'Mythic': 2,
      'Legendary': 3,
      'Epic': 3,
      'Rare': 3,
      'Uncommon': 3,
      'Common': 3
    };

    Object.entries(raritySlotCounts).forEach(([rarity, slotsCount]) => {
      grouped[rarity] = [];
      
      for (let slotIndex = 0; slotIndex < slotsCount; slotIndex++) {
        const slotId = `${rarity.toLowerCase()}-${slotIndex}`;
        const existingSlot = museumSlots.find(s => s.id === slotId);
        grouped[rarity].push(existingSlot || { id: slotId });
      }
    });

    return grouped;
  };

  const museumStats = calculateMuseumStats();
  const groupedSlots = groupSlotsByRarity();
  
  // Get already used ores
  const usedOres = useMemo(() => {
    const used = new Set<string>();
    museumSlots.forEach(slot => {
      if (slot.ore) used.add(slot.ore);
    });
    return used;
  }, [museumSlots]);

  // Get museum overview data grouped by rarity (rarest to common)
  const getMuseumOverview = () => {
    const rarityOrder = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
    
    const overviewData = museumSlots
      .filter(slot => slot.ore)
      .map(slot => {
        const ore = ores.find(o => o.name === slot.ore);
        if (!ore) return null;
        
        const modifier = slot.modifier ? modifiers.find(m => m.name === slot.modifier) : null;
        const modifierBonus = modifier ? getModifierBonus(ore.rarity) : 0;
        
        return {
          ore: ore.name,
          rarity: ore.rarity,
          effect: ore.museumEffect.stat,
          maxMultiplier: ore.museumEffect.maxMultiplier,
          modifier: modifier?.name,
          modifierEffect: modifier?.effect,
          modifierBonus,
          weight: slot.weight,
          specialEffects: ore.specialEffects
        };
      })
      .filter(Boolean);

    // Group by rarity and sort by rarity order
    const grouped = rarityOrder.reduce((acc, rarity) => {
      const oresOfRarity = overviewData.filter(item => item?.rarity === rarity);
      if (oresOfRarity.length > 0) {
        acc[rarity] = oresOfRarity.sort((a, b) => (a?.ore ?? '').localeCompare(b?.ore ?? ''));
      }
      return acc;
    }, {} as Record<string, typeof overviewData>);

    return grouped;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('museum')} (beta)</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <List size={16} />
              <span className="hidden sm:inline">{t('overview')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('museumOverview')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {Object.keys(getMuseumOverview()).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('noOresInMuseum')}
                </p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(getMuseumOverview()).map(([rarity, ores]) => (
                    <div key={rarity} className="space-y-0.5">
                      <h3 className={`font-semibold text-lg ${getRarityClass(rarity)}`}>
                        {rarity}
                      </h3>
                      <div className="space-y-0.25 border-l-2 border-muted pl-2">
                        {ores.map((item, index) => (
                          <div key={index} className="text-sm py-1 border-b border-muted-foreground/10 last:border-b-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className={`font-medium ${getRarityClass(item?.rarity || '')} break-words`}>
                                  {item?.ore}
                                </span>
                                {item?.modifier && (
                                  <span className="text-accent text-xs font-medium bg-accent/10 px-2 py-1 rounded flex-shrink-0">
                                    {item.modifier}
                                  </span>
                                )}
                                {item?.weight && (
                                  <span className="text-muted-foreground text-xs flex-shrink-0">
                                    {item.weight}kg
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground text-left sm:text-right sm:ml-2 flex-shrink-0">
                                {item?.effect}: +{item?.maxMultiplier}x
                                {item?.modifier && (
                                  <div>
                                    {item.modifierEffect}: +{item.modifierBonus}x
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {Object.entries(groupedSlots).map(([rarity, slots]) => (
            <Card key={rarity}>
              <CardHeader>
                <CardTitle className={`${getRarityClass(rarity)} flex items-center gap-2`}>
                  <span>{rarity} Ores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot, index) => (
                    <Card key={slot.id} className="relative">
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                              {t('displayCase')} {index + 1}
                            </Label>
                            {slot.ore && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => clearSlot(slot.id)}
                                className="h-6 w-6 p-0"
                                disabled={isLoading}
                              >
                                <X size={12} />
                              </Button>
                            )}
                          </div>

                          <Select
                            value={slot.ore || ''}
                            onValueChange={(value) => updateSlot(slot.id, { ore: value || undefined })}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Select ore">
                                {slot.ore}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-w-xs sm:max-w-sm">
                              {ores
                                .filter(ore => ore.rarity === rarity)
                                .map(ore => {
                                  let statInfo = `${ore.museumEffect.stat}: +${ore.museumEffect.maxMultiplier}x`;
                                  
                                  // If ore has special effects, show them instead
                                  if (ore.specialEffects) {
                                    const effects = Object.entries(ore.specialEffects)
                                      .map(([stat, value]) => {
                                        const displayStat = stat.replace(/([A-Z])/g, ' $1').toLowerCase();
                                        return `${displayStat}: ${value > 0 ? '+' : ''}${value}x`;
                                      })
                                      .join(', ');
                                    statInfo = effects;
                                  }
                                  
                                  return (
                                    <SelectItem 
                                      key={ore.name} 
                                      value={ore.name}
                                      disabled={usedOres.has(ore.name) && slot.ore !== ore.name}
                                      className="flex-col items-start"
                                    >
                                      <div className="w-full">
                                        <div className="flex items-center justify-between w-full mb-1">
                                          <span className="font-medium">{ore.name}</span>
                                          {usedOres.has(ore.name) && slot.ore !== ore.name && (
                                            <span className="text-xs text-muted-foreground ml-1">(Used)</span>
                                          )}
                                        </div>
                                        <div className="text-muted-foreground text-xs break-words whitespace-normal">
                                          {statInfo}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>

                          {slot.ore && (
                            <>
                              <div className="flex gap-1">
                                <Select
                                  value={slot.modifier || ''}
                                  onValueChange={(value) => updateSlot(slot.id, { modifier: value || undefined })}
                                  disabled={isLoading}
                                >
                                  <SelectTrigger className="text-xs flex-1">
                                    <SelectValue placeholder="Select modifier">
                                      {slot.modifier}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {modifiers.map(modifier => (
                                      <SelectItem key={modifier.name} value={modifier.name}>
                                        {modifier.name} - {modifier.effect}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {slot.modifier && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateSlot(slot.id, { modifier: undefined })}
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                    disabled={isLoading}
                                  >
                                    <X size={12} />
                                  </Button>
                                )}
                              </div>

                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="Weight (kg)"
                                value={slot.weight !== undefined ? slot.weight.toString() : ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || value === null) {
                                    updateSlot(slot.id, { weight: undefined });
                                  } else {
                                    const numValue = parseFloat(value);
                                    if (!isNaN(numValue) && numValue >= 0) {
                                      updateSlot(slot.id, { weight: numValue });
                                    }
                                  }
                                }}
                                className="text-xs"
                                disabled={isLoading}
                              />

                              <div className="text-xs text-muted-foreground">
                                {(() => {
                                  const ore = ores.find(o => o.name === slot.ore);
                                  if (!ore) return null;
                                  
                                  if (ore.specialEffects) {
                                    // Show all special effects
                                    return Object.entries(ore.specialEffects).map(([stat, value], index) => {
                                      const displayStat = stat.replace(/([A-Z])/g, ' $1').toLowerCase();
                                      return (
                                        <div key={stat}>
                                          {displayStat}: {value > 0 ? '+' : ''}{value}x
                                        </div>
                                      );
                                    });
                                  } else {
                                    // Show normal museum effect
                                    return (
                                      <>
                                        {ore.museumEffect.stat}: +{ore.museumEffect.maxMultiplier}x
                                      </>
                                    );
                                  }
                                })()}
                                {slot.modifier && (
                                  <div>
                                    {modifiers.find(m => m.name === slot.modifier)?.effect}: +{getModifierBonus(ores.find(o => o.name === slot.ore)?.rarity || 'Common')}x
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>{t('museumStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(museumStats).map(([stat, value]) => (
                <div key={stat} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-mono text-accent">
                    {value > 0 ? "+" : ""}{value.toFixed(3)}x
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