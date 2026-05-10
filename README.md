# HireIQ

AI hiring platform: recruiters post jobs, applicants apply with a resume + AI-generated interview questions, candidates are screened and ranked by AI.

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind, Mastercard-inspired design
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **AI:** Google Gemini 2.5 Flash (`google-generativeai`)
- **Docs:** [`DESIGN.md`](./DESIGN.md), [`hireiq-description.md`](./hireiq-description.md)

---

## Run with Docker (recommended)

```bash
cp backend/.env.example backend/.env
# edit backend/.env and fill in GEMINI_API_KEY (and optionally change RECRUITER_PASSWORD)

docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- SQLite DB lives in the `hireiq_data` Docker volume — survives restarts.

To wipe data:

```bash
docker compose down -v
```

---

## Run locally (no Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # fill in GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api/*` to `http://localhost:8000/api/*` (see `next.config.ts`).

---

## Recruiter access

Recruiter pages (`/recruiter/*`) are gated by a single shared password. Default is `hireme` — set `RECRUITER_PASSWORD` in `backend/.env` to change it.

---

## End-to-end golden path

1. Open http://localhost:3000/recruiter and enter the password.
2. Click **+ Post a Job** — fill in title, department, description, required skills, mark as Public.
3. Open http://localhost:3000/jobs in an incognito tab — your job appears.
4. Click **Apply Now** → fill out the form → either upload a PDF resume or paste 200+ chars of resume text → submit.
5. ~3–8 second loading screen → 5 AI-generated questions appear → answer all five → submit.
6. Land on the confirmation page.
7. Back in `/recruiter/jobs/<id>` → the candidate appears with overall + sub-scores, status, AI summary, optional red flags.
8. Open the candidate profile → click **Draft Invite** → see a generated email; change status to **Shortlisted**.

---

## Architecture notes

```
frontend/
├── app/
│   ├── jobs/                       public job board + detail
│   ├── apply/[slug]/               two-step application
│   └── recruiter/                  password-gated dashboard, create, pipeline, candidate
├── components/{ui,nav,charts}/     reusable primitives
└── lib/                            api client, types, auth helpers

backend/
├── app/
│   ├── routers/                    jobs, apply, candidates, email, analytics
│   ├── gemini.py                   5 prompt fns: screen / generate Qs / score / draft email
│   ├── pdf.py                      pdfplumber-based resume PDF text extraction
│   └── ...
└── data/hireiq.db                  SQLite database (volume-mounted in Docker)
```

The five Claude/Gemini calls in spec section 6 are all wired to Gemini 2.5 Flash with JSON-mode output and a degraded-fallback path so the app never hard-fails when the model is unreachable or returns malformed JSON.
