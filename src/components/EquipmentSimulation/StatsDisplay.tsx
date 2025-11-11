import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Calculator } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { formatStatValue } from './utils';
import type { EquipmentStats, StatMap } from './types';

interface StatsDisplayProps {
  baseStats: EquipmentStats;
  finalStats: EquipmentStats;
  eventStats: EquipmentStats;
  museumBonuses: StatMap | Record<string, number>;
  luckEfficiency: string;
  showMaxMuseum: boolean;
  onToggleMuseumMode: (value: boolean) => void;
}

export function StatsDisplay({ 
  baseStats, 
  finalStats, 
  eventStats, 
  museumBonuses,
  luckEfficiency,
  showMaxMuseum,
  onToggleMuseumMode
}: StatsDisplayProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Base Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={20} />
            {t('baseStats')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(baseStats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <span className="font-mono">
                {formatStatValue(stat, value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* With Museum */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-accent">{t('withMuseum')}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('weight')}</span>
            <Switch
              checked={showMaxMuseum}
              onCheckedChange={onToggleMuseumMode}
              aria-label="Toggle museum mode"
            />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Max</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(finalStats).map(([stat, value]) => {
            const displayed = showMaxMuseum ? value : baseStats[stat];
            return (
              <div key={stat} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                <span className="font-mono text-accent">
                  {formatStatValue(stat, displayed)}
                </span>
              </div>
            );
          })}

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">{t('museumBonuses')}</h4>
            {Object.entries(museumBonuses).map(([stat, bonus]) => {
              if (bonus === 0) return null;
              const shownBonus = showMaxMuseum ? bonus : 0;
              return (
                <div key={stat} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-muted-foreground">
                    {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                  <span className="font-mono text-accent">
                    {shownBonus > 0 ? '+' : ''}{(shownBonus * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
            {!showMaxMuseum && (
              <p className="text-[10px] text-muted-foreground pt-1 border-t border-muted">{t('weightModePlaceholder')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* With Event Bonuses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{t('withEventBonuses')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(eventStats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {stat.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <span className="font-mono text-primary">
                {formatStatValue(stat, value)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Luck Efficiency */}
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle>{t('luckEfficiency')}</CardTitle>
          <span>{luckEfficiency}</span>
        </CardHeader>
      </Card>
    </div>
  );
}
