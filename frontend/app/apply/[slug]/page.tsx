"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { Check, Clock, Sparkles, FileText } from "lucide-react";
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
  full_name: "Vivian Demello",
  email: "vynride@gmail.com",
  phone: "+91123456789",
  linkedin_url: "linkedin.com/in/viviandemello",
  portfolio_url: "github.com/vynride",
  years_experience: "",
  current_role: "Software Engineer at Google",
  education: "",
  resume_text: `1. React Performance Strategy for Large, Frequently Updated Datasets

For a React application handling large and frequently changing datasets, I focus on solving two separate problems:
1. Fast initial render/load
2. Efficient incremental updates without unnecessary re-renders

For fast initial load time:
- I would implement route-level and component-level code splitting using React.lazy and dynamic imports so users only download what is immediately necessary.
- I would aggressively reduce bundle size:
  - Tree shaking
  - Avoiding heavy dependencies
  - Using lighter alternatives where possible
  - Splitting vendor bundles
- I would use server-side pagination or cursor-based fetching instead of loading entire datasets upfront.
- For tabular or infinite-scroll interfaces, I would use virtualization libraries like react-window or react-virtualized so only visible rows are rendered.
- I would cache API responses using React Query / TanStack Query or SWR to avoid redundant requests and improve perceived performance.
- I would optimize static assets and API payloads:
  - Compression (gzip/brotli)
  - Lazy image loading
  - Compact JSON responses
  - Selective field fetching

For smooth responsive updates:
- I would normalize state and avoid deeply nested state structures to minimize expensive reconciliation.
- I would isolate frequently changing components from stable UI components to reduce cascading re-renders.
- I would heavily use:
  - memo
  - useMemo
  - useCallback
  - selector-based state access
- For high-frequency updates, I would batch or debounce updates instead of re-rendering on every event.
- I would use WebSockets or Server-Sent Events for incremental updates instead of polling.
- For extremely large datasets, I would implement delta updates where only changed records are transmitted.
- If computations are expensive, I would move processing to:
  - Web Workers
  - Backend aggregation services
  - Cached derived state

For monitoring:
- I rely on Lighthouse, React Profiler, Chrome Performance tools, and production telemetry to identify render bottlenecks.
- I usually measure:
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Re-render frequency
  - Component mount times
  - Memory usage growth over time

One important lesson I’ve learned is that React performance problems are often architecture problems rather than rendering problems. Preventing unnecessary data movement and reducing UI churn usually matters more than micro-optimizing components.

2. Significant Technical Challenge in AI/ML or Microservices Work

One significant challenge I faced was in an AI document-processing pipeline involving RAG indexing and multiple Python microservices.

The original design used synchronous processing:
- User uploads document
- Backend extracts text
- Embeddings generated immediately
- Vector DB updated
- Metadata persisted
- Response returned after completion

This worked for small files during testing, but failed badly under realistic load:
- Large PDFs caused request timeouts
- Memory usage spiked during OCR and embedding generation
- Concurrent uploads overwhelmed workers
- API latency became unpredictable

The initial assumption was that adding more worker instances would solve the issue, but scaling horizontally only increased contention on shared resources and database connections.

How I diagnosed the problem:
- Added detailed request tracing and timing instrumentation
- Used Prometheus + Grafana to inspect:
  - Request latency
  - Memory growth
  - Queue saturation
  - CPU spikes
- Profiled memory usage in Python workers
- Identified that embedding generation and PDF parsing were blocking operations consuming excessive memory
- Found that long-running synchronous requests were tying up API workers

Steps I took to solve it:
1. Decoupled processing from request lifecycle
   - Upload API became asynchronous
   - Returned job ID immediately

2. Introduced a queue-based architecture
   - FastAPI handled ingestion
   - Celery/RQ workers processed documents asynchronously

3. Split pipeline into stages
   - Extraction
   - Chunking
   - Embedding
   - Indexing
   - Metadata persistence

4. Added retry logic and dead-letter handling
   - Prevented pipeline crashes from corrupt documents

5. Reduced memory pressure
   - Streaming file reads
   - Chunked processing
   - Better cleanup of temporary objects

6. Improved observability
   - Distributed tracing
   - Structured logging
   - Queue metrics
   - Worker health dashboards

Results:
- Request latency dropped significantly
- API remained responsive during heavy uploads
- Worker crashes decreased
- System became horizontally scalable

What I learned:
- Synchronous architectures break quickly for AI workloads involving large files or heavy compute.
- Observability is critical. Without metrics and tracing, debugging distributed systems becomes guesswork.
- Scaling inefficient architecture usually amplifies problems instead of solving them.
- Designing for backpressure and failure handling early is extremely important in ML systems.

3. Designing a Document Upload + Processing + Real-Time Feedback System

High-level architecture:

React Frontend
        |
FastAPI Gateway/API
        |
PostgreSQL + Redis
        |
Async Workers (Celery/RQ)
        |
Vector DB / Embedding Pipeline

API Design (FastAPI)

1. Upload Endpoint
POST /documents/upload

Purpose:
- Accept document upload
- Store metadata in PostgreSQL
- Store file in object storage/local storage
- Create processing job
- Return document ID + job ID immediately

Response:
{
  "document_id": "...",
  "job_id": "...",
  "status": "queued"
}

2. Get Processing Status
GET /documents/{document_id}/status

Response:
{
  "status": "processing",
  "progress": 65,
  "stage": "embedding_generation",
  "updated_at": "..."
}

3. Get Final Results
GET /documents/{document_id}/results

Response:
{
  "chunks_indexed": 142,
  "summary": "...",
  "embedding_status": "complete"
}

4. WebSocket Endpoint
/ws/documents/{document_id}

Purpose:
- Push live updates to frontend
- Avoid aggressive polling

Data Flow

Upload Flow:
1. React uploads file using multipart/form-data
2. FastAPI:
   - validates file
   - stores metadata in PostgreSQL
   - creates queued job
   - returns immediately
3. Background worker consumes job
4. Worker:
   - extracts text
   - chunks document
   - generates embeddings
   - updates vector DB
   - updates PostgreSQL status
5. WebSocket emits progress updates
6. Frontend reflects real-time progress

Database Design (PostgreSQL)

documents table:
- id
- filename
- upload_time
- status
- user_id
- storage_path

processing_jobs table:
- job_id
- document_id
- stage
- progress_percent
- started_at
- completed_at
- error_message

document_chunks table:
- chunk_id
- document_id
- chunk_text
- embedding_reference

Frontend Strategy (React)

For efficient updates:
- Use React Query/TanStack Query for caching and synchronization
- Use WebSockets for live progress updates
- Optimistically update UI states
- Virtualize large result lists if rendering many chunks

UI states:
- Uploading
- Queued
- Processing
- Indexing
- Completed
- Failed

Performance considerations:
- Avoid polling every second for thousands of clients
- Push updates through WebSockets/SSE
- Batch progress events where possible
- Keep payloads minimal

Reliability considerations:
- Idempotent job processing
- Retry mechanisms
- Dead-letter queues
- File validation
- Rate limiting
- Authentication + authorization
- Structured logging and tracing

Scalability:
- Stateless FastAPI services behind load balancer
- Dedicated worker pool for embedding generation
- Redis for queues/caching
- Separate vector database if scaling RAG heavily

4. Academic Status, Availability, and Motivation

I am currently pursuing my undergraduate degree in Computer Science & Engineering, with an expected graduation year of 2028.

Alongside academics, I’ve been heavily focused on practical engineering work, particularly in:
- AI/ML systems
- Backend engineering
- React applications
- DevOps and observability
- Distributed systems and microservices

Most of my learning has been project-driven, where I intentionally worked on production-style problems rather than only academic exercises. That helped me gain hands-on experience with technologies like FastAPI, React, PostgreSQL, Docker, Prometheus, Grafana, and RAG pipelines much earlier in my academic journey.

Regarding availability:
- I am currently available for internships, contract work, and part-time engineering opportunities.
- For a full-time role, my availability would depend on role flexibility and alignment with my academic commitments, though I’m actively looking for opportunities where I can contribute meaningfully while continuing my degree.

What motivated me to apply:
I applied because I’m specifically looking for environments where I can work on real engineering problems at scale, collaborate with experienced engineers, and accelerate my growth through practical impact.

I’m particularly interested in software engineering roles because I enjoy building systems end-to-end:
- designing APIs
- optimizing performance
- debugging distributed systems
- improving developer tooling
- building reliable user-facing products

Even though I’m still an undergraduate, I believe the depth of hands-on experience I’ve built through projects allows me to contribute effectively in production engineering environments.

5. Handling High Latency and Timeouts in Production

My approach would be systematic and evidence-driven rather than immediately jumping to assumptions.

Step 1 — Define the scope of the problem
First I would identify:
- Is the issue affecting all users or a subset?
- Did latency increase gradually or suddenly?
- Is the issue isolated to one service, endpoint, region, or dependency?
- Was there a recent deployment, schema change, traffic spike, or infrastructure change?

Step 2 — Check high-level monitoring dashboards
Using Prometheus + Grafana, I would inspect:
- Request latency percentiles (P50/P95/P99)
- Error rates
- Timeout frequency
- CPU and memory utilization
- Container restarts
- Queue depth
- Database connection saturation
- Network throughput

I would correlate timestamps to identify what changed around the incident window.

Step 3 — Identify bottleneck location
I would narrow down whether the latency originates from:
- Application code
- Database
- External APIs
- Cache layer
- Message queues
- Network issues
- Resource exhaustion

Step 4 — Analyze logs and traces
I would inspect:
- Structured logs
- Slow query logs
- Exception traces
- Retry storms
- Timeout patterns

If distributed tracing exists, I’d use it to find where requests spend most of their time.

Step 5 — Common failure patterns I would check

Database issues:
- Missing indexes
- Lock contention
- N+1 queries
- Long-running transactions

Application issues:
- Memory leaks
- Blocking I/O
- Thread starvation
- Excessive serialization/deserialization
- Unbounded concurrency

Infrastructure issues:
- CPU throttling
- OOM kills
- Container autoscaling failures
- Network instability

Traffic-related issues:
- Sudden traffic spikes
- Hot partitions
- Cache stampedes

Step 6 — Immediate mitigation actions

Depending on findings, immediate mitigations could include:
- Rolling back recent deployment
- Increasing replicas temporarily
- Enabling rate limiting
- Reducing expensive operations
- Scaling DB read replicas
- Increasing cache TTLs
- Disabling non-critical features
- Restarting unhealthy workers
- Applying circuit breakers/timeouts

The priority is restoring service stability before pursuing deep optimization.

Step 7 — Root cause analysis and prevention

After stabilization:
- Reproduce issue in staging if possible
- Add missing observability
- Write postmortem
- Add alerts for early detection
- Improve load testing coverage
- Introduce safeguards:
  - backpressure
  - retries with jitter
  - bulkheads
  - autoscaling policies

One thing I’ve learned is that production incidents are often multi-factor problems. The biggest mistake is treating symptoms instead of identifying the actual system bottleneck or feedback loop causing the degradation.`,
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
              I agree to Selektr&apos;s{" "}
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
            <Clock className="h-4 w-4 inline" /> No time limit
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
            <h3 className="text-[20px] flex items-center justify-center"><Sparkles className="h-5 w-5 mr-2" /> Generating your personalized questions...</h3>
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
        {checked && <Check className="h-4 w-4" />}
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
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream">
              <FileText className="h-6 w-6" />
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
