import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Coffee, Star } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';

interface SupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportDialog({ open, onOpenChange }: SupportDialogProps) {
  const { t } = useLanguage();

  const handleSupport = () => {
    window.open('https://buymeacoffee.com/xneronx', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden support-dialog-content">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-6 text-center support-dialog-header">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart 
                size={48} 
                weight="fill" 
                className="text-red-500 animate-pulse"
              />
              <div className="absolute -top-1 -right-1">
                <Star size={16} weight="fill" className="text-yellow-500" />
              </div>
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center">
              {t('supportTitle')}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 support-dialog-body">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Coffee size={32} className="text-amber-600" />
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              {t('supportDescription')}
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm font-medium text-foreground">
                {t('supportThanks')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 support-dialog-buttons">
            <Button 
              onClick={handleSupport}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 support-dialog-button"
              size="lg"
            >
              {t('supportButton')}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full support-dialog-button"
            >
              {t('supportLater')}
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center opacity-30">
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  weight="fill" 
                  className="text-primary animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}