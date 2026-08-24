import os
from sqlalchemy import create_engine

# ponytail: default SQLite fallback; upgrade to PostgreSQL via DATABASE_URL env var when available
db_url = os.getenv("DATABASE_URL", "sqlite:///./feasibility.db")
engine = create_engine(db_url, pool_pre_ping=("postgresql" in db_url))

