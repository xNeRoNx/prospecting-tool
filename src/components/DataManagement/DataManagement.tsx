import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Download, Upload } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useDataManagement } from './useDataManagement';
import { SaveSlotsTab } from './SaveSlotsTab';
import { ExportTab } from './ExportTab';
import { ImportTab } from './ImportTab';
import { SaveDialog } from './SaveDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export function DataManagement() {
  const { t } = useLanguage();
  const {
    fileInputRef,
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
    isLoading,
    craftingItems,
    museumSlots,
    ownedMaterials,
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
  } = useDataManagement();

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
          <DialogHeader>
            <DialogTitle>{t('dataManagement')}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="slots" className="gap-2">
                <Database size={16} />
                {t('saveSlots')}
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2">
                <Download size={16} />
                {t('export')}
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-2">
                <Upload size={16} />
                {t('import')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="slots" className="space-y-4">
              <SaveSlotsTab
                saves={saves}
                isLoading={isLoading}
                onOpenSaveDialog={openSaveDialog}
                onLoadFromSlot={handleLoadFromSlot}
                onDeleteSave={setDeleteConfirmSlot}
              />
            </TabsContent>
            
            <TabsContent value="export" className="space-y-4">
              <ExportTab
                saveMetadata={saveMetadata}
                onSaveMetadataChange={setSaveMetadata}
                exportSelection={exportSelection}
                onUpdateExportSelection={updateExportSelection}
                onSelectAll={selectAllExport}
                onSelectNone={selectNoneExport}
                onExportFile={handleExportFile}
                onExportToUrl={handleExportToUrl}
                isLoading={isLoading}
                craftingItemsCount={craftingItems.length}
                museumSlotsCount={museumSlots.length}
                ownedMaterialsCount={Object.keys(ownedMaterials).length}
              />
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <ImportTab
                showPreview={showPreview}
                importPreview={importPreview}
                urlInput={urlInput}
                onUrlInputChange={setUrlInput}
                importSelection={importSelection}
                onUpdateImportSelection={updateImportSelection}
                onSelectAll={selectAllImport}
                onSelectNone={selectNoneImport}
                onImportFile={handleImportFile}
                onImportFromUrl={handleImportFromUrl}
                onConfirmImport={handleConfirmImport}
                onCancelImport={handleCancelImport}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {selectedSaveSlot !== null && (
        <SaveDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          slotNumber={selectedSaveSlot}
          existingSave={saves[selectedSaveSlot]}
          saveMetadata={saveMetadata}
          onSaveMetadataChange={setSaveMetadata}
          onSave={() => handleSaveToSlot(selectedSaveSlot)}
          isLoading={isLoading}
        />
      )}

      {deleteConfirmSlot !== null && (
        <DeleteConfirmDialog
          open={deleteConfirmSlot !== null}
          onOpenChange={() => setDeleteConfirmSlot(null)}
          save={saves[deleteConfirmSlot]}
          slotNumber={deleteConfirmSlot}
          onDelete={() => handleDeleteSave(deleteConfirmSlot)}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
