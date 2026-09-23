import os
from pydantic import BaseModel


def _parse_cors_origins(raw: str) -> list[str]:
    """Parse a comma-separated origin list from the CORS_ORIGINS env var.

    Falls back to local development origins when unset/empty so local
    `next dev` (port 3000) keeps working with zero configuration.
    """
    origins = [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]
    return origins or [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]


class Settings(BaseModel):
    PROJECT_NAME: str = "Genetic Mutation Simulator API"
    VERSION: str = "1.1.0"
    API_PREFIX: str = "/api"

    # NCBI Settings
    # NOTE: The API key is read strictly from the environment. Never hardcode
    # secrets in source; set NCBI_API_KEY in the hosting platform's dashboard.
    NCBI_API_KEY: str = os.getenv("NCBI_API_KEY", "")
    NCBI_EMAIL: str = os.getenv("NCBI_EMAIL", "simulator-research@mutator-sim.org")
    NCBI_TOOL: str = os.getenv("NCBI_TOOL", "GeneticMutationSimulator")
    NCBI_BASE_URL: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    # Rate Limiting (NCBI allows 10 req/s with API key, 3 req/s without)
    NCBI_RATE_LIMIT_PER_SEC: float = 9.0 if os.getenv("NCBI_API_KEY") else 2.8

    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mutator_sim.db")

    # AI External API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # CORS (comma-separated list via CORS_ORIGINS, e.g.
    # "https://mutator-sim.vercel.app,http://localhost:3000")
    CORS_ORIGINS: list[str] = _parse_cors_origins(os.getenv("CORS_ORIGINS", ""))

settings = Settings()

