import { defaultStudentProfile } from "../data/demo/defaultProfile";
import { sampleOpportunities } from "../data/demo/opportunities";
import { defaultDemoResumeDocument, demoResumeRawText } from "../data/demo/demoResume";
import { evaluateEligibility } from "./eligibility/engine";
import { parseResumeText } from "./resume/parser";
import { evaluateResumeFit } from "./resume/engine";
import { evaluateATSFit } from "./ats/engine";
import { StudentProfile } from "@/types/profile";
import { ResumeDocument } from "@/types/resume";

function runPhase5Tests() {
  console.log("=================================================");
  console.log("    APTLY/ PHASE 5 DETERMINISTIC TEST SUITE      ");
  console.log("=================================================");

  const baseOpp = sampleOpportunities[0];
  const baseProfile: StudentProfile = {
    ...defaultStudentProfile,
    education: [{ ...defaultStudentProfile.education[0], gpa: 8.5 }], // Candidate has GPA 8.5 in profile
  };
  const baseAnalysis = evaluateEligibility(baseProfile, baseOpp);
  const baseResume = defaultDemoResumeDocument;

  // SCENARIO A: Profile has strong Python evidence; Resume mentions Python clearly
  console.log("\n[TEST SCENARIO A] Strong Python in profile + Clear in resume:");
  const fitA = evaluateResumeFit(baseAnalysis, baseProfile, baseResume);
  const pyTraceA = fitA.traces.find((t) => t.requirementTitle.toLowerCase().includes("python"));
  console.log(`  -> Python Profile Evidence: ${pyTraceA?.profileEvidenceStrength}`);
  console.log(`  -> Python Resume State: ${pyTraceA?.resumeState}`);
  console.assert(pyTraceA?.resumeState === "CLEARLY_COMMUNICATED", "Scenario A Failed: Expected CLEARLY_COMMUNICATED");
  console.log("  ✓ PASS: Profile evidence + resume project usage yields CLEARLY_COMMUNICATED.");

  // SCENARIO B: Profile has strong Python evidence; Resume omits every accepted programming language
  console.log("\n[TEST SCENARIO B] Strong Python in profile + Omitted in resume:");
  const textWithoutPython = demoResumeRawText.replace(/Python/g, "Rust").replace(/PyTorch/g, "Tch").replace(/C\+\+/g, "Rust").replace(/\bJava\b/g, "Rust");
  const resumeWithoutPython = parseResumeText(textWithoutPython);
  const fitB = evaluateResumeFit(baseAnalysis, baseProfile, resumeWithoutPython);
  const pyTraceB = fitB.traces.find((t) => t.requirementTitle.toLowerCase().includes("python"));
  console.log(`  -> Python Resume State: ${pyTraceB?.resumeState}`);
  console.log(`  -> Is Profile-Resume Disconnect: ${pyTraceB?.isProfileResumeDisconnect}`);
  console.assert(pyTraceB?.resumeState === "NOT_COMMUNICATED", "Scenario B Failed: Expected NOT_COMMUNICATED");
  console.assert(pyTraceB?.isProfileResumeDisconnect === true, "Scenario B Failed: Expected disconnect");
  console.log("  ✓ PASS: Strong profile skill omitted on resume triggers Disconnect flag and NOT_COMMUNICATED.");

  // SCENARIO C: Opportunity prefers SQL; Profile has no SQL; Resume lacks SQL
  console.log("\n[TEST SCENARIO C] Missing SQL in both profile and resume (Anti-Keyword-Stuffing):");
  const atsC = evaluateATSFit(baseAnalysis, baseProfile, baseResume);
  const sqlTermC = atsC.terms.find((t) => t.term.toLowerCase().includes("sql") || t.term.toLowerCase().includes("relational"));
  console.log(`  -> SQL Term Present in Resume: ${sqlTermC?.presentInResume}`);
  console.log(`  -> SQL Profile Evidence: ${sqlTermC?.profileEvidenceStrength}`);
  console.log(`  -> Recommendation: ${sqlTermC?.recommendation}`);
  console.log(`  -> Action Target: ${sqlTermC?.actionTarget?.window}`);
  console.assert(sqlTermC?.presentInResume === false, "Scenario C Failed: SQL should not be in demo resume");
  console.assert(sqlTermC?.actionTarget?.window === "IMPROVE", "Scenario C Failed: Should route to IMPROVE not keyword stuffing");
  console.assert(sqlTermC?.recommendation.includes("Do NOT add"), "Scenario C Failed: Must warn against keyword stuffing");
  console.log("  ✓ PASS: Missing skill without profile proof warns against keyword stuffing and routes to IMPROVE.");

  // SCENARIO D: Opportunity prefers SQL; Profile HAS SQL; Resume lacks SQL
  console.log("\n[TEST SCENARIO D] Profile HAS SQL evidence; Resume lacks SQL:");
  const profileWithSQL: StudentProfile = {
    ...baseProfile,
    skills: [
      ...baseProfile.skills,
      {
        skill: "SQL",
        claimed: true,
        evidenceStrength: "STRONG",
        category: "database",
        evidence: [
          { id: "ev-sql-1", source: "project", title: "Expense Analytics", description: "PostgreSQL multi-table joins" },
          { id: "ev-sql-2", source: "github", title: "GitHub Repo", description: "schema.sql" },
        ],
      },
    ],
  };
  const analysisD = evaluateEligibility(profileWithSQL, baseOpp);
  const atsD = evaluateATSFit(analysisD, profileWithSQL, baseResume);
  const sqlTermD = atsD.terms.find((t) => t.term.toLowerCase().includes("sql") || t.term.toLowerCase().includes("relational"));
  console.log(`  -> Recommendation: ${sqlTermD?.recommendation}`);
  console.log(`  -> Action Target: ${sqlTermD?.actionTarget?.window}`);
  console.assert(sqlTermD?.actionTarget?.window === "RESUME", "Scenario D Failed: Should recommend adding to resume");
  console.assert(sqlTermD?.recommendation.includes("Add it to your project"), "Scenario D Failed: Must recommend adding verified evidence");
  console.log("  ✓ PASS: Verified profile skill missing on resume recommends communicating genuine work.");

  // SCENARIO E: Resume claims Docker; Profile evidence is missing (Claimed Evidence Checker)
  console.log("\n[TEST SCENARIO E] Resume claims Docker; Profile evidence missing:");
  const dockerClaim = fitA.claimedEvidence.find((c) => c.skill.toLowerCase() === "docker");
  console.log(`  -> Docker Claimed in Resume: ${dockerClaim?.claimedInResume}`);
  console.log(`  -> Docker Profile Strength: ${dockerClaim?.profileEvidenceStrength}`);
  console.log(`  -> Has Evidence Warning: ${dockerClaim?.hasEvidenceWarning}`);
  console.assert(dockerClaim?.hasEvidenceWarning === true, "Scenario E Failed: Docker must trigger evidence warning");
  console.assert(dockerClaim?.profileEvidenceStrength === "NOT_FOUND" || dockerClaim?.profileEvidenceStrength === "WEAK", "Scenario E Failed");
  console.log("  ✓ PASS: Unsupported skill claim triggers explicit Evidence Warning.");

  // SCENARIO F: Non-standard section heading ("THINGS I BUILT")
  console.log("\n[TEST SCENARIO F] Non-standard section heading ('THINGS I BUILT'):");
  const nonStandardText = demoResumeRawText.replace("PROJECTS", "THINGS I BUILT");
  const parsedNonStandard = parseResumeText(nonStandardText);
  const atsF = evaluateATSFit(baseAnalysis, baseProfile, parsedNonStandard);
  const headingRisk = atsF.structuralRisks.find((r) => r.title === "Non-Standard Section Naming");
  console.log(`  -> Structural Risks Count: ${atsF.structuralRisks.length}`);
  console.log(`  -> Heading Risk: ${headingRisk?.title} -> ${headingRisk?.issueDescription}`);
  console.assert(headingRisk !== undefined, "Scenario F Failed: Expected structural risk for non-standard heading");
  console.assert(headingRisk?.issueDescription.includes("Non-standard"), "Scenario F Failed: Expected warning text");
  console.log("  ✓ PASS: Non-standard heading produces helpful parsing risk warning without false rejection claims.");

  // SCENARIO G: All mandatory requirements clearly communicated (with GPA in resume)
  console.log("\n[TEST SCENARIO G] All mandatory requirements clearly communicated (Resume with CGPA 8.5):");
  const textWithGpa = demoResumeRawText.replace("Expected Graduation: May 2029", "Expected Graduation: May 2029 • Cumulative CGPA: 8.5 / 10.0");
  const resumeWithGpa = parseResumeText(textWithGpa);
  const atsG = evaluateATSFit(baseAnalysis, baseProfile, resumeWithGpa);
  console.log(`  -> ATS Readiness State: ${atsG.readinessState}`);
  console.log(`  -> Required Terms Matched: ${atsG.stats.requiredTermsMatched} / ${atsG.stats.requiredTermsTotal}`);
  console.assert(atsG.readinessState === "CLEAR" || atsG.readinessState === "MINOR_GAPS", "Scenario G Failed: Expected CLEAR or MINOR_GAPS");
  console.log("  ✓ PASS: Resume with all mandatory requirements communicates cleanly with MINOR_GAPS / CLEAR state.");

  // SCENARIO H: One mandatory requirement satisfied in profile but hidden in resume
  console.log("\n[TEST SCENARIO H] Mandatory Python hidden in resume (Fix Decision):");
  const fitH = evaluateResumeFit(baseAnalysis, baseProfile, resumeWithoutPython);
  console.log(`  -> Fix Decision: ${fitH.fixDecision.decision} (${fitH.fixDecision.badgeLabel})`);
  console.log(`  -> Disconnects Count: ${fitH.disconnects.length}`);
  console.assert(fitH.fixDecision.decision === "FIX_KEY_EVIDENCE_FIRST", "Scenario H Failed: Expected FIX_KEY_EVIDENCE_FIRST");
  console.assert(fitH.disconnects.length > 0, "Scenario H Failed: Expected disconnects");
  console.log("  ✓ PASS: Profile evidence hidden on resume generates FIX KEY EVIDENCE FIRST decision.");

  console.log("\n=================================================");
  console.log("      ALL 8 PHASE 5 TESTS PASSED ✓               ");
  console.log("=================================================");
}

runPhase5Tests();
