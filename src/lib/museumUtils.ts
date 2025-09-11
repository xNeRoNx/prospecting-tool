import { ores, modifiers, getModifierBonus } from '@/lib/gameData';
import type { MuseumSlot } from '@/hooks/useAppData';

export interface MuseumBonuses {
  luck: number;
  digStrength: number;
  digSpeed: number;
  shakeStrength: number;
  shakeSpeed: number;
  capacity: number;
  sellBoost: number;
  sizeBoost: number;
  modifierBoost: number;
}

/**
 * Calculates museum bonuses (maximum - based on entered weights and selected modifiers).
 * Preserves identical logic as previously duplicated functions in Museum.tsx and EquipmentSimulation.tsx.
 */
export function calculateMuseumBonuses(museumSlots: MuseumSlot[]): MuseumBonuses {
  const bonuses: MuseumBonuses = {
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

    // Specjalne multi-stat efekty
    if (ore.specialEffects) {
      Object.entries(ore.specialEffects).forEach(([stat, value]) => {
        if ((bonuses as any)[stat] !== undefined) {
          let effectValue = value;
          // Additional bonus for modifier (according to previous logic – added here AND below in the switch)
          if (slot.modifier) {
            effectValue += getModifierBonus(ore.rarity);
          }
          (bonuses as any)[stat] += effectValue;
        }
      });
    } else {
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
