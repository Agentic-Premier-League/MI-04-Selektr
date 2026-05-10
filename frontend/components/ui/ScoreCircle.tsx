import { cn } from "@/lib/cn";

export interface ScoreCircleProps {
  value: number;
  size?: 40 | 56 | 80;
  className?: string;
}

function tone(value: number) {
  if (value >= 80) return "border-arc text-ink";
  if (value >= 60) return "border-ink text-ink";
  return "border-slate text-slate";
}

const SIZE = {
  40: { box: "h-10 w-10", text: "text-[14px]", border: "border-2" },
  56: { box: "h-14 w-14", text: "text-[20px]", border: "border-[2.5px]" },
  80: { box: "h-20 w-20", text: "text-[28px]", border: "border-[3px]" },
} as const;

export function ScoreCircle({ value, size = 56, className }: ScoreCircleProps) {
  const sz = SIZE[size];
  return (
    <div
      className={cn(
        "rounded-full bg-white inline-flex items-center justify-center font-medium tracking-[-0.02em]",
        sz.box,
        sz.text,
        sz.border,
        tone(value),
        className,
      )}
    >
      {value}
    </div>
  );
}
