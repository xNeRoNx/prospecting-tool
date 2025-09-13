export interface Recipe {
  material: string;
  amount: number;
  weight?: number;
}

export interface Stats {
  luck?: [number, number];
  digStrength?: [number, number];
  digSpeed?: [number, number];
  shakeStrength?: [number, number];
  shakeSpeed?: [number, number];
  capacity?: [number, number];
  sellBoost?: [number, number];
  sizeBoost?: [number, number];
  modifierBoost?: [number, number];
}

export interface CraftableItem {
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Exotic';
  position: 'Ring' | 'Necklace' | 'Charm';
  recipe: Recipe[];
  stats: Stats;
  cost: number;
}

export interface Ore {
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Exotic';
  museumEffect: {
    stat: string;
    maxMultiplier: number;
  };
  // Maximum weight (kg) at which maximum modifier is achieved.
  maxWeight: number;
  specialEffects?: {
    luck?: number;
    capacity?: number;
    digStrength?: number;
    shakeStrength?: number;
    digSpeed?: number;
    shakeSpeed?: number;
    sellBoost?: number;
    sizeBoost?: number;
    modifierBoost?: number;
  };
}

export interface Shovel {
  name: string;
  stats: {
    digStrength: number;
    digSpeed: number;
    toughness: number;
  };
  price: number;
}

export interface Pan {
  name: string;
  stats: {
    luck: number;
    capacity: number;
    shakeStrength: number;
    shakeSpeed: number;
  };
  passive?: string;
  price: number;
}

export interface Enchant {
  name: string;
  effects: {
    [key: string]: number;
  };
}

