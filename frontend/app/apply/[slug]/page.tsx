"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { GhostWatermark } from "@/components/ui/GhostWatermark";
import { LoadingArc } from "@/components/ui/LoadingArc";
import { PillInput } from "@/components/ui/PillInput";
import { PillToggleGroup } from "@/components/ui/PillToggleGroup";
import { StepProgress } from "@/components/ui/StepProgress";
import { Textarea } from "@/components/ui/Textarea";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import { fetchJobBySlug, submitAnswers, submitApplication } from "@/lib/api";
import type { Job, QuestionOut } from "@/lib/types";
import { cn } from "@/lib/cn";

const YEARS = ["0–1 yr", "1–3 yrs", "3–5 yrs", "5–8 yrs", "8+ yrs"] as const;
const EDU = ["High School", "Diploma", "B.Tech / B.E.", "M.Tech / MBA", "PhD"] as const;

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  portfolio_url: string;
  years_experience: string;
  current_role: string;
  education: string;
  resume_text: string;
  pdf: File | null;
  consent_own_work: boolean;
  consent_privacy: boolean;
}

const EMPTY_PROFILE: Profile = {
  full_name: "",
  email: "",
  phone: "",
  linkedin_url: "",
  portfolio_url: "",
  years_experience: "",
  current_role: "",
  education: "",
  resume_text: "",
  pdf: null,
  consent_own_work: false,
  consent_privacy: false,
};

export default function ApplicationFormPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [job, setJob] = useState<Job | null>(null);
  const [step, setStep] = useState<1 | 2 | "loading">(1);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionOut[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchJobBySlug(slug)
      .then(setJob)
      .catch((e) => setError(e.message ?? "Job not found"));
  }, [slug]);

  const resumeChars = profile.pdf ? Infinity : profile.resume_text.length;
  const resumeOk = profile.pdf !== null || profile.resume_text.length >= 200;

  const canSubmitStep1 =
    profile.full_name.trim() !== "" &&
    profile.email.trim() !== "" &&
    profile.years_experience !== "" &&
    resumeOk &&
    profile.consent_own_work &&
    profile.consent_privacy &&
    !submitting;

  const canSubmitStep2 =
    answers.length === questions.length &&
    answers.every((a) => a.trim().length > 0) &&
    !submitting;

  async function onStep1Submit() {
    if (!job) return;
    setSubmitting(true);
    setError(null);
    setStep("loading");
    try {
      const fd = new FormData();
      fd.append("full_name", profile.full_name);
      fd.append("email", profile.email);
      if (profile.phone) fd.append("phone", profile.phone);
      if (profile.linkedin_url) fd.append("linkedin_url", profile.linkedin_url);
      if (profile.portfolio_url) fd.append("portfolio_url", profile.portfolio_url);
      if (profile.years_experience) fd.append("years_experience", profile.years_experience);
      if (profile.current_role) fd.append("current_role", profile.current_role);
      if (profile.education) fd.append("education", profile.education);
      if (profile.pdf) {
        fd.append("resume_pdf", profile.pdf);
      } else {
        fd.append("resume_text", profile.resume_text);
      }
      const res = await submitApplication(job.id, fd);
      setCandidateId(res.candidate_id);
      setQuestions(res.questions);
      setAnswers(res.questions.map(() => ""));
      setStep(2);
    } catch (e: any) {
      setError(e?.message ?? "Could not submit application");
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  }

  async function onStep2Submit() {
    if (!candidateId || !job) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitAnswers(candidateId, answers);
      router.push(`/apply/${job.slug}/done${job.visibility === "private" ? "?private=1" : ""}`);
    } catch (e: any) {
      setError(e?.message ?? "Could not submit answers");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !job) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="applicant" />
        <div className="mx-auto mt-32 max-w-md rounded-card bg-lifted p-12 text-center">
          <h2>Role not found</h2>
          <p className="mt-3 text-slate">{error}</p>
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

  return (
    <main className="relative pb-24">
      <FloatingNavPill variant="applicant" />

      <section className="relative overflow-hidden px-6 pt-16 md:px-12">
        <GhostWatermark text="APPLY" align="left" />
        <div className="relative z-10 mx-auto max-w-[1280px] py-12 md:py-16">
          <EyebrowLabel>{job.title}</EyebrowLabel>
          <h1 className="mt-6">Your application</h1>
          <div className="mt-6">
            <StepProgress step={step === "loading" ? 1 : step} />
          </div>
        </div>
      </section>

      {step === "loading" && <LoadingScreen />}

      {step === 1 && (
        <Step1
          profile={profile}
          setProfile={setProfile}
          resumeChars={resumeChars}
          canSubmit={canSubmitStep1}
          onSubmit={onStep1Submit}
          error={error}
        />
      )}

      {step === 2 && (
        <Step2
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          canSubmit={canSubmitStep2}
          onSubmit={onStep2Submit}
          error={error}
          submitting={submitting}
        />
      )}
    </main>
  );
}

