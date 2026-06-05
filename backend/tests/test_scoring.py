"""Tests for the Aura Score formula and score-driven verdict mapping.

These are the most safety-critical pure functions in the backend: they decide
the number and the verdict every report shows. Run with `pytest` from backend/.
"""

import pytest

from app.scoring import (
    INVEST_THRESHOLD,
    SCORE_SCALE,
    WATCH_THRESHOLD,
    aura_score,
    verdict_from_score,
)


class TestAuraScore:
    def test_all_zero_is_zero(self):
        assert aura_score(0, 0, 0, 0) == 0

    def test_all_max_respects_scale_and_ceiling(self):
        # weighted average of all-100 inputs == 100 → *10 == 1000 → *0.8 == 800.
        assert aura_score(100, 100, 100, 100) == round(1000 * SCORE_SCALE)

    def test_never_exceeds_1000(self):
        # Even with out-of-range inputs the result is clamped to [0, 1000].
        assert aura_score(1000, 1000, 1000, 1000) == 1000

    def test_never_below_zero(self):
        assert aura_score(-50, -50, -50, -50) == 0

    def test_weighting_market_fit_dominates(self):
        # market_fit has the highest weight (0.30); a high market_fit score
        # should outrank an equal score concentrated in brand_power (0.20).
        market_heavy = aura_score(100, 0, 0, 0)
        brand_heavy = aura_score(0, 0, 100, 0)
        assert market_heavy > brand_heavy

    def test_known_weighting(self):
        # 0.30*80 + 0.25*60 + 0.20*40 + 0.25*50 = 24 + 15 + 8 + 12.5 = 59.5
        # *10 = 595, *0.8 = 476 (rounded).
        assert aura_score(80, 60, 40, 50) == round(595 * SCORE_SCALE)

    def test_returns_int(self):
        assert isinstance(aura_score(33, 67, 11, 90), int)


class TestVerdictFromScore:
    def test_invest_at_threshold(self):
        assert verdict_from_score(INVEST_THRESHOLD, "invest", "INVEST") == "INVEST"

    def test_invest_above_threshold(self):
        assert verdict_from_score(900, "invest", "INVEST") == "INVEST"

    def test_watch_band(self):
        assert verdict_from_score(WATCH_THRESHOLD, "invest", "WATCH") == "WATCH"
        assert verdict_from_score(INVEST_THRESHOLD - 1, "invest", "INVEST") == "WATCH"

    def test_reject_below_watch(self):
        assert verdict_from_score(WATCH_THRESHOLD - 1, "invest", "INVEST") == "REJECT"
        assert verdict_from_score(0, "invest", "INVEST") == "REJECT"

    def test_acquire_only_when_intent_and_llm_and_score_align(self):
        assert verdict_from_score(700, "acquire", "ACQUIRE") == "ACQUIRE"

    def test_acquire_ignored_when_intent_not_acquire(self):
        # LLM said ACQUIRE but the investor's intent wasn't acquire → INVEST.
        assert verdict_from_score(700, "invest", "ACQUIRE") == "INVEST"

    def test_acquire_ignored_when_llm_disagrees(self):
        assert verdict_from_score(700, "acquire", "INVEST") == "INVEST"

    def test_acquire_ignored_below_invest_threshold(self):
        # Even with intent+LLM agreement, a sub-INVEST score can't ACQUIRE.
        assert verdict_from_score(WATCH_THRESHOLD, "acquire", "ACQUIRE") == "WATCH"

    def test_intent_case_insensitive(self):
        assert verdict_from_score(700, "ACQUIRE", "ACQUIRE") == "ACQUIRE"

    @pytest.mark.parametrize("intent", [None, "", "invest"])
    def test_handles_missing_or_plain_intent(self, intent):
        # Should never raise on falsy/plain intent; just resolves by score band.
        assert verdict_from_score(700, intent, "INVEST") == "INVEST"
