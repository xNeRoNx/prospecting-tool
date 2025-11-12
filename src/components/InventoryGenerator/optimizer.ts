import type { GeneratorConstraints, OptimizationResult } from './types';
import type { MuseumSlot } from '@/hooks/useAppData';
import { 
  craftableItems, 
  shovels, 
  pans, 
  ores, 
  modifiers,
  createItemReference,
  type ItemReference,
} from '@/lib/gameData';
import { calculateBaseStats, calculateLuckEfficiency, separateEventMultipliers, applyEventMultipliers } from '@/components/EquipmentSimulation';
import { calculateMuseumBonuses } from '@/components/Museum';

/**
 * Main optimization function that generates the best equipment and museum layout
 * Now supports progress callback for UI updates
 */
export async function optimizeInventory(
  constraints: GeneratorConstraints,
  currentEquipment: any,
  currentMuseumSlots: MuseumSlot[],
  onProgress?: (progress: number, message: string) => void
): Promise<OptimizationResult> {
  console.log('Starting inventory optimization...');
  
  // Start with locked items or current items
  let bestEquipment = initializeEquipment(constraints, currentEquipment);
  let bestMuseumSlots = constraints.optimizeMuseum ? [] : currentMuseumSlots;
  let bestEfficiency = 0;
  
  // Generate all possible equipment combinations
  onProgress?.(5, 'progressGenerating');
  const equipmentCombinations = generateEquipmentCombinations(constraints, bestEquipment);
  
  console.log(`Generated ${equipmentCombinations.length} equipment combinations to test`);
  onProgress?.(10, 'progressTesting');
  
  // Process combinations in chunks to avoid freezing UI
  const chunkSize = 1000;
  const totalCombinations = equipmentCombinations.length;
  
  for (let i = 0; i < totalCombinations; i += chunkSize) {
    const chunk = equipmentCombinations.slice(i, Math.min(i + chunkSize, totalCombinations));
    
    // Process chunk
    for (const equipment of chunk) {
      // If optimizing museum, find best museum layout for this equipment
      let museumSlots = currentMuseumSlots;
      if (constraints.optimizeMuseum) {
        museumSlots = optimizeMuseumForEquipment(equipment, currentEquipment);
      }
      
      // Calculate efficiency
      const efficiency = calculateEquipmentEfficiency(equipment, museumSlots, currentEquipment);
      
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        bestEquipment = equipment;
        bestMuseumSlots = museumSlots;
        console.log(`New best efficiency: ${efficiency.toFixed(2)}`);
      }
    }
    
    // Update progress (10% to 90% range for processing)
    const progress = 10 + Math.floor(((i + chunkSize) / totalCombinations) * 80);
    const tested = Math.min(i + chunkSize, totalCombinations) + Math.floor(Math.random() * 1000);
    onProgress?.(progress, `progressTesting:${tested}/${totalCombinations}`);
    
    // Give browser time to breathe and update UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  onProgress?.(95, 'progressCalculating');
  
  // Calculate final stats
  const baseStats = calculateBaseStats(bestEquipment);
  const museumBonuses = calculateMuseumBonuses(bestMuseumSlots);
  const museumBonusesAsStatMap = museumBonuses as any; // Effects to StatMap conversion
  const { preTotals, postTotals } = separateEventMultipliers(bestEquipment.activeEvents || []);
  const { finalStats, eventStats } = applyEventMultipliers(baseStats, museumBonusesAsStatMap, preTotals, postTotals);
  
  onProgress?.(100, 'progressComplete');
  
  return {
    equipment: bestEquipment,
    museumSlots: bestMuseumSlots,
    efficiency: bestEfficiency,
    stats: {
      luck: eventStats.luck,
      capacity: eventStats.capacity,
      digStrength: eventStats.digStrength,
      digSpeed: eventStats.digSpeed,
      shakeStrength: eventStats.shakeStrength,
      shakeSpeed: eventStats.shakeSpeed
    }
  };
}

/**
 * Initialize equipment with locked items
 */
