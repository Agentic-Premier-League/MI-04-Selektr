import { cn } from "@/lib/cn";

export interface GhostWatermarkProps {
  text: string;
  align?: "left" | "right";
  className?: string;
}

export function GhostWatermark({
  text,
  align = "left",
  className,
}: GhostWatermarkProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute select-none pointer-events-none top-12 z-0 leading-none text-ghost",
        "text-[96px] sm:text-[128px] md:text-[160px] font-medium tracking-[-0.04em] uppercase",
        align === "left" ? "-left-6 sm:-left-12" : "-right-6 sm:-right-12",
        className,
      )}
    >
      {text}
    </div>
  );
}
