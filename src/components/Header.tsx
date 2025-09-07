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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Upload, Heart, Link, FileArrowDown, FileArrowUp, Database, Palette, Eye, Check, Calendar, FileText, Tag } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';
import { useRef, useState, useEffect } from 'react';

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

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { isLoading, craftingItems, museumSlots, equipment, collectibles, ownedMaterials, exportDataSelective, importDataSelective, exportToUrlSelective, importFromUrl } = useAppData();
  const { currentTheme, setTheme, themes } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('export');
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
  
  // New states for enhanced data management
  const [saveMetadata, setSaveMetadata] = useState<SaveMetadata>({
    name: 'Prospecting Save',
    description: '',
    createdAt: new Date().toISOString(),
    version: '1.0'
  });
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Reset preview when dialog closes
  useEffect(() => {
    if (!dataDialogOpen) {
      setImportPreview(null);
      setShowPreview(false);
      setUrlInput('');
    }
  }, [dataDialogOpen]);

  // Check for URL data on mount
  useEffect(() => {
    const checkForUrlData = () => {
      const hash = window.location.hash;
      if (hash.includes('#data=')) {
        try {
          const hashData = hash.split('#data=')[1];
          if (!hashData) return;
          
          const decompressed = atob(hashData);
          const data = JSON.parse(decompressed);
          
          // Show preview instead of importing directly
          setImportPreview({
            data,
            source: 'url'
          });
          setShowPreview(true);
          setDataDialogOpen(true);
          
          // Clear the hash to prevent re-importing on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error importing from URL on load:', error);
          toast.error(t('importError'));
        }
      }
    };
    
    checkForUrlData();
  }, [t]);

  const handleExportFile = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      const dataWithMetadata = {
        metadata: {
          ...saveMetadata,
          createdAt: new Date().toISOString()
        },
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
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const handleExportToUrl = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      const dataWithMetadata = {
        metadata: {
          ...saveMetadata,
          createdAt: new Date().toISOString()
        },
        ...selectedData
      };
      
      const compressed = btoa(JSON.stringify(dataWithMetadata));
      const url = `${window.location.origin}${window.location.pathname}#data=${compressed}`;
      
      navigator.clipboard.writeText(url);
      toast.success(t('urlCopied'));
      setDataDialogOpen(false);
    } catch (error) {
      console.error('URL export error:', error);
      toast.error(t('urlCopyError'));
    }
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImportFromUrl = () => {
    if (!urlInput.trim()) {
      toast.error(t('importError'));
      return;
    }

    try {
      const hashData = urlInput.includes('#data=') ? urlInput.split('#data=')[1] : urlInput;
      if (!hashData) {
        toast.error(t('importError'));
        return;
      }
      
      const decompressed = atob(hashData);
      const data = JSON.parse(decompressed);
      
      setImportPreview({
        data,
        source: 'url'
      });
      setShowPreview(true);
    } catch (error) {
      console.error('URL import error:', error);
      toast.error(t('importError'));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setImportPreview({
          data,
          source: 'file',
          fileName: file.name
        });
        setShowPreview(true);
      } catch (error) {
        toast.error(t('importError'));
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    
    try {
      const { metadata, ...dataToImport } = importPreview.data;
      importDataSelective(dataToImport, importSelection);
      toast.success(t('importSuccess'));
      setDataDialogOpen(false);
      setImportPreview(null);
      setShowPreview(false);
      setUrlInput('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('importError'));
    }
  };

  const handleCancelImport = () => {
    setImportPreview(null);
    setShowPreview(false);
    setUrlInput('');
  };

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
    if (isExport) {
      setExportSelection(prev => ({ ...prev, [type]: checked }));
    } else {
      setImportSelection(prev => ({ ...prev, [type]: checked }));
    }
  };

  const selectAll = (isExport: boolean) => {
    const allSelected = {
      craftingItems: true,
      museumSlots: true,
      equipment: true,
      collectibles: true,
      ownedMaterials: true
    };
    if (isExport) {
      setExportSelection(allSelected);
    } else {
      setImportSelection(allSelected);
    }
  };

  const selectNone = (isExport: boolean) => {
    const noneSelected = {
      craftingItems: false,
      museumSlots: false,
      equipment: false,
      collectibles: false,
      ownedMaterials: false
    };
    if (isExport) {
      setExportSelection(noneSelected);
    } else {
      setImportSelection(noneSelected);
    }
  };

  const handleSupportCreator = () => {
    window.open('https://github.com/sponsors/xNeRoNx', '_blank');
  };

  const renderDataSelection = (selection: DataSelection, isExport: boolean) => {
    const currentSelection = isExport ? exportSelection : importSelection;
    
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 data-selection-buttons">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAll(isExport)}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {t('selectAll')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectNone(isExport)}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {t('selectNone')}
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id={`crafting-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.craftingItems}
              onCheckedChange={(checked) => updateSelection('craftingItems', !!checked, isExport)}
              className="mt-0.5 shrink-0"
              disabled={isLoading}
            />
            <label htmlFor={`crafting-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">
              {t('crafting')} ({isExport ? craftingItems.length : (importPreview?.data.craftingItems?.length || 0)} items)
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id={`museum-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.museumSlots}
              onCheckedChange={(checked) => updateSelection('museumSlots', !!checked, isExport)}
              className="mt-0.5 shrink-0"
              disabled={isLoading}
            />
            <label htmlFor={`museum-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">
              {t('museum')} ({isExport ? museumSlots.length : (importPreview?.data.museumSlots?.length || 0)} slots)
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id={`equipment-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.equipment}
              onCheckedChange={(checked) => updateSelection('equipment', !!checked, isExport)}
              className="mt-0.5 shrink-0"
              disabled={isLoading}
            />
            <label htmlFor={`equipment-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">
              {t('equipment')}
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id={`collectibles-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.collectibles}
              onCheckedChange={(checked) => updateSelection('collectibles', !!checked, isExport)}
              className="mt-0.5 shrink-0"
              disabled={isLoading}
            />
            <label htmlFor={`collectibles-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">
              {t('collectibles')} ({isExport ? collectibles.length : (importPreview?.data.collectibles?.length || 0)} items)
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id={`materials-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.ownedMaterials}
              onCheckedChange={(checked) => updateSelection('ownedMaterials', !!checked, isExport)}
              className="mt-0.5 shrink-0"
              disabled={isLoading}
            />
            <label htmlFor={`materials-${isExport ? 'export' : 'import'}`} className="text-sm font-medium break-words checkbox-label">
              {t('ownedMaterials')} ({isExport ? Object.keys(ownedMaterials).length : Object.keys(importPreview?.data.ownedMaterials || {}).length} materials)
            </label>
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
            <CardTitle className="text-base flex items-center gap-2">
              <Eye size={16} />
              {t('importPreview')}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {importPreview.source === 'file' ? 'File' : 'URL'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metadata Section */}
          {metadata && (
            <div className="space-y-3 import-preview-metadata">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Save Name</div>
                    <div className="text-sm font-medium truncate">{metadata.name || 'Unnamed Save'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-sm truncate">{metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                </div>
              </div>
              
              {metadata.description && (
                <div className="flex items-start gap-2">
                  <FileText size={14} className="mt-1 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Description</div>
                    <div className="text-sm break-words">{metadata.description}</div>
                  </div>
                </div>
              )}
              
              {importPreview.fileName && (
                <div className="text-xs text-muted-foreground break-all">
                  File: {importPreview.fileName}
                </div>
              )}
              
              <Separator />
            </div>
          )}

          {/* Data Summary */}
          <div>
            <h4 className="text-sm font-medium mb-3">Available Data:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm import-preview-data-summary">
              {data.craftingItems && (
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">Crafting Items:</span>
                  <Badge variant="outline" className="shrink-0">{data.craftingItems.length}</Badge>
                </div>
              )}
              {data.museumSlots && (
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">Museum Slots:</span>
                  <Badge variant="outline" className="shrink-0">{data.museumSlots.length}</Badge>
                </div>
              )}
              {data.equipment && (
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">Equipment:</span>
                  <Badge variant="outline" className="shrink-0">✓</Badge>
                </div>
              )}
              {data.collectibles && (
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">Collectibles:</span>
                  <Badge variant="outline" className="shrink-0">{data.collectibles.length}</Badge>
                </div>
              )}
              {data.ownedMaterials && (
                <div className="flex justify-between items-center gap-2">
                  <span className="truncate">Materials:</span>
                  <Badge variant="outline" className="shrink-0">{Object.keys(data.ownedMaterials).length}</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">Select data to import:</h4>
            {renderDataSelection(importSelection, false)}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 import-preview-actions">
            <Button
              onClick={handleConfirmImport}
              disabled={!Object.values(importSelection).some(Boolean) || isLoading}
              className="flex-1 w-full sm:w-auto"
            >
              <Check size={16} className="mr-2" />
              Import Selected Data
            </Button>
            <Button
              onClick={handleCancelImport}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-accent text-center" title="Prospecting Tools">Prospecting Tools</h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={currentTheme} onValueChange={setTheme} disabled={isLoading}>
              <SelectTrigger className="w-16 sm:w-34">
                <SelectValue>
                  <div className="flex items-center justify-center w-full">
                    <Palette size={14} />
                    <span className="hidden sm:inline ml-2">
                      {currentTheme && themes[currentTheme as keyof typeof themes]
                        ? t(themes[currentTheme as keyof typeof themes].nameKey as any)
                        : ''}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(themes).map(([key, theme]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Palette size={14} />
                      <span>{t(theme.nameKey as any)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pl')} disabled={isLoading}>
              <SelectTrigger className="w-16 sm:w-32">
                <SelectValue>
                  <div className="flex items-center justify-center w-full">
                    <span className="text-sm font-medium">
                      {language === 'en' ? '🇺🇸' : '🇵🇱'}
                    </span>
                    <span className="hidden sm:inline ml-2">
                      {language === 'en' ? t('english') : t('polish')}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <span>🇺🇸</span>
                    <span>{t('english')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="pl">
                  <div className="flex items-center gap-2">
                    <span>🇵🇱</span>
                    <span>{t('polish')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={dataDialogOpen} onOpenChange={setDataDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isLoading}
                >
                  <Database size={16} />
                  <span className="hidden sm:inline">{t('dataManagement')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('dataManagement')}</DialogTitle>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="export" className="gap-2">
                      <Download size={16} />
                      {t('export')}
                    </TabsTrigger>
                    <TabsTrigger value="import" className="gap-2">
                      <Upload size={16} />
                      {t('import')}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="export" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t('saveSettings')}</CardTitle>
                        <CardDescription>Set save name and description</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="save-name" className="text-sm font-medium">Save Name</label>
                          <Input
                            id="save-name"
                            value={saveMetadata.name}
                            onChange={(e) => setSaveMetadata(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="My Prospecting Save"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="save-description" className="text-sm font-medium">Description (Optional)</label>
                          <Textarea
                            id="save-description"
                            value={saveMetadata.description}
                            onChange={(e) => setSaveMetadata(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description of this save..."
                            rows={2}
                            disabled={isLoading}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t('selectDataToExport')}</CardTitle>
                        <CardDescription>{t('selectDataToExportDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderDataSelection(exportSelection, true)}
                      </CardContent>
                    </Card>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleExportFile}
                        className="flex-1 gap-2"
                        disabled={!Object.values(exportSelection).some(Boolean) || isLoading}
                      >
                        <FileArrowDown size={16} />
                        {t('exportToFile')}
                      </Button>
                      <Button
                        onClick={handleExportToUrl}
                        variant="outline"
                        className="flex-1 gap-2"
                        disabled={!Object.values(exportSelection).some(Boolean) || isLoading}
                      >
                        <Link size={16} />
                        {t('exportToUrl')}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="import" className="space-y-4">
                    {showPreview && importPreview ? (
                      renderImportPreview()
                    ) : (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">{t('importData')}</CardTitle>
                            <CardDescription>Import save data from file or URL</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                onClick={handleImportFile}
                                className="flex-1 gap-2"
                                disabled={isLoading}
                              >
                                <FileArrowUp size={16} />
                                {t('importFromFile')}
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <Input
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder={t('pasteUrlHere')}
                                disabled={isLoading}
                              />
                              <Button
                                onClick={handleImportFromUrl}
                                variant="outline"
                                className="w-full gap-2"
                                disabled={!urlInput.trim() || isLoading}
                              >
                                <Link size={16} />
                                {t('importFromUrl')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            <Button
              variant="default"
              size="sm"
              onClick={handleSupportCreator}
              className="gap-2 bg-accent hover:bg-accent/90"
              disabled={isLoading}
            >
              <Heart size={16} />
              <span className="hidden sm:inline">{t('supportCreator')}</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}