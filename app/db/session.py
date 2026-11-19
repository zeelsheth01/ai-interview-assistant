from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = (settings.DATABASE_URL or "sqlite:///./dev.db").strip('"').strip("'")

# Translate Prisma file: database URLs to SQLite for SQLAlchemy compatibility
project_root = Path(__file__).resolve().parent.parent.parent

if DATABASE_URL.startswith("file:"):
    raw_path = DATABASE_URL.replace("file:", "").strip()
    if not Path(raw_path).is_absolute():
        abs_db = (project_root / raw_path).resolve()
    else:
        abs_db = Path(raw_path).resolve()
    DATABASE_URL = f"sqlite:///{abs_db.as_posix()}"
elif DATABASE_URL.startswith("sqlite:///./"):
    raw_path = DATABASE_URL.replace("sqlite:///./", "").strip()
    abs_db = (project_root / raw_path).resolve()
    DATABASE_URL = f"sqlite:///{abs_db.as_posix()}"
elif not DATABASE_URL or DATABASE_URL == "sqlite:///":
    abs_db = (project_root / "dev.db").resolve()
    DATABASE_URL = f"sqlite:///{abs_db.as_posix()}"

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Use connection pooling and pre-ping to optimize remote/cloud PostgreSQL connections
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)