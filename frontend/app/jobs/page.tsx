"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { GhostWatermark } from "@/components/ui/GhostWatermark";
import { OrbitalArc } from "@/components/ui/OrbitalArc";
import { PillInput } from "@/components/ui/PillInput";
import { PillToggleGroup } from "@/components/ui/PillToggleGroup";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import { fetchPublicJobs } from "@/lib/api";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/cn";

const FILTERS = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
] as const;

type Filter = (typeof FILTERS)[number];

export default function PublicJobBoardPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchPublicJobs()
      .then(setJobs)
      .catch((e) => setError(e.message ?? "Failed to load jobs"));
  }, []);

  const visible = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((j) => {
      if (filter === "Remote") {
        if (!/remote/i.test(j.location)) return false;
      } else if (filter !== "All") {
        if (j.employment_type !== filter) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const hay = [
          j.title,
          j.department,
          j.location,
          (j.required_skills || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, filter, query]);

  return (
    <main className="relative">
      <FloatingNavPill variant="applicant" />

      <section className="relative overflow-hidden px-6 pt-20 md:px-12">
        <GhostWatermark text="CAREERS" align="right" />
        <div className="relative z-10 mx-auto max-w-[1280px] py-16 md:py-24">
          <EyebrowLabel>Open roles</EyebrowLabel>
          <h1 className="mt-6 max-w-3xl">Find your next role.</h1>
          <p className="mt-6 max-w-2xl text-slate text-[16px]">
            Every role listed here uses AI-powered screening — apply once, get a fair shot.
          </p>
          <div className="mt-10 max-w-2xl">
            <PillInput
              type="search"
              placeholder="Search roles, skills, or teams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="overflow-x-auto pb-2">
            <PillToggleGroup
              options={FILTERS}
              value={filter}
              onChange={(v) => setFilter(v)}
              size="sm"
              ariaLabel="Filter jobs"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-32 pt-10 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          {error && (
            <div className="rounded-card bg-lifted p-8 text-center text-slate">
              {error}
            </div>
          )}

          {!error && jobs === null && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-card bg-lifted/60 animate-pulse"
                />
              ))}
            </div>
          )}

          {!error && jobs !== null && visible.length === 0 && (
            <EmptyState />
          )}

          {!error && visible.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {visible.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function JobCard({ job }: { job: Job }) {
  const salary =
    job.salary_min && job.salary_max
      ? `${job.currency ?? "₹"}${formatNumber(job.salary_min)} – ${job.currency ?? "₹"}${formatNumber(job.salary_max)}`
      : null;
  return (
    <article className="relative flex flex-col gap-4 rounded-card bg-lifted p-8 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <EyebrowLabel>{job.department}</EyebrowLabel>
          <h3 className="mt-3 text-[24px] font-medium tracking-tight-2">{job.title}</h3>
          <p className="mt-2 text-[14px] text-slate">📍 {job.location}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-pill border border-ink px-3 py-0.5 text-[12px] font-medium text-ink">
          {job.employment_type}
        </span>
        <span className="inline-flex items-center rounded-pill border border-ink px-3 py-0.5 text-[12px] font-medium text-ink">
          {job.experience_level}
        </span>
        {salary && (
          <span className="text-[14px] font-medium text-ink">{salary}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="text-[14px] text-slate">
          {job.deadline ? <>⌛ Closes {job.deadline}</> : <>⌛ Open</>}
          <span className="mx-2 text-ink/30">·</span>
          {timeAgo(job.created_at)}
        </div>
        <Link href={`/jobs/${job.slug}`}>
          <Button variant="primary" size="sm" rightIcon={<span>→</span>}>
            Apply Now
          </Button>
        </Link>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-12 text-center">
      <div className="relative">
        <div className="h-40 w-40 rounded-full border-2 border-arc bg-white" />
        <OrbitalArc
          size={200}
          className="absolute -left-5 -top-5"
        />
      </div>
      <h3 className="mt-8">No roles match your search</h3>
      <p className="mt-3 text-slate">Try adjusting your filters or check back soon.</p>
    </div>
  );
}

function formatNumber(n: number) {
  if (n >= 100000) return `${Math.round(n / 100000)}L`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 14) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
