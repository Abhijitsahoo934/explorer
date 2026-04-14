import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({ 
  children, 
  className, 
  spotlightColor = "rgba(99, 102, 241, 0.08)",
  ...props 
}: SpotlightCardProps) {
  const [interactiveSpotlight, setInteractiveSpotlight] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)');
    const apply = () => setInteractiveSpotlight(!media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    if (!interactiveSpotlight) return;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border bg-card/75 backdrop-blur-xl transition-all duration-500 hover:border-accent/20 hover:shadow-[0_24px_60px_-32px_rgba(15,23,42,0.22)]",
        className
      )}
      onMouseMove={interactiveSpotlight ? handleMouseMove : undefined}
      {...props}
    >
      {interactiveSpotlight && (
        <>
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  500px circle at ${mouseX}px ${mouseY}px,
                  ${spotlightColor},
                  transparent 70%
                )
              `,
            }}
          />
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-overlay"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  150px circle at ${mouseX}px ${mouseY}px,
                  rgba(255, 255, 255, 0.08),
                  transparent 80%
                )
              `,
            }}
          />
        </>
      )}
      
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
