import { useKV } from '@github/spark/hooks';
import { useState, useEffect, useRef } from 'react';
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

// Używamy sentinela null aby odróżnić stan "jeszcze się hydrate'uje" od realnej pustej wartości [] / {}.
const DEFAULT_EQUIPMENT: EquipmentSlot = {
  rings: new Array(8).fill(null),
  necklace: null,
  charm: null,
  shovel: null,
  pan: null,
  enchant: null,
  customStats: {},
  activeEvents: []
};

export function useAppData() {
  const [isLoading, setIsLoading] = useState(true);

  // Wszystkie wartości startują jako null (sentinel). Po hydracji useKV nadpisze je danymi z magazynu.
  const [craftingItems, setCraftingItems] = useKV<CraftingItem[] | null>('crafting-items', null);
  const [museumSlots, setMuseumSlots] = useKV<MuseumSlot[] | null>('museum-slots', null);
  const [equipment, setEquipment] = useKV<EquipmentSlot | null>('equipment', null);
  const [collectibles, setCollectibles] = useKV<CollectibleOre[] | null>('collectibles', null);
  const [ownedMaterials, setOwnedMaterials] = useKV<{[key: string]: number} | null>('owned-materials', null);

  // Flaga do zabezpieczenia że nie ustawimy domyślnych wartości zanim wszystkie hooki dostaną szansę na hydrację.
  const postHydrationDefaultsApplied = useRef(false);

  // Sprawdzamy hydrację: dopiero gdy wszystkie wartości !== null kończymy loading.
  useEffect(() => {
    if (
      craftingItems !== null &&
      museumSlots !== null &&
      equipment !== null &&
      collectibles !== null &&
      ownedMaterials !== null
    ) {
      setIsLoading(false);
    }
  }, [craftingItems, museumSlots, equipment, collectibles, ownedMaterials]);

  // Po zakończeniu ładowania uzupełniamy brakujące (null) wartości domyślne i robimy to raz.
  useEffect(() => {
    if (!isLoading && !postHydrationDefaultsApplied.current) {
      if (craftingItems === null) setCraftingItems([]);
      if (museumSlots === null) setMuseumSlots([]);
      if (equipment === null) setEquipment(DEFAULT_EQUIPMENT);
      if (collectibles === null) setCollectibles([]);
      if (ownedMaterials === null) setOwnedMaterials({});
      postHydrationDefaultsApplied.current = true;
    }
  }, [isLoading, craftingItems, museumSlots, equipment, collectibles, ownedMaterials, setCraftingItems, setMuseumSlots, setEquipment, setCollectibles, setOwnedMaterials]);
  
  // Migration for activeEvents if it doesn't exist
  useEffect(() => {
    if (equipment && !equipment.activeEvents && !isLoading) {
      setEquipment({ ...equipment, activeEvents: [] });
    }
  }, [equipment, setEquipment, isLoading]);

  // Helper: zwraca zawsze zsanityzowany snapshot aplikacji (bez null), opcjonalnie pozwala nadpisać część pól.
  const buildSnapshot = (overrides?: Partial<{
    craftingItems: CraftingItem[];
    museumSlots: MuseumSlot[];
    equipment: EquipmentSlot;
    collectibles: CollectibleOre[];
    ownedMaterials: { [key: string]: number };
  }>) => {
    const sanitizedEquipment = (equipment ?? DEFAULT_EQUIPMENT);
    return {
      craftingItems: (craftingItems ?? []),
      museumSlots: (museumSlots ?? []),
      equipment: sanitizedEquipment.activeEvents ? sanitizedEquipment : { ...sanitizedEquipment, activeEvents: [] },
      collectibles: (collectibles ?? []),
      ownedMaterials: (ownedMaterials ?? {}),
      ...overrides
    };
  };

  const exportData = () => {
    const base = buildSnapshot();
    const data = {
      ...base,
      exportDate: new Date().toISOString(),
      version: '1.1'
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
    const base = buildSnapshot();
    const data = {
      ...Object.fromEntries(
        Object.entries(selectedData).map(([k, v]) => [k, v ?? (base as any)[k]])
      ),
      exportDate: new Date().toISOString(),
      version: '1.1'
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
    const base = buildSnapshot();
    const data = {
      ...base,
      exportDate: new Date().toISOString(),
      version: '1.1'
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
    const base = buildSnapshot();
    const data = {
      ...Object.fromEntries(
        Object.entries(selectedData).map(([k, v]) => [k, v ?? (base as any)[k]])
      ),
      exportDate: new Date().toISOString(),
      version: '1.1'
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
    // Wsteczna kompatybilność: dopisz activeEvents jeśli brak.
    if (data.equipment && !data.equipment.activeEvents) {
      data.equipment.activeEvents = [];
    }
    if ('craftingItems' in data) setCraftingItems(data.craftingItems ?? []);
    if ('museumSlots' in data) setMuseumSlots(data.museumSlots ?? []);
    if ('equipment' in data) setEquipment(data.equipment ?? DEFAULT_EQUIPMENT);
    if ('collectibles' in data) setCollectibles(data.collectibles ?? []);
    if ('ownedMaterials' in data) setOwnedMaterials(data.ownedMaterials ?? {});
  };

  const importDataSelective = (data: any, selection: any) => {
    // Create backup before import
    createBackupBeforeImport();
    
    if (selection.craftingItems && 'craftingItems' in data) setCraftingItems(data.craftingItems ?? []);
    if (selection.museumSlots && 'museumSlots' in data) setMuseumSlots(data.museumSlots ?? []);
    if (selection.equipment && 'equipment' in data) {
      if (data.equipment && !data.equipment.activeEvents) data.equipment.activeEvents = [];
      setEquipment(data.equipment ?? DEFAULT_EQUIPMENT);
    }
    if (selection.collectibles && 'collectibles' in data) setCollectibles(data.collectibles ?? []);
    if (selection.ownedMaterials && 'ownedMaterials' in data) setOwnedMaterials(data.ownedMaterials ?? {});
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

  // Backup system for imports
  const createBackupBeforeImport = () => {
    const snapshot = buildSnapshot();
    const backupData = {
      metadata: {
        name: 'Import Backup',
        description: 'Automatic backup created before import',
        createdAt: new Date().toISOString(),
        version: '1.1',
        isBackup: true
      },
      ...snapshot
    };
    
    // Store backup in slot 6 (index 5)
    const saves = getSaves();
    saves[5] = backupData;
    localStorage.setItem('prospecting-saves', JSON.stringify(saves));
  };

  // Save system (5 slots + 1 backup slot)
  const getSaves = () => {
    try {
      const saves = localStorage.getItem('prospecting-saves');
      return saves ? JSON.parse(saves) : new Array(6).fill(null);
    } catch (error) {
      console.error('Error loading saves:', error);
      return new Array(6).fill(null);
    }
  };

  const saveToSlot = (slotIndex: number, metadata: any) => {
    if (slotIndex < 0 || slotIndex >= 5) {
      throw new Error('Invalid save slot index. Must be 0-4.');
    }

    const snapshot = buildSnapshot();
    const saveData = {
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        version: '1.1'
      },
      ...snapshot
    };

    const saves = getSaves();
    saves[slotIndex] = saveData;
    localStorage.setItem('prospecting-saves', JSON.stringify(saves));
  };

  const loadFromSlot = (slotIndex: number) => {
    if (slotIndex < 0 || slotIndex >= 6) {
      throw new Error('Invalid save slot index. Must be 0-5.');
    }

    const saves = getSaves();
    const saveData = saves[slotIndex];
    
    if (!saveData) {
      throw new Error('No save data in this slot.');
    }

    // Create backup before loading (except when loading backup itself)
    if (slotIndex !== 5) {
      createBackupBeforeImport();
    }

    // Import the save data
    importData(saveData);
    return saveData;
  };

  const deleteSave = (slotIndex: number) => {
    if (slotIndex < 0 || slotIndex >= 5) {
      throw new Error('Invalid save slot index. Must be 0-4.');
    }

    const saves = getSaves();
    saves[slotIndex] = null;
    localStorage.setItem('prospecting-saves', JSON.stringify(saves));
  };

  return {
    isLoading,
    // Ekspozycja zawsze jako nie-null dla wygody komponentów konsumujących hook.
    craftingItems: (craftingItems ?? []),
    setCraftingItems,
    museumSlots: (museumSlots ?? []),
    setMuseumSlots,
    equipment: (equipment ?? DEFAULT_EQUIPMENT),
    setEquipment,
    collectibles: (collectibles ?? []),
    setCollectibles,
    ownedMaterials: (ownedMaterials ?? {}),
    setOwnedMaterials,
    exportData,
    exportDataSelective,
    exportToUrl,
    exportToUrlSelective,
    importData,
    importDataSelective,
    importFromUrl,
    // Save system
    getSaves,
    saveToSlot,
    loadFromSlot,
    deleteSave,
    createBackupBeforeImport
  };
}