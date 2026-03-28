import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderPlus, LinkIcon, Layers, Rocket } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function WorkflowSteps() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.workflow-header',
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

      // Steps animation
      gsap.fromTo(
        '.workflow-step',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.workflow-steps',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Connecting line animation
      gsap.fromTo(
        '.workflow-line',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 1.5,
          scrollTrigger: {
            trigger: '.workflow-steps',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      number: '01',
      icon: FolderPlus,
      title: 'Create Folders',
      description: 'Start by creating folders to represent your workflows.',
      example: 'Example: Coding, Design, AI Tools, Learning',
      color: 'accent',
    },
    {
      number: '02',
      icon: LinkIcon,
      title: 'Add Websites',
      description: 'Add your favorite websites into folders.',
      example: 'Example: GitHub, Figma, ChatGPT inside folders',
      color: 'purple',
    },
    {
      number: '03',
      icon: Layers,
      title: 'Structure Your Workspace',
      description: 'Group tools by category or project.',
      example: 'Example: Startup Project → Analytics, Dashboard, Docs',
      color: 'blue',
    },
    {
      number: '04',
      icon: Rocket,
      title: 'Launch Instantly',
      description: 'Open tools directly from Explorer.',
      example: 'Example: No searching through tabs or bookmarks',
      color: 'green',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; numberBg: string }> = {
    accent: {
      bg: 'bg-accent/5',
      border: 'border-accent/20',
      text: 'text-accent',
      numberBg: 'bg-accent',
    },
    purple: {
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      text: 'text-purple-500',
      numberBg: 'bg-purple-500',
    },
    blue: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      numberBg: 'bg-blue-500',
    },
    green: {
      bg: 'bg-green-500/5',
      border: 'border-green-500/20',
      text: 'text-green-500',
      numberBg: 'bg-green-500',
    },
  };

  return (
    <section ref={containerRef} id="workflow" className="relative py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="workflow-header text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            How Explorer
            <br />
            <span className="gradient-text">Works</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Organizing the web becomes effortless with a simple workflow.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="workflow-steps relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-8 md:left-12 top-16 bottom-16 w-0.5 bg-gradient-to-b from-accent via-purple-500 to-green-500 workflow-line hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = colorMap[step.color];

              return (
                <div
                  key={index}
                  className="workflow-step relative flex items-start gap-6 md:gap-8"
                >
                  {/* Step Number Circle */}
                  <div className="flex-shrink-0 relative z-10">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${colors.numberBg} flex items-center justify-center shadow-glow`}
                    >
                      <span className="text-2xl md:text-3xl font-black text-white">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Step Content Card */}
                  <div
                    className={`flex-1 glass-card rounded-2xl p-6 md:p-8 border ${colors.border} ${colors.bg} hover:border-accent/50 transition-all duration-300 group`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-card border ${colors.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={24} className={colors.text} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {/* Example */}
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted/70 uppercase tracking-wider font-semibold mb-2">
                        Example
                      </p>
                      <p className="text-sm text-foreground font-medium">
                        {step.example}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted italic">
            "Four simple steps. Infinite organization."
          </p>
        </div>
      </div>
    </section>
  );
}