"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  variant?: "ink" | "slate";
}

export function TagInput({
  value,
  onChange,
  placeholder,
  variant = "ink",
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commit = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const tagBorder = variant === "ink" ? "border-ink text-ink" : "border-slate text-slate";

  return (
    <div className="rounded-pill bg-white border-[1.5px] border-ink/40 px-4 py-2 flex flex-wrap items-center gap-2 focus-within:border-ink focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all">
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill border px-3 py-0.5 text-[12px] font-medium",
            tagBorder,
          )}
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(idx)}
            className="rounded-full text-ink/60 hover:text-ink leading-none text-[14px]"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[140px] bg-transparent outline-none text-[16px] font-[450] text-ink placeholder:text-slate"
      />
    </div>
  );
}
