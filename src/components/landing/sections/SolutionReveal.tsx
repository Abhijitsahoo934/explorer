import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Folder, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CHAOS_TABS = [
  { label: 'GitHub', rotate: -4 },
  { label: 'Stack Overflow', rotate: 3 },
  { label: 'React Docs', rotate: -2 },
  { label: 'YouTube', rotate: 4 },
  { label: 'ChatGPT', rotate: -1 },
  { label: 'Figma', rotate: 2 },
  { label: 'Gmail', rotate: -3 },
  { label: 'Calendar', rotate: 1 },
  { label: 'Notion', rotate: -4 },
  { label: 'Slack', rotate: 3 },
  { label: 'Twitter', rotate: -2 },
  { label: 'AWS', rotate: 2 },
] as const;

export default function SolutionReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const foldersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        '.solution-header',
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

      // Tabs collapse animation
      gsap.fromTo(
        '.chaos-tab',
        { opacity: 1, scale: 1, y: 0 },
        {
          opacity: 0,
          scale: 0.8,
          y: -50,
          duration: 0.8,
          stagger: 0.05,
          scrollTrigger: {
            trigger: '.transformation',
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Folders reveal animation
      gsap.fromTo(
        '.folder-item',
        { opacity: 0, x: 50, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.transformation',
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Website cards reveal
      gsap.fromTo(
        '.website-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.folder-structure',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="solution-header text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Structure For The
            <br />
            <span className="gradient-text">Modern Web</span>
          </h2>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Explorer transforms the chaos of browser tabs into a clean and structured workspace using folders.
          </p>
        </div>

        {/* Transformation Visual */}
        <div className="transformation relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Messy Tabs */}
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Before: Tab Chaos
                </h3>
                <p className="text-sm text-muted">Messy and disorganized</p>
              </div>

              <div
                ref={tabsRef}
                className="relative h-64 rounded-2xl border border-border bg-card/30 backdrop-blur-sm p-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {CHAOS_TABS.map((tab) => (
                    <div
                      key={tab.label}
                      className="chaos-tab h-8 px-3 rounded-lg bg-card border border-border flex items-center text-xs text-muted font-medium whitespace-nowrap shadow-sm"
                      style={{
                        transform: `rotate(${tab.rotate}deg)`,
                      }}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Arrow */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-glow">
                <ArrowRight size={24} className="text-white" />
              </div>
            </div>

            {/* Right: Organized Folders */}
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  After: Folder Structure
                </h3>
                <p className="text-sm text-muted">Clean and organized</p>
              </div>

              <div
                ref={foldersRef}
                className="folder-structure relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6"
              >
                {/* Coding Folder */}
                <div className="folder-item mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                    <Folder size={16} className="text-accent" />
                    Coding
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      GitHub
                    </div>
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      Stack Overflow
                    </div>
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      React Docs
                    </div>
                  </div>
                </div>

                {/* Design Folder */}
                <div className="folder-item mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                    <Folder size={16} className="text-purple-500" />
                    Design
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Figma
                    </div>
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Dribbble
                    </div>
                  </div>
                </div>

                {/* AI Tools Folder */}
                <div className="folder-item mb-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                    <Folder size={16} className="text-green-500" />
                    AI Tools
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      ChatGPT
                    </div>
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Gemini
                    </div>
                  </div>
                </div>

                {/* Learning Folder */}
                <div className="folder-item">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                    <Folder size={16} className="text-blue-500" />
                    Learning
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      YouTube
                    </div>
                    <div className="website-card flex items-center gap-2 text-xs text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Coursera
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <p className="text-lg text-muted leading-relaxed">
            Explorer gives your browser a <span className="text-foreground font-semibold">structure</span>.
            Instead of remembering where things are, you simply organize them once.
          </p>
        </div>
      </div>
    </section>
  );
}

