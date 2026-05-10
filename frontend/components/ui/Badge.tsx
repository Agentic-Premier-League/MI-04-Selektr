import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone =
  | "public"
  | "private"
  | "active"
  | "paused"
  | "closed"
  | "new"
  | "screened"
  | "interviewed"
  | "shortlisted"
  | "rejected"
  | "outline"
  | "warning";

const TONE: Record<BadgeTone, string> = {
  public: "bg-arc text-white",
  private: "bg-ink text-cream",
  active: "bg-ink text-cream",
  paused: "bg-white text-ink border border-ink",
  closed: "bg-slate text-white",
  new: "bg-lifted text-ink border border-ink/30",
  screened: "bg-ink text-cream",
  interviewed: "bg-ink/85 text-cream",
  shortlisted: "bg-arc text-white",
  rejected: "bg-slate text-white",
  outline: "bg-white text-ink border border-ink",
  warning: "bg-[#FEF3F0] text-signal border border-signal/30",
};

export function Badge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-[12px] font-bold uppercase tracking-[0.04em]",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
