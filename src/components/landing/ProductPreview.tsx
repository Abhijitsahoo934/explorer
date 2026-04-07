import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderTree, Globe, Github, Figma, MessageSquare, ShieldCheck, Command } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const APPS = [
  { name: 'GitHub', subtitle: 'Code and pull requests', icon: Github },
  { name: 'Figma', subtitle: 'Design system and files', icon: Figma },
  { name: 'Slack', subtitle: 'Team communication', icon: MessageSquare },
  { name: 'Docs', subtitle: 'Specs and playbooks', icon: Globe },
] as const;

export default function ProductPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.preview-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        '.preview-mockup',
        { opacity: 0, scale: 0.92, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: '.preview-mockup',
            start: 'top 85%',
            end: 'top 60%',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        '.preview-card',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.preview-cards-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-20 sm:py-28 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="preview-header text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-accent/12 via-sky-400/12 to-emerald-400/12 border border-accent/20 text-[10px] uppercase tracking-[0.25em] font-black text-accent mb-6 shadow-sm">
            <FolderTree size={12} />
            Real Workflow Surface
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            One place for the
            <br />
            tools you actually use.
          </h2>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mt-6 leading-relaxed">
            Structure your stack around outcomes, not tab history. Explorer helps teams move from browser chaos to a workflow that stays calm, clear, and repeatable.
          </p>
        </div>

        <div className="preview-mockup relative rounded-3xl sm:rounded-4xl border border-border bg-card/60 backdrop-blur-2xl p-3 sm:p-4 md:p-6 shadow-premium overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 left-16 w-48 h-48 rounded-full bg-accent/10 blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-sky-400/10 blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 w-44 h-44 rounded-full bg-emerald-400/10 blur-[120px]" />
          </div>

          <div className="relative z-10 rounded-3xl border border-border bg-background/80 overflow-hidden">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4 sm:px-5 py-4 border-b border-border bg-linear-to-r from-background/90 via-background/80 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-accent via-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
                  <FolderTree size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Explorer Workspace</p>
                  <h3 className="text-lg font-black text-foreground">A workspace built around real flow</h3>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-linear-to-r from-accent/8 to-sky-400/8 text-foreground text-[10px] uppercase tracking-widest font-black border border-accent/15 inline-flex items-center gap-1.5">
                  <Command size={11} />
                  Ctrl K
                </div>
                <div className="px-3 py-1 rounded-full bg-linear-to-r from-emerald-500/10 to-teal-400/10 text-emerald-600 dark:text-emerald-300 text-[10px] uppercase tracking-widest font-black border border-emerald-500/15">
                  Live Sync
                </div>
                <div className="px-3 py-1 rounded-full bg-linear-to-r from-accent/10 to-indigo-500/10 text-accent text-[10px] uppercase tracking-widest font-black inline-flex items-center gap-1.5 border border-accent/15">
                  <ShieldCheck size={11} />
                  Secure
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr] min-h-115">
              <aside className="border-b lg:border-b-0 lg:border-r border-border bg-sidebar/60 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-4">Workspace Folders</p>
                <div className="space-y-2">
                  {['Product', 'Engineering', 'Growth', 'Operations'].map((folder, index) => (
                    <div
                        key={folder}
                        className={`preview-card flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                          index === 0
                            ? 'border-accent/20 bg-linear-to-r from-accent/12 to-sky-400/10 text-accent shadow-sm'
                            : index === 1
                              ? 'border-emerald-500/15 bg-linear-to-r from-emerald-500/8 to-teal-500/8 text-foreground'
                              : index === 2
                                ? 'border-fuchsia-500/15 bg-linear-to-r from-fuchsia-500/8 to-purple-500/8 text-foreground'
                                : 'border-amber-500/15 bg-linear-to-r from-amber-500/8 to-orange-500/8 text-foreground'
                        }`}
                      >
                      <FolderTree size={16} />
                      <span className="text-sm font-bold">{folder}</span>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Inside Product</p>
                    <h4 className="text-2xl font-black text-foreground mt-2">Launch Stack</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">4 linked tools</p>
                    <p className="text-sm text-muted mt-1">Open what matters. Ignore the noise.</p>
                  </div>
                </div>

                <div className="preview-cards-grid grid sm:grid-cols-2 gap-4">
                  {APPS.map((app) => (
                    <div key={app.name} className="preview-card rounded-3xl border border-border bg-linear-to-br from-card via-card to-accent/5 p-5 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-background via-background to-accent/6 border border-border flex items-center justify-center text-accent mb-4">
                        <app.icon size={20} />
                      </div>
                      <h5 className="text-lg font-black text-foreground">{app.name}</h5>
                      <p className="text-sm text-muted mt-2 leading-relaxed">{app.subtitle}</p>
                      <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted font-black">
                        <span>Ready</span>
                        <span>Open</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="preview-card rounded-[1.25rem] border border-border bg-background/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Outcome</p>
                    <p className="mt-3 text-sm font-bold text-foreground">Fewer tabs. Faster start.</p>
                  </div>
                  <div className="preview-card rounded-[1.25rem] border border-border bg-background/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Behavior</p>
                    <p className="mt-3 text-sm font-bold text-foreground">Context stays organized</p>
                  </div>
                  <div className="preview-card rounded-[1.25rem] border border-border bg-background/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Advantage</p>
                    <p className="mt-3 text-sm font-bold text-foreground">Portable workflow setup</p>
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
