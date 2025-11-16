import type { MuseumSlot } from '@/hooks/useAppData';
import { ores, modifiers, getModifierBonus, availableStats, type Effects } from '@/lib/gameData';
import { RARITY_SLOT_COUNTS } from './types';

/**
 * Initializes empty museum slots for all rarity tiers.
 * Creates the initial state with undefined ores and modifiers.
 * 
 * @returns Array of empty museum slots
 */
export const initializeMuseumSlots = (): MuseumSlot[] => {
  const slots: MuseumSlot[] = [];
  
  Object.entries(RARITY_SLOT_COUNTS).forEach(([rarity, slotsCount]) => {
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

/**
 * Returns the CSS class name for a given ore rarity.
 * Used for consistent color coding throughout the museum UI.
 * 
 * @param rarity - The ore rarity tier
 * @returns CSS class name (e.g., "rarity-exotic")
 */
export const getRarityClass = (rarity: string): string => {
  return `rarity-${rarity.toLowerCase()}`;
};

/**
 * Groups museum slots by their rarity tier.
 * Ensures all slots exist even if not present in the input array.
 * 
 * @param museumSlots - Array of current museum slots
 * @returns Object with rarity keys and arrays of slots as values
 */
export const groupSlotsByRarity = (museumSlots: MuseumSlot[]) => {
  const grouped: { [key: string]: MuseumSlot[] } = {};

  Object.entries(RARITY_SLOT_COUNTS).forEach(([rarity, slotsCount]) => {
    grouped[rarity] = [];
    
    for (let slotIndex = 0; slotIndex < slotsCount; slotIndex++) {
      const slotId = `${rarity.toLowerCase()}-${slotIndex}`;
      const existingSlot = museumSlots.find(s => s.id === slotId);
      grouped[rarity].push(existingSlot || { id: slotId });
    }
  });

  return grouped;
};

/**
 * Returns a set of ore names that are currently placed in museum slots.
 * Used to prevent duplicate ore placement.
 * 
 * @param museumSlots - Array of current museum slots
 * @returns Set of ore names currently in use
 */
export const getUsedOres = (museumSlots: MuseumSlot[]): Set<string> => {
  const used = new Set<string>();
  museumSlots.forEach(slot => {
    if (slot.ore) used.add(slot.ore);
  });
  return used;
};

/**
 * Calculates museum bonuses (maximum - based on entered weights and selected modifiers).
 * Preserves identical logic as previously duplicated functions in Museum.tsx and EquipmentSimulation.tsx.
 * 
 * @param museumSlots - Array of museum slots with placed ores
 * @returns Object containing all calculated stat bonuses
 */
export function calculateMuseumBonuses(museumSlots: MuseumSlot[]): Effects {
  // Initialize bonuses with all stats set to 0
  const bonuses = availableStats.reduce((acc, stat) => {
    acc[stat] = 0;
    return acc;
  }, {} as Effects) as Required<Effects>;

  museumSlots.forEach(slot => {
    if (!slot.ore) return;
    const ore = ores.find(o => o.name === slot.ore);
    if (!ore) return;

    // Special multi-stat effects
    if (ore.specialEffects) {
      Object.entries(ore.specialEffects).forEach(([stat, value]) => {
        if (availableStats.includes(stat as keyof Effects)) {
          let effectValue = value;
          // Additional bonus for modifier (according to previous logic - added here AND below in switch)
          if (slot.modifier) {
            effectValue += getModifierBonus(ore.rarity);
          }
          bonuses[stat as keyof Effects] += effectValue;
        }
      });
    } else {
      // Regular single-stat effects
      const baseMultiplier = ore.museumEffect.maxMultiplier;
      const effectStat = ore.museumEffect.stat.toLowerCase();
      if (effectStat.includes('luck')) bonuses.luck += baseMultiplier;
      if (effectStat.includes('dig strength')) bonuses.digStrength += baseMultiplier;
      if (effectStat.includes('dig speed')) bonuses.digSpeed += baseMultiplier;
      if (effectStat.includes('shake strength')) bonuses.shakeStrength += baseMultiplier;
      if (effectStat.includes('shake speed')) bonuses.shakeSpeed += baseMultiplier;
      if (effectStat.includes('capacity')) bonuses.capacity += baseMultiplier;
      if (effectStat.includes('sell boost')) bonuses.sellBoost += baseMultiplier;
      if (effectStat.includes('size boost')) bonuses.sizeBoost += baseMultiplier;
      if (effectStat.includes('modifier boost')) bonuses.modifierBoost += baseMultiplier;
    }

    // Modifier effect (separately – may potentially add a second time to one of the stats if the ore has specialEffects)
    if (slot.modifier) {
      const modifier = modifiers.find(m => m.name === slot.modifier);
      if (modifier) {
        const modifierValue = getModifierBonus(ore.rarity);
        switch (modifier.effect) {
          case 'Dig Speed':
            bonuses.digSpeed += modifierValue;
            break;
          case 'Shake Strength':
            bonuses.shakeStrength += modifierValue;
            break;
          case 'Shake Speed':
            bonuses.shakeSpeed += modifierValue;
            break;
          case 'Dig Strength':
            bonuses.digStrength += modifierValue;
            break;
          case 'Luck':
            bonuses.luck += modifierValue;
            break;
          case '2x Luck':
            bonuses.luck += modifierValue * 2;
            break;
          case 'Modifier Boost':
            bonuses.modifierBoost += modifierValue;
            break;
          case 'Dig and Shake Speed':
            bonuses.digSpeed += modifierValue;
            bonuses.shakeSpeed += modifierValue;
            break;
          case 'Luck and Capacity':
            bonuses.luck += modifierValue;
            bonuses.capacity += modifierValue;
            break;
          case 'Size Boost':
            bonuses.sizeBoost += modifierValue;
            break;
          default:
            console.warn(`Unknown modifier effect: ${modifier.effect}`);
            break;
        }
      }
    }
  });

  return bonuses;
}
