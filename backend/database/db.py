"""
SQLAlchemy database engine + session factory.
Uses a single Base instance shared with all models via this module.
Run from SIH/ project root: python -m backend.main
"""
import sys
from pathlib import Path

# ── Ensure backend/ itself is on sys.path so sub-modules can do `from config import settings`
_BACKEND = Path(__file__).resolve().parents[1]   # .../backend
_ROOT    = _BACKEND.parent                        # .../SIH
for p in (str(_BACKEND), str(_ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

from config import settings

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Singleton Base — ALL models must import from HERE
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Import all model modules to register them with Base, then create tables.
    Must be called BEFORE create_all so SQLAlchemy knows the schema.
    """
    # Import models to populate Base.metadata
    import importlib
    for mod in ("models.tables",):
        try:
            importlib.import_module(mod)
        except ModuleNotFoundError:
            pass
    Base.metadata.create_all(bind=engine)