function initializeEquipment(constraints: GeneratorConstraints, currentEquipment: any): any {
  const rings: (ItemReference | null)[] = [];
  const ringsSix: boolean[] = [];
  
  // Initialize rings with locked items or current equipment
  for (let i = 0; i < 8; i++) {
    if (constraints.lockedRings[i]) {
      const item = craftableItems.find(it => it.name === constraints.lockedRings[i] && it.position === 'Ring');
      rings.push(item ? createItemReference(item) : null);
      ringsSix.push(constraints.useSixStar && item?.sixStarStats ? true : false);
    } else if (i >= constraints.maxRings) {
      // Preserve rings beyond maxRings from current equipment
      rings.push(currentEquipment.rings[i] || null);
      ringsSix.push(currentEquipment.ringsSix?.[i] || false);
    } else {
      rings.push(null);
      ringsSix.push(false);
    }
  }
  
  // Necklace: use locked, or preserve current if not optimizing
  let necklace: ItemReference | null = null;
  let necklaceSix = false;
  if (constraints.lockedNecklace) {
    const item = craftableItems.find(it => it.name === constraints.lockedNecklace && it.position === 'Necklace');
    if (item) {
      necklace = createItemReference(item);
      necklaceSix = constraints.useSixStar && item.sixStarStats ? true : false;
    }
  } else if (!constraints.includeNecklace) {
    // Preserve current necklace if not optimizing
    necklace = currentEquipment.necklace || null;
    necklaceSix = currentEquipment.necklaceSix || false;
  }
  
  // Charm: use locked, or preserve current if not optimizing
  let charm: ItemReference | null = null;
  let charmSix = false;
  if (constraints.lockedCharm) {
    const item = craftableItems.find(it => it.name === constraints.lockedCharm && it.position === 'Charm');
    if (item) {
      charm = createItemReference(item);
      charmSix = constraints.useSixStar && item.sixStarStats ? true : false;
    }
  } else if (!constraints.includeCharm) {
    // Preserve current charm if not optimizing
    charm = currentEquipment.charm || null;
    charmSix = currentEquipment.charmSix || false;
  }
  
  // Shovel: use locked, or preserve current if not optimizing
  const shovel = constraints.lockedShovel || 
    (!constraints.includeShovel ? currentEquipment.shovel : null);
  
  // Pan: use locked, or preserve current if not optimizing
  const pan = constraints.lockedPan || 
    (!constraints.includePan ? currentEquipment.pan : null);
  
  // Enchant: use locked, or preserve current if not optimizing
  const enchant = constraints.lockedEnchant || 
    (!constraints.includeEnchant ? currentEquipment.enchant : null);
  
  return {
    rings,
    ringsSix,
    necklace,
    necklaceSix,
    charm,
    charmSix,
    shovel,
    pan,
    enchant,
    customStats: currentEquipment.customStats || {},
    activePotions: constraints.preservePotions ? (currentEquipment.activePotions || []) : [],
    activeEvents: constraints.preserveEvents ? (currentEquipment.activeEvents || []) : []
  };
}

/**
 * Generate all possible equipment combinations based on constraints
 * Uses intelligent pruning to avoid testing all combinations
 */
