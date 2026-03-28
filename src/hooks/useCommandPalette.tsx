import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useContextMemory } from './useContextMemory';
import { explorerService } from '../lib/explorerService';
import type { Folder, App } from '../types/explorer';
import {
  type CommandPaletteItem,
  type CommandContext,
  normalizeCommandItems,
  filterCommandItems,
  buildRecentItems,
  touchRecentFolder,
  touchRecentApp,
  getRecentAppIds,
} from '../lib/commandPaletteUtils';
import { normalizeQuickActions } from '../lib/workspaceQuickActions';
import { generateAIActions } from '../lib/aiActionEngine';
import { buildWorkflowMacros } from '../lib/workflowMacros';
import { CommandPalette } from '../components/command/CommandPalette';

export interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

const noop: CommandPaletteContextValue = {
  open: () => {},
  close: () => {},
  toggle: () => {},
  isOpen: false,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useCommandPalette(): CommandPaletteContextValue {
  return useContext(CommandPaletteContext) ?? noop;
}

const DEBOUNCE_MS = 150;
/** Cap rendered rows for smooth scrolling with large workspaces */
const MAX_DISPLAY_ROWS = 500;

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { trackAppUsage, trackFolderUsage, readTopContext } = useContextMemory();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const open = useCallback(() => {
    if (!session) return;
    setIsOpen(true);
  }, [session]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setDebouncedQuery('');
    setSelectedIndex(0);
  }, []);

  const toggle = useCallback(() => {
    if (!session) return;
    setIsOpen((o) => !o);
  }, [session]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!isOpen || !session) return;

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const [f, a] = await Promise.all([explorerService.getFolders(), explorerService.getAllApps()]);
        if (!cancelled) {
          setFolders(f);
          setApps(a);
        }
      } catch (e) {
        console.error('Command palette load failed:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, session]);

  const quickActions = useMemo(() => normalizeQuickActions(), []);

  const workspaceItems = useMemo(() => normalizeCommandItems(folders, apps), [folders, apps]);

  const recentAppsResolved = useMemo(() => {
    const ids = getRecentAppIds();
    const byId = new Map(apps.map((a) => [a.id, a]));
    return ids.map((id) => byId.get(id)).filter((x): x is App => !!x).slice(0, 8);
  }, [apps]);

  const topContext = useMemo(() => readTopContext(6), [readTopContext]);

  const contextSuggestions = useMemo<CommandPaletteItem[]>(() => {
    const topFolders: CommandPaletteItem[] = [];
    for (const entry of topContext.folders) {
      const folder = folders.find((item) => item.id === entry.id);
      if (!folder) continue;

      topFolders.push({
          id: `context-folder-${folder.id}`,
          type: 'ai' as const,
          name: `Open ${folder.name}`,
          description: 'Most used workspace from your context memory',
          subtext: `${Math.max(1, entry.count)} visits · context memory`,
          keywords: ['context', 'memory', 'workspace', folder.name.toLowerCase()],
          actionType: 'ai' as const,
          meta: { kind: 'open-folder' as const, folderId: folder.id },
        });
      if (topFolders.length >= 2) break;
    }

    const topApps: CommandPaletteItem[] = [];
    for (const entry of topContext.apps) {
      const app = apps.find((item) => item.id === entry.id);
      if (!app) continue;

      topApps.push({
          id: `context-app-${app.id}`,
          type: 'ai' as const,
          name: `Resume ${app.name}`,
          description: 'Frequently used app from your context memory',
          subtext: `${Math.max(1, entry.count)} opens · workflow memory`,
          icon: app.icon ?? undefined,
          url: app.url,
          keywords: ['context', 'memory', 'resume', app.name.toLowerCase()],
          actionType: 'ai' as const,
          meta: { kind: 'open-app' as const, appId: app.id },
        });
      if (topApps.length >= 3) break;
    }

    return [...topFolders, ...topApps];
  }, [apps, folders, topContext]);

  const aiActions = useMemo(
    () => generateAIActions(debouncedQuery, folders, apps, recentAppsResolved, topContext),
    [debouncedQuery, folders, apps, recentAppsResolved, topContext]
  );
  const workflowMacros = useMemo(
    () => buildWorkflowMacros(folders, apps, recentAppsResolved, topContext),
    [folders, apps, recentAppsResolved, topContext]
  );

  const mergedForSearch = useMemo(
    () => [...quickActions, ...workflowMacros, ...aiActions, ...workspaceItems],
    [quickActions, workflowMacros, aiActions, workspaceItems]
  );

  const filtered = useMemo(
    () => filterCommandItems(mergedForSearch, debouncedQuery),
    [mergedForSearch, debouncedQuery]
  );

  const recentOnly = useMemo(
    () => buildRecentItems(workspaceItems, debouncedQuery.trim().length === 0),
    [workspaceItems, debouncedQuery]
  );

  const hasActiveFilter = debouncedQuery.trim().length > 0;
  const quickActionCount = hasActiveFilter ? 0 : quickActions.length;
  const macroCutoff = hasActiveFilter ? 0 : workflowMacros.length;
  const contextCutoff = hasActiveFilter ? 0 : contextSuggestions.length;

  const displayRows = useMemo(() => {
    const q = debouncedQuery.trim();
    if (q.length > 0) return filtered.slice(0, MAX_DISPLAY_ROWS);

    const contextNames = new Set(contextSuggestions.map((item) => item.name.toLowerCase()));
    const macroNames = new Set(workflowMacros.map((item) => item.name.toLowerCase()));

    if (recentOnly.length > 0) {
      const recentSet = new Set(recentOnly.map((i) => `${i.type}:${i.id}`));
      const rest = workspaceItems.filter(
        (i) =>
          !recentSet.has(`${i.type}:${i.id}`) &&
          !contextNames.has(i.name.toLowerCase()) &&
          !macroNames.has(i.name.toLowerCase())
      );
      return [...quickActions, ...workflowMacros, ...contextSuggestions, ...recentOnly, ...rest].slice(0, MAX_DISPLAY_ROWS);
    }

    const rest = workspaceItems.filter(
      (i) => !contextNames.has(i.name.toLowerCase()) && !macroNames.has(i.name.toLowerCase())
    );
    return [...quickActions, ...workflowMacros, ...contextSuggestions, ...rest].slice(0, MAX_DISPLAY_ROWS);
  }, [contextSuggestions, debouncedQuery, filtered, quickActions, recentOnly, workflowMacros, workspaceItems]);

  const executeItem = useCallback(
    (item: CommandPaletteItem) => {
      if (item.type === 'action' && item.navigateTo) {
        navigate(item.navigateTo);
        close();
        return;
      }
      if (item.type === 'action' && item.onRun) {
        item.onRun({
          navigate,
          openUrl: (url, newTab = true) => {
            if (newTab) window.open(url, '_blank', 'noopener,noreferrer');
            else navigate(url);
          },
          recordAppOpened: (appId) => {
            void explorerService.recordAppOpened(appId);
          },
          touchRecentApp,
          touchRecentFolder,
          trackAppUsage,
          trackFolderUsage,
          folders,
          apps,
        });
        close();
        return;
      }

      if (item.type === 'ai') {
        const ctx: CommandContext = {
          navigate,
          openUrl: (url, newTab = true) => {
            if (newTab) window.open(url, '_blank', 'noopener,noreferrer');
            else navigate(url);
          },
          recordAppOpened: (appId) => {
            void explorerService.recordAppOpened(appId);
          },
          touchRecentApp,
          touchRecentFolder,
          trackAppUsage,
          trackFolderUsage,
          folders,
          apps,
        };

        if (item.onRun) {
          item.onRun(ctx);
          close();
          return;
        }

        const m = item.meta;
        if (!m || m.kind === 'noop') {
          close();
          return;
        }
        if (m.kind === 'open-folder' && m.folderId) {
          touchRecentFolder(m.folderId);
          trackFolderUsage(m.folderId);
          navigate(`/explorer?folder=${encodeURIComponent(m.folderId)}`);
          close();
          return;
        }
        if (m.kind === 'open-app' && m.appId) {
          const app = apps.find((a) => a.id === m.appId);
          if (app?.url) {
            touchRecentApp(app.id);
            trackAppUsage(app.id);
            window.open(app.url, '_blank', 'noopener,noreferrer');
            void explorerService.recordAppOpened(app.id);
          }
          close();
          return;
        }
        if (m.kind === 'open-recent-first') {
          const first = recentAppsResolved[0];
          if (first?.url) {
            touchRecentApp(first.id);
            trackAppUsage(first.id);
            window.open(first.url, '_blank', 'noopener,noreferrer');
            void explorerService.recordAppOpened(first.id);
          }
          close();
          return;
        }
        close();
        return;
      }

      if (item.type === 'folder') {
        touchRecentFolder(item.id);
        trackFolderUsage(item.id);
        navigate(`/explorer?folder=${encodeURIComponent(item.id)}`);
      } else if (item.type === 'app') {
        touchRecentApp(item.id);
        trackAppUsage(item.id);
        if (item.url) {
          window.open(item.url, '_blank', 'noopener,noreferrer');
          void explorerService.recordAppOpened(item.id);
        }
      }
      close();
    },
    [close, navigate, folders, apps, recentAppsResolved, trackAppUsage, trackFolderUsage]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, displayRows.length - 1)));
  }, [displayRows.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!session) return;
        setIsOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session]);

  const ctx = useMemo<CommandPaletteContextValue>(
    () => ({
      open,
      close,
      toggle,
      isOpen,
    }),
    [open, close, toggle, isOpen]
  );

  return (
    <CommandPaletteContext.Provider value={ctx}>
      {children}
      {session && (
        <CommandPalette
          isOpen={isOpen}
          onClose={close}
          query={query}
          onQueryChange={setQuery}
          debouncedQuery={debouncedQuery}
          items={displayRows}
          loading={loading}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          onExecute={executeItem}
          quickActionCount={quickActionCount}
          macroCutoff={macroCutoff}
          contextCutoff={contextCutoff}
          recentCutoff={recentOnly.length}
          hasActiveFilter={hasActiveFilter}
        />
      )}
    </CommandPaletteContext.Provider>
  );
}
