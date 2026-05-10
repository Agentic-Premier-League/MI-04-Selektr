from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..auth import require_recruiter
from ..db import get_db
from ..slug import make_unique_slug

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _serialize_job(job: models.Job, db: Session) -> dict:
    candidates_count = db.scalar(
        select(func.count(models.Candidate.id)).where(models.Candidate.job_id == job.id)
    ) or 0
    top_score = db.scalar(
        select(func.max(models.Candidate.overall_score)).where(
            models.Candidate.job_id == job.id
        )
    )
    return {
        "id": job.id,
        "slug": job.slug,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "employment_type": job.employment_type,
        "experience_level": job.experience_level,
        "description": job.description,
        "required_skills": job.required_skills or [],
        "nice_to_have_skills": job.nice_to_have_skills or [],
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "currency": job.currency,
        "deadline": job.deadline,
        "max_applicants": job.max_applicants,
        "visibility": job.visibility,
        "status": job.status,
        "created_at": job.created_at,
        "applications_count": candidates_count,
        "top_score": top_score,
    }


@router.post("", response_model=schemas.JobOut, dependencies=[Depends(require_recruiter)])
def create_job(payload: schemas.JobCreate, db: Session = Depends(get_db)) -> dict:
    slug = make_unique_slug(payload.title)
    while db.scalar(select(models.Job).where(models.Job.slug == slug)) is not None:
        slug = make_unique_slug(payload.title)

    job = models.Job(slug=slug, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return _serialize_job(job, db)


@router.get("", response_model=list[schemas.JobOut], dependencies=[Depends(require_recruiter)])
def list_jobs(db: Session = Depends(get_db)) -> list[dict]:
    jobs = db.scalars(select(models.Job).order_by(models.Job.created_at.desc())).all()
    return [_serialize_job(j, db) for j in jobs]


@router.get("/public", response_model=list[schemas.JobOut])
def list_public_jobs(db: Session = Depends(get_db)) -> list[dict]:
    jobs = db.scalars(
        select(models.Job)
        .where(models.Job.visibility == "public", models.Job.status == "active")
        .order_by(models.Job.created_at.desc())
    ).all()
    return [_serialize_job(j, db) for j in jobs]


@router.get("/by-slug/{slug}", response_model=schemas.JobOut)
def get_job_by_slug(slug: str, db: Session = Depends(get_db)) -> dict:
    job = db.scalar(select(models.Job).where(models.Job.slug == slug))
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _serialize_job(job, db)


@router.get("/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: str, db: Session = Depends(get_db)) -> dict:
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _serialize_job(job, db)


@router.patch("/{job_id}", response_model=schemas.JobOut, dependencies=[Depends(require_recruiter)])
def update_job(
    job_id: str, payload: schemas.JobUpdate, db: Session = Depends(get_db)
) -> dict:
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return _serialize_job(job, db)


@router.delete("/{job_id}", status_code=204, dependencies=[Depends(require_recruiter)])
def delete_job(job_id: str, db: Session = Depends(get_db)) -> None:
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