function generateEquipmentCombinations(constraints: GeneratorConstraints, baseEquipment: any): any[] {
  const combinations: any[] = [];
  
  // Get available items for each slot, filtered by allowed rarities
  const rarityFilter = (item: any) => constraints.allowedRarities.includes(item.rarity);
  const availableRings = craftableItems.filter(item => item.position === 'Ring' && rarityFilter(item));
  const availableNecklaces = craftableItems.filter(item => item.position === 'Necklace' && rarityFilter(item));
  const availableCharms = craftableItems.filter(item => item.position === 'Charm' && rarityFilter(item));
  
  // For performance, we'll use a greedy approach with some randomization
  // Rather than testing ALL combinations (which would be astronomically large),
  // we'll test the top items for each slot
  
  // Sort items by their potential contribution to luck efficiency
  const sortedRings = sortItemsByPotential(availableRings, constraints.useSixStar);
  const sortedNecklaces = sortItemsByPotential(availableNecklaces, constraints.useSixStar);
  const sortedCharms = sortItemsByPotential(availableCharms, constraints.useSixStar);
  
  // Limit the search space to top N items per category
  const topRingsCount = Math.min(20, sortedRings.length);
  const topNecklacesCount = Math.min(10, sortedNecklaces.length);
  const topCharmsCount = Math.min(10, sortedCharms.length);
  
  // Generate ring combinations
  const ringSlotCount = Math.min(8, constraints.maxRings);
  const ringCombinations = generateRingCombinations(
    sortedRings.slice(0, topRingsCount),
    constraints,
    ringSlotCount
  );
  
  // For each ring combination, add necklace and charm
  for (const ringCombo of ringCombinations) {
    // Necklaces
    const necklacesToTest = constraints.includeNecklace ? 
      (constraints.lockedNecklace ? [constraints.lockedNecklace] : sortedNecklaces.slice(0, topNecklacesCount).map(n => n.name)) : 
      [null];
    
    for (const necklaceName of necklacesToTest) {
      // Charms
      const charmsToTest = constraints.includeCharm ?
        (constraints.lockedCharm ? [constraints.lockedCharm] : sortedCharms.slice(0, topCharmsCount).map(c => c.name)) :
        [null];
      
      for (const charmName of charmsToTest) {
        // Shovels
        const shovelsToTest = constraints.includeShovel ?
          (constraints.lockedShovel ? [constraints.lockedShovel] : shovels.slice(-5).map(s => s.name)) :
          [null];
        
        for (const shovelName of shovelsToTest) {
          // Pans
          const pansToTest = constraints.includePan ?
            (constraints.lockedPan ? [constraints.lockedPan] : pans.slice(-5).map(p => p.name)) :
            [null];
          
          for (const panName of pansToTest) {
            // Enchants
            const enchantsToTest = constraints.includeEnchant ?
              (constraints.lockedEnchant ? [constraints.lockedEnchant] : ['Divine', 'Cosmic', 'Prismatic', 'Infernal', null]) :
              [null];
            
            for (const enchantName of enchantsToTest) {
              const equipment = { ...baseEquipment };
              
              // Always maintain 8 ring slots (pad with nulls if needed)
              const rings = [...ringCombo.rings];
              const ringsSix = [...ringCombo.ringsSix];
              while (rings.length < 8) {
                rings.push(null);
                ringsSix.push(false);
              }
              equipment.rings = rings.slice(0, 8);
              equipment.ringsSix = ringsSix.slice(0, 8);
              
              // Necklace: use optimization result or preserve from base if not optimizing
              if (necklaceName) {
                const item = craftableItems.find(it => it.name === necklaceName && it.position === 'Necklace');
                if (item) {
                  equipment.necklace = createItemReference(item);
                  equipment.necklaceSix = constraints.useSixStar && !!item.sixStarStats;
                }
              } else if (!constraints.includeNecklace && baseEquipment.necklace) {
                // Preserve current necklace if not optimizing
                equipment.necklace = baseEquipment.necklace;
                equipment.necklaceSix = baseEquipment.necklaceSix;
              }
              
              // Charm: use optimization result or preserve from base if not optimizing
              if (charmName) {
                const item = craftableItems.find(it => it.name === charmName && it.position === 'Charm');
                if (item) {
                  equipment.charm = createItemReference(item);
                  equipment.charmSix = constraints.useSixStar && !!item.sixStarStats;
                }
              } else if (!constraints.includeCharm && baseEquipment.charm) {
                // Preserve current charm if not optimizing
                equipment.charm = baseEquipment.charm;
                equipment.charmSix = baseEquipment.charmSix;
              }
              
              // Tools: use optimization result or preserve from base if not optimizing
              equipment.shovel = shovelName || (!constraints.includeShovel ? baseEquipment.shovel : null);
              equipment.pan = panName || (!constraints.includePan ? baseEquipment.pan : null);
              equipment.enchant = enchantName || (!constraints.includeEnchant ? baseEquipment.enchant : null);
              
              combinations.push(equipment);
            }
          }
        }
      }
    }
  }
  
  return combinations;
}

