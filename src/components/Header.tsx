import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, Heart } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppData } from '@/hooks/useAppData';
import { toast } from 'sonner';
import { useRef } from 'react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { exportData, importData } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportData();
      toast.success(t('exportSuccess'));
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importData(data);
        toast.success(t('importSuccess'));
      } catch (error) {
        toast.error(t('importError'));
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSupportCreator = () => {
    window.open('https://github.com/sponsors/xNeRoNx', '_blank');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-accent truncate">
              Prospecting Tools
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-24 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="pl">{t('polish')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download size={16} />
                <span className="hidden md:inline">{t('export')}</span>
              </Button>

              <Button
                variant="outline" 
                size="sm"
                onClick={handleImport}
                className="gap-2"
              >
                <Upload size={16} />
                <span className="hidden md:inline">{t('import')}</span>
              </Button>
            </div>

            {/* Mobile menu for export/import */}
            <div className="sm:hidden flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="p-2"
                title={t('export')}
              >
                <Download size={14} />
              </Button>

              <Button
                variant="outline" 
                size="sm"
                onClick={handleImport}
                className="p-2"
                title={t('import')}
              >
                <Upload size={14} />
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleSupportCreator}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              <Heart size={16} />
              <span className="hidden sm:inline">{t('supportCreator')}</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}