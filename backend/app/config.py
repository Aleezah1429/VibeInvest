import os
from pathlib import Path
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env")

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY") or os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "claude").lower()
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")
CLAUDE_MODEL_CVO = os.getenv("CLAUDE_MODEL_CVO", "claude-opus-4-5")

def _resolve_database_url() -> str:
    """Pick a database URL with these priorities:
       1. DATABASE_URL (Railway, Heroku, most PaaS)
       2. POSTGRES_URL (alternate name we accept)
       3. local sqlite fallback for dev

    SQLAlchemy 2.x rejects the legacy `postgres://` scheme; coerce it to
    `postgresql://` so URLs copied straight from Railway/Heroku just work."""
    url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
    if not url:
        return f"sqlite:///{REPO_ROOT / 'backend' / 'data.db'}"
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return url


DATABASE_URL = _resolve_database_url()

PIPELINE_TIMEOUT_SEC = int(os.getenv("PIPELINE_TIMEOUT_SEC", "180"))
AGENT_TIMEOUT_SEC = int(os.getenv("AGENT_TIMEOUT_SEC", "60"))
