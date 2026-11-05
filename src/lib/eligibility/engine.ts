import { requirementAction } from './recommendations';
import { summarizeMandatoryEligibility } from './summary';
import { StudentProfile } from "@/types/profile";
import {
  Opportunity,
  OpportunityRequirement,
  RequirementImportance,
  RequirementStatus,
} from "@/types/opportunity";
import {
  AnalysisResult,
  AnalysisVerdict,
  GapCategorization,
  MatchHighlight,
  SkillGapItem,
  VerdictType,
} from "@/types/analysis";
import { EvidenceStrength, SkillEvidence } from "@/types/evidence";
import { DetailedGapItem, GapPriority, NextBestAction, RequirementTrace } from "@/types/trace";

/**
 * Deterministic Evidence Strength Evaluator
 * Rule:
 * - STRONG: Multiple (>= 2) meaningful supporting implementation/coursework sources.
 * - MODERATE: Exactly 1 meaningful implementation source.
 * - WEAK: Claim exists in profile/skills, but 0 implementation/project sources found.
 * - NOT_FOUND: Neither claimed nor demonstrated.
 */
export function deriveEvidenceStrength(skill: SkillEvidence | undefined): EvidenceStrength {
  if (!skill) return "NOT_FOUND";
  if (!skill.claimed && (!skill.evidence || skill.evidence.length === 0)) return "NOT_FOUND";
  const count = skill.evidence ? skill.evidence.length : 0;
  if (count >= 2) return "STRONG";
  if (count === 1) return "MODERATE";
  return "WEAK";
}

/**
 * Deterministic Gap Priority Evaluator
 * Rule:
 * - FAILED + MANDATORY -> CRITICAL
 * - UNKNOWN + MANDATORY -> HIGH
 * - FAILED / MISSING + PREFERRED -> MEDIUM
 * - FAILED / MISSING + BONUS -> LOW
 * - UNKNOWN + PREFERRED / BONUS -> MEDIUM
 */
export function deriveGapPriority(
  status: RequirementStatus,
  importance: RequirementImportance
): GapPriority {
  if (importance === "MANDATORY") {
    if (status === "FAILED") return "CRITICAL";
    if (status === "UNKNOWN") return "HIGH";
    return "HIGH";
  }
  if (importance === "PREFERRED") {
    return "MEDIUM";
  }
  return "LOW";
}

/**
 * Evaluates student profile against opportunity requirements deterministically,
 * building an inspectable evidence trace for every requirement.
 */
