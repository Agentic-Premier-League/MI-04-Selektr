from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_recruiter
from ..db import get_db

router = APIRouter(tags=["candidates"], dependencies=[Depends(require_recruiter)])


@router.get(
    "/api/jobs/{job_id}/candidates", response_model=list[schemas.CandidateRow]
)
def list_candidates(job_id: str, db: Session = Depends(get_db)) -> list[models.Candidate]:
    if not db.get(models.Job, job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    candidates = db.scalars(
        select(models.Candidate)
        .where(models.Candidate.job_id == job_id)
        .order_by(models.Candidate.overall_score.desc())
    ).all()
    return candidates


@router.get("/api/candidates/{candidate_id}", response_model=schemas.CandidateDetail)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)) -> models.Candidate:
    candidate = db.get(models.Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.patch(
    "/api/candidates/{candidate_id}/status", response_model=schemas.CandidateDetail
)
def update_candidate_status(
    candidate_id: str,
    payload: schemas.StatusUpdate,
    db: Session = Depends(get_db),
) -> models.Candidate:
    candidate = db.get(models.Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    candidate.status = payload.status
    if payload.recruiter_notes is not None:
        candidate.recruiter_notes = payload.recruiter_notes
    db.commit()
    db.refresh(candidate)
    return candidate
