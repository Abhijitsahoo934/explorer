import {
  BookOpen,
  BrainCircuit,
  Clapperboard,
  Code2,
  Figma,
  GraduationCap,
  PenSquare,
  Rocket,
  type LucideIcon,
  Youtube,
} from 'lucide-react';
import type { Folder, App } from '../types/explorer';
import type { WorkspaceTemplate } from './explorerService';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';

export const USER_TEMPLATE_STORAGE_KEY = STORAGE_KEYS.userTemplates;

export interface WorkspaceTemplateDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  category: 'creative' | 'technical' | 'creators' | 'business' | 'specialized' | 'custom';
  audience: string;
  tags?: string[];
  template: WorkspaceTemplate;
  source: 'curated' | 'custom';
}

type StoredWorkspaceTemplate = Partial<Omit<WorkspaceTemplateDefinition, 'icon'>> & {
  icon?: unknown;
};

export const CURATED_WORKSPACE_TEMPLATES: ReadonlyArray<WorkspaceTemplateDefinition> = [
  {
    id: 'startup-founder-os',
    title: 'Startup Founder OS',
    subtitle: 'Product, fundraising, growth, and company operations in one command center.',
    icon: Rocket,
    accent: 'from-orange-500/20 to-amber-500/10',
    category: 'business',
    audience: 'Best for founders and startup leaders',
    tags: ['founder', 'startup', 'growth', 'fundraising', 'operations'],
    source: 'curated',
    template: {
      name: 'Startup Founder OS',
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
            { name: 'Carta', url: 'https://carta.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'software-developer-os',
    title: 'Software Developer OS',
    subtitle: 'Code, APIs, deployment, docs, and databases in one clean workspace.',
    icon: Code2,
    accent: 'from-sky-500/20 to-cyan-500/10',
    category: 'technical',
    audience: 'Best for software developers and engineering teams',
    tags: ['developer', 'github', 'vercel', 'api', 'database'],
    source: 'curated',
    template: {
      name: 'Software Developer OS',
      folders: [
        {
          name: 'Engineering',
          apps: [
            { name: 'VS Code', url: 'https://code.visualstudio.com' },
            { name: 'GitHub', url: 'https://github.com' },
            { name: 'Postman', url: 'https://www.postman.com' },
          ],
        },
        {
          name: 'Ship',
          apps: [
            { name: 'Supabase', url: 'https://supabase.com' },
            { name: 'Vercel', url: 'https://vercel.com' },
            { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
          ],
        },
      ],
    },
  },
  {
    id: 'ui-ux-designer-os',
    title: 'UI/UX Designer OS',
    subtitle: 'Design, research, wireframing, prototyping, and handoff in one system.',
    icon: Figma,
    accent: 'from-violet-500/20 to-indigo-500/10',
    category: 'creative',
    audience: 'Best for UI, UX, and product designers',
    tags: ['ux', 'ui', 'figma', 'research', 'prototype'],
    source: 'curated',
    template: {
      name: 'UI/UX Designer OS',
      folders: [
        {
          name: 'Design',
          apps: [
            { name: 'Figma', url: 'https://www.figma.com' },
            { name: 'Framer', url: 'https://www.framer.com' },
            { name: 'Penpot', url: 'https://penpot.app' },
          ],
        },
        {
          name: 'Research',
          apps: [
            { name: 'Maze', url: 'https://maze.co' },
            { name: 'FigJam', url: 'https://www.figma.com/figjam/' },
            { name: 'Mobbin', url: 'https://mobbin.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'video-editor-os',
    title: 'Video Editor OS',
    subtitle: 'Editing, motion, stock, music, and publishing tools for serious video workflows.',
    icon: Clapperboard,
    accent: 'from-rose-500/20 to-orange-500/10',
    category: 'creative',
    audience: 'Best for video editors and content production teams',
    tags: ['video', 'editing', 'premiere', 'davinci', 'youtube'],
    source: 'curated',
    template: {
      name: 'Video Editor OS',
      folders: [
        {
          name: 'Editing',
          apps: [
            { name: 'Adobe Premiere Pro', url: 'https://www.adobe.com/products/premiere.html' },
            { name: 'DaVinci Resolve', url: 'https://www.blackmagicdesign.com/products/davinciresolve' },
            { name: 'Frame.io', url: 'https://frame.io' },
          ],
        },
        {
          name: 'Assets & Publish',
          apps: [
            { name: 'Artgrid', url: 'https://artgrid.io' },
            { name: 'Epidemic Sound', url: 'https://www.epidemicsound.com' },
            { name: 'YouTube Studio', url: 'https://studio.youtube.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'ai-ml-engineer-os',
    title: 'AI/ML Engineer OS',
    subtitle: 'LLMs, research, vector databases, and MLOps tools in one AI stack.',
    icon: BrainCircuit,
    accent: 'from-purple-500/20 to-indigo-500/10',
    category: 'technical',
    audience: 'Best for AI engineers and ML practitioners',
    tags: ['ai', 'ml', 'openai', 'huggingface', 'vector database'],
    source: 'curated',
    template: {
      name: 'AI/ML Engineer OS',
      folders: [
        {
          name: 'Models',
          apps: [
            { name: 'OpenAI Platform', url: 'https://platform.openai.com' },
            { name: 'Google AI Studio', url: 'https://aistudio.google.com' },
            { name: 'Hugging Face', url: 'https://huggingface.co' },
          ],
        },
        {
          name: 'Deploy & Research',
          apps: [
            { name: 'Pinecone', url: 'https://www.pinecone.io' },
            { name: 'Weights & Biases', url: 'https://wandb.ai' },
            { name: 'Papers with Code', url: 'https://paperswithcode.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'youtuber-os',
    title: 'YouTuber OS',
    subtitle: 'Planning, thumbnails, SEO, analytics, and publishing in one creator flow.',
    icon: Youtube,
    accent: 'from-red-500/20 to-pink-500/10',
    category: 'creators',
    audience: 'Best for YouTubers and video creators',
    tags: ['youtube', 'creator', 'thumbnail', 'analytics', 'seo'],
    source: 'curated',
    template: {
      name: 'YouTuber OS',
      folders: [
        {
          name: 'Create',
          apps: [
            { name: 'Notion', url: 'https://www.notion.so' },
            { name: 'DaVinci Resolve', url: 'https://www.blackmagicdesign.com/products/davinciresolve' },
            { name: 'Canva', url: 'https://www.canva.com' },
          ],
        },
        {
          name: 'Grow',
          apps: [
            { name: 'YouTube Studio', url: 'https://studio.youtube.com' },
            { name: 'TubeBuddy', url: 'https://www.tubebuddy.com' },
            { name: 'VidIQ', url: 'https://vidiq.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'blogger-os',
    title: 'Blogger OS',
    subtitle: 'Writing, AI assistance, SEO, publishing, and analytics for serious content work.',
    icon: PenSquare,
    accent: 'from-cyan-500/20 to-blue-500/10',
    category: 'creators',
    audience: 'Best for bloggers and writers',
    tags: ['blogger', 'writer', 'seo', 'wordpress', 'analytics'],
    source: 'curated',
    template: {
      name: 'Blogger OS',
      folders: [
        {
          name: 'Write',
          apps: [
            { name: 'Google Docs', url: 'https://docs.google.com' },
            { name: 'Grammarly', url: 'https://www.grammarly.com' },
            { name: 'ChatGPT', url: 'https://chat.openai.com' },
          ],
        },
        {
          name: 'Publish & Rank',
          apps: [
            { name: 'WordPress', url: 'https://wordpress.org' },
            { name: 'Ahrefs', url: 'https://ahrefs.com' },
            { name: 'Google Analytics', url: 'https://analytics.google.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'product-manager-os',
    title: 'Product Manager OS',
    subtitle: 'Roadmaps, research, docs, analytics, and team delivery in one PM stack.',
    icon: BookOpen,
    accent: 'from-indigo-500/20 to-sky-500/10',
    category: 'business',
    audience: 'Best for product managers and product leads',
    tags: ['product manager', 'roadmap', 'analytics', 'research', 'docs'],
    source: 'curated',
    template: {
      name: 'Product Manager OS',
      folders: [
        {
          name: 'Strategy',
          apps: [
            { name: 'Productboard', url: 'https://www.productboard.com' },
            { name: 'Linear', url: 'https://linear.app' },
            { name: 'Notion', url: 'https://www.notion.so' },
          ],
        },
        {
          name: 'Research & Analytics',
          apps: [
            { name: 'Maze', url: 'https://maze.co' },
            { name: 'Amplitude', url: 'https://amplitude.com' },
            { name: 'Hotjar', url: 'https://www.hotjar.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'teacher-os',
    title: 'Teacher OS',
    subtitle: 'Classroom, lesson planning, interactive learning, and grading in one education system.',
    icon: GraduationCap,
    accent: 'from-blue-500/20 to-cyan-500/10',
    category: 'specialized',
    audience: 'Best for teachers and educators',
    tags: ['teacher', 'education', 'classroom', 'quiz', 'grading'],
    source: 'curated',
    template: {
      name: 'Teacher OS',
      folders: [
        {
          name: 'Teach',
          apps: [
            { name: 'Google Classroom', url: 'https://classroom.google.com' },
            { name: 'Canvas', url: 'https://www.instructure.com/canvas' },
            { name: 'Nearpod', url: 'https://nearpod.com' },
          ],
        },
        {
          name: 'Engage & Grade',
          apps: [
            { name: 'Kahoot!', url: 'https://kahoot.com' },
            { name: 'Quizlet', url: 'https://quizlet.com' },
            { name: 'Gradescope', url: 'https://www.gradescope.com' },
          ],
        },
      ],
    },
  },
  {
    id: 'researcher-os',
    title: 'Researcher OS',
    subtitle: 'Literature search, references, writing, analysis, and collaboration in one academic stack.',
    icon: BookOpen,
    accent: 'from-violet-500/20 to-indigo-500/10',
    category: 'specialized',
    audience: 'Best for researchers, academics, and PhD students',
    tags: ['research', 'academic', 'zotero', 'overleaf', 'scholar'],
    source: 'curated',
    template: {
      name: 'Researcher OS',
      folders: [
        {
          name: 'Literature',
          apps: [
            { name: 'Google Scholar', url: 'https://scholar.google.com' },
            { name: 'arXiv', url: 'https://arxiv.org' },
            { name: 'Zotero', url: 'https://www.zotero.org' },
          ],
        },
        {
          name: 'Write & Analyze',
          apps: [
            { name: 'Overleaf', url: 'https://www.overleaf.com' },
            { name: 'Notion', url: 'https://www.notion.so' },
            { name: 'Jupyter', url: 'https://jupyter.org' },
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
    const parsedValue = JSON.parse(rawValue) as StoredWorkspaceTemplate[];
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .filter((template): template is StoredWorkspaceTemplate & { template: WorkspaceTemplate } => {
        return Boolean(
          template &&
          typeof template === 'object' &&
          template.template &&
          Array.isArray(template.template.folders)
        );
      })
      .map((template, index) => ({
        id: typeof template.id === 'string' && template.id.length > 0 ? template.id : `custom-restored-${index}`,
        title: typeof template.title === 'string' && template.title.length > 0 ? template.title : `My Workspace ${index + 1}`,
        subtitle:
          typeof template.subtitle === 'string' && template.subtitle.length > 0
            ? template.subtitle
            : 'Saved from your current live workspace setup.',
        icon: Rocket,
        accent: typeof template.accent === 'string' && template.accent.length > 0
          ? template.accent
          : 'from-fuchsia-500/20 to-rose-500/10',
        category: 'custom',
        audience:
          typeof template.audience === 'string' && template.audience.length > 0
            ? template.audience
            : 'Saved from your live workspace',
        tags: Array.isArray(template.tags) ? template.tags.filter((tag): tag is string => typeof tag === 'string') : ['custom', 'workspace', 'personal'],
        template: template.template,
        source: 'custom',
      }));
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
    tags: ['custom', 'workspace', 'personal'],
    source: 'custom',
    template: {
      name: title,
      folders: templateFolders,
    },
  };
};
