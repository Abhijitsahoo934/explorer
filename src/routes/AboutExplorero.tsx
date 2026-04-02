import { ArrowRight, CheckCircle2, Compass, FolderTree, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Grain } from '../components/ui/Grain';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/system/Seo';
import { PUBLIC_ARTICLE_LINKS } from '../lib/publicSiteLinks';

const principles = [
  'Bookmarks save links. Explorero saves complete working setups.',
  'Your workspace should stay organized across browsers, laptops, and sessions.',
  'The browser should feel like an operating system for work, not tab chaos.',
];

const audiences = [
  {
    title: 'Developers',
    text: 'Group code, docs, APIs, deployment, and debugging tools into one repeatable engineering surface.',
  },
  {
    title: 'Creators',
    text: 'Keep writing, design, editing, publishing, and research tools in one calm workspace.',
  },
  {
    title: 'Freelancers',
    text: 'Separate clients, delivery, invoicing, meetings, and admin without losing context.',
  },
];

export default function AboutExplorero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title="About Explorero | Workspace OS for the Internet"
        description="Learn what Explorero is, why it was built, who it helps, and how it turns bookmarks and browser chaos into structured workspaces."
        canonicalPath="/about-explorero"
      />
      <Grain />
      <Navbar />

      <main className="relative pt-28">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[6%] top-24 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute bottom-10 right-[8%] h-72 w-72 rounded-full bg-sky-400/10 blur-[140px]" />
        </div>

        <section className="px-6 pb-12 pt-10">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                  <Sparkles size={12} />
                  About Explorero
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[0.96] tracking-tight md:text-6xl">
                  Explorero is a workspace operating system for people who get lost between tabs, tools, and bookmarks.
                </h1>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
                  We built Explorero around one simple belief: modern work does not happen inside one app or one tab. It
                  happens across a web of tools, dashboards, docs, editors, meetings, and workflows. Explorero turns
                  that scattered browser activity into one structured system you can actually return to.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                    onClick={() => navigate('/auth')}
                  >
                    Start free
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                    onClick={() => navigate('/templates/developer-os')}
                  >
                    Explore templates
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card/75 p-6 shadow-premium backdrop-blur-2xl">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-accent/10">
                      <FolderTree size={20} className="text-accent" />
                    </div>
                    <h2 className="text-lg font-black tracking-tight">Organized by purpose</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Build folders for engineering, creation, research, growth, clients, or any workflow that matters.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-sky-500/10">
                      <Compass size={20} className="text-sky-500" />
                    </div>
                    <h2 className="text-lg font-black tracking-tight">Portable across browsers</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Open the same structured setup from different machines without rebuilding your browser every time.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-border bg-background/60 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Why it matters</p>
                  <div className="mt-4 space-y-3">
                    {principles.map((principle) => (
                      <div key={principle} className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                        <p className="text-sm leading-6 text-muted">{principle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-6 rounded-[2rem] border border-border bg-card/65 p-6 shadow-premium backdrop-blur-xl lg:grid-cols-3">
              {audiences.map((audience) => (
                <div key={audience.title} className="rounded-[1.5rem] border border-border bg-background/70 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Built for</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight">{audience.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{audience.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 pt-6">
          <div className="container mx-auto max-w-4xl rounded-[2rem] border border-border bg-sidebar/35 p-8 shadow-premium backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Founder note</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Why we built Explorero</h2>
            <p className="mt-5 text-base leading-8 text-muted">
              Browsers are excellent at opening the internet, but terrible at preserving the shape of real work. You
              end up with too many tabs, forgotten bookmarks, broken mental context, and friction every time you sit
              down to begin. Explorero exists to give that work a home: structured, reusable, and ready.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                onClick={() => navigate('/auth')}
              >
                Build your workspace
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                onClick={() => navigate('/')}
              >
                Back to homepage
              </Button>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-border bg-background/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Read next</p>
              <button
                onClick={() => navigate(PUBLIC_ARTICLE_LINKS[0].path)}
                className="mt-3 text-left transition-colors hover:text-accent"
              >
                <h3 className="text-xl font-black tracking-tight text-foreground">{PUBLIC_ARTICLE_LINKS[0].title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{PUBLIC_ARTICLE_LINKS[0].description}</p>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
