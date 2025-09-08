import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Link, FileArrowDown, FileArrowUp, Database, Eye, Check, Calendar, FileText, Tag } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import { toast } from 'sonner';

interface DataSelection {
  craftingItems: boolean;
  museumSlots: boolean;
  equipment: boolean;
  collectibles: boolean;
  ownedMaterials: boolean;
}

interface SaveMetadata {
  name: string;
  description: string;
  createdAt: string;
  version: string;
}

interface ImportData {
  metadata?: SaveMetadata;
  craftingItems?: any[];
  museumSlots?: any[];
  equipment?: any;
  collectibles?: any[];
  ownedMaterials?: any;
}

interface ImportPreview {
  data: ImportData;
  source: 'file' | 'url';
  fileName?: string;
}

// Komponent odpowiedzialny wyłącznie za zarządzanie eksportem / importem i slotami zapisu
export function DataManagement() {
  const { t } = useLanguage();
  const { isLoading, craftingItems, museumSlots, equipment, collectibles, ownedMaterials, importDataSelective, getSaves, saveToSlot, loadFromSlot, deleteSave } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'slots' | 'export' | 'import'>('slots');
  const [exportSelection, setExportSelection] = useState<DataSelection>({
    craftingItems: true,
    museumSlots: true,
    equipment: true,
    collectibles: true,
    ownedMaterials: true
  });
  const [importSelection, setImportSelection] = useState<DataSelection>({
    craftingItems: true,
    museumSlots: true,
    equipment: true,
    collectibles: true,
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

  // Wczytaj listę zapisów na start
  useEffect(() => {
    setSaves(getSaves());
  }, [getSaves]);

  // Reset stanu importu po zamknięciu dialogu
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

  // Import poprzez URL w hash-u
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('#data=')) {
      try {
        const hashData = hash.split('#data=')[1];
        if (!hashData) return;
        const decompressed = atob(hashData);
        const data = JSON.parse(decompressed);
        setImportPreview({ data, source: 'url' });
        setShowPreview(true);
        setDataDialogOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error(e);
        toast.error(t('importError'));
      }
    }
  }, [t]);

  // Pomocnicze
  const getSelectedData = (selection: DataSelection) => {
    const data: any = {};
    if (selection.craftingItems) data.craftingItems = craftingItems;
    if (selection.museumSlots) data.museumSlots = museumSlots;
    if (selection.equipment) data.equipment = equipment;
    if (selection.collectibles) data.collectibles = collectibles;
    if (selection.ownedMaterials) data.ownedMaterials = ownedMaterials;
    return data;
  };

  const updateSelection = (type: keyof DataSelection, checked: boolean, isExport: boolean) => {
    if (isExport) setExportSelection(p => ({ ...p, [type]: checked }));
    else setImportSelection(p => ({ ...p, [type]: checked }));
  };

  const selectAll = (isExport: boolean) => {
    const all: DataSelection = { craftingItems: true, museumSlots: true, equipment: true, collectibles: true, ownedMaterials: true };
    isExport ? setExportSelection(all) : setImportSelection(all);
  };
  const selectNone = (isExport: boolean) => {
    const none: DataSelection = { craftingItems: false, museumSlots: false, equipment: false, collectibles: false, ownedMaterials: false };
    isExport ? setExportSelection(none) : setImportSelection(none);
  };

  // Eksport
  const handleExportFile = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      const dataWithMetadata = { metadata: { ...saveMetadata, createdAt: new Date().toISOString() }, ...selectedData };
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
      toast.error('Export failed');
    }
  };

  const handleExportToUrl = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      const dataWithMetadata = { metadata: { ...saveMetadata, createdAt: new Date().toISOString() }, ...selectedData };
      const compressed = btoa(JSON.stringify(dataWithMetadata));
      const url = `${window.location.origin}${window.location.pathname}#data=${compressed}`;
      navigator.clipboard.writeText(url);
      toast.success(t('urlCopied'));
      setDataDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(t('urlCopyError'));
    }
  };

  // Import
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
      const decompressed = atob(hashData);
      const data = JSON.parse(decompressed);
      setImportPreview({ data, source: 'url' });
      setShowPreview(true);
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
  const handleCancelImport = () => { setImportPreview(null); setShowPreview(false); setUrlInput(''); };

  // Sloty zapisu
  const openSaveDialog = (slot: number) => { setSelectedSaveSlot(slot); setSaveDialogOpen(true); };
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
    try { loadFromSlot(slot); toast.success(t('loadSuccessful')); setDataDialogOpen(false); } catch (e) { console.error(e); toast.error(t('loadError')); }
  };
  const handleDeleteSave = (slot: number) => { try { deleteSave(slot); setSaves(getSaves()); toast.success(t('deleteSuccessful')); setDeleteConfirmSlot(null); } catch (e) { console.error(e); toast.error(t('deleteError')); } };

  // Renderery częściowe
  const renderDataSelection = (selection: DataSelection, isExport: boolean) => {
    const current = isExport ? exportSelection : importSelection;
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 data-selection-buttons">
          <Button variant="outline" size="sm" onClick={() => selectAll(isExport)} className="w-full sm:w-auto" disabled={isLoading}>{t('selectAll')}</Button>
          <Button variant="outline" size="sm" onClick={() => selectNone(isExport)} className="w-full sm:w-auto" disabled={isLoading}>{t('selectNone')}</Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox id={`crafting-${isExport ? 'export' : 'import'}`} checked={current.craftingItems} onCheckedChange={c => updateSelection('craftingItems', !!c, isExport)} className="mt-0.5 shrink-0" disabled={isLoading} />
            <label htmlFor={`crafting-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">{t('crafting')} ({isExport ? craftingItems.length : (importPreview?.data.craftingItems?.length || 0)} {t('items')})</label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id={`museum-${isExport ? 'export' : 'import'}`} checked={current.museumSlots} onCheckedChange={c => updateSelection('museumSlots', !!c, isExport)} className="mt-0.5 shrink-0" disabled={isLoading} />
            <label htmlFor={`museum-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">{t('museum')} ({isExport ? museumSlots.length : (importPreview?.data.museumSlots?.length || 0)} {t('slots')})</label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id={`equipment-${isExport ? 'export' : 'import'}`} checked={current.equipment} onCheckedChange={c => updateSelection('equipment', !!c, isExport)} className="mt-0.5 shrink-0" disabled={isLoading} />
            <label htmlFor={`equipment-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">{t('equipment')}</label>
          </div>
            <div className="flex items-start space-x-2">
            <Checkbox id={`collectibles-${isExport ? 'export' : 'import'}`} checked={current.collectibles} onCheckedChange={c => updateSelection('collectibles', !!c, isExport)} className="mt-0.5 shrink-0" disabled={isLoading} />
            <label htmlFor={`collectibles-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">{t('collectibles')} ({isExport ? collectibles.length : (importPreview?.data.collectibles?.length || 0)} {t('items')})</label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id={`materials-${isExport ? 'export' : 'import'}`} checked={current.ownedMaterials} onCheckedChange={c => updateSelection('ownedMaterials', !!c, isExport)} className="mt-0.5 shrink-0" disabled={isLoading} />
            <label htmlFor={`materials-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">{t('ownedMaterials')} ({isExport ? Object.keys(ownedMaterials).length : Object.keys(importPreview?.data.ownedMaterials || {}).length} {t('materials')})</label>
          </div>
        </div>
      </div>
    );
  };

  const renderImportPreview = () => {
    if (!importPreview || !showPreview) return null;
    const { data } = importPreview;
    const metadata = data.metadata;
    return (
      <Card className="border-accent">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2"><Eye size={16} />{t('importPreview')}</CardTitle>
            <Badge variant="secondary" className="shrink-0">{importPreview.source === 'file' ? 'File' : 'URL'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metadata && (
            <div className="space-y-3 import-preview-metadata">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{t('saveName')}</div>
                    <div className="text-sm font-medium truncate">{metadata.name || t('unnamedSave')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{t('created')}</div>
                    <div className="text-sm truncate">{metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                </div>
              </div>
              {metadata.description && (
                <div className="flex items-start gap-2">
                  <FileText size={14} className="mt-1 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{t('description')}</div>
                    <div className="text-sm break-words">{metadata.description}</div>
                  </div>
                </div>
              )}
              {importPreview.fileName && (
                <div className="text-xs text-muted-foreground break-all">{t('file')}: {importPreview.fileName}</div>
              )}
              <Separator />
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('availableData')}:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm import-preview-data-summary">
              {data.craftingItems && (<div className="flex justify-between items-center gap-2"><span className="truncate">{t('crafting')}:</span><Badge variant="outline" className="shrink-0">{data.craftingItems.length}</Badge></div>)}
              {data.museumSlots && (<div className="flex justify-between items-center gap-2"><span className="truncate">{t('museum')}:</span><Badge variant="outline" className="shrink-0">{data.museumSlots.length}</Badge></div>)}
              {data.equipment && (<div className="flex justify-between items-center gap-2"><span className="truncate">{t('equipment')}:</span><Badge variant="outline" className="shrink-0">✓</Badge></div>)}
              {data.collectibles && (<div className="flex justify-between items-center gap-2"><span className="truncate">{t('collectibles')}:</span><Badge variant="outline" className="shrink-0">{data.collectibles.length}</Badge></div>)}
              {data.ownedMaterials && (<div className="flex justify-between items-center gap-2"><span className="truncate">{t('materials')}:</span><Badge variant="outline" className="shrink-0">{Object.keys(data.ownedMaterials).length}</Badge></div>)}
            </div>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-3">{t('selectDataToImport')}:</h4>
            {renderDataSelection(importSelection, false)}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 import-preview-actions">
            <Button onClick={handleConfirmImport} disabled={!Object.values(importSelection).some(Boolean) || isLoading} className="flex-1 w-full sm:w-auto"><Check size={16} className="mr-2" />{t('importSelectedData')}</Button>
            <Button onClick={handleCancelImport} variant="outline" className="w-full sm:w-auto" disabled={isLoading}>{t('cancel')}</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSaveSlots = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('saveSlots')}</CardTitle>
        <CardDescription>Save and load your data to/from slots</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {saves.slice(0, 5).map((save, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
              <div className="flex-1 min-w-0">
                {save ? (
                  <div>
                    <div className="font-medium text-sm truncate">{save.metadata?.name || `${t('saveSlot')} ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground">{save.metadata?.createdAt ? new Date(save.metadata.createdAt).toLocaleString() : t('unknownDate')}</div>
                    {save.metadata?.description && (<div className="text-xs text-muted-foreground truncate mt-1">{save.metadata.description}</div>)}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">{t('emptySaveSlot')}</div>
                )}
              </div>
              <div className="flex gap-2 ml-3">
                <Button size="sm" variant="outline" onClick={() => openSaveDialog(index)} disabled={isLoading}>{t('saveData')}</Button>
                {save && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleLoadFromSlot(index)} disabled={isLoading}>{t('loadData')}</Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmSlot(index)} disabled={isLoading}>{t('delete')}</Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {saves[5] && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-3 border border-accent/50 rounded-md bg-accent/10">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-accent">{t('backupSlot')}</div>
                  <div className="text-xs text-muted-foreground">{saves[5].metadata?.createdAt ? new Date(saves[5].metadata.createdAt).toLocaleString() : t('unknownDate')}</div>
                  <div className="text-xs text-muted-foreground">{saves[5].metadata?.description || t('backupSlotDescription')}</div>
                </div>
                <div className="flex gap-2 ml-3">
                  <Button size="sm" variant="outline" onClick={() => handleLoadFromSlot(5)} disabled={isLoading}>{t('loadData')}</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSaveDialog = () => {
    if (!saveDialogOpen || selectedSaveSlot === null) return null;
    const existingSave = saves[selectedSaveSlot];
    return (
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{existingSave ? t('overwriteSave') : t('saveToSlot')} {selectedSaveSlot + 1}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {existingSave && (
              <div className="p-3 border border-accent rounded-md bg-accent/10">
                <div className="text-sm font-medium">{t('confirmDelete')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('currentSave')}: {existingSave.metadata?.name || t('unnamedSave')}</div>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="save-name-dialog" className="text-sm font-medium">{t('saveName')}</label>
              <Input id="save-name-dialog" value={saveMetadata.name} onChange={e => setSaveMetadata(p => ({ ...p, name: e.target.value }))} placeholder="My Prospecting Save" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <label htmlFor="save-description-dialog" className="text-sm font-medium">{t('descriptionOptional')}</label>
              <Textarea id="save-description-dialog" value={saveMetadata.description} onChange={e => setSaveMetadata(p => ({ ...p, description: e.target.value }))} placeholder="Description of this save..." rows={2} disabled={isLoading} />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => handleSaveToSlot(selectedSaveSlot)} disabled={isLoading} className="flex-1">{existingSave ? t('overwriteSave') : t('saveData')}</Button>
            <Button onClick={() => setSaveDialogOpen(false)} variant="outline" disabled={isLoading}>{t('cancel')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderDeleteConfirmDialog = () => {
    if (deleteConfirmSlot === null) return null;
    return (
      <Dialog open={deleteConfirmSlot !== null} onOpenChange={() => setDeleteConfirmSlot(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('confirmDelete')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('deleteSaveConfirmQuestion')}</p>
            {saves[deleteConfirmSlot] && (
              <div className="p-3 border border-destructive rounded-md bg-destructive/10">
                <div className="text-sm font-medium">{saves[deleteConfirmSlot].metadata?.name || `Save Slot ${deleteConfirmSlot + 1}`}</div>
                <div className="text-xs text-muted-foreground">{saves[deleteConfirmSlot].metadata?.createdAt ? new Date(saves[deleteConfirmSlot].metadata.createdAt).toLocaleString() : t('unknownDate')}</div>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => handleDeleteSave(deleteConfirmSlot)} variant="destructive" disabled={isLoading} className="flex-1">{t('deleteSave')}</Button>
            <Button onClick={() => setDeleteConfirmSlot(null)} variant="outline" disabled={isLoading}>{t('cancel')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={dataDialogOpen} onOpenChange={setDataDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>
            <Database size={16} />
            <span className="hidden sm:inline">{t('dataManagement')}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto">
          <DialogHeader><DialogTitle>{t('dataManagement')}</DialogTitle></DialogHeader>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="slots" className="gap-2"><Database size={16} />{t('saveSlots')}</TabsTrigger>
              <TabsTrigger value="export" className="gap-2"><Download size={16} />{t('export')}</TabsTrigger>
              <TabsTrigger value="import" className="gap-2"><Upload size={16} />{t('import')}</TabsTrigger>
            </TabsList>
            <TabsContent value="slots" className="space-y-4">{renderSaveSlots()}</TabsContent>
            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('saveSettings')}</CardTitle>
                  <CardDescription>{t('saveSettingsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="save-name" className="text-sm font-medium">{t('saveName')}</label>
                    <Input id="save-name" value={saveMetadata.name} onChange={e => setSaveMetadata(p => ({ ...p, name: e.target.value }))} placeholder="My Prospecting Save" disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="save-description" className="text-sm font-medium">{t('descriptionOptional')}</label>
                    <Textarea id="save-description" value={saveMetadata.description} onChange={e => setSaveMetadata(p => ({ ...p, description: e.target.value }))} placeholder="Description of this save..." rows={2} disabled={isLoading} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('selectDataToExport')}</CardTitle>
                  <CardDescription>{t('selectDataToExportDesc')}</CardDescription>
                </CardHeader>
                <CardContent>{renderDataSelection(exportSelection, true)}</CardContent>
              </Card>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleExportFile} className="flex-1 gap-2" disabled={!Object.values(exportSelection).some(Boolean) || isLoading}><FileArrowDown size={16} />{t('exportToFile')}</Button>
                <Button onClick={handleExportToUrl} variant="outline" className="flex-1 gap-2" disabled={!Object.values(exportSelection).some(Boolean) || isLoading}><Link size={16} />{t('exportToUrl')}</Button>
              </div>
            </TabsContent>
            <TabsContent value="import" className="space-y-4">
              {showPreview && importPreview ? (
                renderImportPreview()
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('importData')}</CardTitle>
                    <CardDescription>{t('importDataDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleImportFile} className="flex-1 gap-2" disabled={isLoading}><FileArrowUp size={16} />{t('importFromFile')}</Button>
                    </div>
                    <div className="space-y-2">
                      <Input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder={t('pasteUrlHere')} disabled={isLoading} />
                      <Button onClick={handleImportFromUrl} variant="outline" className="w-full gap-2" disabled={!urlInput.trim() || isLoading}><Link size={16} />{t('importFromUrl')}</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      {renderSaveDialog()}
      {renderDeleteConfirmDialog()}
    </>
  );
}
