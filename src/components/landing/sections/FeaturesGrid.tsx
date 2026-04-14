import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Focus, FolderTree, GripVertical, Layers, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: FolderTree,
    title: 'Folder-based structure',
    description: 'Organize apps by project, role, or workflow instead of depending on memory.',
    detail: 'Group tools by how you actually work, not by browser history.',
    label: 'Structure',
    color: 'from-blue-500/14 via-accent/10 to-transparent',
    accent: 'text-blue-500',
    badge: 'Product / Docs / Stripe',
  },
  {
    icon: Layers,
    title: 'Expandable depth',
    description: 'Use subfolders as your setup grows without making the surface feel heavy.',
    detail: 'Keep the first layer simple, then open deeper systems only when needed.',
    label: 'Scales cleanly',
    color: 'from-violet-500/14 via-purple-500/10 to-transparent',
    accent: 'text-violet-500',
    badge: 'Engineering / Frontend / React',
  },
  {
    icon: Zap,
    title: 'Faster launch',
    description: 'Open what you need without searching through tabs, bookmarks, or browser history.',
    detail: 'Your active stack is already in place, ready for the next session.',
    label: 'Launch speed',
    color: 'from-amber-500/14 via-yellow-500/10 to-transparent',
    accent: 'text-amber-500',
    badge: 'One click to your stack',
  },
  {
    icon: Eye,
    title: 'Clear visual surface',
    description: 'See your tools as a workspace, not as a buried list of saved links.',
    detail: 'It is easier to understand the system when everything is visible at a glance.',
    label: 'Visibility',
    color: 'from-cyan-500/14 via-sky-500/10 to-transparent',
    accent: 'text-cyan-500',
    badge: 'Everything visible',
  },
  {
    icon: GripVertical,
    title: 'Easy reorganization',
    description: 'Move, rename, and reshape your workspace as your work changes.',
    detail: 'The structure adapts quickly when your priorities or projects shift.',
    label: 'Flexible',
    color: 'from-emerald-500/14 via-green-500/10 to-transparent',
    accent: 'text-emerald-500',
    badge: 'Update in seconds',
  },
  {
    icon: Focus,
    title: 'Less browser noise',
    description: 'Reduce tab chaos and keep attention on the work itself.',
    detail: 'Calmer sessions create better focus than another layer of browser clutter.',
    label: 'Calmer sessions',
    color: 'from-orange-500/14 via-rose-500/10 to-transparent',
    accent: 'text-orange-500',
    badge: 'Focus over noise',
  },
] as const;

export default function FeaturesGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.features-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="features" className="relative px-4 py-22 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="features-header mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-background/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted shadow-sm backdrop-blur-md">
            Why it feels better
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
            A workspace interface
            <span className="block bg-linear-to-r from-accent via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              that stays calm under load.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Explorer should feel deliberate, not noisy. These core behaviors are what make the product
            cleaner, faster, and easier to trust day after day.
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="feature-card group relative overflow-hidden rounded-[1.75rem] border border-border bg-card/75 p-7 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/22 hover:shadow-[0_26px_60px_-36px_rgba(79,70,229,0.22)] sm:p-8"
              >
                <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${feature.color} opacity-80`} />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/85 shadow-sm">
                      <Icon size={24} className={feature.accent} />
                    </div>

                    <div className="max-w-[75%] rounded-full border border-border bg-background/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted shadow-sm">
                      {feature.badge}
                    </div>
                  </div>

                  <div className="mb-4 inline-flex w-fit rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                    {feature.label}
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-foreground">{feature.title}</h3>
                  <p className="mt-4 text-base leading-8 text-muted">{feature.description}</p>

                  <div className="mt-auto pt-8">
                    <div className="rounded-2xl border border-border bg-background/72 px-4 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">Operational detail</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-foreground/88">{feature.detail}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
