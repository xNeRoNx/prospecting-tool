import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import type { MuseumSlot } from '@/hooks/useAppData';
import { MuseumSlotCard } from './MuseumSlotCard';
import { MuseumOverviewDialog } from './MuseumOverviewDialog';
import { MuseumStatsCard } from './MuseumStatsCard';
import { initializeMuseumSlots, groupSlotsByRarity, getUsedOres, getRarityClass, calculateMuseumBonuses } from './utils';

/**
 * Museum component - Main interface for managing ore displays and viewing stat bonuses.
 * 
 * Features:
 * - Display cases organized by ore rarity
 * - Ore and modifier selection per slot
 * - Weight-based bonus calculation
 * - Overview dialog showing all placed ores
 * - Real-time stat bonus calculations
 */
export function Museum() {
  const { t } = useLanguage();
  const { isLoading, museumSlots, setMuseumSlots } = useAppData();
  const [showMaxStats, setShowMaxStats] = useState(true);

  // Initialize museum slots on first load
  useEffect(() => {
    if (!isLoading && museumSlots.length === 0) {
      const slots = initializeMuseumSlots();
      setMuseumSlots(slots);
    }
  }, [museumSlots, setMuseumSlots, isLoading]);

  /**
   * Updates a specific museum slot with new data.
   * Prevents duplicate ore placement across different slots.
   */
  const updateSlot = (id: string, updates: Partial<MuseumSlot>) => {
    // Check if trying to place the same ore in different slots
    if (updates.ore) {
      const existingOreSlot = museumSlots.find(slot => slot.ore === updates.ore && slot.id !== id);
      if (existingOreSlot) {
        // Don't allow duplicate ores in different slots
        return;
      }
    }
    
    setMuseumSlots(current => (current || []).map(slot => slot.id === id ? { ...slot, ...updates } : slot));
  };

  /**
   * Clears all data from a specific museum slot.
   */
  const clearSlot = (id: string) => {
    setMuseumSlots(current => (current || []).map(slot => slot.id === id ? { ...slot, ore: undefined, modifier: undefined, weight: undefined } : slot));
  };

  // Calculate current museum bonuses
  const museumStats = calculateMuseumBonuses(museumSlots);
  
  // Group slots by rarity for organized display
  const groupedSlots = groupSlotsByRarity(museumSlots);
  
  // Track which ores are already placed to prevent duplicates
  const usedOres = useMemo(() => getUsedOres(museumSlots), [museumSlots]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('museum')} (beta)</h2>
        <MuseumOverviewDialog museumSlots={museumSlots} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {Object.entries(groupedSlots).map(([rarity, slots]) => (
            <Card key={rarity}>
              <CardHeader>
                <CardTitle className={`${getRarityClass(rarity)} flex items-center gap-2`}>
                  <span>{rarity} Ores</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot, index) => (
                    <MuseumSlotCard
                      key={slot.id}
                      slot={slot}
                      index={index}
                      usedOres={usedOres}
                      rarity={rarity}
                      isLoading={isLoading}
                      onUpdateSlot={updateSlot}
                      onClearSlot={clearSlot}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <MuseumStatsCard 
            museumStats={museumStats}
            showMaxStats={showMaxStats}
            onToggleMaxStats={setShowMaxStats}
          />
        </div>
      </div>
    </div>
  );
}
