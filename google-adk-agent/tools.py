"""Tool functions exposed to ADK agents.

ADK calls these as `FunctionTool`s. Each function's docstring is what the LLM
sees when deciding whether and how to call the tool — keep them descriptive.

Single boundary: every agent tool lives here. If a tool grows beyond ~50 lines
or pulls in a heavy dep, split it into its own module and update agent_system.
"""
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup


_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def web_search(query: str) -> dict:
    """Search the web for up-to-date information about a topic.

    Use this to find competitors, market data, or recent news about a Pakistani
    startup sector. If results come back empty or the call fails, fall back to
    reasoning from your training knowledge and clearly mark estimates.

    Args:
        query: The search query string. Be specific — include "Pakistan" or
               the city name when relevant for local results.

    Returns:
        A dict with key "results" — a list of up to 5 objects each having
        "title", "url", and "snippet" fields. If the search fails, returns
        {"results": [], "error": "<message>"}.
    """
    try:
        url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
        resp = requests.get(
            url,
            headers={"User-Agent": _USER_AGENT},
            timeout=10,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        results: list[dict] = []
        for node in soup.select(".result")[:5]:
            title_el = node.select_one(".result__title")
            snippet_el = node.select_one(".result__snippet")
            link_el = node.select_one(".result__url")
            if not title_el or not link_el:
                continue
            results.append(
                {
                    "title": title_el.get_text(strip=True),
                    "url": link_el.get_text(strip=True),
                    "snippet": snippet_el.get_text(strip=True) if snippet_el else "",
                }
            )
        return {"results": results}
    except Exception as exc:
        return {"results": [], "error": f"Search failed: {exc}"}


_ALLOWED_CALC_CHARS = set("0123456789+-*/().eE ")


def calculate(expression: str) -> dict:
    """Evaluate a simple arithmetic expression.

    Use this for any financial math — gross margins, burn rate, break-even
    timing — rather than estimating arithmetic in your head. Operators
    supported: + - * / ( ) and decimal numbers including scientific notation.

    Args:
        expression: A string containing only digits, arithmetic operators,
                    parentheses, and spaces. Do not include variable names.

    Returns:
        A dict with key "result" (float) on success, or {"error": "<msg>"}
        if the expression is invalid or fails to evaluate.
    """
    if not expression or not all(c in _ALLOWED_CALC_CHARS for c in expression):
        return {"error": "Expression contains invalid characters"}
    try:
        value = eval(expression, {"__builtins__": {}}, {})  # noqa: S307 — sandboxed
        return {"result": float(value)}
    except Exception as exc:
        return {"error": f"Calculation failed: {exc}"}
