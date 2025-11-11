import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  save: any;
  slotNumber: number;
  onDelete: () => void;
  isLoading: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  save,
  slotNumber,
  onDelete,
  isLoading
}: DeleteConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmDelete')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('deleteSaveConfirmQuestion')}</p>
          {save && (
            <div className="p-3 border border-destructive rounded-md bg-destructive/10">
              <div className="text-sm font-medium">
                {save.metadata?.name || `Save Slot ${slotNumber + 1}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {save.metadata?.createdAt 
                  ? new Date(save.metadata.createdAt).toLocaleString() 
                  : t('unknownDate')}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={onDelete} 
            variant="destructive" 
            disabled={isLoading} 
            className="flex-1"
          >
            {t('deleteSave')}
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
