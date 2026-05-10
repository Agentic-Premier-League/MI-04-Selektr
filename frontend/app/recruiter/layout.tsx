"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EyebrowLabel } from "@/components/ui/EyebrowLabel";
import { PillInput } from "@/components/ui/PillInput";
import {
  clearRecruiterPassword,
  getRecruiterPassword,
  setRecruiterPassword,
} from "@/lib/auth";
import { verifyRecruiterPassword } from "@/lib/api";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = getRecruiterPassword();
    if (!stored) {
      setUnlocked(false);
      return;
    }
    verifyRecruiterPassword(stored)
      .then((ok) => {
        if (ok) {
          setUnlocked(true);
        } else {
          clearRecruiterPassword();
          setUnlocked(false);
        }
      })
      .catch(() => setUnlocked(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      const ok = await verifyRecruiterPassword(password);
      if (!ok) {
        setError("Wrong password. Try again.");
        setSubmitting(false);
        return;
      }
      setRecruiterPassword(password);
      setUnlocked(true);
    } catch (e: any) {
      setError(e?.message ?? "Could not verify password");
    } finally {
      setSubmitting(false);
    }
  }

  if (unlocked === null) {
    return <div className="min-h-screen" />;
  }

  if (!unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-card bg-lifted p-12 shadow-card"
        >
          <EyebrowLabel>Recruiter access</EyebrowLabel>
          <h2 className="mt-4">Enter access password</h2>
          <p className="mt-3 text-slate">
            HireIQ recruiter pages are gated. Ask your admin for the shared password.
          </p>
          <div className="mt-8">
            <PillInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              invalid={Boolean(error)}
            />
            {error && (
              <p className="mt-2 text-[12px] text-signal">{error}</p>
            )}
          </div>
          <div className="mt-8">
            <Button
              variant="primary"
              fullWidth
              type="submit"
              disabled={submitting || !password}
            >
              {submitting ? "Checking..." : "Unlock"}
            </Button>
          </div>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
