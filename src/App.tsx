import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { Crafting } from '@/components/Crafting';
import { Museum } from '@/components/Museum';
import { EquipmentSimulation } from '@/components/EquipmentSimulation';
import { CustomCollectibles } from '@/components/CustomCollectibles';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { useAppData } from '@/hooks/useAppData.tsx';
import { Hammer, Bank, Calculator, Archive, Spinner } from '@phosphor-icons/react';
import { useEffect } from 'react';

function App() {
  const { language, t } = useLanguage();
  const { currentTheme, setTheme } = useTheme();
  const { isLoading } = useAppData();

  // Apply theme on mount
  useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, [currentTheme, setTheme]);

  useEffect(() => {
    if (language) {
      document.documentElement.lang = language;
    }
  }, [language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="animate-spin" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* <SpeedInsights /> */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="crafting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="crafting" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Hammer size={16} />
              <span className="text-xs sm:text-sm">{t('crafting')}</span>
            </TabsTrigger>
            <TabsTrigger value="museum" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Bank size={16} />
              <span className="text-xs sm:text-sm">{t('museum')}</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Calculator size={16} />
              <span className="text-xs sm:text-sm">{t('equipment')}</span>
            </TabsTrigger>
            <TabsTrigger value="collectibles" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Archive size={16} />
              <span className="text-xs sm:text-sm break-words">{t('collectibles')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="crafting">
            <Crafting />
          </TabsContent>
          
          <TabsContent value="museum">
            <Museum />
          </TabsContent>
          
          <TabsContent value="equipment">
            <EquipmentSimulation />
          </TabsContent>
          
          <TabsContent value="collectibles">
            <CustomCollectibles />
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;