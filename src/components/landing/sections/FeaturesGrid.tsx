import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderTree, Zap, Eye, GripVertical, Layers, Focus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: FolderTree,
    title: 'Folder-based structure',
    description: 'Organize apps by project, role, or workflow instead of depending on memory.',
    example: 'Product -> Docs, Analytics, Stripe',
    color: 'accent',
  },
  {
    icon: Layers,
    title: 'Expandable depth',
    description: 'Use subfolders when your setup grows, but keep the surface simple when it does not need complexity.',
    example: 'Engineering -> Frontend -> React',
    color: 'purple',
  },
  {
    icon: Zap,
    title: 'Faster launch',
    description: 'Open what you need without searching through tabs, bookmarks, or browser history.',
    example: 'One click into your active stack',
    color: 'yellow',
  },
  {
    icon: Eye,
    title: 'Clear visual surface',
    description: 'See your tools as a clean workspace, not as a buried list of saved links.',
    example: 'Everything visible at a glance',
    color: 'blue',
  },
  {
    icon: GripVertical,
    title: 'Easy reorganization',
    description: 'Move, rename, and reshape your workspace as your work changes.',
    example: 'Update your setup in seconds',
    color: 'green',
  },
  {
    icon: Focus,
    title: 'Less browser noise',
    description: 'Reduce tab chaos and keep your attention on the work itself.',
    example: 'Calmer, more focused sessions',
    color: 'orange',
  },
] as const;

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  accent: { bg: 'bg-accent/10', border: 'border-accent/20', text: 'text-accent' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500' },
};

export default function FeaturesGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.features-header',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            end: 'top 52%',
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 28, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.1,
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
    <section ref={containerRef} id="features" className="relative py-28 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="features-header text-center mb-18">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            A cleaner way to
            <br />
            <span className="gradient-text">work on the web.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Explorer is designed to reduce friction, not add more software ceremony. The experience should feel calm,
            obvious, and fast.
          </p>
        </div>

        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const colors = COLOR_MAP[feature.color];

            return (
              <div
                key={feature.title}
                className="feature-card rounded-[1.8rem] border border-border bg-card/68 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-premium"
              >
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6`}>
                  <Icon size={26} className={colors.text} />
                </div>

                <h3 className="text-xl font-black tracking-tight text-foreground mb-3">{feature.title}</h3>

                <p className="text-muted leading-relaxed mb-5">{feature.description}</p>

                <div className="pt-4 border-t border-border">
                  <p className="text-[10px] text-muted uppercase tracking-[0.2em] font-black mb-2">Example</p>
                  <p className="text-sm text-foreground font-semibold">{feature.example}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
