import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { pans, enchants } from '@/lib/gameData';
import { formatStatValue, formatPrice } from './utils';

interface PanCardProps {
  selectedPan: string | null;
  selectedEnchant: string | null;
  onPanChange: (pan: string | null) => void;
  onEnchantChange: (enchant: string | null) => void;
  isLoading: boolean;
}

export function PanCard({ 
  selectedPan, 
  selectedEnchant, 
  onPanChange, 
  onEnchantChange, 
  isLoading 
}: PanCardProps) {
  const { t } = useLanguage();

  const renderPanStats = () => {
    if (!selectedPan) return null;
    const panObj = pans.find(p => p.name === selectedPan);
    if (!panObj) return null;
    const entries: [string, number][] = [
      ['luck', panObj.stats.luck],
      ['capacity', panObj.stats.capacity],
      ['shakeStrength', panObj.stats.shakeStrength],
      ['shakeSpeed', panObj.stats.shakeSpeed]
    ];
    const enchantEffects = selectedEnchant ? enchants.find(e => e.name === selectedEnchant)?.effects : undefined;
    return (
      <div className="mt-3 space-y-0.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px] text-muted-foreground">
            <span className="capitalize">{t(k as any) || k}</span>
            <span className="font-mono">{formatStatValue(k, v)}</span>
          </div>
        ))}
        {panObj.passive && (
          <div className="text-[10px] text-accent mt-1 leading-tight">{panObj.passive}</div>
        )}
        {enchantEffects && (
          <div className="pt-1 border-t border-muted mt-1 space-y-0.5">
            {Object.entries(enchantEffects).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px] text-muted-foreground">
                <span className="capitalize">{t(k as any) || k}</span>
                <span className="font-mono">{v > 0 ? '+' : ''}{v}{/Speed|Boost/i.test(k) ? '%' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pan')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Select
            value={selectedPan || ''}
            onValueChange={(value) => onPanChange(value || null)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pan">
                {selectedPan || "Select pan"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {pans.map(pan => {
                const statsList = [
                  `${t('luck')}: ${pan.stats.luck}`,
                  `${t('capacity')}: ${pan.stats.capacity}`,
                  `${t('shakeStrength')}: ${pan.stats.shakeStrength}`,
                  `${t('shakeSpeed')}: ${pan.stats.shakeSpeed}%`
                ];
                
                const chunks: string[][] = [];
                for (let i = 0; i < statsList.length; i += 3) {
                  chunks.push(statsList.slice(i, i + 3));
                }
                
                return (
                  <SelectItem key={pan.name} value={pan.name}>
                    <div className="flex flex-col items-start gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pan.name} - {formatPrice(pan.price, pan.candy)}</span>
                        {pan.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {chunks.map((chunk, idx) => (
                          <div key={idx}>{chunk.join(', ')}</div>
                        ))}
                        {pan.passive && <div>{pan.passive}</div>}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {selectedPan && (
            <div className="flex items-start gap-2">
              <Select
                value={selectedEnchant || ''}
                onValueChange={(value) => onEnchantChange(value || null)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select enchant">
                    {selectedEnchant || "Select enchant"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {enchants.map(enchant => {
                    const statsEntries = Object.entries(enchant.effects);
                    const statsList = statsEntries
                      .map(([stat, val]) => {
                        const isPercent = /Speed|Boost/i.test(stat);
                        return `${t(stat as keyof typeof t)}: ${val > 0 ? '+' : ''}${val}${isPercent ? '%' : ''}`;
                      });
                    
                    const chunks: string[][] = [];
                    for (let i = 0; i < statsList.length; i += 3) {
                      chunks.push(statsList.slice(i, i + 3));
                    }
                    
                    return (
                      <SelectItem key={enchant.name} value={enchant.name}>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">{enchant.name}</span>
                          <div className="text-[10px] text-muted-foreground">
                            {chunks.map((chunk, idx) => (
                              <div key={idx}>{chunk.join(', ')}</div>
                            ))}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedEnchant && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0"
                  onClick={() => onEnchantChange(null)}
                  disabled={isLoading}
                  title="Clear enchant"
                  aria-label="Clear enchant"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          )}
          {renderPanStats()}
        </div>
      </CardContent>
    </Card>
  );
}