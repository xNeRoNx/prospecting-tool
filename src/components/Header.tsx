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
    window.open('https://github.com/sponsors', '_blank');
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-accent">
              Prospecting Tools
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="pl">{t('polish')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download size={16} />
              {t('export')}
            </Button>

            <Button
              variant="outline" 
              size="sm"
              onClick={handleImport}
              className="gap-2"
            >
              <Upload size={16} />
              {t('import')}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSupportCreator}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              <Heart size={16} />
              {t('supportCreator')}
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