export const craftableItems: CraftableItem[] = [
  // Common
  {
    name: "Gold Ring",
    rarity: "Common",
    position: "Ring",
    recipe: [{ material: "Gold", amount: 5 }],
    stats: { luck: [0.2, 0.7] },
    cost: 2000
  },
  {
    name: "Amethyst Pendant",
    rarity: "Common", 
    position: "Necklace",
    recipe: [{ material: "Platinum", amount: 8 }, { material: "Amethyst", amount: 2 }],
    stats: { sellBoost: [0, 15], luck: [0.5, 0.2] },
    cost: 10000
  },
  {
    name: "Garden Glove",
    rarity: "Common",
    position: "Necklace",
    recipe: [{ material: "Titanium", amount: 1 }, { material: "Gold", amount: 5 }, { material: "Pyrite", amount: 5 }],
    stats: { digStrength: [0.2, 1], capacity: [0, 5] },
    cost: 10000
  },
  {
    name: "Titanium Ring",
    rarity: "Common",
    position: "Ring",
    recipe: [{ material: "Titanium", amount: 5 }],
    stats: { capacity: [1, 13] },
    cost: 20000
  },
  // Uncommon
  {
    name: "Smoke Ring",
    rarity: "Uncommon",
    position: "Ring",
    recipe: [{ material: "Smoky Quartz", amount: 4 }],
    stats: { modifierBoost: [5, 15] },
    cost: 20000
  },
  {
    name: "Pearl Necklace",
    rarity: "Uncommon",
    position: "Necklace",
    recipe: [{ material: "Pearl", amount: 8, weight: 0.1 }],
    stats: { luck: [1, 4], digStrength: [0, 4] },
    cost: 22000
  },
  {
    name: "Jade Armband",
    rarity: "Uncommon",
    position: "Charm",
    recipe: [{ material: "Jade", amount: 4 }],
    stats: { luck: [1, 8], capacity: [1, 10] },
    cost: 50000
  },
  {
    name: "Topaz Necklace",
    rarity: "Uncommon",
    position: "Necklace",
    recipe: [{ material: "Titanium", amount: 3 }, { material: "Topaz", amount: 1 }],
    stats: { luck: [1, 5], digStrength: [1, 4], shakeStrength: [0.2, 1] },
    cost: 60000
  },
  // Rare
  {
    name: "Ruby Ring",
    rarity: "Rare",
    position: "Ring",
    recipe: [{ material: "Platinum", amount: 5, weight: 0.25 }, { material: "Ruby", amount: 1 }],
    stats: { luck: [1, 3], sizeBoost: [0, 18] },
    cost: 45000
  },
  {
    name: "Lapis Armband",
    rarity: "Rare",
    position: "Charm",
    recipe: [{ material: "Lapis Lazuli", amount: 2 }, { material: "Gold", amount: 4, weight: 0.5 }],
    stats: { luck: [2, 9], digSpeed: [0, 40], shakeSpeed: [0, 40] },
    cost: 111000
  },
  {
    name: "Speed Coil",
    rarity: "Rare",
    position: "Charm",
    recipe: [{ material: "Meteoric Iron", amount: 1 }, { material: "Neodymium", amount: 3 }, { material: "Titanium", amount: 5 }],
    stats: { digSpeed: [0, 70], shakeSpeed: [0, 70] },
    cost: 120000
  },
  {
    name: "Meteor Ring",
    rarity: "Rare",
    position: "Charm",
    recipe: [{ material: "Meteoric Iron", amount: 3 }],
    stats: { digStrength: [0.5, 3], shakeStrength: [0, 1] },
    cost: 150000
  },
  // Epic
  {
    name: "Opal Amulet",
    rarity: "Epic",
    position: "Necklace",
    recipe: [{ material: "Opal", amount: 1 }, { material: "Jade", amount: 1, weight: 0.3 }],
    stats: { luck: [2, 13], modifierBoost: [0, 90] },
    cost: 400000
  },
  {
    name: "Moon Ring",
    rarity: "Epic",
    position: "Ring",
    recipe: [{ material: "Moonstone", amount: 1, weight: 0.4 }, { material: "Iridium", amount: 1, weight: 0.4 }],
    stats: { luck: [1, 7], digSpeed: [10, 40], shakeSpeed: [10, 40] },
    cost: 500000
  },
  {
    name: "Gravity Coil",
    rarity: "Epic",
    position: "Charm",
    recipe: [{ material: "Aurorite", amount: 1 }, { material: "Moonstone", amount: 1 }, { material: "Osmium", amount: 1 }],
    stats: { capacity: [10, 140] },
    cost: 1000000
  },
  {
    name: "Heart of the Ocean",
    rarity: "Epic",
    position: "Ring",
    recipe: [{ material: "Coral", amount: 10 }, { material: "Silver Clamshell", amount: 5 }, { material: "Golden Pearl", amount: 3 }],
    stats: { luck: [3, 10], shakeSpeed: [0, 20], sellBoost: [10, 20] },
    cost: 1000000
  },
  // Legendary
  {
    name: "Guiding Light",
    rarity: "Legendary",
    position: "Charm",
    recipe: [{ material: "Catseye", amount: 1 }, { material: "Golden Pearl", amount: 2 }],
    stats: { luck: [5, 20], capacity: [10, 40], modifierBoost: [0, 45] },
    cost: 1500000
  },
  {
    name: "Lightkeeper's Ring",
    rarity: "Legendary",
    position: "Ring",
    recipe: [{ material: "Opal", amount: 2 }, { material: "Luminium", amount: 1 }],
    stats: { digSpeed: [5, 25], sellBoost: [5, 25], modifierBoost: [5, 25] },
    cost: 2000000
  },
  {
    name: "Mass Accumulator",
    rarity: "Legendary",
    position: "Necklace",
    recipe: [{ material: "Aurorite", amount: 1 }, { material: "Uranium", amount: 1 }, { material: "Osmium", amount: 2 }],
    stats: { capacity: [20, 60], sizeBoost: [10, 80] },
    cost: 3000000
  },
  {
    name: "Crown",
    rarity: "Legendary",
    position: "Charm",
    recipe: [
      { material: "Ruby", amount: 3, weight: 0.25 },
      { material: "Gold", amount: 8, weight: 1 },
      { material: "Emerald", amount: 2, weight: 0.2 },
      { material: "Diamond", amount: 1 },
      { material: "Sapphire", amount: 3, weight: 0.25 }
    ],
    stats: { luck: [5, 30], sizeBoost: [0, 45], sellBoost: [0, 90] },
    cost: 5000000
  },
  {
    name: "Dragon Claw",
    rarity: "Legendary",
    position: "Charm",
    recipe: [{ material: "Ammonite Fossil", amount: 5 }, { material: "Dragon Bone", amount: 2 }],
    stats: { digStrength: [10, 30], shakeStrength: [1, 8] },
    cost: 10000000
  },
  // Mythic
  {
    name: "Royal Federation Crown",
    rarity: "Mythic",
    position: "Charm",
    recipe: [
      { material: "Rose Gold", amount: 3, weight: 0.4 },
      { material: "Golden Pearl", amount: 5, weight: 0.2 },
      { material: "Pink Diamond", amount: 1 }
    ],
    stats: { luck: [10, 90], sizeBoost: [0, 90], sellBoost: [0, 180] },
    cost: 30000000
  },
  {
    name: "Phoenix Heart",
    rarity: "Mythic",
    position: "Necklace",
    recipe: [{ material: "Uranium", amount: 3 }, { material: "Inferlume", amount: 1 }, { material: "Starshine", amount: 2 }],
    stats: { luck: [100, 300], sizeBoost: [-70, -40] },
    cost: 40000000
  },
  {
    name: "Celestial Rings",
    rarity: "Mythic",
    position: "Necklace",
    recipe: [
      { material: "Vortessence", amount: 1 },
      { material: "Meteoric Iron", amount: 8, weight: 0.3 },
      { material: "Moonstone", amount: 5, weight: 0.3 },
      { material: "Catseye", amount: 2 }
    ],
    stats: { luck: [30, 90], capacity: [50, 250], sizeBoost: [0, 45], modifierBoost: [20, 140] },
    cost: 50000000
  },
  {
    name: "Apocalypse Bringer",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Ashvein", amount: 4 },
      { material: "Ruby", amount: 10 },
      { material: "Emerald", amount: 2, weight: 0.2 },
      { material: "Palladium", amount: 2 },
      { material: "Painite", amount: 1 }
    ],
    stats: { digStrength: [5, 20], luck: [10, 40], shakeStrength: [2, 5], sellBoost: [10, 50] },
    cost: 50000000
  },
  {
    name: "Mythril Ring",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Tourmaline", amount: 2 },
      { material: "Cinnabar", amount: 2 },
      { material: "Starshine", amount: 1 },
      { material: "Mythril", amount: 1 }
    ],
    stats: { luck: [20, 80], digSpeed: [20, 40], shakeSpeed: [20, 40], sellBoost: [5, 24] },
    cost: 60000000
  },
  {
    name: "Phoenix Wings",
    rarity: "Mythic",
    position: "Charm",
    recipe: [
      { material: "Flarebloom", amount: 1 },
      { material: "Cinnabar", amount: 2 },
      { material: "Fire Opal", amount: 2 }
    ],
    stats: { luck: [100, 300], capacity: [-80, -40] },
    cost: 65000000
  },
  {
    name: "Prismatic Star",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Diamond", amount: 1 },
      { material: "Prismara", amount: 1 },
      { material: "Pink Diamond", amount: 1 },
      { material: "Borealite", amount: 5 },
      { material: "Luminium", amount: 1 },
      { material: "Starshine", amount: 1 }
    ],
    stats: {
      luck: [5, 20],
      digStrength: [2, 10],
      capacity: [10, 40],
      digSpeed: [5, 20],
      shakeStrength: [1, 3],
      shakeSpeed: [5, 20],
      sellBoost: [10, 20],
      sizeBoost: [5, 20],
      modifierBoost: [5, 20]
    },
    cost: 75000000
  },
  {
    name: "Cryogenic Preserver",
    rarity: "Mythic",
    position: "Charm",
    recipe: [
      { material: "Borealite", amount: 5 },
      { material: "Frostshard", amount: 1 },
      { material: "Aetherite", amount: 3 },
      { material: "Mythril", amount: 1 }
    ],
    stats: { luck: [100, 250], shakeStrength: [10, 40], shakeSpeed: [-40, -20], sellBoost: [0, 50] },
    cost: 75000000
  },
  {
    name: "Ring of Thorns",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Chrysoberyl", amount: 1 },
      { material: "Painite", amount: 2 },
      { material: "Lightshard", amount: 5 },
      { material: "Glowmoss", amount: 5 },
      { material: "Firefly Stone", amount: 5 }
    ],
    stats: {
      digStrength: [5, 40],
      luck: [20, 100],
      sizeBoost: [10, 30],
      modifierBoost: [20, 60]
    },
    cost: 75000000
  },
  {
    name: "Solar Ring",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Vortessence", amount: 1 },
      { material: "Fire Opal", amount: 2 },
      { material: "Volcanic Core", amount: 1 },
      { material: "Pyronium", amount: 10 }
    ],
    stats: {
      luck: [20, 100],
      digStrength: [2, 8],
      digSpeed: [-30, -10],
      shakeStrength: [0, 2],
      shakeSpeed: [-30, -10],
      modifierBoost: [5, 20]
    },
    cost: 90000000
  },
  {
    name: "Amulet of Life",
    rarity: "Mythic",
    position: "Necklace",
    recipe: [
      { material: "Specterite", amount: 5 },
      { material: "Chrysoberyl", amount: 1 },
      { material: "Prismara", amount: 1 }
    ],
    stats: {
      luck: [100, 300],
      modifierBoost: [50, 150]
    },
    cost: 150000000
  },
  // Exotic
  {
    name: "Fossilized Crown",
    rarity: "Exotic",
    position: "Charm",
    recipe: [
      { material: "Dinosaur Skull", amount: 1 },
      { material: "Cinnabar", amount: 5 },
      { material: "Volcanic Core", amount: 1 },
      { material: "Dragon Bone", amount: 5 }
    ],
    stats: { luck: [50, 250], capacity: [50, 200], shakeSpeed: [10, 30], sizeBoost: [0, 50], sellBoost: [0, 100] },
    cost: 100000000
  },
  {
    name: "Frostthorn Pendant",
    rarity: "Exotic",
    position: "Necklace",
    recipe: [
      { material: "Tourmaline", amount: 5 },
      { material: "Cobalt", amount: 10 },
      { material: "Frostshard", amount: 2 },
      { material: "Aquamarine", amount: 5 },
      { material: "Cryogenic Artifact", amount: 1 }
    ],
    stats: { luck: [100, 400], digStrength: [100, 200], capacity: [50, 200], digSpeed: [-50, -30], sizeBoost: [30, 100] },
    cost: 200000000
  },
  {
    name: "Antlers of Life",
    rarity: "Exotic",
    position: "Charm",
    recipe: [
      { material: "Chrysoberyl", amount: 3 },
      { material: "Vineheart", amount: 1 },
      { material: "Radiant Gold", amount: 2 },
      { material: "Firefly Stone", amount: 10 }
    ],
    stats: { luck: [100, 580], digSpeed: [10, 40], sizeBoost: [20, 60], modifierBoost: [50, 200] },
    cost: 300000000
  },
  {
    name: "Vortex Ring",
    rarity: "Exotic",
    position: "Ring",
    recipe: [
      { material: "Voidstone", amount: 1 },
      { material: "Prismara", amount: 2 },
      { material: "Vortessence", amount: 3 }
    ],
    stats: { digStrength: [20, 80], luck: [50, 140], capacity: [100, 300], shakeStrength: [3, 10] },
    cost: 333000000
  }
];

