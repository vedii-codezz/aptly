# APTLY/ — AI Opportunity Intelligence Platform

> **Tagline:** *Know where you fit.*

APTLY is a deterministic + Gemini-powered opportunity intelligence platform for students. It evaluates eligibility, breaks down requirement evidence, prioritizes skill gaps, plans application strategies, checks resume proof, and performs ATS screening audits.

---

## 🚀 Quickstart & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment template:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note on Offline Mode:** If no `GEMINI_API_KEY` is provided, APTLY automatically runs in **Deterministic Demo / Offline Mode**. All core functionality—including eligibility checks, WHY evidence traces, IMPROVE roadmaps, STRATEGY positioning, RESUME coverage, and ATS readability audits—remains 100% functional without an active Gemini connection.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3000/workspace](http://localhost:3000/workspace) to access the APTLY/OS desktop interface.

---

## 🛠️ Automated Test Suites

Run deterministic test suites covering all phases:

```bash
# Phase 1–3: Core Deterministic Engine & Evidence Traces
npx tsx src/lib/test-scenarios.ts

# Phase 4: Actionable Gap Roadmaps & Application Strategy
npx tsx src/lib/test-phase4-scenarios.ts

# Phase 5: Resume Intelligence, Disconnect Detection & ATS Screening
npx tsx src/lib/test-phase5-scenarios.ts

# Phase 6: Live Gemini Integration, Zod Extraction & Ask APTLY
npx tsx src/lib/test-phase6-scenarios.ts
```

---

## 🏗️ Architecture Principles

- **Engine Authority**: Hard eligibility decisions (`CAN_APPLY`, `POSSIBLY_ELIGIBLE`, `NOT_CURRENTLY_ELIGIBLE`), requirement importance, gap priorities, and strategy decisions (`APPLY_NOW` vs `IMPROVE_FIRST`) are deterministically calculated in TypeScript.
- **Strict Evidence Bounds**: Gemini is used exclusively for language understanding (structured extraction, natural-language explanations, contextual Q&A, and truthful sample generation). It never alters deterministic engine verdicts.
- **Anti-Keyword-Stuffing**: Screening advice routes missing skills to genuine project roadmaps in `APTLY/IMPROVE` rather than advising artificial keyword insertion.
- **Zero Fabricated Metrics**: Sample rewrites never generate invented percentages, metrics, or employers.
