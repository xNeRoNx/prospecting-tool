import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Wrench } from '@phosphor-icons/react';
import type { CraftableItem } from '@/lib/gameData';
import { getRarityClass } from './utils';

interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: CraftableItem | null;
  quantity: number;
  isLoading: boolean;
  craftableItemsSorted: CraftableItem[];
  onSelectItem: (item: CraftableItem | null) => void;
  onQuantityChange: (quantity: number) => void;
  onAdd: (item: CraftableItem, quantity: number) => void;
  formatStats: (item: CraftableItem) => string[];
  t: (key: any) => string;
}

/**
 * Dialog component for adding new items to the crafting list
 * Features:
 * - List of all available craftable items sorted by rarity
 * - Item selection with click
 * - Quantity input
 * - Recipe preview with scaled quantities
 * - Item stats display
 */
export function AddItemDialog({
  isOpen,
  onOpenChange,
  selectedItem,
  quantity,
  isLoading,
  craftableItemsSorted,
  onSelectItem,
  onQuantityChange,
  onAdd,
  formatStats,
  t
}: AddItemDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Trigger button */}
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          {t('addItem')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[95vh]">
        <DialogHeader>
          <DialogTitle>{t('addItem')}</DialogTitle>
        </DialogHeader>
        {/* Scrollable list of craftable items */}
        <div className="grid grid-cols-1 gap-2 overflow-y-auto">
          {craftableItemsSorted.map(item => (
            <Card 
              key={item.name}
              className={`cursor-pointer transition-colors hover:bg-accent/10 ${
                selectedItem?.name === item.name ? 'bg-accent/20 border-accent' : ''
              }`}
              onClick={() => onSelectItem(selectedItem?.name === item.name ? null : item)}
            >
              <CardContent className="px-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getRarityClass(item.rarity)} variant="outline">
                        {item.rarity}
                      </Badge>
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="secondary">{item.position}</Badge>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      {formatStats(item).map((stat, index) => (
                        <div key={index} className="text-muted-foreground">{stat}</div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-green-600">${item.cost.toLocaleString()}</span>
                      <Wrench size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {item.recipe.map(r => `${r.amount} ${r.material}`).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4 relative bottom-0 left-0 w-full">
          <p className='text-xs text-muted-foreground'>*{t('statsInfo')}</p>
          {selectedItem && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="quantity">{t('quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20"
                  disabled={isLoading}
                />
                
                <Button 
                  onClick={() => onAdd(selectedItem, quantity)}
                  disabled={isLoading}
                >
                  {t('add')}
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t('recipe')}</h4>
                <div className="text-sm space-y-1">
                  {selectedItem.recipe.map(recipe => (
                    <div key={recipe.material} className="flex items-center justify-between">
                      <span>{recipe.material}</span>
                      <span>
                        {recipe.amount * quantity}
                        {recipe.weight && ` (+${recipe.weight}kg)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
