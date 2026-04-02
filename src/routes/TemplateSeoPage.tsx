import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FolderOpen, Sparkles } from 'lucide-react';
import { Grain } from '../components/ui/Grain';
import { Button } from '../components/ui/Button';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Seo } from '../components/system/Seo';
import { getSeoTemplatePage } from '../lib/seoTemplatePages';
import { explorerService } from '../lib/explorerService';
import { trackFunnelEvent } from '../lib/analyticsService';
import { getErrorMessage } from '../lib/errorMessage';
import { useAuth } from '../hooks/useAuth';
import { PUBLIC_TEMPLATE_LINKS } from '../lib/publicSiteLinks';

export default function TemplateSeoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const page = useMemo(() => getSeoTemplatePage(slug), [slug]);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const handleInstall = async () => {
    setFeedback(null);

    if (!isAuthenticated) {
      navigate(`/auth?returnTo=${encodeURIComponent(`/templates/${page.slug}`)}`);
      return;
    }

    setLoading(true);
    try {
      await explorerService.seedWorkspaceTemplate(page.template);
      trackFunnelEvent('template_installed', { template_id: page.slug, source: 'seo-template-page' });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFeedback(getErrorMessage(error, 'Unable to install this workspace right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title={page.seoTitle}
        description={page.description}
        canonicalPath={`/templates/${page.slug}`}
      />
      <Grain />
      <Navbar />

      <main className="relative pt-28">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[8%] top-24 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute bottom-16 right-[10%] h-72 w-72 rounded-full bg-sky-400/10 blur-[140px]" />
        </div>

        <section className="px-6 pb-10 pt-10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                  <Sparkles size={12} />
                  High-intent workspace
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-foreground md:text-6xl">
                  {page.title}
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                  {page.summary}
                </p>

                <p className="mt-4 text-sm font-semibold text-foreground/80">{page.audience}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                    loading={loading}
                    onClick={handleInstall}
                  >
                    Install {page.title}
                    {!loading && <ArrowRight size={14} className="ml-2" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                    onClick={() => navigate('/auth')}
                  >
                    Start free
                  </Button>
                </div>

                {feedback && (
                  <div className="mt-5 flex items-start gap-3 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm font-medium text-amber-700 dark:text-amber-300">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p>{feedback}</p>
                  </div>
                )}

                <div className="mt-10 space-y-3">
                  {page.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                      <p className="text-sm leading-6 text-muted">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card/75 p-6 shadow-premium backdrop-blur-2xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Workspace preview</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">{page.title}</h2>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-border bg-gradient-to-br ${page.accent}`}>
                    <page.icon size={22} className="text-accent" />
                  </div>
                </div>

                <div className="space-y-4">
                  {page.template.folders.map((folder) => (
                    <div key={folder.name} className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/70">
                            <FolderOpen size={18} className="text-accent" />
                          </div>
                          <p className="text-sm font-black text-foreground">{folder.name}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">
                          {folder.apps.length} apps
                        </span>
                      </div>

                      <div className="space-y-2">
                        {folder.apps.map((app) => (
                          <div key={`${folder.name}-${app.url}`} className="flex items-center justify-between rounded-xl border border-border bg-card/50 px-3 py-2">
                            <span className="text-sm font-medium text-foreground">{app.name}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">ready</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 pt-2">
          <div className="container mx-auto max-w-6xl">
            <div className="rounded-[2rem] border border-border bg-card/65 p-6 shadow-premium backdrop-blur-xl">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">More systems</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">Explore other professional workspaces</h2>
                </div>
                <button
                  onClick={() => navigate('/about-explorero')}
                  className="text-sm font-semibold text-accent transition-colors hover:text-foreground"
                >
                  Learn about Explorero
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {PUBLIC_TEMPLATE_LINKS.filter((item) => item.path !== `/templates/${page.slug}`).map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="rounded-[1.5rem] border border-border bg-background/70 p-5 text-left transition-all hover:border-accent/30 hover:bg-card"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Template</p>
                    <h3 className="mt-3 text-xl font-black tracking-tight text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
