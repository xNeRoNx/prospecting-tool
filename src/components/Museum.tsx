import { useState } from 'react';
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
    
    // Common: 3 slots each
    ['Common'].forEach(rarity => {
      for (let i = 0; i < 30; i++) { // 10 common ores * 3 slots each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
      }
    });
    
    // Uncommon: 3 slots each  
    ['Uncommon'].forEach(rarity => {
      for (let i = 0; i < 24; i++) { // 8 uncommon ores * 3 slots each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
      }
    });
    
    // Rare: 3 slots each
    ['Rare'].forEach(rarity => {
      for (let i = 0; i < 30; i++) { // 10 rare ores * 3 slots each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
      }
    });
    
    // Epic: 3 slots each
    ['Epic'].forEach(rarity => {
      for (let i = 0; i < 36; i++) { // 12 epic ores * 3 slots each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
      }
    });
    
    // Legendary: 3 slots each
    ['Legendary'].forEach(rarity => {
      for (let i = 0; i < 42; i++) { // 14 legendary ores * 3 slots each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
      }
    });
    
    // Mythic: 2 slots each
    ['Mythic'].forEach(rarity => {
      for (let i = 0; i < 18; i++) { // 9 mythic ores * 2 slots each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
      }
    });
    
    // Exotic: 1 slot each
    ['Exotic'].forEach(rarity => {
      for (let i = 0; i < 3; i++) { // 3 exotic ores * 1 slot each
        slots.push({ id: `${rarity.toLowerCase()}-${i}`, ore: undefined, modifier: undefined });
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

      let baseMultiplier = ore.museumEffect.maxMultiplier;
      
      // Add modifier bonus if present
      if (slot.modifier) {
        baseMultiplier += getModifierBonus(ore.rarity);
      }

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

      // Handle special cases
      if (ore.name === 'Flarebloom') {
        stats.luck += 1;
        stats.sizeBoost -= 0.5;
      }
      if (ore.name === 'Cryogenic Artifact') {
        stats.digStrength += 1.5;
        stats.shakeStrength += 1.5;
        stats.digSpeed -= 1;
        stats.shakeSpeed -= 1;
      }
      if (ore.name === 'Prismara') {
        stats.luck += 0.25;
        stats.capacity += 0.25;
        stats.digStrength += 0.25;
        stats.shakeStrength += 0.25;
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

    Object.entries(raritySlotCounts).forEach(([rarity, slotsPerOre]) => {
      const rarityOres = ores.filter(ore => ore.rarity === rarity);
      
      grouped[rarity] = [];
      rarityOres.forEach((ore, oreIndex) => {
        for (let slotIndex = 0; slotIndex < slotsPerOre; slotIndex++) {
          const slotId = `${rarity.toLowerCase()}-${oreIndex * slotsPerOre + slotIndex}`;
          const existingSlot = museumSlots.find(s => s.id === slotId);
          grouped[rarity].push(existingSlot || { id: slotId });
        }
      });
    });

    return grouped;
  };

  const museumStats = calculateMuseumStats();
  const groupedSlots = groupSlotsByRarity();

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
                                  <SelectItem key={ore.name} value={ore.name}>
                                    {ore.name}
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
          <Card>
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