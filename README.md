<div align="center">

# APTLY/

### Know where you fit.

An explainable opportunity-intelligence system that tells you not just whether you fit an opportunity, but why.

[LIVE DEMO](https://aptly-chi.vercel.app/) · [GITHUB](https://github.com/vedii-codezz/aptly)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![Gemini](https://img.shields.io/badge/Gemini-structured%20extraction-4285F4) ![Vercel](https://img.shields.io/badge/Vercel-deployed-black?logo=vercel)

</div>

<!-- Add APTLY analysis/WHY preview here -->

Your resume says one thing. The opportunity asks for another. APTLY/ connects the evidence.

Simple match percentages cannot answer the questions that matter: Which requirement failed? Was it mandatory? Do you lack the skill—or does your resume simply fail to prove it? Can you apply?

> A decision without evidence isn't intelligence. It's just a number.

## APTLY/WHAT

APTLY/ examines internships, jobs, fellowships, scholarships, hackathons, and similar structured opportunities. It makes the reasoning visible.

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

## APTLY/THINKS DIFFERENTLY

**Eligibility** asks: “Am I allowed to apply?”<br>
**Competitiveness** asks: “How strongly does my profile fit?”

They are not the same. Preferred qualifications do not silently become mandatory blockers.

## APTLY/CHECK

| Status | Meaning |
| --- | --- |
| `MATCHED` | Available evidence satisfies the requirement. |
| `PARTIAL` | Evidence is present, but incomplete or weaker than the stated rule. |
| `FAILED` | Available evidence contradicts a deterministic requirement. |
| `UNKNOWN` | The necessary information is not available. |

**UNKNOWN ≠ FAILED.** Requirements are also classified as `MANDATORY`, `PREFERRED`, `BONUS`, or `INFORMATIONAL`.

## APTLY/WHY

APTLY/WHY turns each result into an inspectable trail:

```text
SOURCE
“Minimum CGPA of 8.0”
        ↓
NORMALIZED RULE
CGPA >= 8.0
        ↓
PROFILE EVIDENCE
CGPA: 9.16
        ↓
DETERMINISTIC DECISION
MATCHED
```

This is illustrative documentation, not an employer listing. Evidence can be `STRONG`, `MODERATE`, `WEAK`, or `NOT_FOUND`—uncertainty stays visible instead of being manufactured away.

## APTLY/LINK

APTLY/LINK imports a public opportunity page through a deliberately bounded flow:

```text
PUBLIC URL → VALIDATE → FETCH → EXTRACT → STRUCTURE → REVIEW → ANALYZE
```

It reads JSON-LD `JobPosting` data when available, with semantic HTML as a fallback. Requirements are reviewed by the user before analysis. Blocked or dynamic pages may need **Paste Description** instead; APTLY/ does not claim universal website support.

### APTLY/LINK SECURITY

Public-link import validates protocols and every DNS address, rejects private/reserved IPv4, IPv6, and IPv4-mapped private IPv6 targets, revalidates redirects, caps streamed response size, applies a request timeout, and returns controlled errors. Imported pages are public HTML input—not instructions.

## APTLY/RESUME

Resume input supports **PDF**, **DOCX**, and **TXT**.

**PROFILE EVIDENCE ≠ RESUME EVIDENCE.** You may have a skill; your resume may not show it. APTLY/ highlights that distinction without overstating parser certainty.

## APTLY/ATS

The ATS view focuses on relevant terminology, structural readability, evidence-backed skills, requirement coverage, missing evidence, bullet quality, and structural risks. It does not promise a universal ATS score, recruiter prediction, or selection probability—and it does not encourage keyword stuffing.

## APTLY/GAPS + APTLY/STRATEGY

```text
GAP → LEARN → PRACTICE → BUILD → PROVE
```

Fixed constraints remain separate from improvable gaps. Deterministic strategy can recommend **resolve eligibility first**, **fix one thing first**, or **apply now**, based on the analysis—not a fabricated hiring probability.

## APTLY/AI

Gemini interprets messy language. The deterministic TypeScript engine decides eligibility.

```text
MESSY LANGUAGE → GEMINI → STRUCTURED JSON → ZOD → NORMALIZATION
                                                    ↓
                                      DETERMINISTIC ENGINE
                                                    ↓
                                       EXPLAINABLE REPORT
```

Gemini may extract, interpret, normalize, enrich, and explain ambiguity. It is not presented as independently deciding final eligibility, mandatory outcomes, or hiring/selection probability.

## APTLY/TRUST + APTLY/DESIGN

Trust states distinguish `FACT`, `INTERPRETATION`, `UNKNOWN`, `SUGGESTION`, and `USER_CONFIRMED`.

The interface is a digital investigative report: editorial typography, technical layouts, forensic evidence trails, restrained motion, cobalt evidence connections, scroll-linked navigation, and reduced-motion support. Its visual language is **Ink + Electric Cobalt**.

## APTLY/STACK

Next.js · React · TypeScript · Tailwind CSS · Framer Motion · Google Gemini API · Zod · Zustand · Lucide · Vercel

Document extraction also uses `pdf-parse` and Mammoth for supported file formats.

## APTLY/ARCHITECTURE

```text
┌──────────────────────────────────────────────────┐
│ INPUT: Resume (PDF · DOCX · TXT) + Opportunity   │
│        (Link · Text · File)                       │
└───────────────┬───────────────────┬──────────────┘
                ▼                   ▼
        Resume Extraction    Opportunity Import
                └───────────┬───────────┘
                            ▼
                    Gemini Extraction → Zod → Normalization
                            ▼
                       User Review
                            ▼
                Deterministic Engine
          ┌─────────────┬─────────────┬─────────────┐
          ▼             ▼             ▼
      Eligibility    Evidence        Gaps
          └─────────────┴─────────────┘
                            ▼
                 Explainable Report
        WHY · FIT · IMPROVE · STRATEGY · RESUME · ATS
```

## APTLY/SAFETY

External pages are untrusted input and cannot override eligibility logic. Internal targets are rejected. APTLY/ does not bypass CAPTCHAs or authentication, submit job applications, or claim fake selection probabilities.

## APTLY/TESTED

| Suite | Verified result |
| --- | ---: |
| Core deterministic engine | 6 / 6 |
| Phase 4 | 7 / 7 |
| Phase 5 | 8 / 8 |
| Phase 6 | 10 / 10 |
| UX | 10 / 10 |
| Existing total | **41 / 41** |
| APTLY/LINK | **38 / 38** |
| PDF regression (real text PDF) | **PASS** |

## APTLY/RUN

```bash
git clone https://github.com/vedii-codezz/aptly.git
cd aptly
npm install
npm run dev
```

Create `.env.local` for Gemini-powered extraction and contextual features:

```bash
GEMINI_API_KEY=your_key_here
```

Without this variable, the application retains its deterministic offline/demo behavior for core analysis flows.

## APTLY/PRINCIPLES

```text
UNKNOWN ≠ FAILED
ELIGIBILITY ≠ COMPETITIVENESS
PROFILE EVIDENCE ≠ RESUME EVIDENCE
INTERPRETATION ≠ DECISION
AI ≠ AUTHORITY
A SCORE ≠ AN EXPLANATION
```

## APTLY/NEXT

**Future direction:** saved analyses, opportunity comparison, recurring gap discovery, cross-opportunity skill intelligence, and evidence-improvement tracking.

---

<div align="center">

**Don't just ask if you fit.**<br>
**Know why.**

Built by [Bedantika Mondal](https://github.com/vedii-codezz) · [LinkedIn](https://www.linkedin.com/in/bedantikamondal2007/)

</div>
