import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx'
import { LanguageProvider } from './hooks/useLanguage.tsx'
import { AppDataProvider } from './hooks/useAppData.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <LanguageProvider>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </LanguageProvider>
  </ErrorBoundary>
)
