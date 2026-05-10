from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import gemini, models, schemas
from ..db import get_db
from ..pdf import extract_pdf_text

router = APIRouter(tags=["apply"])


@router.post("/api/jobs/{job_id}/apply", response_model=schemas.ApplyResponse)
async def submit_application(
    job_id: str,
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str | None = Form(None),
    linkedin_url: str | None = Form(None),
    portfolio_url: str | None = Form(None),
    years_experience: str | None = Form(None),
    current_role: str | None = Form(None),
    education: str | None = Form(None),
    resume_text: str | None = Form(None),
    resume_pdf: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> schemas.ApplyResponse:
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "active":
        raise HTTPException(status_code=400, detail="Job is not accepting applications")

    final_resume = ""
    if resume_pdf is not None:
        pdf_bytes = await resume_pdf.read()
        if pdf_bytes:
            try:
                final_resume = extract_pdf_text(pdf_bytes)
            except Exception:  # noqa: BLE001
                raise HTTPException(
                    status_code=400, detail="Could not read the uploaded PDF."
                )
    if not final_resume and resume_text:
        final_resume = resume_text.strip()

    if len(final_resume) < 200:
        raise HTTPException(
            status_code=400,
            detail="Resume is too short — add more detail (at least 200 characters).",
        )

    profile = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "linkedin_url": linkedin_url,
        "portfolio_url": portfolio_url,
        "years_experience": years_experience,
        "current_role": current_role,
        "education": education,
    }

    screen = gemini.screen_resume(job, profile, final_resume)
    questions = gemini.generate_questions(job, final_resume, screen)

    candidate = models.Candidate(
        job_id=job.id,
        full_name=full_name,
        email=email,
        phone=phone,
        linkedin_url=linkedin_url,
        portfolio_url=portfolio_url,
        years_experience=years_experience,
        current_role=current_role,
        education=education,
        resume_text=final_resume,
        overall_score=screen["overall_score"],
        skills_match=screen["skills_match"],
        experience_relevance=screen["experience_relevance"],
        education_fit=screen["education_fit"],
        ai_summary=screen["summary"],
        red_flags=screen["red_flags"],
        skills_detected=screen["skills_detected"],
        status="screened",
    )
    db.add(candidate)
    db.flush()

    for idx, text in enumerate(questions, start=1):
        db.add(
            models.Question(
                candidate_id=candidate.id,
                idx=idx,
                text=text,
            )
        )
    db.commit()
    db.refresh(candidate)

    return schemas.ApplyResponse(
        candidate_id=candidate.id,
        questions=[schemas.QuestionOut.model_validate(q) for q in candidate.questions],
    )


@router.post(
    "/api/candidates/{candidate_id}/answers", response_model=schemas.AnswerResponse
)
def submit_answers(
    candidate_id: str,
    payload: schemas.AnswerSubmission,
    db: Session = Depends(get_db),
) -> schemas.AnswerResponse:
    candidate = db.get(models.Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    questions = sorted(candidate.questions, key=lambda q: q.idx)
    if len(payload.answers) != len(questions):
        raise HTTPException(
            status_code=400,
            detail=f"Expected {len(questions)} answers, got {len(payload.answers)}",
        )

    qa_pairs = [(q.text, a) for q, a in zip(questions, payload.answers)]
    scored = gemini.score_answers(candidate.job, qa_pairs)

    total = 0
    for q, answer, result in zip(questions, payload.answers, scored):
        q.answer = answer
        q.ai_score = result["score"]
        q.ai_reason = result["reason"]
        total += result["score"]

    # Total over 100 — 5 questions x 20 points each
    candidate.interview_score = total
    candidate.status = "interviewed"
    db.commit()
    db.refresh(candidate)

    return schemas.AnswerResponse(
        total_interview_score=total,
        scored_answers=[schemas.QuestionOut.model_validate(q) for q in candidate.questions],
    )
