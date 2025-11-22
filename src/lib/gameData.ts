export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Exotic';
export type Positions = 'Ring' | 'Necklace' | 'Charm';

export interface Recipe {
  material: string;
  amount: number;
  weight?: number;
}

export interface Effects {
  luck?: number;
  digStrength?: number;
  digSpeed?: number;
  shakeStrength?: number;
  walkSpeed?: number;
  shakeSpeed?: number;
  capacity?: number;
  sellBoost?: number;
  sizeBoost?: number;
  modifierBoost?: number;
  toughness?: number;
}

export type Stats = {
  [K in keyof Effects]?: [number, number];
}

export interface CraftableItem {
  name: string;
  rarity: Rarity;
  position: Positions;
  recipe: Recipe[];
  stats: Stats;
  sixStarStats?: Stats; // For 6* items
  cost: number;
  event?: boolean;
  candy?: boolean;
}

export interface Ore {
  name: string;
  rarity: Rarity;
  museumEffect: {
    stat: string;
    maxMultiplier: number;
  };
  // Maximum weight (kg) at which maximum modifier is achieved.
  maxWeight: number;
  specialEffects?: Effects;
}

export interface Shovel {
  name: string;
  stats: {
    digStrength: number;
    digSpeed: number;
    toughness: number;
  };
  price: number;
  event?: boolean;
  candy?: boolean;
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
  event?: boolean;
  candy?: boolean;
}

// Reference type for storing item identifiers instead of full objects
export interface ItemReference {
  name: string;
  position: Positions;
}

export interface Enchant {
  name: string;
  effects: Effects;
}

export interface Potions {
  name: string;
  effects: Effects;
}

// Helper function to get a craftable item by reference
export function getItemByReference(ref: ItemReference): CraftableItem | null {
  return craftableItems.find(
    item => item.name === ref.name && item.position === ref.position
  ) || null;
}

// Helper function to create a reference from a craftable item
export function createItemReference(item: CraftableItem): ItemReference {
  return {
    name: item.name,
    position: item.position
  };
}

export const potions: Potions[] = [
  { name: "Blitz Potion", effects: { digSpeed: 60, shakeSpeed: 60 } },
  { name: "Quake Potion", effects: { digStrength: 30, shakeStrength: 5 } },
  { name: "Instability Potion", effects: { modifierBoost: 100 } },
  { name: "Merchant's Potion", effects: { sellBoost: 100 } },
  { name: "Basic Luck Potion", effects: { luck: 5 } },
  { name: "Basic Capacity Potion", effects: { capacity: 25 } },
  { name: "Greater Luck Potion", effects: { luck: 10 } },
  { name: "Greater Capacity Potion", effects: { capacity: 50 } },
  { name: "Volcanic Luck Potion", effects: { luck: 20 } },
  { name: "Volcanic Strength Potion", effects: { digStrength: 5 } },
  { name: "Frozen Luck Potion", effects: { luck: 100 } },
  { name: "Frozen Speed Potion", effects: { digSpeed: 20, shakeSpeed: 20 } },
  { name: "Witches Brew", effects: { luck: 500, digStrength: 50 } },
  { name: "Supreme Luck Potion", effects: { luck: 50 } },
  { name: "Cryonic Brew (with summit seeker rune)", effects: { luck: 300, capacity: 200, digSpeed: 15, shakeSpeed: 15 } },
  { name: "Ambrosia", effects: { luck: 1111 } },
];

export const availableStats: (keyof Effects)[] = [
    'luck', 'digStrength', 'digSpeed', 'shakeStrength', 
    'walkSpeed', 'shakeSpeed', 'capacity', 'sellBoost', 
    'sizeBoost', 'modifierBoost', 'toughness'
  ];

