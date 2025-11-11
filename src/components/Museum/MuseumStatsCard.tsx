import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/hooks/useLanguage';
import type { Effects } from '@/lib/gameData';


interface MuseumStatsCardProps {
  /** Calculated museum stat bonuses */
  museumStats: Effects;
  /** Whether to show max stats or weight-based stats */
  showMaxStats: boolean;
  /** Callback when toggling stats display mode */
  onToggleMaxStats: (value: boolean) => void;
}

/**
 * MuseumStatsCard - Displays aggregate stat bonuses from all museum ores.
 * 
 * Features:
 * - Shows all stat categories (luck, dig strength, dig speed, etc.)
 * - Toggle between max bonuses and weight-based bonuses
 * - Sticky positioning for easy reference while scrolling
 */
export function MuseumStatsCard({ museumStats, showMaxStats, onToggleMaxStats }: MuseumStatsCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="sticky top-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>
            {t('museumStats')}
          </CardTitle>
        </div>
        {/* Toggle between weight-based and max stats */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Weight</span>
          <Switch
            checked={showMaxStats}
            onCheckedChange={onToggleMaxStats}
            aria-label="Toggle museum stats mode"
          />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Max</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(museumStats).map(([stat, value]) => {
          // In weight mode, show 0 (placeholder until weight-based calculation is implemented)
          const displayValue = showMaxStats ? value : 0;
          return (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-sm capitalize">
                {t(stat as any)}
              </span>
              <span className="font-mono text-accent">
                {displayValue > 0 ? '+' : ''}{displayValue.toFixed(3)}x
              </span>
            </div>
          );
        })}
        {/* Placeholder notice for weight mode */}
        {!showMaxStats && (
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-muted">
            Placeholder - in weight mode the values are currently set to 0.000x. I'm currently working on adding functionality
          </p>
        )}
      </CardContent>
    </Card>
  );
}
