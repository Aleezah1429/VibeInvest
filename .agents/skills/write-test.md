---
description: The project's testing pattern for logic and components
---

# Skill: Write Test

**When to use**: Writing tests for core business logic, utility functions, or critical data-parsing scripts. 

**Steps**:
1. Create the test file adjacent to the file being tested (e.g., `parser.test.ts` next to `parser.ts`).
2. Use standard Jest `describe` and `it` syntax.
3. Given the 5-day deadline, focus ONLY on the Happy Path and the most destructive Edge Cases. Do not test styles or standard React Native components unless they implement custom complex logic.
4. Mock network requests using `jest.fn()` rather than making real HTTP calls.

**Template**:
```typescript
// parser.test.ts
import { parseAgentStream } from './parser';

describe('parseAgentStream', () => {
  it('correctly extracts the final Aura score from a complete payload', () => {
    const mockPayload = { status: 'complete', score: 810, verdict: 'INVEST' };
    const result = parseAgentStream(mockPayload);
    
    expect(result.score).toBe(810);
    expect(result.isInvestable).toBe(true);
  });

  it('handles malformed payloads without crashing', () => {
    const result = parseAgentStream(null);
    expect(result).toBeNull();
  });
});
```
