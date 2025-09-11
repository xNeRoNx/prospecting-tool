import { useLanguage } from '@/hooks/useLanguage';
import { craftableItems, ores, modifiers, enchants, pans, shovels } from '@/lib/gameData';
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {craftableItems.map(item => (
              <Card key={item.name} className="flex flex-col">
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
      </section>

      {/* Materials / Ores */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('materialsOresTitle')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('materialsOresDesc')}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {ores.map(ore => {
            const effects = ore.specialEffects ? Object.entries(ore.specialEffects) : [];
            return (
              <Card key={ore.name} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">{ore.name}</CardTitle>
                    <Badge className={`rarity-${ore.rarity.toLowerCase()}`} variant="outline">{ore.rarity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">@ {ore.maxWeight}kg</p>
                </CardHeader>
                <CardContent className="pt-2 space-y-2 text-xs">
                  {!ore.specialEffects && (
                    <div className="flex justify-between gap-2">
                      <span className="truncate">{ore.museumEffect.stat}</span>
                      <span className="text-muted-foreground">+{ore.museumEffect.maxMultiplier}x</span>
                    </div>
                  )}
                  {effects.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">{t('specialEffects')}:</p>
                      <ul className="space-y-0.5">
                        {effects.map(([stat, val]) => (
                          <li key={stat} className="flex justify-between gap-2">
                            <span className="truncate">{stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
                            <span className="text-muted-foreground">{val > 0 ? '+' : ''}{val}x</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Modifiers */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('modifiersTitle')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('modifiersDesc')}</p>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {modifiers.map(m => (
            <Card key={m.name} className="flex flex-col">
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-semibold leading-tight">{m.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                {m.effect}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enchants */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('enchantsTitle')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('enchantsDesc')}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {enchants.map(enchant => (
            <Card key={enchant.name} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold leading-tight">{enchant.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-1">
                {Object.entries(enchant.effects).map(([stat, val]) => (
                  <div key={stat} className="flex justify-between gap-2">
                    <span className="truncate">{stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
                    <span className="text-muted-foreground">{val > 0 ? '+' : ''}{val}{/Speed|Boost/i.test(stat) ? '%' : ''}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pans */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('pansTitle')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('pansDesc')}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {pans.map(p => (
            <Card key={p.name} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">{p.name}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">${p.price.toLocaleString()}</p>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-1">
                {Object.entries(p.stats).map(([stat,val]) => (
                  <div key={stat} className="flex justify-between gap-2">
                    <span className="truncate">{stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
                    <span className="text-muted-foreground">{val}</span>
                  </div>
                ))}
                {p.passive && (
                  <div className="text-[10px] text-accent pt-1 border-t border-muted">{p.passive}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Shovels */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('shovelsTitle')}</h3>
        <p className="text-sm text-muted-foreground max-w-3xl">{t('shovelsDesc')}</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shovels.map(s => (
            <Card key={s.name} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">{s.name}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">${s.price.toLocaleString()}</p>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-1">
                {Object.entries(s.stats).map(([stat,val]) => (
                  <div key={stat} className="flex justify-between gap-2">
                    <span className="truncate">{stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
                    <span className="text-muted-foreground">{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
