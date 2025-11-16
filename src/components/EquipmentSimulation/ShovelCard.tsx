import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { shovels } from '@/lib/gameData';
import { formatStatValue, formatPrice } from './utils';

interface ShovelCardProps {
  selectedShovel: string | null;
  onShovelChange: (shovel: string | null) => void;
  isLoading: boolean;
}

export function ShovelCard({ selectedShovel, onShovelChange, isLoading }: ShovelCardProps) {
  const { t } = useLanguage();

  const renderShovelStats = () => {
    if (!selectedShovel) return null;
    const shovel = shovels.find(s => s.name === selectedShovel);
    if (!shovel) return null;
    const entries: [string, number][] = [
      ['digStrength', shovel.stats.digStrength],
      ['digSpeed', shovel.stats.digSpeed],
      ['toughness', shovel.stats.toughness]
    ];
    return (
      <div className="mt-3 space-y-0.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[11px] text-muted-foreground">
            <span className="capitalize">{t(k as any) || k}</span>
            <span className="font-mono">{formatStatValue(k, v)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('shovel')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedShovel || ''}
          onValueChange={(value) => onShovelChange(value || null)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select shovel">
              {selectedShovel || "Select shovel"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {shovels.map(shovel => {
              const statsList = [
                `${t('digStrength')}: ${shovel.stats.digStrength}`,
                `${t('digSpeed')}: ${shovel.stats.digSpeed}%`,
                `${t('toughness')}: ${shovel.stats.toughness}`
              ];
              
              return (
                <SelectItem key={shovel.name} value={shovel.name}>
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{shovel.name} - {formatPrice(shovel.price, shovel.candy)}</span>
                      {shovel.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {statsList.join(', ')}
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {renderShovelStats()}
      </CardContent>
    </Card>
  );
}