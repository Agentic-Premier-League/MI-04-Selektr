import { cn } from "@/lib/cn";

export interface OrbitalArcProps {
  size?: number;
  className?: string;
  rotate?: boolean;
}

export function OrbitalArc({ size = 240, className, rotate }: OrbitalArcProps) {
  const r = size / 2 - 4;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(
        "pointer-events-none",
        rotate && "animate-spin-slow",
        className,
      )}
      aria-hidden
    >
      <path
        d={`M ${size / 2} ${size / 2 - r}
            A ${r} ${r} 0 1 1 ${size / 2 + r * 0.96} ${size / 2 + r * 0.28}`}
        className="orbital-arc"
      />
    </svg>
  );
}
