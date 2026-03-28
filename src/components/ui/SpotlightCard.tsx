import React from 'react';
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
  spotlightColor = "rgba(255, 255, 255, 0.04)",
  ...props 
}: SpotlightCardProps) {
  // useMotionValue ensures we don't trigger React re-renders on every pixel move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/60 backdrop-blur-xl transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.02)]",
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* Primary Soft Spotlight */}
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
      
      {/* Intense Center Spotlight (gives the card a realistic glass reflection feel) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-overlay"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              150px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.06),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}