"""One-off migration: re-derive the verdict for every completed analysis from
its stored Aura Score using the current scoring rule.

History: the verdict was originally written directly from the CVO LLM's pick.
The orchestrator now overrides that with `verdict_from_score` (INVEST at 500+,
WATCH at 300+, otherwise REJECT). Rows persisted before that override still
carry the LLM's verdict, which can disagree with the score — e.g. a 640 row
saved as the legacy literal 'PASS'. This script applies the current rule to
every completed row.

Side effects:
- 'PASS' (legacy literal) becomes REJECT / WATCH / INVEST depending on score.
- ACQUIRE is preserved only when intent='acquire' AND the stored verdict was
  already ACQUIRE AND score >= 500 — matches the live orchestrator logic.
- verdict_sub is cleared when the verdict changes, so a stale qualifier like
  'STRONG CONVICTION' doesn't end up next to a fresh REJECT pill.

Run once:
    cd backend
    python -m scripts.migrate_pass_to_reject
"""
import json
import logging

from sqlalchemy import text

from app.db import engine
from app.scoring import verdict_from_score

log = logging.getLogger("migrate_verdict_from_score")
logging.basicConfig(level=logging.INFO, format="%(message)s")


def main() -> None:
    scanned = 0
    changed = 0

    with engine.begin() as conn:
        rows = conn.execute(
            text(
                "SELECT id, score, intent, verdict, verdict_sub, report_json "
                "FROM analyses WHERE status = 'completed' AND score IS NOT NULL"
            )
        ).fetchall()

        for row in rows:
            scanned += 1
            new_verdict = verdict_from_score(row.score, row.intent or "", row.verdict or "")
            if new_verdict == row.verdict:
                continue

            new_verdict_sub = ""
            params = {"id": row.id, "verdict": new_verdict, "verdict_sub": new_verdict_sub}
            patched_blob = None

            if row.report_json:
                try:
                    blob = json.loads(row.report_json)
                except (TypeError, ValueError):
                    blob = None
                if isinstance(blob, dict):
                    blob["verdict"] = new_verdict
                    blob["verdict_sub"] = new_verdict_sub
                    patched_blob = json.dumps(blob)

            if patched_blob is not None:
                params["report_json"] = patched_blob
                conn.execute(
                    text(
                        "UPDATE analyses SET verdict = :verdict, "
                        "verdict_sub = :verdict_sub, report_json = :report_json "
                        "WHERE id = :id"
                    ),
                    params,
                )
            else:
                conn.execute(
                    text(
                        "UPDATE analyses SET verdict = :verdict, "
                        "verdict_sub = :verdict_sub WHERE id = :id"
                    ),
                    params,
                )

            changed += 1
            log.info("  %s: %s -> %s (score=%d)", row.id, row.verdict, new_verdict, row.score)

    log.info("scanned: %d  changed: %d", scanned, changed)


if __name__ == "__main__":
    main()
