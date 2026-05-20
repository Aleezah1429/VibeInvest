from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from . import models  # noqa: F401  ensure models are imported
    from . import auth  # noqa: F401  ensure auth models are imported
    Base.metadata.create_all(bind=engine)
    _ensure_analyses_user_id()


def _ensure_analyses_user_id():
    """Additive SQLite migration: add analyses.user_id if missing."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    if "analyses" not in inspector.get_table_names():
        return
    cols = {c["name"] for c in inspector.get_columns("analyses")}
    if "user_id" in cols:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE analyses ADD COLUMN user_id TEXT REFERENCES users(id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_analyses_user_id ON analyses(user_id)"))
