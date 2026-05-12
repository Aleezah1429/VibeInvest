/**
 * Single boundary for jspdf — generates the 5-page Investor Report PDF
 * from a complete run state. Components import only `generateInvestorReport`.
 */
import jsPDF from "jspdf";

import type {
  FinalReport,
  HypeReport,
  MunshiReport,
  SkepticReport,
} from "./agent-types";
import { VERDICT_THEME } from "./verdict-theme";

export interface InvestorReportInput {
  ideaText: string;
  skeptic: SkepticReport;
  munshi: MunshiReport;
  hype: HypeReport;
  cvo: FinalReport;
}

const MARGIN = 18; // mm
const PAGE_WIDTH = 210; // A4
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function generateInvestorReport(input: InvestorReportInput): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const today = new Date().toISOString().slice(0, 10);

  // ── Page 1: Cover ──
  cover(doc, input, today);

  // ── Page 2: Skeptic ──
  doc.addPage();
  sectionHeader(doc, "The Skeptic — Market Reality");
  renderSkeptic(doc, input.skeptic);
  footer(doc, today);

  // ── Page 3: Munshi ──
  doc.addPage();
  sectionHeader(doc, "The Munshi — Financial Math");
  renderMunshi(doc, input.munshi);
  footer(doc, today);

  // ── Page 4: Hype ──
  doc.addPage();
  sectionHeader(doc, "The Hype — Brand & Pitch");
  renderHype(doc, input.hype);
  footer(doc, today);

  // ── Page 5: CVO ──
  doc.addPage();
  sectionHeader(doc, "The CVO — Final Synthesis");
  renderCVO(doc, input.cvo);
  footer(doc, today);

  // Save
  const slug = input.ideaText.slice(0, 30).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const dateSlug = today.replace(/-/g, "");
  doc.save(`vibeinvest-report-${slug}-${dateSlug}.pdf`);
}

function cover(doc: jsPDF, input: InvestorReportInput, today: string): void {
  const theme = VERDICT_THEME[input.cvo.verdict];

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("VIBEINVEST", MARGIN, MARGIN);

  doc.setFontSize(28);
  doc.setTextColor(20);
  doc.text("Investor Report", MARGIN, MARGIN + 16);

  doc.setFontSize(11);
  doc.setTextColor(80);
  const ideaLines = doc.splitTextToSize(input.ideaText.slice(0, 400), CONTENT_WIDTH);
  doc.text(ideaLines, MARGIN, MARGIN + 30);

  // Score block
  doc.setDrawColor(220);
  doc.line(MARGIN, MARGIN + 120, PAGE_WIDTH - MARGIN, MARGIN + 120);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("AURA SCORE", MARGIN, MARGIN + 130);
  doc.setFontSize(56);
  doc.setTextColor(20);
  doc.text(`${input.cvo.aura_score}`, MARGIN, MARGIN + 150);
  doc.setFontSize(11);
  doc.setTextColor(140);
  doc.text("/ 1000", MARGIN + 50, MARGIN + 150);

  doc.setFontSize(18);
  doc.setTextColor(...hexToRgb(theme.color));
  doc.text(theme.label, MARGIN, MARGIN + 165);

  doc.setFontSize(11);
  doc.setTextColor(60);
  const lineWrap = doc.splitTextToSize(input.cvo.verdict_line, CONTENT_WIDTH);
  doc.text(lineWrap, MARGIN, MARGIN + 178);

  footer(doc, today);
}

function sectionHeader(doc: jsPDF, title: string): void {
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text("VIBEINVEST · INVESTOR REPORT", MARGIN, MARGIN);
  doc.setFontSize(20);
  doc.setTextColor(20);
  doc.text(title, MARGIN, MARGIN + 14);
}

function renderSkeptic(doc: jsPDF, r: SkepticReport): void {
  let y = MARGIN + 28;
  y = labeled(doc, "Market saturation (1–10)", `${r.market_saturation_score}`, y);
  y = labeled(doc, "Differentiation", r.differentiation, y);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Competitors", MARGIN, y);
  y += 6;
  doc.setTextColor(40);
  doc.setFontSize(10);
  for (const c of r.competitors.slice(0, 8)) {
    const line = `• ${c.name} — ${c.summary}`;
    const wrap = doc.splitTextToSize(line, CONTENT_WIDTH);
    doc.text(wrap, MARGIN, y);
    y += wrap.length * 5;
  }
  if (r.competitors.length === 0) {
    doc.text("(No specific competitors identified.)", MARGIN, y);
    y += 6;
  }

  y += 4;
  y = bulletList(doc, "Red flags", r.red_flags, y);
}

function renderMunshi(doc: jsPDF, r: MunshiReport): void {
  let y = MARGIN + 28;
  const ue = r.unit_economics;
  y = labeled(
    doc,
    "Unit economics (PKR)",
    `Revenue/unit ${ue.revenue_per_unit_pkr} · Cost/unit ${ue.cost_per_unit_pkr} · Gross margin ${ue.gross_margin_pct}%`,
    y,
  );
  y = labeled(doc, "Burn rate (PKR/month)", `${r.burn_rate_pkr_per_month}`, y);
  y = labeled(doc, "Realistic Year 1 revenue (PKR)", `${r.realistic_year_1_revenue_pkr}`, y);
  y = labeled(doc, "Break-even (months)", `${r.break_even_months}`, y);
  y += 4;
  y = bulletList(doc, "Financial red flags", r.financial_red_flags, y);
}

function renderHype(doc: jsPDF, r: HypeReport): void {
  let y = MARGIN + 28;
  y = bulletList(doc, "Taglines", [...r.taglines], y);
  y = labeled(doc, "Brand vibe", r.brand_vibe, y);
  y = bulletList(doc, "Pitch deck fixes", [...r.pitch_deck_fixes], y);
  y = labeled(doc, "Soft launch strategy", r.soft_launch_strategy, y);
}

function renderCVO(doc: jsPDF, r: FinalReport): void {
  let y = MARGIN + 28;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Dimensional scores (1–10)", MARGIN, y);
  y += 6;
  doc.setTextColor(40);
  doc.setFontSize(10);
  for (const [name, dim] of Object.entries(r.dimensions)) {
    const line = `• ${capitalize(name)} (${dim.score}/10): ${dim.note}`;
    const wrap = doc.splitTextToSize(line, CONTENT_WIDTH);
    doc.text(wrap, MARGIN, y);
    y += wrap.length * 5;
  }

  y += 4;
  y = bulletList(doc, "Top 3 fixes", [...r.top_fixes], y);
  y = labeled(doc, "Next steps", r.next_steps, y);
}

function labeled(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(label, MARGIN, y);
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(20);
  const wrap = doc.splitTextToSize(value, CONTENT_WIDTH);
  doc.text(wrap, MARGIN, y);
  y += wrap.length * 5 + 4;
  return y;
}

function bulletList(doc: jsPDF, label: string, items: string[], y: number): number {
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(label, MARGIN, y);
  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(40);
  if (items.length === 0) {
    doc.text("(none)", MARGIN, y);
    return y + 6;
  }
  for (const item of items) {
    const wrap = doc.splitTextToSize(`• ${item}`, CONTENT_WIDTH);
    doc.text(wrap, MARGIN, y);
    y += wrap.length * 5;
  }
  return y + 4;
}

function footer(doc: jsPDF, today: string): void {
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Generated by VibeInvest on ${today}`,
    MARGIN,
    PAGE_HEIGHT - MARGIN / 2,
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
