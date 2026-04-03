import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Grain } from '../components/ui/Grain';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Button } from '../components/ui/Button';
import { explorerService } from '../lib/explorerService';
import { base64UrlEncode } from '../lib/base64Url';
import {
  CURATED_WORKSPACE_TEMPLATES,
  buildWorkspaceTemplateFromSnapshot,
  deleteStoredWorkspaceTemplate,
  getStoredWorkspaceTemplates,
  saveWorkspaceTemplateDefinition,
} from '../lib/workspaceTemplates';
import {
  Briefcase,
  CheckCircle2,
  Code2,
  Filter,
  Rocket,
  Sparkles,
  BookmarkPlus,
  Trash2,
  Share2,
  Copy,
  X,
  Palette,
  GraduationCap,
  Search,
} from 'lucide-react';
import { trackFunnelEvent } from '../lib/analyticsService';
import { getErrorMessage } from '../lib/errorMessage';
import { logger } from '../platform/observability/logger';
import { Seo } from '../components/system/Seo';

const FILTERS = [
  { id: 'all', label: 'All Templates', icon: Sparkles },
  { id: 'business', label: 'Business', icon: Rocket },
  { id: 'technical', label: 'Technical', icon: Code2 },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'creators', label: 'Creators', icon: Briefcase },
  { id: 'specialized', label: 'Specialized', icon: GraduationCap },
  { id: 'custom', label: 'My Templates', icon: BookmarkPlus },
] as const;

