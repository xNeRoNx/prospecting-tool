/**
 * Museum slot counts per rarity tier.
 * Defines how many display cases are available for each ore rarity.
 */
export const RARITY_SLOT_COUNTS = {
  'Exotic': 1,
  'Mythic': 2,
  'Legendary': 3,
  'Epic': 3,
  'Rare': 3,
  'Uncommon': 3,
  'Common': 3
} as const;

/**
 * Display order for rarity tiers (from rarest to most common).
 * Used for consistent ordering throughout the museum UI.
 */
export const RARITY_ORDER = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'] as const;

/**
 * Ore rarity tier type.
 */
export type Rarity = keyof typeof RARITY_SLOT_COUNTS;