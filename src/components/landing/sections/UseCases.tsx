import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, Palette, GraduationCap, TrendingUp, Microscope } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function UseCases() {
  const containerRef = useRef<HTMLDivElement>(null);

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
      description: 'Keep coding tools organized in one workspace.',
      structure: [
        { folder: 'Coding', items: ['GitHub', 'Stack Overflow', 'React Docs', 'API Docs'] },
      ],
      color: 'accent',
    },
    {
      icon: Palette,
      title: 'Designers',
      description: 'Collect inspiration and design tools in one place.',
      structure: [
        { folder: 'Design', items: ['Figma', 'Dribbble', 'Behance', 'Color Hunt'] },
      ],
      color: 'purple',
    },
    {
      icon: Microscope,
      title: 'Researchers',
      description: 'Organize knowledge sources logically.',
      structure: [
        { folder: 'Research', items: ['Papers', 'Blogs', 'Documentation', 'AI Articles'] },
      ],
      color: 'blue',
    },
    {
      icon: TrendingUp,
      title: 'Startup Founders',
      description: 'Keep all tools and dashboards structured.',
      structure: [
        { folder: 'Startup', items: ['Analytics', 'Product Tools', 'Notion', 'Investor Docs'] },
      ],
      color: 'green',
    },
    {
      icon: GraduationCap,
      title: 'Students',
      description: 'Organize learning resources for faster studying.',
      structure: [
        { folder: 'Learning', items: ['YouTube', 'Courses', 'Study Notes', 'Documentation'] },
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
    <section ref={containerRef} className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="usecases-header text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Built For
            <br />
            <span className="gradient-text">Builders</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Explorer adapts to how you work, letting you structure the web around your projects.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="usecases-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            const colors = colorMap[useCase.color];

            return (
              <div
                key={index}
                className={`usecase-card glass-card rounded-2xl p-8 border ${colors.border} hover:border-accent/50 transition-all duration-300 group cursor-pointer ${colors.bg}`}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl ${colors.iconBg} border ${colors.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={28} className={colors.text} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {useCase.title}
                </h3>

                {/* Description */}
                <p className="text-muted leading-relaxed mb-6">
                  {useCase.description}
                </p>

                {/* Folder Structure Example */}
                <div className="space-y-3 pt-6 border-t border-border/50">
                  {useCase.structure.map((folder, idx) => (
                    <div key={idx}>
                      <div className="text-sm font-semibold text-foreground mb-2">
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
        <div className="mt-16 text-center">
          <p className="text-muted italic">
            "No matter your workflow, Explorer helps you stay organized."
          </p>
        </div>
      </div>
    </section>
  );
}
