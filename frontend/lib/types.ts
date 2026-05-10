export type Visibility = "public" | "private";
export type JobStatus = "active" | "paused" | "closed";
export type CandidateStatus =
  | "new"
  | "screened"
  | "interviewed"
  | "shortlisted"
  | "rejected";
export type EmailType = "invite" | "waitlist" | "reject";
export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship";
export type ExperienceLevel = "Entry" | "Mid" | "Senior" | "Lead";

export interface Job {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  deadline: string | null;
  max_applicants: number | null;
  visibility: Visibility;
  status: JobStatus;
  created_at: string;
  applications_count: number;
  top_score: number | null;
}

export interface RedFlag {
  type: string;
  description: string;
  severity: string;
}

export interface QuestionOut {
  id: string;
  idx: number;
  text: string;
  answer: string;
  ai_score: number | null;
  ai_reason: string;
}

export interface EmailOut {
  id: string;
  type: EmailType;
  subject: string;
  body: string;
  created_at: string;
}

export interface CandidateRow {
  id: string;
  full_name: string;
  email: string;
  overall_score: number;
  skills_match: number;
  experience_relevance: number;
  education_fit: number;
  interview_score: number | null;
  status: CandidateStatus;
  red_flags: RedFlag[];
  created_at: string;
}

export interface CandidateDetail extends CandidateRow {
  job_id: string;
  phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_experience: string | null;
  current_role: string | null;
  education: string | null;
  resume_text: string;
  ai_summary: string;
  skills_detected: string[];
  recruiter_notes: string;
  questions: QuestionOut[];
  emails: EmailOut[];
}

export interface AnalyticsOut {
  score_distribution: Record<string, number>;
  funnel: Record<string, number>;
}

export interface ApplyResponse {
  candidate_id: string;
  questions: QuestionOut[];
}

export interface AnswerResponse {
  total_interview_score: number;
  scored_answers: QuestionOut[];
}

export interface JobCreatePayload {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  required_skills: string[];
  nice_to_have_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  deadline: string | null;
  max_applicants: number | null;
  visibility: Visibility;
}
