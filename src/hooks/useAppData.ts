import { useKV } from '@github/spark/hooks';
import type { CraftableItem } from '../lib/gameData';

export interface CraftingItem {
  item: CraftableItem;
  quantity: number;
  completed: boolean;
  id: string;
}

export interface MaterialSummary {
  [material: string]: {
    needed: number;
    owned: number;
    weight?: number;
  };
}

export interface MuseumSlot {
  ore?: string;
  modifier?: string;
  weight?: number;
  id: string;
}

export interface EquipmentSlot {
  rings: (CraftableItem | null)[];
  necklace: CraftableItem | null;
  charm: CraftableItem | null;
  shovel: string | null;
  pan: string | null;
  enchant: string | null;
  customStats: {
    [key: string]: number;
  };
}

export interface CollectibleOre {
  ore: string;
  quantity: number;
  completed: boolean;
  id: string;
}

export function useAppData() {
  const [craftingItems, setCraftingItems] = useKV<CraftingItem[]>('crafting-items', []);
  const [museumSlots, setMuseumSlots] = useKV<MuseumSlot[]>('museum-slots', []);
  const [equipment, setEquipment] = useKV<EquipmentSlot>('equipment', {
    rings: new Array(8).fill(null),
    necklace: null,
    charm: null,
    shovel: null,
    pan: null,
    enchant: null,
    customStats: {}
  });
  const [collectibles, setCollectibles] = useKV<CollectibleOre[]>('collectibles', []);
  const [ownedMaterials, setOwnedMaterials] = useKV<{[key: string]: number}>('owned-materials', {});

  const exportData = () => {
    const data = {
      craftingItems,
      museumSlots,
      equipment,
      collectibles,
      ownedMaterials,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospecting-tools-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: any) => {
    if (data.craftingItems) setCraftingItems(data.craftingItems);
    if (data.museumSlots) setMuseumSlots(data.museumSlots);
    if (data.equipment) setEquipment(data.equipment);
    if (data.collectibles) setCollectibles(data.collectibles);
    if (data.ownedMaterials) setOwnedMaterials(data.ownedMaterials);
  };

  return {
    craftingItems,
    setCraftingItems,
    museumSlots,
    setMuseumSlots,
    equipment,
    setEquipment,
    collectibles,
    setCollectibles,
    ownedMaterials,
    setOwnedMaterials,
    exportData,
    importData
  };
}