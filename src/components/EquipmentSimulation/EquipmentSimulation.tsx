import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import { type CraftableItem, createItemReference } from '@/lib/gameData';
import { calculateMuseumBonuses as sharedCalculateMuseumBonuses } from '@/components/Museum';
import { ShovelCard } from './ShovelCard';
import { PanCard } from './PanCard';
import { RingsCard } from './RingsCard';
import { JewelryCard } from './JewelryCard';
import { PotionsCard } from './PotionsCard';
import { EventsCard } from './EventsCard';
import { CustomStatsCard } from './CustomStatsCard';
import { StatsDisplay } from './StatsDisplay';
import { 
  calculateBaseStats, 
  calculateLuckEfficiency, 
  applyEventMultipliers, 
  separateEventMultipliers 
} from './utils';
import type { StatMap } from './types';

export function EquipmentSimulation() {
  const { t } = useLanguage();
  const { isLoading, equipment, setEquipment, museumSlots } = useAppData();
  const [showMaxMuseum, setShowMaxMuseum] = useState(true);

  const updateEquipment = (updates: Partial<typeof equipment>) => {
    setEquipment((prev: typeof equipment) => ({ ...prev, ...updates }));
  };

  const equipItem = (item: CraftableItem, position: 'rings' | 'necklace' | 'charm', slotIndex?: number) => {
    const reference = createItemReference(item);
    if (position === 'rings' && typeof slotIndex === 'number') {
      const newRings = [...equipment.rings];
      newRings[slotIndex] = reference;
      updateEquipment({ rings: newRings });
    } else if (position === 'necklace') {
      updateEquipment({ necklace: reference });
    } else if (position === 'charm') {
      updateEquipment({ charm: reference });
    }
  };

  const unequipItem = (position: 'rings' | 'necklace' | 'charm', slotIndex?: number) => {
    if (position === 'rings' && typeof slotIndex === 'number') {
      const newRings = [...equipment.rings];
      newRings[slotIndex] = null as any;
      updateEquipment({ rings: newRings });
    } else if (position === 'necklace') {
      updateEquipment({ necklace: null });
    } else if (position === 'charm') {
      updateEquipment({ charm: null });
    }
  };

  const setRingSix = (index: number, value: boolean) => {
    const current = [...(equipment.ringsSix ?? new Array(equipment.rings.length).fill(false))];
    current[index] = value;
    updateEquipment({ ringsSix: current });
  };

  const massSetRingsSix = (value: boolean) => {
    const current = new Array(equipment.rings.length).fill(value);
    updateEquipment({ ringsSix: current });
  };

  const togglePotion = (potionName: string) => {
    const currentPotions = equipment.activePotions || [];
    const isActive = currentPotions.includes(potionName);
    if (isActive) {
      updateEquipment({ activePotions: currentPotions.filter(p => p !== potionName) });
    } else {
      updateEquipment({ activePotions: [...currentPotions, potionName] });
    }
  };

  const toggleEvent = (eventName: string) => {
    const currentEvents = equipment.activeEvents || [];
    const isActive = currentEvents.includes(eventName);
    if (isActive) {
      updateEquipment({ activeEvents: currentEvents.filter(e => e !== eventName) });
    } else {
      updateEquipment({ activeEvents: [...currentEvents, eventName] });
    }
  };

  const addCustomStat = (statName: string, value: number) => {
    updateEquipment({
      customStats: {
        ...equipment.customStats,
        [statName]: (equipment.customStats[statName] || 0) + value
      }
    });
  };

  const removeCustomStat = (statName: string) => {
    const newStats = { ...equipment.customStats };
    delete newStats[statName];
    updateEquipment({ customStats: newStats });
  };

  const { preTotals, postTotals } = separateEventMultipliers(equipment.activeEvents || []);
  const baseStats = calculateBaseStats(equipment);
  const museumBonusesMax = sharedCalculateMuseumBonuses(museumSlots);
  const museumBonusesWeight = { luck: 0, digStrength: 0, digSpeed: 0, shakeStrength: 0, shakeSpeed: 0, capacity: 0, sellBoost: 0, sizeBoost: 0, modifierBoost: 0 };
  const museumBonusesDisplayed = showMaxMuseum ? museumBonusesMax : museumBonusesWeight;
  const { finalStats, eventStats } = applyEventMultipliers(baseStats, museumBonusesDisplayed as StatMap, preTotals, postTotals);

  const luckEfficiencyValue = (() => {
    const luck = eventStats.luck || 0;
    const capacity = eventStats.capacity || 0;
    const digStrength = eventStats.digStrength || 0;
    const digSpeed = eventStats.digSpeed || 0;
    const shakeStrength = eventStats.shakeStrength || 0;
    const shakeSpeed = eventStats.shakeSpeed || 0;
    const result = calculateLuckEfficiency(luck, capacity, digStrength, digSpeed, shakeStrength, shakeSpeed);
    return isNaN(result) ? '' : result.toFixed(1);
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('equipment')} (beta)</h2>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShovelCard selectedShovel={equipment.shovel} onShovelChange={(value) => updateEquipment({ shovel: value })} isLoading={isLoading} />
            <PanCard selectedPan={equipment.pan} selectedEnchant={equipment.enchant} onPanChange={(value) => updateEquipment({ pan: value })} onEnchantChange={(value) => updateEquipment({ enchant: value })} isLoading={isLoading} />
          </div>
          <RingsCard rings={equipment.rings} ringsSix={equipment.ringsSix} onEquipRing={(item, index) => equipItem(item, 'rings', index)} onUnequipRing={(index) => unequipItem('rings', index)} onToggleRingSix={setRingSix} onMassToggleRingsSix={massSetRingsSix} isLoading={isLoading} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JewelryCard item={equipment.necklace} itemSix={equipment.necklaceSix} position="Necklace" onEquip={(item) => equipItem(item, 'necklace')} onUnequip={() => unequipItem('necklace')} onToggleSix={(value) => updateEquipment({ necklaceSix: value })} isLoading={isLoading} />
            <JewelryCard item={equipment.charm} itemSix={equipment.charmSix} position="Charm" onEquip={(item) => equipItem(item, 'charm')} onUnequip={() => unequipItem('charm')} onToggleSix={(value) => updateEquipment({ charmSix: value })} isLoading={isLoading} />
          </div>
          <PotionsCard activePotions={equipment.activePotions || []} onTogglePotion={togglePotion} isLoading={isLoading} />
          <EventsCard activeEvents={equipment.activeEvents || []} onToggleEvent={toggleEvent} isLoading={isLoading} />
          <CustomStatsCard customStats={equipment.customStats} onAddCustomStat={addCustomStat} onRemoveCustomStat={removeCustomStat} isLoading={isLoading} />
        </div>
        <StatsDisplay baseStats={baseStats} finalStats={finalStats} eventStats={eventStats} museumBonuses={museumBonusesMax as StatMap} luckEfficiency={luckEfficiencyValue} showMaxMuseum={showMaxMuseum} onToggleMuseumMode={setShowMaxMuseum} />
      </div>
    </div>
  );
}