// Note: The maxWeight values for each ore are determined by specific game mechanics.
// They represent the maximum weight (in kg) at which the museum effect's maximum modifier is achieved.
// Adjust these values carefully if game balance changes, and refer to game design documentation for details.
export const ores: Ore[] = [
  // Common
  { name: "Pyrite", rarity: "Common", museumEffect: { stat: "Capacity", maxMultiplier: 0.05 }, maxWeight: 25 },
  { name: "Silver", rarity: "Common", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.05 }, maxWeight: 16 },
  { name: "Copper", rarity: "Common", museumEffect: { stat: "Size Boost", maxMultiplier: 0.035 }, maxWeight: 30 },
  { name: "Gold", rarity: "Common", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.05 }, maxWeight: 16 },
  { name: "Blue Ice", rarity: "Common", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.05 }, maxWeight: 17 },
  { name: "Platinum", rarity: "Common", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.05 }, maxWeight: 16 },
  { name: "Seashell", rarity: "Common", museumEffect: { stat: "Capacity", maxMultiplier: 0.05 }, maxWeight: 10 },
  { name: "Obsidian", rarity: "Common", museumEffect: { stat: "Size Boost", maxMultiplier: 0.05 }, maxWeight: 16 },
  { name: "Amethyst", rarity: "Common", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.035 }, maxWeight: 8 },
  { name: "Pearl", rarity: "Common", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.05 }, maxWeight: 10 },
  
  // Uncommon
  { name: "Titanium", rarity: "Uncommon", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.075 }, maxWeight: 20 },
  { name: "Neodymium", rarity: "Uncommon", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.075 }, maxWeight: 20 },
  { name: "Glowberry", rarity: "Uncommon", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.075 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Topaz", rarity: "Uncommon", museumEffect: { stat: "Capacity", maxMultiplier: 0.075 }, maxWeight: 10 },
  { name: "Smoky Quartz", rarity: "Uncommon", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.075 }, maxWeight: 10 },
  { name: "Malachite", rarity: "Uncommon", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.075 }, maxWeight: 10 },
  { name: "Coral", rarity: "Uncommon", museumEffect: { stat: "Capacity", maxMultiplier: 0.075 }, maxWeight: 5 },
  { name: "Sapphire", rarity: "Uncommon", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.075 }, maxWeight: 10 },
  { name: "Zircon", rarity: "Uncommon", museumEffect: { stat: "Size Boost", maxMultiplier: 0.05 }, maxWeight: 7 },
  
  // Rare
  { name: "Ruby", rarity: "Rare", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.125 }, maxWeight: 10 },
  { name: "Lapis Lazuli", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.125 }, maxWeight: 16 },
  { name: "Jade", rarity: "Rare", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.125 }, maxWeight: 20 },
  { name: "Silver Clamshell", rarity: "Rare", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.125 }, maxWeight: 10 },
  { name: "Peridot", rarity: "Rare", museumEffect: { stat: "Luck", maxMultiplier: 0.125 }, maxWeight: 10 },
  { name: "Onyx", rarity: "Rare", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.125 }, maxWeight: 16 },
  { name: "Meteoric Iron", rarity: "Rare", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.125 }, maxWeight: 20 },
  { name: "Glacial Quartz", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.125 }, maxWeight: 21 },
  { name: "Amber", rarity: "Rare", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.125 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Azuralite", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.125 }, maxWeight: 15 },
  { name: "Pyrelith", rarity: "Rare", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.125 }, maxWeight: 16 },

  
  // Epic
  { name: "Iridium", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 20 },
  { name: "Glowmoss", rarity: "Epic", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.2 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Moonstone", rarity: "Epic", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.2 }, maxWeight: 25 },
  { name: "Ammonite Fossil", rarity: "Epic", museumEffect: { stat: "Capacity", maxMultiplier: 0.2 }, maxWeight: 25 },
  { name: "Ashvein", rarity: "Epic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.14 }, maxWeight: 10 },
  { name: "Pyronium", rarity: "Epic", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.2 }, maxWeight: 25 },
  { name: "Emerald", rarity: "Epic", museumEffect: { stat: "Luck", maxMultiplier: 0.2 }, maxWeight: 10 },
  { name: "Golden Pearl", rarity: "Epic", museumEffect: { stat: "Capacity", maxMultiplier: 0.2 }, maxWeight: 10 },
  { name: "Cobalt", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 20 },
  { name: "Borealite", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 10 },
  { name: "Osmium", rarity: "Epic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.2 }, maxWeight: 40 },
  { name: "Lightshard", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Opal", rarity: "Epic", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.2 }, maxWeight: 10 },
  { name: "Aurorite", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 15 },
  
  // Legendary
  { name: "Rose Gold", rarity: "Legendary", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Palladium", rarity: "Legendary", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Cinnabar", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 10 },
  { name: "Diamond", rarity: "Legendary", museumEffect: { stat: "Luck", maxMultiplier: 0.3 }, maxWeight: 10 },
  { name: "Uranium", rarity: "Legendary", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.3 }, maxWeight: 30 },
  { name: "Luminium", rarity: "Legendary", museumEffect: { stat: "Capacity", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Volcanic Key", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 10 },
  { name: "Firefly Stone", rarity: "Legendary", museumEffect: { stat: "Capacity", maxMultiplier: 0.3 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Fire Opal", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 10 },
  { name: "Dragon Bone", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 25 },
  { name: "Catseye", rarity: "Legendary", museumEffect: { stat: "Capacity", maxMultiplier: 0.3 }, maxWeight: 10 },
  { name: "Starshine", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.15 }, 
    specialEffects: { digSpeed: 0.15, shakeSpeed: 0.15 }, maxWeight: 10 },
  { name: "Specterite", rarity: "Legendary", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.3 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Tourmaline", rarity: "Legendary", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.3 }, maxWeight: 12.5 },
  { name: "Aquamarine", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 10 },
  { name: "Aetherite", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 10 },
  
  // Mythic
  { name: "Pink Diamond", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 }, maxWeight: 10 },
  { name: "Painite", rarity: "Mythic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.35 }, maxWeight: 10 },
  { name: "Inferlume", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 }, maxWeight: 10 },
  { name: "Vortessence", rarity: "Mythic", museumEffect: { stat: "Capacity", maxMultiplier: 0.5 }, maxWeight: 10 },
  { name: "Mythril", rarity: "Mythic", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.5 }, maxWeight: 30 },
  { name: "Chrysoberyl", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Prismara", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.25 }, 
    specialEffects: { luck: 0.25, capacity: 0.25, digStrength: 0.25, shakeStrength: 0.25 }, maxWeight: 10 },
  { name: "Flarebloom", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.75 },
    specialEffects: { luck: 0.75, sizeBoost: -0.5 }, maxWeight: 10 },
  { name: "Volcanic Core", rarity: "Mythic", museumEffect: { stat: "Dig Strength", maxMultiplier: 0.25 },
    specialEffects: { digStrength: 0.25, sizeBoost: 0.2 }, maxWeight: 10 },
  { name: "Radiant Gold", rarity: "Mythic", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.5 }, maxWeight: 0 }, //TODO - verify maxWeight
  { name: "Frostshard", rarity: "Mythic", museumEffect: { stat: "Dig Strength", maxMultiplier: 0.5 }, maxWeight: 10 },
  
  // Exotic
  { name: "Dinosaur Skull", rarity: "Exotic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.4 },
    specialEffects: { sizeBoost: 0.4, sellBoost: 0.5 }, maxWeight: 50 },
  { name: "Cryogenic Artifact", rarity: "Exotic", museumEffect: { stat: "Dig Strength", maxMultiplier: 1.5 },
    specialEffects: { digStrength: 1.5, shakeStrength: 1.5, digSpeed: -1, shakeSpeed: -1 }, maxWeight: 10 },
  { name: "Voidstone", rarity: "Exotic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 },
    specialEffects: { luck: 0.5, capacity: 0.5 }, maxWeight: 10 },
  { name: "Vineheart", rarity: "Exotic", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.0 }, maxWeight: 0 }, //TODO - verify maxWeight and effect
];

