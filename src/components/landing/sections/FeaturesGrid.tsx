import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FolderTree, 
  Zap, 
  Eye, 
  GripVertical, 
  Layers, 
  Focus 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.features-header',
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

      // Feature cards stagger
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: FolderTree,
      title: 'Folder Based Organization',
      description: 'Create folders and organize websites logically. Just like your computer file system.',
      color: 'accent',
      example: 'Coding → GitHub, Stack Overflow, Docs',
    },
    {
      icon: Layers,
      title: 'Infinite Nesting',
      description: 'Folders can contain subfolders. Build deep hierarchies for complex projects.',
      color: 'purple',
      example: 'Coding → Frontend → React → Hooks',
    },
    {
      icon: Zap,
      title: 'Instant Launch',
      description: 'Click any website card and open it instantly. No searching through tabs.',
      color: 'yellow',
      example: 'One click to open GitHub',
    },
    {
      icon: Eye,
      title: 'Visual Workspace',
      description: 'Tools appear as visual cards instead of text lists. Navigation is intuitive and fast.',
      color: 'blue',
      example: 'See all your tools at a glance',
    },
    {
      icon: GripVertical,
      title: 'Drag & Drop Organization',
      description: 'Reorganize your workspace by dragging websites between folders.',
      color: 'green',
      example: 'Move tools easily',
    },
    {
      icon: Focus,
      title: 'Focused Browsing',
      description: 'Open only what you need. Reduce distractions and tab overload.',
      color: 'orange',
      example: 'Zero tab clutter',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    accent: {
      bg: 'bg-accent/10',
      border: 'border-accent/20',
      text: 'text-accent',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-500',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-500',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-500',
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-500',
    },
  };

  return (
    <section ref={containerRef} id="features" className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="features-header text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Powerful Organization
            <br />
            <span className="gradient-text">For The Web</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Explorer gives your browser a structured workspace where every tool has a place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];

            return (
              <div
                key={index}
                className="feature-card glass-card rounded-2xl p-8 border border-border hover:border-accent/50 transition-all duration-300 group cursor-pointer"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={28} className={colors.text} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Example */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted/70 uppercase tracking-wider font-semibold mb-2">
                    Example
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    {feature.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Hint */}
        <div className="mt-16 text-center">
          <p className="text-muted italic">
            "Everything you need to organize the modern web."
          </p>
        </div>
      </div>
    </section>
  );
}