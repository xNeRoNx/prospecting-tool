import { type StatMap, type EquipmentStats, type EventMultipliers } from './types';
import { shovels, pans, enchants, potions, events, getItemByReference } from '@/lib/gameData';

const PRE_EVENTS = ["Luck Totem", "Strength Totem", "Luminant Totem", "Candy Corn", "Ghost Gummy"];
// Any event not listed in PRE_EVENTS will be treated as a post-museum multiplier by default.

export function formatStatValue(key: string, value: number): string {
  const suffix = key.includes('Speed') || key.includes('Boost') ? '%' : '';
  const small = Math.abs(value) < 10;
  let str = value.toFixed(small ? 2 : 1);
  if (small) {
    str = str.replace(/(\.\d)0$/, '$1');
  }
  return `${str}${suffix}`;
}

export function separateEventMultipliers(activeEvents: string[]): EventMultipliers {
  const preTotals: StatMap = {};
  const postTotals: StatMap = {};

  activeEvents.forEach(name => {
    const event = events.find(e => e.name === name);
    if (!event) return;
    // If an event is a PRE event, apply it before museum multipliers; otherwise treat it as POST.
    const target = PRE_EVENTS.includes(name) ? preTotals : postTotals;
    Object.entries(event.effects).forEach(([stat, mult]) => {
      const add = mult - 1;
      target[stat] = (target[stat] || 0) + add;
    });
  });

  return { preTotals, postTotals };
}

export function formatPrice(price: number, isCandy?: boolean): string {
  if (isCandy) {
    return `${price.toLocaleString()} Candy`;
  }
  return `$${price.toLocaleString()}`;
}

interface Equipment {
  shovel: string | null;
  pan: string | null;
  enchant: string | null;
  customStats: StatMap;
  activePotions: string[];
  rings: any[];
  ringsSix?: boolean[];
  necklace: any;
  necklaceSix?: boolean;
  charm: any;
  charmSix?: boolean;
}

export function calculateBaseStats(equipment: Equipment): EquipmentStats {
  const stats: EquipmentStats = {
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

  // 3) Enchant
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

  // Helper to get correct tier stats
  const getItemStatsForTier = (item: any, useSix?: boolean) => 
    useSix && item.sixStarStats ? item.sixStarStats : item.stats;

  // 6) Equipment Items
  equipment.rings.forEach((itemRef, idx) => {
    if (!itemRef) return;
    const item = getItemByReference(itemRef);
    if (!item) return;
    const useSix = equipment.ringsSix?.[idx] ?? false;
    const selected = getItemStatsForTier(item, useSix);
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

  return stats;
}

export function calculateLuckEfficiency(
  total_luck: number,
  total_capacity: number,
  total_dig_strength: number,
  total_dig_speed_pct: number,
  total_shake_strength: number,
  total_shake_speed_pct: number,
  dig_constant = 2.0,
  shake_constant = 0.35,
  time_constant = 4.0
): number {
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
}

export function applyEventMultipliers(
  baseStats: EquipmentStats,
  museumBonuses: StatMap,
  preTotals: StatMap,
  postTotals: StatMap
): { finalStats: EquipmentStats; eventStats: EquipmentStats } {
  // 1) Apply PRE on base
  const baseWithPre: StatMap = Object.keys(baseStats).reduce((acc, key) => {
    const base = baseStats[key] || 0;
    const preAdd = preTotals[key] || 0;
    acc[key] = base * (1 + preAdd);
    return acc;
  }, {} as StatMap);

  // 2) Add museum to (base with pre)
  const finalBeforePost: StatMap = Object.keys(baseStats).reduce((acc, key) => {
    const base = baseStats[key] || 0;
    const museumMult = museumBonuses[key] || 0;
    acc[key] = (baseWithPre[key] || 0) + (base * museumMult);
    return acc;
  }, {} as StatMap);

  // 3) Apply POST to the museum-adjusted result
  const eventStats: StatMap = Object.keys(finalBeforePost).reduce((acc, key) => {
    const val = finalBeforePost[key] || 0;
    const postAdd = postTotals[key] || 0;
    acc[key] = val * (1 + postAdd);
    return acc;
  }, {} as StatMap);

  return {
    finalStats: finalBeforePost as EquipmentStats,
    eventStats: eventStats as EquipmentStats
  };
}

export function getRarityClass(rarity: string): string {
  return `rarity-${rarity.toLowerCase()}`;
}

export function sortByRarity<T extends { rarity: string }>(items: T[]): T[] {
  const rarityOrder: { [key: string]: number } = {
    'Exotic': 0,
    'Mythic': 1,
    'Legendary': 2,
    'Epic': 3,
    'Rare': 4,
    'Uncommon': 5,
    'Common': 6
  };

  return items.sort((a, b) => {
    const orderA = rarityOrder[a.rarity] ?? 999;
    const orderB = rarityOrder[b.rarity] ?? 999;
    return orderA - orderB;
  });
}
