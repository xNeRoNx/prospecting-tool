import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Check, Calendar, FileText, Tag } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { DataSelectionForm } from './DataSelectionForm';
import { ImportPreview as ImportPreviewType, DataSelection } from './types';

/**
 * Props for the ImportPreview component
 */
interface ImportPreviewProps {
  importPreview: ImportPreviewType;
  importSelection: DataSelection;
  onUpdateImportSelection: (type: keyof DataSelection, checked: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onConfirmImport: () => void;
  onCancelImport: () => void;
  isLoading: boolean;
}

/**
 * Component displaying a preview of data to be imported with selection options
 */

export function ImportPreview({
  importPreview,
  importSelection,
  onUpdateImportSelection,
  onSelectAll,
  onSelectNone,
  onConfirmImport,
  onCancelImport,
  isLoading
}: ImportPreviewProps) {
  const { t } = useLanguage();
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
            {importPreview.source === 'file' ? t('file') : t('url')}
          </Badge>
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
                  <div className="text-sm font-medium truncate">
                    {metadata.name || t('unnamedSave')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{t('created')}</div>
                  <div className="text-sm truncate">
                    {metadata.createdAt 
                      ? new Date(metadata.createdAt).toLocaleDateString() 
                      : t('unknownDate')}
                  </div>
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
              <div className="text-xs text-muted-foreground break-all">
                {t('file')}: {importPreview.fileName}
              </div>
            )}
            <Separator />
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium mb-3">{t('availableData')}:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm import-preview-data-summary">
            {data.craftingItems && (
              <div className="flex justify-between items-center gap-2">
                <span className="truncate">{t('crafting')}:</span>
                <Badge variant="outline" className="shrink-0">{data.craftingItems.length}</Badge>
              </div>
            )}
            {data.museumSlots && (
              <div className="flex justify-between items-center gap-2">
                <span className="truncate">{t('museum')}:</span>
                <Badge variant="outline" className="shrink-0">{data.museumSlots.length}</Badge>
              </div>
            )}
            {data.equipment && (
              <div className="flex justify-between items-center gap-2">
                <span className="truncate">{t('equipment')}:</span>
                <Badge variant="outline" className="shrink-0">✓</Badge>
              </div>
            )}
            {data.ownedMaterials && (
              <div className="flex justify-between items-center gap-2">
                <span className="truncate">{t('materials')}:</span>
                <Badge variant="outline" className="shrink-0">
                  {Object.keys(data.ownedMaterials).length}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium mb-3">{t('selectDataToImport')}:</h4>
          <DataSelectionForm
            selection={importSelection}
            onUpdateSelection={onUpdateImportSelection}
            onSelectAll={onSelectAll}
            onSelectNone={onSelectNone}
            isExport={false}
            isLoading={isLoading}
            craftingItemsCount={data.craftingItems?.length || 0}
            museumSlotsCount={data.museumSlots?.length || 0}
            ownedMaterialsCount={Object.keys(data.ownedMaterials || {}).length}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2 import-preview-actions">
          <Button 
            onClick={onConfirmImport} 
            disabled={!Object.values(importSelection).some(Boolean) || isLoading} 
            className="flex-1 w-full sm:w-auto"
          >
            <Check size={16} className="mr-2" />
            {t('importSelectedData')}
          </Button>
          <Button 
            onClick={onCancelImport} 
            variant="outline" 
            className="w-full sm:w-auto" 
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
