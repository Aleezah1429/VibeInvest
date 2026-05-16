# VibeInvest 🚀
### *Your AI Boardroom for Pakistan's Next Generation of Founders*

**Tagline:** *"Get roasted before you get rejected."*

**Submission:** AI Seekho 2026 — Phase 2 Hackathon  
**Built with:** Google Antigravity (Agent Orchestration) + Gemini 2.5 (Multimodal Reasoning)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [The Problem We're Solving](#2-the-problem)
3. [The Solution — Multi-Agent Boardroom](#3-solution)
4. [User Flow](#4-user-flow)
5. [Core Features](#5-features)
6. [Technical Architecture](#6-architecture)
7. [Agent System Design](#7-agents)
8. [10-Day Roadmap & Task Allocation](#8-roadmap)
9. [Demo Script for Judges](#9-demo)
10. [Future Vision](#10-future)

---

## 1. Project Overview

VibeInvest is a multi-agent AI platform that gives founders a "reality check" before they pitch to real investors. Users upload their startup idea (text, voice note in Urdu/English, or even a handwritten plan photo), and our **4-agent AI boardroom** analyzes it across market, financial, branding, and strategic dimensions — returning a final **Aura Score (out of 1000)** with actionable feedback.

**Why this wins AI Seekho 2026:**
- ✅ **Technical depth:** True multi-agent orchestration (not just one Gemini call)
- ✅ **Multimodal:** Voice + image + text input (showcases Gemini's full power)
- ✅ **Pakistan-specific:** Built for Urdu/Roman Urdu, local market context, PKR economy
- ✅ **Business alignment:** Directly supports MoITT's "product economy" vision
- ✅ **Viral potential:** "Aura Score" shareable on socials = built-in growth loop

---

## 2. The Problem

Pakistan has **2M+ freelancers and 100,000+ aspiring founders**, but:

- 🚫 No accessible feedback loop before risking time/money on an idea
- 🚫 Mentorship is gatekept by network — most don't have access to NIC/iAccelerate
- 🚫 Existing tools (ChatGPT, etc.) give generic feedback, not Pakistan-specific reality checks
- 🚫 Founders waste months building things that already exist or have no market

**Real cost:** Pakistan Startup Fund estimates ~70% of early-stage failures come from validatable issues that could be caught in 10 minutes of expert review.

---

## 3. Solution — The Multi-Agent Boardroom

Instead of one AI giving generic advice, VibeInvest deploys **4 specialized agents** that each tackle a different dimension, then a **CVO (Chief Vibe Officer)** synthesizes their reports into a final verdict.

This isn't a chatbot. The agents **actually work** in the background:
- The Skeptic browses the web autonomously for competitors
- The Munshi pulls live market data and runs calculations
- The Hype generates actual pitch deck mockups
- The CVO orchestrates handoffs and produces the verdict

**This is what Antigravity is built for** — agent handoffs, autonomous task execution, multi-step reasoning.

---

## 4. User Flow

### Primary Flow (Founder Journey)

```
[1] ONBOARDING
    User opens app → Picks "Vibe Track":
    • Founder Roast (free, viral)
    • Full Due Diligence (paid/freemium)
    • Investor Mode (B2B)
    ↓
[2] IDEA INPUT (Multimodal — pick any combo)
    • Type the idea
    • Record voice note (Urdu/English/Roman Urdu)
    • Upload handwritten plan (photo)
    • Paste pitch deck PDF
    ↓
[3] AGENT ACTIVATION (Live, animated)
    User watches 4 agents "wake up" in their boardroom UI
    Each agent shows real-time status:
    "🔍 The Skeptic is scanning 47 competitors..."
    "💰 The Munshi is checking unit economics..."
    "✨ The Hype is reimagining your pitch..."
    ↓
[4] AGENT HANDOFFS (The "wow" moment)
    Skeptic finishes → sends notes to Munshi
    Munshi flags concerns → asks Hype to reframe
    All three submit to CVO
    ↓
[5] AURA SCORE REVEAL
    Animated reveal: "Your idea scored 720/1000 ✨"
    Breakdown by dimension (Market 8/10, Money 6/10, etc.)
    ↓
[6] DETAILED REPORT
    • Each agent's full analysis (collapsible cards)
    • Top 3 fixes recommended
    • "What to do next" action plan
    ↓
[7] SHARE / SAVE
    • Share Aura Score card on Instagram/LinkedIn (viral hook)
    • Save report to dashboard
    • "Re-roast" after applying fixes (retention loop)
```

### Secondary Flow (Investor/Uncle Mode)

```
Investor uploads founder's pitch deck
    ↓
Agents translate tech jargon → simple Urdu/English
    ↓
Risk meter: Green / Yellow / Red flags
    ↓
"Questions to ask the founder" generated
    ↓
Downloadable PDF report
```

---

## 5. Core Features

### MVP (Must Build — Phase 1)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| F1 | Multimodal input | Text + voice + image upload | 🔴 Critical |
| F2 | 4-agent orchestration | Skeptic, Munshi, Hype, CVO running via Antigravity | 🔴 Critical |
| F3 | Agent handoff visualization | Live UI showing agents passing notes | 🔴 Critical |
| F4 | Aura Score (out of 1000) | Final verdict with dimensional breakdown | 🔴 Critical |
| F5 | Detailed report view | Each agent's full analysis | 🔴 Critical |
| F6 | Shareable Aura Card | Instagram/LinkedIn export | 🟡 High |
| F7 | Urdu/Roman Urdu support | Input + output in local language | 🟡 High |

### Nice-to-Have (If Time Permits — Phase 1.5)

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| F8 | Pitch deck generator | Hype agent generates actual slides | 🟢 Medium |
| F9 | Investor Mode | B2B flow for angels | 🟢 Medium |
| F10 | "Re-roast" tracker | Track score improvement over time | 🟢 Low |
| F11 | Voice output | Agents speak their verdict | 🟢 Low |

### Future (Post-Hackathon)

- Founder community / leaderboard
- Integration with Pakistan Startup Fund applications
- Real VC matching based on Aura Score
- White-label for NICs and incubators

---

## 6. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND (Mobile App)                  │
│  React Native / Flutter — Boardroom UI w/ animations│
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│             BACKEND (Firebase / Node)               │
│  - User auth                                        │
│  - Report storage (Firestore)                       │
│  - Share card generation                            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│        ANTIGRAVITY AGENT ORCHESTRATION              │
│                                                     │
│   ┌────────────┐    ┌────────────┐                 │
│   │ Skeptic    │───▶│ Munshi     │                 │
│   │ (Research) │    │ (Finance)  │                 │
│   └─────┬──────┘    └─────┬──────┘                 │
│         │                 │                         │
│         └────────┬────────┘                         │
│                  ▼                                  │
│           ┌──────────────┐                          │
│           │ Hype         │                          │
│           │ (Branding)   │                          │
│           └──────┬───────┘                          │
│                  ▼                                  │
│           ┌──────────────┐                          │
│           │ CVO (Final)  │── Aura Score             │
│           └──────────────┘                          │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           GEMINI 2.5 PRO / FLASH                    │
│  - Vision (handwritten plan OCR)                    │
│  - Audio (Urdu voice transcription)                 │
│  - Reasoning (each agent's brain)                   │
└─────────────────────────────────────────────────────┘
```

### Tech Stack Decision

| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Frontend | **Flutter** | Single codebase iOS+Android; fast UI for animations |
| Backend | **Firebase** | Quick setup, free tier, real-time sync for agent updates |
| Agent Layer | **Antigravity** | Required by hackathon; handles orchestration |
| AI Model | **Gemini 2.5 Flash** for speed + **Pro** for CVO final reasoning | Cost/speed balance |
| Vector DB | **Firestore** with embeddings | Simple, no extra service |
| Hosting | **Firebase Hosting + Cloud Functions** | Free tier sufficient for demo |

---

## 7. Agent System Design

### 🔍 Agent 1: The Skeptic (Market Researcher)

**System Prompt (sketch):**
> You are The Skeptic, a brutally honest market researcher for Pakistani startups. Your job is to find out if the user's idea already exists, who the competitors are, and whether the market is saturated. Search the web autonomously. Speak in Gen Z Urdu-English mix. Don't sugarcoat.

**Inputs:** Idea description, target market  
**Outputs:** 
- Competitor list (3-10)
- Market saturation score (1-10)
- Differentiation analysis
- Red flags

**Tools Used:** Web search, Gemini reasoning

---

### 💰 Agent 2: The Munshi (Financial Analyst)

**System Prompt (sketch):**
> You are The Munshi — Pakistan's sharpest financial analyst. You eat balance sheets for breakfast. Analyze unit economics, burn rate, valuation realism, revenue projections. Use PKR. Reference local market rates (Karachi salaries, Lahore rent, dollar rate). Roast bad math without mercy.

**Inputs:** Revenue model, costs, team size, market size  
**Outputs:**
- Unit economics analysis
- Realistic revenue projection
- Break-even timeline
- Financial red flags

**Tools Used:** Calculator, web search for market rates

---

### ✨ Agent 3: The Hype (Branding & Pitch)

**System Prompt (sketch):**
> You are The Hype. You take boring business ideas and make them sound iconic. You know Gen Z aesthetics, current design trends, and what makes founders look credible. Suggest taglines, brand directions, pitch deck improvements. Energy: main character.

**Inputs:** Idea, current branding (if any), target audience  
**Outputs:**
- 3 tagline options
- Brand vibe direction
- Pitch deck improvement suggestions
- Soft-launch strategy

**Tools Used:** Image generation (optional), Gemini reasoning

---

### 👑 Agent 4: The CVO (Chief Vibe Officer)

**System Prompt (sketch):**
> You are the CVO — calm, strategic, authoritative. You receive reports from Skeptic, Munshi, and Hype. Synthesize them. Identify contradictions. Produce a final Aura Score out of 1000 with a clear verdict: Invest / Iterate / Pivot / Pass. Use Gen Z slang sparingly for personality.

**Inputs:** All three agent reports  
**Outputs:**
- Aura Score (0-1000)
- Verdict (one of 4 categories)
- Top 3 priority fixes
- Next steps action plan

**Tools Used:** Aggregation logic, Gemini 2.5 Pro for deep reasoning

---

## 8. 10-Day Roadmap & Team Task Allocation

### Assumptions
- **Team size:** 4 people (adjust if different)
- **Time:** 10 working days
- **Roles:** Frontend Lead, Backend Lead, AI/Agent Lead, Design + Demo Lead

### Day-by-Day Breakdown

#### **Days 1-2: Foundation & Setup**

| Person | Tasks |
|--------|-------|
| **Frontend Lead** | Set up Flutter project, design boardroom UI mockups, build onboarding screens |
| **Backend Lead** | Firebase setup, auth flow, Firestore schema for reports |
| **AI/Agent Lead** | Set up Antigravity environment, get Gemini API working, write Skeptic agent prompt |
| **Design/Demo Lead** | Brand kit (logo, colors, typography), Aura Score card design, agent character illustrations |

**Deliverable:** Working "Hello World" with all services connected.

---

#### **Days 3-4: Build Core Agents**

| Person | Tasks |
|--------|-------|
| **Frontend Lead** | Input screen (text + voice + image upload), build agent activation animation |
| **Backend Lead** | API endpoints for idea submission, file upload handling, report storage |
| **AI/Agent Lead** | Build Skeptic + Munshi agents in Antigravity, test handoffs |
| **Design/Demo Lead** | UI animations for agent "thinking" states, sound effects (optional) |

**Deliverable:** User can submit idea, Skeptic + Munshi return analysis.

---

#### **Days 5-6: Hype Agent + CVO Orchestration**

| Person | Tasks |
|--------|-------|
| **Frontend Lead** | Report view screen, collapsible agent cards, Aura Score reveal animation |
| **Backend Lead** | Aggregation logic, share card generation (PNG export) |
| **AI/Agent Lead** | Build Hype + CVO agents, full orchestration chain working end-to-end |
| **Design/Demo Lead** | Polish all screens, create shareable Aura Card template |

**Deliverable:** Full 4-agent flow works on at least 3 test cases.

---

#### **Days 7-8: Multimodal + Polish**

| Person | Tasks |
|--------|-------|
| **Frontend Lead** | Voice recording UI, image upload with preview, error states |
| **Backend Lead** | Voice transcription pipeline (Gemini audio), Urdu support |
| **AI/Agent Lead** | Add Urdu/Roman Urdu support to all agents, handle edge cases |
| **Design/Demo Lead** | Test on 10+ real Pakistani startup ideas, refine agent personalities |

**Deliverable:** Multimodal input works flawlessly; agents respond in user's language.

---

#### **Days 9-10: Demo Prep + Buffer**

| Person | Tasks |
|--------|-------|
| **Frontend Lead** | Bug fixes, performance optimization, demo build |
| **Backend Lead** | Stress test, fallback handling, deploy production |
| **AI/Agent Lead** | Pre-load demo cases for fast presentation, fine-tune prompts |
| **Design/Demo Lead** | Record demo video, prepare pitch deck, rehearse 3-min pitch |

**Deliverable:** Submission-ready app + killer demo.

---

### Daily Standup Template (15 min, every morning)

1. What did I ship yesterday?
2. What am I shipping today?
3. What's blocking me?
4. Any agent giving weird outputs we need to debug?

---

## 9. Demo Script for Judges (3 minutes)

### Opening Hook (20 sec)
> "70% of Pakistani founders fail because of issues that could be caught in 10 minutes of expert feedback. But mentorship is gatekept. So we built a 4-agent AI boardroom that anyone with a phone can access. Meet VibeInvest."

### Live Demo (2 min)

**Step 1 (15 sec):** Pick a real local idea — "Chai delivery startup for university campuses in Lahore."

**Step 2 (10 sec):** Record voice note in Urdu describing the idea.

**Step 3 (45 sec):** Show agents activating live:
- Skeptic finds 3 existing chai startups in Pakistan
- Munshi calculates unit economics at PKR 50/cup
- Hype suggests "Campus Chai Co." rebrand
- Show **agent handoff** animation prominently

**Step 4 (30 sec):** Aura Score reveals: **640/1000 — "Iterate"**  
Show top 3 fixes: pivot to subscription, target one campus first, premium pricing.

**Step 5 (15 sec):** Share Aura Card to "Instagram" (mock).

### Closing (40 sec)
> "VibeInvest scales mentorship to 100,000+ founders. Built on Antigravity's agent orchestration and Gemini's multimodal reasoning. Already supports Urdu. Roadmap includes integration with Pakistan Startup Fund and NICs. We're not building another chatbot — we're building Pakistan's product economy infrastructure, one Aura Score at a time."

---

## 10. Future Vision (Beyond Hackathon)

### 3-Month Roadmap
- Public launch with **Founder Roast** mode (viral growth)
- 1,000 startup ideas analyzed
- Partnerships with 2-3 universities (LUMS, NUST, IBA)

### 6-Month Roadmap
- B2B Investor Mode launch (paid SaaS)
- Integration with **Pakistan Startup Fund** application portal
- Add 4 more specialized agents (Legal, Tech, HR, Operations)

### 12-Month Vision
- White-label for incubators (NIC Karachi, iAccelerate Lahore)
- Regional expansion: Bangladesh, MEA markets
- Revenue model: Freemium (free Aura Score, paid deep analysis)

---

## 📌 Quick Decision Log

| Question | Decision | Why |
|----------|----------|-----|
| Mobile or web? | **Mobile-first (Flutter)** | Phase 2 requires mobile app |
| Which Gemini? | **Flash for agents, Pro for CVO** | Cost + speed balance |
| Urdu support? | **Yes, from Day 1** | Federal Minister is judge; cultural win |
| Free or paid? | **Freemium** | Free roast for virality, paid for serious founders |
| Agent count? | **4 (not 6+)** | Demo clarity > feature creep |

---

## ✅ First Action Items (Tomorrow Morning)

1. **All team:** Read this doc, drop comments/objections in WhatsApp by EOD
2. **AI Lead:** Get Antigravity access, run first "Hello World" with a single agent
3. **Frontend Lead:** Set up Flutter project, push to GitHub
4. **Backend Lead:** Set up Firebase project, share access with team
5. **Design Lead:** Logo + brand colors finalized, share in Figma

---

**Built with vibes by Team VibeInvest 💜**  
*AI Seekho 2026 — Phase 2 Hackathon Submission*
