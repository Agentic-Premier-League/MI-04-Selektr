"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Clock, AlertTriangle, ArrowRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { PillInput } from "@/components/ui/PillInput";
import { PillToggleGroup } from "@/components/ui/PillToggleGroup";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import { ScoreDistribution } from "@/components/charts/ScoreDistribution";
import { FunnelChart } from "@/components/charts/FunnelChart";
import {
  fetchAnalytics,
  fetchCandidates,
  fetchJob,
  updateJob,
} from "@/lib/api";
import type { AnalyticsOut, CandidateRow, Job } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATUS_FILTERS = [
  "All",
  "New",
  "Screened",
  "Interviewed",
  "Shortlisted",
  "Rejected",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SORTS = ["By Score", "By Date", "By Interview"] as const;
type Sort = (typeof SORTS)[number];

export default function JobPipelinePage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<CandidateRow[] | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("By Score");

  useEffect(() => {
    if (!jobId) return;
    fetchJob(jobId).then(setJob).catch((e) => setError(e.message));
    fetchCandidates(jobId).then(setCandidates).catch((e) => setError(e.message));
    fetchAnalytics(jobId).then(setAnalytics).catch(() => {});
  }, [jobId]);

  const filtered = useMemo(() => {
    if (!candidates) return [];
    let rows = [...candidates];
    if (statusFilter !== "All") {
      rows = rows.filter((c) => c.status === statusFilter.toLowerCase());
    }
    if (flaggedOnly) {
      rows = rows.filter((c) => c.red_flags.length > 0);
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      if (sort === "By Date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "By Interview") {
        return (b.interview_score ?? 0) - (a.interview_score ?? 0);
      }
      return b.overall_score - a.overall_score;
    });
    return rows;
  }, [candidates, statusFilter, flaggedOnly, search, sort]);

  async function togglePause() {
    if (!job) return;
    const next = job.status === "active" ? "paused" : "active";
    const updated = await updateJob(job.id, { status: next });
    setJob(updated);
  }

  async function closeJob() {
    if (!job) return;
    if (!confirm("Close this position? Applicants will see it as closed.")) return;
    const updated = await updateJob(job.id, { status: "closed" });
    setJob(updated);
  }

  if (error && !job) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="recruiter" />
        <div className="mx-auto mt-32 max-w-md rounded-card bg-lifted p-12 text-center">
          <h2>Couldn&apos;t load this job</h2>
          <p className="mt-3 text-slate">{error}</p>
          <Link href="/recruiter" className="mt-6 inline-block">
            <Button variant="secondary">← Dashboard</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="recruiter" />
        <div className="mx-auto mt-32 h-96 max-w-3xl rounded-card bg-lifted/60 animate-pulse" />
      </main>
    );
  }

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/jobs/${job.slug}` : "";

  return (
    <main className="relative pb-32">
      <FloatingNavPill variant="recruiter" />

      <section className="px-6 pt-12 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <Link href="/recruiter" className="text-[14px] text-slate hover:text-ink">
            ← All Jobs
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge tone={job.visibility === "public" ? "public" : "private"}>
              {job.visibility}
            </Badge>
            <Badge tone={job.status as "active" | "paused" | "closed"}>{job.status}</Badge>
          </div>
          <h1 className="mt-4">{job.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-slate">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {job.location}</span>
            <span>·</span>
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {job.employment_type}</span>
            {job.deadline && (
              <>
                <span>·</span>
                <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> Closes {job.deadline}</span>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ShareableLink url={url} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={togglePause}>
              {job.status === "paused" ? "Resume" : "Pause"}
            </Button>
            <Button variant="clay" size="sm" onClick={closeJob}>
              Close Position
            </Button>
          </div>
        </div>
      </section>

      {/* Controls bar */}
      <section className="px-6 pt-12 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-wrap items-center gap-3 rounded-card bg-lifted p-4 px-6">
            <div className="flex-1 min-w-[200px]">
              <PillInput
                type="search"
                placeholder="Search candidates by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <PillToggleGroup
              options={SORTS}
              value={sort}
              onChange={setSort}
              size="sm"
            />
            <button
              type="button"
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              className={cn(
                "rounded-pill border-[1.5px] px-4 py-1.5 text-[14px] font-medium",
                flaggedOnly
                  ? "border-signal bg-[#FEF3F0] text-signal"
                  : "border-ink bg-white text-ink",
              )}
            >
              {flaggedOnly ? "✓ Flagged Only" : "Show Flagged Only"}
            </button>
          </div>
          <div className="mt-3 overflow-x-auto pb-1">
            <PillToggleGroup
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={setStatusFilter}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Candidate rows */}
      <section className="px-6 pt-8 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          {candidates === null && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-card bg-lifted/60 animate-pulse" />
              ))}
            </div>
          )}

          {candidates !== null && filtered.length === 0 && (
            <div className="rounded-card bg-lifted p-16 text-center">
              <h3>No candidates yet</h3>
              <p className="mt-3 text-slate">
                Share the job link — applicants will appear here ranked by AI score.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((c, idx) => (
              <CandidateRowCard key={c.id} jobId={job.id} candidate={c} rank={idx + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section id="analytics" className="px-6 pt-20 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <EyebrowLabel>Pipeline analytics</EyebrowLabel>
          <h2 className="mt-4">Performance</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-card bg-lifted p-8 shadow-card">
              <h3>Candidate score distribution</h3>
              <div className="mt-6">
                {analytics ? (
                  <ScoreDistribution buckets={analytics.score_distribution} />
                ) : (
                  <div className="h-56 rounded-msg bg-lifted/60 animate-pulse" />
                )}
              </div>
            </div>
            <div className="rounded-card bg-lifted p-8 shadow-card">
              <h3>Conversion funnel</h3>
              <div className="mt-6">
                {analytics ? (
                  <FunnelChart funnel={analytics.funnel} />
                ) : (
                  <div className="h-56 rounded-msg bg-lifted/60 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CandidateRowCard({
  jobId,
  candidate,
  rank,
}: {
  jobId: string;
  candidate: CandidateRow;
  rank: number;
}) {
  return (
    <Link
      href={`/recruiter/jobs/${jobId}/candidate/${candidate.id}`}
      className="group block rounded-card bg-lifted shadow-nav transition-shadow hover:shadow-card"
    >
      <article className="flex flex-wrap items-center gap-6 p-6 md:flex-nowrap md:p-8">
        <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ink text-cream font-bold">
          #{rank}
        </div>
        <div className="flex-1 min-w-[180px]">
          <h3 className="text-[20px] md:text-[24px]">{candidate.full_name}</h3>
          <p className="text-[14px] text-slate">{timeAgo(candidate.created_at)}</p>
        </div>
        <ScoreCircle value={candidate.overall_score} size={56} />
        <div className="flex flex-col gap-1 text-[14px]">
          <span className="font-medium">Resume: {candidate.overall_score}</span>
          <span className="text-slate">
            Interview: {candidate.interview_score ?? "Pending —"}
          </span>
        </div>
        {candidate.red_flags.length > 0 && (
          <Badge tone="warning"><AlertTriangle className="h-3 w-3 mr-1 inline" /> {candidate.red_flags.length} flags</Badge>
        )}
        <Badge tone={candidate.status}>{candidate.status}</Badge>
        <div className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink bg-white transition-transform group-hover:translate-x-1">
          <ArrowRight className="h-5 w-5" />
        </div>
      </article>
    </Link>
  );
}

function ShareableLink({ url }: { url: string }) {
  return (
    <div className="flex w-full max-w-md items-center gap-2 rounded-pill border border-ink/40 bg-white px-4 py-1.5 text-[14px] text-slate">
      <span className="truncate">{url}</span>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(url)}
        className="flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream"
        aria-label="Copy link"
      >
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(1, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "Applied just now";
  if (diffSec < 3600) return `Applied ${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `Applied ${Math.floor(diffSec / 3600)}h ago`;
  return `Applied ${Math.floor(diffSec / 86400)}d ago`;
}
