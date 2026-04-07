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
      <div className="pointer-events-none absolute -top-10 left-1/4 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="container mx-auto max-w-5xl">
        <div className="cta-content rounded-4xl border border-accent/15 bg-linear-to-br from-card via-card to-accent/6 p-8 sm:p-10 md:p-14 shadow-premium backdrop-blur-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-accent/15 bg-linear-to-r from-accent/10 via-sky-400/10 to-emerald-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted shadow-sm">
            Built for focused teams
          </div>

          <h2 className="mt-7 text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Give your browser
            <br />
            <span className="bg-linear-to-r from-foreground via-accent to-sky-500 bg-clip-text text-transparent">a real operating surface.</span>
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted leading-8">
            Explorer helps you move from browser clutter to a setup that feels structured, calm, and ready every time you start work.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
            <span className="rounded-full border border-accent/15 bg-linear-to-r from-accent/10 to-sky-400/8 px-3 py-2">No bookmark sprawl</span>
            <span className="rounded-full border border-emerald-500/15 bg-linear-to-r from-emerald-500/10 to-teal-400/8 px-3 py-2">Mobile-friendly</span>
            <span className="rounded-full border border-amber-500/15 bg-linear-to-r from-amber-500/10 to-orange-400/8 px-3 py-2">Fast to reopen</span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent via-sky-500 to-indigo-500 px-8 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-24px_rgba(11,102,255,0.65)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Open Workspace
              <ArrowRight size={16} />
            </button>

            <a
              href="#product-preview"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-accent/15 bg-linear-to-r from-background/80 to-accent/6 px-8 text-[11px] font-black uppercase tracking-[0.16em] text-foreground shadow-sm transition-all hover:border-accent/30 hover:brightness-105"
            >
              See the Product
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
