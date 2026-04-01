import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderTree, Globe, Github, Figma, MessageSquare, Sparkles, ShieldCheck, Command } from 'lucide-react';

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
    <section ref={containerRef} className="relative py-28 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="preview-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] uppercase tracking-[0.25em] font-black text-accent mb-6">
            <Sparkles size={12} />
            Product Surface
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            One place for the
            <br />
            tools you actually use.
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mt-6 leading-relaxed">
            Keep your work stack structured by purpose, not memory. Explorer helps you move from browser chaos to a setup that feels calm, clear, and repeatable.
          </p>
        </div>

        <div className="preview-mockup relative rounded-[2rem] border border-border bg-card/60 backdrop-blur-2xl p-4 md:p-6 shadow-premium overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 left-16 w-48 h-48 rounded-full bg-accent/10 blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-sky-400/10 blur-[120px]" />
          </div>

          <div className="relative z-10 rounded-[1.5rem] border border-border bg-background/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg">
                  <FolderTree size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted font-black">Explorer Workspace</p>
                  <h3 className="text-lg font-black text-foreground">A workspace built around real flow</h3>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-background/80 text-foreground text-[10px] uppercase tracking-widest font-black border border-border inline-flex items-center gap-1.5">
                  <Command size={11} />
                  Ctrl K
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] uppercase tracking-widest font-black">
                  Live Sync
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] uppercase tracking-widest font-black inline-flex items-center gap-1.5">
                  <ShieldCheck size={11} />
                  Secure
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr] min-h-[460px]">
              <aside className="border-r border-border bg-sidebar/60 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black mb-4">Workspace Folders</p>
                <div className="space-y-2">
                  {['Product', 'Engineering', 'Growth', 'Operations'].map((folder, index) => (
                    <div
                      key={folder}
                      className={`preview-card flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                        index === 0
                          ? 'border-accent/20 bg-accent/10 text-accent'
                          : 'border-border bg-background/70 text-foreground'
                      }`}
                    >
                      <FolderTree size={16} />
                      <span className="text-sm font-bold">{folder}</span>
                    </div>
                  ))}
                </div>
              </aside>

              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
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
                    <div key={app.name} className="preview-card rounded-[1.5rem] border border-border bg-card/70 p-5 hover:border-accent/30 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-accent mb-4">
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
