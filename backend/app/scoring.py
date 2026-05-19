"""Aura Score formula."""


def aura_score(market_fit: int, financials: int, brand_power: int, strategy: int) -> int:
    weighted = 0.30 * market_fit + 0.25 * financials + 0.20 * brand_power + 0.25 * strategy
    return max(0, min(1000, round(weighted * 10)))
