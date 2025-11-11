import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/hooks/useLanguage';
import { DataSelection } from './types';

/**
 * Props for the DataSelectionForm component
 */
interface DataSelectionFormProps {
  selection: DataSelection;
  onUpdateSelection: (type: keyof DataSelection, checked: boolean) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  isExport: boolean;
  isLoading?: boolean;
  craftingItemsCount: number;
  museumSlotsCount: number;
  ownedMaterialsCount: number;
}

/**
 * Form component for selecting which data categories to import or export
 */

export function DataSelectionForm({
  selection,
  onUpdateSelection,
  onSelectAll,
  onSelectNone,
  isExport,
  isLoading = false,
  craftingItemsCount,
  museumSlotsCount,
  ownedMaterialsCount
}: DataSelectionFormProps) {
  const { t } = useLanguage();
  const prefix = isExport ? 'export' : 'import';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 data-selection-buttons">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSelectAll} 
          className="w-full sm:w-auto" 
          disabled={isLoading}
        >
          {t('selectAll')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSelectNone} 
          className="w-full sm:w-auto" 
          disabled={isLoading}
        >
          {t('selectNone')}
        </Button>
      </div>
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id={`crafting-${prefix}`} 
            checked={selection.craftingItems} 
            onCheckedChange={c => onUpdateSelection('craftingItems', !!c)} 
            className="mt-0.5 shrink-0" 
            disabled={isLoading} 
          />
          <label 
            htmlFor={`crafting-${prefix}`} 
            className="text-sm font-medium break-words checkbox-label"
          >
            {t('crafting')} ({craftingItemsCount} {t('items')})
          </label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox 
            id={`museum-${prefix}`} 
            checked={selection.museumSlots} 
            onCheckedChange={c => onUpdateSelection('museumSlots', !!c)} 
            className="mt-0.5 shrink-0" 
            disabled={isLoading} 
          />
          <label 
            htmlFor={`museum-${prefix}`} 
            className="text-sm font-medium break-words checkbox-label"
          >
            {t('museum')} ({museumSlotsCount} {t('slots')})
          </label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox 
            id={`equipment-${prefix}`} 
            checked={selection.equipment} 
            onCheckedChange={c => onUpdateSelection('equipment', !!c)} 
            className="mt-0.5 shrink-0" 
            disabled={isLoading} 
          />
          <label 
            htmlFor={`equipment-${prefix}`} 
            className="text-sm font-medium break-words checkbox-label"
          >
            {t('equipment')}
          </label>
        </div>
        <div className="flex items-start space-x-2">
          <Checkbox 
            id={`materials-${prefix}`} 
            checked={selection.ownedMaterials} 
            onCheckedChange={c => onUpdateSelection('ownedMaterials', !!c)} 
            className="mt-0.5 shrink-0" 
            disabled={isLoading} 
          />
          <label 
            htmlFor={`materials-${prefix}`} 
            className="text-sm font-medium break-words checkbox-label"
          >
            {t('ownedMaterials')} ({ownedMaterialsCount} {t('materials')})
          </label>
        </div>
      </div>
    </div>
  );
}
