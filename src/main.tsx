import { createRoot } from 'react-dom/client'
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
  });
}
