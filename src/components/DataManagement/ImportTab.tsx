import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileArrowUp, Link } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { ImportPreview } from './ImportPreview';
import { ImportPreview as ImportPreviewType, DataSelection } from './types';

interface ImportTabProps {
  showPreview: boolean;
  importPreview: ImportPreviewType | null;
  urlInput: string;
  onUrlInputChange: (value: string) => void;
  importSelection: DataSelection;
  onUpdateImportSelection: (type: keyof DataSelection, checked: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onImportFile: () => void;
  onImportFromUrl: () => void;
  onConfirmImport: () => void;
  onCancelImport: () => void;
  isLoading: boolean;
}

export function ImportTab({
  showPreview,
  importPreview,
  urlInput,
  onUrlInputChange,
  importSelection,
  onUpdateImportSelection,
  onSelectAll,
  onSelectNone,
  onImportFile,
  onImportFromUrl,
  onConfirmImport,
  onCancelImport,
  isLoading
}: ImportTabProps) {
  const { t } = useLanguage();

  if (showPreview && importPreview) {
    return (
      <ImportPreview
        importPreview={importPreview}
        importSelection={importSelection}
        onUpdateImportSelection={onUpdateImportSelection}
        onSelectAll={onSelectAll}
        onSelectNone={onSelectNone}
        onConfirmImport={onConfirmImport}
        onCancelImport={onCancelImport}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('importData')}</CardTitle>
        <CardDescription>{t('importDataDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onImportFile} 
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
            onChange={e => onUrlInputChange(e.target.value)} 
            placeholder={t('pasteUrlHere')} 
            disabled={isLoading} 
          />
          <Button 
            onClick={onImportFromUrl} 
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
  );
}
