"use client";

import { cn } from "@/lib/cn";

export interface PillToggleGroupProps<T extends string> {
  options: readonly T[];
  value: T | null;
  onChange: (next: T) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}

export function PillToggleGroup<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
}: PillToggleGroupProps<T>) {
  const sizeClass =
    size === "sm" ? "px-4 py-1.5 text-[14px]" : "px-5 py-2 text-[16px]";
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-pill border-[1.5px] font-medium tracking-[-0.02em] transition-all duration-150",
              sizeClass,
              active
                ? "bg-ink text-cream border-ink"
                : "bg-white text-ink border-ink hover:bg-lifted",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
