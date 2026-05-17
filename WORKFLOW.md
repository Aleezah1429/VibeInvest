# Workflow — How We Build

Spec-driven development for a 5-day hackathon. Every feature starts with a spec, every commit follows a convention, every screen follows a pattern.

---

## Philosophy

> **Specs before code. Patterns before creativity. Ship before perfect.**

With a hard 5-day deadline, we can't afford to context-switch between "what should I build" and "how should I build it." The spec system removes the first question entirely — you read the spec, you build exactly what it says, you move on.

---

## 1. Spec-Driven Development

Every piece of the project is driven by one of these documents:

| Document | Purpose | Location |
|----------|---------|----------|
| **PRD.md** | What to build — screens, data models, API contract | `.agents/specs/PRD.md` |
| **PLAN.md** | When to build it — 5-day execution plan with deliverables | `.agents/specs/PLAN.md` |
| **AGENTS.md** | How agents work — system prompts, tools, I/O contracts | `AGENTS.md` (root) |
| **Skills** | How to do common tasks — patterns for screens, components, API calls | `.agents/skills/*.md` |

### The Rule

Before writing any code, check these docs in order:
1. **PRD.md** — Does this feature exist in the screen breakdown or data model?
2. **PLAN.md** — Is this feature scheduled for today?
3. **Skills** — Is there a pattern I should follow?

If the answer to #2 is "no," it goes on the cut list. No exceptions.

---

## 2. Skills System

Skills are reusable recipes in `.agents/skills/` that standardize common tasks:

| Skill | When to Use |
|-------|-------------|
| `add-screen.md` | Creating a new page in the app |
| `add-component.md` | Extracting reusable UI into `components/` |
| `add-api-call.md` | Wiring up a backend call with loading/error states |
| `debug-platform-issue.md` | Fixing iOS vs Android differences |
| `write-test.md` | Writing Jest tests for business logic |

### Using a Skill

1. Open the skill file
2. Follow the **Steps** section exactly
3. Use the **Template** as your starting point
4. Adapt to your specific use case

---

## 3. Git Discipline

### Branching Strategy

```
main                     ← stable, demo-ready
├── feature/search-form  ← one branch per feature
├── feature/loading-anim
├── fix/android-shadows
└── chore/update-readme
```

- One feature per branch
- Never commit directly to `main`
- Merge via PR (or fast-forward in hackathon mode)

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add search screen with intent selection
fix: android shadow clipping on agent cards
chore: update README with agent descriptions
refactor: extract MetricCard to components/
```

| Prefix | When |
|--------|------|
| `feat:` | New feature or screen |
| `fix:` | Bug fix |
| `chore:` | Documentation, config, dependencies |
| `refactor:` | Code restructuring (no behavior change) |

---

## 4. Screen Development Pattern

Every screen follows the same structure. See `add-screen.md` for the full template.

```tsx
// 1. Imports
import { SafeAreaView, StyleSheet, ... } from 'react-native';
import { useRouter } from 'expo-router';

// 2. Component
export default function ScreenName() {
  const router = useRouter();
  // state, effects, handlers

  return (
    <SafeAreaView style={styles.container}>
      {/* header → content → footer */}
    </SafeAreaView>
  );
}

// 3. Styles (colocated)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },
  // ...
});
```

### Checklist for Every Screen

- [ ] Wrapped in `SafeAreaView` with `#09090F` background
- [ ] Has a back button (unless it's the home screen)
- [ ] Handles loading, error, empty, and success states
- [ ] Touch targets ≥ 44×44pt
- [ ] `accessibilityLabel` on icon-only buttons
- [ ] No `any` types in props

---

## 5. API Integration Pattern

See `add-api-call.md` for the full template. Key rules:

1. **All API calls live in `services/`** — never call `fetch` from a component
2. **Always track `isLoading`, `error`, and `data`** in local state
3. **Wrap in try/catch** — surface errors in the UI, not just console
4. **Use `EXPO_PUBLIC_API_URL`** from environment variables

---

## 6. The Cut List

When time runs out, features are cut in this order (least painful first):

1. Recent Reports List → require fresh analysis every time
2. Animated Progress Bar → replace with spinner + text
3. Expandable Agent Cards → show full text by default
4. Action Buttons (Save/Share) → remove if export APIs are too slow

The cut list is defined in `PLAN.md` and is **non-negotiable** — if a Day 4 feature is at risk, it gets cut before touching Day 3 work.

---

## 7. Definition of Done

A feature is "done" when:

- [ ] Runs cleanly on both iOS and Android
- [ ] No console warnings or errors
- [ ] Handles all states: Loading, Error, Empty, Success
- [ ] Tested on at least one real device size (or realistic simulator)
- [ ] Code follows the skills patterns
- [ ] Committed with a conventional commit message

---

*See [PLAN.md](.agents/specs/PLAN.md) for the 5-day schedule, and [FEATURES.md](FEATURES.md) for the feature tier list.*
