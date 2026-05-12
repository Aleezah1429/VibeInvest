# Plan — Upload Hub

## Goal
A bento-box-style input screen that lets the founder submit their idea. Four input modes are visible in the UI — **Text, PDF, Audio, Vision** — but only **Text** is wired for Phase 0. The other three render as enabled-looking tiles with a "Live in Week 1" badge so the pitch can show the multimodal vision without lying about what works today.

**Phase:** 0 (Text mode); Phase 0.5 (PDF, Audio, Vision modes wire up).

## User stories
- As a founder, I land on `/upload` and see a big textarea ready for me to paste my idea.
- As a founder, I can see that PDF, Audio, and Vision input are coming — I trust the platform is real, not vaporware.
- As a founder, I can pick from three pre-curated demo ideas if I just want to see what it does.
- As a founder, I click **Run Boardroom** and get pushed into the live agent stream.
- As a demo presenter, I can show off the Upload Hub UI as part of the 3-minute pitch even though only Text works.

## Architecture sketch

```
app/
  upload/
    page.tsx                      Upload Hub (this feature)

components/
  upload/
    UploadBento.tsx               2×2 bento grid (Text / PDF / Audio / Vision tiles)
    TextInputCard.tsx             Active tile — textarea + char counter + submit
    StubInputCard.tsx             Disabled tile with "Live in Week 1" badge
    DemoIdeaPicker.tsx            Horizontal row of 3 pre-curated demo ideas
    AnalyzingState.tsx            Spinner + "Analyzing 'X'..." message after submit

lib/
  demo-ideas.ts                   The 3 curated demo ideas (text + expected verdict for sanity)
  upload-client.ts                Posts to /api/run/google-adk, returns a run-id, redirects to /run/[id]
```

## Submission flow

1. User types or pastes idea (or picks a demo).
2. Click **Run Boardroom** → POST to `/api/run/google-adk` with `{ idea_text, output_language: "en" }`.
3. Backend assigns a `run_id`, opens an SSE stream, returns the `run_id` in the initial response (or as the first SSE event).
4. Frontend navigates to `/run/[id]` — the live boardroom view (`squad-report` feature) takes over.

## Decisions
- **Text-only wiring for Phase 0.** PDF, Audio, Vision tiles render but are disabled with a clear "Live in Week 1" pill. No "coming soon" alert dialogs — the badge is enough.
- **Demo idea picker is mandatory.** The hackathon demo runs against pre-curated ideas. The picker lives next to the textarea so the presenter can one-tap it on stage.
- **No language toggle in MVP.** English-only output for the 2-day sprint. Phase 0.5 adds a toggle.
- **No file upload in MVP.** Even the stubbed tiles do not open a file picker — they're visual placeholders only.

## Out of scope (Phase 0)
- PDF parsing / OCR (Phase 0.5)
- Audio transcription (Phase 0.5)
- Image-of-handwritten-plan OCR (Phase 0.5)
- Language detection and language toggle (Phase 0.5)
- Drafts / autosave of typed input
- Idea history sidebar
