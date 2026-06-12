# Dockerfile for deploying the VibeInvest backend to Hugging Face Spaces
# (Docker SDK). HF routes traffic to port 7860 by default, so we bind there.
# Build context is the backend/ folder (this file sits next to app/ and requirements.txt).
FROM python:3.12-slim

WORKDIR /app

# System deps kept minimal; psycopg2-binary ships wheels so no build toolchain needed.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# HF Spaces expects the app on 7860; allow override via $PORT for other hosts.
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
