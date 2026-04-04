interface GrainProps {
  opacity?: number;
  disabled?: boolean;
}

export function Grain({ opacity = 0.04, disabled = false }: GrainProps) {
  if (disabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 h-full w-full mix-blend-overlay select-none overflow-hidden"
      style={{ opacity }}
    >
      <svg
        className="absolute inset-0 h-full w-full transform-gpu"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          {/* Black & White color matrix for cleaner noise blending without color artifacts */}
          <feColorMatrix 
            type="matrix" 
            values="1 0 0 0 0, 
                    0 1 0 0 0, 
                    0 0 1 0 0, 
                    0 0 0 0.3 0" 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
