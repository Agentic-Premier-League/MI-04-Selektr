import { cn } from "@/lib/cn";

export interface SatelliteButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  size?: 40 | 48 | 56;
}

export function SatelliteButton({
  onClick,
  ariaLabel,
  className,
  size = 48,
}: SatelliteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-white border border-ink",
        "transition-transform duration-150 hover:translate-x-0.5",
        size === 40 && "h-10 w-10 text-[16px]",
        size === 48 && "h-12 w-12 text-[18px]",
        size === 56 && "h-14 w-14 text-[20px]",
        className,
      )}
    >
      <span aria-hidden>→</span>
    </button>
  );
}
