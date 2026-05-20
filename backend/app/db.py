from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

IS_SQLITE = DATABASE_URL.startswith("sqlite")

connect_args = {"check_same_thread": False} if IS_SQLITE else {}
engine_kwargs = {"future": True, "connect_args": connect_args}

if not IS_SQLITE:
    # Managed Postgres (Railway/Supabase/etc.) closes idle TCP connections.
    # pool_pre_ping does a cheap SELECT 1 on checkout so we drop dead sockets
    # instead of returning a 500. pool_recycle keeps connections under most
    # provider idle-timeouts (Railway = 5 min by default).
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 280

engine = create_engine(DATABASE_URL, **engine_kwargs)

# SQLite is single-writer. Without WAL and a busy timeout, a long-running
# background task (e.g. the agent pipeline) will lock the file and any
# concurrent request errors with "database is locked". WAL lets reads run
# alongside the writer; busy_timeout makes new writers wait briefly instead
# of failing.
if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def _sqlite_pragmas(dbapi_conn, _record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()

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
    # The ALTER-TABLE migration below is only meaningful for legacy sqlite
    # files that predate the user_id column. On Postgres (or any fresh DB)
    # create_all already produces the right schema.
    if IS_SQLITE:
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
