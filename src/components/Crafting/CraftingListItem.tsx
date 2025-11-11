import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, X, Hammer, Wrench, ArrowCounterClockwise } from '@phosphor-icons/react';
import type { CraftableItem } from '@/lib/gameData';
import type { CraftingItem } from '@/hooks/useAppData';
import { getRarityClass } from './utils';

interface CraftingListItemProps {
  craftingItem: CraftingItem;
  fullItem: CraftableItem;
  showMinimalMaterials: boolean;
  isLoading: boolean;
  onToggleCompleted: (id: string) => void;
  onCraftOne: (id: string) => void;
  onUndoOne: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  t: (key: any) => string;
}

export function CraftingListItem({
  craftingItem,
  fullItem,
  showMinimalMaterials,
  isLoading,
  onToggleCompleted,
  onCraftOne,
  onUndoOne,
  onUpdateQuantity,
  onRemove,
  t
}: CraftingListItemProps) {
  return (
    <Card className={`${craftingItem.completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Checkbox
                checked={craftingItem.completed}
                onCheckedChange={() => onToggleCompleted(craftingItem.id)}
                className="mt-1"
                disabled={isLoading}
              />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getRarityClass(fullItem.rarity)} variant="outline">
                    {fullItem.rarity}
                  </Badge>
                  <span className="font-medium break-words">{fullItem.name}</span>
                  <Badge variant="secondary" className="text-xs">{fullItem.position}</Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <span>{t('quantity')}: {(craftingItem.craftedCount || 0)}/{craftingItem.quantity}</span>
                  <span>
                    {t('cost')}: $
                    {showMinimalMaterials 
                      ? fullItem.cost.toLocaleString()
                      : (fullItem.cost * craftingItem.quantity).toLocaleString()
                    }
                  </span>
                </div>
                
                <div className="text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <Wrench size={12} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground font-medium">Materials:</span>
                  </div>
                  <div className="text-muted-foreground break-words">
                    {showMinimalMaterials 
                      ? fullItem.recipe.map(r => 
                          `${r.amount} ${r.material}${r.weight ? ` (+${r.weight}kg)` : ''}`
                        ).join(', ')
                      : fullItem.recipe.map(r => 
                          `${r.amount * craftingItem.quantity} ${r.material}${r.weight ? ` (+${r.weight}kg)` : ''}`
                        ).join(', ')
                    }
                  </div>
                </div>
              </div>
            </div>
          
            <div className="flex items-center gap-1 flex-shrink-0 ml-2 mr-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCraftOne(craftingItem.id)}
                className="h-8 w-8 p-0"
                disabled={isLoading || craftingItem.completed || (craftingItem.craftedCount || 0) >= craftingItem.quantity}
                title={t('craftOne')}
              >
                <Hammer size={12} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUndoOne(craftingItem.id)}
                className="h-8 w-8 p-0"
                disabled={isLoading || (craftingItem.craftedCount || 0) <= 0}
                title={t('undoOne')}
              >
                <ArrowCounterClockwise size={12} />
              </Button>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(craftingItem.id, craftingItem.quantity - 1)}
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <Minus size={12} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(craftingItem.id, craftingItem.quantity + 1)}
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <Plus size={12} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemove(craftingItem.id)}
                className="h-8 w-8 p-0 text-destructive"
                disabled={isLoading}
              >
                <X size={12} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