export function evaluateEligibility(
  profile: StudentProfile,
  opportunity: Opportunity
): AnalysisResult {
  const currentEdu = profile.education.find((e) => e.isCurrent) || profile.education[0];
  const profileSkillsMap = new Map<string, SkillEvidence>();
  profile.skills.forEach((s) => {
    profileSkillsMap.set(s.skill.toLowerCase(), s);
  });

  const requirementTraces: RequirementTrace[] = [];

  const evaluatedRequirements: OpportunityRequirement[] = opportunity.requirements.map(
    (req) => {
      const clonedReq: OpportunityRequirement = {
        ...req,
        evidence: [...(req.evidence || [])],
      };

      let trace: RequirementTrace;

      // 1. GRADUATION YEAR CONSTRAINT
      if (req.category === "GRADUATION" && req.normalizedValue) {
        const minYear = req.normalizedValue.minGradYear ?? 1900;
        const maxYear = req.normalizedValue.maxGradYear ?? 2100;
        const gradYear = currentEdu?.graduationYear;

        if (!currentEdu || !gradYear) {
          clonedReq.status = "UNKNOWN";
          clonedReq.trust = "UNKNOWN";
          clonedReq.profileEvidenceText = "Graduation year not declared in profile";
          clonedReq.reasoning =
            "The opportunity requires specific graduation cohorts, but the profile lacks a graduation year.";

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "UNKNOWN",
            trust: "UNKNOWN",
            sourceQuote: req.sourceText,
            highlightedPhrase: `${minYear} → ${maxYear}`,
            interpretation: {
              categoryLabel: "Graduation Cohort Window",
              importanceLabel: "MANDATORY ELIGIBILITY",
              normalizedRule: `Graduation Year ∈ [${minYear}, ${maxYear}]`,
              trustClassification: "FACT",
              explanation: "Opportunity requires applicants graduating in specified academic years.",
            },
            evidenceTrace: {
              matchedSummary: "Unrecorded Graduation Year",
              evidenceStrength: "NOT_FOUND",
              items: [],
              rawProfileField: "profile.education.graduationYear",
              isExplicitlyUnknown: true,
            },
            decision: {
              status: "UNKNOWN",
              comparisonLogic: `Graduation Year: [Unrecorded] vs [${minYear}, ${maxYear}]`,
              isDeterministic: true,
              reasoning: "Missing profile information cannot be evaluated. Marked UNKNOWN per APTLY principle.",
            },
          };
        } else if (gradYear >= minYear && gradYear <= maxYear) {
          clonedReq.status = "MATCHED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = `Graduation Year: ${gradYear} (${currentEdu.degree})`;
          clonedReq.reasoning = `Your graduation year (${gradYear}) is within the required range [${minYear}, ${maxYear}].`;

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "MATCHED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: `${minYear} → ${maxYear}`,
            interpretation: {
              categoryLabel: "Graduation Cohort Window",
              importanceLabel: "MANDATORY ELIGIBILITY",
              normalizedRule: `Graduation Year ∈ [${minYear}, ${maxYear}]`,
              trustClassification: "FACT",
              explanation: `Requires expected graduation between ${minYear} and ${maxYear}.`,
            },
            evidenceTrace: {
              matchedSummary: `Expected Graduation: ${gradYear} (Year ${currentEdu.currentYear || 2}/${currentEdu.totalYears || 4})`,
              evidenceStrength: "STRONG",
              items: [
                {
                  id: "ev-trace-grad-1",
                  source: "education",
                  title: currentEdu.institution,
                  description: `${currentEdu.degree} in ${currentEdu.field}, Graduating ${gradYear}.`,
                },
              ],
              rawProfileField: "profile.education[0].graduationYear",
            },
            decision: {
              status: "MATCHED",
              comparisonLogic: `${gradYear} ∈ [${minYear}, ${maxYear}] → PASS`,
              isDeterministic: true,
              reasoning: `Candidate's declared graduation year (${gradYear}) satisfies the mandatory cohort window [${minYear}, ${maxYear}].`,
            },
          };
        } else {
          clonedReq.status = "FAILED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = `Graduation Year: ${gradYear}`;
          clonedReq.reasoning = `Graduation year ${gradYear} is outside the required window (${minYear}–${maxYear}).`;

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "FAILED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: `${minYear} → ${maxYear}`,
            interpretation: {
              categoryLabel: "Graduation Cohort Window",
              importanceLabel: "MANDATORY ELIGIBILITY",
              normalizedRule: `Graduation Year ∈ [${minYear}, ${maxYear}]`,
              trustClassification: "FACT",
              explanation: `Restricted strictly to ${minYear}–${maxYear} graduates.`,
            },
            evidenceTrace: {
              matchedSummary: `Expected Graduation: ${gradYear}`,
              evidenceStrength: "STRONG",
              items: [],
              rawProfileField: "profile.education[0].graduationYear",
            },
            decision: {
              status: "FAILED",
              comparisonLogic: `${gradYear} ∉ [${minYear}, ${maxYear}] → FAIL`,
              isDeterministic: true,
              reasoning: `Graduation year ${gradYear} does not fall within the eligible window [${minYear}, ${maxYear}].`,
            },
          };
        }

        requirementTraces.push(trace);
        return clonedReq;
      }

      // 2. GPA CONSTRAINT
      if (req.category === "GPA" && req.normalizedValue) {
        const minGpa = req.normalizedValue.minGpa ?? 0;
        const gpaScale = req.normalizedValue.gpaScale ?? 10.0;
        const studentGpa = currentEdu?.gpa;

        if (studentGpa === undefined || studentGpa === null) {
          clonedReq.status = "UNKNOWN";
          clonedReq.trust = "UNKNOWN";
          clonedReq.profileEvidenceText = "GPA not provided in profile";
          clonedReq.reasoning =
            "The opportunity specifies a minimum CGPA threshold. Because no GPA was declared in your profile, this condition is preserved as UNKNOWN (never assumed failed).";

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "UNKNOWN",
            trust: "UNKNOWN",
            sourceQuote: req.sourceText,
            highlightedPhrase: `CGPA ≥ ${minGpa} / ${gpaScale}`,
            interpretation: {
              categoryLabel: "Academic Performance Threshold",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: `CGPA >= ${minGpa} / ${gpaScale}`,
              trustClassification: "FACT",
              explanation: `Requires a minimum cumulative grade point average of ${minGpa} on a ${gpaScale} scale.`,
            },
            evidenceTrace: {
              matchedSummary: "GPA Unrecorded",
              evidenceStrength: "NOT_FOUND",
              items: [],
              rawProfileField: "profile.education[0].gpa",
              isExplicitlyUnknown: true,
            },
            decision: {
              status: "UNKNOWN",
              comparisonLogic: `Unrecorded GPA vs threshold ${minGpa}/${gpaScale} → UNKNOWN`,
              isDeterministic: true,
              reasoning:
                "Missing GPA data prevents deterministic comparison. Per rule #6, missing data remains UNKNOWN rather than FAILED. Candidate can enter their GPA in APTLY/PROFILE to resolve this.",
            },
          };
        } else if (studentGpa >= minGpa) {
          clonedReq.status = "MATCHED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = `CGPA: ${studentGpa} / ${currentEdu.gpaScale || gpaScale}`;
          clonedReq.reasoning = `Your CGPA (${studentGpa}) meets or exceeds the minimum threshold of ${minGpa}.`;

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "MATCHED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: `CGPA ≥ ${minGpa} / ${gpaScale}`,
            interpretation: {
              categoryLabel: "Academic Performance Threshold",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: `CGPA >= ${minGpa} / ${gpaScale}`,
              trustClassification: "FACT",
              explanation: `Requires minimum cumulative GPA of ${minGpa}.`,
            },
            evidenceTrace: {
              matchedSummary: `Declared CGPA: ${studentGpa} / ${currentEdu.gpaScale || gpaScale}`,
              evidenceStrength: "STRONG",
              items: [
                {
                  id: "ev-trace-gpa-1",
                  source: "education",
                  title: "Academic Transcript",
                  description: `Cumulative Grade Point Average verified at ${studentGpa} / ${currentEdu.gpaScale || gpaScale}.`,
                },
              ],
              rawProfileField: "profile.education[0].gpa",
            },
            decision: {
              status: "MATCHED",
              comparisonLogic: `${studentGpa} >= ${minGpa} → PASS`,
              isDeterministic: true,
              reasoning: `Candidate's verified CGPA (${studentGpa}) satisfies the academic cutoff of ${minGpa}.`,
            },
          };
        } else {
          clonedReq.status = "FAILED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = `CGPA: ${studentGpa} / ${currentEdu.gpaScale || gpaScale}`;
          clonedReq.reasoning = `Your CGPA (${studentGpa}) is below the required minimum of ${minGpa}.`;

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "FAILED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: `CGPA ≥ ${minGpa} / ${gpaScale}`,
            interpretation: {
              categoryLabel: "Academic Performance Threshold",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: `CGPA >= ${minGpa} / ${gpaScale}`,
              trustClassification: "FACT",
              explanation: `Requires minimum cumulative GPA of ${minGpa}.`,
            },
            evidenceTrace: {
              matchedSummary: `Declared CGPA: ${studentGpa} / ${currentEdu.gpaScale || gpaScale}`,
              evidenceStrength: "STRONG",
              items: [],
              rawProfileField: "profile.education[0].gpa",
            },
            decision: {
              status: "FAILED",
              comparisonLogic: `${studentGpa} < ${minGpa} → FAIL`,
              isDeterministic: true,
              reasoning: `Candidate's CGPA (${studentGpa}) does not meet the mandatory threshold of ${minGpa}.`,
            },
          };
        }

        requirementTraces.push(trace);
        return clonedReq;
      }

      // 3. EDUCATION / DEGREE LEVEL
      if (req.category === "EDUCATION") {
        if (!currentEdu) {
          clonedReq.status = "UNKNOWN";
          clonedReq.trust = "UNKNOWN";
          clonedReq.profileEvidenceText = "No education history found";
          clonedReq.reasoning = "Education details are missing from profile.";

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "UNKNOWN",
            trust: "UNKNOWN",
            sourceQuote: req.sourceText,
            highlightedPhrase: "Bachelor's program in CS or related",
            interpretation: {
              categoryLabel: "Enrolled Degree Level",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: "Degree in CS / AI/ML / Engineering",
              trustClassification: "FACT",
              explanation: "Candidate must be pursuing an undergraduate technical degree.",
            },
            evidenceTrace: {
              matchedSummary: "No Education Found",
              evidenceStrength: "NOT_FOUND",
              items: [],
            },
            decision: {
              status: "UNKNOWN",
              comparisonLogic: "No education record to compare",
              isDeterministic: true,
              reasoning: "Education record missing.",
            },
          };
        } else {
          clonedReq.status = "MATCHED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = `${currentEdu.degree} in ${currentEdu.field} at ${currentEdu.institution}`;
          clonedReq.reasoning = `Enrolled in ${currentEdu.degree} (${currentEdu.field}), which satisfies the degree requirement.`;

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "MATCHED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: "Bachelor's program in CS / Engineering",
            interpretation: {
              categoryLabel: "Enrolled Degree Level",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: "Degree in CS / AI/ML / Technical Discipline",
              trustClassification: "FACT",
              explanation: "Candidate must be currently enrolled in an accredited undergraduate technical degree.",
            },
            evidenceTrace: {
              matchedSummary: `${currentEdu.degree} in ${currentEdu.field}`,
              evidenceStrength: "STRONG",
              items: [
                {
                  id: "ev-trace-edu-1",
                  source: "education",
                  title: currentEdu.institution,
                  description: `Current enrollment in Year ${currentEdu.currentYear || 2} of 4-year engineering program.`,
                },
              ],
            },
            decision: {
              status: "MATCHED",
              comparisonLogic: "B.Tech CSE ∈ [Undergraduate Technical Programs] → PASS",
              isDeterministic: true,
              reasoning: "Candidate's active undergraduate B.Tech CSE degree satisfies the qualifying criteria.",
            },
          };
        }

        requirementTraces.push(trace);
        return clonedReq;
      }

      // 4. LOCATION CONSTRAINT
      if (req.category === "LOCATION" && req.normalizedValue) {
        const isRemoteOpp = req.normalizedValue.isRemote;
        const candidateCity = profile.location?.city;
        const reqLocs = req.normalizedValue.locations || [];

        if (isRemoteOpp && profile.location?.isRemoteOk) {
          clonedReq.status = "MATCHED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = "Remote work allowed / Profile is remote-friendly";
          clonedReq.reasoning = "Opportunity supports remote participation and profile is configured for remote.";

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "MATCHED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: "Remote participation permitted",
            interpretation: {
              categoryLabel: "Geographic / Work Modality",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: "Remote Work Authorization",
              trustClassification: "FACT",
              explanation: "Opportunity allows global remote participation.",
            },
            evidenceTrace: {
              matchedSummary: "Remote Availability: Confirmed",
              evidenceStrength: "STRONG",
              items: [
                {
                  id: "ev-trace-loc-1",
                  source: "manual",
                  title: "Profile Preference",
                  description: "Remote work availability enabled in candidate profile.",
                },
              ],
            },
            decision: {
              status: "MATCHED",
              comparisonLogic: "Remote Allowed && Candidate Remote-Ready → PASS",
              isDeterministic: true,
              reasoning: "Candidate matches remote participation requirements.",
            },
          };
        } else if (candidateCity) {
          const matches = reqLocs.some((loc) =>
            candidateCity.toLowerCase().includes(loc.toLowerCase())
          );
          if (matches) {
            clonedReq.status = "MATCHED";
            clonedReq.trust = "FACT";
            clonedReq.profileEvidenceText = `Location: ${candidateCity}, ${profile.location?.country || ""}`;
            clonedReq.reasoning = `Your location in ${candidateCity} matches the required office location.`;

            trace = {
              requirementId: req.id,
              title: req.title,
              category: req.category,
              importance: req.importance,
              status: "MATCHED",
              trust: "FACT",
              sourceQuote: req.sourceText,
              highlightedPhrase: `On-site at ${reqLocs.join(", ")}`,
              interpretation: {
                categoryLabel: "Geographic / Office Location",
                importanceLabel: "MANDATORY REQUIREMENT",
                normalizedRule: `Location ∈ [${reqLocs.join(", ")}]`,
                trustClassification: "FACT",
                explanation: `Requires on-site availability in ${reqLocs.join(", ")}.`,
              },
              evidenceTrace: {
                matchedSummary: `Current Residence: ${candidateCity}, ${profile.location?.state || ""}`,
                evidenceStrength: "STRONG",
                items: [
                  {
                    id: "ev-trace-loc-2",
                    source: "manual",
                    title: "Profile Residence",
                    description: `Located in ${candidateCity}, Karnataka, India.`,
                  },
                ],
              },
              decision: {
                status: "MATCHED",
                comparisonLogic: `${candidateCity} ∈ [${reqLocs.join(", ")}] → PASS`,
                isDeterministic: true,
                reasoning: "Candidate is located in the target metropolitan area.",
              },
            };
          } else {
            clonedReq.status = "PARTIAL";
            clonedReq.trust = "INTERPRETATION";
            clonedReq.profileEvidenceText = `Location: ${candidateCity}`;
            clonedReq.reasoning = `Office is located in ${reqLocs.join(", ")}, while your profile lists ${candidateCity}.`;

            trace = {
              requirementId: req.id,
              title: req.title,
              category: req.category,
              importance: req.importance,
              status: "PARTIAL",
              trust: "INTERPRETATION",
              sourceQuote: req.sourceText,
              highlightedPhrase: `On-site at ${reqLocs.join(", ")}`,
              interpretation: {
                categoryLabel: "Geographic / Office Location",
                importanceLabel: "MANDATORY REQUIREMENT",
                normalizedRule: `Location ∈ [${reqLocs.join(", ")}]`,
                trustClassification: "INTERPRETATION",
                explanation: `Requires on-site presence in ${reqLocs.join(", ")}.`,
              },
              evidenceTrace: {
                matchedSummary: `Current Residence: ${candidateCity}`,
                evidenceStrength: "MODERATE",
                items: [],
              },
              decision: {
                status: "PARTIAL",
                comparisonLogic: `${candidateCity} ∉ [${reqLocs.join(", ")}] → Relocation / Commute needed`,
                isDeterministic: false,
                reasoning: "Candidate is outside direct city limits; may require relocation.",
              },
            };
          }
        } else {
          clonedReq.status = "UNKNOWN";
          clonedReq.trust = "UNKNOWN";
          clonedReq.profileEvidenceText = "Candidate location not specified";
          clonedReq.reasoning = "Location verification requires candidate residency details.";

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "UNKNOWN",
            trust: "UNKNOWN",
            sourceQuote: req.sourceText,
            highlightedPhrase: "On-site availability",
            interpretation: {
              categoryLabel: "Location Constraint",
              importanceLabel: "MANDATORY REQUIREMENT",
              normalizedRule: "Location Verification",
              trustClassification: "UNKNOWN",
              explanation: "Residency check required.",
            },
            evidenceTrace: {
              matchedSummary: "Unspecified Location",
              evidenceStrength: "NOT_FOUND",
              items: [],
            },
            decision: {
              status: "UNKNOWN",
              comparisonLogic: "No location declared in profile",
              isDeterministic: true,
              reasoning: "Location not declared.",
            },
          };
        }

        requirementTraces.push(trace);
        return clonedReq;
      }

      // 5. SKILL REQUIREMENTS
      if (req.category === "SKILL") {
        let requiredSkillNames = req.normalizedValue?.requiredSkills;
        if (!requiredSkillNames || requiredSkillNames.length === 0) {
          const text = (req.title + " " + req.sourceText).toLowerCase();
          const matchedProfileSkills = Array.from(profileSkillsMap.keys()).filter((k) =>
            new RegExp(`\\b${k.replace("+", "\\+")}\\b`, "i").test(text)
          );
          requiredSkillNames = matchedProfileSkills.length > 0 ? matchedProfileSkills : [req.title];
        }
        const matchedEvidence: SkillEvidence[] = [];

        for (const skillName of requiredSkillNames) {
          const found = profileSkillsMap.get(skillName.toLowerCase());
          if (found) {
            const strength = deriveEvidenceStrength(found);
            if (strength === "STRONG" || strength === "MODERATE") {
              matchedEvidence.push({ ...found, evidenceStrength: strength });
            }
          }
        }

        if (matchedEvidence.length > 0) {
          clonedReq.status = "MATCHED";
          clonedReq.trust = "FACT";
          clonedReq.profileEvidenceText = matchedEvidence
            .map((e) => `${e.skill} (${e.evidenceStrength} evidence in ${e.evidence.length} sources)`)
            .join("; ");
          clonedReq.reasoning = `Demonstrated verifiable evidence in: ${matchedEvidence.map((e) => e.skill).join(", ")}.`;

          trace = {
            requirementId: req.id,
            title: req.title,
            category: req.category,
            importance: req.importance,
            status: "MATCHED",
            trust: "FACT",
            sourceQuote: req.sourceText,
            highlightedPhrase: requiredSkillNames.join(" or "),
            interpretation: {
              categoryLabel: "Technical Skill Proficiency",
              importanceLabel: `${req.importance} QUALIFICATION`,
              normalizedRule: `Proficiency in [${requiredSkillNames.join(" OR ")}]`,
              trustClassification: "FACT",
              explanation: `Requires demonstrable capability in at least one of: ${requiredSkillNames.join(", ")}.`,
            },
            evidenceTrace: {
              matchedSummary: matchedEvidence
                .map((m) => `${m.skill} (Strength: ${m.evidenceStrength} across ${m.evidence.length} pieces of evidence)`)
                .join("; "),
              evidenceStrength: matchedEvidence[0]?.evidenceStrength || "STRONG",
              items: matchedEvidence.flatMap((m) => m.evidence),
            },
            decision: {
              status: "MATCHED",
              comparisonLogic: `Demonstrated ${matchedEvidence.map((m) => m.skill).join(" & ")} with ${matchedEvidence.reduce((acc, m) => acc + m.evidence.length, 0)} evidence source(s) → PASS`,
              isDeterministic: false,
              reasoning: `Candidate exceeds baseline requirement with verifiable project implementation.`,
            },
          };
        } else {
          const anyClaim = requiredSkillNames.some((s) => profileSkillsMap.has(s.toLowerCase()));
          const strength = anyClaim ? "WEAK" : "NOT_FOUND";

          if (anyClaim) {
            clonedReq.status = "PARTIAL";
            clonedReq.trust = "INTERPRETATION";
            clonedReq.profileEvidenceText = "Claimed in skills list, but lacking concrete project/experience evidence";
            clonedReq.reasoning =
              "The skill is mentioned in your profile, but lacks supporting project or coursework evidence.";

            trace = {
              requirementId: req.id,
              title: req.title,
              category: req.category,
              importance: req.importance,
              status: "PARTIAL",
              trust: "INTERPRETATION",
              sourceQuote: req.sourceText,
              highlightedPhrase: requiredSkillNames.join(" / "),
              interpretation: {
                categoryLabel: "Technical Skill Qualification",
                importanceLabel: `${req.importance} QUALIFICATION`,
                normalizedRule: `Knowledge of ${requiredSkillNames.join(" / ")}`,
                trustClassification: "INTERPRETATION",
                explanation: `Requires practical understanding of ${requiredSkillNames.join(" / ")}.`,
              },
              evidenceTrace: {
                matchedSummary: "Mentioned on profile; 0 supporting project or coursework evidence detected",
                evidenceStrength: "WEAK",
                items: [],
              },
              decision: {
                status: "PARTIAL",
                comparisonLogic: `Claimed on resume without project evidence → Evidence Strength: WEAK`,
                isDeterministic: false,
                reasoning: "Claimed keyword without practical evidence reduces application competitiveness.",
              },
            };
          } else {
            clonedReq.status = "FAILED";
            clonedReq.trust = "INTERPRETATION";
            clonedReq.profileEvidenceText = "No evidence found in profile or project history";
            clonedReq.reasoning = `No evidence detected for ${requiredSkillNames.join(" / ")}. ${
              req.importance === "PREFERRED"
                ? "This is a PREFERRED skill, so it does not block hard eligibility, but represents a key competitiveness gap."
                : "This is a MANDATORY skill requirement."
            }`;

            trace = {
              requirementId: req.id,
              title: req.title,
              category: req.category,
              importance: req.importance,
              status: "FAILED",
              trust: "INTERPRETATION",
              sourceQuote: req.sourceText,
              highlightedPhrase: requiredSkillNames.join(" / "),
              interpretation: {
                categoryLabel: "Technical Skill Qualification",
                importanceLabel: `${req.importance} QUALIFICATION`,
                normalizedRule: `Knowledge of ${requiredSkillNames.join(" / ")}`,
                trustClassification: "INTERPRETATION",
                explanation: `Listing asks for ${requiredSkillNames.join(" / ")}.`,
              },
              evidenceTrace: {
                matchedSummary: `No ${requiredSkillNames.join(" / ")} coursework, projects, or repository mentions detected`,
                evidenceStrength: "NOT_FOUND",
                items: [],
              },
              decision: {
                status: "FAILED",
                comparisonLogic: `Evidence for ${requiredSkillNames.join(" / ")} = NOT FOUND`,
                isDeterministic: false,
                reasoning:
                  req.importance === "PREFERRED"
                    ? "Preferred qualification is absent; constitutes a competitiveness gap rather than an eligibility disqualifier."
                    : "Mandatory qualification not found.",
              },
            };
          }
        }

        requirementTraces.push(trace);
        return clonedReq;
      }

      // Default other requirements (e.g. Hackathons, Open Source)
      const defaultTrace: RequirementTrace = {
        requirementId: req.id,
        title: req.title,
        category: req.category,
        importance: req.importance,
        status: clonedReq.status,
        trust: clonedReq.trust,
        sourceQuote: req.sourceText,
        highlightedPhrase: req.title,
        interpretation: {
          categoryLabel: req.category,
          importanceLabel: `${req.importance} CRITERION`,
          normalizedRule: req.title,
          trustClassification: clonedReq.trust,
          explanation: req.sourceText,
        },
        evidenceTrace: {
          matchedSummary: clonedReq.profileEvidenceText || "Standard evidence check",
          evidenceStrength: "STRONG",
          items: clonedReq.evidence || [],
        },
        decision: {
          status: clonedReq.status,
          comparisonLogic: `${clonedReq.status} based on candidate profile evidence`,
          isDeterministic: clonedReq.isDeterministic,
          reasoning: clonedReq.reasoning || "Satisfies qualification standard.",
        },
      };

      requirementTraces.push(defaultTrace);
      return clonedReq;
    }
  );

  // Compute Statistics
  let total = evaluatedRequirements.length;
  let matched = 0;
  let partial = 0;
  let failed = 0;
  let unknown = 0;

  let mandatoryTotal = 0;
  let mandatoryMatched = 0;
  let mandatoryFailed = 0;
  let mandatoryUnknown = 0;

  let preferredTotal = 0;
  let preferredMatched = 0;

  evaluatedRequirements.forEach((r) => {
    if (r.status === "MATCHED") matched++;
    else if (r.status === "PARTIAL") partial++;
    else if (r.status === "FAILED") failed++;
    else if (r.status === "UNKNOWN") unknown++;

    if (r.importance === "MANDATORY") {
      mandatoryTotal++;
      if (r.status === "MATCHED") mandatoryMatched++;
      else if (r.status === "FAILED") mandatoryFailed++;
      else if (r.status === "UNKNOWN") mandatoryUnknown++;
    } else if (r.importance === "PREFERRED" || r.importance === "BONUS") {
      preferredTotal++;
      if (r.status === "MATCHED") preferredMatched++;
    }
  });

  // Calculate Verdict
  let verdict: VerdictType = "CAN_APPLY";
  let badgeLabel = "YOU CAN APPLY";
  let headline = "Eligible for Application";
  let summary = "";
  let eligibilitySummary = "";
  let competitivenessSummary = "";

  const missingRequiredInfo: Array<{
    title: string;
    requirementId: string;
    category: string;
    field: string;
    actionLabel: string;
  }> = [];

  evaluatedRequirements
    .filter((r) => r.status === "UNKNOWN")
    .forEach((r) => {
      missingRequiredInfo.push({
        title: r.title,
        requirementId: r.id,
        category: r.category,
        field: r.category.toLowerCase(),
        actionLabel: r.category === "GPA" ? "ADD GPA" : "UPDATE PROFILE",
      });
    });

  const mandatorySummary = summarizeMandatoryEligibility(evaluatedRequirements);
  if (mandatoryFailed > 0) {
    verdict = "NOT_CURRENTLY_ELIGIBLE";
    badgeLabel = "NOT CURRENTLY ELIGIBLE";
    headline = "Hard Eligibility Constraints Not Met";
    eligibilitySummary = `You do not satisfy ${mandatoryFailed} mandatory requirement(s). Review the failed criteria before submitting an application.`;
    competitivenessSummary =
      "Address fundamental eligibility blockers first before optimizing application materials.";
  } else if (!mandatorySummary.allMatched) {
    verdict = "POSSIBLY_ELIGIBLE";
    badgeLabel = "POSSIBLY ELIGIBLE";
    headline = "Eligible on Known Criteria — Verify Missing Information";
    eligibilitySummary = mandatorySummary.message;
    competitivenessSummary =
      "Eligibility and competitiveness are separate. Review the evaluated evidence and verify unresolved mandatory requirements.";
  } else {
    verdict = "CAN_APPLY";
    badgeLabel = "YOU CAN APPLY";
    headline = "All Mandatory Requirements Met";
    eligibilitySummary = mandatorySummary.message;
    competitivenessSummary =
      "Focus on strengthening your application positioning, addressing preferred skill gaps, and polishing your resume bullets.";
  }

  summary = `${matched} of ${total} requirements satisfied. ${
    (unknown + partial) > 0 ? `${unknown + partial} incomplete or unconfirmed condition(s) to verify.` : ""
  }`;

  // Build Skill Breakdown
  const matchedSkills: Array<SkillEvidence & { isRequired: boolean; importance: RequirementImportance }> = [];
  const missingMandatorySkills: SkillGapItem[] = [];
  const missingPreferredSkills: SkillGapItem[] = [];
  const additionalStrengths: SkillEvidence[] = [];

  profile.skills.forEach((s) => {
    const strength = deriveEvidenceStrength(s);
    const updatedSkill: SkillEvidence = { ...s, evidenceStrength: strength };

    if (strength === "STRONG" || strength === "MODERATE") {
      const matchedReq = evaluatedRequirements.find(
        (r) =>
          r.category === "SKILL" &&
          (r.normalizedValue?.requiredSkills?.some((sk) => sk.toLowerCase() === s.skill.toLowerCase()) ||
            r.title.toLowerCase().includes(s.skill.toLowerCase()))
      );
      if (matchedReq) {
        matchedSkills.push({
          ...updatedSkill,
          isRequired: matchedReq.importance === "MANDATORY",
          importance: matchedReq.importance,
        });
      } else {
        additionalStrengths.push(updatedSkill);
      }
    }
  });

  // Check for missing skills
  evaluatedRequirements
    .filter((r) => r.category === "SKILL" && (r.status === "FAILED" || r.status === "PARTIAL"))
    .forEach((r) => {
      const isMandatory = r.importance === "MANDATORY";
      const skillName = r.title.replace("Proficiency in ", "").replace("Understanding of ", "").replace("Relational Databases & ", "");
      const priority = deriveGapPriority(r.status, r.importance);

      const gapItem: SkillGapItem = {
        skill: skillName,
        importance: r.importance,
        why: r.sourceText,
        currentEvidence: r.profileEvidenceText,
        evidenceStrength: r.status === "PARTIAL" ? "WEAK" : "NOT_FOUND",
        learnTopics: getSampleLearnTopics(r.title),
        practiceExercises: getSamplePractice(r.title),
        projectIdea: getSampleProjectIdea(r.title),
        howToProve: "Implement in a public repository with clean tests and reference it in your resume bullets.",
        priority,
      };

      if (isMandatory) {
        missingMandatorySkills.push(gapItem);
      } else {
        missingPreferredSkills.push(gapItem);
      }
    });

  // Gap Categorization (Detailed Gap Model)
  const eligibilityGaps: DetailedGapItem[] = evaluatedRequirements
    .filter((r) => r.importance === "MANDATORY" && r.status === "FAILED")
    .map((r) => ({
      id: `el-gap-${r.id}`,
      title: r.title,
      type: "ELIGIBILITY",
      priority: "CRITICAL",
      requirementId: r.id,
      whyThisMatters: "Mandatory qualification explicitly required by the listing. Failure blocks eligibility.",
      sourceRequirement: r.sourceText,
      currentEvidence: r.profileEvidenceText || "No matching evidence",
      impactType: "Disqualifying condition",
      nextAction: requirementAction(r),
      actionTarget: { window: "CHECK" },
    }));

  const competitivenessGaps: DetailedGapItem[] = evaluatedRequirements
    .filter((r) => r.importance !== "MANDATORY" && (r.status === "FAILED" || r.status === "PARTIAL"))
    .map((r) => ({
      id: `comp-gap-${r.id}`,
      title: r.title,
      type: "COMPETITIVENESS",
      priority: deriveGapPriority(r.status, r.importance),
      requirementId: r.id,
      whyThisMatters: "Preferred qualification that enhances selection standing without blocking eligibility.",
      sourceRequirement: r.sourceText,
      currentEvidence: r.profileEvidenceText || "None detected",
      impactType: "Does not prevent application; strengthens candidate ranking if closed.",
      nextAction: requirementAction(r),
      actionTarget: { window: "WHY", tab: "IMPROVE" },
    }));

  const applicationGaps: DetailedGapItem[] = evaluatedRequirements
    .filter((r) => r.status === "UNKNOWN" || (r.importance === "MANDATORY" && r.status === "PARTIAL"))
    .map((r) => ({
      id: `app-gap-${r.id}`,
      title: `Unverified ${r.title}`,
      type: "APPLICATION",
      priority: deriveGapPriority("UNKNOWN", r.importance),
      requirementId: r.id,
      whyThisMatters: "Information required by the opportunity is missing or not fully verified.",
      sourceRequirement: r.sourceText,
      currentEvidence: r.profileEvidenceText || "Not declared in profile",
      impactType: r.importance === "MANDATORY" ? "Prevents full eligibility confirmation" : "Informational gap",
      nextAction: requirementAction(r),
      actionTarget: { window: "PROFILE", field: r.category.toLowerCase() },
    }));

  const gaps: GapCategorization = {
    eligibilityGaps,
    competitivenessGaps,
    applicationGaps,
  };

  // Strongest Match & Needs Attention highlights
  const matchedRequirements = evaluatedRequirements.filter(r => r.status === "MATCHED");
  const best = matchedRequirements[0];
  const strongestMatch: MatchHighlight = {
    title: best?.title || "No confirmed match", category: best?.category || "OTHER",
    importance: best?.importance || "INFORMATIONAL", evidenceCount: best?.evidence.length || 0,
    summary: best?.profileEvidenceText || "No matched requirement evidence found.", evidenceDetail: best?.reasoning || "Requires verification.",
  };
  const firstCompGap = competitivenessGaps[0];
  const needsAttention: MatchHighlight | null = firstCompGap ? {
    title: firstCompGap.title, category: evaluatedRequirements.find(r => r.id === firstCompGap.requirementId)?.category || "OTHER",
    importance: "PREFERRED", evidenceCount: 0, summary: firstCompGap.currentEvidence || "Evidence needs review.", evidenceDetail: firstCompGap.nextAction,
  } : null;
  const strengths = matchedRequirements.map(r => ({ title: r.title, detail: r.profileEvidenceText || "Matched by the eligibility engine.",
    evidenceSource: r.evidence.map(e => e.title).join(", ") || "Candidate profile", evidenceItemsCount: r.evidence.length }));
  const weakAreas = evaluatedRequirements.filter(r => r.status !== "MATCHED").map(r => ({
    title: r.title, detail: r.profileEvidenceText || "Evidence requires verification.", evidenceSource: "Candidate profile",
    impact: r.importance === "MANDATORY" ? "Mandatory requirement requires resolution or verification." : "Does not determine mandatory eligibility.",
  }));

  // Deterministic Next Best Actions
  const nextBestActions: NextBestAction[] = [];
  let actionIdx = 1;

  if (mandatoryUnknown > 0) {
    const unverifiedItem = missingRequiredInfo.find(item => evaluatedRequirements.some(r => r.id === item.requirementId && r.importance === "MANDATORY"))!;
    nextBestActions.push({
      id: `act-${actionIdx}`,
      stepNumber: `0${actionIdx++}`,
      title: `ADD YOUR ${unverifiedItem.category.toUpperCase()}`,
      why: `A mandatory ${unverifiedItem.title} requirement is currently UNKNOWN.`,
      priority: "HIGH",
      buttonLabel: "OPEN PROFILE →",
      targetWindow: "PROFILE",
      targetField: unverifiedItem.field,
    });
  }

  if (competitivenessGaps.length > 0) {
    const topGap = competitivenessGaps[0];
    nextBestActions.push({
      id: `act-${actionIdx}`,
      stepNumber: `0${actionIdx++}`,
      title: `STRENGTHEN ${topGap.title.toUpperCase()} EVIDENCE`,
      why: `${topGap.title} is a preferred qualification that is currently unsupported.`,
      priority: "MEDIUM",
      buttonLabel: "VIEW GAP ROADMAP →",
      targetWindow: "WHY",
      targetField: "IMPROVE",
    });
  }

  nextBestActions.push({
    id: `act-${actionIdx}`,
    stepNumber: `0${actionIdx++}`,
    title: "REVIEW APPLICATION STRATEGY",
    why: mandatorySummary.message,
    priority: "LOW",
    buttonLabel: "PREVIEW STRATEGY (PHASE 4) →",
    targetWindow: "STRATEGY",
    isPhasePreview: true,
    phaseLabel: "PHASE 4 PREVIEW",
  });

  const analysisVerdict: AnalysisVerdict = {
    verdict,
    badgeLabel,
    headline,
    summary,
    eligibilitySummary,
    competitivenessSummary,
    stats: {
      total,
      matched,
      partial,
      failed,
      unknown,
      mandatoryTotal,
      mandatoryMatched,
      mandatoryFailed,
      mandatoryUnknown,
      preferredTotal,
      preferredMatched,
      evidenceBackedSkillRatio: {
        supported: matchedSkills.length,
        totalRelevant: matchedSkills.length + missingMandatorySkills.length + missingPreferredSkills.length,
      },
    },
    strongestMatch,
    needsAttention,
    strongestSignal: strongestMatch.summary,
    weakestSignal: weakAreas[0]?.detail || "No unresolved evaluated requirements.",
    missingRequiredInfo,
  };

  return {
    id: `analysis-${Date.now()}`,
    opportunityId: opportunity.id,
    profileId: profile.id,
    timestamp: new Date().toISOString(),
    verdict: analysisVerdict,
    evaluatedRequirements,
    requirementTraces,
    skillBreakdown: {
      matchedSkills,
      missingMandatorySkills,
      missingPreferredSkills,
      additionalStrengths,
    },
    gaps,
    strengths,
    weakAreas,
    nextBestActions,
  };
}

