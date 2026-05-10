import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface PillInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const PillInput = forwardRef<HTMLInputElement, PillInputProps>(function PillInput(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-pill bg-white px-6 py-3.5 text-[16px] font-[450] text-ink",
        "border-[1.5px] outline-none transition-all duration-150",
        "placeholder:text-slate placeholder:font-[450]",
        invalid
          ? "border-signal focus:border-signal focus:shadow-[0_0_0_3px_rgba(207,69,0,0.12)]"
          : "border-ink/40 focus:border-ink focus:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        className,
      )}
      {...props}
    />
  );
});
