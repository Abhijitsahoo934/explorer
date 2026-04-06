import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-content',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            end: 'top 56%',
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="cta" className="relative py-24 px-4 sm:px-6 sm:py-28">
      <div className="container mx-auto max-w-5xl">
        <div className="cta-content rounded-4xl border border-border bg-card/74 p-8 sm:p-10 md:p-14 shadow-premium backdrop-blur-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-background/65 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted">
            Built for focused teams
          </div>

          <h2 className="mt-7 text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Give your browser
            <br />
            a real operating surface.
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted leading-8">
            Explorer helps you move from browser clutter to a setup that feels structured, calm, and ready every time you start work.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
            <span className="rounded-full border border-border bg-background/65 px-3 py-2">No bookmark sprawl</span>
            <span className="rounded-full border border-border bg-background/65 px-3 py-2">Mobile-friendly</span>
            <span className="rounded-full border border-border bg-background/65 px-3 py-2">Fast to reopen</span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-foreground px-8 text-[11px] font-black uppercase tracking-[0.16em] text-background shadow-sm transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              Open Workspace
              <ArrowRight size={16} />
            </button>

            <a
              href="#product-preview"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-border bg-background/75 px-8 text-[11px] font-black uppercase tracking-[0.16em] text-foreground shadow-sm transition-all hover:border-accent/30 hover:bg-card-hover"
            >
              See the Product
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
