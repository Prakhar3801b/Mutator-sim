# Deployment Guide — Vercel + Render + Supabase

Production architecture (matches `.clinerules/02-deployment.md`):

```
Browser ──> Vercel (frontend, Next.js)
              │  same-origin /api/* proxy (next.config.mjs rewrites)
              ▼
            Render (backend, FastAPI on uvicorn)
              │  DATABASE_URL (postgresql, Session pooler)
              ▼
            Supabase (Postgres)
```

- **Vercel** serves the Next.js app and reverse-proxies `/api/*` to the backend, so the browser only ever talks to one origin.
- **Render** runs the FastAPI backend; Alembic migrations are applied on every deploy/start.
- **Supabase** hosts the Postgres database (replaces the local SQLite file in production).

---

## Prerequisites

1. Code pushed to GitHub: `https://github.com/Prakhar3801b/Mutator-sim` (branch `main`).
2. Accounts on [Vercel](https://vercel.com), [Render](https://render.com), [Supabase](https://supabase.com) — all connected to GitHub.

---

## Step 1 — Supabase (database)

1. **Create the project**: Supabase dashboard → *New project* → pick a name, region close to your users (e.g. `ap-south-1` / `us-east-1`), and set the **database password** (save it — it is shown once).
2. **Get the connection string**: *Project Settings → Database → Connection string → URI*. Choose **Session** pooling mode (port **5432**). It looks like:

   ```
   postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```

3. Copy this value — it becomes `DATABASE_URL` on Render. Replace `[YOUR-PASSWORD]` with the real password.

**Which connection string to use**

| Mode | Port | Use for | Notes |
|---|---|---|---|
| Session pooler | 5432 | **Render app + local migrations (recommended)** | IPv4-compatible, goes through PgBouncer |
| Transaction pooler | 6543 | Very high-concurrency serverless clients | OK, but session state doesn't persist |
| Direct connection | 5432 (`db.<ref>.supabase.co`) | — | IPv6-only host; avoid from Render |

The backend normalizes any `postgresql://` / `postgres://` URL to the installed `psycopg` 3 driver automatically (`backend/app/database/db.py`), so you can paste the Supabase URI as-is.

**Tables are created by migrations** (Step 3) — you do not need to create anything manually. After the first deploy you should see `gene_cache`, `sequence_cache`, `analysis_history`, `literature_cache` (plus `alembic_version`) in the Supabase *Table Editor*.

> ⚠️ Supabase **free** projects pause after ~7 days of inactivity; restore from the dashboard if that happens.

---

## Step 2 — Render (backend)

Either **Blueprint** (uses `render.yaml` at the repo root) or manual setup:

**Option A — Blueprint (recommended)**
1. Render dashboard → *New + → Blueprint* → select the `Prakhar3801b/Mutator-sim` repo.
2. Render reads `render.yaml` (service `mutator-sim-api`, root dir `backend`).
3. When prompted, fill the `sync: false` environment variables (table below).
4. Apply → first deploy runs automatically.

**Option B — Manual Web Service**
1. *New + → Web Service* → connect the repo → branch `main`.
2. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: Python (set env var `PYTHON_VERSION=3.12.6`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
3. Add the environment variables below → *Create Web Service*.

> The migration runs inside the start command so it works on every plan (including free) and re-applies safely after cold starts. On paid plans you can move `alembic upgrade head` into a **Pre-Deploy Command** instead.

### Backend environment variables (Render → Environment)

| Key | Value | Required |
|---|---|---|
| `DATABASE_URL` | Supabase Session pooler URI from Step 1 | ✅ |
| `CORS_ORIGINS` | `https://<your-app>.vercel.app` (no trailing slash; comma-separate multiple origins) | ✅ |
| `NCBI_API_KEY` | Your NCBI E-utilities key (raises rate limit ~3 → 10 req/s) | optional |
| `PYTHON_VERSION` | `3.12.6` | ✅ |

> Never commit these values — set them only in the Render dashboard. Do **not** create a Render Postgres database (we use Supabase), so Render's own `DATABASE_URL` injection does not apply.

---

## Step 3 — Verify the backend

Wait for the deploy to finish, then:

```bash
curl https://<service-name>.onrender.com/api/health
```

Expected: `"status": "healthy"` with `"api_key_configured"` reflecting whether you set `NCBI_API_KEY`. Then check Supabase *Table Editor* — the four tables + `alembic_version` must exist. If the deploy fails on `alembic upgrade head`, re-check `DATABASE_URL` (password, region, port).

---

## Step 4 — Vercel (frontend)

1. Vercel dashboard → *Add New → Project* → import `Prakhar3801b/Mutator-sim`.
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - Build/install commands: defaults (`next build`)
3. **Environment variable** (add for **Production** *and* **Preview**):
   - `BACKEND_ORIGIN` = `https://<service-name>.onrender.com`

   This is **required**: `frontend/next.config.mjs` deliberately fails the production build when it is missing, so localhost URLs can never leak into production.
4. *Deploy*.

> `BACKEND_ORIGIN` is safe to expose — it is used server-side by the Next.js rewrite, not sent to the browser.

---

## Step 5 — End-to-end verification

- [ ] `GET https://<service>.onrender.com/api/health` → `healthy`
- [ ] Open `https://<your-app>.vercel.app` → search a gene (e.g. BRCA1) → results load
- [ ] Run a mutation simulation → ML prediction + ClinVar evidence render
- [ ] Literature tab returns PubMed results
- [ ] Supabase *Table Editor* shows rows appearing in `analysis_history` after a simulation
- [ ] No CORS errors in the browser console

---

## Database migrations (Alembic)

Schema is managed by **Alembic** (`backend/alembic.ini`, `backend/migrations/`). The initial migration `0001_initial_schema` creates all four tables. `Base.metadata.create_all` still runs at startup as an idempotent safety net, but **Alembic is the source of truth** — always create a migration after changing models.

### Everyday workflow

```bash
cd backend

# 1. Edit models (backend/app/database/models.py), then generate a revision:
alembic revision --autogenerate -m "add feature_x column to analysis_history"

# 2. REVIEW the generated file in migrations/versions/ — autogenerate misses
#    server defaults and SQLite-unsupported ALTERs; fix by hand if needed.

# 3. Apply locally (uses the default sqlite:///./mutator_sim.db):
alembic upgrade head

# 4. Commit the migration file and push. Render applies it on the next deploy
#    via the start command (`alembic upgrade head`).
```

### Applying migrations directly to Supabase from your machine

PowerShell:

```powershell
cd backend
$env:DATABASE_URL = "postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres"
alembic upgrade head          # or: alembic downgrade <revision> / alembic history
```

### Useful commands

| Command | Purpose |
|---|---|
| `alembic history` | List migration chain |
| `alembic current` | Show applied revision |
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade -1` | Roll back the last migration |
| `alembic revision --autogenerate -m "..."` | Diff models → new migration |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Vercel build error: `BACKEND_ORIGIN is not set` | Set `BACKEND_ORIGIN` for Production **and** Preview in Vercel (this guard is intentional). |
| Render deploy fails at `alembic upgrade head` | Verify `DATABASE_URL` (password, project-ref, region, port 5432). |
| `psycopg.OperationalError` / timeouts | Supabase project paused (free tier) or network restrictions; check *Database → Networking*. |
| CORS errors in browser | `CORS_ORIGINS` must contain the exact Vercel origin (scheme + host, no trailing slash). |
| First request after idle is slow (~30–60 s) | Render free tier spins down; the instance cold-starts on the next request. |
| Local dev stopped using Supabase | Unset `DATABASE_URL` locally → falls back to `sqlite:///./mutator_sim.db`. |

