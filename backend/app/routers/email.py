from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import gemini, models, schemas
from ..auth import require_recruiter
from ..db import get_db

router = APIRouter(tags=["email"], dependencies=[Depends(require_recruiter)])


@router.post("/api/candidates/{candidate_id}/email", response_model=schemas.EmailOut)
def draft_candidate_email(
    candidate_id: str,
    payload: schemas.EmailDraftRequest,
    db: Session = Depends(get_db),
) -> models.EmailDraft:
    candidate = db.get(models.Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    drafted = gemini.draft_email(candidate, candidate.job, payload.type)

    email = models.EmailDraft(
        candidate_id=candidate.id,
        type=payload.type,
        subject=drafted["subject"],
        body=drafted["body"],
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return email