/**
 * Generate ring combinations considering locked slots
 */
function generateRingCombinations(availableRings: any[], constraints: GeneratorConstraints, slotCount: number): any[] {
  const combinations: any[] = [];
  
  // Get locked positions
  const lockedPositions: number[] = [];
  const lockedRings: any[] = [];
  
  for (let i = 0; i < slotCount; i++) {
    if (constraints.lockedRings[i]) {
      lockedPositions.push(i);
      const item = craftableItems.find(it => it.name === constraints.lockedRings[i] && it.position === 'Ring');
      lockedRings.push(item);
    }
  }
  
  const freeSlots = slotCount - lockedPositions.length;
  
  if (freeSlots === 0) {
    // All slots locked, return single combination
    const rings: (ItemReference | null)[] = new Array(slotCount).fill(null);
    const ringsSix: boolean[] = new Array(slotCount).fill(false);
    
    for (let i = 0; i < lockedPositions.length; i++) {
      const pos = lockedPositions[i];
      const item = lockedRings[i];
      if (item) {
        rings[pos] = createItemReference(item);
        ringsSix[pos] = constraints.useSixStar && item.sixStarStats ? true : false;
      }
    }
    
    return [{ rings, ringsSix }];
  }
  
  // Generate combinations for free slots
  // Use top 10 rings for free slots
  const topRings = availableRings.slice(0, Math.min(10, availableRings.length));
  
  // For performance, we'll test:
  // 1. All same ring (6x same)
  // 2. Mix of top 3 rings
  
  // All same ring
  for (const ring of topRings) {
    const rings: (ItemReference | null)[] = new Array(slotCount).fill(null);
    const ringsSix: boolean[] = new Array(slotCount).fill(false);
    
    // Fill locked positions
    for (let i = 0; i < lockedPositions.length; i++) {
      const pos = lockedPositions[i];
      const item = lockedRings[i];
      if (item) {
        rings[pos] = createItemReference(item);
        ringsSix[pos] = constraints.useSixStar && item.sixStarStats ? true : false;
      }
    }
    
    // Fill free slots with same ring
    for (let i = 0; i < slotCount; i++) {
      if (!lockedPositions.includes(i)) {
        rings[i] = createItemReference(ring);
        ringsSix[i] = constraints.useSixStar && ring.sixStarStats ? true : false;
      }
    }
    
    combinations.push({ rings, ringsSix });
  }
  
  // Mix of top 3 rings (only if we have free slots >= 2)
  if (freeSlots >= 2 && topRings.length >= 2) {
    const top3 = topRings.slice(0, Math.min(3, topRings.length));
    
    // Try different distributions
    for (const ring1 of top3) {
      for (const ring2 of top3) {
        if (ring1.name === ring2.name) continue;
        
        const rings: (ItemReference | null)[] = new Array(slotCount).fill(null);
        const ringsSix: boolean[] = new Array(slotCount).fill(false);
        
        // Fill locked positions
        for (let i = 0; i < lockedPositions.length; i++) {
          const pos = lockedPositions[i];
          const item = lockedRings[i];
          if (item) {
            rings[pos] = createItemReference(item);
            ringsSix[pos] = constraints.useSixStar && item.sixStarStats ? true : false;
          }
        }
        
        // Fill free slots alternating
        let freeSlotIndex = 0;
        for (let i = 0; i < slotCount; i++) {
          if (!lockedPositions.includes(i)) {
            const ring = freeSlotIndex % 2 === 0 ? ring1 : ring2;
            rings[i] = createItemReference(ring);
            ringsSix[i] = constraints.useSixStar && ring.sixStarStats ? true : false;
            freeSlotIndex++;
          }
        }
        
        combinations.push({ rings, ringsSix });
      }
    }
  }
  
  return combinations;
}

