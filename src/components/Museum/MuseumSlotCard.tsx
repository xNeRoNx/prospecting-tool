import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import type { MuseumSlot } from '@/hooks/useAppData';
import { ores, modifiers } from '@/lib/gameData';
import { getModifierDisplayText } from './utils';

interface MuseumSlotCardProps {
  /** The museum slot data */
  slot: MuseumSlot;
  /** Display case number (1-indexed) */
  index: number;
  /** Set of ore names already placed in other slots */
  usedOres: Set<string>;
  /** Rarity tier of this slot */
  rarity: string;
  /** Loading state */
  isLoading: boolean;
  /** Callback to update slot data */
  onUpdateSlot: (id: string, updates: Partial<MuseumSlot>) => void;
  /** Callback to clear all slot data */
  onClearSlot: (id: string) => void;
}

/**
 * MuseumSlotCard - Represents a single museum display case.
 * 
 * Allows users to:
 * - Select an ore from the current rarity tier
 * - Choose an optional modifier
 * - Enter the ore weight
 * - View calculated stat bonuses
 * - Clear the slot
 */
export function MuseumSlotCard({
  slot,
  index,
  usedOres,
  rarity,
  isLoading,
  onUpdateSlot,
  onClearSlot
}: MuseumSlotCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="relative">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {t('displayCase')} {index + 1}
            </Label>
            {slot.ore && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onClearSlot(slot.id)}
                className="h-6 w-6 p-0"
                disabled={isLoading}
              >
                <X size={12} />
              </Button>
            )}
          </div>

          <div className="flex justify-between items-center">
            {/* Ore selection dropdown */}
            <Select
              value={slot.ore || ''}
              onValueChange={(value) => onUpdateSlot(slot.id, { ore: value || undefined })}
              disabled={isLoading}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select ore">
                  {slot.ore}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-w-xs sm:max-w-sm">
                {ores
                  .filter(ore => ore.rarity === rarity)
                  .map(ore => {
                    // Build stat info string based on ore effects
                    let statInfo = `${ore.museumEffect.stat}: +${ore.museumEffect.maxMultiplier}x`;
                    
                    // If ore has special effects, show them instead
                    if (ore.specialEffects) {
                      const effects = Object.entries(ore.specialEffects)
                        .map(([stat, value]) => {
                          return `${t(stat as any)}: ${value > 0 ? '+' : ''}${value}x`;
                        })
                        .join(', ');
                      statInfo = effects;
                    }
                    
                    statInfo += ` | @ ${ore.maxWeight}kg`;
                    
                    return (
                      <SelectItem 
                        key={ore.name} 
                        value={ore.name}
                        disabled={usedOres.has(ore.name) && slot.ore !== ore.name}
                        className="flex-col items-start"
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="font-medium">{ore.name}</span>
                            {usedOres.has(ore.name) && slot.ore !== ore.name && (
                              <span className="text-xs text-muted-foreground ml-1">(Used)</span>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs break-words whitespace-normal">
                            {statInfo}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>

            {/* Display required weight for max bonus */}
            <div className="text-xs text-muted-foreground mt-1">
              {slot.ore ? 
                (() => {
                  const ore = ores.find(o => o.name === slot.ore);
                  if (!ore) return null;
                  return `@ ${ore.maxWeight}kg`;
                })() : null
              }
            </div>
          </div>

          {slot.ore && (
            <>
              {/* Modifier selection */}
              <div className="flex gap-1">
                <Select
                  value={slot.modifier || ''}
                  onValueChange={(value) => onUpdateSlot(slot.id, { modifier: value || undefined })}
                  disabled={isLoading}
                >
                  <SelectTrigger className="text-xs flex-1">
                    <SelectValue placeholder="Select modifier">
                      {slot.modifier}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {modifiers.map(modifier => (
                      <SelectItem key={modifier.name} value={modifier.name}>
                        {modifier.name} - {modifier.effect}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {slot.modifier && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateSlot(slot.id, { modifier: undefined })}
                    className="h-8 w-8 p-0 flex-shrink-0"
                    disabled={isLoading}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>

              {/* Weight input */}
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Weight (kg)"
                value={slot.weight !== undefined ? slot.weight.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === null) {
                    onUpdateSlot(slot.id, { weight: undefined });
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      onUpdateSlot(slot.id, { weight: numValue });
                    }
                  }
                }}
                className="text-xs"
                disabled={isLoading}
              />

              {/* Display calculated stat bonuses */}
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const ore = ores.find(o => o.name === slot.ore);
                  if (!ore) return null;
                  
                  if (ore.specialEffects) {
                    // Show all special effects with weight rule
                    const isMax = slot.weight !== undefined && slot.weight > ore.maxWeight;
                    return Object.entries(ore.specialEffects).map(([stat, value]) => {
                      return (
                        <div key={stat}>
                          {t(stat as any)}: {isMax ? '' : '0.0x | '}{value > 0 ? '+' : ''}{value}x
                        </div>
                      );
                    });
                  } else {
                    // Show normal museum effect
                    const isMax = slot.weight !== undefined && slot.weight > ore.maxWeight;
                    return (
                      <>
                        {ore.museumEffect.stat}: {isMax ? '' : '0.0x | '}+{ore.museumEffect.maxMultiplier}x
                      </>
                    );
                  }
                })()}
                {slot.modifier && (
                  <div className="pt-1 border-t border-muted mt-1 space-y-0.5">
                    {getModifierDisplayText(slot.modifier, slot.ore)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
