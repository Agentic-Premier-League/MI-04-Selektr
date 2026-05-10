import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    department: Mapped[str] = mapped_column(String(120))
    location: Mapped[str] = mapped_column(String(160))
    employment_type: Mapped[str] = mapped_column(String(40))
    experience_level: Mapped[str] = mapped_column(String(40))
    description: Mapped[str] = mapped_column(Text)
    required_skills: Mapped[list] = mapped_column(JSON, default=list)
    nice_to_have_skills: Mapped[list] = mapped_column(JSON, default=list)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)
    deadline: Mapped[str | None] = mapped_column(String(40), nullable=True)
    max_applicants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    visibility: Mapped[str] = mapped_column(String(16), default="public")
    status: Mapped[str] = mapped_column(String(16), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidates: Mapped[list["Candidate"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    job_id: Mapped[str] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)

    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(60), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(300), nullable=True)
    years_experience: Mapped[str | None] = mapped_column(String(40), nullable=True)
    current_role: Mapped[str | None] = mapped_column(String(200), nullable=True)
    education: Mapped[str | None] = mapped_column(String(60), nullable=True)
    resume_text: Mapped[str] = mapped_column(Text)

    overall_score: Mapped[int] = mapped_column(Integer, default=0)
    skills_match: Mapped[int] = mapped_column(Integer, default=0)
    experience_relevance: Mapped[int] = mapped_column(Integer, default=0)
    education_fit: Mapped[int] = mapped_column(Integer, default=0)
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    red_flags: Mapped[list] = mapped_column(JSON, default=list)
    skills_detected: Mapped[list] = mapped_column(JSON, default=list)

    interview_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="new")
    recruiter_notes: Mapped[str] = mapped_column(Text, default="")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    job: Mapped[Job] = relationship(back_populates="candidates")
    questions: Mapped[list["Question"]] = relationship(
        back_populates="candidate",
        cascade="all, delete-orphan",
        order_by="Question.idx",
    )
    emails: Mapped[list["EmailDraft"]] = relationship(
        back_populates="candidate", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    candidate_id: Mapped[str] = mapped_column(
        ForeignKey("candidates.id", ondelete="CASCADE"), index=True
    )
    idx: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text, default="")
    ai_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_reason: Mapped[str] = mapped_column(Text, default="")

    candidate: Mapped[Candidate] = relationship(back_populates="questions")


class EmailDraft(Base):
    __tablename__ = "emails"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    candidate_id: Mapped[str] = mapped_column(
        ForeignKey("candidates.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(20))
    subject: Mapped[str] = mapped_column(String(300))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidate: Mapped[Candidate] = relationship(back_populates="emails")
