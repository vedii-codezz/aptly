# Phase 7.5 Report Integrity Implementation Plan

**Goal:** Remove contradictory report conclusions and irrelevant advice without changing eligibility authority or input safety.
**Architecture:** Derive mandatory summaries from evaluated statuses. Share document-presence matching between existing resume and ATS engines; keep presence separate from eligibility.
**Tech Stack:** Existing TypeScript, React, Node; no new dependencies.
**Spec:** User's Phase 7.5 requirements in this chat.

## Constraints
No redesign, Phase 8, commits, pushes or deployments. Preserve parsers, SSRF protection, Gemini review, WHY traces and navigation.

## Steps
- [x] Reproduce mandatory UNKNOWN/PARTIAL failures; add `summarizeMandatoryEligibility(requirements)` in `src/lib/eligibility/summary.ts`; use in verdict, gaps and strategy; run targeted regression.
- [x] Reproduce degree disagreement and fabricated graduation snippet; add `matchResumeRequirement(requirement, resume)` with presence, source locations and separate verification; consume in both engines; run resume/ATS suites.
- [x] Add category-aware advice; remove unsupported report-wide claims and demo-specific evidence assumptions; test missing information and location advice.
- [x] Add fail-fast runner using existing TypeScript compiler and Node, parser route regression, npm scripts and Node 22 CI using npm ci, typecheck, lint, tests and build.
- [x] Run complete regression, inspect diff, document exact counts and environment limits.

## Review Focus
Empty mandatory sets must not establish eligibility; FAILED takes precedence over UNKNOWN; PARTIAL must block unconditional apply-now; degree mentions do not prove suitability; snippets must be verbatim source text. Tests cover each case.

Execution is inline as requested, with failing tests before each correctness change and targeted checks after each step.
