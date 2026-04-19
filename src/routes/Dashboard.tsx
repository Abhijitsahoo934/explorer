import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { explorerService } from '../lib/explorerService';
import { WORKSPACE_TEMPLATES } from '../lib/workspaceTemplates';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { Grain } from '../components/ui/Grain';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { Button } from '../components/ui/Button';
import { AddFolderModal } from '../components/explorer/AddFolderModal';
import { AddAppModal } from '../components/explorer/AddAppModal';
import { Activity, Folder, Globe, ArrowRight, Zap, ExternalLink, Clock, Sunrise, Sun, Moon, Plus, CheckCircle2, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { App } from '../types/explorer';
import { trackFunnelEvent } from '../lib/analyticsService';
import { recordAppUsage, recordFolderUsage } from '../lib/contextEngine';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { getSafeLocalStorage, readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';
import { buildFaviconUrl, openExternalUrl } from '../platform/security/url';
import { getErrorMessage } from '../lib/errorMessage';
import { logger } from '../platform/observability/logger';
import { useAuth } from '../hooks/useAuth';
import { getUserFirstName } from '../lib/authProfile';
import { Seo } from '../components/system/Seo';
import { isFounderUser } from '../lib/accessControl';
import type { WorkspaceTemplateDefinition } from '../lib/workspaceTemplates';

const ONBOARDING_STORAGE_KEY = STORAGE_KEYS.onboardingDismissed;
const safeLocalStorage = getSafeLocalStorage();
const MOTION_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MOTION_SPRING_PANEL = { type: 'spring' as const, stiffness: 280, damping: 24 };
const MOTION_SPRING_CARD = { type: 'spring' as const, stiffness: 240, damping: 26 };
const MOTION_STAGGER = { staggerChildren: 0.09, delayChildren: 0.08 };

const safeScrollToTop = (element: HTMLElement) => {
  try {
    element.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    element.scrollTop = 0;
  }
};

const safeScrollTemplateIntoView = (element: HTMLElement) => {
  try {
    element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  } catch {
    element.scrollIntoView();
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewInsights = isFounderUser(user);
  const [stats, setStats] = useState({ folders: 0, apps: 0 });
  const [recentApps, setRecentApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState({ text: 'Welcome back', icon: Sun });
  const [folderTreeSyncKey, setFolderTreeSyncKey] = useState(0);

  // Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [templateFeedback, setTemplateFeedback] = useState<string | null>(null);
  const [templateFeedbackTone, setTemplateFeedbackTone] = useState<'success' | 'warning'>('success');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(WORKSPACE_TEMPLATES[0]?.id ?? '');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const onboardingDialogRef = useRef<HTMLDivElement | null>(null);
  const onboardingCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Determine time of day for personalized greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: 'Good morning', icon: Sunrise });
    else if (hour < 18) setGreeting({ text: 'Good afternoon', icon: Sun });
    else setGreeting({ text: 'Good evening', icon: Moon });
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [folders, allApps] = await Promise.all([
        explorerService.getFolders(),
        explorerService.getAllApps(),
      ]);

      setStats({
        folders: folders.length,
        apps: allApps.length,
      });
      setRecentApps(
        [...allApps]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
      );
      setFolderTreeSyncKey((value) => value + 1);
    } catch (error) {
      logger.error('dashboard_fetch', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const isDismissed = safeLocalStorage ? readStorageValue(safeLocalStorage, ONBOARDING_STORAGE_KEY) === 'true' : false;
    const isWorkspaceEmpty = !loading && stats.folders === 0 && stats.apps === 0;

    if (isWorkspaceEmpty && !isDismissed && WORKSPACE_TEMPLATES.length > 0) {
      setIsOnboardingOpen(true);
    }
  }, [loading, stats.folders, stats.apps]);

  useEffect(() => {
    if (!isOnboardingOpen) {
      if (lastActiveElementRef.current) {
        lastActiveElementRef.current.focus();
      }
      return;
    }

    const previousOverflow = document.body.style.overflow;

    lastActiveElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      onboardingCloseButtonRef.current?.focus();
    }, 40);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOnboardingOpen]);

  const handleFolderSelect = (folderId: string | null) => {
    setMobileSidebarOpen(false);
    if (folderId) {
      recordFolderUsage(folderId);
      navigate(`/explorer?folder=${encodeURIComponent(folderId)}`);
      return;
    }
    navigate('/explorer');
  };

  const getFavicon = (url: string) => buildFaviconUrl(url, 64);

  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: MOTION_STAGGER,
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ...MOTION_SPRING_CARD } }
  };

  const handleTemplateLaunch = async (templateId: string) => {
    const selectedTemplate = WORKSPACE_TEMPLATES.find((template) => template.id === templateId);
    if (!selectedTemplate) {
      return false;
    }

    setActiveTemplateId(templateId);
    setTemplateFeedback(null);

    try {
      await explorerService.seedWorkspaceTemplate(selectedTemplate.template);
      trackFunnelEvent('template_installed', { template_id: templateId, source: 'dashboard' });
      await fetchDashboardData();
      setTemplateFeedbackTone('success');
      setTemplateFeedback(`${selectedTemplate.title} installed. Your workspace now starts with a real operating setup.`);
      return true;
    } catch (error) {
      logger.error('template_launch', error, { templateId });
      setTemplateFeedbackTone('warning');
      setTemplateFeedback(getErrorMessage(error, 'Template setup failed. Please try again.'));
      return false;
    } finally {
      setActiveTemplateId(null);
    }
  };

  const handleDismissOnboarding = () => {
    if (safeLocalStorage) {
      writeStorageValue(safeLocalStorage, ONBOARDING_STORAGE_KEY, 'true');
    }
    setIsOnboardingOpen(false);
  };

  const selectedTemplateIndex = Math.max(
    0,
    WORKSPACE_TEMPLATES.findIndex((template) => template.id === selectedTemplateId)
  );

  const moveTemplateSelection = (direction: 1 | -1) => {
    if (WORKSPACE_TEMPLATES.length === 0) {
      return;
    }

    const nextIndex = (selectedTemplateIndex + direction + WORKSPACE_TEMPLATES.length) % WORKSPACE_TEMPLATES.length;
    setSelectedTemplateId(WORKSPACE_TEMPLATES[nextIndex].id);
  };

  useEffect(() => {
    if (!isOnboardingOpen) {
      return;
    }

    if (WORKSPACE_TEMPLATES.length === 0) {
      return;
    }

    const handleKeyboardControls = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleDismissOnboarding();
        return;
      }

      if (event.key === 'Tab') {
        const dialogRoot = onboardingDialogRef.current;
        if (!dialogRoot) {
          return;
        }

        const focusableElements = dialogRoot.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) {
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (selectedTemplateIndex + 1) % WORKSPACE_TEMPLATES.length;
        setSelectedTemplateId(WORKSPACE_TEMPLATES[nextIndex].id);
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const previousIndex = (selectedTemplateIndex - 1 + WORKSPACE_TEMPLATES.length) % WORKSPACE_TEMPLATES.length;
        setSelectedTemplateId(WORKSPACE_TEMPLATES[previousIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyboardControls);
    return () => {
      window.removeEventListener('keydown', handleKeyboardControls);
    };
  }, [isOnboardingOpen, selectedTemplateIndex]);

  useEffect(() => {
    if (!isOnboardingOpen) {
      return;
    }

    const detailsPanel = document.getElementById('onboarding-template-details');
    if (!detailsPanel) {
      return;
    }

    safeScrollToTop(detailsPanel);
  }, [isOnboardingOpen, selectedTemplateId]);

  useEffect(() => {
    if (!isOnboardingOpen) {
      return;
    }

    const selectedTemplateCard = document.getElementById(`onboarding-template-option-${selectedTemplateId}`);
    if (!selectedTemplateCard) {
      return;
    }

    safeScrollTemplateIntoView(selectedTemplateCard);
  }, [isOnboardingOpen, selectedTemplateId]);

  const fallbackTemplate: WorkspaceTemplateDefinition = {
    id: 'fallback-starter-workspace',
    title: 'Starter Workspace',
    subtitle: 'Templates are loading. You can continue with an empty workspace for now.',
    icon: Sparkles,
    accent: 'from-sky-500/20 to-indigo-500/10',
    category: 'specialized',
    audience: 'Default workspace',
    template: {
      name: 'Starter Workspace',
      folders: [],
    },
    source: 'curated',
  };

  const selectedTemplate =
    WORKSPACE_TEMPLATES.find((template) => template.id === selectedTemplateId) ??
    WORKSPACE_TEMPLATES[0] ??
    fallbackTemplate;
  const selectedTemplateFolderCount = selectedTemplate.template.folders.length;
  const selectedTemplateAppCount = selectedTemplate.template.folders.reduce(
    (total, folder) => total + folder.apps.length,
    0
  );
  const onboardingProgress = WORKSPACE_TEMPLATES.length > 0
    ? ((selectedTemplateIndex + 1) / WORKSPACE_TEMPLATES.length) * 100
    : 0;
  const userName = getUserFirstName(user);
  const featuredTemplates = useMemo(() => WORKSPACE_TEMPLATES.slice(0, 3), []);

  return (
    <div className="app-shell flex h-screen bg-background text-foreground overflow-hidden selection:bg-accent/20 selection:text-accent transition-colors duration-300">
      <Seo title="Dashboard | Explorer" robots="noindex,nofollow" canonicalPath="/dashboard" />
      <Grain />
      
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* SIDEBAR */}
      <Sidebar 
        currentFolderId={null}
        onFolderSelect={handleFolderSelect}
        onAddFolder={() => setIsFolderModalOpen(true)} 
        onAddApp={() => setIsAppModalOpen(true)}
        folderTreeSyncKey={folderTreeSyncKey}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden bg-background/40 border-l border-border backdrop-blur-3xl">
        {/* TOPBAR */}
        <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

        <div className="relative flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="max-w-300 mx-auto">
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-[60vh] flex flex-col items-center justify-center gap-6"
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-2xl border-2 border-border border-t-accent animate-spin" />
                    <div className="absolute inset-2 rounded-xl bg-accent/10 animate-pulse" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-muted animate-pulse">Opening workspace...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-12"
                >
                  
                  {/* GREETING SECTION */}
                  <motion.div variants={itemVariants} className="relative mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4 border border-accent/20">
                      <greeting.icon size={12} strokeWidth={3} />
                      {greeting.text}
                    </div>
                    <h1 className="mb-3 max-w-full pb-1 text-3xl font-black leading-[1.02] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                      Hello, <span className="inline-block wrap-break-word capitalize text-accent">{userName}</span>
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium tracking-wide max-w-xl">
                      Your workspace is ready. Here is a quick overview of what is already in place.
                    </p>
                  </motion.div>

                  {/* STATS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <motion.div variants={itemVariants}>
                      <SpotlightCard className="p-7 bg-card border-border h-full backdrop-blur-md hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-premium group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground shadow-sm group-hover:scale-110 group-hover:bg-accent/5 transition-all">
                            <Folder size={20} className="text-muted group-hover:text-accent transition-colors" />
                          </div>
                          <Activity size={18} className="text-muted/50" />
                        </div>
                        <h3 className="text-5xl font-black text-foreground mb-2 tracking-tight">{stats.folders}</h3>
                        <p className="text-[11px] uppercase tracking-widest text-muted font-bold">Folders</p>
                      </SpotlightCard>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <SpotlightCard className="p-7 bg-card border-border h-full backdrop-blur-md hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-premium group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-foreground shadow-sm group-hover:scale-110 group-hover:bg-accent/5 transition-all">
                            <Globe size={20} className="text-muted group-hover:text-accent transition-colors" />
                          </div>
                          <Activity size={18} className="text-muted/50" />
                        </div>
                        <h3 className="text-5xl font-black text-foreground mb-2 tracking-tight">{stats.apps}</h3>
                        <p className="text-[11px] uppercase tracking-widest text-muted font-bold">Apps</p>
                      </SpotlightCard>
                    </motion.div>

                    <motion.div variants={itemVariants} className="h-full">
                      <SpotlightCard 
                        className="p-7 bg-linear-to-br from-card to-background border-border h-full backdrop-blur-md flex flex-col justify-center items-center text-center cursor-pointer hover:border-accent/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group" 
                        onClick={() => navigate('/explorer')}
                      >
                        <div className="w-16 h-16 rounded-3xl bg-foreground text-background flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent group-hover:rounded-2xl transition-all duration-500 shadow-md relative overflow-hidden">
                          <Zap size={28} className="fill-current relative z-10" />
                          <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-base font-black text-foreground mb-1 group-hover:text-accent transition-colors">Open Explorer</h3>
                        <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Go to the workspace</p>
                      </SpotlightCard>
                    </motion.div>
                  </div>

                  <motion.section variants={itemVariants} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.22em] font-black text-accent mb-4">
                          <Sparkles size={12} />
                          Starter templates
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Install a workspace that already makes sense</h2>
                        <p className="text-sm md:text-base text-muted mt-3 max-w-2xl leading-relaxed">
                          Start from a usable setup instead of an empty shell. The first run should already feel organized.
                        </p>
                      </div>
                      <Button variant="outline" className="h-11 px-5 rounded-2xl text-[11px] uppercase tracking-widest font-black" onClick={() => navigate('/explorer')}>
                        Open Explorer
                      </Button>
                    </div>

                    {templateFeedback && (
                      <div
                        className={`flex items-start gap-3 rounded-3xl border p-4 ${
                          templateFeedbackTone === 'success'
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                            : 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <p className="text-sm font-medium leading-relaxed">{templateFeedback}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                      {canViewInsights && (
                        <Button
                          variant="ghost"
                          className="h-10 w-full rounded-2xl px-4 text-[11px] uppercase tracking-widest font-black sm:w-auto"
                          onClick={() => navigate('/insights')}
                        >
                          Product insights
                        </Button>
                      )}
                      <Button variant="ghost" className="h-10 w-full rounded-2xl px-4 text-[11px] uppercase tracking-widest font-black sm:w-auto" onClick={() => navigate('/templates')}>
                        Browse Template Marketplace
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                      {featuredTemplates.map((template) => (
                        <SpotlightCard key={template.id} className="p-6 bg-card border-border h-full backdrop-blur-md hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-premium group">
                          <div className={`w-14 h-14 rounded-[1.25rem] bg-linear-to-br ${template.accent} border border-border flex items-center justify-center mb-5`}>
                            <template.icon size={22} className="text-accent" />
                          </div>
                          <h3 className="text-xl font-black text-foreground tracking-tight">{template.title}</h3>
                          <p className="text-sm text-muted mt-3 leading-relaxed min-h-16.5">{template.subtitle}</p>
                          <div className="mt-5 space-y-2">
                            {template.template.folders.map((folder) => (
                              <div key={folder.name} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-3 py-2">
                                <span className="text-sm font-bold text-foreground">{folder.name}</span>
                                <span className="text-[10px] uppercase tracking-widest text-muted font-black">
                                  {folder.apps.length} apps
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button
                            className="w-full mt-6 rounded-2xl h-12 text-[11px] uppercase tracking-widest font-black"
                            loading={activeTemplateId === template.id}
                            onClick={() => handleTemplateLaunch(template.id)}
                          >
                            Install {template.title}
                          </Button>
                        </SpotlightCard>
                      ))}
                    </div>

                    <div className="rounded-[1.75rem] border border-border bg-card/55 p-5 backdrop-blur-xl sm:p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted font-black">Need a different setup?</p>
                          <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">The full marketplace has role-specific systems.</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                            Browse all curated ecosystems, or save your current workspace later to build reusable templates from your own setup.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="h-11 rounded-2xl px-5 text-[11px] uppercase tracking-widest font-black"
                          onClick={() => navigate('/templates')}
                        >
                          Explore all templates
                        </Button>
                      </div>
                    </div>
                  </motion.section>

                  {/* RECENTLY ADDED */}
                  <motion.div variants={itemVariants} className="pt-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[11px] font-black tracking-widest uppercase text-muted flex items-center gap-2">
                        <Clock size={14} className="text-accent" /> Recently Added
                      </h2>
                      {recentApps.length > 0 && (
                        <button 
                          onClick={() => navigate('/explorer')}
                          className="text-[10px] uppercase tracking-widest font-black text-muted hover:text-foreground flex items-center gap-1.5 transition-colors group px-3 py-1.5 rounded-lg hover:bg-card-hover"
                        >
                          View All <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>

                    {recentApps.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {recentApps.map((site, idx) => (
                          <motion.div
                            key={site.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...MOTION_SPRING_CARD, delay: 0.14 + (idx * 0.07) }}
                          >
                            <SpotlightCard className="p-5 bg-card border-border hover:bg-card hover:border-accent/30 transition-all duration-300 flex flex-col h-full group hover:shadow-premium hover:-translate-y-1 cursor-pointer">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center overflow-hidden border border-border shadow-sm group-hover:scale-105 group-hover:border-accent/30 transition-all">
                                  {getFavicon(site.url) ? (
                                    <img src={getFavicon(site.url) ?? undefined} alt="" className="w-6 h-6 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                  ) : (
                                    <Globe size={18} className="text-muted group-hover:text-accent" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">{site.name}</h3>
                                  <p className="text-[10px] text-muted truncate font-medium mt-0.5">{new Date(site.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  recordAppUsage(site.id);
                                  void explorerService.recordAppOpened(site.id);
                                  openExternalUrl(site.url);
                                }}
                                className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-muted group-hover:text-foreground transition-colors cursor-pointer"
                              >
                                Access URL <ExternalLink size={12} className="group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                              </button>
                            </SpotlightCard>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...MOTION_SPRING_CARD }}
                        className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-card/30 flex flex-col items-center justify-center gap-4 hover:bg-card/50 hover:border-accent/30 transition-colors group cursor-pointer"
                        onClick={() => setIsAppModalOpen(true)}
                      >
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                          <Plus size={24} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">Workspace is empty</p>
                          <p className="text-xs text-muted font-medium mt-1 max-w-sm mx-auto">Add your first application or folder to start organizing your workflow.</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>
      </main>

      {/* MODALS */}
      <AddFolderModal 
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSuccess={fetchDashboardData}
        parentId={null}
      />

      <AddAppModal 
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSuccess={fetchDashboardData}
        folderId={null}
      />

      <AnimatePresence>
        {isOnboardingOpen && (
          <div className="fixed inset-0 z-170">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: MOTION_EASE_OUT }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={handleDismissOnboarding}
            />

            <div className="relative flex min-h-dvh items-start justify-center overflow-y-auto overscroll-contain p-2 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-4 sm:pt-6 md:p-6 md:pt-10">
              <motion.div
                ref={onboardingDialogRef}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={MOTION_SPRING_PANEL}
                className="relative my-auto flex w-full max-w-5xl max-h-[calc(100dvh-0.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-premium backdrop-blur-3xl sm:max-h-[min(92vh,860px)] sm:rounded-4xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="onboarding-modal-title"
                aria-describedby="onboarding-modal-description"
              >
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1.5 bg-background/70">
                <motion.div
                  className="h-full bg-linear-to-r from-accent/70 via-accent to-sky-400/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(6, onboardingProgress)}%` }}
                  transition={{ ...MOTION_SPRING_CARD }}
                />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-16 left-20 w-56 h-56 rounded-full bg-accent/15 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-sky-400/10 blur-[140px]" />
              </div>

              <div className="relative z-10 border-b border-border px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                    <Sparkles size={12} />
                    Guided Setup
                  </div>
                  <button
                    ref={onboardingCloseButtonRef}
                    onClick={handleDismissOnboarding}
                    className="shrink-0 rounded-xl p-2.5 text-muted transition-all hover:bg-card-hover hover:text-foreground"
                    aria-label="Close onboarding"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">
                    Template {selectedTemplateIndex + 1} of {WORKSPACE_TEMPLATES.length}
                  </p>
                  <h2 id="onboarding-modal-title" className="mt-2 text-2xl leading-[1.05] font-black tracking-tight text-foreground sm:text-3xl">
                    Choose your starter template
                  </h2>
                  <p id="onboarding-modal-description" className="mt-2 hidden max-w-2xl text-sm leading-relaxed text-muted sm:block">
                    Pick the setup closest to your role, then install it in one tap.
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-wide text-muted/80 sm:hidden">
                    Swipe templates, preview details, then tap install.
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-6 md:p-8 custom-scrollbar overscroll-contain">
                <div className="flex flex-col gap-2.5 sm:gap-3 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
                <div className="relative min-h-0 max-h-[15vh] overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/45 p-2 shadow-sm sm:max-h-[22vh] lg:max-h-[60vh]">
                  <div className="mb-2 flex items-center justify-between gap-2 px-1">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">Choose a setup</p>
                      <p className="mt-1 text-[10px] font-semibold text-muted/70 sm:hidden">Swipe or use arrows below</p>
                    </div>
                    <span className="rounded-full border border-border bg-background/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted shadow-sm">
                      {selectedTemplateIndex + 1}/{Math.max(WORKSPACE_TEMPLATES.length, 1)}
                    </span>
                  </div>
                  <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-1">
                    <button
                      type="button"
                      onClick={() => moveTemplateSelection(-1)}
                      className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background/90 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-muted shadow-sm transition-all hover:bg-card-hover hover:text-foreground hover:shadow-md active:scale-95"
                      aria-label="Previous template"
                    >
                      <ChevronLeft size={15} />
                      <span className="hidden sm:inline">Prev</span>
                    </button>
                    <div className="h-1.5 w-18 overflow-hidden rounded-full bg-border/60 sm:w-22">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-r from-accent to-sky-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(6, onboardingProgress)}%` }}
                        transition={{ ...MOTION_SPRING_CARD }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => moveTemplateSelection(1)}
                      className="inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background/90 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-muted shadow-sm transition-all hover:bg-card-hover hover:text-foreground hover:shadow-md active:scale-95"
                      aria-label="Next template"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                  <div className="flex h-full snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden px-1 pb-1.5 custom-scrollbar overscroll-contain touch-pan-x lg:block lg:space-y-3 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1 lg:touch-auto">
                    {WORKSPACE_TEMPLATES.map((template) => (
                      <button
                        id={`onboarding-template-option-${template.id}`}
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        aria-pressed={selectedTemplateId === template.id}
                        className={`w-full h-20 text-left rounded-[1.125rem] sm:rounded-3xl border px-3 py-2.5 sm:px-4 sm:py-3 transition-all shadow-[0_1px_0_rgba(255,255,255,0.35)_inset] ${
                          selectedTemplateId === template.id
                            ? 'border-accent/35 bg-accent/12 shadow-sm ring-1 ring-accent/25'
                            : 'border-border bg-background/60 hover:bg-card-hover'
                        } min-w-[76vw] max-w-[76vw] snap-start sm:min-w-75 sm:max-w-none lg:min-w-0`}
                      >
                        <div className="flex h-full items-center gap-3">
                          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-br ${template.accent} border border-border flex items-center justify-center`}>
                            <template.icon size={15} className="text-accent sm:w-4.5 sm:h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-foreground truncate">{template.title}</p>
                              {selectedTemplateId === template.id && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
                            </div>
                            <p className="text-xs text-muted mt-1 truncate">{template.template.folders.length} folders preloaded</p>
                            <p className="hidden sm:block text-[10px] uppercase tracking-widest font-black text-muted/80 mt-1 truncate">{template.audience}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-card/95 to-transparent lg:hidden" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-card/95 to-transparent lg:hidden" />
                </div>

                <SpotlightCard id="onboarding-template-details" className="relative flex-1 min-h-0 overflow-visible border-border bg-background/70 p-3 custom-scrollbar overscroll-contain md:p-5 lg:p-7">
                  <div className="flex flex-col">
                    <motion.div
                      key={selectedTemplate.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: MOTION_EASE_OUT }}
                    >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className={`w-12 h-12 rounded-[1.125rem] bg-linear-to-br ${selectedTemplate.accent} border border-border flex items-center justify-center mb-4`}>
                          <selectedTemplate.icon size={20} className="text-accent" />
                        </div>
                        <h3 className="text-lg font-black text-foreground tracking-tight sm:text-2xl">{selectedTemplate.title}</h3>
                        <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed">{selectedTemplate.subtitle}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full border border-border bg-card/75 px-2.5 py-1 text-[10px] uppercase tracking-widest font-black text-muted">
                            Audience: {selectedTemplate.audience}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border bg-card/75 px-2.5 py-1 text-[10px] uppercase tracking-widest font-black text-muted">
                            Category: {selectedTemplate.category}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 md:min-w-37.5">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Outcome</p>
                        <p className="text-sm font-bold text-foreground mt-2">Structured from day one</p>
                        <p className="text-xs text-muted mt-2">{selectedTemplateFolderCount} folders · {selectedTemplateAppCount} ready-to-use apps</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {selectedTemplate.template.folders.map((folder) => (
                        <div key={folder.name} className="rounded-[1.125rem] border border-border bg-card/70 p-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-foreground">{folder.name}</p>
                            <span className="text-[10px] uppercase tracking-widest text-muted font-black">{folder.apps.length} apps</span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {folder.apps.map((app) => (
                              <div key={app.name} className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2">
                                <span className="text-sm text-foreground font-medium">{app.name}</span>
                                <span className="text-[10px] uppercase tracking-widest text-muted font-black">ready</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    </motion.div>

                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-background/90 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background/95 to-transparent" />
                </SpotlightCard>
                </div>

                <div className="relative z-30 shrink-0 border-t border-border/80 bg-card/98 px-3 py-3.5 backdrop-blur-3xl sm:px-6 md:px-8 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg shadow-black/10">
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: MOTION_EASE_OUT }}
                    className="space-y-4"
                  >
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-black">Ready to install</p>
                      <p className="text-[11px] text-muted font-semibold mt-1">One tap setup. Customize after install.</p>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <Button
                        className="w-full h-12 rounded-2xl text-[11px] uppercase tracking-widest font-black bg-linear-to-r from-accent via-accent to-sky-500 hover:from-accent/90 hover:via-accent/90 hover:to-sky-500/90 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                        loading={activeTemplateId === selectedTemplate.id}
                        onClick={async () => {
                          const installed = await handleTemplateLaunch(selectedTemplate.id);
                          if (installed) {
                            if (safeLocalStorage) {
                              writeStorageValue(safeLocalStorage, ONBOARDING_STORAGE_KEY, 'true');
                            }
                            setIsOnboardingOpen(false);
                          }
                        }}
                      >
                        {activeTemplateId === selectedTemplate.id ? 'Installing...' : `Install ${selectedTemplate.title}`}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full h-12 rounded-2xl text-[11px] uppercase tracking-widest font-black hover:bg-card-hover active:scale-95"
                        onClick={handleDismissOnboarding}
                      >
                        I'll Set It Up Later
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
