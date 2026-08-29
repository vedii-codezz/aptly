<div align="center"><img src="./public/readme/aptly-hero.svg" alt="APTLY — Explainable Opportunity Intelligence" width="100%" /><br><br>

### An explainable opportunity-intelligence system.
**Not just whether you fit. Why.**

[ LIVE EXPERIENCE ](https://aptly-chi.vercel.app/) &nbsp;&nbsp;&nbsp; [ SOURCE ](https://github.com/vedii-codezz/aptly)

![Next.js](https://img.shields.io/badge/Next.js-14-111318?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-111318?style=flat-square) ![Gemini](https://img.shields.io/badge/Gemini-111318?style=flat-square) ![Vercel](https://img.shields.io/badge/Vercel-111318?style=flat-square)
</div>

<br>

# YOUR RESUME SAYS ONE THING.
# THE OPPORTUNITY ASKS FOR ANOTHER.

### APTLY/ connects the evidence.

It compares a candidate’s profile and resume against structured opportunity requirements, then exposes the reasoning behind eligibility, fit, gaps, strategy, resume evidence, and ATS risks.

> A decision without evidence isn't intelligence.<br>
> It's just a number.

## 01 / THE SYSTEM

### APTLY/WHAT

```text
OPPORTUNITY → REQUIREMENTS → NORMALIZED RULES
                              ↓
PROFILE EVIDENCE ───── RESUME EVIDENCE
         \                 /
          ↓               ↓
       DETERMINISTIC DECISION
                   ↓
    GAPS · IMPROVEMENT · STRATEGY
```

| ELIGIBILITY | COMPETITIVENESS |
| --- | --- |
| **Can I apply?** | **How strongly do I fit?** |
| Hard constraints | Evidence quality |
| Mandatory requirements | Preferred qualifications |
| Deterministic blockers | Strength indicators |

**Eligible ≠ Competitive.**<br>
**Competitive ≠ Eligible.**

### APTLY/CHECK

| | |
|---|---|
| **MATCHED** | Evidence satisfies the requirement |
| **PARTIAL** | Evidence exists, but is incomplete |
| **FAILED** | Evidence fails a deterministic rule |
| **UNKNOWN** | Evidence is insufficient |

> **UNKNOWN ≠ FAILED**

Requirements are `MANDATORY`, `PREFERRED`, `BONUS`, or `INFORMATIONAL`.

## 02 / APTLY/WHY

<p align="center"><img src="./public/readme/evidence-flow.svg" alt="APTLY evidence reasoning flow" width="100%" /></p>

**Source. Rule. Evidence. Decision.** Every result can be traced backward. Evidence strength stays explicit: `STRONG` · `MODERATE` · `WEAK` · `NOT_FOUND`.

## 03 / INPUT

| APTLY/LINK | APTLY/RESUME |
|---|---|
| Public opportunity URL | PDF · DOCX · TXT |
| JSON-LD first | Candidate evidence extraction |
| Semantic fallback | Profile/resume comparison |
| Review before analysis | Missing-evidence detection |

```text
        OPPORTUNITY                    CANDIDATE
             │                            │
             └────────────┬───────────────┘
                          ↓
                     APTLY/CHECK
```

APTLY/LINK follows `VALIDATE → FETCH → EXTRACT → STRUCTURE → REVIEW → ANALYZE`. Dynamic or blocked pages may require **Paste Description**; universal website support is not claimed.

<details><summary><strong>APTLY/LINK — security model</strong></summary><br>

Protocol and all-address DNS validation; private/reserved IPv4, IPv6, and IPv4-mapped private IPv6 rejection; redirect revalidation; streamed response limits; timeout; public HTML focus; and untrusted-content handling. External text cannot override eligibility logic.
</details>

## 04 / INTELLIGENCE

APTLY separates fixed constraints from improvable gaps.

```text
GAP → LEARN → PRACTICE → BUILD → PROVE
```

Strategy may recommend **resolve eligibility first**, **fix one thing first**, or **apply now**—from analysis, not a fabricated hiring probability. ATS guidance examines terminology, structure, evidence-backed skills, coverage, bullet quality, and structural risks; it does not predict recruiter outcomes or promote keyword stuffing.

## 05 / ARCHITECTURE

```text
UNSTRUCTURED INPUT → GEMINI → STRUCTURED JSON → ZOD → NORMALIZATION
                                                        ↓
                                         DETERMINISTIC CORE
                                                        ↓
                                      EVIDENCE + DECISION
                                                        ↓
                                           EXPLAINABLE REPORT
```

Gemini interprets messy language. The deterministic TypeScript engine decides eligibility. AI may extract, normalize, and explain ambiguity; it is not an authority for final eligibility, mandatory outcomes, or selection probability.

## 06 / ENGINEERING

**INTERFACE** — Next.js · React · TypeScript · Tailwind CSS · Framer Motion<br>
**INTELLIGENCE** — Google Gemini API · Zod · deterministic TypeScript engine<br>
**STATE** — Zustand<br>
**DOCUMENTS** — pdf-parse · Mammoth<br>
**DEPLOYMENT** — Vercel

| SYSTEM | RESULT |
|---|---:|
| Core | 6 / 6 |
| Phase 4 | 7 / 7 |
| Phase 5 | 8 / 8 |
| Phase 6 | 10 / 10 |
| UX | 10 / 10 |
| **Existing baseline** | **41 / 41** |
| **APTLY/LINK** | **38 / 38** |
| Real PDF regression | **PASS** |

## 07 / RUN IT

```bash
git clone https://github.com/vedii-codezz/aptly.git
cd aptly
npm install
```

Create `.env.local`:

```bash
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `GEMINI_API_KEY`, deterministic offline/demo analysis remains available.

## 08 / PRINCIPLES

```text
UNKNOWN           ≠ FAILED
ELIGIBILITY       ≠ COMPETITIVENESS
PROFILE EVIDENCE  ≠ RESUME EVIDENCE
INTERPRETATION    ≠ DECISION
AI                ≠ AUTHORITY
SCORE             ≠ EXPLANATION
```

## 09 / NEXT

```text
ANALYZE → SAVE → ANALYZE ANOTHER → COMPARE
```

Future direction: saved analyses, comparison, recurring gap discovery, cross-opportunity skill intelligence, and evidence-improvement tracking.

<br><div align="center">

### Your resume already contains evidence.
### APTLY/ makes it visible.

[**OPEN APTLY/**](https://aptly-chi.vercel.app/)

<br>

**APTLY/**<br>
Don't just ask if you fit. **Know why.**

Built by **Bedantika Mondal** · [GitHub](https://github.com/vedii-codezz) · [LinkedIn](https://www.linkedin.com/in/bedantikamondal2007/)
</div>
