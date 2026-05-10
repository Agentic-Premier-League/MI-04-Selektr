import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  elevated = true,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card bg-lifted",
        elevated && "shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
