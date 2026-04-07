import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FolderPlus, Link as LinkIcon, Monitor, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: '01',
    title: 'Create Hierarchy',
    desc: 'Map your workflow with infinite nested folders. Work > Clients > Project Alpha.',
    icon: FolderPlus,
  },
  {
    id: '02',
    title: 'Inject Resources',
    desc: 'Add web apps, docs, and dashboards directly into your folder structure.',
    icon: LinkIcon,
  },
  {
    id: '03',
    title: 'Execute Focus',
    desc: 'Launch your workspace. No more hunting through history or bookmarks.',
    icon: Monitor,
  }
];

export const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        end: "center center",
        toggleActions: "play none none reverse",
      }
    });

    // Header Animation
    tl.fromTo(".hiw-header",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );

    // Connecting Progress Line Animation (Desktop only)
    tl.fromTo(".progress-line",
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: "power4.inOut" },
      "-=0.4"
    );

    // Cards Pop-in
    tl.fromTo(".step-card",
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.2)" },
      "-=1.2"
    );

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden bg-transparent border-t border-border/70">
      
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-100 bg-accent/8 rounded-[100%] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-emerald-400/8 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 md:mb-32 gap-8">
          <div className="max-w-2xl">
            <div className="hiw-header inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-accent/10 via-sky-400/10 to-emerald-400/10 border border-accent/20 text-[10px] font-black text-muted mb-6 tracking-[0.2em] uppercase backdrop-blur-md shadow-sm">
              <Sparkles size={12} className="text-accent" /> The Protocol
            </div>
            <h2 className="hiw-header text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.1] uppercase">
              The Architecture of <br /> 
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent via-sky-500 to-indigo-500">
                Efficiency.
              </span>
            </h2>
          </div>
          <p className="hiw-header text-muted font-mono text-[10px] uppercase tracking-widest font-bold pb-4 border-b border-border max-w-xs">
            Standard Operating Procedure for deep work
          </p>
        </div>

        {/* BENTO CARDS GRID WITH CONNECTING LINE */}
        <div ref={gridRef} className="relative">
          
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-15 left-[10%] right-[10%] h-px bg-border z-0">
            <div className="progress-line h-full w-full bg-linear-to-r from-transparent via-accent/60 to-transparent origin-left" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 relative z-10">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="step-card group relative p-8 md:p-10 rounded-[2.5rem] bg-linear-to-br from-card via-card to-accent/6 backdrop-blur-xl border border-accent/15 hover:border-accent/35 transition-all duration-500 overflow-hidden flex flex-col h-full min-h-85 shadow-premium"
              >
                {/* Hollow Background Number (The $100B touch) */}
                <div 
                  className="absolute -right-4 -bottom-8 text-[12rem] font-black select-none pointer-events-none transition-all duration-500"
                  style={{
                    WebkitTextStroke: "2px rgba(100,116,139,0.13)",
                    color: "transparent",
                  }}
                >
                  {step.id}
                </div>
                <div className="absolute -right-4 -bottom-8 text-[12rem] font-black select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"
                  style={{
                    WebkitTextStroke: "2px rgba(11,102,255,0.22)",
                    color: "transparent",
                  }}
                >
                  {step.id}
                </div>

                {/* Icon Container */}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-accent/12 to-sky-400/10 border border-accent/20 flex items-center justify-center text-accent mb-10 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(11,102,255,0.2)] transition-all duration-500">
                    <step.icon size={26} strokeWidth={2} />
                  </div>
                </div>

                {/* Text Content */}
                <div className="relative z-10 mt-auto">
                  <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight uppercase group-hover:translate-x-2 transition-transform duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed max-w-70 font-medium group-hover:text-foreground/80 transition-colors">
                    {step.desc}
                  </p>
                </div>
                
                {/* Subtle top glare inside the card */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-accent/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
};
