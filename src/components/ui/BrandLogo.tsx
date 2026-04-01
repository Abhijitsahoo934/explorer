import { cn } from '../../lib/utils';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export function BrandLogo({
  className,
  imageClassName,
  alt = 'Explorer logo',
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-white shadow-sm',
        className
      )}
    >
      <img
        src="/logo.jpg"
        alt={alt}
        className={cn('h-full w-full object-cover', imageClassName)}
      />
    </div>
  );
}
