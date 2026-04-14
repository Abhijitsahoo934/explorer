import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderPlus, Link as LinkIcon, Monitor } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    id: '01',
    title: 'Create your structure',
    desc: 'Set up folders for projects, roles, or workflows so the browser reflects how you actually operate.',
    icon: FolderPlus,
  },
  {
    id: '02',
    title: 'Add the real tools',
    desc: 'Save apps, docs, dashboards, and references directly into that structure instead of scattering them.',
    icon: LinkIcon,
  },
  {
    id: '03',
    title: 'Start faster every day',
    desc: 'Open the workspace and continue from a clean system instead of rebuilding context from tabs.',
    icon: Monitor,
  },
] as const;

export const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hiw-header',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        '.hiw-step',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.hiw-grid',
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative border-t border-border/70 px-4 py-22 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-52 max-w-4xl rounded-full bg-accent/7 blur-[140px]" />

      <div className="mx-auto max-w-6xl">
        <div className="hiw-header mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-background/75 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted shadow-sm backdrop-blur-md">
            How it works
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Three steps to a browser
            <span className="block bg-linear-to-r from-accent via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              that feels organized.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            The product should feel obvious: shape the system once, attach the right tools, and reopen the same clean setup every time.
          </p>
        </div>

        <div className="hiw-grid grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.id}
              className="hiw-step relative overflow-hidden rounded-[1.9rem] border border-border bg-card/75 p-7 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/22 hover:shadow-[0_26px_60px_-36px_rgba(79,70,229,0.18)] sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent/4 via-transparent to-sky-500/5" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/85 shadow-sm">
                    <step.icon size={24} className="text-accent" />
                  </div>
                  <div className="rounded-full border border-border bg-background/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                    Step {step.id}
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-4 text-base leading-8 text-muted">{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
