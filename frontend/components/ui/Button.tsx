import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "signal" | "clay" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-ink text-cream border-[1.5px] border-ink hover:bg-charcoal active:translate-y-[1px]",
  secondary:
    "bg-white text-ink border-[1.5px] border-ink hover:bg-lifted active:translate-y-[1px]",
  signal:
    "bg-signal text-white border-0 hover:brightness-110 active:translate-y-[1px]",
  clay:
    "bg-white text-clay border-[1.5px] border-clay hover:bg-clay/5 active:translate-y-[1px]",
  ghost:
    "bg-transparent text-ink border-0 hover:bg-ink/5",
};

const SIZE: Record<Size, string> = {
  sm: "text-[14px] px-4 py-1.5 rounded-btn",
  md: "text-[16px] px-6 py-2 rounded-btn",
  lg: "text-[16px] px-8 py-3.5 rounded-btn",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth, leftIcon, rightIcon, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.02em] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </button>
  );
});
