import os

from fastapi import Header, HTTPException, status


def require_recruiter(x_recruiter_password: str | None = Header(default=None)) -> None:
    expected = os.getenv("RECRUITER_PASSWORD", "hireme")
    if not x_recruiter_password or x_recruiter_password != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid recruiter password",
        )
