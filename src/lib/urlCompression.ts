// Advanced data compression for URLs
// Features: key aliasing, removal of empty sections, deflate (pako), base64url (without padding)
// Not compatible with the old lz-string format (completely deprecated)

import { deflate, inflate } from 'pako';

// Alias maps (top-level + metadata)
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

// Remove empty arrays/objects on the top level (non-recursive for simplicity and speed)
function stripEmptyTopLevel(data: any) {
  const out: any = {};
  Object.entries(data).forEach(([k, v]) => {
    if (v == null) return; // skip null/undefined
    if (Array.isArray(v) && v.length === 0) return; // empty array
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return; // empty object
    out[k] = v;
  });
  return out;
}

function packMetadata(meta: any) {
  const m: any = {};
  Object.entries(meta || {}).forEach(([k, v]) => {
    if (k === 'description' && (v === '' || v == null)) return; // remove empty description
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

// Deprecated legacy collectibles alias we intentionally drop when decoding.
// Note: 'cl' was a legacy alias for collectibles, which is no longer present in KEY_MAP.
// We keep it here to skip old data sections for backward compatibility.
const DEPRECATED_COLLECTIBLES_ALIAS = new Set(['cl']);

function unpackData(data: any) {
  const unpacked: any = {};
  Object.entries(data || {}).forEach(([k, v]) => {
    if (DEPRECATED_COLLECTIBLES_ALIAS.has(k)) return; // skip removed sections
    const orig = KEY_MAP_INV[k] || k;
    if (orig === 'metadata') unpacked[orig] = unpackMetadata(v);
    else unpacked[orig] = v;
  });
  return unpacked;
}

// base64url helpers (no padding)
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
  const stripped = stripEmptyTopLevel(fullData);
  const packed = packData(stripped);
  const json = JSON.stringify(packed);
  let deflated: Uint8Array;
  try {
    deflated = deflate(new TextEncoder().encode(json));
  } catch (error) {
    console.error('Compression failed:', error);
    throw new Error('Data compression failed. Please reduce the size or complexity of your export.');
  }
  // 4. base64url
  return bytesToBase64Url(deflated);
}

export function decodeDataFromUrl(hashData: string): any {
  try {
    const bytes = base64UrlToBytes(hashData);
    const inflated = inflate(bytes, { to: 'string' }) as string;
    const raw = JSON.parse(inflated);
    // Use correct constant for deprecated sections (previously caused ReferenceError)
    const aliasKeys = [...Object.values(KEY_MAP), ...Array.from(DEPRECATED_COLLECTIBLES_ALIAS)];
    const hasAlias = Object.keys(raw).some(k => k in KEY_MAP_INV || k in META_KEY_MAP_INV || aliasKeys.includes(k));
    const unpacked = hasAlias ? unpackData(raw) : raw;
    // If old data had collectibles, they will be silently dropped; nothing else to do.
    return unpacked;
  } catch (err) {
    console.error('Failed to decode URL data:', err);
    throw new Error('Invalid or corrupted data payload');
  }
}

export const __debug = { stripEmptyTopLevel, packData, unpackData, packMetadata, unpackMetadata };
