import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Genetic Mutation Simulator API"
    VERSION: str = "1.1.0"
    API_PREFIX: str = "/api"
    
    # NCBI Settings
    NCBI_API_KEY: str = os.getenv("NCBI_API_KEY", "665001148d5f62268a8c9c3cdc217e8c6708")
    NCBI_EMAIL: str = os.getenv("NCBI_EMAIL", "simulator-research@mutator-sim.org")
    NCBI_TOOL: str = os.getenv("NCBI_TOOL", "GeneticMutationSimulator")
    NCBI_BASE_URL: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    
    # Rate Limiting (NCBI allows 10 req/s with API key, 3 req/s without)
    NCBI_RATE_LIMIT_PER_SEC: float = 9.0 if os.getenv("NCBI_API_KEY", "665001148d5f62268a8c9c3cdc217e8c6708") else 2.8
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mutator_sim.db")
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

settings = Settings()
