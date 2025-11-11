import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Flask } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { potions } from '@/lib/gameData';

interface PotionsCardProps {
  activePotions: string[];
  onTogglePotion: (potionName: string) => void;
  isLoading: boolean;
}

export function PotionsCard({ activePotions, onTogglePotion, isLoading }: PotionsCardProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flask size={20} />
          {t('potions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {potions.map(potion => (
            <div key={potion.name} className="flex items-center space-x-2">
              <Checkbox
                id={potion.name}
                checked={activePotions.includes(potion.name)}
                onCheckedChange={() => onTogglePotion(potion.name)}
                disabled={isLoading}
              />
              <Label htmlFor={potion.name} className="text-sm">
                {potion.name}
              </Label>
            </div>
          ))}
        </div>
        {activePotions.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">{t('activePotions')}:</p>
            <div className="space-y-1">
              {activePotions.map(potionName => {
                const potion = potions.find(p => p.name === potionName);
                if (!potion) return null;
                
                return (
                  <div key={potionName} className="text-xs">
                    <span className="font-medium">{potion.name}:</span>
                    <span className="ml-1">
                      {Object.entries(potion.effects).map(([stat, value]) => 
                        `${stat.replace(/([A-Z])/g, ' $1').toLowerCase()} +${value}`
                      ).join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
