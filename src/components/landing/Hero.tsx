import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, CheckCircle2, Command, FolderTree, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TRUST_POINTS = [
  'Structured workspaces instead of bookmark clutter',
  'Command palette for instant access',
  'Cross-browser sync with your account',
] as const;

const WORKSPACE_ROWS = [
  { label: 'Founder OS', apps: 'Pitch Deck, Stripe, Analytics' },
  { label: 'Developer OS', apps: 'GitHub, Docs, Vercel' },
  { label: 'Student OS', apps: 'Research, Notes, Assignments' },
] as const;

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.15 })
        .fromTo('.hero-headline', { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.4')
        .fromTo('.hero-copy', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.45')
        .fromTo('.hero-cta', { y: 18, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.08 }, '-=0.45')
        .fromTo('.hero-proof', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.07 }, '-=0.35')
        .fromTo('.hero-surface', { y: 40, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.9 }, '-=0.5');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative px-6 pt-32 pb-20 md:pt-36 md:pb-28">
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent shadow-sm backdrop-blur-xl">
              <Sparkles size={12} />
              Workspace OS For The Modern Web
            </div>

            <h1 className="hero-headline mt-7 text-5xl font-black tracking-[-0.06em] text-foreground md:text-7xl lg:text-[5.4rem] leading-[0.92]">
              Stop saving links.
              <span className="block text-muted">Start installing</span>
              <span className="block">workspaces.</span>
            </h1>

            <p className="hero-copy mt-7 max-w-2xl text-lg leading-8 text-muted md:text-xl">
              Explorer turns scattered tabs, forgotten bookmarks, and disconnected tools into a structured workspace
              you can open from any browser, on any machine, with the same organized flow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/auth')}
                className="hero-cta inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-foreground px-7 text-[11px] font-black uppercase tracking-[0.16em] text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
              >
                Start Your Workspace
                <ArrowRight size={16} />
              </button>

              <a
                href="#product-preview"
                className="hero-cta inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 px-7 text-[11px] font-black uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-xl transition-all hover:border-accent/30 hover:bg-card-hover"
              >
                See Product Walkthrough
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {TRUST_POINTS.map((point) => (
                <div key={point} className="hero-proof flex items-start gap-3 rounded-2xl border border-border bg-card/55 px-4 py-4 backdrop-blur-xl">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                  <p className="text-sm font-medium leading-6 text-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-surface relative">
            <div className="absolute -top-10 right-10 h-40 w-40 rounded-full bg-accent/10 blur-[110px]" />
            <div className="absolute -bottom-8 left-8 h-40 w-40 rounded-full bg-sky-400/10 blur-[110px]" />

            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/78 shadow-premium backdrop-blur-2xl">
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-[var(--surface-strong)]">
                      <FolderTree size={18} className="text-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Explorer Workspace</p>
                      <p className="mt-1 text-lg font-black tracking-tight text-foreground">Command center, not bookmark clutter</p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                    <ShieldCheck size={12} />
                    Secure Sync
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="rounded-[1.5rem] border border-border bg-background/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70 text-accent">
                      <Command size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Command Palette</p>
                      <p className="mt-1 truncate text-sm font-semibold text-foreground">Open Startup Workspace</p>
                    </div>
                    <kbd className="ml-auto rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
                      Ctrl K
                    </kbd>
                  </div>
                </div>

                <div className="space-y-3">
                  {WORKSPACE_ROWS.map((row, index) => (
                    <div
                      key={row.label}
                      className={`rounded-[1.5rem] border px-4 py-4 ${
                        index === 0 ? 'border-accent/25 bg-accent/10' : 'border-border bg-background/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-foreground">{row.label}</p>
                          <p className="mt-1 text-sm text-muted">{row.apps}</p>
                        </div>
                        <div className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                          Ready
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-border bg-background/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Use Case</p>
                    <p className="mt-3 text-xl font-black text-foreground">Developers</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-border bg-background/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Use Case</p>
                    <p className="mt-3 text-xl font-black text-foreground">Founders</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-border bg-background/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Use Case</p>
                    <p className="mt-3 text-xl font-black text-foreground">Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
