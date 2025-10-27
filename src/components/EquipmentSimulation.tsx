import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Calculator, Calendar, Flask } from '@phosphor-icons/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import { craftableItems, shovels, pans, enchants, potions, events, availableStats, type CraftableItem, getItemByReference, createItemReference } from '@/lib/gameData';
import { calculateMuseumBonuses as sharedCalculateMuseumBonuses } from '@/lib/museumUtils';

export function EquipmentSimulation() {
  const { t } = useLanguage();
  const { isLoading, equipment, setEquipment, museumSlots } = useAppData();
  const [customStatName, setCustomStatName] = useState('');
  const [customStatValue, setCustomStatValue] = useState(0);

  const updateEquipment = (updates: Partial<typeof equipment>) => {
    setEquipment((prev: typeof equipment) => ({ ...prev, ...updates }));
  };

  // 5★/6★ helpers
  const getItemStatsForTier = (item: CraftableItem, useSix?: boolean) => 
    useSix && item.sixStarStats ? item.sixStarStats : item.stats;

  const isRingSix = (index: number) => equipment.ringsSix?.[index] ?? false;
  const setRingSix = (index: number, value: boolean) => {
    const current = [...(equipment.ringsSix ?? new Array(equipment.rings.length).fill(false))];
    current[index] = value;
    updateEquipment({ ringsSix: current });
  };
  const massSetRingsSix = (value: boolean) => {
    const current = new Array(equipment.rings.length).fill(value);
    updateEquipment({ ringsSix: current });
  };
    
    // If item doesn't exist in gameData anymore, it's outdated
  const equipItem = (item: CraftableItem, position: 'rings' | 'necklace' | 'charm', slotIndex?: number) => {
    const reference = createItemReference(item);
    if (position === 'rings' && typeof slotIndex === 'number') {
      const newRings = [...equipment.rings];
      newRings[slotIndex] = reference;
      updateEquipment({ rings: newRings });
    } else if (position === 'necklace') {
      updateEquipment({ necklace: reference });
    } else if (position === 'charm') {
      updateEquipment({ charm: reference });
    }
  };

  const unequipItem = (position: 'rings' | 'necklace' | 'charm', slotIndex?: number) => {
    if (position === 'rings' && typeof slotIndex === 'number') {
      const newRings = [...equipment.rings];
      newRings[slotIndex] = null as any;
      updateEquipment({ rings: newRings });
    } else if (position === 'necklace') {
      updateEquipment({ necklace: null });
    } else if (position === 'charm') {
      updateEquipment({ charm: null });
    }
  };

  const addCustomStat = () => {
    if (!customStatName.trim() || customStatValue === 0) return;
    
    // Validate against available stats
    if (!availableStats.includes(customStatName as any)) return;
    
    updateEquipment({
      customStats: {
        ...equipment.customStats,
        [customStatName]: (equipment.customStats[customStatName] || 0) + customStatValue
      }
    });
    
    setCustomStatName('');
    setCustomStatValue(0);
  };

  const togglePotion = (potionName: string) => {
    const currentPotions = equipment.activePotions || [];
    const isActive = currentPotions.includes(potionName);
    
    if (isActive) {
      updateEquipment({
        activePotions: currentPotions.filter(p => p !== potionName)
      });
    } else {
      updateEquipment({
        activePotions: [...currentPotions, potionName]
      });
    }
  };

  const toggleEvent = (eventName: string) => {
    const currentEvents = equipment.activeEvents || [];
    const isActive = currentEvents.includes(eventName);
    
    if (isActive) {
      updateEquipment({
        activeEvents: currentEvents.filter(e => e !== eventName)
      });
    } else {
      updateEquipment({
        activeEvents: [...currentEvents, eventName]
      });
    }
  };

  const removeCustomStat = (statName: string) => {
    const newStats = { ...equipment.customStats };
    delete newStats[statName];
    updateEquipment({ customStats: newStats });
  };

  // - Luck Totem and Strength Totem are PRE-museum: they scale only base stats (before adding museum bonuses)
  // - Meteor Shower and Admin Shower are POST-museum: they scale the result after applying museum bonuses
  // In gameData, effects are stored as values (e.g., 2 means 2x). We treat this as a multiplier.
  const PRE_EVENTS = ["Luck Totem", "Strength Totem"]; // base only
  const POST_EVENTS = ["Meteor Shower", "Admin Shower", "Perfect Dig", "Blizzard", "Codes", "Daily luck bonus", "Friends"]; // after museum

  interface StatMap { [key: string]: number }

  const separateEventMultipliers = () => {
  const active = equipment.activeEvents || [];
  const preTotals: StatMap = {};  // stores the sum of (mult-1) for pre
  const postTotals: StatMap = {}; // stores the sum of (mult-1) for post

    active.forEach(name => {
      const event = events.find(e => e.name === name);
      if (!event) return;
      const target = PRE_EVENTS.includes(name) ? preTotals : POST_EVENTS.includes(name) ? postTotals : null;
      if (!target) return;
      Object.entries(event.effects).forEach(([stat, mult]) => {
        const add = mult - 1; // e.g., 2x => +1 additively
        target[stat] = (target[stat] || 0) + add;
      });
    });
    return { preTotals, postTotals };
  };

  const { preTotals, postTotals } = separateEventMultipliers();

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

    // 1) Shovel
    if (equipment.shovel) {
      const shovel = shovels.find(s => s.name === equipment.shovel);
      if (shovel) {
        stats.digStrength += shovel.stats.digStrength;
        stats.digSpeed += shovel.stats.digSpeed;
        stats.toughness += shovel.stats.toughness;
      }
    }

    // 2) Pan
    if (equipment.pan) {
      const pan = pans.find(p => p.name === equipment.pan);
      if (pan) {
        stats.luck += pan.stats.luck;
        stats.capacity += pan.stats.capacity;
        stats.shakeStrength += pan.stats.shakeStrength;
        stats.shakeSpeed += pan.stats.shakeSpeed;
        // Passive parsing (size / modifier boosts)
        if (pan.passive) {
          if (pan.passive.includes('Size boost')) {
            const match = pan.passive.match(/\(([+-]\d+)%\)/);
            if (match) stats.sizeBoost += parseInt(match[1]);
          }
          if (pan.passive.includes('Modifier boost')) {
            const match = pan.passive.match(/\(([+-]\d+)%\)/);
            if (match) stats.modifierBoost += parseInt(match[1]);
          }
        }
      }
    }

    // 3) Enchant (depends on having selected enchant regardless of pan presence)
    if (equipment.enchant) {
      const enchant = enchants.find(e => e.name === equipment.enchant);
      if (enchant) {
        Object.entries(enchant.effects).forEach(([key, value]) => {
          if (stats[key] !== undefined) stats[key] += value;
        });
      }
    }

    // 4) Custom Stats
    Object.entries(equipment.customStats).forEach(([key, value]) => {
      if (stats[key] !== undefined) stats[key] += value; else stats[key] = value;
    });

    // 5) Potions
    const activePotions = equipment.activePotions || [];
    activePotions.forEach(potionName => {
      const potion = potions.find(p => p.name === potionName);
      if (potion) {
        Object.entries(potion.effects).forEach(([key, value]) => {
          if (stats[key] !== undefined) stats[key] += value;
        });
      }
    });

    // 6) Equipment Items (rings, necklace, charm) using max roll values, respecting 5★/6★ selection
    equipment.rings.forEach((itemRef, idx) => {
      if (!itemRef) return;
      const item = getItemByReference(itemRef);
      if (!item) return;
      const selected = getItemStatsForTier(item, isRingSix(idx));
      Object.entries(selected).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          const maxValue = value[1];
          if (stats[key] !== undefined) stats[key] += maxValue; else stats[key] = maxValue;
        }
      });
    });
    if (equipment.necklace) {
      const item = getItemByReference(equipment.necklace);
      if (item) {
        const selected = getItemStatsForTier(item, equipment.necklaceSix);
        Object.entries(selected).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            const maxValue = value[1];
            if (stats[key] !== undefined) stats[key] += maxValue; else stats[key] = maxValue;
          }
        });
      }
    }
    if (equipment.charm) {
      const item = getItemByReference(equipment.charm);
      if (item) {
        const selected = getItemStatsForTier(item, equipment.charmSix);
        Object.entries(selected).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            const maxValue = value[1];
            if (stats[key] !== undefined) stats[key] += maxValue; else stats[key] = maxValue;
          }
        });
      }
    }

    return stats; // Museum & Events applied later
  };

  // Toggle for museum mode (max vs weight placeholder)
  const [showMaxMuseum, setShowMaxMuseum] = useState(true);

  // Maximum museum bonuses (depend only on museum slots)
  const museumBonusesMax = sharedCalculateMuseumBonuses(museumSlots);

  // Placeholder bonuses in weight mode (0)
  const museumBonusesWeight = {
    luck: 0, digStrength: 0, digSpeed: 0, shakeStrength: 0, shakeSpeed: 0,
    capacity: 0, sellBoost: 0, sizeBoost: 0, modifierBoost: 0
  };

  const museumBonusesDisplayed = showMaxMuseum ? museumBonusesMax : museumBonusesWeight;

  // Base
  const baseStats = calculateBaseStats();

  // 1) Apply PRE (Luck/Strength Totem) only on base
  const baseWithPre: { [key: string]: number } = Object.keys(baseStats).reduce((acc, key) => {
    const base = baseStats[key] || 0;
    const preAdd = preTotals[key] || 0; // additively: final = base * (1 + sum)
    acc[key] = base * (1 + preAdd);
    return acc;
  }, {} as { [key: string]: number });

  // 2) Add museum to (base with pre) — the museum still works as a percentage of (base without pre)
  // According to the description: totems affect only the base, so museum should be computed from the original base (without pre),
  // not from the base increased by pre. (Interpretation: PRE does not amplify the museum effect.)
  // Formula: finalBeforePost = baseWithPre + (base * museumMultiplier)
  const finalBeforePost: { [key: string]: number } = Object.keys(baseStats).reduce((acc, key) => {
    const base = baseStats[key] || 0;
    const museumMult = museumBonusesDisplayed[key] || 0;
    acc[key] = (baseWithPre[key] || 0) + (base * museumMult);
    return acc;
  }, {} as { [key: string]: number });

  // 3) Apply POST (Meteor/Admin) to the museum-adjusted result
  const eventStats: { [key: string]: number } = Object.keys(finalBeforePost).reduce((acc, key) => {
    const val = finalBeforePost[key] || 0;
    const postAdd = postTotals[key] || 0;
    acc[key] = val * (1 + postAdd);
    return acc;
  }, {} as { [key: string]: number });

  // For the "withMuseum" section we want to show values without POST (Meteor/Admin)
  const finalStats = finalBeforePost;

  const calculateMuseumBonuses = () => museumBonusesMax; // keep existing calls in the render

  const availableItems = [...craftableItems];

  const getRarityClass = (rarity: string) => {
    return `rarity-${rarity.toLowerCase()}`;
  };

  const formatStatValue = (key: string, value: number) => {
    const suffix = key.includes('Speed') || key.includes('Boost') ? '%' : '';
    const small = Math.abs(value) < 10;
    let str = value.toFixed(small ? 2 : 1);
    if (small) {
      str = str.replace(/(\.\d)0$/, '$1');
    }
    return `${str}${suffix}`;
  };

  const renderItemStats = (item: CraftableItem, useSix?: boolean) => {
    if (!item?.stats) return null;
    return (
      <div className="mt-1 space-y-0.5">
        {Object.entries(getItemStatsForTier(item, useSix)).map(([statKey, range]) => {
          if (!Array.isArray(range)) return null;
            const [min, max] = range as [number, number];
            const isPercent = /Speed|Boost/i.test(statKey);
            const label = t(statKey as any) || statKey;
            const fmt = (v: number) => `${v > 0 ? '+' : ''}${v}${isPercent ? '%' : ''}`;
            return (
              <div key={statKey} className="text-[10px] leading-tight text-muted-foreground flex justify-between">
                <span className="truncate pr-1 capitalize">{label}</span>
                <span className="font-mono">{fmt(min)}–{fmt(max)}</span>
              </div>
            );
        })}
      </div>
    );
  };

  const renderShovelStats = () => {
    if (!equipment.shovel) return null;
    const shovel = shovels.find(s => s.name === equipment.shovel);
    if (!shovel) return null;
    const entries: [string, number][] = [
      ['digStrength', shovel.stats.digStrength],
      ['digSpeed', shovel.stats.digSpeed],
      ['toughness', shovel.stats.toughness]
    ];
    return (
      <div className="mt-3 space-y-0.5">
        {entries.map(([k,v]) => (
          <div key={k} className="flex justify-between text-[11px] text-muted-foreground">
            <span className="capitalize">{t(k as any) || k}</span>
            <span className="font-mono">{formatStatValue(k, v)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderPanStats = () => {
    if (!equipment.pan) return null;
    const panObj = pans.find(p => p.name === equipment.pan);
    if (!panObj) return null;
    const entries: [string, number][] = [
      ['luck', panObj.stats.luck],
      ['capacity', panObj.stats.capacity],
      ['shakeStrength', panObj.stats.shakeStrength],
      ['shakeSpeed', panObj.stats.shakeSpeed]
    ];
    const enchantEffects = equipment.enchant ? enchants.find(e => e.name === equipment.enchant)?.effects : undefined;
    return (
      <div className="mt-3 space-y-0.5">
        {entries.map(([k,v]) => (
          <div key={k} className="flex justify-between text-[11px] text-muted-foreground">
            <span className="capitalize">{t(k as any) || k}</span>
            <span className="font-mono">{formatStatValue(k, v)}</span>
          </div>
        ))}
        {panObj.passive && (
          <div className="text-[10px] text-accent mt-1 leading-tight">{panObj.passive}</div>
        )}
        {enchantEffects && (
          <div className="pt-1 border-t border-muted mt-1 space-y-0.5">
            {Object.entries(enchantEffects).map(([k,v]) => (
              <div key={k} className="flex justify-between text-[10px] text-muted-foreground">
                <span className="capitalize">{t(k as any) || k}</span>
                <span className="font-mono">{v > 0 ? '+' : ''}{v}{/Speed|Boost/i.test(k) ? '%' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Luck Efficiency calculation (extracted & optimized) 
  const calculateLuckEfficiency = (
    total_luck: number,
    total_capacity: number,
    total_dig_strength: number,
    total_dig_speed_pct: number, // percent value
    total_shake_strength: number,
    total_shake_speed_pct: number, // percent value
    dig_constant = 2.0,
    shake_constant = 0.35,
    time_constant = 4.0
  ): number => {
    const digSpeed = Math.max(0.0001, total_dig_speed_pct / 100);
    const shakeSpeed = Math.max(0.0001, total_shake_speed_pct / 100);
    const capacity = Math.max(0.0001, total_capacity);
    const digStrength = Math.max(0.0001, total_dig_strength * 1.5);
    const shakeStrength = Math.max(0.0001, total_shake_strength);

    const numerator = total_luck * Math.sqrt(capacity) * 0.625;
    const digCycles = Math.ceil(capacity / digStrength);
    const shakeCycles = Math.ceil(capacity / shakeStrength);
    const dig_component = (dig_constant * digCycles) / digSpeed;
    const shake_component = (shake_constant * shakeCycles) / shakeSpeed;
    const denominator = dig_component + shake_component + time_constant;
    return numerator / Math.max(0.0001, denominator);
  };

  const luckEfficiencyValue = (() => {
    const luck = eventStats.luck || 0;
    const capacity = eventStats.capacity || 0;
    const digStrength = eventStats.digStrength || 0;
    const digSpeed = eventStats.digSpeed || 0; // percent
    const shakeStrength = eventStats.shakeStrength || 0;
    const shakeSpeed = eventStats.shakeSpeed || 0; // percent
    const result = calculateLuckEfficiency(luck, capacity, digStrength, digSpeed, shakeStrength, shakeSpeed);
    return isNaN(result) ? '' : result.toFixed(1);
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('equipment')} (beta)</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
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
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shovel">
                      {equipment.shovel || "Select shovel"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shovels.map(shovel => {
                      const statsList = [
                        `${t('digStrength')}: ${shovel.stats.digStrength}`,
                        `${t('digSpeed')}: ${shovel.stats.digSpeed}%`,
                        `${t('toughness')}: ${shovel.stats.toughness}`
                      ];
                      
                      return (
                        <SelectItem key={shovel.name} value={shovel.name}>
                          <div className="flex flex-col items-start gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{shovel.name} - ${shovel.price.toLocaleString()}</span>
                              {shovel.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {statsList.join(', ')}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {renderShovelStats()}
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
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pan">
                        {equipment.pan || "Select pan"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {pans.map(pan => {
                        const statsList = [
                          `${t('luck')}: ${pan.stats.luck}`,
                          `${t('capacity')}: ${pan.stats.capacity}`,
                          `${t('shakeStrength')}: ${pan.stats.shakeStrength}`,
                          `${t('shakeSpeed')}: ${pan.stats.shakeSpeed}%`
                        ];
                        
                        // Split into chunks of 3
                        const chunks: string[][] = [];
                        for (let i = 0; i < statsList.length; i += 3) {
                          chunks.push(statsList.slice(i, i + 3));
                        }
                        
                        return (
                          <SelectItem key={pan.name} value={pan.name}>
                            <div className="flex flex-col items-start gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{pan.name} - ${pan.price.toLocaleString()}</span>
                                {pan.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {chunks.map((chunk, idx) => (
                                  <div key={idx}>{chunk.join(', ')}</div>
                                ))}
                              {pan.passive && <div>{pan.passive}</div>}
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {equipment.pan && (
                    <div className="flex items-start gap-2">
                      <Select
                        value={equipment.enchant || ''}
                        onValueChange={(value) => updateEquipment({ enchant: value || null })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select enchant">
                            {equipment.enchant || "Select enchant"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {enchants.map(enchant => {
                            const statsEntries = Object.entries(enchant.effects);
                            const statsList = statsEntries
                              .map(([stat, val]) => {
                                const isPercent = /Speed|Boost/i.test(stat);
                                return `${t(stat as keyof typeof t)}: ${val > 0 ? '+' : ''}${val}${isPercent ? '%' : ''}`;
                              });
                            
                            // Split into chunks of 3
                            const chunks: string[][] = [];
                            for (let i = 0; i < statsList.length; i += 3) {
                              chunks.push(statsList.slice(i, i + 3));
                            }
                            
                            return (
                              <SelectItem key={enchant.name} value={enchant.name}>
                                <div className="flex flex-col items-start gap-0.5">
                                  <span className="font-medium">{enchant.name}</span>
                                  <div className="text-[10px] text-muted-foreground">
                                    {chunks.map((chunk, idx) => (
                                      <div key={idx}>{chunk.join(', ')}</div>
                                    ))}
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {equipment.enchant && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0"
                          onClick={() => updateEquipment({ enchant: null })}
                          disabled={isLoading}
                          title="Clear enchant"
                          aria-label="Clear enchant"
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  )}
                  {renderPanStats()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('rings')} (8)</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>5★</span>
                  <Switch
                    checked={(() => {
                      const arr = (equipment.ringsSix || []) as boolean[];
                      if (!arr.length) return false;
                      return arr.every(Boolean);
                    })()}
                    onCheckedChange={(v)=> massSetRingsSix(v)}
                    aria-label="Toggle all rings to 6★"
                  />
                  <span>6★</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipment.rings.map((ringRef, index) => {
                  const ring = ringRef ? getItemByReference(ringRef) : null;
                  return (
                    <Card key={index} className="relative">
                      <CardContent className="p-3">
                        {ring ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className={getRarityClass(ring.rarity)} variant="outline">
                                {ring.rarity}
                              </Badge>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>5★</span>
                                <Switch checked={isRingSix(index)} onCheckedChange={(v)=> setRingSix(index, v)} aria-label={`Toggle ${ring.name} tier`} />
                                <span>6★</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unequipItem('rings', index)}
                                className="h-6 w-6 p-0"
                                disabled={isLoading}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                            <p className="text-sm font-medium">{ring.name}</p>
                            {renderItemStats(ring, isRingSix(index))}
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
                                .map(item => {
                                  const allStatKeys = new Set<string>();
                                  Object.keys(item.stats || {}).forEach(k => allStatKeys.add(k));
                                  Object.keys(item.sixStarStats || {}).forEach(k => allStatKeys.add(k));
                                  const rows = Array.from(allStatKeys).map(key => {
                                    const baseRange = item.stats?.[key];
                                    const extRange = item.sixStarStats?.[key];
                                    if (!Array.isArray(baseRange)) return null;
                                    const [bMin, bMax] = baseRange as [number, number];
                                    const isPercent = /Speed|Boost/i.test(key);
                                    const fmt = (v: number) => `${v}${isPercent ? '%' : ''}`;
                                    let extPart = '';
                                    if (Array.isArray(extRange)) {
                                      const [eMin, eMax] = extRange as [number, number];
                                      extPart = ` [${fmt(eMin)} - ${fmt(eMax)}]`;
                                    }
                                    return `${t(key as any) || key}: ${fmt(bMin)} - ${fmt(bMax)}${extPart}`;
                                  }).filter(Boolean) as string[];
                                  return (
                                    <Tooltip key={item.name}>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          onClick={() => equipItem(item, 'rings', index)}
                                          className="w-full justify-start"
                                          disabled={isLoading}
                                        >
                                          <Badge className={getRarityClass(item.rarity)} variant="outline">
                                            {item.rarity}
                                          </Badge>
                                          <span className="ml-2 font-medium truncate">{item.name}</span>
                                        </Button>
                                      </TooltipTrigger>
                                      {rows.length > 0 && (
                                        <TooltipContent side="right" className="max-w-xs whitespace-pre-line text-left">
                                          {rows.join('\n')}
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  );
                                })}
                            </div>
                            <p className='text-xs text-muted-foreground'>*{t('statsInfo')}</p>
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
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
                {(() => {
                  const necklace = equipment.necklace ? getItemByReference(equipment.necklace) : null;
                  return necklace ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getRarityClass(necklace.rarity)} variant="outline">
                          {necklace.rarity}
                        </Badge>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>5★</span>
                          <Switch checked={!!equipment.necklaceSix} onCheckedChange={(v)=> updateEquipment({ necklaceSix: v })} aria-label={`Toggle ${necklace.name} tier`} />
                          <span>6★</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unequipItem('necklace')}
                          disabled={isLoading}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                      <p className="font-medium">{necklace.name}</p>
                      {renderItemStats(necklace, equipment.necklaceSix)}
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
                          .map(item => {
                            const allStatKeys = new Set<string>();
                            Object.keys(item.stats || {}).forEach(k => allStatKeys.add(k));
                            Object.keys(item.sixStarStats || {}).forEach(k => allStatKeys.add(k));
                            const rows = Array.from(allStatKeys).map(key => {
                              const baseRange = item.stats?.[key];
                              const extRange = item.sixStarStats?.[key];
                              if (!Array.isArray(baseRange)) return null;
                              const [bMin, bMax] = baseRange as [number, number];
                              const isPercent = /Speed|Boost/i.test(key);
                              const fmt = (v: number) => `${v}${isPercent ? '%' : ''}`;
                              let extPart = '';
                              if (Array.isArray(extRange)) {
                                const [eMin, eMax] = extRange as [number, number];
                                extPart = ` [${fmt(eMin)} - ${fmt(eMax)}]`;
                              }
                              return `${t(key as any) || key}: ${fmt(bMin)} - ${fmt(bMax)}${extPart}`;
                            }).filter(Boolean) as string[];
                            return (
                              <Tooltip key={item.name}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => equipItem(item, 'necklace')}
                                    className="w-full justify-start"
                                    disabled={isLoading}
                                  >
                                    <Badge className={getRarityClass(item.rarity)} variant="outline">
                                      {item.rarity}
                                    </Badge>
                                    <span className="ml-2 font-medium truncate">{item.name}</span>
                                  </Button>
                                </TooltipTrigger>
                                {rows.length > 0 && (
                                  <TooltipContent side="right" className="max-w-xs whitespace-pre-line text-left">
                                    {rows.join('\n')}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            );
                          })}
                      </div>
                      <p className='text-xs text-muted-foreground'>*{t('statsInfo')}</p>
                    </DialogContent>
                  </Dialog>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('charm')}</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const charm = equipment.charm ? getItemByReference(equipment.charm) : null;
                  return charm ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getRarityClass(charm.rarity)} variant="outline">
                          {charm.rarity}
                        </Badge>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>5★</span>
                          <Switch checked={!!equipment.charmSix} onCheckedChange={(v)=> updateEquipment({ charmSix: v })} aria-label={`Toggle ${charm.name} tier`} />
                          <span>6★</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unequipItem('charm')}
                          disabled={isLoading}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                      <p className="font-medium">{charm.name}</p>
                      {renderItemStats(charm, equipment.charmSix)}
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
                          .map(item => {
                            const allStatKeys = new Set<string>();
                            Object.keys(item.stats || {}).forEach(k => allStatKeys.add(k));
                            Object.keys(item.sixStarStats || {}).forEach(k => allStatKeys.add(k));
                            const rows = Array.from(allStatKeys).map(key => {
                              const baseRange = item.stats?.[key];
                              const extRange = item.sixStarStats?.[key];
                              if (!Array.isArray(baseRange)) return null;
                              const [bMin, bMax] = baseRange as [number, number];
                              const isPercent = /Speed|Boost/i.test(key);
                              const fmt = (v: number) => `${v}${isPercent ? '%' : ''}`;
                              let extPart = '';
                              if (Array.isArray(extRange)) {
                                const [eMin, eMax] = extRange as [number, number];
                                extPart = ` [${fmt(eMin)} - ${fmt(eMax)}]`;
                              }
                              return `${t(key as any) || key}: ${fmt(bMin)} - ${fmt(bMax)}${extPart}`;
                            }).filter(Boolean) as string[];
                            return (
                              <Tooltip key={item.name}>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => equipItem(item, 'charm')}
                                    className="w-full justify-start"
                                    disabled={isLoading}
                                  >
                                    <Badge className={getRarityClass(item.rarity)} variant="outline">
                                      {item.rarity}
                                    </Badge>
                                    <span className="ml-2 font-medium truncate">{item.name}</span>
                                  </Button>
                                </TooltipTrigger>
                                {rows.length > 0 && (
                                  <TooltipContent side="right" className="max-w-xs whitespace-pre-line text-left">
                                    {rows.join('\n')}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            );
                          })}
                      </div>
                      <p className='text-xs text-muted-foreground'>*{t('statsInfo')}</p>
                    </DialogContent>
                  </Dialog>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Potions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flask size={20} />
                {t('potions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {potions.map(potion => (
                  <div key={potion.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={potion.name}
                      checked={(equipment.activePotions || []).includes(potion.name)}
                      onCheckedChange={() => togglePotion(potion.name)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={potion.name} className="text-sm">
                      {potion.name}
                    </Label>
                  </div>
                ))}
              </div>
              {(equipment.activePotions || []).length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">{t('activePotions')}:</p>
                  <div className="space-y-1">
                    {(equipment.activePotions || []).map(potionName => {
                      const potion = potions.find(p => p.name === potionName);
                      if (!potion) return null;
                      
                      return (
                        <div key={potionName} className="text-xs">
                          <span className="font-medium">{potion.name}:</span>
                          <span className="ml-1">
                            {Object.entries(potion.effects).map(([stat, value]) => 
                              `${stat.replace(/([A-Z])/g, ' $1').toLowerCase()} +${value}`
                            ).join(', ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                {t('activeEvents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map(event => (
                  <div key={event.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.name}
                      checked={(equipment.activeEvents || []).includes(event.name)}
                      onCheckedChange={() => toggleEvent(event.name)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={event.name} className="text-sm">
                      {event.name}
                    </Label>
                  </div>
                ))}
              </div>
              {(equipment.activeEvents || []).length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">{t('events')}:</p>
                  <div className="space-y-1">
                    {(equipment.activeEvents || []).map(eventName => {
                      const event = events.find(e => e.name === eventName);
                      if (!event) return null;
                      
                      return (
                        <div key={eventName} className="text-xs">
                          <span className="font-medium">{t(eventName.toLowerCase().replace(/\s+/g, '') as any) || eventName}:</span>
                          <span className="ml-1">
                            {Object.entries(event.effects).map(([stat, mult]) => 
                              `${stat.replace(/([A-Z])/g, ' $1').toLowerCase()} ${mult}x`
                            ).join(', ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('customStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={customStatName}
                  onValueChange={setCustomStatName}
                  disabled={isLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select stat to boost" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStats.map(stat => (
                      <SelectItem key={stat} value={stat}>
                        {t(stat as any) || stat.charAt(0).toUpperCase() + stat.slice(1).replace(/([A-Z])/g, ' $1')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Value"
                    value={customStatValue}
                    onChange={(e) => setCustomStatValue(parseFloat(e.target.value) || 0)}
                    className="w-20 sm:w-24"
                    disabled={isLoading}
                  />
                  <Button onClick={addCustomStat} className="flex-shrink-0" disabled={isLoading}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(equipment.customStats).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between bg-muted px-2 py-1 rounded">
                    <span className="text-sm truncate">{t(name as any)}: {value}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeCustomStat(name)}
                      className="flex-shrink-0"
                      disabled={isLoading}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
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
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-accent">{t('withMuseum')}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Weight</span>
                <Switch
                  checked={showMaxMuseum}
                  onCheckedChange={(v) => setShowMaxMuseum(v)}
                  aria-label="Toggle museum mode"
                />
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Max</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(finalStats).map(([stat, value]) => {
                const displayed = showMaxMuseum ? value : baseStats[stat]; // weight mode = base only (placeholder)
                return (
                  <div key={stat} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="font-mono text-accent">
                      {formatStatValue(stat, displayed)}
                    </span>
                  </div>
                );
              })}

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">{t('museumBonuses')}</h4>
                {Object.entries(calculateMuseumBonuses()).map(([stat, bonus]) => {
                  if (bonus === 0) return null;
                  const shownBonus = showMaxMuseum ? bonus : 0; // placeholder for weight mode
                  return (
                    <div key={stat} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-muted-foreground">
                        {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="font-mono text-accent">
                        {shownBonus > 0 ? '+' : ''}{(shownBonus * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
                {!showMaxMuseum && (
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-muted">Placeholder - in weight mode the values are currently set to 0.0%. I'm currently working on adding functionality</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">{t('withEventBonuses')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(eventStats).map(([stat, value]) => (
                <div key={stat} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-mono text-primary">
                    {formatStatValue(stat, value)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Luck Efficiency Calculator */}
          <Card>
            <CardHeader className='flex items-center justify-between'>
              <CardTitle>{t('luckEfficiency')}</CardTitle>
              <span>{luckEfficiencyValue}</span>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
