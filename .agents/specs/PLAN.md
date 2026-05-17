# 5-Day Execution Plan

## Day 1: Setup + Scaffolding + Data Layer
**Deliverables**:
- Finalize Expo Router structure (Home, Search, Loading, Report screens).
- Scaffold UI components (Buttons, Inputs, Cards).
- Set up SSE streaming utility (`services/api.ts`).
**Dependencies**: Expo, React Native.
**Risks**: React Native does not have a native `EventSource` for SSE. We may need a polyfill (e.g., `react-native-sse`) or manual fetch stream parsing.

## Day 2: Core Feature Implementation (Input & Stream)
**Deliverables**:
- Complete Search Screen form state and validation.
- Implement `POST /api/run/google-adk` integration.
- Connect the SSE stream to the Loading Screen state.
- Handle `agent_start` and `agent_text` events to update UI dynamically.
**Dependencies**: Backend API running locally or deployed.

## Day 3: Core Feature Implementation (Report UI)
**Deliverables**:
- Complete Report Screen UI.
- Parse `pipeline_complete` event payload into the `ReportData` structure.
- Map dynamic data to dimension scores, metrics, and agent cards.
**Dependencies**: Day 2 streaming completion.
**Risks**: Mapping unstructured text from agents into strict UI components. Must ensure the backend returns structured JSON for the final report.

## Day 4: Polish, Edge Cases, Error Handling
**Deliverables**:
- Handle API errors, network drops, and timeouts.
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
