import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play, Sparkles, Github, Figma, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text reveal animation
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        '.hero-badge',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.3 }
      )
        .fromTo(
          '.hero-title-line',
          { y: 100, opacity: 0, rotateX: -20 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15 },
          '-=0.8'
        )
        .fromTo(
          '.hero-subtitle',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          '-=0.8'
        )
        .fromTo(
          '.hero-cta',
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
          '-=0.6'
        );

      // 3D mockup scroll animation
      if (mockupRef.current) {
        gsap.fromTo(
          mockupRef.current,
          {
            rotateX: 45,
            scale: 0.85,
            y: 100,
            opacity: 0,
          },
          {
            rotateX: 0,
            scale: 1,
            y: -50,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: '+=800',
              scrub: 1,
            },
          }
        );
      }

      // Folder cards animation
      gsap.fromTo(
        '.workspace-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 1.5,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6"
      style={{ perspective: '2000px' }}
    >
      {/* Hero Content */}
      <div className="relative z-20 container mx-auto text-center flex flex-col items-center max-w-6xl">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass border border-border text-xs font-bold text-muted mb-8 tracking-wider uppercase backdrop-blur-md">
          <Sparkles size={14} className="text-accent" />
          <span className="gradient-text">Browser Explorer v2.0</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground mb-6 leading-[0.9] uppercase">
          <div className="overflow-hidden pb-2">
            <div className="hero-title-line">Browse Like</div>
          </div>
          <div className="overflow-hidden">
            <div className="hero-title-line gradient-text">A File System.</div>
          </div>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
          Explorer transforms your browser into a structured workspace where websites live inside folders instead of messy tabs.
        </p>

        {/* CTAs */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-20 z-30">
          <button
            onClick={() => navigate('/auth')}
            className="hero-cta group h-14 px-8 text-sm font-bold tracking-wide bg-accent text-white hover:bg-accent-hover rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center gap-2"
          >
            Launch Workspace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="hero-cta flex items-center gap-3 text-muted hover:text-foreground transition-colors text-sm font-semibold group">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-glass group-hover:bg-card-hover transition-colors backdrop-blur-md">
              <Play size={16} className="ml-0.5 fill-current" />
            </div>
            Watch Demo
          </button>
        </div>
      </div>

      {/* 3D Mockup with Realistic Content */}
      <div
        className="relative z-10 w-full max-w-6xl"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          ref={mockupRef}
          className="w-full aspect-[16/10] rounded-3xl border border-border bg-card/50 backdrop-blur-xl overflow-hidden shadow-premium"
        >
          {/* Window Header */}
          <div className="h-12 border-b border-border bg-sidebar/50 flex items-center px-6 gap-2 backdrop-blur-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <div className="mx-auto flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background/50 border border-border text-xs text-muted font-mono">
              explorer://workspace/coding
            </div>
          </div>

          {/* Workspace Content */}
          <div className="p-6 h-[calc(100%-3rem)] flex gap-6">
            {/* Sidebar with Folders */}
            <div className="hidden md:flex w-56 h-full rounded-xl border border-border bg-sidebar/50 flex-col gap-2 p-4 backdrop-blur-sm">
              <div className="text-xs font-semibold text-muted mb-2 px-2">Folders</div>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-sm font-medium text-foreground">
                <div className="w-4 h-4 rounded bg-accent/20" />
                Coding
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card-hover text-sm text-muted">
                <div className="w-4 h-4 rounded bg-muted/20" />
                Design
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card-hover text-sm text-muted">
                <div className="w-4 h-4 rounded bg-muted/20" />
                AI Tools
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card-hover text-sm text-muted">
                <div className="w-4 h-4 rounded bg-muted/20" />
                Learning
              </div>
            </div>

            {/* Main Workspace Grid */}
            <div className="flex-1 h-full flex flex-col gap-4">
              {/* Search Bar */}
              <div className="w-full h-12 rounded-xl bg-background/50 border border-border flex items-center px-4">
                <div className="w-1/3 h-4 rounded bg-muted/10" />
              </div>

              {/* Website Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                {/* GitHub Card */}
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                    <Github size={20} className="text-accent" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">GitHub</div>
                  <div className="text-xs text-muted">Code hosting platform</div>
                </div>

                {/* Stack Overflow Card */}
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
                    <div className="w-5 h-5 rounded bg-orange-500/20" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">StackOverflow</div>
                  <div className="text-xs text-muted">Developer community</div>
                </div>

                {/* React Docs Card */}
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                    <div className="w-5 h-5 rounded bg-blue-500/20" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">React Docs</div>
                  <div className="text-xs text-muted">Official documentation</div>
                </div>

                {/* Figma Card */}
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                    <Figma size={20} className="text-purple-500" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">Figma</div>
                  <div className="text-xs text-muted">Design platform</div>
                </div>

                {/* ChatGPT Card */}
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all duration-300 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                    <MessageSquare size={20} className="text-green-500" />
                  </div>
                  <div className="text-sm font-semibold text-foreground mb-1">ChatGPT</div>
                  <div className="text-xs text-muted">AI assistant</div>
                </div>

                {/* More Card (Placeholder) */}
                <div className="workspace-card rounded-xl bg-card border border-border p-4 hover:border-accent/50 transition-all duration-300 cursor-pointer group opacity-50">
                  <div className="w-10 h-10 rounded-lg bg-muted/10 border border-muted/20 flex items-center justify-center mb-3">
                    <div className="text-2xl text-muted">+</div>
                  </div>
                  <div className="text-sm font-semibold text-muted mb-1">Add more</div>
                  <div className="text-xs text-muted/50">Organize tools</div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-purple-500/5 pointer-events-none" />
        </div>
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
    </section>
  );
}