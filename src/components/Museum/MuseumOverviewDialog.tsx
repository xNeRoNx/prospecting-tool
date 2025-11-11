import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { List } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import type { MuseumSlot } from '@/hooks/useAppData';
import { ores, modifiers, getModifierBonus } from '@/lib/gameData';
import { RARITY_ORDER } from './types';
import { getRarityClass } from './utils';

interface MuseumOverviewDialogProps {
  /** Array of all museum slots */
  museumSlots: MuseumSlot[];
}

/**
 * MuseumOverviewDialog - Shows a comprehensive view of all placed ores.
 * 
 * Features:
 * - Lists all ores grouped by rarity
 * - Shows applied modifiers
 * - Displays weight information
 * - Shows calculated stat bonuses
 * - Sorted by rarity (rarest to common)
 */
export function MuseumOverviewDialog({ museumSlots }: MuseumOverviewDialogProps) {
  const { t } = useLanguage();

  /**
   * Processes museum slots into a grouped overview by rarity.
   * Includes ore effects, modifiers, and weight-based bonus calculations.
   */
  const getMuseumOverview = () => {
    const overviewData = museumSlots
      .filter(slot => slot.ore)
      .map(slot => {
        const ore = ores.find(o => o.name === slot.ore);
        if (!ore) return null;
        
        const modifier = slot.modifier ? modifiers.find(m => m.name === slot.modifier) : null;
        const modifierBonus = modifier ? getModifierBonus(ore.rarity) : 0;
        
        return {
          ore: ore.name,
          rarity: ore.rarity,
          effect: ore.museumEffect.stat,
          maxMultiplier: ore.museumEffect.maxMultiplier,
          modifier: modifier?.name,
          modifierEffect: modifier?.effect,
          modifierBonus,
          weight: slot.weight,
          specialEffects: ore.specialEffects,
          maxWeight: ore.maxWeight
        };
      })
      .filter(Boolean);

    // Group by rarity and sort by rarity order
    const grouped = RARITY_ORDER.reduce((acc, rarity) => {
      const oresOfRarity = overviewData.filter(item => item?.rarity === rarity);
      if (oresOfRarity.length > 0) {
        acc[rarity] = oresOfRarity.sort((a, b) => (a?.ore ?? '').localeCompare(b?.ore ?? ''));
      }
      return acc;
    }, {} as Record<string, typeof overviewData>);

    return grouped;
  };

  const museumOverview = getMuseumOverview();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <List size={16} />
          <span className="hidden sm:inline">{t('overview')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('museumOverview')} (max)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {Object.keys(museumOverview).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('noOresInMuseum')}
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(museumOverview).map(([rarity, ores]) => (
                <div key={rarity} className="space-y-0.5">
                  <h3 className={`font-semibold text-lg ${getRarityClass(rarity)}`}>
                    {rarity}
                  </h3>
                  <div className="space-y-0.25 border-l-2 border-muted pl-2">
                    {ores.map((item, index) => (
                      <div key={index} className="text-sm py-1 border-b border-muted-foreground/10 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className={`font-medium ${getRarityClass(item?.rarity || '')} break-words`}>
                              {item?.ore}
                            </span>
                            {item?.modifier && (
                              <span className="text-accent text-xs font-medium bg-accent/10 px-2 py-1 rounded flex-shrink-0">
                                {item.modifier}
                              </span>
                            )}
                            {item?.weight && (
                              <span className="text-muted-foreground text-xs flex-shrink-0">
                                {item.weight}kg | @ {item.maxWeight}kg
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground text-left sm:text-right sm:ml-2 flex-shrink-0">
                            {(() => {
                              if (!item) return null;
                              const weight = item.weight;
                              const isMax = weight !== undefined && weight > (item.maxWeight || 0);
                              
                              // Display special effects if ore has them
                              if (item.specialEffects) {
                                return (
                                  <div className="space-y-0.5 text-left sm:text-right">
                                    {Object.entries(item.specialEffects).map(([stat, value]) => {
                                      return (
                                        <div key={stat}>
                                          {t(stat as any)}: {isMax ? '' : '0.0x | '} {value > 0 ? '+' : ''}{value}x
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              }
                              
                              // Display normal museum effect
                              return (
                                <>
                                  {item.effect}: {isMax ? '' : '0.0x | '}+{item.maxMultiplier}x
                                </>
                              );
                            })()}
                            {/* Display modifier bonus if present */}
                            {item?.modifier && (
                              <div>
                                {item.modifierEffect}: 0.0x | +{item.modifierBonus}x
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
