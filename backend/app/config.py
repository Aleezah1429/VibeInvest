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

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{REPO_ROOT / 'backend' / 'data.db'}")

PIPELINE_TIMEOUT_SEC = int(os.getenv("PIPELINE_TIMEOUT_SEC", "180"))
AGENT_TIMEOUT_SEC = int(os.getenv("AGENT_TIMEOUT_SEC", "60"))
