import { cn } from "@/lib/cn";

export interface StepProgressProps {
  step: 1 | 2;
  totalSteps?: 2;
  labels?: [string, string];
}

export function StepProgress({
  step,
  labels = ["Your Profile", "Interview Questions"],
}: StepProgressProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-pill bg-lifted px-6 py-2 text-[14px] font-[450]">
      <span className="text-slate">Step {step} of 2 —</span>
      {[1, 2].map((s) => {
        const isActive = s === step;
        const isComplete = s < step;
        return (
          <span
            key={s}
            className={cn(
              "inline-flex items-center gap-1.5",
              isActive && "text-ink font-bold",
              isComplete && "text-slate",
              !isActive && !isComplete && "text-slate",
            )}
          >
            {isComplete && (
              <span aria-hidden className="text-arc">
                ✓
              </span>
            )}
            {labels[s - 1]}
          </span>
        );
      })}
    </div>
  );
}
