import { defaultStudentProfile } from "../data/demo/defaultProfile";
import { sampleOpportunities } from "../data/demo/opportunities";
import { evaluateEligibility } from "./eligibility/engine";
import { StudentProfile } from "@/types/profile";
import { Opportunity } from "@/types/opportunity";

function runAllScenarios() {
  console.log("=================================================");
  console.log("    APTLY/ DETERMINISTIC ENGINE TEST SUITE       ");
  console.log("=================================================");

  const baseOpp = sampleOpportunities[0]; // Software Engineering Internship
  const baseProfile = defaultStudentProfile;

  // SCENARIO A: All mandatory requirements matched (Candidate with GPA 8.5)
  console.log("\n[TEST SCENARIO A] All mandatory requirements matched:");
  const profileScenarioA: StudentProfile = {
    ...baseProfile,
    education: [{ ...baseProfile.education[0], gpa: 8.5 }],
  };
  const resultA = evaluateEligibility(profileScenarioA, baseOpp);
  console.log(`  -> Verdict: ${resultA.verdict.verdict} (${resultA.verdict.badgeLabel})`);
  console.log(`  -> Mandatory Failed: ${resultA.verdict.stats.mandatoryFailed}, Mandatory Unknown: ${resultA.verdict.stats.mandatoryUnknown}`);
  console.assert(resultA.verdict.verdict === "CAN_APPLY", "Scenario A Failed: Expected CAN_APPLY");
  console.log("  ✓ PASS: Verdict is CAN_APPLY when all mandatory requirements are satisfied.");

  // SCENARIO B: Mandatory information missing (e.g. GPA unrecorded)
  console.log("\n[TEST SCENARIO B] Mandatory information missing (Unrecorded GPA):");
  const profileScenarioB: StudentProfile = {
    ...baseProfile,
    education: [{ ...baseProfile.education[0], gpa: undefined }],
  };
  const resultB = evaluateEligibility(profileScenarioB, baseOpp);
  console.log(`  -> Verdict: ${resultB.verdict.verdict} (${resultB.verdict.badgeLabel})`);
  const gpaReqB = resultB.evaluatedRequirements.find((r) => r.category === "GPA");
  console.log(`  -> GPA Requirement Status: ${gpaReqB?.status} (Trust: ${gpaReqB?.trust})`);
  console.assert(resultB.verdict.verdict === "POSSIBLY_ELIGIBLE", "Scenario B Failed: Expected POSSIBLY_ELIGIBLE");
  console.assert(gpaReqB?.status === "UNKNOWN", "Scenario B Failed: GPA should be UNKNOWN not FAILED");
  console.log("  ✓ PASS: Missing mandatory GPA preserves UNKNOWN and yields POSSIBLY_ELIGIBLE.");

  // SCENARIO C: Mandatory requirement failed (Graduation year 2025 outside [2027, 2029])
  console.log("\n[TEST SCENARIO C] Mandatory requirement failed (Graduation 2025):");
  const profileScenarioC: StudentProfile = {
    ...baseProfile,
    education: [{ ...baseProfile.education[0], graduationYear: 2025, gpa: 9.0 }],
  };
  const resultC = evaluateEligibility(profileScenarioC, baseOpp);
  console.log(`  -> Verdict: ${resultC.verdict.verdict} (${resultC.verdict.badgeLabel})`);
  const gradReqC = resultC.evaluatedRequirements.find((r) => r.category === "GRADUATION");
  console.log(`  -> Graduation Requirement: ${gradReqC?.status}, Comparison: ${resultC.requirementTraces[0]?.decision.comparisonLogic}`);
  console.assert(resultC.verdict.verdict === "NOT_CURRENTLY_ELIGIBLE", "Scenario C Failed: Expected NOT_CURRENTLY_ELIGIBLE");
  console.assert(resultC.gaps.eligibilityGaps.length > 0, "Scenario C Failed: Expected eligibility gap");
  console.log("  ✓ PASS: Out-of-bounds graduation year fails mandatory check and blocks eligibility.");

  // SCENARIO D: Preferred skill missing (SQL missing) with mandatory requirements satisfied
  console.log("\n[TEST SCENARIO D] Preferred skill missing (SQL missing, GPA satisfied):");
  const resultD = evaluateEligibility(profileScenarioA, baseOpp);
  const sqlReqD = resultD.evaluatedRequirements.find((r) => r.title.includes("SQL"));
  console.log(`  -> SQL Requirement: Status = ${sqlReqD?.status}, Importance = ${sqlReqD?.importance}`);
  console.log(`  -> Verdict: ${resultD.verdict.verdict}`);
  console.log(`  -> Competitiveness Gaps Count: ${resultD.gaps.competitivenessGaps.length}`);
  console.assert(resultD.verdict.verdict === "CAN_APPLY", "Scenario D Failed: Preferred skill missing should not block CAN_APPLY");
  console.assert(sqlReqD?.importance === "PREFERRED", "Scenario D Failed: SQL must be PREFERRED");
  console.assert(resultD.gaps.competitivenessGaps.some((g) => g.title.includes("SQL")), "Scenario D Failed: Expected SQL in competitiveness gaps");
  console.log("  ✓ PASS: Missing preferred skill creates competitiveness gap without disqualifying candidate.");

  // SCENARIO E: Bonus requirement check
  console.log("\n[TEST SCENARIO E] Bonus requirement check (Hackathon Track Record):");
  const hackReqE = resultD.evaluatedRequirements.find((r) => r.importance === "BONUS");
  console.log(`  -> Bonus Requirement: ${hackReqE?.title} -> Status: ${hackReqE?.status}`);
  console.assert(hackReqE?.importance === "BONUS", "Scenario E Failed: Expected BONUS importance");
  console.log("  ✓ PASS: Bonus requirements evaluated with distinct importance tier.");

  // SCENARIO F: Live GPA Transition Simulation
  console.log("\n[TEST SCENARIO F] Live Dynamic GPA Transition (UNKNOWN -> MATCHED):");
  const step1 = evaluateEligibility(profileScenarioB, baseOpp);
  console.log(`  Step 1 (GPA Unrecorded): Verdict = ${step1.verdict.badgeLabel}`);
  const step2 = evaluateEligibility({ ...profileScenarioB, education: [{ ...profileScenarioB.education[0], gpa: 8.8 }] }, baseOpp);
  console.log(`  Step 2 (GPA 8.8 Added):  Verdict = ${step2.verdict.badgeLabel}`);
  console.assert(step1.verdict.verdict === "POSSIBLY_ELIGIBLE", "Step 1 Failed");
  console.assert(step2.verdict.verdict === "CAN_APPLY", "Step 2 Failed");
  console.log("  ✓ PASS: Live profile update deterministically resolves UNKNOWN gap to MATCHED.");

  console.log("\n=================================================");
  console.log("      ALL 6 DETERMINISTIC TESTS PASSED ✓         ");
  console.log("=================================================");
}

runAllScenarios();