export const craftableItems: CraftableItem[] = [
  // Common
  {
    name: "Gold Ring",
    rarity: "Common",
    position: "Ring",
    recipe: [{ material: "Gold", amount: 5 }],
    stats: { luck: [0.3, 0.8] },
    sixStarStats: { luck: [0.3, 0.9] },
    cost: 2000
  },
  {
    name: "Amethyst Pendant",
    rarity: "Common", 
    position: "Necklace",
    recipe: [{ material: "Platinum", amount: 8 }, { material: "Amethyst", amount: 2 }],
    stats: { sellBoost: [0, 15], luck: [1, 2.5] },
    sixStarStats: { sellBoost: [0, 18], luck: [1, 2.7] },
    cost: 10000
  },
  {
    name: "Garden Glove",
    rarity: "Common",
    position: "Necklace",
    recipe: [{ material: "Titanium", amount: 1 }, { material: "Gold", amount: 5 }, { material: "Pyrite", amount: 5 }],
    stats: { digStrength: [0.2, 1], capacity: [0, 5] },
    sixStarStats: { digStrength: [0.2, 1.1], capacity: [0, 5.5] },
    cost: 10000
  },
  {
    name: "Titanium Ring",
    rarity: "Common",
    position: "Ring",
    recipe: [{ material: "Titanium", amount: 5 }],
    stats: { capacity: [1, 13] },
    sixStarStats: { capacity: [1, 15] },
    cost: 20000
  },
  // Uncommon
  {
    name: "Smoke Ring",
    rarity: "Uncommon",
    position: "Ring",
    recipe: [{ material: "Smoky Quartz", amount: 4 }],
    stats: { modifierBoost: [5, 15] },
    sixStarStats: { modifierBoost: [5, 16] },
    cost: 20000
  },
  {
    name: "Pearl Necklace",
    rarity: "Uncommon",
    position: "Necklace",
    recipe: [{ material: "Pearl", amount: 8, weight: 0.1 }],
    stats: { luck: [2, 5], digStrength: [0, 4] },
    sixStarStats: { luck: [2, 5.5], digStrength: [0, 4.5] },
    cost: 22000
  },
  {
    name: "Jade Armband",
    rarity: "Uncommon",
    position: "Charm",
    recipe: [{ material: "Jade", amount: 4 }],
    stats: { luck: [2, 9], capacity: [1, 10] },
    sixStarStats: { luck: [2, 10], capacity: [1, 11] },
    cost: 50000
  },
  {
    name: "Topaz Necklace",
    rarity: "Uncommon",
    position: "Necklace",
    recipe: [{ material: "Titanium", amount: 3 }, { material: "Topaz", amount: 1 }],
    stats: { luck: [1, 5], digStrength: [1, 4], shakeStrength: [0.2, 1] },
    sixStarStats: { luck: [1, 5.5], digStrength: [1, 4.5], shakeStrength: [0.2, 1.1] },
    cost: 60000
  },
  // Rare
  {
    name: "Ruby Ring",
    rarity: "Rare",
    position: "Ring",
    recipe: [{ material: "Platinum", amount: 5, weight: 0.25 }, { material: "Ruby", amount: 1 }],
    stats: { luck: [2, 6], sizeBoost: [0, 18] },
    sixStarStats: { luck: [2, 6.4], sizeBoost: [0, 20] },
    cost: 45000
  },
  {
    name: "Lapis Armband",
    rarity: "Rare",
    position: "Charm",
    recipe: [{ material: "Lapis Lazuli", amount: 2 }, { material: "Gold", amount: 4, weight: 0.5 }],
    stats: { luck: [3, 10], digSpeed: [0, 40], shakeSpeed: [0, 40] },
    sixStarStats: { luck: [3, 11], digSpeed: [0, 44], shakeSpeed: [0, 44] },
    cost: 111000
  },
  {
    name: "Speed Coil",
    rarity: "Rare",
    position: "Charm",
    recipe: [{ material: "Meteoric Iron", amount: 1 }, { material: "Neodymium", amount: 3 }, { material: "Titanium", amount: 5 }],
    stats: { digSpeed: [0, 70], shakeSpeed: [0, 70] },
    sixStarStats: { digSpeed: [0, 80], shakeSpeed: [0, 80] },
    cost: 120000
  },
  {
    name: "Meteor Ring",
    rarity: "Rare",
    position: "Charm",
    recipe: [{ material: "Meteoric Iron", amount: 3 }],
    stats: { digStrength: [0.5, 3], shakeStrength: [0, 1] },
    sixStarStats: { digStrength: [0.5, 3.2], shakeStrength: [0, 1.1] },
    cost: 150000
  },
  // Epic
  {
    name: "Opal Amulet",
    rarity: "Epic",
    position: "Necklace",
    recipe: [{ material: "Opal", amount: 1 }, { material: "Jade", amount: 1, weight: 0.3 }],
    stats: { luck: [5, 16], modifierBoost: [0, 90] },
    sixStarStats: { luck: [5, 18], modifierBoost: [0, 100] },
    cost: 400000
  },
  {
    name: "Moon Ring",
    rarity: "Epic",
    position: "Ring",
    recipe: [{ material: "Moonstone", amount: 1, weight: 0.4 }, { material: "Iridium", amount: 1, weight: 0.4 }],
    stats: { luck: [1, 7], digSpeed: [10, 40], shakeSpeed: [10, 40] },
    sixStarStats: { luck: [1, 8], digSpeed: [10, 45], shakeSpeed: [10, 45] },
    cost: 500000
  },
  {
    name: "Gravity Coil",
    rarity: "Epic",
    position: "Charm",
    recipe: [{ material: "Aurorite", amount: 1 }, { material: "Moonstone", amount: 1 }, { material: "Osmium", amount: 1 }],
    stats: { capacity: [10, 140] },
    sixStarStats: { capacity: [10, 160] },
    cost: 1000000
  },
  {
    name: "Heart of the Ocean",
    rarity: "Epic",
    position: "Ring",
    recipe: [{ material: "Coral", amount: 10 }, { material: "Silver Clamshell", amount: 5 }, { material: "Golden Pearl", amount: 3 }],
    stats: { luck: [3, 10], shakeSpeed: [0, 20], sellBoost: [10, 20] },
    sixStarStats: { luck: [3, 11], shakeSpeed: [0, 22], sellBoost: [10, 22] },
    cost: 1000000
  },
  // Legendary
  {
    name: "Guiding Light",
    rarity: "Legendary",
    position: "Charm",
    recipe: [{ material: "Catseye", amount: 1 }, { material: "Golden Pearl", amount: 2 }],
    stats: { luck: [5, 20], capacity: [10, 40], modifierBoost: [0, 45] },
    sixStarStats: { luck: [5, 22], capacity: [10, 45], modifierBoost: [0, 50] },
    cost: 1500000
  },
  {
    name: "Lightkeeper's Ring",
    rarity: "Legendary",
    position: "Ring",
    recipe: [{ material: "Opal", amount: 2 }, { material: "Luminium", amount: 1 }],
    stats: { digSpeed: [5, 25], sellBoost: [5, 25], modifierBoost: [5, 25] },
    sixStarStats: { digSpeed: [5, 27], sellBoost: [5, 27], modifierBoost: [5, 27] },
    cost: 2000000
  },
  {
    name: "Mass Accumulator",
    rarity: "Legendary",
    position: "Necklace",
    recipe: [{ material: "Aurorite", amount: 1 }, { material: "Uranium", amount: 1 }, { material: "Osmium", amount: 2 }],
    stats: { capacity: [20, 60], sizeBoost: [10, 80] },
    sixStarStats: { capacity: [20, 65], sizeBoost: [10, 90] },
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
    sixStarStats: { luck: [5, 35], sizeBoost: [0, 50], sellBoost: [0, 100] },
    cost: 5000000
  },
  {
    name: "Ring of Harvest",
    rarity: "Legendary",
    position: "Ring",
    recipe: [
      { material: "Lapis Lazuli", amount: 5 }, 
      { material: "Bone", amount: 3 }, 
      { material: "Rock Candy", amount: 10 }, 
      { material: "Lost Soul", amount: 1 }
    ],
    stats: { luck: [5, 18], capacity: [10, 30], walkSpeed: [0.5, 1] },
    sixStarStats: { luck: [5, 20], capacity: [10, 32], walkSpeed: [0.5, 1] },
    cost: 5000000,
    event: true
  },
  {
    name: "Dragon Claw",
    rarity: "Legendary",
    position: "Charm",
    recipe: [{ material: "Ammonite Fossil", amount: 5 }, { material: "Dragon Bone", amount: 2 }],
    stats: { digStrength: [10, 30], shakeStrength: [1, 8] },
    sixStarStats: { digStrength: [10, 32], shakeStrength: [1, 9] },
    cost: 10000000
  },
  {
    name: "Spider Bowtie",
    rarity: "Legendary",
    position: "Necklace",
    recipe: [
      { material: "Emerald", amount: 3 }, 
      { material: "Diamond", amount: 2 }, 
      { material: "Bone", amount: 5 }, 
      { material: "Catseye", amount: 1 }
    ],
    stats: { luck: [10, 80], capacity: [40, 100], sellBoost: [20, 50], modifierBoost: [20, 50] },
    sixStarStats: { luck: [10, 85], capacity: [40, 110], sellBoost: [20, 55], modifierBoost: [20, 55] },
    cost: 300,
    event: true,
    candy: true
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
    sixStarStats: { luck: [10, 100], sizeBoost: [0, 100], sellBoost: [0, 200] },
    cost: 30000000
  },
  {
    name: "Phoenix Heart",
    rarity: "Mythic",
    position: "Necklace",
    recipe: [
      { material: "Uranium", amount: 3 }, 
      { material: "Inferlume", amount: 1 }, 
      { material: "Starshine", amount: 2 }
    ],
    stats: { luck: [100, 300], sizeBoost: [-70, -40] },
    sixStarStats: { luck: [100, 325], sizeBoost: [-70, -35] },
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
    sixStarStats: { luck: [30, 100], capacity: [50, 275], sizeBoost: [0, 50], modifierBoost: [20, 150] },
    cost: 50000000
  },
  {
    name: "Apocalypse Bringer",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Ashvein", amount: 4 },
      { material: "Ruby", amount: 10 },
      { material: "Palladium", amount: 2 },
      { material: "Painite", amount: 1 }
    ],
    stats: { digStrength: [5, 20], luck: [10, 40], shakeStrength: [2, 5], sellBoost: [10, 40] },
    sixStarStats: { digStrength: [5, 22], luck: [10, 45], shakeStrength: [2, 5.5], sellBoost: [10, 45] },
    cost: 50000000
  },
  {
    name: "Amulet of Spirits",
    rarity: "Mythic",
    position: "Necklace",
    recipe: [
      { material: "Vortessence", amount: 1 },
      { material: "Painite", amount: 1 },
      { material: "Bone", amount: 10 },
      { material: "Lost Soul", amount: 5 }
    ],
    stats: { luck: [50, 140], digSpeed: [20, 40], shakeSpeed: [20, 40], sizeBoost: [10, 30] },
    sixStarStats: { luck: [50, 150], digSpeed: [20, 42], shakeSpeed: [20, 42], sizeBoost: [10, 32] },
    cost: 50000000,
    event: true
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
    sixStarStats: { luck: [20, 90], digSpeed: [20, 42], shakeSpeed: [20, 42], sellBoost: [5, 26] },
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
    sixStarStats: { luck: [100, 325], capacity: [-80, -35] },
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
    sixStarStats: {
      luck: [5, 22],
      digStrength: [2, 11],
      capacity: [10, 45],
      digSpeed: [5, 22],
      shakeStrength: [1, 3.2],
      shakeSpeed: [5, 22],
      sellBoost: [10, 22],
      sizeBoost: [5, 22],
      modifierBoost: [5, 22]
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
    sixStarStats: { luck: [100, 275], shakeStrength: [10, 45], shakeSpeed: [-40, -18], sellBoost: [0, 55] },
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
      luck: [20, 100],
      digStrength: [5, 40],
      sizeBoost: [10, 30],
      modifierBoost: [20, 60]
    },
    sixStarStats: {
      luck: [20, 110],
      digStrength: [5, 45],
      sizeBoost: [10, 32],
      modifierBoost: [20, 65]
    },
    cost: 75000000
  },
  {
    name: "Purifying Ring",
    rarity: "Mythic",
    position: "Ring",
    recipe: [
      { material: "Diamond", amount: 5 },
      { material: "Chrysoberyl", amount: 1 },
      { material: "Diopside", amount: 10 },
      { material: "Bismuth", amount: 1 },
      { material: "Mercury", amount: 5 }
    ],
    stats: {
      luck: [20, 80],
      digStrength: [10, 80],
      capacity: [20, 100],
      shakeStrength: [5, 27]
    },
    sixStarStats: {
      luck: [20, 90],
      digStrength: [10, 90],
      capacity: [20, 110],
      shakeStrength: [5, 30]
    },
    cost: 80000000
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
    sixStarStats: {
      luck: [20, 110],
      digStrength: [2, 9],
      digSpeed: [-30, -8],
      shakeStrength: [0, 2.2],
      shakeSpeed: [-30, -8],
      modifierBoost: [5, 22]
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
      luck: [200, 400],
      modifierBoost: [50, 150]
    },
    sixStarStats: {
      luck: [100, 425],
      modifierBoost: [50, 160]
    },
    cost: 150000000
  },
  {
    name: "Candy Sack",
    rarity: "Mythic",
    position: "Charm",
    recipe: [
      { material: "Vortessence", amount: 2 },
      { material: "Cinnabar", amount: 5 },
      { material: "Lost Soul", amount: 10 }
    ],
    stats: { luck: [30, 100], capacity: [100, 300], sizeBoost: [30, 70] },
    sixStarStats: { luck: [30, 110], capacity: [100, 325], sizeBoost: [30, 75] },
    cost: 600,
    event: true,
    candy: true
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
    sixStarStats: { luck: [50, 260], capacity: [50, 225], shakeSpeed: [10, 32], sizeBoost: [0, 55], sellBoost: [0, 110] },
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
    sixStarStats: { luck: [100, 450], digStrength: [100, 215], capacity: [50, 225], digSpeed: [-50, -28], sizeBoost: [30, 110] },
    cost: 200000000
  },
  {
    name: "Pumpkin Lord",
    rarity: "Exotic",
    position: "Charm",
    recipe: [
      { material: "Pumpkin Soul", amount: 1 },
      { material: "Radiant Gold", amount: 1 },
      { material: "Lost Soul", amount: 10 },
    ],
    stats: { digStrength: [80, 200], shakeStrength: [20, 50], sizeBoost: [30, 180], walkSpeed: [1, 4] },
    sixStarStats: { digStrength: [80, 220], shakeStrength: [20, 54], sizeBoost: [30, 200], walkSpeed: [1, 4.5] },
    cost: 220000000,
    event: true
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
    stats: { digSpeed: [10, 40], luck: [100, 580], sizeBoost: [20, 60], modifierBoost: [50, 200] },
    sixStarStats: { digSpeed: [10, 44], luck: [100, 640], sizeBoost: [20, 65], modifierBoost: [50, 220] },
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
    sixStarStats: { digStrength: [20, 90], luck: [50, 155], capacity: [100, 325], shakeStrength: [3, 11] },
    cost: 333000000
  },
  {
    name: "Umbrite Ring",
    rarity: "Exotic",
    position: "Ring",
    recipe: [
      { material: "Chrysoberyl", amount: 3 },
      { material: "Painite", amount: 3 },
      { material: "Dinosaur Skull", amount: 1 },
      { material: "Specterite", amount: 5 },
      { material: "Umbrite", amount: 1 }
    ],
    stats: { luck: [50, 220], digStrength: [5, 40], capacity: [10, 100], shakeStrength: [2, 10], sizeBoost: [5, 15] },
    sixStarStats: { luck: [50, 245], digStrength: [5, 45], capacity: [10, 110], shakeStrength: [2, 11], sizeBoost: [5, 16] },
    cost: 400000000
  },
  {
    name: "Otherworldly Ring",
    rarity: "Exotic",
    position: "Ring",
    recipe: [
      { material: "Astral Spore", amount: 1 },
      { material: "Vineheart", amount: 1 },
      { material: "Red Beryl", amount: 3 },
      { material: "Gloomcap", amount: 10 }
    ],
    stats: { luck: [50, 350], digSpeed: [0, 20], shakeSpeed: [0, 20], sizeBoost: [5, 25], sellBoost: [10, 30] },
    sixStarStats: { luck: [50, 375], digSpeed: [0, 22], shakeSpeed: [0, 22], sizeBoost: [5, 26], sellBoost: [10, 32] },
    cost: 400000000
  },
  {
    name: "Venomshank",
    rarity: "Exotic",
    position: "Necklace",
    recipe: [
      { material: "Star Garnet", amount: 3 },
      { material: "Bismuth", amount: 10 },
      { material: "Mythril", amount: 3 },
      { material: "Bloodstone", amount: 1 },
    ],
    stats: { luck: [600, 1200], digStrength: [-100, -50], digSpeed: [-60, -40], sizeBoost: [20, 50], sellBoost: [20, 50] },
    sixStarStats: { luck: [600, 1300], digStrength: [-100, -45], digSpeed: [-60, -38], sizeBoost: [20, 55], sellBoost: [20, 55] },
    cost: 500000000
  },
  {
    name: "Witch Hat",
    rarity: "Exotic",
    position: "Charm",
    recipe: [
      { material: "Pumpkin Soul", amount: 1 },
      { material: "Volcanic Core", amount: 1 },
      { material: "Inferlume", amount: 1 },
      { material: "Prismara", amount: 1 },
      { material: "Cryonic Artifact", amount: 1 },
    ],
    stats: { luck: [400, 1000], modifierBoost: [40, 100], walkSpeed: [1, 5] },
    sixStarStats: { luck: [400, 1100], modifierBoost: [40, 110], walkSpeed: [1, 5.5] },
    cost: 1000,
    event: true,
    candy: true
  },
];

