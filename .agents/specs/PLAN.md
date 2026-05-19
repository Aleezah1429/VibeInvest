# 5-Day Execution Plan

## Day 1: Setup + Scaffolding + Data Layer
**Deliverables**:
- Finalize Expo Router structure (Home, Search, Loading, Report screens).
- Scaffold UI components (Buttons, Inputs, Cards).
- **Backend Database Schema**: Implement SQLAlchemy models (`Startup`, `AgentReport`, `Deliverable`) for SQLite/Postgres.
- **SSE Stream Hook**: Set up custom stream client utility `hooks/useAgentStream.ts` utilizing `XMLHttpRequest` for platform-neutral chunk parsing without extra package bloat.
**Dependencies**: Expo, React Native, Python virtual environment.
**Risks**: React Native does not have a native `EventSource` for SSE. We will mitigate this using custom `XMLHttpRequest` chunked stream-reading in our custom hook.

## Day 2: Core Feature Implementation (Sequential Pipeline & SSE Stream)
**Deliverables**:
- Complete Search Screen form state and validation (Intent + Sector + Stage + Context).
- **Sequential Agent Pipeline**: Implement backend runner chain: Skeptic (Market) ➔ Munshi (Financials) ➔ Hype (Brand) ➔ CVO (Synthesis). Pass cumulative reports as context to the next agent.
- **FastAPI SSE Router**: Implement `POST /api/run/google-adk` SSE endpoints using `sse-starlette` to stream real-time events (`agent_start`, `agent_text`, etc.).
- **Hook Integration**: Connect the SSE stream to the Loading Screen state.
- Handle `agent_start` and `agent_text` events to update UI dynamically in real-time.
**Dependencies**: Backend API running locally.

## Day 3: Core Feature Implementation (Report Persistence & Dynamic UI)
**Deliverables**:
- **Persistence Save**: Insert Startup data, 4 agent summaries, and deliverables to the database once the CVO synthesis completes.
- **Report Screen Integration**: Parse `pipeline_complete` event payload into the `ReportData` structure.
- Map dynamic data to dimension scores, metrics, deliverables accordion, and agent cards.
- Replace mock Bykea reports with dynamic data fetched from the local SQLite/Postgres DB or direct streaming output.
**Dependencies**: Day 2 streaming completion.
**Risks**: Mapping unstructured text from agents into strict UI components. Must ensure CVO outputs a strictly formatted JSON structure for final delivery.

## Day 4: Polish, Edge Cases, Error Handling, and Caching
**Deliverables**:
- Handle API errors, network drops, and timeouts.
- **Data Caching**: Implement `AsyncStorage` caching on mobile. If a startup was analyzed in the last 24 hours, serve the saved DB results instantly for sub-second speeds.
- Add Empty States (no recent reports) and loading fallbacks.
- Mobile polish: Keyboard avoidance on Search Screen, safe area paddings.
- Animations: Progress bar interpolation, expanding/collapsing cards.

## Day 5: BUFFER — Bugfixes, Device Testing, Final Polish
**Deliverables**:
- Run on iOS Simulator and Android Emulator.
- Fix UI clipping issues on small devices.
- **Strict Rule**: No new features.

---

## THE CUT LIST (Ordered by what hurts least to lose)
1. **Recent Reports List**: Remove from Search Screen. Require users to run a new analysis every time.
2. **Animated Progress Bar**: Replace with a simple spinner and text updates on the Loading Screen if animations are buggy.
3. **Expandable Agent Cards**: Show the full text by default or a truncated version without the accordion animation.
4. **Action Buttons (Save/Share)**: Remove these if PDF export or native sharing APIs take too long.
