import logging
import os
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger("vibeinvest.config")

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env")

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY") or os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# Token-signing key (ERR-002). MUST be set as a stable env var in production —
# if it falls back to the default below, every existing session token becomes
# invalid the moment a different worker/deploy uses a different key. Generate
# one with: python -c "import secrets; print(secrets.token_hex(32))"
_DEFAULT_SECRET_KEY = "vibeinvest-super-secure-hmac-jwt-key-2026"
SECRET_KEY = os.getenv("SECRET_KEY", _DEFAULT_SECRET_KEY)
if SECRET_KEY == _DEFAULT_SECRET_KEY:
    logger.warning(
        "SECRET_KEY is using the built-in default — tokens will break across "
        "deploys/workers. Set a stable SECRET_KEY env var in production."
    )

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

# Comma-separated allow-list for CORS (ERR-003). Defaults to local dev + the
# deployed Railway URL; override in production with the real frontend origins,
# or set to "*" to explicitly allow all.
_DEFAULT_ORIGINS = (
    "http://localhost:8081,http://localhost:19006,"
    "http://127.0.0.1:8081,https://vibeinvest-production.up.railway.app"
)
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", _DEFAULT_ORIGINS).split(",") if o.strip()
]

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
