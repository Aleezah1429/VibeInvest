"""Aura Score formula and the score-driven verdict mapping."""

# Scores are scaled down by this factor so the 0-1000 band is harder to climb:
# a startup that looks strong on paper lands mid-band rather than near the
# ceiling. Lower this to make the Aura Score harsher, raise it toward 1.0 to
# restore the old (more generous) scale.
SCORE_SCALE = 0.8

# Verdict is derived deterministically from the Aura Score — see verdict_from_score.
INVEST_THRESHOLD = 500
WATCH_THRESHOLD = 300


def aura_score(market_fit: int, financials: int, brand_power: int, strategy: int) -> int:
    weighted = 0.30 * market_fit + 0.25 * financials + 0.20 * brand_power + 0.25 * strategy
    return max(0, min(1000, round(weighted * 10 * SCORE_SCALE)))


def verdict_from_score(score: int, intent: str, llm_verdict: str) -> str:
    """Map an Aura Score to a final verdict.

    INVEST at 500+, WATCH at 300+, otherwise REJECT. This overrides whatever
    verdict the CVO's LLM picked. ACQUIRE is preserved only when the investor's
    intent is 'acquire' and the LLM also chose ACQUIRE while the score still
    clears the INVEST bar — so the acquire flow keeps working.
    """
    if score >= INVEST_THRESHOLD:
        if (intent or "").lower() == "acquire" and llm_verdict == "ACQUIRE":
            return "ACQUIRE"
        return "INVEST"
    if score >= WATCH_THRESHOLD:
        return "WATCH"
    return "REJECT"
