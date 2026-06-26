from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL.strip('"').strip("'")

# Translate Prisma file: database URLs to SQLite for SQLAlchemy compatibility
if DATABASE_URL.startswith("file:"):
    db_path = DATABASE_URL.replace("file:", "")
    DATABASE_URL = f"sqlite:///{db_path}"

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