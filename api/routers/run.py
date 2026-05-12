import json
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

log = logging.getLogger(__name__)

# VibeInvest uses google-adk as the primary boardroom runtime. The claude- and
# openai- comparison runners are optional bonus demos — if their agent dirs
# don't exist yet, skip registering those routes so the API still boots.
try:
    from api.services.claude_runner import run_pipeline as run_claude_pipeline
except Exception as exc:
    run_claude_pipeline = None
    log.warning("Claude runner unavailable: %s", exc)

try:
    from api.services.openai_runner import run_pipeline as run_openai_pipeline
except Exception as exc:
    run_openai_pipeline = None
    log.warning("OpenAI runner unavailable: %s", exc)

from api.services.google_adk_runner import run_pipeline as run_google_adk_pipeline

router = APIRouter(prefix="/api/run")


class RunRequest(BaseModel):
    company_name: str


@router.post("/claude")
async def run_claude(request: RunRequest):
    if run_claude_pipeline is None:
        raise HTTPException(status_code=503, detail="Claude runner not available")

    async def event_generator():
        async for event in run_claude_pipeline(request.company_name):
            yield {
                "event": event["type"],
                "data": json.dumps(event),
            }

    return EventSourceResponse(event_generator())


@router.post("/openai")
async def run_openai(request: RunRequest):
    if run_openai_pipeline is None:
        raise HTTPException(status_code=503, detail="OpenAI runner not available")

    async def event_generator():
        async for event in run_openai_pipeline(request.company_name):
            yield {
                "event": event["type"],
                "data": json.dumps(event),
            }

    return EventSourceResponse(event_generator())


@router.post("/google-adk")
async def run_google_adk(request: RunRequest):
    async def event_generator():
        async for event in run_google_adk_pipeline(request.company_name):
            yield {
                "event": event["type"],
                "data": json.dumps(event),
            }

    return EventSourceResponse(event_generator())
