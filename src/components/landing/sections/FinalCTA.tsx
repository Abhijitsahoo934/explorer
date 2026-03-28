import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // CTA content fade in
      gsap.fromTo(
        '.cta-content',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        }
      );

      // Glow pulse animation
      gsap.to('.cta-glow', {
        opacity: 0.6,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });

      // Button scale on scroll into view
      gsap.fromTo(
        '.cta-button',
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: '.cta-button',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="cta" className="relative py-32 px-6">
      <div className="container mx-auto max-w-5xl">
        {/* CTA Card */}
        <div className="relative">
          {/* Background Glow Effects */}
          <div className="absolute inset-0 -z-10">
            <div className="cta-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent/30 to-purple-500/30 rounded-full blur-3xl opacity-40" />
          </div>

          {/* Main CTA Content */}
          <div className="cta-content relative glass-card rounded-3xl p-12 md:p-16 border border-accent/20 text-center overflow-hidden">
            {/* Grain Texture Overlay */}
            <div className="absolute inset-0 grain pointer-events-none opacity-30" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent mb-8 tracking-wider uppercase backdrop-blur-md">
              <Sparkles size={14} />
              <span>Join The Future of Browsing</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 leading-tight">
              Organize Your
              <br />
              <span className="gradient-text">Web</span>
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-2xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
              Stop drowning in browser tabs.
              <br />
              Start building a structured workspace for everything you use online.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={() => navigate('/auth')}
                className="cta-button group h-16 px-10 text-sm font-black tracking-wider bg-accent text-white hover:bg-accent-hover rounded-2xl shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300 flex items-center gap-3 uppercase"
              >
                Get Early Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/auth')}
                className="cta-button h-16 px-10 text-sm font-bold tracking-wider bg-card border border-border text-foreground hover:border-accent/50 rounded-2xl hover:scale-105 transition-all duration-300 uppercase"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Line */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Free during beta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Early users get lifetime perks</span>
              </div>
            </div>

            {/* Supporting Message */}
            <p className="mt-12 text-muted italic">
              "Join thousands of builders organizing their tools with Explorer."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
