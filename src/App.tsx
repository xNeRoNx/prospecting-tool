import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { Crafting } from '@/components/Crafting';
import { Museum } from '@/components/Museum';
import { EquipmentSimulation } from '@/components/EquipmentSimulation';
import { CustomCollectibles } from '@/components/CustomCollectibles';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import { Hammer, Bank, Calculator, Archive, Spinner } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

function App() {
  const { language, t } = useLanguage();
  const { isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<string>('crafting');

  useEffect(() => {
    if (language) {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Update canonical and hreflang alternates based on /en /pl
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = 'https://prospecting-tool.vercel.app';
    const path = window.location.pathname.replace(/^\/(en|pl)/, '').replace(/\/+/g, '/');
    const canonicalUrl = `${base}/${language}${path}${window.location.search}${window.location.hash}`.replace(/(?<!:)\/\/+/, '/');

    const ensureLink = (rel: string, hreflang?: string) => {
      let el = document.querySelector(`link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ':not([hreflang])'}`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        if (hreflang) el.setAttribute('hreflang', hreflang);
        document.head.appendChild(el);
      }
      return el;
    };

    // canonical
    const canonical = ensureLink('canonical');
    canonical.setAttribute('href', canonicalUrl);

    // hreflang alternates
    const altEn = ensureLink('alternate', 'en');
    altEn.setAttribute('href', `${base}/en${path}`);
    const altPl = ensureLink('alternate', 'pl');
    altPl.setAttribute('href', `${base}/pl${path}`);
    const altDef = ensureLink('alternate', 'x-default');
    altDef.setAttribute('href', `${base}/en${path}`);
  }, [language]);

  // Dynamic document title per zakładka (SEO + UX)
  useEffect(() => {
    const titleMap: Record<string, string> = {
      crafting: t('crafting'),
      museum: t('museum'),
      equipment: t('equipment'),
      collectibles: t('collectibles')
    };
    const descMap: Record<string, string> = {
      crafting: t('seoDescCrafting'),
      museum: t('seoDescMuseum'),
      equipment: t('seoDescEquipment'),
      collectibles: t('seoDescCollectibles')
    };
    const section = titleMap[activeTab];
    document.title = section ? `${section} | Prospecting! Tools` : 'Prospecting! Tools';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', descMap[activeTab] || t('seoDescDefault'));
    }
  }, [activeTab, t]);

  // Inicjalizacja zakładki z hasha oraz nasłuch zmiany hasha (#crafting, #museum, ...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const validTabs = ['crafting', 'museum', 'equipment', 'collectibles'];
    const init = () => {
      const fromHash = window.location.hash.replace('#', '');
      if (validTabs.includes(fromHash)) {
        setActiveTab(fromHash);
      }
    };
    init();
    const onHash = () => init();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="animate-spin" />
          <p className="text-muted-foreground">{t('loadingData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SpeedInsights />
      <Analytics />
      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          defaultValue="crafting"
          onValueChange={(val) => {
            setActiveTab(val);
            // aktualizuj hash i przewiń do sekcji
            const nextUrl = `${window.location.pathname}#${val}`;
            window.history.replaceState(null, '', nextUrl);
            const el = document.getElementById(val);
            if (el) {
              try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { /* ignore */ }
            }
          }}
          className="space-y-6"
        >
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
          
          <TabsContent value="crafting" id="crafting">
            <Crafting />
          </TabsContent>
          
          <TabsContent value="museum" id="museum">
            <Museum />
          </TabsContent>
          
          <TabsContent value="equipment" id="equipment">
            <EquipmentSimulation />
          </TabsContent>
          
          <TabsContent value="collectibles" id="collectibles">
            <CustomCollectibles />
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;