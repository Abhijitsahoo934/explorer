import { Briefcase, Code2, Rocket } from 'lucide-react';
import type { Folder, App } from '../types/explorer';
import type { WorkspaceTemplate } from './explorerService';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';

export const USER_TEMPLATE_STORAGE_KEY = STORAGE_KEYS.userTemplates;

export interface WorkspaceTemplateDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Rocket;
  accent: string;
  category: 'founders' | 'builders' | 'operators' | 'custom';
  audience: string;
  template: WorkspaceTemplate;
  source: 'curated' | 'custom';
}

export const CURATED_WORKSPACE_TEMPLATES: ReadonlyArray<WorkspaceTemplateDefinition> = [
  {
    id: 'founder-os',
    title: 'Founder OS',
    subtitle: 'Daily command center for shipping, fundraising, and hiring.',
    icon: Rocket,
    accent: 'from-orange-500/20 to-amber-500/10',
    category: 'founders',
    audience: 'Best for founders and startup leaders',
    source: 'curated',
    template: {
      name: 'Founder OS',
      folders: [
        {
          name: 'Company HQ',
          apps: [
            { name: 'Notion', url: 'https://www.notion.so' },
            { name: 'Google Drive', url: 'https://drive.google.com' },
            { name: 'Gmail', url: 'https://mail.google.com' },
          ],
        },
        {
          name: 'Growth',
          apps: [
            { name: 'LinkedIn', url: 'https://www.linkedin.com' },
            { name: 'X', url: 'https://x.com' },
            { name: 'Google Analytics', url: 'https://analytics.google.com' },
          ],
        },
        {
          name: 'Fundraising',
          apps: [
            { name: 'DocSend', url: 'https://docsend.com' },
            { name: 'Crunchbase', url: 'https://www.crunchbase.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'build-ship',
    title: 'Build + Ship',
    subtitle: 'Engineering workspace for builders moving from idea to release.',
    icon: Code2,
    accent: 'from-sky-500/20 to-cyan-500/10',
    category: 'builders',
    audience: 'Best for engineers and product teams',
    source: 'curated',
    template: {
      name: 'Build + Ship',
      folders: [
        {
          name: 'Engineering',
          apps: [
            { name: 'GitHub', url: 'https://github.com' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
            { name: 'Vercel', url: 'https://vercel.com' },
          ],
        },
        {
          name: 'Product',
          apps: [
            { name: 'Linear', url: 'https://linear.app' },
            { name: 'Figma', url: 'https://www.figma.com' },
            { name: 'Loom', url: 'https://www.loom.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'ops-suite',
    title: 'Operator Suite',
    subtitle: 'Execution stack for agencies, chiefs of staff, and operations teams.',
    icon: Briefcase,
    accent: 'from-emerald-500/20 to-teal-500/10',
    category: 'operators',
    audience: 'Best for operators, agencies, and client teams',
    source: 'curated',
    template: {
      name: 'Operator Suite',
      folders: [
        {
          name: 'Operations',
          apps: [
            { name: 'Slack', url: 'https://slack.com' },
            { name: 'Airtable', url: 'https://airtable.com' },
            { name: 'Google Calendar', url: 'https://calendar.google.com' },
          ],
        },
        {
          name: 'Clients',
          apps: [
            { name: 'Zoom', url: 'https://zoom.us' },
            { name: 'HubSpot', url: 'https://www.hubspot.com' },
            { name: 'Stripe', url: 'https://dashboard.stripe.com' },
          ],
        },
      ],
    },
  },
] as const;

export const WORKSPACE_TEMPLATES = CURATED_WORKSPACE_TEMPLATES;

export const getStoredWorkspaceTemplates = (): WorkspaceTemplateDefinition[] => {
  try {
    const rawValue = readStorageValue(localStorage, USER_TEMPLATE_STORAGE_KEY);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue) as WorkspaceTemplateDefinition[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

export const saveWorkspaceTemplateDefinition = (template: WorkspaceTemplateDefinition) => {
  const existingTemplates = getStoredWorkspaceTemplates();
  writeStorageValue(
    localStorage,
    USER_TEMPLATE_STORAGE_KEY,
    JSON.stringify([template, ...existingTemplates.filter((item) => item.id !== template.id)])
  );
};

export const deleteStoredWorkspaceTemplate = (templateId: string) => {
  const nextTemplates = getStoredWorkspaceTemplates().filter((template) => template.id !== templateId);
  writeStorageValue(localStorage, USER_TEMPLATE_STORAGE_KEY, JSON.stringify(nextTemplates));
};

const buildFolderAppMap = (apps: App[]) =>
  apps.reduce<Record<string, Array<{ name: string; url: string }>>>((accumulator, app) => {
    if (!app.folder_id) {
      return accumulator;
    }

    if (!accumulator[app.folder_id]) {
      accumulator[app.folder_id] = [];
    }

    accumulator[app.folder_id].push({
      name: app.name,
      url: app.url,
    });

    return accumulator;
  }, {});

export const buildWorkspaceTemplateFromSnapshot = (
  title: string,
  subtitle: string,
  folders: Folder[],
  apps: App[]
): WorkspaceTemplateDefinition => {
  const folderAppMap = buildFolderAppMap(apps);

  const templateFolders = folders
    .filter((folder) => folder.parent_id === null)
    .map((folder) => ({
      name: folder.name,
      apps: folderAppMap[folder.id] ?? [],
    }))
    .filter((folder) => folder.apps.length > 0 || folder.name.trim().length > 0);

  return {
    id: `custom-${Date.now()}`,
    title,
    subtitle,
    icon: Rocket,
    accent: 'from-fuchsia-500/20 to-rose-500/10',
    category: 'custom',
    audience: 'Saved from your live workspace',
    source: 'custom',
    template: {
      name: title,
      folders: templateFolders,
    },
  };
};
