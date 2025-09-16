import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { Crafting } from '@/components/Crafting';
import { Museum } from '@/components/Museum';
import { EquipmentSimulation } from '@/components/EquipmentSimulation';
import { Info } from '@/components/Info';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData.tsx';
import { Hammer, Bank, Calculator, Info as InfoIcon, Spinner } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

enum TabsEnum {
  Crafting = 'crafting',
  Museum = 'museum',
  Equipment = 'equipment',
  Info = 'info'
}

function App() {
  const { language, t } = useLanguage();
  const { isLoading } = useAppData();
  const [activeTab, setActiveTab] = useState<TabsEnum>(TabsEnum.Crafting);

  // Update canonical and hreflang alternates based on language
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = 'https://prospecting-tool.vercel.app';
    const path = window.location.pathname.replace(/^\/(en|pl|id|pt)/, '').replace(/\/+/g, '/');
    const canonicalUrl = `${base}/${language}${path}${window.location.search}`.replace(/(?<!:)\/\/+/, '/');
    document.documentElement.lang = language;

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
    const altId = ensureLink('alternate', 'id');
    altId.setAttribute('href', `${base}/id${path}`);
    const altPt = ensureLink('alternate', 'pt');
    altPt.setAttribute('href', `${base}/pt${path}`);
    const altDef = ensureLink('alternate', 'x-default');
    altDef.setAttribute('href', `${base}/en${path}`);

    // Dynamic manifest swapping per locale (fallback to base English manifest)
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (manifestLink) {
      const manifestMap: Record<string, string> = {
        en: '/manifest.webmanifest', // base English file
        pl: '/manifest-pl.webmanifest',
        id: '/manifest-id.webmanifest',
        pt: '/manifest-pt.webmanifest'
      };
      const desired = manifestMap[language] || manifestMap.en;
      // Only update if actually different to avoid refetch spam
      if (!manifestLink.getAttribute('href') || manifestLink.getAttribute('href') !== desired) {
        manifestLink.setAttribute('href', desired);
      }
    }
  }, [language]);

  // Dynamic document title per zakładka (SEO + UX)
  useEffect(() => {
    const titleMap: Record<string, string> = {
      crafting: t('crafting'),
      museum: t('museum'),
      equipment: t('equipment'),
      info: t('infoTab')
    };
    const descMap: Record<string, string> = {
      crafting: t('seoDescCrafting'),
      museum: t('seoDescMuseum'),
      equipment: t('seoDescEquipment'),
      info: t('seoDescInfo')
    };
    const section = titleMap[activeTab];
    document.title = section ? `${section} | Prospecting! Tools` : 'Prospecting! Tools';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', descMap[activeTab] || t('seoDescDefault'));
    }
  }, [activeTab, t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const validTabs = Object.values(TabsEnum) as string[];
    const init = () => {
      const fromHash = window.location.hash.replace('#', '');
      if (validTabs.includes(fromHash)) {
        setActiveTab(fromHash as TabsEnum);
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
          defaultValue={TabsEnum.Crafting}
          onValueChange={(val: string) => {
            if (Object.values(TabsEnum).includes(val as TabsEnum)) {
              setActiveTab(val as TabsEnum);
              // aktualizuj hash i przewiń do sekcji
              const nextUrl = `${window.location.pathname}#${val}`;
              window.history.replaceState(null, '', nextUrl);
              const el = document.getElementById(val);
              if (el) {
                try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { /* ignore */ }
              }
            }
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value={TabsEnum.Crafting} className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Hammer size={16} />
              <span className="text-xs sm:text-sm">{t('crafting')}</span>
            </TabsTrigger>
            <TabsTrigger value={TabsEnum.Museum} className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Bank size={16} />
              <span className="text-xs sm:text-sm">{t('museum')}</span>
            </TabsTrigger>
            <TabsTrigger value={TabsEnum.Equipment} className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <Calculator size={16} />
              <span className="text-xs sm:text-sm">{t('equipment')}</span>
            </TabsTrigger>
            <TabsTrigger value={TabsEnum.Info} className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2">
              <InfoIcon size={16} />
              <span className="text-xs sm:text-sm">{t('infoTab')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={TabsEnum.Crafting} id="crafting">
            <Crafting />
          </TabsContent>
          
          <TabsContent value={TabsEnum.Museum} id="museum">
            <Museum />
          </TabsContent>
          
          <TabsContent value={TabsEnum.Equipment} id="equipment">
            <EquipmentSimulation />
          </TabsContent>
          
          <TabsContent value={TabsEnum.Info} id="info">
            <Info />
          </TabsContent>
        </Tabs>
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;