/**
 * Pre-curated demo ideas for the hackathon. Each one has been hand-tuned to
 * land on a satisfying verdict band (one Invest, one Iterate, one Pivot).
 *
 * Lane C confirms the final three by Day 1 EOD — see todo.md.
 */
export interface DemoIdea {
  /** Short label for the chip (≤ 40 chars). */
  label: string;
  /** Full idea text that goes into the textarea. */
  text: string;
  /** Roughly what verdict this should produce. For QA, not shown to users. */
  expectedBand: "invest" | "iterate" | "pivot";
}

export const DEMO_IDEAS: DemoIdea[] = [
  {
    label: "Chai delivery for LUMS",
    text:
      "A campus-only chai delivery service for LUMS, NUST, and IBA. Students subscribe to a daily chai package delivered to their dorm in 10 minutes. Pricing: PKR 200/day all-you-can-drink, PKR 4,000/month unlimited. Suppliers are small dhabas within 2km. Margin comes from bulk procurement and route density.",
    expectedBand: "iterate",
  },
  {
    label: "Urdu literacy AI for schools",
    text:
      "An AI-powered Urdu literacy app for primary school children in Pakistan. Personalised reading practice, voice-based feedback, MoITT-aligned curriculum. Free for government schools, PKR 500/month for private schools. Target: 1M Urdu-medium students across Punjab and Sindh.",
    expectedBand: "invest",
  },
  {
    label: "Donkey-cart Chinese food",
    text:
      "Chinese food delivery in Karachi where the food is delivered by donkey cart instead of motorbikes, to be eco-friendly and culturally unique. Average delivery time 90 minutes. Same price as Foodpanda. Target market: anyone who orders Chinese food in Karachi.",
    expectedBand: "pivot",
  },
];
