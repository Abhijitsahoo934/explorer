import type { CommandPaletteItem } from './commandPaletteUtils';

/** Stable routes for Cmd+K quick actions (foundation for future AI intents). */
export const WORKSPACE_QUICK_ACTIONS = [
  {
    id: 'action-explorer',
    name: 'Open Explorer',
    subtext: 'Browse folders and apps in your vault',
    keywords: ['explorer', 'vault', 'workspace', 'browse', 'filesystem', 'os', 'navigate'],
    navigateTo: '/explorer',
  },
  {
    id: 'action-dashboard',
    name: 'Dashboard',
    subtext: 'Overview, templates, and recently indexed apps',
    keywords: ['dashboard', 'home', 'start', 'overview', 'welcome'],
    navigateTo: '/dashboard',
  },
  {
    id: 'action-templates',
    name: 'Template marketplace',
    subtext: 'Install full workspace systems in one click',
    keywords: ['templates', 'marketplace', 'install', 'systems', 'os', 'blueprint', 'curated'],
    navigateTo: '/templates',
  },
  {
    id: 'action-insights',
    name: 'Product insights',
    subtext: 'Telemetry, funnel events, and workspace analytics',
    keywords: ['insights', 'analytics', 'metrics', 'stats', 'telemetry', 'funnel', 'product'],
    navigateTo: '/insights',
  },
] as const;

export function normalizeQuickActions(options?: { includeInsights?: boolean }): CommandPaletteItem[] {
  const includeInsights = options?.includeInsights ?? true;
  const source = includeInsights
    ? WORKSPACE_QUICK_ACTIONS
    : WORKSPACE_QUICK_ACTIONS.filter((action) => action.id !== 'action-insights');

  return source.map((a) => ({
    id: a.id,
    type: 'action' as const,
    name: a.name,
    subtext: a.subtext,
    keywords: [...a.keywords],
    navigateTo: a.navigateTo,
    actionType: 'static' as const,
  }));
}
