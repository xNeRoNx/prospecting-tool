import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * Props for the SaveSlotsTab component
 */
interface SaveSlotsTabProps {
  saves: any[];
  isLoading: boolean;
  onOpenSaveDialog: (slot: number) => void;
  onLoadFromSlot: (slot: number) => void;
  onDeleteSave: (slot: number) => void;
}

/**
 * Tab component displaying save slots with save/load/delete functionality
 */

export function SaveSlotsTab({
  saves,
  isLoading,
  onOpenSaveDialog,
  onLoadFromSlot,
  onDeleteSave
}: SaveSlotsTabProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('saveSlots')}</CardTitle>
        <CardDescription>{t('saveAndLoadHint')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {saves.slice(0, 5).map((save, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
              <div className="flex-1 min-w-0">
                {save ? (
                  <div>
                    <div className="font-medium text-sm truncate">
                      {save.metadata?.name || `${t('saveSlot')} ${index + 1}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {save.metadata?.createdAt 
                        ? new Date(save.metadata.createdAt).toLocaleString() 
                        : t('unknownDate')}
                    </div>
                    {save.metadata?.description && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {save.metadata.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">{t('emptySaveSlot')}</div>
                )}
              </div>
              <div className="flex gap-2 ml-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onOpenSaveDialog(index)} 
                  disabled={isLoading}
                >
                  {t('saveData')}
                </Button>
                {save && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onLoadFromSlot(index)} 
                      disabled={isLoading}
                    >
                      {t('loadData')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteSave(index)} 
                      disabled={isLoading}
                    >
                      {t('delete')}
                    </Button>
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
                  <div className="text-xs text-muted-foreground">
                    {saves[5].metadata?.createdAt 
                      ? new Date(saves[5].metadata.createdAt).toLocaleString() 
                      : t('unknownDate')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {saves[5].metadata?.description || t('backupSlotDescription')}
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onLoadFromSlot(5)} 
                    disabled={isLoading}
                  >
                    {t('loadData')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
