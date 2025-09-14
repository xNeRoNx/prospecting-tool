import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Separator } from './components/ui/separator';
import { AlertTriangleIcon, RefreshCwIcon, CopyIcon, ClipboardCheckIcon } from "lucide-react";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) throw error; // dev: allow normal red screen

  const [copied, setCopied] = useState(false);
  const fullInfo = [
    `Message: ${error.message}`,
    error.stack ? `Stack:\n${error.stack}` : '',
    error.digest ? `Digest: ${error.digest}` : ''
  ].filter(Boolean).join('\n\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon />
          <AlertTitle>Application encountered a runtime error</AlertTitle>
          <AlertDescription>
            An unexpected issue occurred while rendering the interface. You can try again, reload the page, or copy details for a bug report.
          </AlertDescription>
        </Alert>

        <div className="bg-card border rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error details</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-48 whitespace-pre-wrap break-all">
            {error.message}
            {error.stack && ('\n\n' + error.stack.split('\n').slice(0, 6).join('\n'))}
          </pre>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button size="sm" variant="outline" onClick={resetErrorBoundary}>
              <RefreshCwIcon className="h-4 w-4" />
              <span className="ml-1">Try Again</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
              <RefreshCwIcon className="h-4 w-4" />
              <span className="ml-1">Reload</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? <ClipboardCheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
              <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            If this keeps happening after reload, please open an issue with the copied details.
          </p>
        </div>
      </div>
    </div>
  );
};
