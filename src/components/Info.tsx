import { useLanguage } from '@/hooks/useLanguage';
import { craftableItems } from '@/lib/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Info() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t('infoTitle')}</h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl whitespace-pre-line">
          {t('infoIntro')}
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoCraftingHeader')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl whitespace-pre-line">{t('infoCraftingDesc')}</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoItemsHeader')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('infoItemsDesc')}</p>
        <ScrollArea className="h-[60vh] border rounded-md p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {craftableItems.map(item => (
              <Card key={item.name} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">{item.name}</CardTitle>
                    <Badge className={`rarity-${item.rarity.toLowerCase()}`} variant="outline">{item.rarity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('position')}: {item.position}</p>
                </CardHeader>
                <CardContent className="pt-2 space-y-2 text-xs">
                  <div>
                    <p className="font-medium mb-1">{t('recipe')}:</p>
                    <ul className="space-y-0.5">
                      {item.recipe.map((r,i) => (
                        <li key={i} className="flex justify-between gap-2">
                          <span className="truncate">{r.material}</span>
                          <span className="text-muted-foreground">x{r.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {item.stats && (
                    <div>
                      <p className="font-medium mb-1">{t('stats')}:</p>
                      <ul className="space-y-0.5">
                        {Object.entries(item.stats).map(([stat, range]) => (
                          <li key={stat} className="flex justify-between gap-2">
                            <span className="truncate">{t(stat as any) || stat}</span>
                            <span className="text-muted-foreground">{range[0]} – {range[1]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">{t('cost')}: {item.cost.toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}
