from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.db import init_db
from app.ml.model import get_trained_model
from app.api import genes, sequences, mutations, variants, literature, predictions, reports

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Computational platform for NCBI gene discovery, mutation simulation, codon translation, and ML impact analysis."
)

# CORS Middleware
# The browser client talks to this API through a same-origin proxy
# (Next.js rewrite) and sends no cookies/credentials, so credentialed
# CORS is unnecessary. Origins come from settings (CORS_ORIGINS env var).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema and pre-train/load ML model on startup
@app.on_event("startup")
def startup_event():
    init_db()
    get_trained_model()

# Include Routers
app.include_router(genes.router, prefix=settings.API_PREFIX)
app.include_router(sequences.router, prefix=settings.API_PREFIX)
app.include_router(mutations.router, prefix=settings.API_PREFIX)
app.include_router(variants.router, prefix=settings.API_PREFIX)
app.include_router(literature.router, prefix=settings.API_PREFIX)
app.include_router(predictions.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ncbi_rate_limit_per_sec": settings.NCBI_RATE_LIMIT_PER_SEC,
        "api_key_configured": bool(settings.NCBI_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
