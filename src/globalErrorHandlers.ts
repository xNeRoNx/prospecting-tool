import { toast } from 'sonner';

// Lightweight rate limiter to avoid toast flood
class RateLimiter {
  private last = 0;
  constructor(private minIntervalMs: number) {}
  allow() {
    const now = Date.now();
    if (now - this.last > this.minIntervalMs) {
      this.last = now;
      return true;
    }
    return false;
  }
}

const errorLimiter = new RateLimiter(1500);

function formatError(e: unknown): string {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  try { return JSON.stringify(e); } catch { return String(e); }
}

export function initGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  const w = window as Window & { __globalErrorHandlersInstalled?: boolean };
  if (w.__globalErrorHandlersInstalled) return; // idempotent
  w.__globalErrorHandlersInstalled = true;

  window.addEventListener('error', (ev) => {
    if (!errorLimiter.allow()) return;
    const msg = formatError(ev.error || ev.message);
    toast.error('Runtime error', { description: msg });
  });

  window.addEventListener('unhandledrejection', (ev) => {
    if (!errorLimiter.allow()) return;
    const reason = formatError(ev.reason);
    toast.error('Unhandled promise', { description: reason });
  });

  window.addEventListener('offline', () => {
    toast('Offline mode', { description: 'You lost network connectivity.' });
  });
  window.addEventListener('online', () => {
    toast.success('Back online', { description: 'Connection restored.' });
  });
}
