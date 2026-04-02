import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play, Sparkles, Github, Figma, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo('.hero-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.2 })
        .fromTo(
          '.hero-title-line',
          { y: 90, opacity: 0, rotateX: -14 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.05, stagger: 0.12 },
          '-=0.55'
        )
        .fromTo('.hero-subtitle', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.55')
        .fromTo('.hero-cta', { y: 18, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08 }, '-=0.4')
        .fromTo('.hero-proof', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, '-=0.35');

      if (mockupRef.current) {
        gsap.fromTo(
          mockupRef.current,
          { rotateX: 20, scale: 0.94, y: 70, opacity: 0 },
          {
            rotateX: 0,
            scale: 1,
            y: -18,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: '+=700',
              scrub: 1,
            },
          }
        );
      }

      gsap.fromTo(
        '.workspace-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          delay: 1.1,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32"
      style={{ perspective: '2000px' }}
    >
      <div className="relative z-20 container mx-auto text-center flex flex-col items-center max-w-6xl">
        <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full bg-glass border border-border px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-[0.18em] backdrop-blur-md shadow-sm sm:mb-8 sm:text-xs">
          <Sparkles size={14} className="text-accent" />
          <span className="gradient-text">Workspace OS for your internet</span>
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[0.92] tracking-tighter text-foreground sm:text-5xl md:text-7xl lg:text-8xl">
          <div className="overflow-hidden pb-2">
            <div className="hero-title-line">Browse Like</div>
          </div>
          <div className="overflow-hidden">
            <div className="hero-title-line gradient-text">A File System.</div>
          </div>
        </h1>

        <p className="hero-subtitle mx-auto mb-8 max-w-3xl text-base text-muted leading-relaxed sm:mb-10 sm:text-lg md:text-xl">
          Explorer gives your browser a clean operating surface for work. Organize apps into folders, launch faster,
          and keep the same setup across browsers, machines, and sessions.
        </p>

        <div className="z-30 mb-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:items-center md:flex-row md:justify-center md:gap-4">
          <button
            onClick={() => navigate('/auth')}
            className="hero-cta group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-8 text-sm font-bold tracking-[0.14em] uppercase text-background shadow-sm transition-all duration-300 hover:opacity-90 sm:w-auto"
          >
            Start Workspace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#product-preview"
            className="hero-cta flex items-center justify-center gap-3 text-sm font-semibold text-muted transition-colors group hover:text-foreground"
          >
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-glass group-hover:bg-card-hover transition-colors backdrop-blur-md shadow-sm">
              <Play size={16} className="ml-0.5 fill-current" />
            </div>
            See product walkthrough
          </a>
        </div>

        <button
          onClick={() => navigate('/blog/stop-using-bookmarks')}
          className="hero-cta mb-10 inline-flex items-center gap-2 text-center text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          Read why bookmarks break for real workflows
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="mb-14 grid w-full max-w-4xl grid-cols-1 gap-3 sm:mb-16 md:grid-cols-3">
          <div className="hero-proof rounded-2xl border border-border bg-card/60 px-4 py-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md">
            Structured workspaces instead of scattered links
          </div>
          <div className="hero-proof rounded-2xl border border-border bg-card/60 px-4 py-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md">
            Fast launch and command palette access
          </div>
          <div className="hero-proof rounded-2xl border border-border bg-card/60 px-4 py-4 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md">
            The same setup across browsers and devices
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl" style={{ transformStyle: 'preserve-3d' }}>
        <div
          ref={mockupRef}
          className="w-full overflow-hidden rounded-[1.75rem] border border-border bg-card/55 shadow-premium backdrop-blur-xl sm:rounded-3xl"
        >
          <div className="h-12 border-b border-border bg-sidebar/55 flex items-center px-4 sm:px-6 gap-2 backdrop-blur-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="mx-auto hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background/50 border border-border text-xs text-muted font-mono">
              explorer://workspace/founder-os
            </div>
          </div>

          <div className="p-4 sm:p-6 h-[calc(100%-3rem)] flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="hidden md:flex w-56 h-full rounded-xl border border-border bg-sidebar/55 flex-col gap-2 p-4 backdrop-blur-sm">
              <div className="text-xs font-semibold text-muted mb-2 px-2 uppercase tracking-[0.16em]">Workspaces</div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded bg-accent/20" />
                Founder OS
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card-hover text-sm text-muted">
                <div className="w-4 h-4 rounded bg-muted/20" />
                Developer OS
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card-hover text-sm text-muted">
                <div className="w-4 h-4 rounded bg-muted/20" />
                AI Tools
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card-hover text-sm text-muted">
                <div className="w-4 h-4 rounded bg-muted/20" />
                Research
              </div>
            </div>

            <div className="flex-1 h-full flex flex-col gap-4">
              <div className="w-full h-12 rounded-xl bg-background/50 border border-border flex items-center px-4 text-sm text-muted">
                Search folders, apps, and actions...
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                    <Github size={20} className="text-accent" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">GitHub</div>
                  <div className="text-xs text-muted">Product and code shipping</div>
                </div>

                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-emerald-500" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">ChatGPT</div>
                  <div className="text-xs text-muted">Writing, planning, iteration</div>
                </div>

                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                    <Figma size={20} className="text-purple-500" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">Figma</div>
                  <div className="text-xs text-muted">Brand and interface design</div>
                </div>

                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-3">
                    <div className="w-5 h-5 rounded bg-sky-500/20" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">Analytics</div>
                  <div className="text-xs text-muted">Growth and product metrics</div>
                </div>

                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
                    <div className="w-5 h-5 rounded bg-orange-500/20" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">Docs</div>
                  <div className="text-xs text-muted">Specs and operating notes</div>
                </div>

                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer group opacity-70">
                  <div className="w-10 h-10 rounded-lg bg-muted/10 border border-muted/20 flex items-center justify-center mb-3">
                    <div className="text-2xl text-muted">+</div>
                  </div>
                  <div className="text-sm font-semibold text-muted mb-1">Add app</div>
                  <div className="text-xs text-muted/70">Organize your workflow</div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-sky-400/5 pointer-events-none" />
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
    </section>
  );
}
