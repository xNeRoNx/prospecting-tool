// Zaawansowana kompresja danych do URL
// Funkcje: aliasowanie kluczy, usuwanie pustych sekcji, deflate (pako), base64url (bez paddingu)
// Brak kompatybilności ze starym formatem lz-string (całkowicie wycofany)

import { deflate, inflate } from 'pako';

// Mapy aliasów (top-level + metadata)
const KEY_MAP: Record<string, string> = {
  metadata: 'm',
  craftingItems: 'c',
  museumSlots: 'ms',
  equipment: 'e',
  ownedMaterials: 'om'
};

const META_KEY_MAP: Record<string, string> = {
  name: 'n',
  description: 'd',
  createdAt: 'ca',
  version: 'v'
};

const invert = (obj: Record<string, string>) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
const KEY_MAP_INV = invert(KEY_MAP);
const META_KEY_MAP_INV = invert(META_KEY_MAP);

// Usuwa puste tablice / obiekty z najwyższego poziomu (nie wchodzi rekurencyjnie dla prostoty i szybkości)
function stripEmptyTopLevel(data: any) {
  const out: any = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v == null) return; // pomijamy null/undefined
    if (Array.isArray(v) && v.length === 0) return; // pusta tablica
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return; // pusty obiekt
    out[k] = v;
  });
  return out;
}

function packMetadata(meta: any) {
  const m: any = {};
  Object.entries(meta || {}).forEach(([k, v]) => {
    if (k === 'description' && (v === '' || v == null)) return; // usuń pusty opis
    const alias = META_KEY_MAP[k];
    m[alias || k] = v;
  });
  return m;
}

function unpackMetadata(meta: any) {
  const m: any = {};
  Object.entries(meta || {}).forEach(([k, v]) => {
    const orig = META_KEY_MAP_INV[k] || k;
    m[orig] = v;
  });
  return m;
}

function packData(data: any) {
  const packed: any = {};
  Object.entries(data).forEach(([k, v]) => {
    if (k === 'metadata') packed[KEY_MAP[k]] = packMetadata(v);
    else packed[KEY_MAP[k] || k] = v;
  });
  return packed;
}

// Deprecated legacy keys we intentionally drop when decoding (e.g. removed feature: collectibles 'cl')
const DEPRECATED_ALIASES = new Set(['cl']);

function unpackData(data: any) {
  const unpacked: any = {};
  Object.entries(data || {}).forEach(([k, v]) => {
    if (DEPRECATED_ALIASES.has(k)) return; // skip removed sections
    const orig = KEY_MAP_INV[k] || k;
    if (orig === 'metadata') unpacked[orig] = unpackMetadata(v);
    else unpacked[orig] = v;
  });
  return unpacked;
}

// base64url helpers (bez paddingu)
function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(str: string) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Public API
export function encodeDataForUrl(fullData: any): string {
  // 1. usuń puste sekcje
  const stripped = stripEmptyTopLevel(fullData);
  // 2. spakuj aliasy
  const packed = packData(stripped);
  // 3. JSON -> deflate
  const json = JSON.stringify(packed);
  const deflated = deflate(new TextEncoder().encode(json));
  // 4. base64url
  return bytesToBase64Url(deflated);
}

export function decodeDataFromUrl(hashData: string): any {
  const bytes = base64UrlToBytes(hashData);
  const inflated = inflate(bytes, { to: 'string' }) as string;
  const raw = JSON.parse(inflated);
  const hasAlias = Object.keys(raw).some(k => k in KEY_MAP_INV || k in META_KEY_MAP_INV || ['m','c','ms','e','om','cl'].includes(k));
  const unpacked = hasAlias ? unpackData(raw) : raw;
  // If old data had collectibles, they will be silently dropped; nothing else to do.
  return unpacked;
}

// Dodatkowe pomocnicze (opcjonalnie export jeśli kiedykolwiek potrzebne)
export const __debug = { stripEmptyTopLevel, packData, unpackData, packMetadata, unpackMetadata };
