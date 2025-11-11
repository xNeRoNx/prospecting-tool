import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { availableStats } from '@/lib/gameData';
import type { StatMap } from './types';

interface CustomStatsCardProps {
  customStats: StatMap;
  onAddCustomStat: (statName: string, value: number) => void;
  onRemoveCustomStat: (statName: string) => void;
  isLoading: boolean;
}

export function CustomStatsCard({ 
  customStats, 
  onAddCustomStat, 
  onRemoveCustomStat,
  isLoading 
}: CustomStatsCardProps) {
  const { t } = useLanguage();
  const [customStatName, setCustomStatName] = React.useState('');
  const [customStatValue, setCustomStatValue] = React.useState(0);

  const handleAddCustomStat = () => {
    if (!customStatName.trim() || customStatValue === 0) return;
    if (!availableStats.includes(customStatName as any)) return;
    
    onAddCustomStat(customStatName, customStatValue);
    setCustomStatName('');
    setCustomStatValue(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('customStats')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={customStatName}
            onValueChange={setCustomStatName}
            disabled={isLoading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t('selectStatToBoost')} />
            </SelectTrigger>
            <SelectContent>
              {availableStats.map(stat => (
                <SelectItem key={stat} value={stat}>
                  {t(stat as any) || stat.charAt(0).toUpperCase() + stat.slice(1).replace(/([A-Z])/g, ' $1')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Value"
              value={customStatValue}
              onChange={(e) => setCustomStatValue(parseFloat(e.target.value) || 0)}
              className="w-20 sm:w-24"
              disabled={isLoading}
            />
            <Button onClick={handleAddCustomStat} className="flex-shrink-0" disabled={isLoading}>
              <Plus size={16} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(customStats).map(([name, value]) => (
            <div key={name} className="flex items-center justify-between bg-muted px-2 py-1 rounded">
              <span className="text-sm truncate">{t(name as any)}: {value}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveCustomStat(name)}
                className="flex-shrink-0"
                disabled={isLoading}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Add React import
import * as React from 'react';
