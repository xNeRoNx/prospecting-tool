export interface DataSelection {
  craftingItems: boolean;
  museumSlots: boolean;
  equipment: boolean;
  ownedMaterials: boolean;
}

export interface SaveMetadata {
  name: string;
  description: string;
  createdAt: string;
  version: string;
}

export interface ImportData {
  metadata?: SaveMetadata;
  craftingItems?: any[];
  museumSlots?: any[];
  equipment?: any;
  ownedMaterials?: any;
}

export interface ImportPreview {
  data: ImportData;
  source: 'file' | 'url';
  fileName?: string;
}
