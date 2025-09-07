import { useKV } from '@github/spark/hooks';
import { useState, useEffect } from 'react';
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
  activeEvents: string[];
}

export interface CollectibleOre {
  ore: string;
  quantity: number;
  completed: boolean;
  modifier?: string;
  id: string;
  ownedQuantity?: number;
  weight?: number;
}

export function useAppData() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [craftingItems, setCraftingItems] = useKV<CraftingItem[]>('crafting-items', []);
  const [museumSlots, setMuseumSlots] = useKV<MuseumSlot[]>('museum-slots', []);
  const [equipment, setEquipment] = useKV<EquipmentSlot>('equipment', {
    rings: new Array(8).fill(null),
    necklace: null,
    charm: null,
    shovel: null,
    pan: null,
    enchant: null,
    customStats: {},
    activeEvents: []
  });
  
  const [collectibles, setCollectibles] = useKV<CollectibleOre[]>('collectibles', []);
  const [ownedMaterials, setOwnedMaterials] = useKV<{[key: string]: number}>('owned-materials', {});

  // Check if all data is loaded
  useEffect(() => {
    const checkLoading = () => {
      // All hooks should have resolved their initial values
      if (craftingItems !== null && 
          museumSlots !== null && 
          equipment !== null && 
          collectibles !== null && 
          ownedMaterials !== null) {
        setIsLoading(false);
      }
    };

    checkLoading();
  }, [craftingItems, museumSlots, equipment, collectibles, ownedMaterials]);
  
  // Migration for activeEvents if it doesn't exist
  useEffect(() => {
    if (equipment && !equipment.activeEvents && !isLoading) {
      setEquipment(current => ({ ...current, activeEvents: [] }));
    }
  }, [equipment, setEquipment, isLoading]);

  const exportData = () => {
    const data = {
      craftingItems,
      museumSlots,
      equipment,
      collectibles,
      ownedMaterials,
      exportDate: new Date().toISOString(),
      version: '1.0'
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

  const exportDataSelective = (selectedData: any) => {
    const data = {
      ...selectedData,
      exportDate: new Date().toISOString(),
      version: '1.0'
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

  const exportToUrl = () => {
    const data = {
      craftingItems,
      museumSlots,
      equipment,
      collectibles,
      ownedMaterials,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    try {
      const compressed = btoa(JSON.stringify(data));
      const url = `${window.location.origin}${window.location.pathname}#data=${compressed}`;
      navigator.clipboard.writeText(url);
      return { success: true, url };
    } catch (error) {
      console.error('Error creating URL:', error);
      return { success: false, error };
    }
  };

  const exportToUrlSelective = (selectedData: any) => {
    const data = {
      ...selectedData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    try {
      const compressed = btoa(JSON.stringify(data));
      const url = `${window.location.origin}${window.location.pathname}#data=${compressed}`;
      return { success: true, url };
    } catch (error) {
      console.error('Error creating URL:', error);
      return { success: false, error };
    }
  };

  const importData = (data: any) => {
    if (data.craftingItems) {
      setCraftingItems(data.craftingItems);
    }
    if (data.museumSlots) {
      setMuseumSlots(data.museumSlots);
    }
    if (data.equipment) {
      setEquipment(data.equipment);
    }
    if (data.collectibles) {
      setCollectibles(data.collectibles);
    }
    if (data.ownedMaterials) {
      setOwnedMaterials(data.ownedMaterials);
    }
  };

  const importDataSelective = (data: any, selection: any) => {
    if (selection.craftingItems && data.craftingItems) {
      setCraftingItems(data.craftingItems);
    }
    if (selection.museumSlots && data.museumSlots) {
      setMuseumSlots(data.museumSlots);
    }
    if (selection.equipment && data.equipment) {
      setEquipment(data.equipment);
    }
    if (selection.collectibles && data.collectibles) {
      setCollectibles(data.collectibles);
    }
    if (selection.ownedMaterials && data.ownedMaterials) {
      setOwnedMaterials(data.ownedMaterials);
    }
  };

  const importFromUrl = (url: string) => {
    try {
      const hashData = url.split('#data=')[1];
      if (!hashData) {
        throw new Error('No data found in URL');
      }
      
      const decompressed = atob(hashData);
      const data = JSON.parse(decompressed);
      return { success: true, data };
    } catch (error) {
      console.error('Error importing from URL:', error);
      return { success: false, error };
    }
  };

  return {
    isLoading,
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
    exportDataSelective,
    exportToUrl,
    exportToUrlSelective,
    importData,
    importDataSelective,
    importFromUrl
  };
}