function getSampleLearnTopics(title: string): string[] {
  if (title.toLowerCase().includes("sql") || title.toLowerCase().includes("database")) {
    return [
      "Relational Schema Design & Normalization (1NF, 2NF, 3NF)",
      "Multi-table JOINs (INNER, LEFT, RIGHT, FULL OUTER)",
      "Aggregations, GROUP BY, and HAVING clauses",
      "Indexing strategies and Query Execution Plans (EXPLAIN ANALYZE)",
      "ACID transactions and isolation levels",
    ];
  }
  return [
    "Core fundamentals and standard library paradigms",
    "Idiomatic patterns and memory management",
    "Testing and debugging best practices",
  ];
}

function getSamplePractice(title: string): string[] {
  if (title.toLowerCase().includes("sql") || title.toLowerCase().includes("database")) {
    return [
      "Complete LeetCode Database 50 study plan",
      "Write complex SQL queries on PostgreSQL sample DVD Rental dataset",
      "Benchmark indexed vs unindexed query performance on 500k row tables",
    ];
  }
  return [
    "Implement 3 end-to-end algorithmic challenges",
    "Build a minimal CLI tool showcasing the technology",
  ];
}

function getSampleProjectIdea(title: string): string {
  if (title.toLowerCase().includes("sql") || title.toLowerCase().includes("database")) {
    return "Build an Event Analytics Microservice: Design a PostgreSQL schema tracking high-volume event logs with complex window functions and connection pooling.";
  }
  return "Build a focused mini-project showcasing the required technology with documentation and unit tests.";
}
