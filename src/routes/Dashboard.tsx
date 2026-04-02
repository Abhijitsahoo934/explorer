import { useEffect, useState } from 'react';
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
import { Activity, Folder, Globe, ArrowRight, Zap, ExternalLink, Clock, Sunrise, Sun, Moon, Plus, CheckCircle2, Sparkles, X } from 'lucide-react';
import type { App } from '../types/explorer';
import { trackFunnelEvent } from '../lib/analyticsService';
import { recordAppUsage, recordFolderUsage } from '../lib/contextEngine';
import { STORAGE_KEYS } from '../platform/storage/keys';
import { readStorageValue, writeStorageValue } from '../platform/storage/browserStorage';
import { buildFaviconUrl, openExternalUrl } from '../platform/security/url';
import { getErrorMessage } from '../lib/errorMessage';
import { logger } from '../platform/observability/logger';
import { useAuth } from '../hooks/useAuth';
import { getUserFirstName } from '../lib/authProfile';
import { Seo } from '../components/system/Seo';

const ONBOARDING_STORAGE_KEY = STORAGE_KEYS.onboardingDismissed;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(WORKSPACE_TEMPLATES[0].id);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    const isDismissed = readStorageValue(localStorage, ONBOARDING_STORAGE_KEY) === 'true';
    const isWorkspaceEmpty = !loading && stats.folders === 0 && stats.apps === 0;

    if (isWorkspaceEmpty && !isDismissed) {
      setIsOnboardingOpen(true);
    }
  }, [loading, stats.folders, stats.apps]);

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
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleTemplateLaunch = async (templateId: string) => {
    const selectedTemplate = WORKSPACE_TEMPLATES.find((template) => template.id === templateId);
    if (!selectedTemplate) {
      return;
    }

    setActiveTemplateId(templateId);
    setTemplateFeedback(null);

    try {
      await explorerService.seedWorkspaceTemplate(selectedTemplate.template);
      trackFunnelEvent('template_installed', { template_id: templateId, source: 'dashboard' });
      await fetchDashboardData();
      setTemplateFeedbackTone('success');
      setTemplateFeedback(`${selectedTemplate.title} installed. Your workspace now starts with a real operating setup.`);
    } catch (error) {
      logger.error('template_launch', error, { templateId });
      setTemplateFeedbackTone('warning');
      setTemplateFeedback(getErrorMessage(error, 'Template setup failed. Please try again.'));
    } finally {
      setActiveTemplateId(null);
    }
  };

  const handleDismissOnboarding = () => {
    writeStorageValue(localStorage, ONBOARDING_STORAGE_KEY, 'true');
    setIsOnboardingOpen(false);
  };

  const selectedTemplate = WORKSPACE_TEMPLATES.find((template) => template.id === selectedTemplateId) ?? WORKSPACE_TEMPLATES[0];
  const userName = getUserFirstName(user);

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
          <div className="max-w-[1200px] mx-auto">
            
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
                  <p className="text-[10px] uppercase tracking-widest font-black text-muted animate-pulse">Initializing Workspace...</p>
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
                    <h1 className="mb-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                      Hello, <span className="text-accent capitalize bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-hover">{userName}</span>
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium tracking-wide max-w-xl">
                      Your digital vault is ready. Here's a quick overview of your workspace today.
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
                        <p className="text-[11px] uppercase tracking-widest text-muted font-bold">Active Folders</p>
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
                        <p className="text-[11px] uppercase tracking-widest text-muted font-bold">Saved Apps</p>
                      </SpotlightCard>
                    </motion.div>

                    <motion.div variants={itemVariants} className="h-full">
                      <SpotlightCard 
                        className="p-7 bg-gradient-to-br from-card to-background border-border h-full backdrop-blur-md flex flex-col justify-center items-center text-center cursor-pointer hover:border-accent/40 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group" 
                        onClick={() => navigate('/explorer')}
                      >
                        <div className="w-16 h-16 rounded-3xl bg-foreground text-background flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent group-hover:rounded-2xl transition-all duration-500 shadow-md relative overflow-hidden">
                          <Zap size={28} className="fill-current relative z-10" />
                          <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="text-base font-black text-foreground mb-1 group-hover:text-accent transition-colors">Launch Explorer</h3>
                        <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Deep dive into your vault</p>
                      </SpotlightCard>
                    </motion.div>
                  </div>

                  <motion.section variants={itemVariants} className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.22em] font-black text-accent mb-4">
                          <Sparkles size={12} />
                          Time To Wow
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Install a real workspace in one click</h2>
                        <p className="text-sm md:text-base text-muted mt-3 max-w-2xl leading-relaxed">
                          This is our unfair advantage path: users should not start from zero. They should feel the product become useful in under a minute.
                        </p>
                      </div>
                      <Button variant="outline" className="h-11 px-5 rounded-2xl text-[11px] uppercase tracking-widest font-black" onClick={() => navigate('/explorer')}>
                        Open Explorer
                      </Button>
                    </div>

                    {templateFeedback && (
                      <div
                        className={`flex items-start gap-3 rounded-[1.5rem] border p-4 ${
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
                      <Button
                        variant="ghost"
                        className="h-10 w-full rounded-2xl px-4 text-[11px] uppercase tracking-widest font-black sm:w-auto"
                        onClick={() => navigate('/insights')}
                      >
                        Product insights
                      </Button>
                      <Button variant="ghost" className="h-10 w-full rounded-2xl px-4 text-[11px] uppercase tracking-widest font-black sm:w-auto" onClick={() => navigate('/templates')}>
                        Browse Template Marketplace
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {WORKSPACE_TEMPLATES.map((template) => (
                        <SpotlightCard key={template.id} className="p-6 bg-card border-border h-full backdrop-blur-md hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-premium group">
                          <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${template.accent} border border-border flex items-center justify-center mb-5`}>
                            <template.icon size={22} className="text-accent" />
                          </div>
                          <h3 className="text-xl font-black text-foreground tracking-tight">{template.title}</h3>
                          <p className="text-sm text-muted mt-3 leading-relaxed min-h-[66px]">{template.subtitle}</p>
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
                  </motion.section>

                  {/* RECENTLY ADDED */}
                  <motion.div variants={itemVariants} className="pt-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-[11px] font-black tracking-widest uppercase text-muted flex items-center gap-2">
                        <Clock size={14} className="text-accent" /> Recently Indexed
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
                            transition={{ delay: 0.2 + (idx * 0.1), type: "spring" }}
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
                        className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-card/30 flex flex-col items-center justify-center gap-4 hover:bg-card/50 hover:border-accent/30 transition-colors group cursor-pointer"
                        onClick={() => setIsAppModalOpen(true)}
                      >
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
                          <Plus size={24} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">Vault is empty</p>
                          <p className="text-xs text-muted font-medium mt-1 max-w-sm mx-auto">Add your first application or folder to start organizing your digital workflow.</p>
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
          <div className="fixed inset-0 z-[170] flex items-start justify-center overflow-y-auto p-4 pt-6 md:p-6 md:pt-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={handleDismissOnboarding}
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative my-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card/95 shadow-premium backdrop-blur-3xl"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-16 left-20 w-56 h-56 rounded-full bg-accent/15 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-sky-400/10 blur-[140px]" />
              </div>

              <div className="relative z-10 p-6 md:p-8 border-b border-border flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.22em] font-black text-accent mb-4">
                    <Sparkles size={12} />
                    Guided Setup
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Let’s build your workspace in 30 seconds</h2>
                  <p className="text-sm md:text-base text-muted mt-3 max-w-2xl leading-relaxed">
                    Pick the operating setup closest to your role. We will create a starter workspace that already feels useful, structured, and premium.
                  </p>
                </div>

                <button
                  onClick={handleDismissOnboarding}
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card-hover transition-all shrink-0"
                  aria-label="Close onboarding"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative z-10 max-h-[calc(100vh-12rem)] overflow-hidden p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 custom-scrollbar lg:max-h-[calc(100vh-18rem)]">
                  {WORKSPACE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`w-full text-left rounded-[1.5rem] border px-4 py-4 transition-all ${
                        selectedTemplateId === template.id
                          ? 'border-accent/25 bg-accent/10 shadow-sm'
                          : 'border-border bg-background/60 hover:bg-card-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${template.accent} border border-border flex items-center justify-center`}>
                          <template.icon size={18} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{template.title}</p>
                          <p className="text-xs text-muted mt-1">{template.template.folders.length} folders preloaded</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <SpotlightCard className="max-h-[60vh] overflow-y-auto border-border bg-background/70 p-6 custom-scrollbar md:max-h-[calc(100vh-18rem)] md:p-7">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                    <div>
                      <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${selectedTemplate.accent} border border-border flex items-center justify-center mb-5`}>
                        <selectedTemplate.icon size={22} className="text-accent" />
                      </div>
                      <h3 className="text-2xl font-black text-foreground tracking-tight">{selectedTemplate.title}</h3>
                      <p className="text-sm text-muted mt-3 max-w-xl leading-relaxed">{selectedTemplate.subtitle}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 min-w-[150px]">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Outcome</p>
                      <p className="text-sm font-bold text-foreground mt-2">Structured from day one</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-8">
                    {selectedTemplate.template.folders.map((folder) => (
                      <div key={folder.name} className="rounded-[1.25rem] border border-border bg-card/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-foreground">{folder.name}</p>
                          <span className="text-[10px] uppercase tracking-widest text-muted font-black">{folder.apps.length} apps</span>
                        </div>
                        <div className="mt-4 space-y-2">
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

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                      loading={activeTemplateId === selectedTemplate.id}
                      onClick={async () => {
                        await handleTemplateLaunch(selectedTemplate.id);
                        writeStorageValue(localStorage, ONBOARDING_STORAGE_KEY, 'true');
                        setIsOnboardingOpen(false);
                      }}
                    >
                      Install {selectedTemplate.title}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto h-12 px-6 rounded-2xl text-[11px] uppercase tracking-widest font-black"
                      onClick={handleDismissOnboarding}
                    >
                      I’ll Set It Up Myself
                    </Button>
                  </div>
                </SpotlightCard>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
