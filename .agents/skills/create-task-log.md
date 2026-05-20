---
name: create-task-log
description: "Use this skill to log any completed Antigravity task. Triggers: 'log this task', 'add to logs', 'save to logs', or after any task completion. Creates log-<id>-<task-name>.md in .agents/traces/logs/"
---

# Create Task Log

## What to do

1. **Create the folder** if it doesn't exist:
   ```bash
   mkdir -p .agents/traces/logs
   ```

2. **Get the next ID** by finding the highest existing log ID (do **not** count files — a gap or duplicate throws the count off):
   ```bash
   ls .agents/traces/logs/ 2>/dev/null | grep -oE '^log-[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1
   ```
   Add 1 → zero-pad to 3 digits → e.g. `001`, `002`, `003`. If no logs exist yet, start at `001`.

3. **Create the file** as `log-<id>-<kebab-case-task-name>.md`

---

## Log File Template

```markdown
---
log_id: <001>
title: <Full Task Title>
date: <YYYY-MM-DD>
status: completed | partial | failed
---

# <Title>

## What was done
<1-2 sentences>

## Reasoning
<Why this approach was taken>

## Tool Calls
- READ `<file>`
- WRITE `<file>`
- RUN `<command>`

## Files Changed
| File | Action |
|------|--------|
| `<path>` | created / modified / deleted |

## Errors & Recovery
<Any errors and how they were fixed, or "None">

## Outcome
<What works now + any next steps>
```

---

## How to trigger in any new chat

Paste this at the start of every new Antigravity chat:

```
Read .agents/skills/create-task-log.md before we start.
Read .agents/traces/logs/ to understand past work.
When I say "log this task", use that skill to create a new log entry.
```

Then after finishing any task just say:
```
Log this task: <brief description>
```