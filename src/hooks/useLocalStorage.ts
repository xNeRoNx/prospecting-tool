import { useState, useCallback } from 'react';

/**
 * Prosty zamiennik dla useKV wykorzystujący localStorage.
 * Przechowuje JSON pod kluczem i zwraca wartość (lub null jeśli brak / błąd odczytu).
 */
export function useLocalStorageState<T>(key: string, initial: T | null): [T | null, (value: T | ((prev: T | null) => T | null)) => void] {
  const [value, setValue] = useState<T | null>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  const setAndStore = useCallback((next: T | ((prev: T | null) => T | null)) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? (next as (p: T | null) => T | null)(prev) : next;
      try {
        if (resolved === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        }
      } catch {
        // ignorujemy błędy zapisu (quota / private mode)
      }
      return resolved;
    });
  }, [key]);

  return [value, setAndStore];
}
