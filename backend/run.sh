#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# Defaults are dev-friendly. On Railway, $PORT is set by the platform and
# we drop --reload (production should not auto-reload).
PORT="${PORT:-8000}"
RELOAD_FLAG="--reload"
if [ "${ENV:-dev}" = "prod" ] || [ -n "${RAILWAY_ENVIRONMENT:-}" ]; then
  RELOAD_FLAG=""
fi

PYTHON="venv/bin/python"
[ -x "$PYTHON" ] || PYTHON="python"

exec "$PYTHON" -m uvicorn backend.app.main:app $RELOAD_FLAG --host 0.0.0.0 --port "$PORT"
