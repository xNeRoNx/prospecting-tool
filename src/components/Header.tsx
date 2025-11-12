import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Palette, Sparkle } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { DataManagement } from '@/components/DataManagement';
import { SupportDialog } from '@/components/SupportDialog';
import { InventoryGenerator } from '@/components/InventoryGenerator';
import { useAppData } from '@/hooks/useAppData.tsx';
import { useState } from 'react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { currentTheme, setTheme, themes } = useTheme();
  const { isLoading } = useAppData();
  const [showSupport, setShowSupport] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-accent text-center" title="Prospecting Tools">Prospecting Tools</h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={currentTheme ?? undefined} onValueChange={(val) => setTheme(val as any)} disabled={isLoading}>
                <SelectTrigger className="w-16 lg:w-34">
                  <SelectValue>
                    <div className="flex items-center justify-center w-full">
                      <Palette size={14} />
                      <span className="hidden lg:inline ml-2">
                        {currentTheme && themes[currentTheme as keyof typeof themes]
                          ? t(themes[currentTheme as keyof typeof themes].nameKey as any)
                          : ''}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(themes).map(([key, theme]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Palette size={14} />
                        <span>{t(theme.nameKey as any)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={language}
                onValueChange={(value) => {
                  const lang = value as 'en' | 'pl' | 'id' | 'pt';
                  setLanguage(lang);
                  if (typeof window !== 'undefined') {
                    const { pathname, search, hash } = window.location;
                    const parts = pathname.split('/').filter(Boolean);
                    const hasLang = parts[0] === 'en' || parts[0] === 'pl' || parts[0] === 'id' || parts[0] === 'pt';
                    if (hasLang) {
                      parts[0] = lang;
                    } else {
                      parts.unshift(lang);
                    }
                    const nextPath = '/' + parts.join('/');
                    window.history.replaceState(null, '', `${nextPath}${search || ''}${hash || ''}`);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20 lg:w-48">
                  <SelectValue>
                    <div className="flex items-center justify-center w-full">
                      <span className="text-sm font-medium">
                        {language === 'en' ? '🇺🇸' : language === 'pl' ? '🇵🇱' : language === 'id' ? '🇮🇩' : '🇧🇷'}
                      </span>
                      <span className="hidden lg:inline ml-2">
                        {language === 'en' ? t('english') : language === 'pl' ? t('polish') : language === 'id' ? t('indonesian') : t('portuguese')}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>🇺🇸</span>
                      <span>{t('english')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pl">
                    <div className="flex items-center gap-2">
                      <span>🇵🇱</span>
                      <span>{t('polish')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="id">
                    <div className="flex items-center gap-2">
                      <span>🇮🇩</span>
                      <span>{t('indonesian')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pt">
                    <div className="flex items-center gap-2">
                      <span>🇧🇷</span>
                      <span>{t('portuguese')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <DataManagement />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerator(true)}
                className="gap-2"
                disabled={isLoading}
              >
                <Sparkle size={16} weight="fill" />
                <span className="hidden md:inline">{t('generator' as any) || 'Generator'}</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSupport(true)}
                className="gap-2 bg-accent hover:bg-accent/90"
                disabled={isLoading}
              >
                <Heart size={16} />
                <span className="hidden sm:inline">{t('supportCreator')}</span>
              </Button>

            </div>
          </div>
        </div>
      </header>

      <InventoryGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
      />

      <SupportDialog
        open={showSupport}
        onOpenChange={setShowSupport}
      />
    </>
  );
}