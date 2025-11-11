import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus } from '@phosphor-icons/react';
import type { MaterialSummary } from '@/hooks/useAppData';
import { getRarityClass } from './utils';

interface MaterialsSummaryProps {
  materialSummary: MaterialSummary;
  totalCost: number;
  showMinimalMaterials: boolean;
  isLoading: boolean;
  onToggleMinimal: (checked: boolean) => void;
  onUpdateMaterial: (material: string, amount: number) => void;
  getMaterialRarity: (materialName: string) => string;
  t: (key: any) => string;
}

export default function MaterialsSummary({
  materialSummary,
  totalCost,
  showMinimalMaterials,
  isLoading,
  onToggleMinimal,
  onUpdateMaterial,
  getMaterialRarity,
  t
}: MaterialsSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('materialsSummary')}</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="minimal-materials"
            checked={showMinimalMaterials}
            onCheckedChange={onToggleMinimal}
            disabled={isLoading}
          />
          <Label htmlFor="minimal-materials" className="text-sm">
            {t('minimalNeeded')}
          </Label>
        </div>
      </div>
      
      {Object.keys(materialSummary).length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {t('noMaterials')}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Object.entries(materialSummary)
              .sort(([materialA], [materialB]) => {
                const rarityOrder = ['Exotic', 'Mythic', 'Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
                const rarityA = getMaterialRarity(materialA);
                const rarityB = getMaterialRarity(materialB);
                return rarityOrder.indexOf(rarityA) - rarityOrder.indexOf(rarityB);
              })
              .map(([material, data]) => (
              <div key={material} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge 
                      className={getRarityClass(getMaterialRarity(material))} 
                      variant="outline"
                    >
                      {getMaterialRarity(material)}
                    </Badge>
                    <span className="font-medium min-w-0 break-words flex-1">{material}</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateMaterial(material, data.owned - 1)}
                        className="h-6 w-6 p-0"
                        disabled={data.owned <= 0 || isLoading}
                      >
                        <Minus size={12} />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={data.owned}
                        onChange={(e) => onUpdateMaterial(material, parseInt(e.target.value) || 0)}
                        className="w-14 h-6 text-xs text-center"
                        placeholder="0"
                        disabled={isLoading}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateMaterial(material, data.owned + 1)}
                        className="h-6 w-6 p-0"
                        disabled={isLoading}
                      >
                        <Plus size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateMaterial(material, data.needed)}
                        className="h-6 px-1 text-xs"
                        title="Set to max needed"
                        disabled={isLoading}
                      >
                        Max
                      </Button>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        / {data.needed}
                        {data.weight && ` (+${data.weight}kg)`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (data.owned / data.needed) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t('totalCost')}</span>
                <span className="text-green-600 font-mono">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
