import type { Folder, App } from '../types/explorer';
import type { CommandPaletteItem } from './commandPaletteUtils';
import type { TopContextItems } from './contextEngine';
import { buildFaviconUrl, getHostnameFromUrl } from '../platform/security/url';

export type { CommandContext } from './commandPaletteUtils';

function aiItem(
  partial: Omit<CommandPaletteItem, 'type' | 'actionType' | 'subtext'> & { subtext?: string }
): CommandPaletteItem {
  return {
    ...partial,
    type: 'ai',
    actionType: 'ai',
    subtext: partial.subtext ?? partial.description ?? '',
  };
}

/**
 * Rule-based “AI” suggestions (MVP: pure functions, no network).
 * Returns items with `type: 'ai'` for merging into the command palette.
 */
export function generateAIActions(
  query: string,
  folders: Folder[],
  apps: App[],
  recentApps: App[],
  topContext?: TopContextItems
): CommandPaletteItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const out: CommandPaletteItem[] = [];
  const seen = new Set<string>();
  const topFolderIds = new Set(topContext?.folders.map((entry) => entry.id) ?? []);
  const topAppIds = new Set(topContext?.apps.map((entry) => entry.id) ?? []);

  const push = (item: CommandPaletteItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    out.push(item);
  };

  // --- “open …” → jump to folder whose name matches the remainder ---
  const afterOpen = q.includes('open') ? q.replace(/^.*?\bopen\b\s*/i, '').trim() : '';
  if (afterOpen.length >= 2) {
    for (const f of folders) {
      const nameLower = f.name.toLowerCase();
      if (nameLower.includes(afterOpen) || afterOpen.includes(nameLower)) {
        push(
          aiItem({
            id: `ai-open-folder-${f.id}`,
            name: `Open ${f.name}`,
            description: 'Jump into this workspace folder',
            subtext: `Folder · ${f.name}`,
            keywords: ['open', 'folder', nameLower, afterOpen],
            meta: { kind: 'open-folder', folderId: f.id },
          })
        );
      }
    }
  }

  // --- “continue” / “resume” → surface recent apps ---
  if (/\b(continue|resume|pick up|left off)\b/.test(q)) {
    if (recentApps.length === 0) {
      push(
        aiItem({
          id: 'ai-continue-empty',
          name: 'Continue where you left off',
          description: 'No recent apps yet — open tools from Explorer first',
          subtext: 'History builds as you use your workspace',
          keywords: ['continue', 'resume', 'recent'],
          meta: { kind: 'noop' },
        })
      );
    } else {
      for (const app of recentApps.slice(0, 6)) {
        const host = (() => {
          const hostname = getHostnameFromUrl(app.url);
          return hostname ? hostname.replace(/^www\./, '') : app.url;
        })();
        push(
          aiItem({
            id: `ai-resume-app-${app.id}`,
            name: `Resume ${app.name}`,
            description: 'Recently opened in your workspace',
            subtext: host,
            icon: app.icon ?? buildFaviconUrl(app.url, 64) ?? undefined,
            url: app.url,
            keywords: ['continue', 'resume', 'recent', app.name.toLowerCase()],
            meta: { kind: 'open-app', appId: app.id },
          })
        );
      }
    }

    for (const app of apps.filter((entry) => topAppIds.has(entry.id)).slice(0, 3)) {
      push(
        aiItem({
          id: `ai-context-app-${app.id}`,
          name: `Resume your ${app.name} workflow`,
          description: 'Frequently used in your workspace',
          subtext: 'Behavioral memory suggestion',
          icon: app.icon ?? buildFaviconUrl(app.url, 64) ?? undefined,
          url: app.url,
          keywords: ['resume', 'workflow', 'context', app.name.toLowerCase()],
          meta: { kind: 'open-app', appId: app.id },
        })
      );
    }
  }

  // --- “ai” + tools/stack → prefer a folder that looks like AI tools ---
  if (/\bai\b/.test(q) && /\b(tool|tools|stack|suite)\b/.test(q)) {
    const aiFolder =
      folders.find((f) => /ai/i.test(f.name) && /tool|stack|suite|lab/i.test(f.name)) ??
      folders.find((f) => /ai/i.test(f.name)) ??
      folders.find((f) => /tool/i.test(f.name));

    if (aiFolder) {
      push(
        aiItem({
          id: `ai-tools-folder-${aiFolder.id}`,
          name: `Open ${aiFolder.name}`,
          description: 'Your AI tools workspace',
          subtext: `Folder · ${aiFolder.name}`,
          keywords: ['ai', 'tools', 'stack'],
          meta: { kind: 'open-folder', folderId: aiFolder.id },
        })
      );
    }
  }

  // --- “work” → most active folder by app count ---
  if (/\b(work|workspace|setup)\b/.test(q)) {
    const counts = new Map<string, number>();
    for (const a of apps) {
      if (a.folder_id) {
        counts.set(a.folder_id, (counts.get(a.folder_id) ?? 0) + 1);
      }
    }
    let best: Folder | null = null;
    let bestCount = -1;
    for (const f of folders) {
      const c = counts.get(f.id) ?? 0;
      if (c > bestCount) {
        bestCount = c;
        best = f;
      }
    }
    if (best && bestCount > 0) {
      push(
        aiItem({
          id: `ai-active-workspace-${best.id}`,
          name: `Open ${best.name} workspace`,
          description: 'Most active folder by number of apps',
          subtext: `${bestCount} apps in this folder`,
          keywords: ['work', 'workspace', 'active', 'setup'],
          meta: { kind: 'open-folder', folderId: best.id },
        })
      );
    }

    push(
      aiItem({
        id: 'ai-continue-work',
        name: 'Continue where you left off',
        description: 'Jump to your recent apps',
        subtext: recentApps.length ? `${recentApps.length} recent apps available` : 'Open apps to build history',
        keywords: ['work', 'continue', 'recent'],
        meta: recentApps.length ? { kind: 'open-recent-first' } : { kind: 'noop' },
      })
    );
  }

  if (/\b(work|workspace|focus|today)\b/.test(q)) {
    for (const folder of folders.filter((entry) => topFolderIds.has(entry.id)).slice(0, 2)) {
      push(
        aiItem({
          id: `ai-context-folder-${folder.id}`,
          name: `Open your most used workspace: ${folder.name}`,
          description: 'Smart suggestion from your recent behavior',
          subtext: `Folder · ${folder.name}`,
          keywords: ['work', 'workspace', 'focus', 'context', folder.name.toLowerCase()],
          meta: { kind: 'open-folder', folderId: folder.id },
        })
      );
    }
  }

  return out.slice(0, 14);
}
