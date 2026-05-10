from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_recruiter
from ..db import get_db

router = APIRouter(tags=["analytics"], dependencies=[Depends(require_recruiter)])


SCORE_BUCKETS = [
    ("0-20", 0, 19),
    ("20-40", 20, 39),
    ("40-60", 40, 59),
    ("60-80", 60, 79),
    ("80-100", 80, 100),
]


@router.get("/api/jobs/{job_id}/analytics", response_model=schemas.AnalyticsOut)
def analytics(job_id: str, db: Session = Depends(get_db)) -> schemas.AnalyticsOut:
    if not db.get(models.Job, job_id):
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = db.scalars(
        select(models.Candidate).where(models.Candidate.job_id == job_id)
    ).all()

    distribution = {label: 0 for label, _, _ in SCORE_BUCKETS}
    for c in candidates:
        for label, lo, hi in SCORE_BUCKETS:
            if lo <= c.overall_score <= hi:
                distribution[label] += 1
                break

    funnel = {
        "applied": len(candidates),
        "screened": sum(1 for c in candidates if c.status != "new"),
        "interviewed": sum(1 for c in candidates if c.interview_score is not None),
        "shortlisted": sum(1 for c in candidates if c.status == "shortlisted"),
    }

    return schemas.AnalyticsOut(score_distribution=distribution, funnel=funnel)
