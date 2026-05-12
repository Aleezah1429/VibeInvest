# Workflow — Spec-Driven Development (Hackathon Edition)

> Read this **first** every time you start work on a feature. It's the discipline that lets 3 people ship in 2 days without stepping on each other.

---

## The loop (per feature)

```
┌────────────────────────────────────────────────────────────┐
│  Step 1  →  Pick feature + branch                          │
│  Step 2  →  Read its spec folder (plan + reqs + valid.)    │
│  Step 3  →  Implement; tick R# items as you ship           │
│  Step 4  →  Smoke test with V# checklist                   │
│  Step 5  →  Merge to main; tick the row in specs/roadmap   │
└────────────────────────────────────────────────────────────┘
```

| Step | Output | Tooling |
| --- | --- | --- |
| 1 | Branch `feat/<feature-name>` | `git checkout -b feat/agent-pipeline` |
| 2 | Loaded context — you know what to build and what done means | Read `features/<name>/{plan,requirements,validations}.md` |
| 3 | Working code, ticked checkboxes in `requirements.md` | manual |
| 4 | Manual validation pass through `validations.md` | browser + curl |
| 5 | Merged PR, ticked row in `specs/roadmap.md` | `git merge --no-ff` to main |

---

## Cheat sheet — every feature, in order

```bash
# ── STEP 1: branch from clean main ──────────────────────────
git checkout main
git pull
git checkout -b feat/<feature-name>
# Example: git checkout -b feat/agent-pipeline

# ── STEP 2: read the spec ───────────────────────────────────
# Open features/<feature-name>/plan.md          → the design
# Open features/<feature-name>/requirements.md  → the checklist
# Open features/<feature-name>/validations.md   → how you'll know it works

# ── STEP 3: implement ───────────────────────────────────────
# Work down requirements.md top to bottom
# Tick [x] each item as you ship it
# Stash open questions in todo.md — do not let them block you

# ── STEP 4: validate ────────────────────────────────────────
# Run through validations.md in a real browser / via curl
# Tick [x] each V# item you observe
# If something breaks: fix code, do NOT change the validation

# ── STEP 5: merge ───────────────────────────────────────────
git checkout main
git merge --no-ff feat/<feature-name>
git push
# Tick the row in specs/roadmap.md for this feature
git commit -am "roadmap: <feature-name> shipped"
git push
```

---

## Decision guide — common questions

### "Found a bug — change `validations.md` or `requirements.md`?"

| Scenario | Change spec? |
| --- | --- |
| Implementation bug | ❌ No — just fix the code |
| Cosmetic / styling polish | ❌ No |
| New requirement discovered | ✅ Add a new R# row to `requirements.md` |
| Validation gap revealed | ✅ Optional — add a V# row to prevent regression |
| Design changed mid-sprint | ✅ Update `plan.md` first, then propagate |

### "Should I write a test?"

For 2 days, **no automated tests**. Manual validation through `validations.md` is the bar. The discipline is in the checklist, not in Vitest.

After the hackathon (Phase 1): add a Vitest layer for pure functions (`run-state.ts`, `flag-extractor.ts`, `verdict-theme.ts`) and a Playwright happy-path test.

### "Two features need the same component — where does it live?"

`frontend/components/shared/` — but only if **both** features actually use it. Premature sharing is worse than duplication. If feature A ships and only feature B might use it later, leave it scoped to A.

### "Spec says X but reality needs Y — what do I do?"

Update the spec **before** writing code. The spec is the source of truth. If you change code without updating the spec, the next person hits the wrong expectation in `validations.md` and wastes time.

---

## Hard rules

1. **No code before the spec is read.** If you can't articulate what done looks like (the V# items), you're not ready to type.
2. **Tick checkboxes in real time.** Don't batch — tick `requirements.md` as you ship each item. The list is your status board.
3. **No silent scope expansion.** New idea? Either add it to the current spec (with team sign-off) or open `todo.md`.
4. **No persistent state in MVP.** Refresh-and-lose is the contract. Anyone caught using `localStorage` outside `lib/storage.ts` (when it exists) gets to debug their own browser cache forever.
5. **The four agent contracts (`SkepticReport`, `MunshiReport`, `HypeReport`, `FinalReport`) only change when all three lanes agree.** They're the load-bearing interface between Lanes A and B.

---

## File map (kahan kya hai)

```
specs/                    Project-level — change rarely
  mission.md              Why VibeInvest exists
  tech.md                 Stack + conventions + hard rules
  roadmap.md              All phases with per-feature checkboxes

features/<name>/          Per-feature — created before code
  plan.md                 Goal, user stories, architecture sketch, decisions
  requirements.md         Engineer's checklist (R1, R2, ...)
  validations.md          User-visible acceptance tests (V1, V2, ...)

PHASES.md                 Long-form phase narrative (hackathon → Year 1)
ROADMAP.md                2-day sprint hour-by-hour plan
FEATURES.md               Feature tiers (MVP / v1.5 / future)
AGENTS.md                 Agent prompts + JSON contracts
README.md                 Outward-facing project intro
WORKFLOW.md               ← this file
todo.md                   Live capture during sprint (informal)
```

---

## When the spec system is overkill (don't pretend it's not)

For a 2-day sprint, sometimes the right move is to just type code. The spec system is worth it when:
- Two people might touch the same area
- A decision will be questioned later ("why did we do it this way?")
- The work spans more than one block (3+ hours)

For a 15-minute CSS tweak, just commit and move on.

---

## TL;DR

> **Branch → Read spec → Code → Validate → Merge.**
> Tick boxes as you go. Update the spec when reality changes. Never the other way around.
