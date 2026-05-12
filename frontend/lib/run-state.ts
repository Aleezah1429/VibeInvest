/**
 * Pure reducer for boardroom run state. Easy to test, easy to debug during
 * a live demo. The /run/[id] page wires it into useReducer.
 */
import type {
  AgentName,
  AgentReport,
  FinalReport,
  SSEEvent,
} from "./agent-types";
import { AGENT_ORDER } from "./agent-types";

export type AgentStatus = "idle" | "working" | "complete" | "error";

export interface AgentState {
  status: AgentStatus;
  streamedText: string;
  report: AgentReport | null;
  error: string | null;
}

export interface RunState {
  runId: string | null;
  ideaText: string;
  agents: Record<AgentName, AgentState>;
  finalReport: FinalReport | null;
  pipelineError: string | null;
  /** Track last handoff target for the handoff animation; cleared after render. */
  lastHandoffTo: AgentName | null;
}

function initialAgent(): AgentState {
  return { status: "idle", streamedText: "", report: null, error: null };
}

export const INITIAL_RUN_STATE: RunState = {
  runId: null,
  ideaText: "",
  agents: {
    skeptic: initialAgent(),
    munshi: initialAgent(),
    hype: initialAgent(),
    cvo: initialAgent(),
  },
  finalReport: null,
  pipelineError: null,
  lastHandoffTo: null,
};

export function applyEvent(state: RunState, event: SSEEvent): RunState {
  switch (event.type) {
    case "pipeline_start":
      return {
        ...state,
        runId: event.run_id,
        ideaText: event.idea_text,
        pipelineError: null,
      };

    case "agent_start":
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agent]: {
            ...state.agents[event.agent],
            status: "working" as AgentStatus,
            error: null,
          },
        },
      };

    case "agent_text":
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agent]: {
            ...state.agents[event.agent],
            streamedText: state.agents[event.agent].streamedText + event.delta,
          },
        },
      };

    case "agent_complete":
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agent]: {
            ...state.agents[event.agent],
            status: "complete" as AgentStatus,
            report: event.report,
          },
        },
      };

    case "agent_handoff":
      return { ...state, lastHandoffTo: event.to };

    case "pipeline_complete":
      return {
        ...state,
        finalReport: event.final_report,
        agents: {
          ...state.agents,
          cvo: {
            ...state.agents.cvo,
            status: "complete" as AgentStatus,
            report: event.final_report,
          },
        },
      };

    case "pipeline_error": {
      const target: AgentName | null = event.agent ?? null;
      const agents = target
        ? {
            ...state.agents,
            [target]: {
              ...state.agents[target],
              status: "error" as AgentStatus,
              error: event.error,
            },
          }
        : state.agents;
      return {
        ...state,
        pipelineError: event.error,
        agents,
      };
    }

    // tool_call / tool_result: not stored in state (logged at the page level)
    default:
      return state;
  }
}

/** Convenience selector: have all four agents reached a terminal state? */
export function isRunComplete(state: RunState): boolean {
  return AGENT_ORDER.every((name) => {
    const status = state.agents[name].status;
    return status === "complete" || status === "error";
  });
}
