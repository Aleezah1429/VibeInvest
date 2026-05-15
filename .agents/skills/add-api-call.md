---
description: Wire up a new backend call with loading and error states
---

# Skill: Add API Call

**When to use**: Whenever you need to fetch or post data to the backend API.

**Steps**:
1. All API calls should be isolated in the `services/` directory (e.g., `services/api.ts`).
2. Never call `fetch` directly from a component. Create an exported asynchronous function.
3. In the UI component, always use local state to track `isLoading`, `error`, and `data`.
4. Wrap API calls in `try/catch` blocks. If an error occurs, throw it or return a standardized error object.
5. In React Native, ensure error UI is visible (don't rely strictly on console logs).

**Template**:
```typescript
// services/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchStartupData(name: string) {
  try {
    const response = await fetch(`${BASE_URL}/startups/${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('fetchStartupData failed:', error);
    throw error;
  }
}
```

**UI Usage Pattern**:
```tsx
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchStartupData('Bykea');
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }
  loadData();
}, []);
```