export const modifiers = [
  { name: "Shiny", effect: "Shake Strength" },
  { name: "Pure", effect: "Dig Speed" },
  { name: "Glowing", effect: "Shake Speed" },
  { name: "Scorching", effect: "Dig Strength" },
  { name: "Irradiated", effect: "Modifier Boost" },
  { name: "Crystalline", effect: "Size Boost" },
  { name: "Iridescent", effect: "Luck" },
  { name: "Electrified", effect: "Dig and Shake Speed" },
  { name: "Voidtorn", effect: "Luck and Capacity" },
];

export const getModifierBonus = (rarity: string): number => {
  switch (rarity) {
    case 'Common':
      return 0.005;
    case 'Uncommon':
      return 0.0075;
    case 'Rare':
      return 0.0125;
    case 'Epic':
      return 0.02;
    case 'Legendary':
      return 0.03;
    case 'Mythic':
      return 0.05;
    case 'Exotic':
      return 0.1;
    default:
      return 0.01;
  }
};

export const shovels: Shovel[] = [
  { name: "Rusty Shovel", stats: { digStrength: 2, digSpeed: 80, toughness: 1 }, price: 0 },
  { name: "Iron Shovel", stats: { digStrength: 3, digSpeed: 80, toughness: 1 }, price: 3000 },
  { name: "Steel Shovel", stats: { digStrength: 4, digSpeed: 80, toughness: 2 }, price: 25000 },
  { name: "Silver Shovel", stats: { digStrength: 5, digSpeed: 110, toughness: 2 }, price: 75000 },
  { name: "Reinforced Shovel", stats: { digStrength: 1, digSpeed: 90, toughness: 3 }, price: 135000 },
  { name: "The Excavator", stats: { digStrength: 7, digSpeed: 70, toughness: 3 }, price: 320000 },
  { name: "Golden Shovel", stats: { digStrength: 8, digSpeed: 100, toughness: 3 }, price: 1333000 },
  { name: "Meteoric Shovel", stats: { digStrength: 7, digSpeed: 150, toughness: 4 }, price: 4000000 },
  { name: "Diamond Shovel", stats: { digStrength: 12, digSpeed: 100, toughness: 4 }, price: 12500000 },
  { name: "Divine Shovel", stats: { digStrength: 16, digSpeed: 110, toughness: 5 }, price: 40000000 },
  { name: "Earthbreaker Shovel", stats: { digStrength: 25, digSpeed: 100, toughness: 5 }, price: 125000000 },
  { name: "Dragonflame Shovel", stats: { digStrength: 50, digSpeed: 60, toughness: 5 }, price: 400000000 },
  { name: "Fossilized Shovel", stats: { digStrength: 40, digSpeed: 100, toughness: 6 }, price: 1000000000 },
  { name: "Galactic Shovel", stats: { digStrength: 60, digSpeed: 80, toughness: 6 }, price: 2000000000 },
  { name: "Icebreaker Shovel", stats: { digStrength: 60, digSpeed: 110, toughness: 6 }, price: 10000000000 },
  { name: "Lifetouched Shovel", stats: { digStrength: 100, digSpeed: 100, toughness: 7 }, price: 80000000000 }
];

