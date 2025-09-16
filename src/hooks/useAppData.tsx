import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { encodeDataForUrl, decodeDataFromUrl } from '@/lib/urlCompression';
import { useLocalStorageState } from './useLocalStorage';
import type { CraftableItem } from '../lib/gameData';

export interface CraftingItem { 
	item: CraftableItem; 
	quantity: number; 
	completed: boolean; 
	id: string; 
	craftedCount: number; 
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
	ringsSix?: boolean[];
	necklace: CraftableItem | null; 
	necklaceSix?: boolean;
	charm: CraftableItem | null; 
	charmSix?: boolean;
	shovel: string | null; 
	pan: string | null; 
	enchant: string | null; 
	customStats: { [key: string]: number }; 
	activeEvents: string[];
}

const DEFAULT_EQUIPMENT: EquipmentSlot = { 
	rings: new Array(8).fill(null), 
	ringsSix: new Array(8).fill(false),
	necklace: null, 
	necklaceSix: false,
	charm: null, 
	charmSix: false,
	shovel: null, 
	pan: null, 
	enchant: null, 
	customStats: {}, 
	activeEvents: [] 
};

interface AppDataContextValue {
	isLoading: boolean;
	craftingItems: CraftingItem[]; setCraftingItems: (v: any) => void;
	museumSlots: MuseumSlot[]; setMuseumSlots: (v: any) => void;
	equipment: EquipmentSlot; setEquipment: (v: any) => void;
	ownedMaterials: { [key: string]: number }; setOwnedMaterials: (v: any) => void;
	exportData: () => void; exportDataSelective: (selectedData: any) => void;
	exportToUrl: () => { success: boolean; url?: string; error?: any };
	exportToUrlSelective: (selectedData: any) => { success: boolean; url?: string; error?: any };
	importData: (data: any) => void; importDataSelective: (data: any, selection: any) => void; importFromUrl: (url: string) => { success: boolean; data?: any; error?: any };
	getSaves: () => any[]; saveToSlot: (slotIndex: number, metadata: any) => void; loadFromSlot: (slotIndex: number) => any; deleteSave: (slotIndex: number) => void; createBackupBeforeImport: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function useProvideAppData(): AppDataContextValue {
	const [isLoading, setIsLoading] = useState(true);
	const [craftingItems, setCraftingItems] = useLocalStorageState<CraftingItem[] | null>('crafting-items', null);
	const [museumSlots, setMuseumSlots] = useLocalStorageState<MuseumSlot[] | null>('museum-slots', null);
	const [equipment, setEquipment] = useLocalStorageState<EquipmentSlot | null>('equipment', null);
	const [ownedMaterials, setOwnedMaterials] = useLocalStorageState<{ [key: string]: number } | null>('owned-materials', null);

	// Initialize default values and set isLoading=false when everything is ready.
	useEffect(() => {
		// Set default structures only if missing (null in localStorage)
		if (craftingItems === null) setCraftingItems([]);
		if (museumSlots === null) setMuseumSlots([]);
		if (equipment === null) setEquipment(DEFAULT_EQUIPMENT);
		if (ownedMaterials === null) setOwnedMaterials({});

		// Migration: add craftedCount if missing
		if (craftingItems !== null) {
			let needsMigration = false;
			const migrated = craftingItems.map(ci => {
				if (ci.craftedCount === undefined) {
					needsMigration = true;
					return { ...ci, craftedCount: ci.completed ? ci.quantity : 0 } as CraftingItem;
				}
				return ci;
			});
			if (needsMigration) setCraftingItems(migrated);
		}

		const allReady = craftingItems !== null && museumSlots !== null && equipment !== null && ownedMaterials !== null;
		if (isLoading && allReady) {
			setIsLoading(false);
		}
	}, [craftingItems, museumSlots, equipment, ownedMaterials, isLoading, setCraftingItems, setMuseumSlots, setEquipment, setOwnedMaterials]);

	useEffect(() => {
		if (!equipment || isLoading) return;
		// Migration: ensure activeEvents exists
		if (!equipment.activeEvents) {
			setEquipment({ ...equipment, activeEvents: [] });
			return;
		}
		// Migration: ensure ringsSix/necklaceSix/charmSix exist and have correct lengths/defaults
		let needsMigration = false;
		let ringsSix: boolean[];
		if (!Array.isArray((equipment as any).ringsSix)) {
			ringsSix = new Array(equipment.rings.length).fill(false);
			needsMigration = true;
		} else {
			ringsSix = ([...((equipment as any).ringsSix as boolean[])]);
			if (ringsSix.length !== equipment.rings.length) {
				// Normalize length
				const normalized = new Array(equipment.rings.length).fill(false);
				for (let i = 0; i < Math.min(ringsSix.length, normalized.length); i++) normalized[i] = !!ringsSix[i];
				ringsSix = normalized;
				needsMigration = true;
			}
		}
		const necklaceSix = typeof (equipment as any).necklaceSix === 'boolean' ? (equipment as any).necklaceSix : false;
		if (typeof (equipment as any).necklaceSix !== 'boolean') needsMigration = true;
		const charmSix = typeof (equipment as any).charmSix === 'boolean' ? (equipment as any).charmSix : false;
		if (typeof (equipment as any).charmSix !== 'boolean') needsMigration = true;
		if (needsMigration) {
			setEquipment({ ...equipment, ringsSix, necklaceSix, charmSix });
		}
	}, [equipment, setEquipment, isLoading]);

	const buildSnapshot = (overrides?: Partial<{ craftingItems: CraftingItem[]; museumSlots: MuseumSlot[]; equipment: EquipmentSlot; ownedMaterials: { [key: string]: number }; }>) => {
		const sanitizedEquipment = (equipment ?? DEFAULT_EQUIPMENT);
		return { craftingItems: (craftingItems ?? []), museumSlots: (museumSlots ?? []), equipment: sanitizedEquipment.activeEvents ? sanitizedEquipment : { ...sanitizedEquipment, activeEvents: [] }, ownedMaterials: (ownedMaterials ?? {}), ...overrides };
	};

	const exportData = () => {
		const base = buildSnapshot();
		const data = { ...base, exportDate: new Date().toISOString(), version: '1.1' };
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
		const data = { ...Object.fromEntries(Object.entries(selectedData).map(([k, v]) => [k, v ?? (base as any)[k]])), exportDate: new Date().toISOString(), version: '1.1' };
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob); 
		const a = document.createElement('a'); 
		a.href = url; 
		a.download = `prospecting-tools-${new Date().toISOString().split('T')[0]}.json`; 
		document.body.appendChild(a); a.click(); 
		document.body.removeChild(a); 
		URL.revokeObjectURL(url);
	};
	const exportToUrl = () => { 
		const base = buildSnapshot(); 
		const data = { ...base, exportDate: new Date().toISOString(), version: '1.1' }; 
		try { 
			const compressed = encodeDataForUrl(data); 
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
		const data = { ...Object.fromEntries(Object.entries(selectedData).map(([k, v]) => [k, v ?? (base as any)[k]])), exportDate: new Date().toISOString(), version: '1.1' }; 
		try { 
			const compressed = encodeDataForUrl(data); 
			const url = `${window.location.origin}${window.location.pathname}#data=${compressed}`; 
			return { success: true, url }; 
		} catch (error) { 
			console.error('Error creating URL:', error); 
			return { success: false, error }; 
		} 
	};
	const importData = (data: any) => { 
		if (data.equipment && !data.equipment.activeEvents) { 
			data.equipment.activeEvents = []; 
		} 
		if ('craftingItems' in data) setCraftingItems(data.craftingItems ?? []); 
		if ('museumSlots' in data) setMuseumSlots(data.museumSlots ?? []); 
		if ('equipment' in data) setEquipment(data.equipment ?? DEFAULT_EQUIPMENT); 
		if ('ownedMaterials' in data) setOwnedMaterials(data.ownedMaterials ?? {}); 
	};
	const importDataSelective = (data: any, selection: any) => { 
		createBackupBeforeImport(); 
		if (selection.craftingItems && 'craftingItems' in data) setCraftingItems(data.craftingItems ?? []); 
		if (selection.museumSlots && 'museumSlots' in data) setMuseumSlots(data.museumSlots ?? []); 
		if (selection.equipment && 'equipment' in data) { 
			if (data.equipment && !data.equipment.activeEvents) data.equipment.activeEvents = []; 
			setEquipment(data.equipment ?? DEFAULT_EQUIPMENT); 
		} 
		if (selection.ownedMaterials && 'ownedMaterials' in data) setOwnedMaterials(data.ownedMaterials ?? {}); 
	};
	const importFromUrl = (url: string) => { 
		try { 
			const hashData = url.split('#data=')[1]; 
			if (!hashData) { 
				throw new Error('No data found in URL'); 
			} 
			const data = decodeDataFromUrl(hashData); 
			return { success: true, data }; 
		} catch (error) { 
			console.error('Error importing from URL:', error); 
			return { success: false, error }; 
		} 
	};
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
		const saves = getSaves(); 
		saves[5] = backupData; 
		localStorage.setItem('prospecting-saves', JSON.stringify(saves)); 
	};
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
		if (slotIndex < 0 || slotIndex >= 5) throw new Error('Invalid save slot index. Must be 0-4.'); 
		const snapshot = buildSnapshot(); 
		const saveData = { metadata: { ...metadata, createdAt: new Date().toISOString(), version: '1.1' }, ...snapshot }; 
		const saves = getSaves(); 
		saves[slotIndex] = saveData; 
		localStorage.setItem('prospecting-saves', JSON.stringify(saves)); 
	};
	const loadFromSlot = (slotIndex: number) => { 
		if (slotIndex < 0 || slotIndex >= 6) throw new Error('Invalid save slot index. Must be 0-5.'); 
		const saves = getSaves(); 
		const saveData = saves[slotIndex]; 
		if (!saveData) throw new Error('No save data in this slot.'); 
		// Always create a backup before loading any slot (including slot 5)
		createBackupBeforeImport(); 
		importData(saveData); 
		return saveData; 
	};
	const deleteSave = (slotIndex: number) => { 
		if (slotIndex < 0 || slotIndex >= 5) throw new Error('Invalid save slot index. Must be 0-4.'); 
		const saves = getSaves(); 
		saves[slotIndex] = null; 
		localStorage.setItem('prospecting-saves', JSON.stringify(saves)); 
	};

	return { 
		isLoading, 
		craftingItems: (craftingItems ?? []), 
		setCraftingItems, 
		museumSlots: (museumSlots ?? []), 
		setMuseumSlots, 
		equipment: (equipment ?? DEFAULT_EQUIPMENT), 
		setEquipment, 
		ownedMaterials: (ownedMaterials ?? {}), 
		setOwnedMaterials, 
		exportData, 
		exportDataSelective, 
		exportToUrl, 
		exportToUrlSelective, 
		importData, importDataSelective,
		importFromUrl, 
		getSaves, 
		saveToSlot, 
		loadFromSlot, 
		deleteSave, 
		createBackupBeforeImport 
	};
}

export function AppDataProvider({ children }: { children: ReactNode }) { 
	const value = useProvideAppData(); 
	return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>; 
}
export function useAppData(): AppDataContextValue { 
	const ctx = useContext(AppDataContext); 
	if (!ctx) throw new Error('useAppData must be used within <AppDataProvider>'); 
	return ctx; 
}


