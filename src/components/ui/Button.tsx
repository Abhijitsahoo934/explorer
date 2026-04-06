import * as React from 'react';
import { motion } from 'framer-motion';
// Use 'import type' for TypeScript-only interfaces
import type { HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  icon?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, icon: Icon, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    
    // Premium Tailwind variants with focus rings and shadows
    const variants = {
      primary: "bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(99,102,241,0.28)] focus:ring-4 focus:ring-accent/20 shadow-lg",
      secondary: "bg-card text-foreground border border-border hover:bg-card-hover hover:border-[var(--border-hover)] backdrop-blur-md focus:ring-4 focus:ring-accent/10",
      outline: "bg-transparent border border-border text-foreground hover:border-[var(--border-hover)] hover:bg-card-hover focus:ring-4 focus:ring-accent/10",
      ghost: "bg-transparent text-muted hover:text-foreground hover:bg-card-hover focus:ring-4 focus:ring-accent/10",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] focus:ring-4 focus:ring-red-500/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      xl: "h-14 px-8 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={prefersReducedMotion ? undefined : { scale: disabled || loading ? 1 : 1.02 }}
        whileTap={prefersReducedMotion ? undefined : { scale: disabled || loading ? 1 : 0.98 }}
        transition={prefersReducedMotion ? { duration: 0.12, ease: 'easeOut' } : { type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {/* Button Content */}
        <span className={cn("inline-flex items-center justify-center gap-2", loading ? "opacity-0" : "opacity-100")}>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />}
          {children as React.ReactNode}
        </span>

        {/* Loading Overlay */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-current" size={size === 'sm' ? 14 : size === 'lg' || size === 'xl' ? 20 : 16} />
          </span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export { Button };
