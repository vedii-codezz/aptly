# Phase 7.5 — Report Integrity & Reliability

Verified locally on 5 November 2026. No commit, push or deployment performed. No dependencies added or changed.

## Root causes and fixes

1. **Mandatory UNKNOWN contradiction:** Gaps inferred eligibility from an empty FAILED gap list. Verdict and Strategy ignored mandatory PARTIAL states. A next-action explanation unconditionally claimed eligibility. `summarizeMandatoryEligibility` now derives a common conclusion from evaluated statuses, with FAILED precedence, explicit UNKNOWN/PARTIAL uncertainty and no positive conclusion for an empty mandatory set. The eligibility engine remains the authority for requirement decisions. Mandatory PARTIAL items are retained as unresolved application gaps and receive verification plans.
2. **Resume/ATS disagreement:** Resume Fit lacked degree matching, used a hardcoded 2029 graduation snippet, and independently scanned a fixed skill vocabulary. ATS used different broad patterns. Both now consume `matchResumeRequirement`: requirement ID/category, document presence, separate qualification support, confidence of presence, section location and verbatim source text. Normalized skills are supported, including escaped punctuation such as C++ and C#. Presence does not establish eligibility. Location/GPA/graduation mentions remain unverified qualification evidence.
3. **Irrelevant recommendations:** Generic project-bullet advice was applied to education, GPA and location. `requirementAction` supplies category-specific advice and asks for missing information for UNKNOWN items. Resume verification has its own decision state rather than being classified as a need to build projects.
4. **Other contradictory report claims:** Demo-specific strengths, weaknesses, strategy positioning, preparation topics and timeline tasks appeared independently of current requirements. These now derive from evaluated requirements/evidence. WHY no longer labels an interpretation as a fully deterministic decision. Empty disconnect lists no longer imply that every qualification is communicated.
5. **Unreliable test exits:** Existing `console.assert` calls did not fail their processes, and UX tests could log failures but return successfully. The dependency-free runner turns assertions into failures, runs suites in separate processes, rejects unknown suite names, enforces timeouts and propagates nonzero exits. UX failures now throw.

## Files changed

| Area | Files |
|---|---|
| Mandatory summary and advice | `src/lib/eligibility/summary.ts`, `src/lib/eligibility/recommendations.ts`, `src/lib/eligibility/engine.ts` |
| Shared document matcher | `src/lib/resume/requirementMatcher.ts`, `src/lib/resume/engine.ts`, `src/lib/ats/engine.ts` |
| Strategy and improvement data | `src/lib/improvement/engine.ts` |
| Report wiring and wording | `src/components/analysis/AnalysisPage.tsx`, `GapsSection.tsx`, `ResumeFitSection.tsx`, `StrategySection.tsx`, `WhySection.tsx` |
| Types | `src/types/resume.ts`, `src/types/ats.ts` |
| Tests | `src/lib/test-report-integrity.ts`, `src/lib/test-parser-route.ts`, `src/lib/test-phase5-scenarios.ts`, `src/lib/test-ux-flow.ts`, `test-assets/resume.docx` |
| Runner and CI | `scripts/register-tests.cjs`, `scripts/test.cjs`, `package.json`, `.github/workflows/ci.yml` |
| Documentation | `docs/superpowers/plans/2026-11-05-report-integrity.md`, this report |

The Phase 5 omission fixture now removes every accepted language (Python, C++, Java). It previously retained valid alternatives while expecting the entire OR requirement to be absent. All eight original scenarios and their assertions remain.

## New named integrity tests — 33/33

- mandatory GPA UNKNOWN
- mandatory FAILED plus UNKNOWN
- all mandatory MATCHED
- mandatory PARTIAL
- empty mandatory set preserves uncertainty
- FAILED takes precedence over UNKNOWN
- UNKNOWN GPA agreement across engine, WHY, Gaps and Strategy
- degree present with supporting field
- degree absent
- degree mentioned but insufficient
- empty document cannot be verified
- skill listed only in Skills is a mention without implementation proof
- skill backed by project context
- C++ matching does not treat C as C++
- arbitrary normalized skills and regex punctuation match safely
- location unknown asks for verification
- on-site mention does not establish availability
- unrelated country does not imply requested city
- graduation year is read from source without fixed candidate years
- GPA mention below threshold remains presence, not qualification
- EDUCATION advice matches category
- GPA advice matches category
- GRADUATION advice matches category
- LOCATION advice matches category
- EXPERIENCE advice matches category
- DOCUMENT advice matches category
- OTHER advice matches category
- UNKNOWN skill asks for information instead of prescribing a project
- ATS and Resume Fit agree on presence for present, absent and insufficient degree
- all evidence snippets are verbatim and traceable to document
- no unqualified resume-ready conclusion for mandatory PARTIAL
- unverified mandatory information is not classified as a need to build projects
- report strengths and weaknesses reflect current requirements

Additional regression assertions reproduce the initial unconditional eligibility claim, mandatory skill PARTIAL verdict, degree-presence disagreement, fabricated snippets and irrelevant location advice.

## Final verification

| Check | Result |
|---|---|
| Core deterministic scenarios | 6/6 |
| Phase 4 | 7/7 |
| Phase 5 | 8/8 |
| Phase 6 / Gemini schema and offline behavior | 10/10 |
| UX/input validation | 10/10 |
| Existing subtotal | **41/41** |
| Phase 7 URL import/security | **38/38** |
| Existing file-parser checks | 5/5 |
| New report-integrity tests | 33/33 |
| New parser-route checks: real PDF, malformed PDF, DOCX, TXT | 4/4 |
| Automated regression total, `npm test` | **121/121** |
| TypeScript, `npm run typecheck` | Pass |
| ESLint, `npm run lint` | Pass, no warnings/errors |
| Production build, `npm run build` | Pass, all 13 static-generation tasks complete |
| Built-server HTTP smoke: home, workspace, PDF upload, SSRF rejection | 4/4 |
| CI YAML parsing / expected events and steps | Pass |
| Intentional failed console assertion returns exit 1 | Pass |
| `git diff --check` | Pass; Git reports only Windows line-ending normalization notices |

`test-eval.ts` is a legacy diagnostic that prints output and always exits zero; it is not counted as a deterministic suite. Production HTTP behavior was checked separately with real assertions against `next start`.

## CI

The workflow runs on push and pull request, on Ubuntu with Node 22, read-only repository permission and a 15-minute timeout. It executes `npm ci`, TypeScript, ESLint, every deterministic/security/parser/integrity suite through `npm test`, then the production build. Gemini credentials are blank for offline verification, and telemetry is disabled. No secrets are hardcoded. Production dependencies and lockfile are unchanged.

## Limitations and environment notes

- Local runtime is Node 24.19.0; the requested Node 22 configuration is in CI. Hosted CI has not run because nothing was pushed.
- The sandboxed build stalled preparing generated output; the approved build outside the sandbox succeeded. Sandbox localhost access also returned EACCES; the approved HTTP smoke check outside the sandbox passed. These were environment restrictions, not observed product failures.
- The existing Newsreader font setup emitted nonfatal font-override messages during the successful build. Typography was not changed in this correctness sprint.
- Matching remains conservative, deterministic text analysis. It records document evidence and support; it cannot authenticate credentials, prove on-site availability or independently establish eligibility. The deterministic eligibility engine still decides requirement outcomes.
- Live Gemini calls, arbitrary third-party public listings and a new Vercel deployment were not exercised. Existing Gemini schema/offline and 38 import/security regressions passed; parser and import production code were not modified.
- Saved Analyses and Phase 8 were not started.
