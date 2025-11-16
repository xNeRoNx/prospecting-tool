import { useLanguage } from '@/hooks/useLanguage';
import { craftableItems, ores, modifiers, enchants, pans, shovels } from '@/lib/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Info() {
  const { t } = useLanguage();
  const LAST_UPDATE = '16.11.2025';

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">{t('infoTitle')}</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line border-l-2 border-primary/40 pl-4">
          {t('infoIntro')}
        </p>
        <p className="text-sm text-muted-foreground italic">
          {t('infoLastUpdate')}: {LAST_UPDATE}
        </p>
      </section>

      {/* Author Note */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoAuthorNoteTitle')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoAuthorNoteDesc')}</p>
      </section>

      {/* PWA Install */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('pwaInstallTitle')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('pwaInstallDesc')}</p>
      </section>

      {/* Header */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoHeaderTitle')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoHeaderDesc')}</p>
      </section>

      {/* Data Management */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoDataManagementTitle')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoDataManagementDesc')}</p>
      </section>

      {/* Crafting */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoCraftingHeader')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoCraftingDesc')}</p>
      </section>

      {/* Museum */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoMuseumTitle')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoMuseumDesc')}</p>
      </section>

      {/* Equipment Simulation */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoEquipmentTitle')}</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoEquipmentDesc')}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{t('infoEquipmentStarsTitle')}</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line border-l-2 border-primary/40 pl-4">{t('infoEquipmentStarsDesc')}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('infoItemsHeader')}</h3>
        <p className="text-sm text-muted-foreground">{t('infoItemsDesc')} {t('statsInfo')}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {craftableItems.map(item => (
              <Card key={item.name} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">{item.name}</CardTitle>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`rarity-${item.rarity.toLowerCase()}`} variant="outline">{item.rarity}</Badge>
                      {item.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                    </div>
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
                        {(() => {
                          const base: Record<string, any> = (item as any).stats || {};
                          const ext: Record<string, any> = (item as any).sixStarStats || {};
                          const keys = Array.from(new Set([...Object.keys(base), ...Object.keys(ext)]));
                          return keys.map(stat => {
                            const baseVal = base[stat];
                            const extVal = ext[stat];
                            if (!Array.isArray(baseVal) && !Array.isArray(extVal)) return null;
                            const lower = stat.toLowerCase();
                            const suffix = (lower.includes('speed') || lower.includes('boost')) ? '%' : '';
                            let text = '';
                            if (Array.isArray(baseVal) && Array.isArray(extVal)) {
                              const [bMin, bMax] = baseVal;
                              const [eMin, eMax] = extVal;
                              text = `${bMin}${suffix} - ${bMax}${suffix} [${eMin}${suffix} - ${eMax}${suffix}]`;
                            } else if (Array.isArray(baseVal)) {
                              const [bMin, bMax] = baseVal;
                              text = `${bMin}${suffix} - ${bMax}${suffix}`;
                            }
                            return (
                              <li key={stat} className="flex justify-between gap-2">
                                <span className="truncate">{t(stat as any) || stat}</span>
                                <span className="text-muted-foreground">{text}</span>
                              </li>
                            );
                          });
                        })()}
                      </ul>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {t('cost')}: {item.candy ? `${item.cost} Candy` : `$${item.cost.toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      </section>

      {/* Materials / Ores */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold">{t('materialsOresTitle')}</h3>
        <p className="text-sm text-muted-foreground">{t('materialsOresDesc')}</p>
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
                    <span className="truncate">{t(stat as any) || stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
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
                  {p.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.candy ? `${p.price} Candy` : `$${p.price.toLocaleString()}`}
                </p>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-1">
                {Object.entries(p.stats).map(([stat,val]) => (
                  <div key={stat} className="flex justify-between gap-2">
                    <span className="truncate">{t(stat as any) || stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
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
                  {s.event && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Event</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.candy ? `${s.price} Candy` : `$${s.price.toLocaleString()}`}
                </p>
              </CardHeader>
              <CardContent className="pt-2 text-xs space-y-1">
                {Object.entries(s.stats).map(([stat,val]) => (
                  <div key={stat} className="flex justify-between gap-2">
                    <span className="truncate">{t(stat as any) || stat.replace(/([A-Z])/g,' $1').toLowerCase()}</span>
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