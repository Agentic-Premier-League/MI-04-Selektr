"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { GhostWatermark } from "@/components/ui/GhostWatermark";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import { fetchJobBySlug } from "@/lib/api";
import type { Job } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchJobBySlug(slug)
      .then(setJob)
      .catch((e) => setError(e.message ?? "Job not found"));
  }, [slug]);

  if (error) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="applicant" />
        <div className="mx-auto mt-32 max-w-md rounded-card bg-lifted p-12 text-center">
          <h2>Role not found</h2>
          <p className="mt-3 text-slate">
            This role may have closed or the link is incorrect.
          </p>
          <Link href="/jobs" className="mt-6 inline-block">
            <Button variant="secondary">← All Jobs</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="applicant" />
        <div className="mx-auto mt-32 h-96 max-w-3xl rounded-card bg-lifted/60 animate-pulse" />
      </main>
    );
  }

  const isPublic = job.visibility === "public";
  const salary =
    job.salary_min && job.salary_max
      ? `${job.currency ?? "₹"} ${job.salary_min.toLocaleString()} – ${job.currency ?? "₹"} ${job.salary_max.toLocaleString()}`
      : null;

  return (
    <main className="relative pb-32">
      <FloatingNavPill variant="applicant" />

      <section className="relative overflow-hidden px-6 pt-16 md:px-12">
        <GhostWatermark text={job.department.toUpperCase()} align="left" />
        <div className="relative z-10 mx-auto max-w-[1280px] py-12 md:py-16">
          {isPublic && (
            <Link href="/jobs" className="text-[14px] text-slate hover:text-ink">
              ← All Jobs
            </Link>
          )}
          <div className="mt-6">
            <EyebrowLabel>{job.department}</EyebrowLabel>
          </div>
          <h1 className="mt-6 max-w-3xl">{job.title}</h1>

          <div className="mt-6 flex flex-wrap gap-3 text-[14px] text-slate">
            <Pill>📍 {job.location}</Pill>
            <Pill>⏱ {job.employment_type}</Pill>
            <Pill>📊 {job.experience_level}</Pill>
            {job.deadline && <Pill>⌛ {job.deadline}</Pill>}
          </div>

          <div className="mt-10">
            <Link href={`/apply/${job.slug}`}>
              <Button variant="primary" size="lg" rightIcon={<span>→</span>}>
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-[720px] py-12 md:py-16">
          <Section eyebrow="The role" title="About this role">
            <p className="whitespace-pre-line text-[16px] font-[450] leading-[1.6]">
              {job.description}
            </p>
          </Section>

          {job.required_skills.length > 0 && (
            <Section eyebrow="Requirements" title="Required skills">
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-pill border border-ink px-3 py-0.5 text-[12px] font-medium text-ink"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {job.nice_to_have_skills.length > 0 && (
            <Section eyebrow="Bonus skills" title="Nice to have">
              <div className="flex flex-wrap gap-2">
                {job.nice_to_have_skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-pill border border-slate px-3 py-0.5 text-[12px] font-medium text-slate"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {salary && (
            <Section eyebrow="Compensation" title="Salary range">
              <h3>{salary}</h3>
            </Section>
          )}

          {job.deadline && (
            <Section eyebrow="Deadline" title="Apply by">
              <p className="text-[16px] font-medium">{job.deadline}</p>
            </Section>
          )}
        </div>
      </section>

      {/* Sticky mobile apply bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-ink/10 bg-white px-6 py-3 md:hidden">
        <h3 className="truncate text-[18px] font-medium tracking-tight-2">{job.title}</h3>
        <Link href={`/apply/${job.slug}`}>
          <Button variant="primary" size="sm">
            Apply
          </Button>
        </Link>
      </div>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-ink/10 py-10 first:border-t-0 first:pt-0">
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
      <h2 className="mt-4 text-[28px]">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-lifted px-4 py-1 text-[14px]">
      {children}
    </span>
  );
}
