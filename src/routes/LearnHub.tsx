import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Grain } from '../components/ui/Grain';
import { Button } from '../components/ui/Button';
import { Seo } from '../components/system/Seo';
import { PUBLIC_ARTICLE_LINKS, PUBLIC_TEMPLATE_LINKS } from '../lib/publicSiteLinks';

export default function LearnHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Seo
        title="Learn | Explorero"
        description="Guides and ideas for organizing apps, tools, and browser workflows with Explorero."
        canonicalPath="/learn"
      />
      <Grain />
      <Navbar />

      <main className="relative pt-28">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[7%] top-24 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute bottom-12 right-[10%] h-72 w-72 rounded-full bg-sky-400/10 blur-[140px]" />
        </div>

        <section className="px-6 pb-10 pt-10">
          <div className="container mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                <Sparkles size={12} />
                Learn
              </div>
              <h1 className="mt-6 text-4xl font-black leading-[0.96] tracking-tight md:text-6xl">
                Practical guides for building a calmer, faster browser workflow.
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted">
                These articles help users understand the problem Explorero solves, the workflows it fits best, and how
                to replace browser chaos with a structured operating system.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-10">
          <div className="container mx-auto max-w-6xl grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              {PUBLIC_ARTICLE_LINKS.map((article) => (
                <button
                  key={article.path}
                  onClick={() => navigate(article.path)}
                  className="w-full rounded-[2rem] border border-border bg-card/70 p-6 text-left shadow-premium backdrop-blur-xl transition-all hover:border-accent/30 hover:bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Article</p>
                      <h2 className="mt-3 text-2xl font-black tracking-tight">{article.title}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{article.description}</p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70">
                      <ArrowRight size={18} className="text-accent" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-[2rem] border border-border bg-sidebar/35 p-6 shadow-premium backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-accent/10">
                  <BookOpen size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Next step</p>
                  <h2 className="text-xl font-black tracking-tight">Install a working setup</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-muted">
                The articles explain the problem. The templates show what the solution feels like in practice.
              </p>

              <div className="mt-6 space-y-3">
                {PUBLIC_TEMPLATE_LINKS.map((template) => (
                  <button
                    key={template.path}
                    onClick={() => navigate(template.path)}
                    className="w-full rounded-2xl border border-border bg-background/70 px-4 py-4 text-left transition-all hover:border-accent/30 hover:bg-card"
                  >
                    <h3 className="text-base font-black tracking-tight">{template.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{template.description}</p>
                  </button>
                ))}
              </div>

              <Button
                className="mt-6 h-12 w-full rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest"
                onClick={() => navigate('/auth')}
              >
                Start free
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
