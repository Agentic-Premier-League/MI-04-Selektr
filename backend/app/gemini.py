"""Gemini integration. Five prompt functions covering spec section 6.

All calls request JSON output via response_mime_type. On parse failure or API error
we retry once, then return a safe degraded payload so the request never hard-fails.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.5-flash"


def _model() -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(MODEL_NAME)


def _generate_json(prompt: str) -> dict[str, Any] | list[Any] | None:
    try:
        model = _model()
    except RuntimeError:
        logger.warning("Gemini key missing, returning None")
        return None

    for attempt in range(2):
        try:
            response = model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.7 if attempt == 0 else 0.4,
                },
            )
            text = (response.text or "").strip()
            if not text:
                continue
            return json.loads(text)
        except Exception as exc:  # noqa: BLE001 - we want broad retry
            logger.warning("Gemini call failed (attempt %d): %s", attempt + 1, exc)
    return None


# ---------------------------------------------------------------------------
# 1 + 4. Screen resume (red flags returned in the same payload to save a call)
# ---------------------------------------------------------------------------

SCREEN_PROMPT = """You are an expert technical recruiter scoring a candidate's resume against a job posting.

JOB POSTING
Title: {title}
Department: {department}
Experience level: {experience_level}
Description: {description}
Required skills: {required_skills}
Nice-to-have skills: {nice_to_have_skills}

CANDIDATE PROFILE
Full name: {full_name}
Years of experience: {years_experience}
Current/last role: {current_role}
Education: {education}
LinkedIn: {linkedin_url}
Portfolio: {portfolio_url}

CANDIDATE RESUME
{resume_text}

Return a JSON object matching this schema EXACTLY (all integer scores are 0-100):
{{
  "overall_score": int,
  "skills_match": int,
  "experience_relevance": int,
  "education_fit": int,
  "summary": "2-4 sentence plain-prose summary of fit, addressing the recruiter directly",
  "red_flags": [
    {{
      "type": "employment_gap" | "title_inflation" | "skill_mismatch" | "frequent_jobs" | "other",
      "description": "one short sentence describing the concern",
      "severity": "low" | "medium" | "high"
    }}
  ],
  "skills_detected": ["list", "of", "skills", "found", "in", "the", "resume"]
}}

Be honest and specific. If the candidate is clearly a strong fit, score 80+. Mediocre fit 50-75. Weak fit below 50.
If you find no red flags, return an empty list.
"""


def screen_resume(job: Any, profile: dict[str, Any], resume_text: str) -> dict[str, Any]:
    prompt = SCREEN_PROMPT.format(
        title=job.title,
        department=job.department,
        experience_level=job.experience_level,
        description=job.description,
        required_skills=", ".join(job.required_skills or []) or "(none specified)",
        nice_to_have_skills=", ".join(job.nice_to_have_skills or []) or "(none)",
        full_name=profile.get("full_name", ""),
        years_experience=profile.get("years_experience") or "(not specified)",
        current_role=profile.get("current_role") or "(not specified)",
        education=profile.get("education") or "(not specified)",
        linkedin_url=profile.get("linkedin_url") or "(none)",
        portfolio_url=profile.get("portfolio_url") or "(none)",
        resume_text=resume_text[:12000],
    )
    result = _generate_json(prompt)
    if not isinstance(result, dict):
        return _degraded_screen()

    return {
        "overall_score": _clamp_int(result.get("overall_score"), 0, 100),
        "skills_match": _clamp_int(result.get("skills_match"), 0, 100),
        "experience_relevance": _clamp_int(result.get("experience_relevance"), 0, 100),
        "education_fit": _clamp_int(result.get("education_fit"), 0, 100),
        "summary": str(result.get("summary") or "")[:2000],
        "red_flags": _coerce_red_flags(result.get("red_flags")),
        "skills_detected": _coerce_str_list(result.get("skills_detected"))[:30],
    }


def _degraded_screen() -> dict[str, Any]:
    return {
        "overall_score": 0,
        "skills_match": 0,
        "experience_relevance": 0,
        "education_fit": 0,
        "summary": "AI screening is currently unavailable. A recruiter will review this profile manually.",
        "red_flags": [],
        "skills_detected": [],
    }


# ---------------------------------------------------------------------------
# 2. Generate interview questions
# ---------------------------------------------------------------------------

QUESTIONS_PROMPT = """You are designing a focused 5-question screening interview for a candidate.

JOB
Title: {title}
Description: {description}
Required skills: {required_skills}

CANDIDATE RESUME
{resume_text}

AI SCREENING NOTES
{screen_summary}
Skills match: {skills_match}/100. Experience relevance: {experience_relevance}/100.

Generate exactly 5 questions that:
- Probe the most resume-relevant skills required by this job
- Investigate any uncertain or weakly evidenced areas
- Mix one technical, one behavioural, one role-specific scenario, one motivation, one pragmatic problem-solving
- Are answerable in 3-6 sentences each
- Do NOT ask the candidate to write code

