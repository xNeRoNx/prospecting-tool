import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileArrowDown, Link } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { DataSelectionForm } from './DataSelectionForm';
import { DataSelection, SaveMetadata } from './types';

interface ExportTabProps {
  saveMetadata: SaveMetadata;
  onSaveMetadataChange: (metadata: SaveMetadata) => void;
  exportSelection: DataSelection;
  onUpdateExportSelection: (type: keyof DataSelection, checked: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onExportFile: () => void;
  onExportToUrl: () => void;
  isLoading: boolean;
  craftingItemsCount: number;
  museumSlotsCount: number;
  ownedMaterialsCount: number;
}

export function ExportTab({
  saveMetadata,
  onSaveMetadataChange,
  exportSelection,
  onUpdateExportSelection,
  onSelectAll,
  onSelectNone,
  onExportFile,
  onExportToUrl,
  isLoading,
  craftingItemsCount,
  museumSlotsCount,
  ownedMaterialsCount
}: ExportTabProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('saveSettings')}</CardTitle>
          <CardDescription>{t('saveSettingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="save-name" className="text-sm font-medium">
              {t('saveName')}
            </label>
            <Input 
              id="save-name" 
              value={saveMetadata.name} 
              onChange={e => onSaveMetadataChange({ ...saveMetadata, name: e.target.value })} 
              placeholder={t('placeholderSaveName')} 
              disabled={isLoading} 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="save-description" className="text-sm font-medium">
              {t('descriptionOptional')}
            </label>
            <Textarea 
              id="save-description" 
              value={saveMetadata.description} 
              onChange={e => onSaveMetadataChange({ ...saveMetadata, description: e.target.value })} 
              placeholder={t('placeholderSaveDescription')} 
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
          <DataSelectionForm
            selection={exportSelection}
            onUpdateSelection={onUpdateExportSelection}
            onSelectAll={onSelectAll}
            onSelectNone={onSelectNone}
            isExport={true}
            isLoading={isLoading}
            craftingItemsCount={craftingItemsCount}
            museumSlotsCount={museumSlotsCount}
            ownedMaterialsCount={ownedMaterialsCount}
          />
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={onExportFile} 
          className="flex-1 gap-2" 
          disabled={!Object.values(exportSelection).some(Boolean) || isLoading}
        >
          <FileArrowDown size={16} />
          {t('exportToFile')}
        </Button>
        <Button 
          onClick={onExportToUrl} 
          variant="outline" 
          className="flex-1 gap-2" 
          disabled={!Object.values(exportSelection).some(Boolean) || isLoading}
        >
          <Link size={16} />
          {t('exportToUrl')}
        </Button>
      </div>
    </div>
  );
}
