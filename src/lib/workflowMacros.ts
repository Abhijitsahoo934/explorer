import type { App, Folder } from '../types/explorer';
import type { CommandContext, CommandPaletteItem } from './commandPaletteUtils';
import type { TopContextItems } from './contextEngine';

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function folderApps(folderId: string, apps: App[]): App[] {
  return apps.filter((app) => app.folder_id === folderId);
}

function runWorkflow(
  name: string,
  description: string,
  folder: Folder | null,
  appsToOpen: App[],
  keywords: string[]
): CommandPaletteItem {
  const uniqueApps = appsToOpen.filter((app, index, all) => all.findIndex((entry) => entry.id === app.id) === index).slice(0, 4);
  const appSummary = uniqueApps.map((app) => app.name).join(', ');

  return {
    id: `workflow-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    type: 'action',
    name,
    description,
    subtext: uniqueApps.length
      ? `${uniqueApps.length} apps${folder ? ` · ${folder.name}` : ''}${appSummary ? ` · ${appSummary}` : ''}`
      : folder
        ? `Workspace · ${folder.name}`
        : 'Workspace workflow',
    keywords,
    actionType: 'static',
    onRun: (context: CommandContext) => {
      if (folder) {
        context.touchRecentFolder(folder.id);
        context.trackFolderUsage(folder.id);
        context.navigate(`/explorer?folder=${encodeURIComponent(folder.id)}`);
      }

      for (const app of uniqueApps) {
        context.touchRecentApp(app.id);
        context.trackAppUsage(app.id);
        context.openUrl(app.url, true);
        context.recordAppOpened(app.id);
      }
    },
  };
}

function createFolderWorkflow(folder: Folder, apps: App[], keywords: string[], title: string, description: string) {
  const rankedApps = [...apps]
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return Number(b.is_pinned) - Number(a.is_pinned);
      return (b.last_opened_at ?? '').localeCompare(a.last_opened_at ?? '');
    })
    .slice(0, 3);

  return runWorkflow(title, description, folder, rankedApps, keywords);
}

export function buildWorkflowMacros(
  folders: Folder[],
  apps: App[],
  recentApps: App[],
  topContext: TopContextItems
): CommandPaletteItem[] {
  const macros: CommandPaletteItem[] = [];
  const seen = new Set<string>();
  const push = (item: CommandPaletteItem | null) => {
    if (!item || seen.has(item.id)) return;
    seen.add(item.id);
    macros.push(item);
  };

  const topFolder = topContext.folders
    .map((entry) => folders.find((folder) => folder.id === entry.id))
    .find((folder): folder is Folder => !!folder);

  if (topFolder) {
    push(
      createFolderWorkflow(
        topFolder,
        folderApps(topFolder.id, apps),
        ['workflow', 'macro', 'workspace', 'open', 'continue', topFolder.name.toLowerCase()],
        `Open ${topFolder.name} setup`,
        'Launch your most-used workspace with one command'
      )
    );
  }

  if (recentApps.length > 0) {
    push(
      runWorkflow(
        'Resume recent flow',
        'Reopen the apps you touched most recently',
        null,
        recentApps.slice(0, 3),
        ['workflow', 'macro', 'resume', 'recent', 'continue', 'flow']
      )
    );
  }

  const folderMatchers = [
    {
      key: 'fundraising',
      match: /fund|invest|pitch|raise/i,
      keywords: ['workflow', 'macro', 'fundraising', 'investor', 'pitch', 'raise'],
      title: 'Open fundraising setup',
      description: 'Jump into investor-facing tools in one move',
    },
    {
      key: 'build',
      match: /build|dev|code|tech|engineer/i,
      keywords: ['workflow', 'macro', 'build', 'dev', 'engineering', 'ship'],
      title: 'Open build stack',
      description: 'Launch your builder workflow instantly',
    },
    {
      key: 'growth',
      match: /growth|market|sales|acquisition/i,
      keywords: ['workflow', 'macro', 'growth', 'marketing', 'sales'],
      title: 'Open growth stack',
      description: 'Fire up your growth workspace in one shot',
    },
    {
      key: 'ai',
      match: /ai|llm|research|agent/i,
      keywords: ['workflow', 'macro', 'ai', 'research', 'llm', 'tools'],
      title: 'Open AI stack',
      description: 'Launch your AI tools and research workflow',
    },
  ] as const;

  for (const matcher of folderMatchers) {
    const folder = folders.find((entry) => matcher.match.test(entry.name));
    if (!folder) continue;
    push(createFolderWorkflow(folder, folderApps(folder.id, apps), [...matcher.keywords, folder.name.toLowerCase()], matcher.title, matcher.description));
  }

  if (!topFolder && apps.length > 0) {
    const sortedByRecent = [...apps]
      .sort((a, b) => (b.last_opened_at ?? '').localeCompare(a.last_opened_at ?? ''))
      .slice(0, 3);

    push(
      runWorkflow(
        'Open today’s stack',
        'Launch the apps you are using right now',
        null,
        sortedByRecent,
        ['workflow', 'macro', 'today', 'stack', ...sortedByRecent.map((app) => hostFromUrl(app.url).toLowerCase())]
      )
    );
  }

  return macros.slice(0, 6);
}
