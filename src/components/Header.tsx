import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Palette } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { DataManagement } from '@/components/DataManagement';
import { SupportDialog } from '@/components/SupportDialog';
import { useAppData } from '@/hooks/useAppData.tsx';
import { useState } from 'react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { currentTheme, setTheme, themes } = useTheme();
  const { isLoading } = useAppData();
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-accent text-center" title="Prospecting Tools">Prospecting Tools</h1>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Select value={currentTheme} onValueChange={setTheme} disabled={isLoading}>
                <SelectTrigger className="w-16 sm:w-34">
                  <SelectValue>
                    <div className="flex items-center justify-center w-full">
                      <Palette size={14} />
                      <span className="hidden sm:inline ml-2">
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

              <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pl')} disabled={isLoading}>
                <SelectTrigger className="w-16 sm:w-32">
                  <SelectValue>
                    <div className="flex items-center justify-center w-full">
                      <span className="text-sm font-medium">
                        {language === 'en' ? '🇺🇸' : '🇵🇱'}
                      </span>
                      <span className="hidden sm:inline ml-2">
                        {language === 'en' ? t('english') : t('polish')}
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
                </SelectContent>
              </Select>

              <DataManagement />

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

      <SupportDialog
        open={showSupport}
        onOpenChange={setShowSupport}
      />
    </>
  );
}