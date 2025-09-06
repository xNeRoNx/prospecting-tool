import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { Crafting } from '@/components/Crafting';
import { Museum } from '@/components/Museum';
import { EquipmentSimulation } from '@/components/EquipmentSimulation';
import { CustomCollectibles } from '@/components/CustomCollectibles';
import { useLanguage } from '@/hooks/useLanguage';
import { Hammer, Bank, Calculator, Archive } from '@phosphor-icons/react';

function App() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="crafting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="crafting" className="gap-2">
              <Hammer size={16} />
              <span className="hidden sm:inline">{t('crafting')}</span>
            </TabsTrigger>
            <TabsTrigger value="museum" className="gap-2">
              <Bank size={16} />
              <span className="hidden sm:inline">{t('museum')}</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Calculator size={16} />
              <span className="hidden sm:inline">{t('equipment')}</span>
            </TabsTrigger>
            <TabsTrigger value="collectibles" className="gap-2">
              <Archive size={16} />
              <span className="hidden sm:inline">{t('collectibles')}</span>
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