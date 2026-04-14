import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Code, GraduationCap, Microscope, Palette, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PUBLIC_TEMPLATE_LINKS } from '../../../lib/publicSiteLinks';

gsap.registerPlugin(ScrollTrigger);

const USE_CASES = [
  {
    icon: Code,
    title: 'Developers',
    description: 'Keep repos, docs, release tools, and references in a single working surface.',
    stack: ['GitHub', 'API docs', 'Release tools', 'Internal notes'],
    accent: 'text-accent',
  },
  {
    icon: Palette,
    title: 'Designers',
    description: 'Group design files, tokens, inspiration, and handoff flows without tab sprawl.',
    stack: ['Figma', 'References', 'Tokens', 'Handoff'],
    accent: 'text-violet-500',
  },
  {
    icon: Microscope,
    title: 'Researchers',
    description: 'Keep sources, papers, notes, and reading lists easy to revisit and maintain.',
    stack: ['Papers', 'Sources', 'Reading list', 'Notes'],
    accent: 'text-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Founders',
    description: 'Structure growth, analytics, product, and investor materials around company flow.',
    stack: ['Analytics', 'Product', 'Ops', 'Investor docs'],
    accent: 'text-emerald-500',
  },
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Organize learning resources so studying starts faster and feels lighter every session.',
    stack: ['Courses', 'Notes', 'Videos', 'Assignments'],
    accent: 'text-orange-500',
  },
] as const;

export default function UseCases() {
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
        '.usecases-header',
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

      gsap.fromTo(
        '.usecase-card',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.usecases-grid',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative px-4 py-22 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="usecases-header mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-background/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted shadow-sm backdrop-blur-md">
            Use cases
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Built for people
            <span className="block bg-linear-to-r from-accent via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              who work inside the browser.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Explorer adapts to different professional systems while keeping the interface clear, repeatable, and easy to reopen.
          </p>
        </div>

        <div className="usecases-grid grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <article
              key={useCase.title}
              className="usecase-card rounded-[1.75rem] border border-border bg-card/75 p-7 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/22 hover:shadow-[0_26px_60px_-36px_rgba(79,70,229,0.18)] sm:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/85 shadow-sm">
                  <useCase.icon size={24} className={useCase.accent} />
                </div>
                <div className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                  Workflow
                </div>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-foreground">{useCase.title}</h3>
              <p className="mt-4 text-base leading-8 text-muted">{useCase.description}</p>

              <div className="mt-7 rounded-2xl border border-border bg-background/72 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">Typical stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {useCase.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground/88"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] border border-border bg-card/55 p-6 text-center shadow-sm backdrop-blur-xl sm:mt-16 sm:p-8">
          <p className="text-sm font-semibold italic text-muted">
            “A workspace should feel like a system, not a pile of remembered tabs.”
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {PUBLIC_TEMPLATE_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="inline-flex items-center gap-2 rounded-2xl border border-accent/15 bg-background/82 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-accent/28 hover:bg-card-hover"
              >
                {link.title}
                <ArrowRight size={14} className="text-accent" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
