import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn(
        "rounded-pill bg-lifted h-2 w-full overflow-hidden",
        className,
      )}
    >
      <div
        className="h-full bg-ink rounded-pill transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
