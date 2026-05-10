from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    employment_type: str
    experience_level: str
    description: str
    required_skills: list[str] = []
    nice_to_have_skills: list[str] = []
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str | None = None
    deadline: str | None = None
    max_applicants: int | None = None
    visibility: Literal["public", "private"] = "public"


class JobUpdate(BaseModel):
    title: str | None = None
    department: str | None = None
    location: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None
    description: str | None = None
    required_skills: list[str] | None = None
    nice_to_have_skills: list[str] | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str | None = None
    deadline: str | None = None
    max_applicants: int | None = None
    visibility: Literal["public", "private"] | None = None
    status: Literal["active", "paused", "closed"] | None = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    title: str
    department: str
    location: str
    employment_type: str
    experience_level: str
    description: str
    required_skills: list[str]
    nice_to_have_skills: list[str]
    salary_min: int | None
    salary_max: int | None
    currency: str | None
    deadline: str | None
    max_applicants: int | None
    visibility: str
    status: str
    created_at: datetime
    applications_count: int = 0
    top_score: int | None = None


class CandidateRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: EmailStr
    overall_score: int
    skills_match: int
    experience_relevance: int
    education_fit: int
    interview_score: int | None
    status: str
    red_flags: list
    created_at: datetime


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    idx: int
    text: str
    answer: str
    ai_score: int | None
    ai_reason: str


class EmailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    subject: str
    body: str
    created_at: datetime


class CandidateDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    full_name: str
    email: EmailStr
    phone: str | None
    linkedin_url: str | None
    portfolio_url: str | None
    years_experience: str | None
    current_role: str | None
    education: str | None
    resume_text: str
    overall_score: int
    skills_match: int
    experience_relevance: int
    education_fit: int
    ai_summary: str
    red_flags: list
    skills_detected: list
    interview_score: int | None
    status: str
    recruiter_notes: str
    created_at: datetime
    questions: list[QuestionOut]
    emails: list[EmailOut]


class StatusUpdate(BaseModel):
    status: Literal["new", "screened", "interviewed", "shortlisted", "rejected"]
    recruiter_notes: str | None = None


class EmailDraftRequest(BaseModel):
    type: Literal["invite", "waitlist", "reject"]


class AnalyticsOut(BaseModel):
    score_distribution: dict[str, int]
    funnel: dict[str, int]


class ApplyResponse(BaseModel):
    candidate_id: str
    questions: list[QuestionOut]


class AnswerSubmission(BaseModel):
    answers: list[str]


class AnswerResponse(BaseModel):
    total_interview_score: int
    scored_answers: list[QuestionOut]