export const pans: Pan[] = [
  { name: "Rusty Pan", stats: { luck: 1, capacity: 5, shakeStrength: 0.2, shakeSpeed: 80 }, price: 0 },
  { name: "Plastic Pan", stats: { luck: 1.5, capacity: 10, shakeStrength: 0.4, shakeSpeed: 80 }, price: 500 },
  { name: "Metal Pan", stats: { luck: 2, capacity: 20, shakeStrength: 0.5, shakeSpeed: 80 }, price: 12000 },
  { name: "Silver Pan", stats: { luck: 4, capacity: 30, shakeStrength: 0.8, shakeSpeed: 90 }, price: 55000 },
  { name: "Golden Pan", stats: { luck: 10, capacity: 35, shakeStrength: 1, shakeSpeed: 80 }, price: 333000 },
  { name: "Magnetic Pan", stats: { luck: 15, capacity: 50, shakeStrength: 1, shakeSpeed: 75 }, passive: "Size boost of (+25%)", price: 1000000 },
  { name: "Meteoric Pan", stats: { luck: 22, capacity: 70, shakeStrength: 2, shakeSpeed: 100 }, passive: "Modifier boost of (+25%)", price: 3500000 },
  { name: "Diamond Pan", stats: { luck: 35, capacity: 100, shakeStrength: 3, shakeSpeed: 100 }, passive: "Modifier boost of (+10%), Size boost of (+10%)", price: 10000000 },
  { name: "Aurora Pan", stats: { luck: 50, capacity: 130, shakeStrength: 3, shakeSpeed: 125 }, passive: "Modifier boost of (+25%)", price: 35000000 },
  { name: "Worldshaker Pan", stats: { luck: 70, capacity: 150, shakeStrength: 5, shakeSpeed: 100 }, passive: "Size boost of (+25%)", price: 125000000 },
  { name: "Dragonflame Pan", stats: { luck: 150, capacity: 180, shakeStrength: 10, shakeSpeed: 110 }, passive: "Size boost of (-10%)", price: 400000000 },
  { name: "Fossilized Pan", stats: { luck: 200, capacity: 225, shakeStrength: 8, shakeSpeed: 100 }, passive: "Modifier boost of (+50%)", price: 1000000000 },
  { name: "Galactic Pan", stats: { luck: 100, capacity: 500, shakeStrength: 25, shakeSpeed: 100 }, passive: "Size Boost of (+25%) and has a chance to give Voidtorn items", price: 2000000000 },
  { name: "Frostbite Pan", stats: { luck: 300, capacity: 250, shakeStrength: 15, shakeSpeed: 80 }, passive: "Size Boost of (+25%)", price: 10000000000 },
  { name: "Lifetouched Pan", stats: { luck: 400, capacity: 300, shakeStrength: 8, shakeSpeed: 110 }, passive: "Modifier boost of (+50%)", price: 100000000000 }
];

