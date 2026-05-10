import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EyebrowLabelProps {
  children: ReactNode;
  tone?: "arc" | "signal" | "slate";
  className?: string;
}

const DOT_TONE = {
  arc: "bg-arc",
  signal: "bg-signal",
  slate: "bg-slate",
};

export function EyebrowLabel({
  children,
  tone = "arc",
  className,
}: EyebrowLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.04em] text-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          DOT_TONE[tone],
        )}
      />
      {children}
    </div>
  );
}
