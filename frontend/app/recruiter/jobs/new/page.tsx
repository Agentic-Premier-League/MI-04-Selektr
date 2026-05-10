"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { GhostWatermark } from "@/components/ui/GhostWatermark";
import { PillInput } from "@/components/ui/PillInput";
import { PillToggleGroup } from "@/components/ui/PillToggleGroup";
import { TagInput } from "@/components/ui/TagInput";
import { Textarea } from "@/components/ui/Textarea";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import { createJob } from "@/lib/api";
import type { Visibility } from "@/lib/types";
import { cn } from "@/lib/cn";

const EMPLOYMENT = ["Full-time", "Part-time", "Contract", "Internship"] as const;
const LEVELS = ["Entry", "Mid", "Senior", "Lead"] as const;
const CURRENCIES = ["INR", "USD", "EUR"] as const;

interface FormState {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  salary_min: string;
  salary_max: string;
  currency: string;
  deadline: string;
  max_applicants: string;
  visibility: Visibility;
}

const EMPTY: FormState = {
  title: "",
  department: "",
  location: "",
  employment_type: "Full-time",
  experience_level: "Mid",
  description: "",
  required_skills: [],
  nice_to_have_skills: [],
  salary_min: "",
  salary_max: "",
  currency: "INR",
  deadline: "",
  max_applicants: "",
  visibility: "public",
};

