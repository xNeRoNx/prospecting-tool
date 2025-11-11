import { useRef, useState, useEffect } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { encodeDataForUrl, decodeDataFromUrl } from '@/lib/urlCompression';
import { toast } from 'sonner';
import { DataSelection, SaveMetadata, ImportPreview } from './types';
import { useLanguage } from '@/hooks/useLanguage';

export function useDataManagement() {
  const { t } = useLanguage();
  const { 
    isLoading, 
    craftingItems, 
    museumSlots, 
    equipment, 
    ownedMaterials, 
    importDataSelective, 
    getSaves, 
    saveToSlot, 
    loadFromSlot, 
    deleteSave 
  } = useAppData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'slots' | 'export' | 'import'>('slots');
  
  const [exportSelection, setExportSelection] = useState<DataSelection>({
    craftingItems: true,
    museumSlots: true,
    equipment: true,
    ownedMaterials: true
  });
  
  const [importSelection, setImportSelection] = useState<DataSelection>({
    craftingItems: true,
    museumSlots: true,
    equipment: true,
    ownedMaterials: true
  });
  
  const [saveMetadata, setSaveMetadata] = useState<SaveMetadata>({
    name: 'Prospecting Save',
    description: '',
    createdAt: new Date().toISOString(),
    version: '1.1'
  });
  
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saves, setSaves] = useState<any[]>([]);
  const [selectedSaveSlot, setSelectedSaveSlot] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<number | null>(null);

  // Load saves on start
  useEffect(() => {
    setSaves(getSaves());
  }, [getSaves]);

  // Reset import state when dialog closes
  useEffect(() => {
    if (!dataDialogOpen) {
      setImportPreview(null);
      setShowPreview(false);
      setUrlInput('');
      setSaveDialogOpen(false);
      setSelectedSaveSlot(null);
      setDeleteConfirmSlot(null);
    }
  }, [dataDialogOpen]);

  // Import via URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('#data=')) return;
    try {
      const hashData = hash.split('#data=')[1];
      if (!hashData) return;
      const data = decodeDataFromUrl(hashData);
      setImportPreview({ data, source: 'url' });
      setShowPreview(true);
      setActiveTab('import');
      setDataDialogOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error(e);
      toast.error(t('importError'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper functions
  const getSelectedData = (selection: DataSelection) => {
    const data: any = {};
    if (selection.craftingItems) data.craftingItems = craftingItems;
    if (selection.museumSlots) data.museumSlots = museumSlots;
    if (selection.equipment) data.equipment = equipment;
    if (selection.ownedMaterials) data.ownedMaterials = ownedMaterials;
    return data;
  };

  const updateExportSelection = (type: keyof DataSelection, checked: boolean) => {
    setExportSelection(prev => ({ ...prev, [type]: checked }));
  };

  const updateImportSelection = (type: keyof DataSelection, checked: boolean) => {
    setImportSelection(prev => ({ ...prev, [type]: checked }));
  };

  const selectAllExport = () => {
    setExportSelection({ 
      craftingItems: true, 
      museumSlots: true, 
      equipment: true, 
      ownedMaterials: true 
    });
  };

  const selectNoneExport = () => {
    setExportSelection({ 
      craftingItems: false, 
      museumSlots: false, 
      equipment: false, 
      ownedMaterials: false 
    });
  };

  const selectAllImport = () => {
    setImportSelection({ 
      craftingItems: true, 
      museumSlots: true, 
      equipment: true, 
      ownedMaterials: true 
    });
  };

  const selectNoneImport = () => {
    setImportSelection({ 
      craftingItems: false, 
      museumSlots: false, 
      equipment: false, 
      ownedMaterials: false 
    });
  };

  // Export handlers
  const handleExportFile = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      const dataWithMetadata = { 
        metadata: { ...saveMetadata, createdAt: new Date().toISOString() }, 
        ...selectedData 
      };
      const dataStr = JSON.stringify(dataWithMetadata, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${saveMetadata.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t('exportSuccess'));
      setDataDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('exportError'));
    }
  };

  const handleExportToUrl = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      const dataWithMetadata = { 
        metadata: { 
          ...saveMetadata, 
          createdAt: new Date().toISOString(), 
          version: saveMetadata.version 
        }, 
        ...selectedData 
      };
      const compressed = encodeDataForUrl(dataWithMetadata);
      const url = `${window.location.origin}${window.location.pathname}#data=${compressed}`;
      navigator.clipboard.writeText(url);
      toast.success(t('urlCopied'));
      setDataDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('urlCopyError'));
    }
  };

  // Import handlers
  const handleImportFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setImportPreview({ data, source: 'file', fileName: file.name });
        setShowPreview(true);
      } catch {
        toast.error(t('importError'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportFromUrl = () => {
    if (!urlInput.trim()) return toast.error(t('importError'));
    try {
      const hashData = urlInput.includes('#data=') ? urlInput.split('#data=')[1] : urlInput;
      if (!hashData) return toast.error(t('importError'));
      const data = decodeDataFromUrl(hashData);
      setImportPreview({ data, source: 'url' });
      setShowPreview(true);
      setActiveTab('import');
    } catch (e) {
      console.error(e);
      toast.error(t('importError'));
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    try {
      const { metadata, ...dataToImport } = importPreview.data;
      importDataSelective(dataToImport, importSelection);
      toast.success(t('importSuccess'));
      setDataDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('importError'));
    }
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setShowPreview(false);
    setUrlInput('');
  };

  // Save slot handlers
  const openSaveDialog = (slot: number) => {
    setSelectedSaveSlot(slot);
    setSaveDialogOpen(true);
  };

  const handleSaveToSlot = (slot: number) => {
    try {
      saveToSlot(slot, saveMetadata);
      setSaves(getSaves());
      toast.success(t('saveSuccessful'));
      setSaveDialogOpen(false);
      setSelectedSaveSlot(null);
    } catch (e) {
      console.error(e);
      toast.error(t('saveError'));
    }
  };

  const handleLoadFromSlot = (slot: number) => {
    try {
      loadFromSlot(slot);
      toast.success(t('loadSuccessful'));
      setDataDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('loadError'));
    }
  };

  const handleDeleteSave = (slot: number) => {
    try {
      deleteSave(slot);
      setSaves(getSaves());
      toast.success(t('deleteSuccessful'));
      setDeleteConfirmSlot(null);
    } catch (e) {
      console.error(e);
      toast.error(t('deleteError'));
    }
  };

  return {
    // Refs
    fileInputRef,
    // State
    dataDialogOpen,
    setDataDialogOpen,
    urlInput,
    setUrlInput,
    activeTab,
    setActiveTab,
    exportSelection,
    importSelection,
    saveMetadata,
    setSaveMetadata,
    importPreview,
    showPreview,
    saves,
    selectedSaveSlot,
    saveDialogOpen,
    setSaveDialogOpen,
    deleteConfirmSlot,
    setDeleteConfirmSlot,
    // Data
    isLoading,
    craftingItems,
    museumSlots,
    equipment,
    ownedMaterials,
    // Handlers
    updateExportSelection,
    updateImportSelection,
    selectAllExport,
    selectNoneExport,
    selectAllImport,
    selectNoneImport,
    handleExportFile,
    handleExportToUrl,
    handleImportFile,
    handleFileChange,
    handleImportFromUrl,
    handleConfirmImport,
    handleCancelImport,
    openSaveDialog,
    handleSaveToSlot,
    handleLoadFromSlot,
    handleDeleteSave
  };
}