export const enchants: Enchant[] = [
  { name: "Strong", effects: { capacity: 20 } },
  { name: "Gigantic", effects: { capacity: 50 } },
  { name: "Swift", effects: { shakeSpeed: 10 } },
  { name: "Glowing", effects: { shakeSpeed: 25 } },
  { name: "Forceful", effects: { shakeStrength: 2 } },
  { name: "Destructive", effects: { shakeStrength: 5 } },
  { name: "Lucky", effects: { luck: 5 } },
  { name: "Blessed", effects: { capacity: 25, luck: 10 } },
  { name: "Boosting", effects: { sizeBoost: 10 } },
  { name: "Titanic", effects: { sizeBoost: 20, capacity: 30 } },
  { name: "Greedy", effects: { sellBoost: 20 } },
  { name: "Midas", effects: { sellBoost: 50 } },
  { name: "Unstable", effects: { modifierBoost: 25 } },
  { name: "Divine", effects: { luck: 20, capacity: 40 } },
  { name: "Cosmic", effects: { capacity: 50, shakeStrength: 3, sizeBoost: 25 } },
  { name: "Prismatic", effects: { capacity: 20, shakeStrength: 2, sizeBoost: 10, luck: 10, shakeSpeed: 10, modifierBoost: 10 } },
  { name: "Infernal", effects: { luck: 80, capacity: -20, sizeBoost: -10 } }
];

export interface Event {
  name: string;
  effects: {
    luck?: number;
    digStrength?: number;
    shakeStrength?: number;
  };
}

export const events: Event[] = [
  { name: "Meteor Shower", effects: { luck: 2 } },
  { name: "Admin Shower", effects: { luck: 2, digStrength: 2, shakeStrength: 2 } },
  { name: "Luck Totem", effects: { luck: 2 } },
  { name: "Strength Totem", effects: { digStrength: 2, shakeStrength: 2 } }
];