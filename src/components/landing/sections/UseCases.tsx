import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, Palette, GraduationCap, TrendingUp, Microscope, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_TEMPLATE_LINKS } from '../../../lib/publicSiteLinks';

gsap.registerPlugin(ScrollTrigger);

export default function UseCases() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.usecases-header',
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

      // Use case cards stagger
      gsap.fromTo(
        '.usecase-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.usecases-grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const useCases = [
    {
      icon: Code,
      title: 'Developers',
      description: 'Keep repos, docs, and release tools in a single workspace.',
      structure: [
        { folder: 'Build', items: ['GitHub', 'API docs', 'Stack Overflow', 'Release notes'] },
      ],
      color: 'accent',
    },
    {
      icon: Palette,
      title: 'Designers',
      description: 'Group design files, inspiration, and handoff tools without tab sprawl.',
      structure: [
        { folder: 'Design', items: ['Figma', 'References', 'Tokens', 'Handoff'] },
      ],
      color: 'purple',
    },
    {
      icon: Microscope,
      title: 'Researchers',
      description: 'Keep sources, notes, and reading lists easy to revisit.',
      structure: [
        { folder: 'Research', items: ['Papers', 'Sources', 'Reading list', 'Notes'] },
      ],
      color: 'blue',
    },
    {
      icon: TrendingUp,
      title: 'Startup Founders',
      description: 'Keep metrics, ops, and go-to-market tools structured around the company flow.',
      structure: [
        { folder: 'Company', items: ['Analytics', 'Product', 'Notion', 'Investor docs'] },
      ],
      color: 'green',
    },
    {
      icon: GraduationCap,
      title: 'Students',
      description: 'Organize learning resources so studying starts faster and feels lighter.',
      structure: [
        { folder: 'Study', items: ['YouTube', 'Courses', 'Notes', 'Docs'] },
      ],
      color: 'orange',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    accent: {
      bg: 'bg-accent/5',
      border: 'border-accent/20',
      text: 'text-accent',
      iconBg: 'bg-accent/10',
    },
    purple: {
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      text: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
    },
    blue: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
    },
    green: {
      bg: 'bg-green-500/5',
      border: 'border-green-500/20',
      text: 'text-green-500',
      iconBg: 'bg-green-500/10',
    },
    orange: {
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/20',
      text: 'text-orange-500',
      iconBg: 'bg-orange-500/10',
    },
  };

  return (
    <section ref={containerRef} className="relative py-24 px-4 sm:px-6 sm:py-32">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="usecases-header text-center mb-14 sm:mb-20">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-linear-to-r from-accent/10 via-sky-400/10 to-emerald-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted backdrop-blur-md shadow-sm">
            Use cases
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-5 leading-tight">
            Built for people
            <br />
            <span className="gradient-text">who work in the browser.</span>
          </h2>

          <p className="text-base md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Explorer adapts to how you work, letting you shape the web around your projects instead of around browser habits.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="usecases-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            const colors = colorMap[useCase.color];

            return (
              <div
                key={index}
                className={`usecase-card glass-card rounded-[1.6rem] p-7 border ${colors.border} hover:border-accent/50 transition-all duration-300 group cursor-pointer bg-linear-to-br from-card via-card to-accent/4 sm:p-8`}
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl ${colors.iconBg} border ${colors.border} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={28} className={colors.text} />
                  </div>
                  <span className="rounded-full border border-border bg-linear-to-r from-background/70 to-accent/6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                    Workflow
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-foreground mb-3">
                  {useCase.title}
                </h3>

                <p className="text-muted leading-relaxed mb-6">
                  {useCase.description}
                </p>

                <div className="space-y-3 pt-5 border-t border-border/50">
                  {useCase.structure.map((folder, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-bold text-foreground mb-2">
                        {folder.folder}
                      </div>
                      <div className="ml-4 space-y-1.5">
                        {folder.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex items-center gap-2 text-xs text-muted"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Message */}
        <div className="mt-14 sm:mt-16 text-center">
          <p className="text-muted italic">
            "A workspace should feel like a system, not a pile of saved tabs."
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {PUBLIC_TEMPLATE_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="inline-flex items-center gap-2 rounded-2xl border border-accent/15 bg-linear-to-r from-card via-card to-accent/6 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-accent/30 hover:brightness-105"
              >
                {link.title}
                <ArrowRight size={14} className="text-accent" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
