import { createRoot } from 'react-dom/client'
import { toast } from 'sonner';
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { LanguageProvider, LanguageUrlSync } from './hooks/useLanguage.tsx'
import { ThemeProvider } from './hooks/useTheme.tsx'
import { AppDataProvider } from './hooks/useAppData.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <LanguageProvider>
      <LanguageUrlSync />
      <ThemeProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </ThemeProvider>
    </LanguageProvider>
  </ErrorBoundary>
)

// Register a lightweight service worker to cache locale manifests & core assets
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* silent */ });

    // Gdy nowy SW przejmie kontrolę (po skipWaiting/activate) pokażemy toast
    // Zapobieganie duplikatom poprzez globalny identyfikator
    interface UpdateToastWindow extends Window { __updateToastId?: string | number }
    const w = window as UpdateToastWindow;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (w.__updateToastId) return; // toast już istnieje
      const id = toast.custom((tId) => {
        return (
          <div className="rounded-md border bg-background p-3 shadow-lg max-w-sm flex flex-col gap-2">
            <strong className="text-sm">New version available</strong>
            <p className="text-xs text-muted-foreground">A new version is ready. Reload to apply the update.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(tId);
                  if (w.__updateToastId === tId) delete w.__updateToastId;
                }}
                className="text-xs px-2 py-1 border rounded hover:bg-accent"
              >Later</button>
              <button
                onClick={() => {
                  toast.dismiss(tId);
                  // reload natychmiast – service worker już przejął kontrolę
                  if (w.__updateToastId === tId) delete w.__updateToastId;
                  window.location.reload();
                }}
                className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90"
              >Reload</button>
            </div>
          </div>
        );
      }, { duration: Infinity });
      w.__updateToastId = id;
    });
  });
}