// Note: The maxWeight values for each ore are determined by specific game mechanics.
// They represent the maximum weight (in kg) at which the museum effect's maximum modifier is achieved.
// Adjust these values carefully if game balance changes, and refer to game design documentation for details.
export const ores: Ore[] = [
  // Common
  { name: "Amethyst", rarity: "Common", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.05 }, maxWeight: 16 },
  { name: "Blue Ice", rarity: "Common", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.05 }, maxWeight: 39 },
  { name: "Copper", rarity: "Common", museumEffect: { stat: "Size Boost", maxMultiplier: 0.04 }, maxWeight: 60 },
  { name: "Gold", rarity: "Common", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.05 }, maxWeight: 20 },
  { name: "Obsidian", rarity: "Common", museumEffect: { stat: "Size Boost", maxMultiplier: 0.04 }, maxWeight: 30 },
  { name: "Pearl", rarity: "Common", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.05 }, maxWeight: 19 },
  { name: "Platinum", rarity: "Common", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.05 }, maxWeight: 32 },
  { name: "Pyrite", rarity: "Common", museumEffect: { stat: "Capacity", maxMultiplier: 0.05 }, maxWeight: 55 },
  { name: "Seashell", rarity: "Common", museumEffect: { stat: "Capacity", maxMultiplier: 0.05 }, maxWeight: 19 },
  { name: "Silver", rarity: "Common", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.05 }, maxWeight: 36 },
  
  // Uncommon
  { name: "Coral", rarity: "Uncommon", museumEffect: { stat: "Capacity", maxMultiplier: 0.08 }, maxWeight: 10 },
  { name: "Glowberry", rarity: "Uncommon", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.08 }, maxWeight: 40 },
  { name: "Malachite", rarity: "Uncommon", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.08 }, maxWeight: 18 },
  { name: "Neodymium", rarity: "Uncommon", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.08 }, maxWeight: 40 },
  { name: "Rock Candy", rarity: "Uncommon", museumEffect: { stat: "Size Boost", maxMultiplier: 0.05 }, maxWeight: 45 },
  { name: "Sapphire", rarity: "Uncommon", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.08 }, maxWeight: 21 },
  { name: "Smoky Quartz", rarity: "Uncommon", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.08 }, maxWeight: 22 },
  { name: "Titanium", rarity: "Uncommon", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.08 }, maxWeight: 40 },
  { name: "Topaz", rarity: "Uncommon", museumEffect: { stat: "Capacity", maxMultiplier: 0.08 }, maxWeight: 22 },
  { name: "Zircon", rarity: "Uncommon", museumEffect: { stat: "Size Boost", maxMultiplier: 0.05 }, maxWeight: 15 },
  { name: "Electrum", rarity: "Uncommon", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.08 }, maxWeight: 40 },
  
  // Rare
  { name: "Amber", rarity: "Rare", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.13 }, maxWeight: 21 },
  { name: "Azuralite", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.13 }, maxWeight: 30 },
  { name: "Glacial Quartz", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.13 }, maxWeight: 42 },
  { name: "Gloomberry", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.13 }, maxWeight: 40 },
  { name: "Jade", rarity: "Rare", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.13 }, maxWeight: 40 },
  { name: "Lapis Lazuli", rarity: "Rare", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.13 }, maxWeight: 32 },
  { name: "Meteoric Iron", rarity: "Rare", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.13 }, maxWeight: 40 },
  { name: "Onyx", rarity: "Rare", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.13 }, maxWeight: 32 },
  { name: "Peridot", rarity: "Rare", museumEffect: { stat: "Luck", maxMultiplier: 0.13 }, maxWeight: 20 },
  { name: "Pyrelith", rarity: "Rare", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.13 }, maxWeight: 30 },
  { name: "Ruby", rarity: "Rare", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.13 }, maxWeight: 20 },
  { name: "Silver Clamshell", rarity: "Rare", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.13 }, maxWeight: 21 },
  { name: "Diopside", rarity: "Rare", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.13 }, maxWeight: 21 },

  // Epic
  { name: "Ammonite Fossil", rarity: "Epic", museumEffect: { stat: "Capacity", maxMultiplier: 0.2 }, maxWeight: 49 },
  { name: "Ashvein", rarity: "Epic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.14 }, maxWeight: 20 },
  { name: "Aurorite", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 30 },
  { name: "Bone", rarity: "Epic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.14 }, maxWeight: 47 },
  { name: "Borealite", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 20 },
  { name: "Cobalt", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 38 },
  { name: "Emerald", rarity: "Epic", museumEffect: { stat: "Luck", maxMultiplier: 0.2 }, maxWeight: 20 },
  { name: "Glowmoss", rarity: "Epic", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.2 }, maxWeight: 60 },
  { name: "Golden Pearl", rarity: "Epic", museumEffect: { stat: "Capacity", maxMultiplier: 0.2 }, maxWeight: 19 },
  { name: "Iridium", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 40 },
  { name: "Lightshard", rarity: "Epic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.2 }, maxWeight: 20 },
  { name: "Moonstone", rarity: "Epic", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.2 }, maxWeight: 48 },
  { name: "Opal", rarity: "Epic", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.2 }, maxWeight: 20 },
  { name: "Osmium", rarity: "Epic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.2 }, maxWeight: 80 },
  { name: "Pyronium", rarity: "Epic", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.2 }, maxWeight: 55 },
  { name: "Mercury", rarity: "Epic", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.2 }, maxWeight: 78 },
  
  // Legendary
  { name: "Aetherite", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Aquamarine", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Catseye", rarity: "Legendary", museumEffect: { stat: "Capacity", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Cinnabar", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 20 },
  { name: "Diamond", rarity: "Legendary", museumEffect: { stat: "Luck", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Dragon Bone", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 50 },
  { name: "Fire Opal", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 20 },
  { name: "Firefly Stone", rarity: "Legendary", museumEffect: { stat: "Capacity", maxMultiplier: 0.3 }, maxWeight: 60 },
  { name: "Lost Soul", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 20 },
  { name: "Luminium", rarity: "Legendary", museumEffect: { stat: "Capacity", maxMultiplier: 0.3 }, maxWeight: 40 },
  { name: "Palladium", rarity: "Legendary", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.3 }, maxWeight: 40 },
  { name: "Rose Gold", rarity: "Legendary", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.3 }, maxWeight: 40 },
  { name: "Specterite", rarity: "Legendary", museumEffect: { stat: "Shake Speed", maxMultiplier: 0.3 }, maxWeight: 10 },
  { name: "Starshine", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.15 }, 
    specialEffects: { digSpeed: 0.15, shakeSpeed: 0.15 }, maxWeight: 20 },
  { name: "Tourmaline", rarity: "Legendary", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.3 }, maxWeight: 25 },
  { name: "Uranium", rarity: "Legendary", museumEffect: { stat: "Modifier Boost", maxMultiplier: 0.3 }, maxWeight: 59 },
  { name: "Volcanic Key", rarity: "Legendary", museumEffect: { stat: "Size Boost", maxMultiplier: 0.21 }, maxWeight: 20 },
  { name: "Bismuth", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 78 },
  { name: "Gloomcap", rarity: "Legendary", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.3 }, maxWeight: 20 },
  
  // Mythic
  { name: "Chrysoberyl", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 }, maxWeight: 21 },
  { name: "Flarebloom", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.75 },
    specialEffects: { luck: 0.75, sizeBoost: -0.5 }, maxWeight: 21 },
  { name: "Frostshard", rarity: "Mythic", museumEffect: { stat: "Dig Strength", maxMultiplier: 0.5 }, maxWeight: 20 },
  { name: "Inferlume", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 }, maxWeight: 20 },
  { name: "Mythril", rarity: "Mythic", museumEffect: { stat: "Shake Strength", maxMultiplier: 0.5 }, maxWeight: 60 },
  { name: "Painite", rarity: "Mythic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.35 }, maxWeight: 20 },
  { name: "Pink Diamond", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 }, maxWeight: 20 },
  { name: "Prismara", rarity: "Mythic", museumEffect: { stat: "Luck", maxMultiplier: 0.25 }, 
    specialEffects: { luck: 0.25, capacity: 0.25, digStrength: 0.25, shakeStrength: 0.25 }, maxWeight: 20 },
  { name: "Radiant Gold", rarity: "Mythic", museumEffect: { stat: "Sell Boost", maxMultiplier: 0.5 }, maxWeight: 60 }, 
  { name: "Vortessence", rarity: "Mythic", museumEffect: { stat: "Capacity", maxMultiplier: 0.5 }, maxWeight: 20 },
  { name: "Volcanic Core", rarity: "Mythic", museumEffect: { stat: "Dig Strength", maxMultiplier: 0.25 },
    specialEffects: { digStrength: 0.25, sizeBoost: 0.2 }, maxWeight: 20 },
  { name: "Star Garnet", rarity: "Mythic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.35 }, maxWeight: 20 },
  { name: "Red Beryl", rarity: "Mythic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.35 }, maxWeight: 20 },
  
  // Exotic
  { name: "Cryogenic Artifact", rarity: "Exotic", museumEffect: { stat: "Dig Strength", maxMultiplier: 1.2 },
    specialEffects: { digStrength: 1.2, shakeStrength: 1.2, digSpeed: -0.8, shakeSpeed: -0.8 }, maxWeight: 20 },
  { name: "Dinosaur Skull", rarity: "Exotic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.4 },
    specialEffects: { sizeBoost: 0.4, sellBoost: 0.32 }, maxWeight: 100 },
  { name: "Pumpkin Soul", rarity: "Exotic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.56 }, maxWeight: 40 },
  { name: "Vineheart", rarity: "Exotic", museumEffect: { stat: "Luck", maxMultiplier: 0.8 }, maxWeight: 40 }, 
  { name: "Umbrite", rarity: "Exotic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.4 },
    specialEffects: { digSpeed: 0.4, shakeSpeed: 0.4 }, maxWeight: 30 },
  { name: "Voidstone", rarity: "Exotic", museumEffect: { stat: "Luck", maxMultiplier: 0.5 },
    specialEffects: { luck: 0.4, capacity: 0.4 }, maxWeight: 20 },
  { name: "Bloodstone", rarity: "Exotic", museumEffect: { stat: "Size Boost", maxMultiplier: 0.56 }, maxWeight: 40 },
  { name: "Astral Spore", rarity: "Exotic", museumEffect: { stat: "Dig Speed", maxMultiplier: 0.8 }, maxWeight: 20 },
];

export const modifiers = [
  { name: "Shiny", effect: "Shake Strength" },
  { name: "Pure", effect: "Dig Speed" },
  { name: "Glowing", effect: "Shake Speed" },
  { name: "Scorching", effect: "Dig Strength" },
  { name: "Irradiated", effect: "Modifier Boost" },
  { name: "Crystalline", effect: "Size Boost" },
  { name: "Iridescent", effect: "Luck" },
  { name: "Treasured", effect: "2x Luck" },
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
      return 0.08;
    default:
      return 0.01;
  }
};

export const shovels: Shovel[] = [
  { name: "Rusty Shovel", stats: { digStrength: 2, digSpeed: 80, toughness: 1 }, price: 0 },
  { name: "Iron Shovel", stats: { digStrength: 2, digSpeed: 80, toughness: 1 }, price: 3000 },
  { name: "Steel Shovel", stats: { digStrength: 3, digSpeed: 80, toughness: 2 }, price: 25000 },
  { name: "Silver Shovel", stats: { digStrength: 4, digSpeed: 110, toughness: 2 }, price: 75000 },
  { name: "Reinforced Shovel", stats: { digStrength: 5, digSpeed: 90, toughness: 3 }, price: 135000 },
  { name: "The Excavator", stats: { digStrength: 7, digSpeed: 70, toughness: 3 }, price: 320000 },
  { name: "Golden Shovel", stats: { digStrength: 8, digSpeed: 100, toughness: 3 }, price: 1333000 },
  { name: "Meteoric Shovel", stats: { digStrength: 7, digSpeed: 150, toughness: 4 }, price: 4000000 },
  { name: "Diamond Shovel", stats: { digStrength: 12, digSpeed: 100, toughness: 4 }, price: 12500000 },
  { name: "Divine Shovel", stats: { digStrength: 16, digSpeed: 110, toughness: 5 }, price: 40000000 },
  { name: "Earthbreaker Shovel", stats: { digStrength: 25, digSpeed: 100, toughness: 5 }, price: 125000000 },
  { name: "Dragonflame Shovel", stats: { digStrength: 50, digSpeed: 60, toughness: 5 }, price: 400000000 },
  { name: "Fossilized Shovel", stats: { digStrength: 40, digSpeed: 100, toughness: 6 }, price: 1000000000 },
  { name: "Galactic Shovel", stats: { digStrength: 60, digSpeed: 80, toughness: 6 }, price: 2000000000, event: true },
  { name: "Icebreaker Shovel", stats: { digStrength: 60, digSpeed: 110, toughness: 6 }, price: 10000000000 },
  { name: "Lifetouched Shovel", stats: { digStrength: 100, digSpeed: 100, toughness: 7 }, price: 80000000000 },
  { name: "Pumpkin Shovel", stats: { digStrength: 100, digSpeed: 125, toughness: 8 }, price: 1000, candy: true, event: true },
  { name: "Abyssal Shovel", stats: { digStrength: 125, digSpeed: 110, toughness: 8 }, price: 200000000000 },
  { name: "Venomspade", stats: { digStrength: 200, digSpeed: 80, toughness: 8 }, price: 500000000000 }
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
  { name: "Galactic Pan", stats: { luck: 100, capacity: 500, shakeStrength: 25, shakeSpeed: 100 }, passive: "Size boost of (+25%) and has a chance to give Voidtorn items", price: 2000000000, event: true },
  { name: "Frostbite Pan", stats: { luck: 300, capacity: 250, shakeStrength: 15, shakeSpeed: 80 }, passive: "Size boost of (+25%)", price: 10000000000 },
  { name: "Lifetouched Pan", stats: { luck: 400, capacity: 300, shakeStrength: 8, shakeSpeed: 110 }, passive: "Modifier boost of (+50%)", price: 100000000000 },
  { name: "Pumpkin Pan", stats: { luck: 350, capacity: 350, shakeStrength: 20, shakeSpeed: 100 }, passive: "Summons a ghostly spirit", price: 1000, candy: true, event: true },
  { name: "Abyssal Pan", stats: { luck: 700, capacity: 250, shakeStrength: 8, shakeSpeed: 110 }, passive: "Size boost of (+20%)", price: 200000000000 },
  { name: "Blightflow Pan", stats: { luck: 500, capacity: 400, shakeStrength: 30, shakeSpeed: 200 }, passive: "Size boost of (+25%)", price: 500000000000 }
];

export const enchants: Enchant[] = [
  { name: "Strong", effects: { capacity: 20 } },
  { name: "Forceful", effects: { shakeStrength: 2 } },
  { name: "Swift", effects: { shakeSpeed: 10 } },
  { name: "Lucky", effects: { luck: 5 } },
  { name: "Gigantic", effects: { capacity: 40 } },
  { name: "Blessed", effects: { capacity: 25, luck: 10 } },
  { name: "Glowing", effects: { shakeSpeed: 25 } },
  { name: "Destructive", effects: { shakeStrength: 5 } },
  { name: "Titanic", effects: { sizeBoost: 20, capacity: 30 } },
  { name: "Greedy", effects: { sellBoost: 20 } },
  { name: "Midas", effects: { sellBoost: 50 } },
  { name: "Boosting", effects: { sizeBoost: 10 } },
  { name: "Unstable", effects: { modifierBoost: 25 } },
  { name: "Divine", effects: { luck: 20, capacity: 40 } },
  { name: "Cosmic", effects: { capacity: 50, shakeStrength: 3, sizeBoost: 25 } },
  { name: "Prismatic", effects: { capacity: 20, shakeStrength: 2, sizeBoost: 10, luck: 10, shakeSpeed: 10, modifierBoost: 10 } },
  { name: "Infernal", effects: { luck: 80, capacity: -20, sizeBoost: -10 } }
];

export interface Event {
  name: string;
  effects: Effects;
}

export const events: Event[] = [
  { name: "Meteor Shower", effects: { luck: 2 } },
  { name: "Admin Shower", effects: { luck: 2, digStrength: 2, shakeStrength: 2 } },
  { name: "Candy Corn", effects: { luck: 1.5 } },
  { name: "Ghost Gummy", effects: { digStrength: 1.5, shakeStrength: 1.5 } },
  { name: "Admin 4x Luck", effects: { luck: 4 } },
  { name: "Admin 8x Luck", effects: { luck: 8 } },
  { name: "Luck Totem", effects: { luck: 2 } },
  { name: "Strength Totem", effects: { digStrength: 2, shakeStrength: 2 } },
  { name: "Luminant Totem", effects: { capacity: 1.5 } },
  { name: "Perfect Dig", effects: { digStrength: 1.5 } },
  { name: "Blizzard", effects: { luck: 2 } },
  { name: "Codes", effects: { luck: 2 } },
  { name: "Daily luck bonus", effects: { luck: 2 } },
  { name: "Friends", effects: { luck: 1.5 } },
  { name: "Nimue's Blessing", effects: { luck: 2 } },
  { name: "Hallows' Eve", effects: { luck: 2 } }
];
