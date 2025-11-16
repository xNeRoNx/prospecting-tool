import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { craftableItems, type CraftableItem, getItemByReference } from '@/lib/gameData';
import { getRarityClass, sortByRarity } from './utils';

interface JewelryCardProps {
  item: any;
  itemSix?: boolean;
  position: 'Necklace' | 'Charm';
  onEquip: (item: CraftableItem) => void;
  onUnequip: () => void;
  onToggleSix: (value: boolean) => void;
  isLoading: boolean;
}

export function JewelryCard({ 
  item: itemRef, 
  itemSix,
  position,
  onEquip, 
  onUnequip,
  onToggleSix,
  isLoading 
}: JewelryCardProps) {
  const { t } = useLanguage();

  const item = itemRef ? getItemByReference(itemRef) : null;

  const getItemStatsForTier = (item: CraftableItem, useSix?: boolean) => 
    useSix && item.sixStarStats ? item.sixStarStats : item.stats;

  const renderItemStats = (item: CraftableItem, useSix?: boolean) => {
    if (!item?.stats) return null;
    return (
      <div className="mt-1 space-y-0.5">
        {Object.entries(getItemStatsForTier(item, useSix)).map(([statKey, range]) => {
          if (!Array.isArray(range)) return null;
          const [min, max] = range as [number, number];
          const isPercent = /Speed|Boost/i.test(statKey);
          const label = t(statKey as any) || statKey;
          const fmt = (v: number) => `${v > 0 ? '+' : ''}${v}${isPercent ? '%' : ''}`;
          return (
            <div key={statKey} className="text-[10px] leading-tight text-muted-foreground flex justify-between">
              <span className="truncate pr-1 capitalize">{label}</span>
              <span className="font-mono">{fmt(min)}–{fmt(max)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const availableItems = sortByRarity(craftableItems.filter(i => i.position === position));
  const titleKey = position === 'Necklace' ? 'necklace' : 'charm';
  const selectTitleKey = position === 'Necklace' ? 'selectNecklace' : 'selectCharm';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent>
        {item ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getRarityClass(item.rarity)} variant="outline">
                  {item.rarity}
                </Badge>
                {item.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>5★</span>
                <Switch 
                  checked={!!itemSix} 
                  onCheckedChange={onToggleSix} 
                  aria-label={`Toggle ${item.name} tier`} 
                />
                <span>6★</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onUnequip}
                disabled={isLoading}
              >
                <X size={12} />
              </Button>
            </div>
            <p className="font-medium">{item.name}</p>
            {renderItemStats(item, itemSix)}
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-24 border-dashed">
                <Plus size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[95vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>{t(selectTitleKey)}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-2">
                {availableItems.map(availableItem => {
                  const allStatKeys = new Set<string>();
                  Object.keys(availableItem.stats || {}).forEach(k => allStatKeys.add(k));
                  Object.keys(availableItem.sixStarStats || {}).forEach(k => allStatKeys.add(k));
                  return (
                    <Card 
                      key={availableItem.name}
                      className="cursor-pointer transition-colors hover:bg-accent/10"
                      onClick={() => onEquip(availableItem)}
                    >
                      <CardContent className="px-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getRarityClass(availableItem.rarity)} variant="outline">
                                {availableItem.rarity}
                              </Badge>
                              <span className="font-medium">{availableItem.name}</span>
                              {availableItem.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                            </div>
                            
                            <div className="text-xs space-y-1">
                              {Array.from(allStatKeys).map(key => {
                                const baseRange = availableItem.stats?.[key];
                                const extRange = availableItem.sixStarStats?.[key];
                                if (!Array.isArray(baseRange)) return null;
                                const [bMin, bMax] = baseRange as [number, number];
                                const isPercent = /Speed|Boost/i.test(key);
                                const fmt = (v: number) => `${v}${isPercent ? '%' : ''}`;
                                let extPart = '';
                                if (Array.isArray(extRange)) {
                                  const [eMin, eMax] = extRange as [number, number];
                                  extPart = ` [${fmt(eMin)} - ${fmt(eMax)}]`;
                                }
                                return (
                                  <div key={key} className="text-muted-foreground">
                                    {t(key as any) || key}: {fmt(bMin)} - {fmt(bMax)}{extPart}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <p className='text-xs text-muted-foreground'>*{t('statsInfo')}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}