/**
 * Single boundary for SSE consumption. Every other module that wants live
 * events from the backend goes through here.
 *
 * We POST to /api/run/google-adk and read the streaming response with
 * `fetch` + `ReadableStream` — `EventSource` doesn't support POST bodies,
 * which is why we parse SSE manually.
 */
import type { SSEEvent } from "./agent-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface BoardroomRunInput {
  idea_text: string;
  output_language?: "en" | "ur" | "roman-ur";
}

export interface BoardroomStream {
  /** Async iterator over parsed SSE events. */
  events: AsyncGenerator<SSEEvent>;
  /** Manually abort the request (e.g. on component unmount). */
  abort: () => void;
}

/**
 * Open an SSE stream for a boardroom run.
 *
 * Usage:
 *   const stream = openBoardroomStream({ idea_text: "..." });
 *   for await (const event of stream.events) {
 *     dispatch(event);
 *   }
 */
export function openBoardroomStream(input: BoardroomRunInput): BoardroomStream {
  const controller = new AbortController();

  async function* events(): AsyncGenerator<SSEEvent> {
    const response = await fetch(`${API_URL}/api/run/google-adk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea_text: input.idea_text,
        output_language: input.output_language ?? "en",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Boardroom request failed: ${response.status}`);
    }
    if (!response.body) {
      throw new Error("Boardroom response has no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by "\n\n"
      let sep = buffer.indexOf("\n\n");
      while (sep !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        let dataLine = "";
        for (const line of raw.split("\n")) {
          if (line.startsWith(":")) continue;
          if (line.startsWith("data:")) dataLine = line.slice(5).trim();
        }

        if (dataLine) {
          try {
            yield JSON.parse(dataLine) as SSEEvent;
          } catch {
            // ignore malformed payloads
          }
        }

        sep = buffer.indexOf("\n\n");
      }
    }
  }

  return {
    events: events(),
    abort: () => controller.abort(),
  };
}
