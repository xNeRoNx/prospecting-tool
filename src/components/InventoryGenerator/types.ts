export interface GeneratorConstraints {
  // Equipment constraints
  minRings: number;
  maxRings: number;
  includeNecklace: boolean;
  includeCharm: boolean;
  includeShovel: boolean;
  includePan: boolean;
  includeEnchant: boolean;
  
  // Locked items (forced to be selected)
  lockedRings: (string | null)[];
  lockedNecklace: string | null;
  lockedCharm: string | null;
  lockedShovel: string | null;
  lockedPan: string | null;
  lockedEnchant: string | null;
  
  // Museum constraints
  optimizeMuseum: boolean;
  
  // Potions & Events (preserved from current equipment)
  preservePotions: boolean;
  preserveEvents: boolean;
  
  // Six-star options
  useSixStar: boolean;
  
  // Rarity filters
  allowedRarities: string[];
}

export interface OptimizationResult {
  equipment: {
    rings: any[];
    ringsSix: boolean[];
    necklace: any | null;
    necklaceSix: boolean;
    charm: any | null;
    charmSix: boolean;
    shovel: string | null;
    pan: string | null;
    enchant: string | null;
    customStats: { [key: string]: number };
    activePotions: string[];
    activeEvents: string[];
  };
  museumSlots: any[];
  efficiency: number;
  stats: {
    luck: number;
    capacity: number;
    digStrength: number;
    digSpeed: number;
    shakeStrength: number;
    shakeSpeed: number;
  };
}
