import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import { SaveMetadata } from './types';

/**
 * Props for the SaveDialog component
 */
interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotNumber: number;
  existingSave: any;
  saveMetadata: SaveMetadata;
  onSaveMetadataChange: (metadata: SaveMetadata) => void;
  onSave: () => void;
  isLoading: boolean;
}

/**
 * Dialog for saving data to a slot with metadata input
 */

export function SaveDialog({
  open,
  onOpenChange,
  slotNumber,
  existingSave,
  saveMetadata,
  onSaveMetadataChange,
  onSave,
  isLoading
}: SaveDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingSave ? t('overwriteSave') : t('saveToSlot')} {slotNumber + 1}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {existingSave && (
            <div className="p-3 border border-accent rounded-md bg-accent/10">
              <div className="text-sm font-medium">{t('confirmDelete')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('currentSave')}: {existingSave.metadata?.name || t('unnamedSave')}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="save-name-dialog" className="text-sm font-medium">
              {t('saveName')}
            </label>
            <Input 
              id="save-name-dialog" 
              value={saveMetadata.name} 
              onChange={e => onSaveMetadataChange({ ...saveMetadata, name: e.target.value })} 
              placeholder={t('placeholderSaveName')} 
              disabled={isLoading} 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="save-description-dialog" className="text-sm font-medium">
              {t('descriptionOptional')}
            </label>
            <Textarea 
              id="save-description-dialog" 
              value={saveMetadata.description} 
              onChange={e => onSaveMetadataChange({ ...saveMetadata, description: e.target.value })} 
              placeholder={t('placeholderSaveDescription')} 
              rows={2} 
              disabled={isLoading} 
            />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={onSave} 
            disabled={isLoading} 
            className="flex-1"
          >
            {existingSave ? t('overwriteSave') : t('saveData')}
          </Button>
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline" 
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