export default function TemplateMarketplace() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'warning'>('success');
  const [folderTreeSyncKey, setFolderTreeSyncKey] = useState(0);
  const [customTemplates, setCustomTemplates] = useState(getStoredWorkspaceTemplates());
  const [isSavingCurrentWorkspace, setIsSavingCurrentWorkspace] = useState(false);

  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const customTemplateCount = customTemplates.length;
  const sharePreview = useMemo(() => {
    if (!shareLink) return null;
    try {
      const parsed = new URL(shareLink);
      const dataSize = parsed.searchParams.get('data')?.length ?? 0;
      return `${parsed.origin}/blueprint?data=... (${Math.round(dataSize / 10) / 100}k chars)`;
    } catch {
      return shareLink;
    }
  }, [shareLink]);

  useEffect(() => {
    setCustomTemplates(getStoredWorkspaceTemplates());
  }, []);

  const templates = useMemo(
    () => [...customTemplates, ...CURATED_WORKSPACE_TEMPLATES],
    [customTemplates]
  );

  const filteredTemplates = useMemo(() => {
    const byCategory =
      activeFilter === 'all' ? templates : templates.filter((template) => template.category === activeFilter);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return byCategory;

    return byCategory.filter((template) => {
      const haystack = [
        template.title,
        template.subtitle,
        template.audience,
        ...(template.tags ?? []),
        ...template.template.folders.map((folder) => folder.name),
        ...template.template.folders.flatMap((folder) => folder.apps.map((app) => app.name)),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [activeFilter, searchQuery, templates]);

  const handleFolderSelect = (folderId: string | null) => {
    setMobileSidebarOpen(false);
    if (folderId) {
      navigate(`/explorer?folder=${encodeURIComponent(folderId)}`);
      return;
    }
    navigate('/explorer');
  };

  const handleInstall = async (templateId: string) => {
    const selectedTemplate = templates.find((template) => template.id === templateId);
    if (!selectedTemplate) return;

    setActiveTemplateId(templateId);
    setFeedback(null);

    try {
      await explorerService.seedWorkspaceTemplate(selectedTemplate.template);
      trackFunnelEvent('template_installed', {
        template_id: templateId,
        source: 'marketplace',
        title: selectedTemplate.title,
      });
      setFeedbackTone('success');
      setFeedback(`${selectedTemplate.title} installed successfully. Your workspace is ready to explore.`);
      setFolderTreeSyncKey((value) => value + 1);
    } catch (error) {
      logger.error('template_marketplace_install', error, { templateId });
      setFeedbackTone('warning');
      setFeedback(getErrorMessage(error, 'Template installation failed. Please try again.'));
    } finally {
      setActiveTemplateId(null);
    }
  };

  const handleSaveCurrentWorkspace = async () => {
    setIsSavingCurrentWorkspace(true);
    setFeedback(null);

    try {
      const [folders, apps] = await Promise.all([
        explorerService.getFolders(),
        explorerService.getAllApps(),
      ]);

      const nonRootFolders = folders.filter((folder) => folder.parent_id === null);
      if (nonRootFolders.length === 0) {
        setFeedbackTone('warning');
        setFeedback('Create at least one top-level folder before saving a workspace template.');
        return;
      }

      const nextTemplate = buildWorkspaceTemplateFromSnapshot(
        `My Workspace ${customTemplates.length + 1}`,
        'Saved from your current live workspace setup.',
        folders,
        apps
      );

      saveWorkspaceTemplateDefinition(nextTemplate);
      setCustomTemplates(getStoredWorkspaceTemplates());
      setActiveFilter('custom');
      setFeedbackTone('success');
      setFeedback(`${nextTemplate.title} saved. You now have a reusable template based on your own workspace.`);
      setFolderTreeSyncKey((value) => value + 1);
    } catch (error) {
      logger.error('save_current_workspace_template', error);
      setFeedbackTone('warning');
      setFeedback(getErrorMessage(error, 'We could not save the current workspace as a template. Please try again.'));
    } finally {
      setIsSavingCurrentWorkspace(false);
    }
  };

  const handleShareBlueprint = async () => {
    setIsCreatingShare(true);
    setFeedback(null);
    try {
      const [folders, apps] = await Promise.all([
        explorerService.getFolders(),
        explorerService.getAllApps(),
      ]);

      const topLevelFolders = folders.filter((folder) => folder.parent_id === null);
      if (topLevelFolders.length === 0) {
        setFeedbackTone('warning');
        setFeedback('Create at least one top-level folder before sharing a blueprint.');
        return;
      }

      const sharedTemplate = buildWorkspaceTemplateFromSnapshot(
        'Shared Workspace Blueprint',
        'Created from my live workspace setup.',
        folders,
        apps
      );

      // Payload for installer is only the WorkspaceTemplate shape (no id/category metadata).
      const payload = sharedTemplate.template;
      const encoded = base64UrlEncode(JSON.stringify(payload));
      const link = `${window.location.origin}/blueprint?data=${encodeURIComponent(encoded)}`;

      setShareLink(link);
      setShareModalOpen(true);
      setFeedbackTone('success');
    } catch (error) {
      logger.error('share_blueprint', error);
      setFeedbackTone('warning');
      setFeedback(getErrorMessage(error, 'Could not create a share link. Please try again.'));
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setFeedbackTone('success');
      setFeedback('Share link copied. Send it to your team/founders.');
    } catch {
      setFeedbackTone('warning');
      setFeedback('Copy failed. Please manually copy the link.');
    }
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    deleteStoredWorkspaceTemplate(templateId);
    setCustomTemplates(getStoredWorkspaceTemplates());
    setFeedbackTone('success');
    setFeedback('Custom template deleted from your local marketplace.');
  };

  return (
    <div className="app-shell flex h-screen bg-background text-foreground overflow-hidden selection:bg-accent/20 selection:text-accent transition-colors duration-300">
      <Seo title="Templates | Explorer" robots="noindex,nofollow" canonicalPath="/templates" />
      <Grain />
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-sky-400/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar
        currentFolderId={null}
        onFolderSelect={handleFolderSelect}
        onAddFolder={() => navigate('/explorer')}
        onAddApp={() => navigate('/explorer')}
        folderTreeSyncKey={folderTreeSyncKey}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background/40 border-l border-border backdrop-blur-3xl">
        <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="max-w-[1320px] mx-auto space-y-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.22em] font-black text-accent mb-4">
                  <Sparkles size={12} />
                  Professional Ecosystems
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Install a real operating system for your profession</h1>
                <p className="text-sm md:text-base text-muted mt-3 max-w-3xl leading-relaxed">
                  Curated workspace systems for builders, creators, operators, and specialists, plus reusable templates saved from your own live setup.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  className="h-12 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto sm:px-6"
                  loading={isSavingCurrentWorkspace}
                  onClick={handleSaveCurrentWorkspace}
                >
                  Save Current Workspace
                </Button>
              <Button
                variant="secondary"
                className="h-12 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto sm:px-6"
                loading={isCreatingShare}
                onClick={handleShareBlueprint}
              >
                <Share2 size={16} className="mr-1" />
                Share Blueprint
              </Button>
                <Button variant="outline" className="h-12 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto sm:px-6" onClick={() => navigate('/dashboard')}>
                  Back To Dashboard
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full sm:min-w-[280px] sm:max-w-xl sm:flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by profession, tool, or workflow..."
                  className="h-11 w-full rounded-2xl border border-border bg-card/70 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted focus:border-accent/30 focus:ring-4 focus:ring-accent/10"
                />
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-card/70 px-3 py-2 text-[10px] uppercase tracking-widest font-black text-muted">
                <Filter size={12} />
                Filter
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] uppercase tracking-widest font-black transition-all ${
                      activeFilter === filter.id
                        ? 'border-accent/20 bg-accent/10 text-accent'
                        : 'border-border bg-card/70 text-muted hover:text-foreground hover:bg-card-hover'
                    }`}
                  >
                    <filter.icon size={14} />
                    {filter.id === 'custom' ? `${filter.label} (${customTemplateCount})` : filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-border bg-card/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Curated systems</p>
                <p className="mt-2 text-2xl font-black text-foreground">{CURATED_WORKSPACE_TEMPLATES.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-card/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Visible results</p>
                <p className="mt-2 text-2xl font-black text-foreground">{filteredTemplates.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-card/60 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">My templates</p>
                <p className="mt-2 text-sm font-bold text-foreground">
                  {customTemplateCount > 0
                    ? `${customTemplateCount} reusable workspace ${customTemplateCount === 1 ? 'snapshot' : 'snapshots'} saved locally`
                    : 'Save your current workspace to create reusable personal templates'}
                </p>
              </div>
            </div>

            {feedback && (
              <div
                className={`flex items-start gap-3 rounded-3xl border p-4 ${
                  feedbackTone === 'success'
                    ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                    : 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                }`}
              >
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">{feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                (() => {
                  const TemplateIcon = template.icon ?? Rocket;
                  return (
                <SpotlightCard key={template.id} className="border-border bg-card p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-premium sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${template.accent} border border-border flex items-center justify-center mb-5`}>
                        <TemplateIcon size={22} className="text-accent" />
                      </div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight">{template.title}</h2>
                      <p className="text-sm text-muted mt-3 leading-relaxed max-w-xl">{template.subtitle}</p>
                    </div>
                    <div className="min-w-0 rounded-2xl border border-border bg-background/60 px-4 py-3 lg:min-w-[220px]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Best For</p>
                      <p className="text-sm font-bold text-foreground mt-2">{template.audience}</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {template.template.folders.map((folder) => (
                      <div key={folder.name} className="rounded-[1.25rem] border border-border bg-background/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-foreground">{folder.name}</p>
                          <span className="text-[10px] uppercase tracking-widest text-muted font-black">{folder.apps.length} apps</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {folder.apps.map((app) => (
                            <div key={app.name} className="flex items-center justify-between rounded-xl bg-card/70 px-3 py-2">
                              <span className="text-sm text-foreground font-medium">{app.name}</span>
                              <span className="text-[10px] uppercase tracking-widest text-muted font-black">ready</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      className="h-12 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto sm:px-6"
                      loading={activeTemplateId === template.id}
                      onClick={() => handleInstall(template.id)}
                    >
                      Install {template.title}
                    </Button>
                    {template.source === 'custom' ? (
                      <Button
                        variant="ghost"
                        className="h-12 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto sm:px-6"
                        onClick={() => handleDeleteCustomTemplate(template.id)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete Template
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="h-12 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto sm:px-6"
                        onClick={() => navigate('/explorer')}
                      >
                        Explore Manually
                      </Button>
                    )}
                  </div>
                </SpotlightCard>
                  );
                })()
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-border bg-card/40 p-10 text-center">
                <p className="text-lg font-black text-foreground">
                  {activeFilter === 'custom' ? 'No personal templates saved yet.' : 'No ecosystem matched that search.'}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {activeFilter === 'custom'
                    ? 'My Templates stores workspace snapshots you save from your own live setup. Use "Save Current Workspace" to create reusable operating systems for yourself or your team.'
                    : 'Try a profession like "developer", "teacher", "founder", or a tool like "Figma" or "Supabase".'}
                </p>
                {activeFilter === 'custom' && (
                  <div className="mt-5 flex justify-center">
                    <Button
                      className="h-11 rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black"
                      loading={isSavingCurrentWorkspace}
                      onClick={handleSaveCurrentWorkspace}
                    >
                      Save Current Workspace
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {shareModalOpen && shareLink && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-3 pt-4 sm:p-6 sm:pt-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setShareModalOpen(false)}
          />

          <div className="relative my-auto w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[2.5rem] border border-border bg-card/95 p-5 shadow-premium backdrop-blur-2xl custom-scrollbar sm:max-h-[calc(100vh-4rem)] sm:p-7">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-border flex items-center justify-center">
                  <Share2 size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-black text-foreground tracking-tight text-lg sm:text-xl">Share your blueprint</h3>
                  <p className="text-sm text-muted mt-1">Anyone with this link can preview and install into their workspace.</p>
                </div>
              </div>

              <button
                onClick={() => setShareModalOpen(false)}
                className="p-2 text-muted hover:text-foreground hover:bg-card-hover hover:rotate-90 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-accent/10"
                aria-label="Close Share Modal"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-background/50 p-4 mb-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-muted mb-2">Blueprint link</p>
              <div className="rounded-2xl border border-border bg-background px-4 py-3">
                <p className="break-all text-xs font-mono text-foreground">{sharePreview}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">
                  The full secure import link is longer because it carries the workspace blueprint data inside the URL. Use Copy Link to share it cleanly.
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-10 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:w-auto"
                  variant="outline"
                  onClick={handleCopyShareLink}
                  icon={Copy}
                >
                  Copy Link
                </Button>
                <Button
                  className="h-10 w-full rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black sm:flex-1"
                  onClick={() => {
                    window.open(shareLink, '_blank', 'noopener,noreferrer');
                  }}
                >
                  Preview
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <CheckCircle2 size={14} className="text-accent" />
              Tip: Share this with founders/operators—this is your “one-click setup win”.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
