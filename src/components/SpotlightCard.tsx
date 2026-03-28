import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({ 
  children, 
  className, 
  ...props 
}: SpotlightCardProps) {
  const { theme } = useTheme();
  
  // useMotionValue ensures zero React re-renders on mouse move (Butter smooth performance)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Auto-adapt colors based on Light/Dark Theme
  const primaryGlow = theme === 'dark' 
    ? 'rgba(255, 255, 255, 0.04)' 
    : 'rgba(0, 0, 0, 0.02)';
    
  const accentGlow = theme === 'dark'
    ? 'rgba(99, 102, 241, 0.08)' // Indigo glow for dark mode
    : 'rgba(79, 70, 229, 0.04)'; // Indigo glow for light mode

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-accent/30 hover:shadow-glow",
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* 1. Wide Soft Spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              ${primaryGlow},
              transparent 80%
            )
          `,
        }}
      />
      
      {/* 2. Focused Accent Spotlight (Gives it that expensive glass look) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-overlay"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              120px circle at ${mouseX}px ${mouseY}px,
              ${accentGlow},
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
