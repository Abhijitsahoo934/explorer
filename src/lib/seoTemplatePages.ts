import { Briefcase, Code2, Palette, type LucideIcon } from 'lucide-react';
import type { WorkspaceTemplate } from './explorerService';

export interface SeoTemplatePageDefinition {
  slug: 'developer-os' | 'creator-os' | 'freelancer-os';
  title: string;
  seoTitle: string;
  description: string;
  audience: string;
  icon: LucideIcon;
  accent: string;
  summary: string;
  bullets: string[];
  template: WorkspaceTemplate;
}

export const SEO_TEMPLATE_PAGES: ReadonlyArray<SeoTemplatePageDefinition> = [
  {
    slug: 'developer-os',
    title: 'Developer OS',
    seoTitle: 'Developer OS Template | Explorero',
    description:
      'A structured workspace for developers to keep code, docs, deployment, and debugging tools in one organized system.',
    audience: 'Best for developers, indie hackers, and engineering students',
    icon: Code2,
    accent: 'from-sky-500/20 to-cyan-500/10',
    summary:
      'Stop jumping between tabs for GitHub, docs, deployment, and debugging. Developer OS gives you one clean workspace for building and shipping.',
    bullets: [
      'Keep engineering tools grouped by purpose instead of memory.',
      'Start coding sessions faster with the same ready setup every day.',
      'Reduce browser chaos across docs, repos, deploy, and product tools.',
    ],
    template: {
      name: 'Developer OS',
      folders: [
        {
          name: 'Engineering',
          apps: [
            { name: 'GitHub', url: 'https://github.com' },
            { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
            { name: 'React Docs', url: 'https://react.dev' },
          ],
        },
        {
          name: 'Ship',
          apps: [
            { name: 'Vercel', url: 'https://vercel.com' },
            { name: 'Supabase', url: 'https://supabase.com' },
            { name: 'Postman', url: 'https://www.postman.com' },
          ],
        },
      ],
    },
  },
  {
    slug: 'creator-os',
    title: 'Creator OS',
    seoTitle: 'Creator OS Template | Explorero',
    description:
      'An organized workspace for creators to manage writing, research, design, video, and publishing tools without tab chaos.',
    audience: 'Best for content creators, designers, and solo brands',
    icon: Palette,
    accent: 'from-fuchsia-500/20 to-rose-500/10',
    summary:
      'Put your writing, editing, design, publishing, and research stack into one calm operating surface so content work feels repeatable, not scattered.',
    bullets: [
      'Separate research, production, and publishing into clear folders.',
      'Keep creative context intact instead of hunting through random tabs.',
      'Use the same launch-ready setup across browsers and devices.',
    ],
    template: {
      name: 'Creator OS',
      folders: [
        {
          name: 'Create',
          apps: [
            { name: 'Notion', url: 'https://www.notion.so' },
            { name: 'Canva', url: 'https://www.canva.com' },
            { name: 'Figma', url: 'https://www.figma.com' },
          ],
        },
        {
          name: 'Publish',
          apps: [
            { name: 'YouTube Studio', url: 'https://studio.youtube.com' },
            { name: 'X', url: 'https://x.com' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com' },
          ],
        },
      ],
    },
  },
  {
    slug: 'freelancer-os',
    title: 'Freelancer OS',
    seoTitle: 'Freelancer OS Template | Explorero',
    description:
      'A workflow-ready workspace for freelancers to manage clients, projects, invoices, meetings, and delivery in one system.',
    audience: 'Best for freelancers, consultants, and operators',
    icon: Briefcase,
    accent: 'from-emerald-500/20 to-teal-500/10',
    summary:
      'Handle clients, delivery, invoices, and communication from one workspace instead of digging through tabs, bookmarks, and scattered tools.',
    bullets: [
      'Group client work, admin, and communication into one repeatable setup.',
      'Open proposals, meetings, and invoicing tools from a single workspace.',
      'Make your workflow portable across laptops and browsers.',
    ],
    template: {
      name: 'Freelancer OS',
      folders: [
        {
          name: 'Clients',
          apps: [
            { name: 'Zoom', url: 'https://zoom.us' },
            { name: 'Google Meet', url: 'https://meet.google.com' },
            { name: 'Slack', url: 'https://slack.com' },
          ],
        },
        {
          name: 'Operations',
          apps: [
            { name: 'Notion', url: 'https://www.notion.so' },
            { name: 'Google Drive', url: 'https://drive.google.com' },
            { name: 'Stripe', url: 'https://dashboard.stripe.com' },
          ],
        },
      ],
    },
  },
];

export function getSeoTemplatePage(slug: string | undefined) {
  return SEO_TEMPLATE_PAGES.find((page) => page.slug === slug) ?? null;
}
