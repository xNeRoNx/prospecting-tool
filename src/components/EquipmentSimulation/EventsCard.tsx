import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/useLanguage';
import { events } from '@/lib/gameData';

interface EventsCardProps {
  activeEvents: string[];
  onToggleEvent: (eventName: string) => void;
  isLoading: boolean;
}

export function EventsCard({ activeEvents, onToggleEvent, isLoading }: EventsCardProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          {t('activeEvents')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map(event => (
            <div key={event.name} className="flex items-center space-x-2">
              <Checkbox
                id={event.name}
                checked={activeEvents.includes(event.name)}
                onCheckedChange={() => onToggleEvent(event.name)}
                disabled={isLoading}
              />
              <Label htmlFor={event.name} className="text-sm">
                {event.name}
              </Label>
            </div>
          ))}
        </div>
        {activeEvents.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">{t('events')}:</p>
            <div className="space-y-1">
              {activeEvents.map(eventName => {
                const event = events.find(e => e.name === eventName);
                if (!event) return null;
                
                return (
                  <div key={eventName} className="text-xs">
                    <span className="font-medium">{t(eventName.toLowerCase().replace(/\s+/g, '') as any) || eventName}:</span>
                    <span className="ml-1">
                      {Object.entries(event.effects).map(([stat, mult]) => 
                        `${t(stat as any)} ${mult}x`
                      ).join(', ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
