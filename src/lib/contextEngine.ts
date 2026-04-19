import { STORAGE_KEYS } from '../platform/storage/keys';
import { getSafeLocalStorage, readStorageValue, writeStorageValue, removeStorageValue } from '../platform/storage/browserStorage';

export interface ContextUsageEntry {
  id: string;
  count: number;
  lastUsed: number;
}

export interface ScoredContextUsageEntry extends ContextUsageEntry {
  score: number;
  recencyWeight: number;
}

export interface TopContextItems {
  apps: ScoredContextUsageEntry[];
  folders: ScoredContextUsageEntry[];
}

const APPS_STORAGE_KEY = STORAGE_KEYS.contextApps;
const FOLDERS_STORAGE_KEY = STORAGE_KEYS.contextFolders;
const MAX_ENTRIES = 100;
const RECENCY_WINDOW_MS = 1000 * 60 * 60 * 24 * 7;

function isContextUsageEntry(value: unknown): value is ContextUsageEntry {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as ContextUsageEntry).id === 'string' &&
    typeof (value as ContextUsageEntry).count === 'number' &&
    typeof (value as ContextUsageEntry).lastUsed === 'number'
  );
}

function readEntries(storageKey: string): ContextUsageEntry[] {
  const safeLocalStorage = getSafeLocalStorage();
  if (!safeLocalStorage) return [];

  try {
    const raw = readStorageValue(safeLocalStorage, storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isContextUsageEntry).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function writeEntries(storageKey: string, entries: ContextUsageEntry[]) {
  const safeLocalStorage = getSafeLocalStorage();
  if (!safeLocalStorage) return;

  try {
    writeStorageValue(safeLocalStorage, storageKey, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* localStorage quota / privacy mode */
  }
}

function upsertUsage(storageKey: string, id: string) {
  if (!id) return;

  const now = Date.now();
  const existing = readEntries(storageKey);
  const next = existing.filter((entry) => entry.id !== id);
  const previous = existing.find((entry) => entry.id === id);

  next.unshift({
    id,
    count: (previous?.count ?? 0) + 1,
    lastUsed: now,
  });

  writeEntries(storageKey, next);
}

export function recordAppUsage(appId: string) {
  upsertUsage(APPS_STORAGE_KEY, appId);
}

export function recordFolderUsage(folderId: string) {
  upsertUsage(FOLDERS_STORAGE_KEY, folderId);
}

export function getAppUsageEntries(): ContextUsageEntry[] {
  return readEntries(APPS_STORAGE_KEY);
}

export function getFolderUsageEntries(): ContextUsageEntry[] {
  return readEntries(FOLDERS_STORAGE_KEY);
}

export function getRecencyWeight(lastUsed: number, now = Date.now()): number {
  const age = Math.max(0, now - lastUsed);
  const ratio = Math.min(age / RECENCY_WINDOW_MS, 1);
  return 1 - ratio;
}

export function scoreContextEntry(entry: ContextUsageEntry, now = Date.now()): ScoredContextUsageEntry {
  const recencyWeight = getRecencyWeight(entry.lastUsed, now);
  const score = entry.count * 0.7 + recencyWeight * 0.3;

  return {
    ...entry,
    score,
    recencyWeight,
  };
}

function sortEntries(entries: ContextUsageEntry[], limit: number): ScoredContextUsageEntry[] {
  const now = Date.now();

  return entries
    .map((entry) => scoreContextEntry(entry, now))
    .sort((a, b) => b.score - a.score || b.lastUsed - a.lastUsed)
    .slice(0, limit);
}

export function getTopContextItems(limit = 5): TopContextItems {
  return {
    apps: sortEntries(getAppUsageEntries(), limit),
    folders: sortEntries(getFolderUsageEntries(), limit),
  };
}

export function clearContextMemory() {
  const safeLocalStorage = getSafeLocalStorage();
  if (!safeLocalStorage) return;

  try {
    removeStorageValue(safeLocalStorage, APPS_STORAGE_KEY);
    removeStorageValue(safeLocalStorage, FOLDERS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