export default function CreateJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const slugPreview = useMemo(() => {
    if (!form.title.trim()) return null;
    const base = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return `${base || "job"}-xxxx`;
  }, [form.title]);

  const canSubmit =
    form.title.trim() !== "" &&
    form.department.trim() !== "" &&
    form.location.trim() !== "" &&
    form.description.trim() !== "" &&
    form.required_skills.length > 0 &&
    !submitting;

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        employment_type: form.employment_type,
        experience_level: form.experience_level,
        description: form.description.trim(),
        required_skills: form.required_skills,
        nice_to_have_skills: form.nice_to_have_skills,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        currency: form.salary_min || form.salary_max ? form.currency : null,
        deadline: form.deadline || null,
        max_applicants: form.max_applicants ? Number(form.max_applicants) : null,
        visibility: form.visibility,
      };
      const job = await createJob(payload);
      router.push(`/recruiter/jobs/${job.id}`);
    } catch (e: any) {
      setError(e?.message ?? "Could not create job");
      setSubmitting(false);
    }
  }

  return (
    <main className="relative pb-32">
      <FloatingNavPill variant="recruiter" rightSlot={<Avatar />} />

      <section className="relative overflow-hidden px-6 pt-16 md:px-12">
        <GhostWatermark text="POST" align="left" />
        <div className="relative z-10 mx-auto max-w-[1280px] py-12 md:py-16">
          <Link href="/recruiter" className="text-[14px] text-slate hover:text-ink">
            ← Dashboard
          </Link>
          <div className="mt-6">
            <EyebrowLabel>New position</EyebrowLabel>
          </div>
          <h1 className="mt-6">Post a job</h1>
          <p className="mt-4 max-w-2xl text-slate">
            Fill in the details below. Your AI screening will activate the moment the first
            application arrives.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12">
        <div className="mx-auto max-w-[920px]">
          <div className="rounded-card bg-lifted p-8 shadow-card md:p-12">
            {error && (
              <div className="mb-6 rounded-msg border border-signal bg-[#FEF3F0] px-5 py-3 text-[14px] text-signal">
                {error}
              </div>
            )}

            {/* Section 1 */}
            <SectionHeader eyebrow="Role details" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Job Title" required>
                <PillInput
                  placeholder="e.g. Senior Frontend Engineer"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Department" required>
                <PillInput
                  placeholder="e.g. Engineering, Design, Product"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                />
              </Field>
              <Field label="Location" required className="md:col-span-2">
                <PillInput
                  placeholder="e.g. Remote · Bangalore · Hybrid"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-6">
              <Field label="Employment Type" required>
                <PillToggleGroup
                  options={EMPLOYMENT}
                  value={form.employment_type as (typeof EMPLOYMENT)[number]}
                  onChange={(v) => set("employment_type", v)}
                />
              </Field>
            </div>
            <div className="mt-6">
              <Field label="Experience Level" required>
                <PillToggleGroup
                  options={LEVELS}
                  value={form.experience_level as (typeof LEVELS)[number]}
                  onChange={(v) => set("experience_level", v)}
                />
              </Field>
            </div>

            {/* Section 2 */}
            <SectionHeader eyebrow="Description" className="mt-12" />
            <Field label="Job Description" required>
              <Textarea
                rows={8}
                placeholder="Describe the role, responsibilities, and what success looks like in this position..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <div className="mt-6">
              <Field label="Required Skills" required>
                <TagInput
                  value={form.required_skills}
                  onChange={(v) => set("required_skills", v)}
                  placeholder="Type a skill and press Enter — e.g. React, Python, SQL"
                />
              </Field>
            </div>
            <div className="mt-6">
              <Field label="Nice-to-have Skills">
                <TagInput
                  value={form.nice_to_have_skills}
                  onChange={(v) => set("nice_to_have_skills", v)}
                  placeholder="Optional skills that would be a bonus"
                  variant="slate"
                />
              </Field>
            </div>

            {/* Section 3 */}
            <SectionHeader eyebrow="Details" className="mt-12" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Salary Min">
                <PillInput
                  type="number"
                  placeholder={`${form.currency === "INR" ? "₹" : "$"} Min`}
                  value={form.salary_min}
                  onChange={(e) => set("salary_min", e.target.value)}
                />
              </Field>
              <Field label="Salary Max">
                <PillInput
                  type="number"
                  placeholder={`${form.currency === "INR" ? "₹" : "$"} Max`}
                  value={form.salary_max}
                  onChange={(e) => set("salary_max", e.target.value)}
                />
              </Field>
              <Field label="Currency">
                <PillToggleGroup
                  options={CURRENCIES}
                  value={form.currency as (typeof CURRENCIES)[number]}
                  onChange={(v) => set("currency", v)}
                  size="sm"
                />
              </Field>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Application Deadline">
                <PillInput
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                />
              </Field>
              <Field label="Max Applicants">
                <PillInput
                  type="number"
                  placeholder="Leave blank for unlimited"
                  value={form.max_applicants}
                  onChange={(e) => set("max_applicants", e.target.value)}
                />
              </Field>
            </div>

            {/* Section 4 */}
            <SectionHeader eyebrow="Visibility" className="mt-12" />
            <p className="mb-6 text-[14px] text-slate">
              Control who can find and apply to this role.
            </p>
            <VisibilityToggle
              value={form.visibility}
              onChange={(v) => set("visibility", v)}
            />

            {/* Section 5 — Slug preview */}
            {slugPreview && (
              <>
                <SectionHeader eyebrow="Shareable link" className="mt-12" />
                <div className="flex items-center gap-3 rounded-pill border border-ink/40 bg-white px-5 py-3 text-[14px]">
                  <span className="text-slate">hireiq.app/jobs/</span>
                  <span className="flex-1 truncate text-ink">{slugPreview}</span>
                  <span className="rounded-pill bg-ink px-3 py-1 text-[12px] text-cream">
                    Preview
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-slate">
                  Final link with a unique suffix is generated when you post.
                </p>
              </>
            )}

            {/* Footer */}
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={onSubmit}
                disabled={!canSubmit}
              >
                {submitting ? "Posting..." : "Post Job"}
              </Button>
              <Link href="/recruiter">
                <span className="text-[14px] text-slate hover:text-ink">Discard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, className }: { eyebrow: string; className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      <EyebrowLabel>{eyebrow}</EyebrowLabel>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-slate">
        {label}
        {required && <span className="ml-1 text-signal">*</span>}
      </span>
      {children}
    </label>
  );
}

function VisibilityToggle({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (next: Visibility) => void;
}) {
  return (
    <div className="rounded-card bg-canvas p-2 space-y-2">
      <Option
        active={value === "public"}
        title="Public"
        body="Listed on the HireIQ job board. Anyone with the link can apply."
        onClick={() => onChange("public")}
      />
      <Option
        active={value === "private"}
        title="Private"
        body="Not listed on the job board. Only people with the direct link can apply."
        onClick={() => onChange("private")}
      />
    </div>
  );
}

function Option({
  active,
  title,
  body,
  onClick,
}: {
  active: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-4 rounded-card p-6 text-left transition-all",
        active ? "bg-lifted shadow-card border-[1.5px] border-arc" : "bg-lifted/60 border-[1.5px] border-transparent hover:bg-lifted",
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px]",
          active ? "border-arc bg-arc" : "border-ink bg-white",
        )}
      >
        {active && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <span>
        <span className="block text-[14px] font-bold uppercase tracking-eyebrow text-ink">
          {title}
        </span>
        <span className="mt-1 block text-[14px] text-slate">{body}</span>
      </span>
    </button>
  );
}

function Avatar() {
  return (
    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink bg-white text-[14px] font-medium">
      R
    </div>
  );
}
