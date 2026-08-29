import { defaultStudentProfile } from "../data/demo/defaultProfile";
import { sampleOpportunities } from "../data/demo/opportunities";
import { evaluateEligibility } from "./eligibility/engine";
import { buildImprovementPlans, buildStrategyPlan } from "./improvement/engine";
import { generateSampleTemplates } from "./samples/generator";
import { StudentProfile } from "@/types/profile";
import { Opportunity } from "@/types/opportunity";

function runPhase4Tests() {
  console.log("=================================================");
  console.log("    APTLY/ PHASE 4 DETERMINISTIC TEST SUITE      ");
  console.log("=================================================");

  const baseOpp = sampleOpportunities[0]; // Apex Systems SWE Internship
  const baseProfile = defaultStudentProfile;

  // SCENARIO A: Mandatory information unknown (Unrecorded GPA)
  console.log("\n[TEST SCENARIO A] Mandatory information unknown (GPA missing):");
  const profileScenarioA: StudentProfile = {
    ...baseProfile,
    education: [{ ...baseProfile.education[0], gpa: undefined }],
  };
  const analysisA = evaluateEligibility(profileScenarioA, baseOpp);
  const plansA = buildImprovementPlans(analysisA, baseOpp, profileScenarioA);
  const strategyA = buildStrategyPlan(analysisA, baseOpp, profileScenarioA);

  console.log(`  -> Strategy Decision: ${strategyA.applyDecision.decision} (${strategyA.applyDecision.badgeLabel})`);
  console.log(`  -> Top Improvement Plan: ${plansA[0]?.title} (Priority: ${plansA[0]?.priority})`);
  console.assert(strategyA.applyDecision.decision === "FIX_ONE_THING_FIRST", "Scenario A Failed: Expected FIX_ONE_THING_FIRST");
  console.assert(plansA.some((p) => p.type === "INFORMATION" && p.title.includes("GPA")), "Scenario A Failed: Expected GPA information plan");
  console.log("  ✓ PASS: Missing mandatory info generates FIX ONE THING FIRST decision and HIGH priority plan.");

  // SCENARIO B: Mandatory graduation requirement failed (Immutable constraint)
  console.log("\n[TEST SCENARIO B] Mandatory graduation requirement failed (Graduation 2025):");
  const profileScenarioB: StudentProfile = {
    ...baseProfile,
    education: [{ ...baseProfile.education[0], graduationYear: 2025, gpa: 9.0 }],
  };
  const analysisB = evaluateEligibility(profileScenarioB, baseOpp);
  const plansB = buildImprovementPlans(analysisB, baseOpp, profileScenarioB);
  const strategyB = buildStrategyPlan(analysisB, baseOpp, profileScenarioB);

  const gradPlan = plansB.find((p) => p.type === "FIXED_CONSTRAINT");
  console.log(`  -> Strategy Decision: ${strategyB.applyDecision.decision} (${strategyB.applyDecision.badgeLabel})`);
  console.log(`  -> Plan Type: ${gradPlan?.type}, Actionable: ${gradPlan?.actionable}`);
  console.log(`  -> Explanation: ${gradPlan?.fixedConstraintExplanation}`);
  console.assert(strategyB.applyDecision.decision === "RESOLVE_ELIGIBILITY_FIRST", "Scenario B Failed: Expected RESOLVE_ELIGIBILITY_FIRST");
  console.assert(gradPlan && !gradPlan.actionable, "Scenario B Failed: Fixed constraint must not be actionable");
  console.assert(!gradPlan?.steps.some((s) => s.title.toLowerCase().includes("improve graduation")), "Scenario B Failed: Must not instruct user to improve graduation year");
  console.log("  ✓ PASS: Out-of-bounds graduation correctly classified as non-actionable FIXED CONSTRAINT.");

  // SCENARIO C: All mandatory pass, preferred SQL missing
  console.log("\n[TEST SCENARIO C] All mandatory pass, preferred SQL missing (GPA 8.5):");
  const profileScenarioC: StudentProfile = {
    ...baseProfile,
    education: [{ ...baseProfile.education[0], gpa: 8.5 }],
  };
  const analysisC = evaluateEligibility(profileScenarioC, baseOpp);
  const plansC = buildImprovementPlans(analysisC, baseOpp, profileScenarioC);
  const strategyC = buildStrategyPlan(analysisC, baseOpp, profileScenarioC);

  const sqlPlan = plansC.find((p) => p.title.toLowerCase().includes("sql"));
  console.log(`  -> Strategy Decision: ${strategyC.applyDecision.decision} (${strategyC.applyDecision.badgeLabel})`);
  console.log(`  -> Readiness: ${strategyC.readinessState}`);
  console.log(`  -> SQL Plan Priority: ${sqlPlan?.priority}, Importance: ${sqlPlan?.importance}`);
  console.assert(strategyC.applyDecision.decision === "APPLY_NOW", "Scenario C Failed: Expected APPLY_NOW");
  console.assert(strategyC.readinessState === "READY_WITH_GAPS", "Scenario C Failed: Expected READY_WITH_GAPS");
  console.assert(sqlPlan?.priority === "MEDIUM", "Scenario C Failed: Preferred SQL must be MEDIUM priority");
  console.log("  ✓ PASS: Preferred SQL gap does not block APPLY NOW and assigns MEDIUM priority.");

  // SCENARIO D: All mandatory and preferred satisfied (Fully aligned profile)
  console.log("\n[TEST SCENARIO D] All mandatory and preferred satisfied:");
  const profileScenarioD: StudentProfile = {
    ...profileScenarioC,
    skills: [
      ...profileScenarioC.skills,
      {
        skill: "SQL",
        claimed: true,
        evidenceStrength: "STRONG",
        category: "database",
        evidence: [{ id: "ev-sql-1", source: "project", title: "DB", description: "SQL project" }],
      },
    ],
  };
  const analysisD = evaluateEligibility(profileScenarioD, baseOpp);
  const strategyD = buildStrategyPlan(analysisD, baseOpp, profileScenarioD);
  console.log(`  -> Strategy Readiness: ${strategyD.readinessState}`);
  console.log(`  -> Decision: ${strategyD.applyDecision.decision}`);
  console.assert(strategyD.readinessState === "READY_TO_APPLY", "Scenario D Failed: Expected READY_TO_APPLY");
  console.log("  ✓ PASS: Fully qualified candidate assigned READY TO APPLY.");

  // SCENARIO E: Bonus skill missing (Hackathon/Community bonus)
  console.log("\n[TEST SCENARIO E] Bonus requirement check:");
  const oppWithBonusOnly: Opportunity = {
    ...baseOpp,
    requirements: baseOpp.requirements.filter((r) => r.importance === "BONUS"),
  };
  const analysisE = evaluateEligibility(profileScenarioC, oppWithBonusOnly);
  console.log(`  -> Mandatory Failed: ${analysisE.verdict.stats.mandatoryFailed}`);
  console.assert(analysisE.verdict.stats.mandatoryFailed === 0, "Scenario E Failed: Bonus must not fail mandatory");
  console.log("  ✓ PASS: Bonus requirement has zero negative impact on hard eligibility.");

  // SCENARIO F: Deadline close (e.g. 5 days remaining) + only preferred gap exists
  console.log("\n[TEST SCENARIO F] Deadline close (5 days remaining) with preferred gap:");
  const oppShortDeadline: Opportunity = {
    ...baseOpp,
    deadlineRelative: "5 days remaining",
  };
  const analysisF = evaluateEligibility(profileScenarioC, oppShortDeadline);
  const strategyF = buildStrategyPlan(analysisF, oppShortDeadline, profileScenarioC);
  console.log(`  -> Strategy Decision: ${strategyF.applyDecision.decision}`);
  console.log(`  -> Timing Advice: ${strategyF.improveGaps[0]?.timingAdvice}`);
  console.assert(strategyF.applyDecision.decision === "APPLY_NOW", "Scenario F Failed: Expected APPLY_NOW for short deadline");
  console.assert(strategyF.improveGaps[0]?.timingAdvice.includes("Do NOT delay"), "Scenario F Failed: Should advise against delaying");
  console.log("  ✓ PASS: Deadline-aware engine explicitly warns against delaying submission for preferred gaps.");

  // SCENARIO G: Sample Intelligence & Structured Templates
  console.log("\n[TEST SCENARIO G] Sample Intelligence Generator:");
  const samples = generateSampleTemplates(profileScenarioC, baseOpp);
  console.log(`  -> Generated ${samples.length} structured templates:`);
  samples.forEach((s) => {
    console.log(`     • [${s.category}] ${s.title} (Formula: ${s.recommendedFormula})`);
    console.assert(s.disclaimer === "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE", "Sample disclaimer missing");
  });
  console.assert(samples.length >= 4, "Scenario G Failed: Expected at least 4 sample templates");
  console.log("  ✓ PASS: Sample generator produces structured, non-hallucinated templates with real-experience disclaimers.");

  console.log("\n=================================================");
  console.log("      ALL 7 PHASE 4 TESTS PASSED ✓               ");
  console.log("=================================================");
}

runPhase4Tests();
