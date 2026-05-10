from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import analytics, apply, candidates, email, jobs

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        from seed import seed
        seed()
        print("Database seeding check completed.")
    except Exception as e:
        print(f"Error during database seeding: {e}")
    yield


app = FastAPI(title="Selektr API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(apply.router)
app.include_router(candidates.router)
app.include_router(email.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
