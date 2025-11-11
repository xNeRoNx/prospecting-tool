/**
 * Represents which data categories are selected for import/export operations
 */
export interface DataSelection {
  craftingItems: boolean;
  museumSlots: boolean;
  equipment: boolean;
  ownedMaterials: boolean;
}

/**
 * Metadata information for saved data
 */
export interface SaveMetadata {
  name: string;
  description: string;
  createdAt: string;
  version: string;
}

/**
 * Structure of data that can be imported
 */
export interface ImportData {
  metadata?: SaveMetadata;
  craftingItems?: any[];
  museumSlots?: any[];
  equipment?: any;
  ownedMaterials?: any;
}

/**
 * Preview information for data about to be imported
 */
export interface ImportPreview {
  data: ImportData;
  source: 'file' | 'url';
  fileName?: string;
}
