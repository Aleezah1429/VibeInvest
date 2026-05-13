"""Tool functions exposed to ADK agents.

ADK calls these as `FunctionTool`s. Each function's docstring is what the LLM
sees when deciding whether and how to call the tool — keep them descriptive.

Single boundary: every agent tool lives here. If a tool grows beyond ~50 lines
or pulls in a heavy dep, split it into its own module and update agent_system.
"""
from urllib.parse import quote_plus, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup


_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


# Pakistan-relevant domains the Skeptic should see first when they appear in
# raw search results. Order doesn't matter — membership is what counts.
# Adapted from idea-kill-switch's domain-scoring pattern, localized for PK.
_PK_PREFERRED_DOMAINS = {
    "dawn.com",
    "propakistani.pk",
    "tribune.com.pk",
    "thenews.com.pk",
    "geo.tv",
    "arynews.tv",
    "brecorder.com",
    "profit.pakistantoday.com.pk",
    "techjuice.pk",
    "menabytes.com",
    "lums.edu.pk",
    "nu.edu.pk",
    "iba.edu.pk",
    "comsats.edu.pk",
    "nust.edu.pk",
    "fast.edu.pk",
}


def _canonical_url(url: str) -> str:
    """Strip query string, fragment, trailing slash, and lowercase host.

    Two DuckDuckGo entries that point to the same article via different
    tracking params or "https://x.com/a/" vs "https://x.com/a" become equal.
    """
    if not url:
        return ""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    try:
        parts = urlparse(url)
    except ValueError:
        return url
    netloc = parts.netloc.lower()
    path = parts.path.rstrip("/") or "/"
    # Drop query + fragment.
    return urlunparse((parts.scheme, netloc, path, "", "", ""))


def _is_pakistan_relevant(url: str) -> bool:
    """True if the URL's domain is .pk or a known Pakistan-relevant outlet."""
    try:
        host = urlparse(url if url.startswith(("http://", "https://")) else "https://" + url).netloc.lower()
    except ValueError:
        return False
    if host.endswith(".pk"):
        return True
    # Match exact host OR any subdomain of a preferred domain.
    return any(host == d or host.endswith("." + d) for d in _PK_PREFERRED_DOMAINS)


def web_search(query: str) -> dict:
    """Search the web for up-to-date information about a topic.

    Use this to find competitors, market data, or recent news about a Pakistani
    startup sector. If results come back empty or the call fails, fall back to
    reasoning from your training knowledge and clearly mark estimates.

    Results are deduplicated by canonical URL and re-ordered so that
    Pakistan-relevant domains (.pk, Dawn, ProPakistani, Tribune, university
    sites) appear first when they're in the raw result set.

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

        # First pass: collect every parseable hit (don't truncate yet — dedup
        # and ranking must run on the full set or we lose PK-relevant items
        # that DuckDuckGo placed below the top 5.)
        raw: list[dict] = []
        seen_urls: set[str] = set()
        for node in soup.select(".result"):
            title_el = node.select_one(".result__title")
            snippet_el = node.select_one(".result__snippet")
            link_el = node.select_one(".result__url")
            if not title_el or not link_el:
                continue
            result_url = link_el.get_text(strip=True)
            canon = _canonical_url(result_url)
            if not canon or canon in seen_urls:
                continue
            seen_urls.add(canon)
            raw.append(
                {
                    "title": title_el.get_text(strip=True),
                    "url": result_url,
                    "snippet": snippet_el.get_text(strip=True) if snippet_el else "",
                }
            )

        # Stable sort: PK-relevant first, original order preserved within each group.
        ranked = sorted(raw, key=lambda r: 0 if _is_pakistan_relevant(r["url"]) else 1)

        return {"results": ranked[:5]}
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
