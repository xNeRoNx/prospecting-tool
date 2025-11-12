import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkle, Lock, LockOpen, Gear, CheckCircle } from '@phosphor-icons/react';
import { craftableItems, shovels, pans, enchants } from '@/lib/gameData';
import { optimizeInventory } from './optimizer';
import type { GeneratorConstraints, OptimizationResult } from './types';
import { calculateBaseStats, calculateLuckEfficiency, separateEventMultipliers, applyEventMultipliers } from '@/components/EquipmentSimulation';
import { calculateMuseumBonuses } from '@/components/Museum';

interface InventoryGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryGenerator({ open, onOpenChange }: InventoryGeneratorProps) {
  const { t } = useLanguage();
  const { equipment, setEquipment, museumSlots, setMuseumSlots, createBackupBeforeImport } = useAppData();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentStats, setCurrentStats] = useState<any>(null);
  
  // Constraints state
  const [minRings, setMinRings] = useState(8);
  const [maxRings, setMaxRings] = useState(8);
  const [includeNecklace, setIncludeNecklace] = useState(true);
  const [includeCharm, setIncludeCharm] = useState(true);
  const [includeShovel, setIncludeShovel] = useState(false);
  const [includePan, setIncludePan] = useState(false);
  const [includeEnchant, setIncludeEnchant] = useState(false);
  const [optimizeMuseum, setOptimizeMuseum] = useState(true);
  const [preservePotions, setPreservePotions] = useState(false);
  const [preserveEvents, setPreserveEvents] = useState(false);
  const [useSixStar, setUseSixStar] = useState(true);
  
  // Rarity filters
  const allRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Exotic'];
  const [allowedRarities, setAllowedRarities] = useState<string[]>(allRarities);
  
  // Locked items state
  const [lockedRings, setLockedRings] = useState<(string | null)[]>(new Array(6).fill(null));
  const [lockedNecklace, setLockedNecklace] = useState<string | null>(null);
  const [lockedCharm, setLockedCharm] = useState<string | null>(null);
  const [lockedShovel, setLockedShovel] = useState<string | null>(null);
  const [lockedPan, setLockedPan] = useState<string | null>(null);
  const [lockedEnchant, setLockedEnchant] = useState<string | null>(null);
  
  const rings = craftableItems.filter(item => item.position === 'Ring');
  const necklaces = craftableItems.filter(item => item.position === 'Necklace');
  const charms = craftableItems.filter(item => item.position === 'Charm');
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationComplete(false);
    setResult(null);
    setProgress(0);
    setProgressMessage(t('progressStarting' as any));
    
    // Scroll to top of dialog
    const dialogContent = document.querySelector('.max-w-4xl.max-h-\\[90vh\\]');
    if (dialogContent) {
      dialogContent.scrollTop = 0;
    }
    
    try {
      // Calculate current stats before optimization
      const baseStats = calculateBaseStats(equipment);
      const museumBonuses = calculateMuseumBonuses(museumSlots);
      const museumBonusesAsStatMap = museumBonuses as any;
      const { preTotals, postTotals } = separateEventMultipliers(equipment.activeEvents || []);
      const { eventStats } = applyEventMultipliers(baseStats, museumBonusesAsStatMap, preTotals, postTotals);
      const currentEfficiency = calculateLuckEfficiency(
        eventStats.luck,
        eventStats.capacity,
        eventStats.digStrength,
        eventStats.digSpeed,
        eventStats.shakeStrength,
        eventStats.shakeSpeed
      );
      
      setCurrentStats({
        efficiency: currentEfficiency,
        luck: eventStats.luck,
        capacity: eventStats.capacity,
        digStrength: eventStats.digStrength,
        digSpeed: eventStats.digSpeed,
        shakeStrength: eventStats.shakeStrength,
        shakeSpeed: eventStats.shakeSpeed
      });
      
      // Create backup before generation
      createBackupBeforeImport();
      
      // Build constraints
      const constraints: GeneratorConstraints = {
        minRings,
        maxRings,
        includeNecklace,
        includeCharm,
        includeShovel,
        includePan,
        includeEnchant,
        lockedRings,
        lockedNecklace,
        lockedCharm,
        lockedShovel,
        lockedPan,
        lockedEnchant,
        optimizeMuseum,
        preservePotions,
        preserveEvents,
        useSixStar,
        allowedRarities
      };
      
      // Run optimization with progress updates
      const optimizationResult = await optimizeInventory(
        constraints, 
        equipment, 
        museumSlots,
        (progressPercent, messageKey) => {
          setProgress(progressPercent);
          // Handle special format for testing progress: "progressTesting:X/Y"
          if (messageKey.startsWith('progressTesting:')) {
            const counts = messageKey.split(':')[1];
            setProgressMessage(`${t('progressTesting' as any)} ${counts}`);
          } else {
            setProgressMessage(t(messageKey as any) || messageKey);
          }
        }
      );
      
      setResult(optimizationResult);
      setGenerationComplete(true);
      
    } catch (error) {
      console.error('Error during generation:', error);
      alert('Error during optimization. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleApply = () => {
    if (!result) return;
    
    // Apply the optimized equipment and museum
    setEquipment(result.equipment);
    setMuseumSlots(result.museumSlots);
    
    // Close dialog
    onOpenChange(false);
    
    // Reset state
    setGenerationComplete(false);
    setResult(null);
  };
  
  const handleReset = () => {
    setMinRings(8);
    setMaxRings(8);
    setIncludeNecklace(true);
    setIncludeCharm(true);
    setIncludeShovel(false);
    setIncludePan(false);
    setIncludeEnchant(false);
    setOptimizeMuseum(true);
    setPreservePotions(false);
    setPreserveEvents(false);
    setUseSixStar(true);
    setAllowedRarities(allRarities);
    setLockedRings(new Array(6).fill(null));
    setLockedNecklace(null);
    setLockedCharm(null);
    setLockedShovel(null);
    setLockedPan(null);
    setLockedEnchant(null);
    setGenerationComplete(false);
    setResult(null);
  };
  
  const updateLockedRing = (index: number, value: string | null) => {
    const newLocked = [...lockedRings];
    newLocked[index] = value === 'none' ? null : value;
    setLockedRings(newLocked);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={24} weight="fill" />
            {t('inventoryGenerator' as any) || 'Inventory Generator'}
          </DialogTitle>
          <DialogDescription>
            {t('inventoryGeneratorDescription' as any) || 'Automatically generate the best equipment and museum layout to maximize luck efficiency'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress Display */}
          {isGenerating && (
            <Alert className="bg-blue-500/10 border-blue-500/50">
              <AlertDescription>
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span>{progressMessage}</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Results Display */}
          {generationComplete && result && currentStats && (
            <Alert className="bg-green-500/10 border-green-500/50">
              <CheckCircle size={20} className="text-green-500" />
              <AlertDescription>
                <div className="space-y-4 w-full">
                  <p className="font-semibold">
                    {t('optimizationComplete' as any) || 'Optimization Complete!'}
                  </p>
                  
                  {/* Stats Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-green-500/30">
                          <th className="text-left py-2">{t('stat' as any) || 'Stat'}</th>
                          <th className="text-right py-2">{t('current' as any) || 'Current'}</th>
                          <th className="text-right py-2">{t('optimized' as any) || 'Optimized'}</th>
                          <th className="text-right py-2">{t('change' as any) || 'Change'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-green-500/20">
                          <td className="py-2">{t('efficiency' as any) || 'Efficiency'}</td>
                          <td className="text-right">{currentStats.efficiency.toFixed(2)}</td>
                          <td className="text-right font-semibold">{result.efficiency.toFixed(2)}</td>
                          <td className={`text-right font-semibold ${result.efficiency > currentStats.efficiency ? 'text-green-400' : result.efficiency < currentStats.efficiency ? 'text-red-400' : ''}`}>
                            {result.efficiency > currentStats.efficiency ? '+' : ''}{(result.efficiency - currentStats.efficiency).toFixed(2)}
                          </td>
                        </tr>
                        <tr className="border-b border-green-500/20">
                          <td className="py-2">{t('luck' as any) || 'Luck'}</td>
                          <td className="text-right">{currentStats.luck.toFixed(1)}</td>
                          <td className="text-right font-semibold">{result.stats.luck.toFixed(1)}</td>
                          <td className={`text-right font-semibold ${result.stats.luck > currentStats.luck ? 'text-green-400' : result.stats.luck < currentStats.luck ? 'text-red-400' : ''}`}>
                            {result.stats.luck > currentStats.luck ? '+' : ''}{(result.stats.luck - currentStats.luck).toFixed(1)}
                          </td>
                        </tr>
                        <tr className="border-b border-green-500/20">
                          <td className="py-2">{t('capacity' as any) || 'Capacity'}</td>
                          <td className="text-right">{currentStats.capacity.toFixed(1)}</td>
                          <td className="text-right font-semibold">{result.stats.capacity.toFixed(1)}</td>
                          <td className={`text-right font-semibold ${result.stats.capacity > currentStats.capacity ? 'text-green-400' : result.stats.capacity < currentStats.capacity ? 'text-red-400' : ''}`}>
                            {result.stats.capacity > currentStats.capacity ? '+' : ''}{(result.stats.capacity - currentStats.capacity).toFixed(1)}
                          </td>
                        </tr>
                        <tr className="border-b border-green-500/20">
                          <td className="py-2">{t('digStrength' as any) || 'Dig Strength'}</td>
                          <td className="text-right">{currentStats.digStrength.toFixed(1)}</td>
                          <td className="text-right font-semibold">{result.stats.digStrength.toFixed(1)}</td>
                          <td className={`text-right font-semibold ${result.stats.digStrength > currentStats.digStrength ? 'text-green-400' : result.stats.digStrength < currentStats.digStrength ? 'text-red-400' : ''}`}>
                            {result.stats.digStrength > currentStats.digStrength ? '+' : ''}{(result.stats.digStrength - currentStats.digStrength).toFixed(1)}
                          </td>
                        </tr>
                        <tr className="border-b border-green-500/20">
                          <td className="py-2">{t('digSpeed' as any) || 'Dig Speed'}</td>
                          <td className="text-right">{currentStats.digSpeed.toFixed(1)}%</td>
                          <td className="text-right font-semibold">{result.stats.digSpeed.toFixed(1)}%</td>
                          <td className={`text-right font-semibold ${result.stats.digSpeed > currentStats.digSpeed ? 'text-green-400' : result.stats.digSpeed < currentStats.digSpeed ? 'text-red-400' : ''}`}>
                            {result.stats.digSpeed > currentStats.digSpeed ? '+' : ''}{(result.stats.digSpeed - currentStats.digSpeed).toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2">{t('shakeSpeed' as any) || 'Shake Speed'}</td>
                          <td className="text-right">{currentStats.shakeSpeed.toFixed(1)}%</td>
                          <td className="text-right font-semibold">{result.stats.shakeSpeed.toFixed(1)}%</td>
                          <td className={`text-right font-semibold ${result.stats.shakeSpeed > currentStats.shakeSpeed ? 'text-green-400' : result.stats.shakeSpeed < currentStats.shakeSpeed ? 'text-red-400' : ''}`}>
                            {result.stats.shakeSpeed > currentStats.shakeSpeed ? '+' : ''}{(result.stats.shakeSpeed - currentStats.shakeSpeed).toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleApply} className="flex-1">
                      {t('applyChanges' as any) || 'Apply Changes'}
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      {t('reset' as any) || 'Reset'}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Equipment Slots Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('equipmentSlots' as any) || 'Equipment Slots'}</CardTitle>
              <CardDescription>{t('equipmentSlotsDesc' as any) || 'Configure which equipment slots to optimize'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('numberOfRings' as any) || 'Number of Rings'}: {maxRings}</Label>
                <Slider
                  value={[maxRings]}
                  onValueChange={([val]) => {
                    setMaxRings(val);
                    setMinRings(Math.min(minRings, val));
                  }}
                  min={0}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-necklace"
                    checked={includeNecklace}
                    onCheckedChange={(checked) => setIncludeNecklace(checked as boolean)}
                  />
                  <Label htmlFor="include-necklace" className="cursor-pointer">
                    {t('includeNecklace' as any) || 'Include Necklace'}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charm"
                    checked={includeCharm}
                    onCheckedChange={(checked) => setIncludeCharm(checked as boolean)}
                  />
                  <Label htmlFor="include-charm" className="cursor-pointer">
                    {t('includeCharm' as any) || 'Include Charm'}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-shovel"
                    checked={includeShovel}
                    onCheckedChange={(checked) => setIncludeShovel(checked as boolean)}
                  />
                  <Label htmlFor="include-shovel" className="cursor-pointer">
                    {t('includeShovel' as any) || 'Include Shovel'}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-pan"
                    checked={includePan}
                    onCheckedChange={(checked) => setIncludePan(checked as boolean)}
                  />
                  <Label htmlFor="include-pan" className="cursor-pointer">
                    {t('includePan' as any) || 'Include Pan'}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-enchant"
                    checked={includeEnchant}
                    onCheckedChange={(checked) => setIncludeEnchant(checked as boolean)}
                  />
                  <Label htmlFor="include-enchant" className="cursor-pointer">
                    {t('includeEnchant' as any) || 'Include Enchant'}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Locked Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock size={18} />
                {t('lockedItems' as any) || 'Locked Items'}
              </CardTitle>
              <CardDescription>{t('lockedItemsDesc' as any) || 'Force specific items to be selected'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shovel */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t('shovel' as any) || 'Shovel'}</Label>
                  <Select
                    value={lockedShovel || 'none'}
                    onValueChange={(val) => setLockedShovel(val === 'none' ? null : val)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <LockOpen size={14} className="inline mr-1" />
                        None
                      </SelectItem>
                      {shovels.map((item) => (
                        <SelectItem key={item.name} value={item.name} className="text-xs">
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {/* Pan */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">{t('pan' as any) || 'Pan'}</Label>
                    <Select
                      value={lockedPan || 'none'}
                      onValueChange={(val) => setLockedPan(val === 'none' ? null : val)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <LockOpen size={14} className="inline mr-1" />
                          None
                        </SelectItem>
                        {pans.map((item) => (
                          <SelectItem key={item.name} value={item.name} className="text-xs">
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Enchant */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">{t('enchant' as any) || 'Enchant'}</Label>
                    <Select
                      value={lockedEnchant || 'none'}
                      onValueChange={(val) => setLockedEnchant(val === 'none' ? null : val)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <LockOpen size={14} className="inline mr-1" />
                          None
                        </SelectItem>
                        {enchants.map((item) => (
                          <SelectItem key={item.name} value={item.name} className="text-xs">
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Rings */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">{t('rings' as any) || 'Rings'}</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                    <Select
                      key={idx}
                      value={lockedRings[idx] || 'none'}
                      onValueChange={(val) => updateLockedRing(idx, val)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder={`Ring ${idx + 1}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <LockOpen size={14} className="inline mr-1" />
                          None
                        </SelectItem>
                        {rings.map((ring) => (
                          <SelectItem key={ring.name} value={ring.name} className="text-xs">
                            {ring.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Necklace */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t('necklace' as any) || 'Necklace'}</Label>
                  <Select
                    value={lockedNecklace || 'none'}
                    onValueChange={(val) => setLockedNecklace(val === 'none' ? null : val)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <LockOpen size={14} className="inline mr-1" />
                        None
                      </SelectItem>
                      {necklaces.map((item) => (
                        <SelectItem key={item.name} value={item.name} className="text-xs">
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Charm */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t('charm' as any) || 'Charm'}</Label>
                  <Select
                    value={lockedCharm || 'none'}
                    onValueChange={(val) => setLockedCharm(val === 'none' ? null : val)}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <LockOpen size={14} className="inline mr-1" />
                        None
                      </SelectItem>
                      {charms.map((item) => (
                        <SelectItem key={item.name} value={item.name} className="text-xs">
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gear size={18} />
                {t('options' as any) || 'Options'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="optimize-museum"
                  checked={optimizeMuseum}
                  onCheckedChange={(checked) => setOptimizeMuseum(checked as boolean)}
                />
                <Label htmlFor="optimize-museum" className="cursor-pointer">
                  {t('optimizeMuseum' as any) || 'Optimize Museum Layout'}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-six-star"
                  checked={useSixStar}
                  onCheckedChange={(checked) => setUseSixStar(checked as boolean)}
                />
                <Label htmlFor="use-six-star" className="cursor-pointer">
                  {t('useSixStar' as any) || 'Use 6★ Items (when available)'}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserve-potions"
                  checked={preservePotions}
                  onCheckedChange={(checked) => setPreservePotions(checked as boolean)}
                />
                <Label htmlFor="preserve-potions" className="cursor-pointer">
                  {t('preservePotions' as any) || 'Preserve Active Potions'}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserve-events"
                  checked={preserveEvents}
                  onCheckedChange={(checked) => setPreserveEvents(checked as boolean)}
                />
                <Label htmlFor="preserve-events" className="cursor-pointer">
                  {t('preserveEvents' as any) || 'Preserve Active Events'}
                </Label>
              </div>
              
              {/* Rarity Filter */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-semibold">
                  {t('itemRarityFilter' as any) || 'Item Rarity Filter'}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {allRarities.map((rarity) => (
                    <div key={rarity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rarity-${rarity}`}
                        checked={allowedRarities.includes(rarity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAllowedRarities([...allowedRarities, rarity]);
                          } else {
                            setAllowedRarities(allowedRarities.filter(r => r !== rarity));
                          }
                        }}
                      />
                      <Label htmlFor={`rarity-${rarity}`} className="cursor-pointer text-xs">
                        <span className={`rarity-${rarity.toLowerCase()}`}>{rarity}</span>
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllowedRarities(allRarities)}
                    className="text-xs flex-1"
                  >
                    {t('selectAll' as any) || 'Select All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllowedRarities([])}
                    className="text-xs flex-1"
                  >
                    {t('deselectAll' as any) || 'Deselect All'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Generate Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Gear size={20} className="animate-spin mr-2" />
                  {t('generating' as any) || 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkle size={20} weight="fill" className="mr-2" />
                  {t('generateOptimal' as any) || 'Generate Optimal Setup'}
                </>
              )}
            </Button>
            
            {!isGenerating && (
              <Button onClick={handleReset} variant="outline" size="lg">
                {t('reset' as any) || 'Reset'}
              </Button>
            )}
          </div>
          
          {/* Warning */}
          <Alert>
            <AlertDescription className="text-xs">
              {t('generatorWarning' as any) || 'A backup of your current setup will be created before applying changes. The optimization process may take a few seconds.'}
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
