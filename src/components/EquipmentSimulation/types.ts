export interface StatMap {
  [key: string]: number;
}

export interface EquipmentStats {
  luck: number;
  digStrength: number;
  digSpeed: number;
  shakeStrength: number;
  shakeSpeed: number;
  capacity: number;
  sellBoost: number;
  sizeBoost: number;
  modifierBoost: number;
  toughness: number;
  [key: string]: number;
}

export interface EventMultipliers {
  preTotals: StatMap;
  postTotals: StatMap;
}
