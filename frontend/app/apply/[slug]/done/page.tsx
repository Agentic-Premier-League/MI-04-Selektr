"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { OrbitalArc } from "@/components/ui/OrbitalArc";
import { FloatingNavPill } from "@/components/nav/FloatingNavPill";

const STEPS: Array<{ eyebrow: string; body: string }> = [
  {
    eyebrow: "AI Screening",
    body: "Your resume and answers are being scored by AI right now.",
  },
  {
    eyebrow: "Recruiter Review",
    body: "A recruiter will review your ranked profile within a few days.",
  },
  {
    eyebrow: "You'll hear back",
    body: "Expect an email from the recruiter if you're shortlisted.",
  },
];

function DoneContent() {
  const sp = useSearchParams();
  const isPrivate = sp.get("private") === "1";

  return (
    <main className="px-6 pb-32 md:px-12">
      <FloatingNavPill variant="applicant" />

      <section className="mx-auto flex max-w-[920px] flex-col items-center pt-24 text-center">
        <div className="relative">
          <div className="flex h-48 w-48 items-center justify-center rounded-full border-[3px] border-arc bg-white">
            <span className="text-[72px] font-medium text-ink leading-none">✓</span>
          </div>
          <OrbitalArc size={240} className="absolute -left-6 -top-6" />
        </div>

        <h2 className="mt-12">Application submitted.</h2>
        <p className="mt-4 max-w-xl text-slate">
          We&apos;ve received your application. The recruiter will be in touch via the
          email address you provided.
        </p>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="rounded-card bg-lifted p-8 text-left shadow-card"
            >
              <EyebrowLabel>{s.eyebrow}</EyebrowLabel>
              <p className="mt-3 text-[16px] text-ink">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          {isPrivate ? (
            <button
              onClick={() => window.close()}
              className="text-[14px] text-slate underline-offset-4 hover:text-ink hover:underline"
            >
              Close this page
            </button>
          ) : (
            <Link href="/jobs">
              <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Browse More Roles
              </Button>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

export default function DonePage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <DoneContent />
    </Suspense>
  );
}
