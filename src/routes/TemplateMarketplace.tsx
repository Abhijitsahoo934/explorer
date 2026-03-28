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
import { Briefcase, CheckCircle2, Code2, Filter, Rocket, Sparkles, BookmarkPlus, Trash2, Share2, Copy, X } from 'lucide-react';
import { trackFunnelEvent } from '../lib/analyticsService';

const FILTERS = [
  { id: 'all', label: 'All Templates', icon: Sparkles },
  { id: 'founders', label: 'Founders', icon: Rocket },
  { id: 'builders', label: 'Builders', icon: Code2 },
  { id: 'operators', label: 'Operators', icon: Briefcase },
  { id: 'custom', label: 'My Templates', icon: BookmarkPlus },
] as const;

export default function TemplateMarketplace() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState(getStoredWorkspaceTemplates());
  const [isSavingCurrentWorkspace, setIsSavingCurrentWorkspace] = useState(false);

  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  useEffect(() => {
    setCustomTemplates(getStoredWorkspaceTemplates());
  }, []);

  const templates = useMemo(
    () => [...customTemplates, ...CURATED_WORKSPACE_TEMPLATES],
    [customTemplates]
  );

  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'all') return templates;
    return templates.filter((template) => template.category === activeFilter);
  }, [activeFilter, templates]);

  const handleFolderSelect = (folderId: string | null) => {
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
      setFeedback(`${selectedTemplate.title} installed successfully. Your workspace is ready to explore.`);
    } catch (error) {
      console.error('Template marketplace install failed:', error);
      setFeedback('Template installation failed. Please try again.');
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
      setFeedback(`${nextTemplate.title} saved. You now have a reusable template based on your own workspace.`);
    } catch (error) {
      console.error('Save current workspace failed:', error);
      setFeedback('We could not save the current workspace as a template. Please try again.');
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
    } catch (error) {
      console.error('Share blueprint failed:', error);
      setFeedback('Could not create a share link. Please try again.');
    } finally {
      setIsCreatingShare(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setFeedback('Share link copied. Send it to your team/founders.');
    } catch {
      setFeedback('Copy failed. Please manually copy the link.');
    }
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    deleteStoredWorkspaceTemplate(templateId);
    setCustomTemplates(getStoredWorkspaceTemplates());
    setFeedback('Custom template deleted from your local marketplace.');
  };

  return (
    <div className="app-shell flex h-screen bg-background text-foreground overflow-hidden selection:bg-accent/20 selection:text-accent transition-colors duration-300">
      <Grain />
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-sky-400/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar
        currentFolderId={null}
        onFolderSelect={handleFolderSelect}
        onAddFolder={() => navigate('/explorer')}
        onAddApp={() => navigate('/explorer')}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background/40 border-l border-border backdrop-blur-3xl">
        <Topbar />

        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1320px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.22em] font-black text-accent mb-4">
                  <Sparkles size={12} />
                  Template Marketplace
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Install or create a category-defining workspace</h1>
                <p className="text-sm md:text-base text-muted mt-3 max-w-3xl leading-relaxed">
                  Curated operating systems for founders, builders, and operators, plus reusable templates saved from your own live workspace.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                  loading={isSavingCurrentWorkspace}
                  onClick={handleSaveCurrentWorkspace}
                >
                  Save Current Workspace
                </Button>
              <Button
                variant="secondary"
                className="h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                loading={isCreatingShare}
                onClick={handleShareBlueprint}
              >
                <Share2 size={16} className="mr-1" />
                Share Blueprint
              </Button>
                <Button variant="outline" className="h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black" onClick={() => navigate('/dashboard')}>
                  Back To Dashboard
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/70 text-[10px] uppercase tracking-widest font-black text-muted">
                <Filter size={12} />
                Filter
              </div>
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] uppercase tracking-widest font-black transition-all ${
                    activeFilter === filter.id
                      ? 'border-accent/20 bg-accent/10 text-accent'
                      : 'border-border bg-card/70 text-muted hover:text-foreground hover:bg-card-hover'
                  }`}
                >
                  <filter.icon size={14} />
                  {filter.label}
                </button>
              ))}
            </div>

            {feedback && (
              <div className="flex items-start gap-3 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">{feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredTemplates.map((template) => (
                <SpotlightCard key={template.id} className="p-7 bg-card border-border backdrop-blur-md hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-premium">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div>
                      <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${template.accent} border border-border flex items-center justify-center mb-5`}>
                        <template.icon size={22} className="text-accent" />
                      </div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight">{template.title}</h2>
                      <p className="text-sm text-muted mt-3 leading-relaxed max-w-xl">{template.subtitle}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 min-w-[220px]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Best For</p>
                      <p className="text-sm font-bold text-foreground mt-2">{template.audience}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-8">
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

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                      loading={activeTemplateId === template.id}
                      onClick={() => handleInstall(template.id)}
                    >
                      Install {template.title}
                    </Button>
                    {template.source === 'custom' ? (
                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                        onClick={() => handleDeleteCustomTemplate(template.id)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete Template
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                        onClick={() => navigate('/explorer')}
                      >
                        Explore Manually
                      </Button>
                    )}
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>
      </main>

      {shareModalOpen && shareLink && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setShareModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-card/95 border border-border rounded-[2.5rem] p-7 shadow-premium backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-border flex items-center justify-center">
                  <Share2 size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-black text-foreground tracking-tight text-xl">Share your blueprint</h3>
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
              <textarea
                readOnly
                value={shareLink}
                className="w-full min-h-[84px] resize-y bg-background border border-border rounded-2xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none"
              />
              <div className="flex gap-3 mt-3">
                <Button
                  className="h-10 px-5 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                  variant="outline"
                  onClick={handleCopyShareLink}
                  icon={Copy}
                >
                  Copy Link
                </Button>
                <Button
                  className="h-10 px-5 rounded-2xl text-[11px] uppercase tracking-widest font-black flex-1"
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
