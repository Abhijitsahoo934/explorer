import type { Folder, App } from '../types/explorer';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';

/** Passed to optional `onRun` for static / AI automations. */
export interface CommandContext {
  navigate: (to: string) => void;
  openUrl: (url: string, newTab?: boolean) => void;
  recordAppOpened: (appId: string) => void;
  touchRecentApp: (appId: string) => void;
  touchRecentFolder: (folderId: string) => void;
  trackAppUsage: (appId: string) => void;
  trackFolderUsage: (folderId: string) => void;
  folders: Folder[];
  apps: App[];
}

export type CommandPaletteItemType = 'folder' | 'app' | 'action' | 'ai';

/** Runtime payload for AI rows and automations (no network in MVP). */
export type CommandPaletteItemMeta = {
  kind: 'open-folder' | 'open-app' | 'noop' | 'open-recent-first';
  folderId?: string;
  appId?: string;
};

/** Normalized row for the command palette. */
export interface CommandPaletteItem {
  id: string;
  type: CommandPaletteItemType;
  name: string;
  description?: string;
  icon?: string;
  url?: string;
  parent_id?: string | null;
  folder_id?: string | null;
  /** Display line under title (breadcrumb, URL host, etc.) */
  subtext: string;
  /** Extra match terms (search / filter). */
  keywords?: string[];
  /** In-app route for `type === 'action'` */
  navigateTo?: string;
  actionType?: 'static' | 'ai';
  onRun?: (context: CommandContext) => void;
  meta?: CommandPaletteItemMeta;
}

const RECENT_FOLDERS_KEY = STORAGE_KEYS.recentFolders;
const RECENT_APPS_KEY = STORAGE_KEYS.recentApps;
const MAX_RECENT = 12;

export interface RecentEntry {
  id: string;
  at: number;
}

function readRecents(key: string): RecentEntry[] {
  try {
    const raw = readStorageValue(localStorage, key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is RecentEntry => !!x && typeof x === 'object' && typeof (x as RecentEntry).id === 'string')
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeRecents(key: string, entries: RecentEntry[]) {
  try {
    writeStorageValue(localStorage, key, JSON.stringify(entries.slice(0, MAX_RECENT)));
  } catch {
    /* ignore quota */
  }
}

export function touchRecentFolder(id: string) {
  const list = readRecents(RECENT_FOLDERS_KEY).filter((e) => e.id !== id);
  list.unshift({ id, at: Date.now() });
  writeRecents(RECENT_FOLDERS_KEY, list);
}

export function touchRecentApp(id: string) {
  const list = readRecents(RECENT_APPS_KEY).filter((e) => e.id !== id);
  list.unshift({ id, at: Date.now() });
  writeRecents(RECENT_APPS_KEY, list);
}

export function getRecentFolderIds(): string[] {
  return readRecents(RECENT_FOLDERS_KEY).map((e) => e.id);
}

export function getRecentAppIds(): string[] {
  return readRecents(RECENT_APPS_KEY).map((e) => e.id);
}

function faviconFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return undefined;
  }
}

function folderByIdMap(folders: Folder[]): Map<string, Folder> {
  return new Map(folders.map((f) => [f.id, f]));
}

/** Full path including this folder: `A / B / C` */
export function folderPathSegments(folderId: string | null, byId: Map<string, Folder>): string {
  if (!folderId) return 'Vault';
  const segments: string[] = [];
  let cur: string | null = folderId;
  const guard = new Set<string>();
  while (cur && !guard.has(cur)) {
    guard.add(cur);
    const f = byId.get(cur);
    if (!f) break;
    segments.unshift(f.name);
    cur = f.parent_id;
  }
  return segments.length ? segments.join(' / ') : 'Vault';
}

export function normalizeCommandItems(folders: Folder[], apps: App[]): CommandPaletteItem[] {
  const byId = folderByIdMap(folders);

  const folderItems: CommandPaletteItem[] = folders.map((f) => ({
    id: f.id,
    type: 'folder',
    name: f.name,
    parent_id: f.parent_id,
    subtext: folderPathSegments(f.id, byId),
  }));

  const appItems: CommandPaletteItem[] = apps.map((a) => {
    const loc = folderPathSegments(a.folder_id, byId);
    const host = (() => {
      try {
        return new URL(a.url).hostname.replace(/^www\./, '');
      } catch {
        return a.url;
      }
    })();
    return {
      id: a.id,
      type: 'app',
      name: a.name,
      description: a.description ?? undefined,
      icon: a.icon ?? faviconFromUrl(a.url),
      url: a.url,
      folder_id: a.folder_id,
      subtext: `${loc} · ${host}`,
    };
  });

  return [...folderItems, ...appItems];
}

/** Substring match score; fuzzy subsequence score if no contiguous match. */
export function scoreMatch(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const idx = t.indexOf(q);
  if (idx >= 0) {
    return 1000 - idx + (q.length / t.length) * 10;
  }
  let ti = 0;
  let score = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return 0;
    score += 50 - Math.min(found, 40);
    ti = found + 1;
  }
  return score;
}

export function filterCommandItems(items: CommandPaletteItem[], query: string): CommandPaletteItem[] {
  const q = query.trim();
  if (!q) return items;

  const scored = items
    .map((item) => {
      const kw = (item.keywords ?? []).join(' ');
      const hay = `${item.name} ${item.subtext} ${item.description ?? ''} ${item.url ?? ''} ${kw}`;
      const s = scoreMatch(hay, q);
      return s > 0 ? { item, score: s } : null;
    })
    .filter((x): x is { item: CommandPaletteItem; score: number } => x !== null);

  scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  const MAX_ROWS = 400;
  return scored.slice(0, MAX_ROWS).map((s) => s.item);
}

export function buildRecentItems(all: CommandPaletteItem[], queryEmpty: boolean): CommandPaletteItem[] {
  if (!queryEmpty) return [];

  const byKey = new Map(all.map((i) => [`${i.type}:${i.id}`, i] as const));

  const ordered: CommandPaletteItem[] = [];
  const seen = new Set<string>();

  for (const id of getRecentFolderIds()) {
    const key = `folder:${id}` as const;
    const item = byKey.get(key);
    if (item && !seen.has(key)) {
      ordered.push(item);
      seen.add(key);
    }
  }
  for (const id of getRecentAppIds()) {
    const key = `app:${id}` as const;
    const item = byKey.get(key);
    if (item && !seen.has(key)) {
      ordered.push(item);
      seen.add(key);
    }
  }

  return ordered.slice(0, 10);
}
