import { getRecruiterPassword } from "./auth";
import type {
  AnalyticsOut,
  AnswerResponse,
  ApplyResponse,
  CandidateDetail,
  CandidateRow,
  EmailOut,
  EmailType,
  Job,
  JobCreatePayload,
  CandidateStatus,
} from "./types";

// Next.js rewrites have a known bug with multipart/form-data (file uploads) causing ECONNRESET.
// Since the backend has CORS enabled, we bypass the proxy and hit the backend directly.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const BASE = `${API_BASE}/api`;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { recruiter?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init.recruiter) {
    const pwd = getRecruiterPassword();
    if (pwd) headers.set("x-recruiter-password", pwd);
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data?.detail) message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {
      /* ignore parse error */
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---- Public ----

export const fetchPublicJobs = () => request<Job[]>("/jobs/public");
export const fetchJobBySlug = (slug: string) =>
  request<Job>(`/jobs/by-slug/${encodeURIComponent(slug)}`);

export const submitApplication = (jobId: string, formData: FormData) =>
  request<ApplyResponse>(`/jobs/${jobId}/apply`, {
    method: "POST",
    body: formData,
  });

export const submitAnswers = (candidateId: string, answers: string[]) =>
  request<AnswerResponse>(`/candidates/${candidateId}/answers`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });

// ---- Recruiter ----

export const verifyRecruiterPassword = async (password: string): Promise<boolean> => {
  const res = await fetch(`${BASE}/jobs`, {
    headers: { "x-recruiter-password": password },
    cache: "no-store",
  });
  return res.ok;
};

export const fetchAllJobs = () =>
  request<Job[]>("/jobs", { recruiter: true });

export const fetchJob = (jobId: string) =>
  request<Job>(`/jobs/${jobId}`);

export const createJob = (payload: JobCreatePayload) =>
  request<Job>("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
    recruiter: true,
  });

export const updateJob = (jobId: string, payload: Partial<JobCreatePayload> & { status?: string }) =>
  request<Job>(`/jobs/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    recruiter: true,
  });

export const deleteJob = (jobId: string) =>
  request<void>(`/jobs/${jobId}`, { method: "DELETE", recruiter: true });

export const fetchCandidates = (jobId: string) =>
  request<CandidateRow[]>(`/jobs/${jobId}/candidates`, { recruiter: true });

export const fetchCandidate = (candidateId: string) =>
  request<CandidateDetail>(`/candidates/${candidateId}`, { recruiter: true });

export const updateCandidateStatus = (
  candidateId: string,
  status: CandidateStatus,
  recruiter_notes?: string,
) =>
  request<CandidateDetail>(`/candidates/${candidateId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, recruiter_notes }),
    recruiter: true,
  });

export const draftEmail = (candidateId: string, type: EmailType) =>
  request<EmailOut>(`/candidates/${candidateId}/email`, {
    method: "POST",
    body: JSON.stringify({ type }),
    recruiter: true,
  });

export const fetchAnalytics = (jobId: string) =>
  request<AnalyticsOut>(`/jobs/${jobId}/analytics`, { recruiter: true });

export { ApiError };
