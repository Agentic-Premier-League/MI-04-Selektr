"use client";

import { cn } from "@/lib/cn";

export interface ScoreDistributionProps {
  buckets: Record<string, number>;
}

const ORDER = ["0-20", "20-40", "40-60", "60-80", "80-100"];

export function ScoreDistribution({ buckets }: ScoreDistributionProps) {
  const max = Math.max(1, ...ORDER.map((b) => buckets[b] ?? 0));
  const highest = ORDER.reduce(
    (acc, b) => ((buckets[b] ?? 0) > (buckets[acc] ?? 0) ? b : acc),
    ORDER[0],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3 h-48">
        {ORDER.map((label) => {
          const count = buckets[label] ?? 0;
          const pct = (count / max) * 100;
          const isHighest = label === highest && count > 0;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[12px] font-medium text-ink">{count}</span>
              <div
                className={cn(
                  "w-full rounded-msg transition-all",
                  isHighest ? "bg-arc" : "bg-ink",
                )}
                style={{ height: `${Math.max(4, pct)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        {ORDER.map((label) => (
          <span key={label} className="flex-1 text-center text-[12px] text-slate">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
