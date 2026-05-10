import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-msg bg-white px-6 py-4 text-[16px] font-[450] text-ink",
        "border-[1.5px] outline-none transition-all duration-150 resize-y",
        "placeholder:text-slate placeholder:font-[450]",
        invalid
          ? "border-signal focus:border-signal"
          : "border-ink/40 focus:border-ink focus:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        className,
      )}
      {...props}
    />
  );
});
