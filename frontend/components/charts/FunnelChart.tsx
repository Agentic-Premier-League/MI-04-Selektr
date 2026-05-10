"use client";

export interface FunnelChartProps {
  funnel: Record<string, number>;
}

const STAGES: Array<{ key: string; label: string }> = [
  { key: "applied", label: "Applied" },
  { key: "screened", label: "Screened" },
  { key: "interviewed", label: "Interviewed" },
  { key: "shortlisted", label: "Shortlisted" },
];

export function FunnelChart({ funnel }: FunnelChartProps) {
  const max = Math.max(1, ...STAGES.map((s) => funnel[s.key] ?? 0));

  return (
    <div className="flex flex-col gap-3">
      {STAGES.map((s) => {
        const count = funnel[s.key] ?? 0;
        const pct = (count / max) * 100;
        return (
          <div key={s.key} className="flex items-center gap-4">
            <span className="w-28 text-[14px] font-medium text-ink">{s.label}</span>
            <div className="flex-1 h-8 rounded-pill bg-bone overflow-hidden">
              <div
                className="h-full rounded-pill bg-ink transition-all"
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
            <span className="w-10 text-right text-[14px] font-bold text-ink">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
