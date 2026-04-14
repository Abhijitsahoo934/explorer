import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-content',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="cta" className="relative px-4 py-22 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute -top-10 left-1/4 h-44 w-44 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="mx-auto max-w-5xl">
        <div className="cta-content rounded-[2.2rem] border border-border bg-card/75 p-8 text-center shadow-[0_28px_70px_-44px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:p-10 md:p-14">
          <div className="inline-flex items-center rounded-full border border-accent/15 bg-background/82 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted shadow-sm">
            Ready to switch from tab chaos
          </div>

          <h2 className="mt-7 text-4xl font-black leading-tight tracking-tight text-foreground md:text-6xl">
            Give your browser
            <span className="block bg-linear-to-r from-accent via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              a real operating surface.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Explorer turns repeat work into a structure you can trust. Open the same organized setup every time, on any browser, without rebuilding context.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
            <span className="rounded-full border border-accent/15 bg-background/82 px-3 py-2">No bookmark sprawl</span>
            <span className="rounded-full border border-emerald-500/15 bg-background/82 px-3 py-2">Cross-browser setup</span>
            <span className="rounded-full border border-amber-500/15 bg-background/82 px-3 py-2">Faster session starts</span>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-accent via-sky-500 to-indigo-500 px-8 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_-24px_rgba(11,102,255,0.65)] transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Open Workspace
              <ArrowRight size={16} />
            </button>

            <a
              href="#product-preview"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-accent/15 bg-background/82 px-8 text-[11px] font-black uppercase tracking-[0.16em] text-foreground shadow-sm transition-all hover:border-accent/28 hover:bg-card-hover"
            >
              See the Product
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