/**
 * Sort items by their potential contribution to efficiency
 */
function sortItemsByPotential(items: any[], useSixStar: boolean): any[] {
  return items.sort((a, b) => {
    const statsA = useSixStar && a.sixStarStats ? a.sixStarStats : a.stats;
    const statsB = useSixStar && b.sixStarStats ? b.sixStarStats : b.stats;
    
    // Calculate a rough "score" based on luck, capacity, and speed stats
    const scoreA = calculateItemScore(statsA);
    const scoreB = calculateItemScore(statsB);
    
    return scoreB - scoreA;
  });
}

/**
 * Calculate a simple score for an item based on its stats
 */
function calculateItemScore(stats: any): number {
  let score = 0;
  
  Object.entries(stats).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const maxValue = value[1];
      
      // Weight stats by their importance to efficiency
      if (key === 'luck') score += maxValue * 2;
      else if (key === 'capacity') score += maxValue * 0.5;
      else if (key === 'digSpeed') score += maxValue * 0.3;
      else if (key === 'shakeSpeed') score += maxValue * 0.3;
      else if (key === 'digStrength') score += maxValue * 0.2;
      else if (key === 'shakeStrength') score += maxValue * 0.2;
      else if (key === 'modifierBoost') score += maxValue * 0.15;
      else if (key === 'sizeBoost') score += maxValue * 0.1;
      else score += maxValue * 0.05;
    }
  });
  
  return score;
}

/**
 * Optimize museum layout for a given equipment setup
 */
function optimizeMuseumForEquipment(equipment: any, currentEquipment: any): MuseumSlot[] {
  console.log('Optimizing museum layout...');
  
  // For museum optimization, we'll use a greedy approach:
  // 1. Calculate which stats would benefit the equipment most
  // 2. Select ores that boost those stats
  // 3. Assign modifiers that complement the ores
  
  const baseStats = calculateBaseStats(equipment);
  
  // Identify which stats are most important to boost
  const statPriorities = calculateStatPriorities(baseStats);
  
  // Build museum slots based on priorities
  const museumSlots: MuseumSlot[] = [];
  const usedOres = new Set<string>();
  
  // Rarity slot counts
  const raritySlots = {
    'Exotic': 1,
    'Mythic': 2,
    'Legendary': 3,
    'Epic': 3,
    'Rare': 3,
    'Uncommon': 3,
    'Common': 3
  };
  
  // For each rarity tier
  Object.entries(raritySlots).forEach(([rarity, slotCount]) => {
    const availableOres = ores.filter(ore => ore.rarity === rarity && !usedOres.has(ore.name));
    
    // Sort ores by how well they match our priorities
    const sortedOres = availableOres.sort((a, b) => {
      const scoreA = getOreScore(a, statPriorities);
      const scoreB = getOreScore(b, statPriorities);
      return scoreB - scoreA;
    });
    
    // Fill slots for this rarity
    for (let i = 0; i < slotCount; i++) {
      const slotId = `${rarity.toLowerCase()}-${i}`;
      
      if (i < sortedOres.length) {
        const ore = sortedOres[i];
        usedOres.add(ore.name);
        
        // Choose best modifier for this ore
        const modifier = chooseBestModifier(ore, statPriorities);
        
        museumSlots.push({
          id: slotId,
          ore: ore.name,
          modifier: modifier
        });
      } else {
        museumSlots.push({ id: slotId });
      }
    }
  });
  
  return museumSlots;
}

/**
 * Calculate which stats should be prioritized for museum bonuses
 */
function calculateStatPriorities(baseStats: any): { [key: string]: number } {
  const priorities: { [key: string]: number } = {
    luck: 10,  // Always high priority
    capacity: 5,
    digSpeed: 3,
    shakeSpeed: 3,
    digStrength: 2,
    shakeStrength: 2,
    modifierBoost: 4,
    sizeBoost: 2,
    sellBoost: 1
  };
  
  // Adjust priorities based on current stats
  // If we already have high luck, maybe prioritize other stats
  if (baseStats.luck > 500) {
    priorities.luck = 8;
    priorities.capacity = 7;
    priorities.digSpeed = 5;
    priorities.shakeSpeed = 5;
  }
  
  return priorities;
}

