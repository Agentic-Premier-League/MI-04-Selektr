"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScoreCircle } from "@/components/ui/ScoreCircle";
import { Textarea } from "@/components/ui/Textarea";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";
import {
  draftEmail,
  fetchCandidate,
  updateCandidateStatus,
} from "@/lib/api";
import type { CandidateDetail, CandidateStatus, EmailOut, EmailType } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATUSES: CandidateStatus[] = [
  "new",
  "screened",
  "interviewed",
  "shortlisted",
  "rejected",
];

export default function CandidateProfilePage() {
  const params = useParams<{ id: string; cid: string }>();
  const jobId = params.id;
  const cid = params.cid;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CandidateStatus>("new");
  const [savingStatus, setSavingStatus] = useState(false);
  const [activeEmail, setActiveEmail] = useState<EmailOut | null>(null);
  const [emailLoading, setEmailLoading] = useState<EmailType | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!cid) return;
    fetchCandidate(cid)
      .then((c) => {
        setCandidate(c);
        setNotes(c.recruiter_notes || "");
        setStatus(c.status);
      })
      .catch((e) => setError(e.message ?? "Could not load candidate"));
  }, [cid]);

  async function changeStatus(next: CandidateStatus) {
    setStatus(next);
    setSavingStatus(true);
    try {
      const updated = await updateCandidateStatus(cid, next);
      setCandidate(updated);
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveNotes() {
    if (!candidate) return;
    setSavingNotes(true);
    try {
      const updated = await updateCandidateStatus(cid, status, notes);
      setCandidate(updated);
    } finally {
      setSavingNotes(false);
    }
  }

  async function generateEmail(type: EmailType) {
    setEmailLoading(type);
    setActiveEmail(null);
    try {
      const email = await draftEmail(cid, type);
      setActiveEmail(email);
    } catch (e: any) {
      alert(e?.message ?? "Could not draft email");
    } finally {
      setEmailLoading(null);
    }
  }

  if (error && !candidate) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="recruiter" />
        <div className="mx-auto mt-32 max-w-md rounded-card bg-lifted p-12 text-center">
          <h2>Couldn&apos;t load candidate</h2>
          <p className="mt-3 text-slate">{error}</p>
        </div>
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="px-6 md:px-12">
        <FloatingNavPill variant="recruiter" />
        <div className="mx-auto mt-32 h-96 max-w-3xl rounded-card bg-lifted/60 animate-pulse" />
      </main>
    );
  }

  const answered = candidate.questions.some((q) => q.answer);

  return (
    <main className="relative pb-32">
      <FloatingNavPill variant="recruiter" />

      <section className="px-6 pt-12 md:px-12">
        <div className="mx-auto max-w-[1280px]">
          <Link
            href={`/recruiter/jobs/${jobId}`}
            className="text-[14px] text-slate hover:text-ink"
          >
            ← Pipeline
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1>{candidate.full_name}</h1>
              <p className="mt-2 text-[14px] text-slate">
                {candidate.email} · Applied {new Date(candidate.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge tone={status}>{status}</Badge>
          </div>
        </div>
      </section>

      <section className="px-6 pt-10 md:px-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 lg:grid-cols-3">
          <ResumePanel
            candidate={candidate}
            resumeOpen={resumeOpen}
            setResumeOpen={setResumeOpen}
          />
          <InterviewPanel candidate={candidate} answered={answered} jobId={jobId} />
          <ActionsPanel
            status={status}
            onStatusChange={changeStatus}
            savingStatus={savingStatus}
            notes={notes}
            setNotes={setNotes}
            saveNotes={saveNotes}
            savingNotes={savingNotes}
            generateEmail={generateEmail}
            emailLoading={emailLoading}
            activeEmail={activeEmail}
            candidateEmail={candidate.email}
          />
        </div>
      </section>
    </main>
  );
}

// ----- LEFT: Resume Analysis -----

function ResumePanel({
  candidate,
  resumeOpen,
  setResumeOpen,
}: {
  candidate: CandidateDetail;
  resumeOpen: boolean;
  setResumeOpen: (v: boolean) => void;
}) {
  return (
    <div className="rounded-card bg-lifted p-8 shadow-card md:p-10">
      <div className="flex items-center gap-6">
        <ScoreCircle value={candidate.overall_score} size={80} />
        <div>
          <span className="text-[12px] text-slate">Overall Score</span>
          <div className="mt-1 text-[36px] font-medium tracking-tight-2 leading-none">
            {candidate.overall_score}
            <span className="text-[18px] text-slate"> / 100</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <SubScore label="Skills Match" value={candidate.skills_match} />
        <SubScore label="Experience Relevance" value={candidate.experience_relevance} />
        <SubScore label="Education Fit" value={candidate.education_fit} />
      </div>

      <div className="mt-10 border-t border-ink/10 pt-8">
        <EyebrowLabel>AI analysis</EyebrowLabel>
        <p className="mt-4 leading-[1.6]">{candidate.ai_summary || "No summary available."}</p>
      </div>

      {candidate.red_flags.length > 0 && (
        <div className="mt-10 border-t border-ink/10 pt-8">
          <EyebrowLabel tone="signal">Red flags</EyebrowLabel>
          <div className="mt-4 space-y-2">
            {candidate.red_flags.map((flag, i) => (
              <div
                key={i}
                className="rounded-btn border border-signal/20 bg-[#FEF3F0] px-5 py-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-signal" />
                  <p className="text-[14px] font-medium text-ink">{flag.description}</p>
                </div>
                <p className="mt-1 ml-6 text-[12px] uppercase tracking-eyebrow text-slate">
                  {flag.severity} · {flag.type.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {candidate.skills_detected.length > 0 && (
        <div className="mt-10 border-t border-ink/10 pt-8">
          <EyebrowLabel>Skills found</EyebrowLabel>
          <div className="mt-4 flex flex-wrap gap-2">
            {candidate.skills_detected.map((s) => (
              <span
                key={s}
                className="rounded-pill border border-ink px-3 py-0.5 text-[12px] font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-ink/10 pt-8">
        <EyebrowLabel>Submitted resume</EyebrowLabel>
        {!resumeOpen ? (
          <button
            type="button"
            onClick={() => setResumeOpen(true)}
            className="mt-4 text-[14px] font-medium text-ink underline-offset-4 hover:underline"
          >
            Show full resume ↓
          </button>
        ) : (
          <div className="mt-4 max-h-80 overflow-y-auto rounded-btn bg-bone p-6 scroll-clean">
            <pre className="whitespace-pre-wrap text-[14px] leading-[1.5] text-ink">
              {candidate.resume_text}
            </pre>
            <button
              type="button"
              onClick={() => setResumeOpen(false)}
              className="mt-4 text-[12px] text-slate hover:text-ink"
            >
              Hide ↑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubScore({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[14px]">
        <span className="text-ink">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <ProgressBar value={value} className="mt-2" />
    </div>
  );
}

// ----- MIDDLE: Interview -----

function InterviewPanel({
  candidate,
  answered,
  jobId,
}: {
  candidate: CandidateDetail;
  answered: boolean;
  jobId: string;
}) {
  return (
    <div className="rounded-card bg-lifted p-8 shadow-card md:p-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <EyebrowLabel>Interview responses</EyebrowLabel>
          <h2 className="mt-3 text-[24px] md:text-[28px]">Candidate answers</h2>
        </div>
        {candidate.interview_score !== null && (
          <span className="rounded-pill bg-ink px-4 py-1.5 text-[14px] font-medium text-cream">
            Total: {candidate.interview_score} / 100
          </span>
        )}
      </div>

      {!answered && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-btn bg-canvas p-12 text-center">
          <div className="h-32 w-32 rounded-full border-2 border-arc bg-white" />
          <h3>Awaiting responses</h3>
          <p className="text-slate">
            The candidate hasn&apos;t completed their interview questions yet.
          </p>
          <CopyInterviewLink jobId={jobId} candidateId={candidate.id} />
        </div>
      )}

      {answered && (
        <div className="mt-6 divide-y divide-ink/10">
          {candidate.questions.map((q) => (
            <div key={q.id} className="py-6 first:pt-0">
              <div className="flex items-center justify-between">
                <EyebrowLabel tone="slate">Question {q.idx}</EyebrowLabel>
                {q.ai_score !== null && (
                  <span className="rounded-pill bg-ink px-3 py-0.5 text-[12px] font-bold text-cream">
                    {q.ai_score}/20
                  </span>
                )}
              </div>
              <p className="mt-3 text-[16px] font-medium">{q.text}</p>
              <div className="mt-3 max-h-40 overflow-y-auto rounded-btn bg-bone p-4 scroll-clean">
                <p className="whitespace-pre-wrap text-[14px] font-[450] leading-[1.5]">
                  {q.answer || "(no answer provided)"}
                </p>
              </div>
              {q.ai_reason && (
                <p className="mt-2 text-[12px] italic text-slate">
                  Why this score: {q.ai_reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyInterviewLink({ jobId, candidateId }: { jobId: string; candidateId: string }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/recruiter/jobs/${jobId}/candidate/${candidateId}`
      : "";
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => navigator.clipboard?.writeText(url)}
    >
      Copy Interview Link
    </Button>
  );
}

// ----- RIGHT: Actions -----

function ActionsPanel({
  status,
  onStatusChange,
  savingStatus,
  notes,
  setNotes,
  saveNotes,
  savingNotes,
  generateEmail,
  emailLoading,
  activeEmail,
  candidateEmail,
}: {
  status: CandidateStatus;
  onStatusChange: (s: CandidateStatus) => void;
  savingStatus: boolean;
  notes: string;
  setNotes: (s: string) => void;
  saveNotes: () => void;
  savingNotes: boolean;
  generateEmail: (t: EmailType) => void;
  emailLoading: EmailType | null;
  activeEmail: EmailOut | null;
  candidateEmail: string;
}) {
  return (
    <div className="rounded-card bg-lifted p-8 shadow-card md:p-10">
      <EyebrowLabel>Candidate status</EyebrowLabel>
      <div className="mt-4 flex flex-col gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={savingStatus}
            onClick={() => onStatusChange(s)}
            className={cn(
              "rounded-pill border-[1.5px] px-5 py-2 text-[14px] font-medium uppercase tracking-eyebrow transition-all",
              status === s
                ? "bg-ink text-cream border-ink"
                : "bg-white text-ink border-ink hover:bg-canvas",
              savingStatus && "opacity-60 cursor-wait",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-10 border-t border-ink/10 pt-8">
        <EyebrowLabel>AI communication</EyebrowLabel>
        <div className="mt-4 grid grid-cols-1 gap-2">
          <Button
            variant="primary"
            fullWidth
            disabled={emailLoading !== null}
            onClick={() => generateEmail("invite")}
          >
            {emailLoading === "invite" ? "Drafting..." : <><Mail className="h-4 w-4 mr-2 inline" /> Draft Invite</>}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled={emailLoading !== null}
            onClick={() => generateEmail("waitlist")}
          >
            {emailLoading === "waitlist" ? "Drafting..." : <><Mail className="h-4 w-4 mr-2 inline" /> Draft Waitlist</>}
          </Button>
          <Button
            variant="clay"
            fullWidth
            disabled={emailLoading !== null}
            onClick={() => generateEmail("reject")}
          >
            {emailLoading === "reject" ? "Drafting..." : <><Mail className="h-4 w-4 mr-2 inline" /> Draft Reject</>}
          </Button>
        </div>

        {activeEmail && (
          <div className="mt-4 rounded-btn bg-white p-5 shadow-nav">
            <Row label="To" value={candidateEmail} />
            <Row label="Subject" value={activeEmail.subject} />
            <div className="mt-3">
              <span className="text-[12px] text-slate">Body</span>
              <Textarea
                rows={8}
                className="mt-1 text-[14px]"
                defaultValue={activeEmail.body}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  navigator.clipboard?.writeText(
                    `Subject: ${activeEmail.subject}\n\n${activeEmail.body}`,
                  )
                }
              >
                Copy Email
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generateEmail(activeEmail.type)}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 border-t border-ink/10 pt-8">
        <EyebrowLabel>Private notes</EyebrowLabel>
        <Textarea
          className="mt-4"
          rows={6}
          placeholder="Your private notes about this candidate..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p className="mt-1 text-[12px] text-slate">Visible only to you</p>
        <div className="mt-6">
          <Button variant="primary" fullWidth onClick={saveNotes} disabled={savingNotes}>
            {savingNotes ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-[14px]">
      <span className="w-16 text-slate">{label}</span>
      <span className="flex-1 truncate text-ink">{value}</span>
    </div>
  );
}
