"""Web-search tool via Tavily."""
import logging
from typing import List, Optional

import httpx

from .. import config

log = logging.getLogger("agents.tools")

TAVILY_URL = "https://api.tavily.com/search"


def web_search(query: str, max_results: int = 5, search_depth: str = "basic") -> List[dict]:
    if not config.TAVILY_API_KEY:
        log.warning("TAVILY_API_KEY not set — returning empty results")
        return []
    try:
        resp = httpx.post(
            TAVILY_URL,
            json={
                "api_key": config.TAVILY_API_KEY,
                "query": query,
                "max_results": max_results,
                "search_depth": search_depth,
                "include_answer": False,
            },
            timeout=20.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("results", [])
    except Exception as e:
        log.warning("Tavily search failed for %r: %s", query, e)
        return []


def format_search_results(results: List[dict]) -> str:
    if not results:
        return "(no search results)"
    lines = []
    for i, r in enumerate(results, 1):
        title = r.get("title", "")
        url = r.get("url", "")
        content = (r.get("content") or "").strip().replace("\n", " ")
        lines.append(f"[{i}] {title} — {url}\n    {content[:400]}")
    return "\n".join(lines)
