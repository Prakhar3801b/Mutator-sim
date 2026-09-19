# Mutator Sim 🧬

Computational platform for NCBI gene discovery, mutation simulation, codon translation, and ML impact analysis.

## Architecture

| Layer | Stack | Hosting |
|---|---|---|
| Frontend | Next.js 14 (App Router) | **Vercel** |
| Backend | FastAPI + SQLAlchemy 2.0 + scikit-learn | **Render** |
| Database | Postgres (caches + analysis history) | **Supabase** |
| Data sources | NCBI E-utilities, PubMed, ClinVar | external APIs |

The browser only talks to one origin: the Next.js app reverse-proxies `/api/*` to the FastAPI backend (`frontend/next.config.mjs` rewrite via the `BACKEND_ORIGIN` env var).

## Project layout

```
backend/          FastAPI service (app/api, app/bio, app/ml, app/database, ...)
  alembic.ini     DB migrations config (schema is Alembic-managed)
  migrations/     Migration scripts (versions/0001_initial_schema.py = initial schema)
frontend/         Next.js app (src/app, src/components, src/lib/api.ts)
DEPLOYMENT.md     Step-by-step production deployment guide
render.yaml       Render Blueprint for the backend
```

## Local development

Backend (Python 3.12+):

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # uses sqlite:///./mutator_sim.db by default
```

Frontend:

```bash
cd frontend
npm install
npm run dev                                 # proxies /api/* to http://localhost:8000
```

## Database migrations

```bash
cd backend
alembic upgrade head                        # apply
alembic revision --autogenerate -m "..."    # after editing app/database/models.py
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for production deployment (Supabase + Render + Vercel), environment variables, and troubleshooting.
