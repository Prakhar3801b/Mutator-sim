from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings


def resolve_database_url(url: str) -> str:
    """Map plain Postgres URLs (Supabase/Render dashboards) to the psycopg 3 driver.

    SQLAlchemy selects its DBAPI from the URL scheme. Supabase hands out
    ``postgresql://...`` / ``postgres://...``, which would make SQLAlchemy try
    to import psycopg2 (not installed). Rewrite those to
    ``postgresql+psycopg://`` (psycopg 3) unless an explicit driver is already
    present in the URL.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


_resolved_url = resolve_database_url(settings.DATABASE_URL)

# SQLite needs connect_args check_same_thread=False
connect_args = {}
if _resolved_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Managed Postgres (Supabase, fronted by PgBouncer) drops idle connections and
# has a small per-instance connection budget, so keep the pool modest and
# validate stale connections before they are handed to the app.
engine_kwargs = {}
if not _resolved_url.startswith("sqlite"):
    engine_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 1800,
        "pool_size": 5,
        "max_overflow": 5,
    }

engine = create_engine(
    _resolved_url,
    connect_args=connect_args,
    echo=False,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Safety net for fresh environments. The schema is owned by Alembic
    # (backend/migrations); create_all is idempotent so it never fights an
    # Alembic-managed database.
    Base.metadata.create_all(bind=engine)