// ----- Step 1 -----

function Step1({
  profile,
  setProfile,
  resumeChars,
  canSubmit,
  onSubmit,
  error,
}: {
  profile: Profile;
  setProfile: (p: Profile) => void;
  resumeChars: number;
  canSubmit: boolean;
  onSubmit: () => void;
  error: string | null;
}) {
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile({ ...profile, [key]: value });

  return (
    <section className="px-6 md:px-12">
      <div className="mx-auto max-w-[920px]">
        <div className="rounded-card bg-lifted p-8 shadow-card md:p-12">
          {error && (
            <div className="mb-6 rounded-msg border border-signal bg-[#FEF3F0] px-5 py-3 text-[14px] text-signal">
              {error}
            </div>
          )}

          {/* Section A */}
          <SectionHeader eyebrow="About you" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full Name" required>
              <PillInput
                placeholder="Your full name"
                value={profile.full_name}
                onChange={(e) => set("full_name", e.target.value)}
              />
            </Field>
            <Field label="Email Address" required>
              <PillInput
                type="email"
                placeholder="you@example.com"
                value={profile.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="Phone Number">
              <PillInput
                type="tel"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field label="LinkedIn URL">
              <PillInput
                placeholder="linkedin.com/in/yourprofile"
                value={profile.linkedin_url}
                onChange={(e) => set("linkedin_url", e.target.value)}
              />
            </Field>
            <Field label="Portfolio / GitHub" className="md:col-span-2">
              <PillInput
                placeholder="github.com/yourusername"
                value={profile.portfolio_url}
                onChange={(e) => set("portfolio_url", e.target.value)}
              />
            </Field>
          </div>

          {/* Section B */}
          <SectionHeader eyebrow="Experience" className="mt-12" />
          <Field label="Years of Experience" required>
            <PillToggleGroup
              options={YEARS}
              value={(profile.years_experience as (typeof YEARS)[number]) || null}
              onChange={(v) => set("years_experience", v)}
            />
          </Field>
          <div className="mt-6">
            <Field label="Current / Last Role">
              <PillInput
                placeholder="e.g. Software Engineer at Infosys"
                value={profile.current_role}
                onChange={(e) => set("current_role", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-6">
            <Field label="Highest Education">
              <PillToggleGroup
                options={EDU}
                value={(profile.education as (typeof EDU)[number]) || null}
                onChange={(v) => set("education", v)}
              />
            </Field>
          </div>

          {/* Section C — Resume */}
          <SectionHeader eyebrow="Your resume" className="mt-12" />
          <p className="text-[14px] text-slate">
            Upload a PDF or paste the full text of your resume below — include experience,
            skills, education, and projects. The more detail, the better your AI screening will be.
          </p>

          <PdfDropzone
            file={profile.pdf}
            onPick={(f) => set("pdf", f)}
            onClear={() => set("pdf", null)}
          />

          <div className="my-4 flex items-center gap-3 text-[12px] uppercase tracking-eyebrow text-slate">
            <span className="h-px flex-1 bg-ink/10" />
            or paste text below
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <Field label="Resume Text" required={profile.pdf === null}>
            <Textarea
              rows={10}
              placeholder="Paste your complete resume here..."
              value={profile.resume_text}
              onChange={(e) => set("resume_text", e.target.value)}
              disabled={profile.pdf !== null}
              invalid={profile.pdf === null && profile.resume_text.length > 0 && profile.resume_text.length < 200}
            />
          </Field>
          {profile.pdf === null && (
            <div className="mt-2 text-right text-[12px]">
              {profile.resume_text.length === 0 ? (
                <span className="text-slate">Paste your resume above</span>
              ) : profile.resume_text.length < 200 ? (
                <span className="text-signal">
                  {profile.resume_text.length} characters · Too short — add more detail
                </span>
              ) : (
                <span className="text-slate">
                  {profile.resume_text.length.toLocaleString()} characters · Looks good ✓
                </span>
              )}
            </div>
          )}

          {/* Section D — Consent */}
          <SectionHeader eyebrow="Consent" className="mt-12" />
          <div className="space-y-3 text-[14px]">
            <Checkbox
              checked={profile.consent_own_work}
              onChange={(v) => set("consent_own_work", v)}
            >
              I confirm this is my own work and the information provided is accurate.
            </Checkbox>
            <Checkbox
              checked={profile.consent_privacy}
              onChange={(v) => set("consent_privacy", v)}
            >
              I agree to HireIQ&apos;s{" "}
              <span className="text-link underline">privacy policy</span> and consent to AI
              processing of my application.
            </Checkbox>
            <p className="pt-2 text-[12px] text-slate">
              Your application is processed by AI. No humans will see your details until you pass initial screening.
            </p>
          </div>

          <div className="mt-10">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canSubmit}
              onClick={onSubmit}
              rightIcon={<span>→</span>}
            >
              Continue to Interview Questions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- Step 2 -----

function Step2({
  questions,
  answers,
  setAnswers,
  canSubmit,
  onSubmit,
  error,
  submitting,
}: {
  questions: QuestionOut[];
  answers: string[];
  setAnswers: (a: string[]) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  error: string | null;
  submitting: boolean;
}) {
  return (
    <section className="px-6 md:px-12">
      <div className="mx-auto max-w-[920px]">
        <div className="rounded-card bg-lifted p-8 shadow-card md:p-12">
          {error && (
            <div className="mb-6 rounded-msg border border-signal bg-[#FEF3F0] px-5 py-3 text-[14px] text-signal">
              {error}
            </div>
          )}
          <EyebrowLabel>Your interview</EyebrowLabel>
          <h2 className="mt-4">Answer these questions</h2>
          <p className="mt-3 text-slate">
            Take your time — there&apos;s no time limit. Your answers will be scored by AI alongside your resume.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-white px-5 py-1.5 text-[14px] text-slate">
            ⏱ No time limit
          </div>

          <div className="mt-8 divide-y divide-ink/10">
            {questions.map((q, idx) => {
              const value = answers[idx] ?? "";
              const answered = value.trim().length > 0;
              return (
                <div key={q.id} className="py-8 first:pt-0">
                  <EyebrowLabel tone="slate">
                    Question {idx + 1} of {questions.length}
                  </EyebrowLabel>
                  <h3 className="mt-3 text-[20px] md:text-[24px]">{q.text}</h3>
                  <Textarea
                    className="mt-4"
                    rows={5}
                    placeholder="Write your answer here — be specific and genuine."
                    value={value}
                    onChange={(e) => {
                      const next = [...answers];
                      next[idx] = e.target.value;
                      setAnswers(next);
                    }}
                  />
                  <div className="mt-2 flex justify-between text-[12px]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        answered ? "text-arc" : "text-slate",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          answered ? "bg-arc" : "bg-slate",
                        )}
                      />
                      {answered ? "Answer saved ✓" : "Not answered"}
                    </span>
                    <span className="text-slate">
                      {value.length} / 800 recommended
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
            <p className="mt-3 text-center text-[12px] text-slate">
              Once submitted, you cannot edit your answers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- Loading Screen -----

function LoadingScreen() {
  return (
    <section className="px-6 md:px-12">
      <div className="mx-auto max-w-[920px]">
        <div className="flex flex-col items-center gap-6 rounded-card bg-lifted p-16 text-center shadow-card">
          <LoadingArc size={80} />
          <div>
            <h3 className="text-[20px]">✦ Generating your personalized questions...</h3>
            <p className="mt-3 text-slate">
              We&apos;re crafting questions based on your resume and this role.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ----- bits -----

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

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border-[1.5px] border-ink transition-colors",
          checked ? "bg-ink text-cream" : "bg-white",
        )}
      >
        {checked && <span aria-hidden>✓</span>}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-[14px] font-[450] text-ink">{children}</span>
    </label>
  );
}

function PdfDropzone({
  file,
  onPick,
  onClear,
}: {
  file: File | null;
  onPick: (f: File) => void;
  onClear: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type === "application/pdf") onPick(f);
      }}
      className={cn(
        "mt-4 rounded-card border-2 border-dashed p-8 text-center transition-colors",
        hover ? "border-arc bg-arc/5" : "border-ink/30 bg-white",
      )}
    >
      {file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream text-[18px]">
              📄
            </span>
            <div>
              <div className="text-[16px] font-medium text-ink">{file.name}</div>
              <div className="text-[12px] text-slate">
                {(file.size / 1024).toFixed(0)} KB
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onClear}>
            Remove
          </Button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <span className="text-[16px] font-medium text-ink">Drop a PDF here</span>
          <span className="block text-[14px] text-slate mt-1">or click to choose a file</span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
            }}
          />
        </label>
      )}
    </div>
  );
}
