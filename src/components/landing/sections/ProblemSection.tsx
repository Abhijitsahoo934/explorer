import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertCircle, Search, Zap, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CHAOS_TABS = [
  { label: 'GitHub', rotate: -3, translateY: 6 },
  { label: 'Stack Overflow', rotate: 2, translateY: 0 },
  { label: 'React Docs', rotate: -1, translateY: 8 },
  { label: 'YouTube', rotate: 3, translateY: 2 },
  { label: 'ChatGPT', rotate: -2, translateY: 10 },
  { label: 'Figma', rotate: 1, translateY: 4 },
  { label: 'Gmail', rotate: -3, translateY: 1 },
  { label: 'Calendar', rotate: 2, translateY: 7 },
  { label: 'Notion', rotate: -1, translateY: 3 },
  { label: 'Slack', rotate: 3, translateY: 9 },
  { label: 'Twitter', rotate: -2, translateY: 5 },
  { label: 'LinkedIn', rotate: 1, translateY: 0 },
  { label: 'Medium', rotate: -3, translateY: 8 },
  { label: 'Dev.to', rotate: 2, translateY: 2 },
  { label: 'CodePen', rotate: -1, translateY: 6 },
  { label: 'AWS Console', rotate: 3, translateY: 1 },
  { label: 'Vercel', rotate: -2, translateY: 9 },
  { label: 'MongoDB', rotate: 1, translateY: 4 },
  { label: 'Firebase', rotate: -3, translateY: 7 },
  { label: 'Reddit', rotate: 2, translateY: 3 },
] as const;

export default function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.problem-header',
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

      // Problem cards stagger
      gsap.fromTo(
        '.problem-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.problem-cards',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Chaotic tabs visualization
      gsap.fromTo(
        '.tab-chaos',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.chaos-visual',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="problem-header text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            The Problem With
            <br />
            <span className="gradient-text">Browser Tabs</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Modern browsers were not designed for managing complex workflows. Users end up drowning in dozens of open tabs.
          </p>
        </div>

        {/* Chaotic Tabs Visualization */}
        <div className="chaos-visual mb-16 relative">
          <div className="w-full max-w-4xl mx-auto h-32 relative overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-4">
            <div className="flex gap-2 items-start overflow-x-auto pb-2 scrollbar-hide">
              {CHAOS_TABS.map((tab) => (
                <div
                  key={tab.label}
                  className="tab-chaos flex-shrink-0 h-10 px-4 rounded-lg bg-card border border-border flex items-center text-xs text-muted font-medium whitespace-nowrap shadow-sm"
                  style={{
                    transform: `rotate(${tab.rotate}deg) translateY(${tab.translateY}px)`,
                  }}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted mt-4 italic">
            "Sound familiar? 20+ tabs open and you can't find what you need."
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="problem-cards grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {/* Card 1: Tab Overload */}
          <div className="problem-card glass-card rounded-2xl p-8 border border-border hover:border-accent/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers size={24} className="text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">
              Tab Overload
            </h3>

            <p className="text-muted leading-relaxed">
              Users keep opening more tabs until they lose track of everything. Important tools get buried in the chaos.
            </p>
          </div>

          {/* Card 2: Lost Websites */}
          <div className="problem-card glass-card rounded-2xl p-8 border border-border hover:border-accent/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Search size={24} className="text-orange-500" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">
              Lost Websites
            </h3>

            <p className="text-muted leading-relaxed">
              Important resources disappear inside tabs or bookmarks. Finding them again becomes a frustrating search.
            </p>
          </div>

          {/* Card 3: Context Switching */}
          <div className="problem-card glass-card rounded-2xl p-8 border border-border hover:border-accent/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={24} className="text-yellow-500" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">
              Constant Context Switching
            </h3>

            <p className="text-muted leading-relaxed">
              Jumping between tabs breaks your focus. Every switch costs time and mental energy.
            </p>
          </div>

          {/* Card 4: Disorganized Workflow */}
          <div className="problem-card glass-card rounded-2xl p-8 border border-border hover:border-accent/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <AlertCircle size={24} className="text-purple-500" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">
              Disorganized Workflow
            </h3>

            <p className="text-muted leading-relaxed">
              There's no logical structure for organizing web tools. Your workspace becomes a digital mess.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
