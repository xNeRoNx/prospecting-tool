import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Heart, Link, FileArrowDown, FileArrowUp, Database, Palette } from '@phosphor-icons/react';
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

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { craftingItems, museumSlots, equipment, collectibles, ownedMaterials, exportDataSelective, importDataSelective, exportToUrlSelective, importFromUrl } = useAppData();
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
          importDataSelective(data, importSelection);
          
          toast.success(t('importSuccess'));
          // Clear the hash to prevent re-importing on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error importing from URL on load:', error);
          toast.error(t('importError'));
        }
      }
    };
    
    checkForUrlData();
  }, [importDataSelective, importSelection, t]);

  const handleExportFile = () => {
    try {
      const selectedData = getSelectedData(exportSelection);
      exportDataSelective(selectedData);
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
      const result = exportToUrlSelective(selectedData);
      if (result.success) {
        setUrlInput(result.url);
        navigator.clipboard.writeText(result.url);
        toast.success(t('urlCopied'));
        setDataDialogOpen(false);
      } else {
        toast.error(t('urlCopyError'));
      }
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
      const result = importFromUrl(urlInput);
      if (result.success && result.data) {
        importDataSelective(result.data, importSelection);
        toast.success(t('importSuccess'));
        setDataDialogOpen(false);
        setUrlInput('');
      } else {
        toast.error(t('importError'));
      }
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
        importDataSelective(data, importSelection);
        toast.success(t('importSuccess'));
        setDataDialogOpen(false);
      } catch (error) {
        toast.error(t('importError'));
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectAll(isExport)}
          >
            {t('selectAll')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectNone(isExport)}
          >
            {t('selectNone')}
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`crafting-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.craftingItems}
              onCheckedChange={(checked) => updateSelection('craftingItems', !!checked, isExport)}
            />
            <label htmlFor={`crafting-${isExport ? 'export' : 'import'}`} className="text-sm font-medium">
              {t('crafting')} ({craftingItems.length} items)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`museum-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.museumSlots}
              onCheckedChange={(checked) => updateSelection('museumSlots', !!checked, isExport)}
            />
            <label htmlFor={`museum-${isExport ? 'export' : 'import'}`} className="text-sm font-medium">
              {t('museum')} ({museumSlots.length} slots)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`equipment-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.equipment}
              onCheckedChange={(checked) => updateSelection('equipment', !!checked, isExport)}
            />
            <label htmlFor={`equipment-${isExport ? 'export' : 'import'}`} className="text-sm font-medium">
              {t('equipment')}
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`collectibles-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.collectibles}
              onCheckedChange={(checked) => updateSelection('collectibles', !!checked, isExport)}
            />
            <label htmlFor={`collectibles-${isExport ? 'export' : 'import'}`} className="text-sm font-medium">
              {t('collectibles')} ({collectibles.length} items)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`materials-${isExport ? 'export' : 'import'}`}
              checked={currentSelection.ownedMaterials}
              onCheckedChange={(checked) => updateSelection('ownedMaterials', !!checked, isExport)}
            />
            <label htmlFor={`materials-${isExport ? 'export' : 'import'}`} className="text-sm font-medium">
              {t('ownedMaterials')} ({Object.keys(ownedMaterials).length} materials)
            </label>
          </div>
        </div>
      </div>
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
            <Select value={currentTheme} onValueChange={setTheme}>
              <SelectTrigger className="w-16 sm:w-34">
                <SelectValue>
                  <div className="flex items-center justify-center w-full">
                    <Palette size={14} />
                    <span className="hidden sm:inline ml-2">{t(themes[currentTheme]?.nameKey as any)}</span>
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

            <Select value={language} onValueChange={setLanguage}>
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
                >
                  <Database size={16} />
                  <span className="hidden sm:inline">{t('dataManagement')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        disabled={!Object.values(exportSelection).some(Boolean)}
                      >
                        <FileArrowDown size={16} />
                        {t('exportToFile')}
                      </Button>
                      <Button
                        onClick={handleExportToUrl}
                        variant="outline"
                        className="flex-1 gap-2"
                        disabled={!Object.values(exportSelection).some(Boolean)}
                      >
                        <Link size={16} />
                        {t('exportToUrl')}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="import" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t('selectDataToImport')}</CardTitle>
                        <CardDescription>{t('selectDataToImportDesc')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {renderDataSelection(importSelection, false)}
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={handleImportFile}
                          className="flex-1 gap-2"
                          disabled={!Object.values(importSelection).some(Boolean)}
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
                        />
                        <Button
                          onClick={handleImportFromUrl}
                          variant="outline"
                          className="w-full gap-2"
                          disabled={!urlInput.trim() || !Object.values(importSelection).some(Boolean)}
                        >
                          <Link size={16} />
                          {t('importFromUrl')}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            <Button
              variant="default"
              size="sm"
              onClick={handleSupportCreator}
              className="gap-2 bg-accent hover:bg-accent/90"
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