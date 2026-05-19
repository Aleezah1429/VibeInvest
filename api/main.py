from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from api.database import SessionLocal, AnalysisSession, AgentResult
import asyncio
import uuid
import json

app = FastAPI(title="VibeInvest API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated Agent Functions (Replace these with your real AI logic)
async def agent_skeptic(startup_name: str):
    await asyncio.sleep(2)
    return {"summary": f"The Skeptic: {startup_name} faces tough market competition.", "raw": {"competitors": ["A", "B"]}}

async def agent_munshi(startup_name: str, skeptic_context: dict):
    await asyncio.sleep(2)
    return {"summary": "The Munshi: Financials show a moderate burn rate.", "raw": {"burn_rate": "moderate"}}

async def agent_hype(startup_name: str, previous_context: dict):
    await asyncio.sleep(2)
    return {"summary": "The Hype: Brand sentiment is overwhelmingly positive.", "raw": {"sentiment": "positive"}}

async def agent_cvo(startup_name: str, all_context: dict):
    await asyncio.sleep(2)
    return {"summary": "The CVO: Final verdict is to INVEST.", "score": 850, "raw": {"verdict": "invest"}}

@app.get("/api/analyze")
async def analyze_startup(request: Request, startup_name: str):
    session_id = str(uuid.uuid4())
    db = SessionLocal()
    
    # 1. Initialize the session in the DB
    db_session = AnalysisSession(id=session_id, startup_name=startup_name)
    db.add(db_session)
    db.commit()

    async def event_generator():
        try:
            context = {}
            
            # AGENT 1: The Skeptic
            skeptic_data = await agent_skeptic(startup_name)
            context["skeptic"] = skeptic_data
            db.add(AgentResult(session_id=session_id, agent_name="The Skeptic", summary=skeptic_data["summary"], raw_data=skeptic_data["raw"]))
            db.commit()
            yield {"data": json.dumps({"agent": "The Skeptic", "summary": skeptic_data["summary"]})}

            # AGENT 2: The Munshi
            munshi_data = await agent_munshi(startup_name, context)
            context["munshi"] = munshi_data
            db.add(AgentResult(session_id=session_id, agent_name="The Munshi", summary=munshi_data["summary"], raw_data=munshi_data["raw"]))
            db.commit()
            yield {"data": json.dumps({"agent": "The Munshi", "summary": munshi_data["summary"]})}

            # AGENT 3: The Hype
            hype_data = await agent_hype(startup_name, context)
            context["hype"] = hype_data
            db.add(AgentResult(session_id=session_id, agent_name="The Hype", summary=hype_data["summary"], raw_data=hype_data["raw"]))
            db.commit()
            yield {"data": json.dumps({"agent": "The Hype", "summary": hype_data["summary"]})}

            # AGENT 4: The CVO
            cvo_data = await agent_cvo(startup_name, context)
            db_session.final_score = cvo_data["score"]
            db_session.combined_result = cvo_data["raw"]
            db.add(AgentResult(session_id=session_id, agent_name="The CVO", summary=cvo_data["summary"], raw_data=cvo_data["raw"]))
            db.commit()
            
            yield {"data": json.dumps({
                "agent": "The CVO", 
                "summary": cvo_data["summary"], 
                "final_score": cvo_data["score"]
            })}
            
        finally:
            db.close()

    return EventSourceResponse(event_generator())
