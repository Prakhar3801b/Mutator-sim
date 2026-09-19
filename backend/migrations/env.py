"""Alembic environment wired to the application's database configuration.

The target URL always comes from app settings (the ``DATABASE_URL`` environment
variable, defaulting to the local SQLite file), so the exact same migrations
run locally, against Supabase, and inside the Render deploy without any
credentials being duplicated here.
"""
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Make the backend package importable no matter the working directory
# (alembic.ini lives in backend/, but commands may be run from elsewhere).
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import settings  # noqa: E402
from app.database import models  # noqa: E402,F401  (import registers tables on Base.metadata)
from app.database.db import Base, resolve_database_url  # noqa: E402

# The Alembic Config object, which provides access to values in alembic.ini.
config = context.config

# Interpret the config file for Python logging if present.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Point Alembic at the same resolved URL the application uses.
config.set_main_option("sqlalchemy.url", resolve_database_url(settings.DATABASE_URL))

# Model metadata for autogenerate support.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode: emit SQL to stdout, no DB connection."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode: connect to the DB and apply."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
