import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { craftableItems, type CraftableItem, getItemByReference } from '@/lib/gameData';
import { getRarityClass, sortByRarity } from './utils';

interface RingsCardProps {
  rings: any[];
  ringsSix?: boolean[];
  onEquipRing: (item: CraftableItem, index: number) => void;
  onUnequipRing: (index: number) => void;
  onToggleRingSix: (index: number, value: boolean) => void;
  onMassToggleRingsSix: (value: boolean) => void;
  isLoading: boolean;
}

export function RingsCard({ 
  rings, 
  ringsSix = [],
  onEquipRing, 
  onUnequipRing,
  onToggleRingSix,
  onMassToggleRingsSix,
  isLoading 
}: RingsCardProps) {
  const { t } = useLanguage();

  const isRingSix = (index: number) => ringsSix[index] ?? false;

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

  const availableRings = sortByRarity(craftableItems.filter(item => item.position === 'Ring'));

  const allRingsSix = ringsSix.length > 0 && ringsSix.every(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('rings')} (8)</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>5★</span>
            <Switch
              checked={allRingsSix}
              onCheckedChange={onMassToggleRingsSix}
              aria-label="Toggle all rings to 6★"
            />
            <span>6★</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rings.map((ringRef, index) => {
            const ring = ringRef ? getItemByReference(ringRef) : null;
            return (
              <Card key={index} className="relative">
                <CardContent className="p-3">
                  {ring ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={getRarityClass(ring.rarity)} variant="outline">
                          {ring.rarity}
                        </Badge>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>5★</span>
                          <Switch 
                            checked={isRingSix(index)} 
                            onCheckedChange={(v) => onToggleRingSix(index, v)} 
                            aria-label={`Toggle ${ring.name} tier`} 
                          />
                          <span>6★</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUnequipRing(index)}
                          className="h-6 w-6 p-0"
                          disabled={isLoading}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                      <p className="text-sm font-medium">{ring.name}</p>
                      {renderItemStats(ring, isRingSix(index))}
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-16 border-dashed">
                          <Plus size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-2xl max-h-[95vh] overflow-y-auto'>
                        <DialogHeader>
                          <DialogTitle>{t('selectRing')}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2">
                          {availableRings.map(item => {
                            const allStatKeys = new Set<string>();
                            Object.keys(item.stats || {}).forEach(k => allStatKeys.add(k));
                            Object.keys(item.sixStarStats || {}).forEach(k => allStatKeys.add(k));
                            return (
                              <Card 
                                key={item.name}
                                className="cursor-pointer transition-colors hover:bg-accent/10"
                                onClick={() => onEquipRing(item, index)}
                              >
                                <CardContent className="px-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge className={getRarityClass(item.rarity)} variant="outline">
                                          {item.rarity}
                                        </Badge>
                                        <span className="font-medium">{item.name}</span>
                                      </div>
                                      
                                      <div className="text-xs space-y-1">
                                        {Array.from(allStatKeys).map(key => {
                                          const baseRange = item.stats?.[key];
                                          const extRange = item.sixStarStats?.[key];
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
          })}
        </div>
      </CardContent>
    </Card>
  );
}
