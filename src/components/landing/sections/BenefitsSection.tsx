import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MinusCircle, Zap, Focus, FolderTree, Smile } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function BenefitsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.benefits-header',
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

      // Benefit cards stagger
      gsap.fromTo(
        '.benefit-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.benefits-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const benefits = [
    {
      icon: MinusCircle,
      title: 'Less Tab Chaos',
      description: 'Explorer removes the need for dozens of open tabs. Websites are stored inside folders so everything stays organized.',
      stat: '90% fewer tabs',
      color: 'red',
    },
    {
      icon: Zap,
      title: 'Faster Navigation',
      description: 'Instead of searching through tabs or bookmarks, users open tools instantly from organized folders.',
      stat: '5x faster access',
      color: 'yellow',
    },
    {
      icon: Focus,
      title: 'Better Focus',
      description: 'A clean workspace reduces distractions and helps users focus on the task at hand.',
      stat: 'Zero distractions',
      color: 'blue',
    },
    {
      icon: FolderTree,
      title: 'Logical Organization',
      description: 'Users organize websites the same way they organize files on their computer. This makes navigation intuitive.',
      stat: 'Natural workflow',
      color: 'green',
    },
    {
      icon: Smile,
      title: 'Personal Workspace',
      description: 'Explorer becomes a personal operating system for the web where every tool has a place.',
      stat: 'Your digital home',
      color: 'purple',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; statBg: string }> = {
    red: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      text: 'text-red-500',
      statBg: 'bg-red-500/10',
    },
    yellow: {
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/20',
      text: 'text-yellow-500',
      statBg: 'bg-yellow-500/10',
    },
    blue: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      statBg: 'bg-blue-500/10',
    },
    green: {
      bg: 'bg-green-500/5',
      border: 'border-green-500/20',
      text: 'text-green-500',
      statBg: 'bg-green-500/10',
    },
    purple: {
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      text: 'text-purple-500',
      statBg: 'bg-purple-500/10',
    },
  };

  return (
    <section ref={containerRef} id="benefits" className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="benefits-header text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Why Explorer Changes
            <br />
            <span className="gradient-text">The Way You Browse</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Explorer turns the chaos of the modern web into a clean and structured workspace.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const colors = colorMap[benefit.color];

            return (
              <div
                key={index}
                className={`benefit-card glass-card rounded-2xl p-8 border ${colors.border} hover:border-accent/50 transition-all duration-300 group ${colors.bg}`}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-card border ${colors.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={28} className={colors.text} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-muted leading-relaxed mb-6">
                  {benefit.description}
                </p>

                {/* Stat Badge */}
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full ${colors.statBg} border ${colors.border}`}
                >
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {benefit.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlight */}
        <div className="mt-20 text-center">
          <div className="inline-block p-8 md:p-12 rounded-3xl glass-card border border-accent/20 max-w-3xl">
            <h3 className="text-2xl md:text-4xl font-black text-foreground mb-4">
              Stop Fighting Your Browser.
            </h3>
            <p className="text-lg text-muted">
              Start working with <span className="gradient-text font-semibold">structure</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}