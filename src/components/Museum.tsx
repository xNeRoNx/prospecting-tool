import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import type { MuseumSlot } from '@/hooks/useAppData';
import { ores, modifiers, getModifierBonus } from '@/lib/gameData';

export function Museum() {
  const { t } = useLanguage();
  const { museumSlots, setMuseumSlots } = useAppData();

  const initializeMuseumSlots = () => {
    const slots: MuseumSlot[] = [];
    
    // Get slot counts for each rarity
    const raritySlotCounts = {
      'Common': 3,
      'Uncommon': 3, 
      'Rare': 3,
      'Epic': 3,
      'Legendary': 3,
      'Mythic': 2,
      'Exotic': 1
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

  // Initialize museum slots if empty
  if (museumSlots.length === 0) {
    const initialSlots = initializeMuseumSlots();
    setMuseumSlots(initialSlots);
  }

  const updateSlot = (id: string, updates: Partial<MuseumSlot>) => {
    // Check if trying to place the same ore in different slots
    if (updates.ore) {
      const existingOreSlot = museumSlots.find(slot => slot.ore === updates.ore && slot.id !== id);
      if (existingOreSlot) {
        // Don't allow duplicate ores in different slots
        return;
      }
    }
    
    setMuseumSlots(current => 
      current.map(slot => 
        slot.id === id ? { ...slot, ...updates } : slot
      )
    );
  };

  const clearSlot = (id: string) => {
    setMuseumSlots(current =>
      current.map(slot =>
        slot.id === id 
          ? { ...slot, ore: undefined, modifier: undefined, weight: undefined }
          : slot
      )
    );
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
      'Common': 3,
      'Uncommon': 3,
      'Rare': 3,
      'Epic': 3,
      'Legendary': 3,
      'Mythic': 2,
      'Exotic': 1
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('museum')}</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {Object.entries(groupedSlots).map(([rarity, slots]) => (
            <Card key={rarity}>
              <CardHeader>
                <CardTitle className={`${getRarityClass(rarity)} flex items-center gap-2`}>
                  <Badge className={getRarityClass(rarity)} variant="outline">
                    {rarity}
                  </Badge>
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
                              >
                                <X size={12} />
                              </Button>
                            )}
                          </div>

                          <Select
                            value={slot.ore || ''}
                            onValueChange={(value) => updateSlot(slot.id, { ore: value || undefined })}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Select ore" />
                            </SelectTrigger>
                            <SelectContent>
                              {ores
                                .filter(ore => ore.rarity === rarity)
                                .map(ore => (
                                  <SelectItem 
                                    key={ore.name} 
                                    value={ore.name}
                                    disabled={usedOres.has(ore.name) && slot.ore !== ore.name}
                                  >
                                    {ore.name} {usedOres.has(ore.name) && slot.ore !== ore.name ? '(Used)' : ''}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {slot.ore && (
                            <>
                              <Select
                                value={slot.modifier || ''}
                                onValueChange={(value) => updateSlot(slot.id, { modifier: value || undefined })}
                              >
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Select modifier" />
                                </SelectTrigger>
                                <SelectContent>
                                  {modifiers.map(modifier => (
                                    <SelectItem key={modifier.name} value={modifier.name}>
                                      {modifier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="Weight (kg)"
                                value={slot.weight || ''}
                                onChange={(e) => updateSlot(slot.id, { 
                                  weight: parseFloat(e.target.value) || undefined 
                                })}
                                className="text-xs"
                              />

                              <div className="text-xs text-muted-foreground">
                                {ores.find(o => o.name === slot.ore)?.museumEffect.stat}
                                <br />
                                Max: {ores.find(o => o.name === slot.ore)?.museumEffect.maxMultiplier}x
                                {slot.modifier && (
                                  <>
                                    <br />
                                    +{getModifierBonus(ores.find(o => o.name === slot.ore)?.rarity || 'Common')}x modifier
                                  </>
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
                    +{value.toFixed(3)}x
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