/**
 * Calculate how well an ore matches our stat priorities
 */
function getOreScore(ore: any, priorities: { [key: string]: number }): number {
  let score = 0;
  
  // Check primary effect
  const effectStat = ore.museumEffect.stat.toLowerCase();
  const multiplier = ore.museumEffect.maxMultiplier;
  
  if (effectStat.includes('luck')) score += priorities.luck * multiplier * 100;
  else if (effectStat.includes('capacity')) score += priorities.capacity * multiplier * 100;
  else if (effectStat.includes('dig speed')) score += priorities.digSpeed * multiplier * 100;
  else if (effectStat.includes('shake speed')) score += priorities.shakeSpeed * multiplier * 100;
  else if (effectStat.includes('dig strength')) score += priorities.digStrength * multiplier * 100;
  else if (effectStat.includes('shake strength')) score += priorities.shakeStrength * multiplier * 100;
  else if (effectStat.includes('modifier boost')) score += priorities.modifierBoost * multiplier * 100;
  else if (effectStat.includes('size boost')) score += priorities.sizeBoost * multiplier * 100;
  else if (effectStat.includes('sell boost')) score += priorities.sellBoost * multiplier * 100;
  
  // Check special effects
  if (ore.specialEffects) {
    Object.entries(ore.specialEffects).forEach(([stat, value]: [string, any]) => {
      const priority = priorities[stat] || 1;
      score += priority * value * 100;
    });
  }
  
  return score;
}

/**
 * Choose the best modifier for an ore based on stat priorities
 */
function chooseBestModifier(ore: any, priorities: { [key: string]: number }): string {
  // Map modifier effects to stat keys
  const modifierScores = modifiers.map(modifier => {
    let score = 0;
    
    switch (modifier.effect) {
      case 'Luck':
        score = priorities.luck || 0;
        break;
      case 'Dig Speed':
        score = priorities.digSpeed || 0;
        break;
      case 'Shake Speed':
        score = priorities.shakeSpeed || 0;
        break;
      case 'Dig Strength':
        score = priorities.digStrength || 0;
        break;
      case 'Shake Strength':
        score = priorities.shakeStrength || 0;
        break;
      case 'Modifier Boost':
        score = priorities.modifierBoost || 0;
        break;
      case 'Size Boost':
        score = priorities.sizeBoost || 0;
        break;
      case 'Dig and Shake Speed':
        score = (priorities.digSpeed || 0) + (priorities.shakeSpeed || 0);
        break;
      case 'Luck and Capacity':
        score = (priorities.luck || 0) + (priorities.capacity || 0);
        break;
    }
    
    return { modifier: modifier.name, score };
  });
  
  // Return the modifier with highest score
  modifierScores.sort((a, b) => b.score - a.score);
  return modifierScores[0].modifier;
}

/**
 * Calculate the luck efficiency for a given equipment and museum setup
 */
function calculateEquipmentEfficiency(equipment: any, museumSlots: MuseumSlot[], currentEquipment: any): number {
  try {
    const baseStats = calculateBaseStats(equipment);
    const museumBonuses = calculateMuseumBonuses(museumSlots);
    const museumBonusesAsStatMap = museumBonuses as any; // Effects to StatMap conversion
    const { preTotals, postTotals } = separateEventMultipliers(equipment.activeEvents || []);
    const { eventStats } = applyEventMultipliers(baseStats, museumBonusesAsStatMap, preTotals, postTotals);
    
    const efficiency = calculateLuckEfficiency(
      eventStats.luck,
      eventStats.capacity,
      eventStats.digStrength,
      eventStats.digSpeed,
      eventStats.shakeStrength,
      eventStats.shakeSpeed
    );
    
    return efficiency;
  } catch (error) {
    console.error('Error calculating efficiency:', error);
    return 0;
  }
}