Return JSON:
{{ "questions": ["q1", "q2", "q3", "q4", "q5"] }}
"""


def generate_questions(job: Any, resume_text: str, screen: dict[str, Any]) -> list[str]:
    prompt = QUESTIONS_PROMPT.format(
        title=job.title,
        description=job.description,
        required_skills=", ".join(job.required_skills or []) or "(none)",
        resume_text=resume_text[:8000],
        screen_summary=screen.get("summary", ""),
        skills_match=screen.get("skills_match", 0),
        experience_relevance=screen.get("experience_relevance", 0),
    )
    result = _generate_json(prompt)
    if isinstance(result, dict):
        questions = result.get("questions") or []
    elif isinstance(result, list):
        questions = result
    else:
        questions = []

    questions = [str(q).strip() for q in questions if str(q).strip()]
    if len(questions) < 5:
        questions = _default_questions(job)
    return questions[:5]


def _default_questions(job: Any) -> list[str]:
    return [
        f"Walk us through a project most relevant to a {job.title} role. What made it succeed or fail?",
        "Describe a time you disagreed with a teammate on a technical decision. How did you resolve it?",
        f"What's a hard problem you'd expect to face in this {job.title} role, and how would you approach it?",
        "What about this role excites you most, and what's a part you're unsure about?",
        "Tell us about a time you had to learn a new technology under deadline pressure.",
    ]


# ---------------------------------------------------------------------------
# 3. Score interview answers
# ---------------------------------------------------------------------------

SCORE_PROMPT = """You are scoring a candidate's screening interview answers for a {title} role.

JOB DESCRIPTION
{description}

QUESTIONS AND ANSWERS
{qa_block}

For each answer return an integer score 0-20 and a one-sentence reason explaining the score.
Return JSON in this exact shape:
{{
  "scored_answers": [
    {{ "score": int, "reason": "..." }},
    ...
  ]
}}

The scored_answers list MUST have the same length and order as the questions above.
"""


def score_answers(job: Any, qa_pairs: list[tuple[str, str]]) -> list[dict[str, Any]]:
    qa_block = "\n\n".join(
        f"Q{i + 1}: {q}\nA{i + 1}: {a or '(no answer provided)'}"
        for i, (q, a) in enumerate(qa_pairs)
    )
    prompt = SCORE_PROMPT.format(
        title=job.title,
        description=job.description,
        qa_block=qa_block,
    )
    result = _generate_json(prompt)
    scored: list[dict[str, Any]] = []
    if isinstance(result, dict):
        items = result.get("scored_answers") or []
    elif isinstance(result, list):
        items = result
    else:
        items = []

    for item in items:
        if not isinstance(item, dict):
            continue
        scored.append(
            {
                "score": _clamp_int(item.get("score"), 0, 20),
                "reason": str(item.get("reason") or "")[:500],
            }
        )

    while len(scored) < len(qa_pairs):
        scored.append({"score": 0, "reason": "AI scoring unavailable for this answer."})
    return scored[: len(qa_pairs)]


# ---------------------------------------------------------------------------
# 5. Draft email
# ---------------------------------------------------------------------------

EMAIL_PROMPT = """Draft a recruiter email to a candidate. Tone must match the email type exactly.

EMAIL TYPE: {email_type}
- invite: warm, enthusiastic, concrete next step (schedule a longer interview).
- waitlist: kind, honest, leaves the door open without false promises.
- reject: respectful, brief, encourages the candidate, no fake reasons.

CANDIDATE
Name: {full_name}
Applied for: {job_title} ({department})
Overall AI score: {overall_score}/100
AI summary: {summary}

Return JSON:
{{ "subject": "...", "body": "..." }}

Email body should be 3-5 short paragraphs, signed "The {department} Team at Selektr".
Do not include greeting markers like "Dear" if the candidate name is missing.
"""


def draft_email(candidate: Any, job: Any, email_type: str) -> dict[str, str]:
    prompt = EMAIL_PROMPT.format(
        email_type=email_type,
        full_name=candidate.full_name,
        job_title=job.title,
        department=job.department,
        overall_score=candidate.overall_score,
        summary=(candidate.ai_summary or "(no summary)")[:1500],
    )
    result = _generate_json(prompt)
    if isinstance(result, dict) and result.get("subject") and result.get("body"):
        return {
            "subject": str(result["subject"])[:200],
            "body": str(result["body"])[:6000],
        }
    return _degraded_email(candidate, job, email_type)


def _degraded_email(candidate: Any, job: Any, email_type: str) -> dict[str, str]:
    subject_map = {
        "invite": f"Next steps for the {job.title} role",
        "waitlist": f"Update on your {job.title} application",
        "reject": f"Update on your {job.title} application",
    }
    return {
        "subject": subject_map.get(email_type, f"Update on your {job.title} application"),
        "body": (
            f"Hi {candidate.full_name},\n\n"
            f"Thanks for applying to the {job.title} role at Selektr. "
            f"A recruiter will follow up shortly with next steps.\n\n"
            f"Best,\nThe {job.department} Team at Selektr"
        ),
    }


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------


def _clamp_int(value: Any, lo: int, hi: int) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(hi, n))


def _coerce_str_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(v).strip() for v in value if str(v).strip()]


def _coerce_red_flags(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []
    out: list[dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        out.append(
            {
                "type": str(item.get("type") or "other"),
                "description": str(item.get("description") or "").strip()[:300],
                "severity": str(item.get("severity") or "medium"),
            }
        )
    return [f for f in out if f["description"]]
