import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Minus, X, Broom, Trash } from '@phosphor-icons/react';
import { getRarityClass, getAddableMaterials } from './utils';

interface MaterialsInventoryProps {
  ownedMaterials: Record<string, number>;
  isLoading: boolean;
  onUpdateMaterial: (material: string, amount: number) => void;
  onRemoveMaterial: (name: string) => void;
  onClearUnused: () => void;
  onClearZero: () => void;
  onAddMaterial: (name: string) => void;
  getMaterialRarity: (materialName: string) => string;
  materialIsRemovable: (name: string) => boolean;
  t: (key: any) => string;
}

export function MaterialsInventory({
  ownedMaterials,
  isLoading,
  onUpdateMaterial,
  onRemoveMaterial,
  onClearUnused,
  onClearZero,
  onAddMaterial,
  getMaterialRarity,
  materialIsRemovable,
  t
}: MaterialsInventoryProps) {
  const addableMaterials = getAddableMaterials(ownedMaterials);

  return (
    <div className="space-y-4 col-span-1 xl:col-span-2">
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 gap-4">
          <div>
            <CardTitle className="text-lg">{t('inventory')} – {t('ownedMaterials')}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed hidden sm:block">{t('materialsInventoryHint')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onClearUnused} 
              disabled={isLoading} 
              title={t('clearUnusedMaterials')} 
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <Broom size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onClearZero} 
              disabled={isLoading} 
              title={t('clearZeroMaterials')} 
              className="h-8 w-8 p-0 flex items-center justify-center"
            >
              <Trash size={16} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" disabled={isLoading || addableMaterials.length === 0}>
                  <Plus size={14} /> {t('addMaterial')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('addMaterial')}</DialogTitle>
                </DialogHeader>
                {addableMaterials.length === 0 ? (
                  <div className="text-sm text-muted-foreground">{t('noMaterials')}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addableMaterials.map(ore => (
                      <Button
                        key={ore.name}
                        variant="outline"
                        className="justify-start h-auto py-2 px-3 flex flex-col items-start gap-1 text-left"
                        onClick={() => onAddMaterial(ore.name)}
                        disabled={isLoading}
                      >
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Badge className={getRarityClass(ore.rarity)} variant="outline">{ore.rarity}</Badge>
                          {ore.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {Object.keys(ownedMaterials).length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">{t('inventoryEmpty')}</div>
          ) : (
            Object.entries(ownedMaterials)
              .sort(([nameA], [nameB]) => {
                const order = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
                const rarityA = getMaterialRarity(nameA);
                const rarityB = getMaterialRarity(nameB);
                const diff = order.indexOf(rarityA) - order.indexOf(rarityB);
                if (diff !== 0) return diff;
                return nameA.localeCompare(nameB);
              })
              .map(([name, value]) => {
                const rarity = getMaterialRarity(name);
                const removable = materialIsRemovable(name);
                return (
                  <div key={name} className="flex items-center gap-2">
                    <Badge className={getRarityClass(rarity)} variant="outline">{rarity}</Badge>
                    <span className="flex-1 min-w-0 truncate" title={name}>{name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => onUpdateMaterial(name, value - 1)}
                        disabled={isLoading || value <= 0}
                      >
                        <Minus size={12} />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => onUpdateMaterial(name, parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-xs text-center"
                        disabled={isLoading}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => onUpdateMaterial(name, value + 1)}
                        disabled={isLoading}
                      >
                        <Plus size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => onRemoveMaterial(name)}
                        disabled={!removable || isLoading}
                        title={removable ? t('removeMaterial') : t('alreadyAdded')}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
