"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { GhostWatermark } from "@/components/ui/GhostWatermark";
import { OrbitalArc } from "@/components/ui/OrbitalArc";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import { fetchAllJobs } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function RecruiterDashboardPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllJobs()
      .then(setJobs)
      .catch((e) => setError(e.message ?? "Failed to load jobs"));
  }, []);

  const stats = useMemo(() => {
    if (!jobs) return null;
    const open = jobs.filter((j) => j.status === "active").length;
    const totalApps = jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0);
    const scoredJobs = jobs.filter((j) => j.top_score !== null);
    const avgTop =
      scoredJobs.length === 0
        ? 0
        : Math.round(
            scoredJobs.reduce((acc, j) => acc + (j.top_score || 0), 0) /
              scoredJobs.length,
          );
    // red flags can be approximated by jobs lacking top_score in mvp
    return { open, totalApps, avgTop, redFlags: 0 };
  }, [jobs]);

  return (
    <main className="relative pb-32">
      <FloatingNavPill variant="recruiter" rightSlot={<RecruiterAvatar />} />

      <section className="relative overflow-hidden px-6 pt-16 md:px-12">
        <GhostWatermark text="RECRUIT" align="left" />
        <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div>
            <EyebrowLabel>Overview</EyebrowLabel>
            <h1 className="mt-6">Your hiring pipeline.</h1>
            <p className="mt-4 max-w-xl text-slate">
              AI-screened candidates, ranked and ready.
            </p>
          </div>
          <Link href="/recruiter/jobs/new">
            <Button variant="primary" size="lg">
              + Post a Job
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Open Positions" value={stats?.open ?? 0} loading={!jobs} />
            <StatCard
              label="Total Applications"
              value={stats?.totalApps ?? 0}
              loading={!jobs}
            />
            <StatCard
              label="Avg Top Score"
              value={stats?.avgTop ?? 0}
              suffix="/100"
              loading={!jobs}
            />
            <StatCard
              label="Red Flags Detected"
              value={stats?.redFlags ?? 0}
              icon="⚠"
              loading={!jobs}
            />
          </div>
        </div>
      </section>

      <section id="jobs" className="px-6 pt-16 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <EyebrowLabel>Your jobs</EyebrowLabel>
          <h2 className="mt-4">Active positions</h2>

          {error && (
            <div className="mt-8 rounded-card bg-lifted p-8 text-center text-slate">
              {error}
            </div>
          )}

          {!error && jobs === null && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 rounded-card bg-lifted/60 animate-pulse" />
              ))}
            </div>
          )}

          {!error && jobs !== null && jobs.length === 0 && <EmptyState />}

          {!error && jobs !== null && jobs.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function RecruiterAvatar() {
  return (
    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-white text-[14px] font-medium">
      R
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  loading,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-card bg-lifted p-8 shadow-card">
      <EyebrowLabel>{label}</EyebrowLabel>
      <div className="mt-6 flex items-baseline gap-2">
        {icon && value > 0 && <span className="text-[24px] text-signal">{icon}</span>}
        <span className="text-[44px] font-medium tracking-tight-2 text-ink">
          {loading ? "—" : value}
        </span>
        {suffix && <span className="text-[16px] text-slate">{suffix}</span>}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/jobs/${job.slug}`
    : `/jobs/${job.slug}`;
  return (
    <article className="relative flex flex-col gap-4 rounded-card bg-lifted p-8 shadow-card">
      <div className="absolute right-6 top-6">
        <Badge tone={job.visibility === "public" ? "public" : "private"}>
          {job.visibility}
        </Badge>
      </div>

      <div className="pr-24">
        <div className="flex items-center gap-3">
          <h3>{job.title}</h3>
          <Badge tone={job.status === "active" ? "active" : job.status === "paused" ? "paused" : "closed"}>
            {job.status}
          </Badge>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 text-[14px] text-slate">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-arc" />
          {job.department}
        </div>
        <p className="mt-1 text-[14px] text-slate">📍 {job.location}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[14px]">
        <span className="rounded-pill border border-ink px-3 py-0.5 text-[12px] font-medium">
          {job.employment_type}
        </span>
        <span className="text-slate">{job.deadline ? `Closes ${job.deadline}` : "Open"}</span>
        <span className="text-ink/30">·</span>
        <span className="font-medium text-ink">
          {job.applications_count} applicant{job.applications_count === 1 ? "" : "s"}
        </span>
        {job.top_score !== null && (
          <>
            <span className="text-ink/30">·</span>
            <span className="font-bold text-arc">Best: {job.top_score}/100</span>
          </>
        )}
      </div>

      <ShareableLink url={url} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link href={`/recruiter/jobs/${job.id}`} className="flex-1 min-w-[160px]">
          <Button variant="primary" fullWidth rightIcon={<span>→</span>}>
            View Pipeline
          </Button>
        </Link>
      </div>
    </article>
  );
}

function ShareableLink({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 rounded-pill border border-ink/40 bg-white px-4 py-1.5 text-[12px] text-slate">
      <span className="truncate">{url}</span>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url)}
        className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream"
        aria-label="Copy link"
      >
        ⧉
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto mt-12 flex max-w-md flex-col items-center text-center">
      <div className="relative">
        <div className="h-44 w-44 rounded-full border-2 border-arc bg-white" />
        <OrbitalArc size={220} className="absolute -left-6 -top-6" />
      </div>
      <h3 className="mt-8">No positions yet</h3>
      <p className="mt-3 text-slate">
        Post your first job to start screening candidates.
      </p>
      <Link href="/recruiter/jobs/new" className="mt-6">
        <Button variant="primary">+ Post a Job</Button>
      </Link>
    </div>
  );
}
