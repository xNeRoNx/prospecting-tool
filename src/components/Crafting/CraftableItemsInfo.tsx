import { Card, CardContent } from '@/components/ui/card';
import { Check, Hammer } from '@phosphor-icons/react';
import type { CraftingItem } from '@/hooks/useAppData';
import type { CraftableItem } from '@/lib/gameData';

interface CraftableItemsInfoProps {
  craftableItems: Array<{ item: CraftingItem; maxQuantity: number }>;
  resolveItem: (craftingItem: CraftingItem) => CraftableItem | null;
  t: (key: any) => string;
}

export default function CraftableItemsInfo({
  craftableItems,
  resolveItem,
  t
}: CraftableItemsInfoProps) {
  if (craftableItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-500/20 bg-green-500/5">
      <CardContent className="p-4">
        <h4 className="font-medium text-green-400 flex items-center gap-2 mb-3">
          <Check size={16} />
          {t('canCraft')}
        </h4>
        <div className="space-y-1">
          {craftableItems.map(({ item, maxQuantity }) => {
            const fullItem = resolveItem(item);
            if (!fullItem) return null;
            return (
              <div key={item.id} className="text-sm flex items-center gap-2 text-green-400">
                <Hammer size={14} />
                <span>
                  <strong>{fullItem.name}</strong>: {t('canCraft')} {maxQuantity} / {item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
