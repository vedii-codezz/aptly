import http from "http";
import { defaultStudentProfile } from "../data/demo/defaultProfile";
import { sampleOpportunities } from "../data/demo/opportunities";
import { evaluateEligibility } from "./eligibility/engine";

console.log("=== 1. TESTING DETERMINISTIC HYBRID ENGINE ===");
const profile = defaultStudentProfile;
const opp = sampleOpportunities[0];

console.log(`Candidate: ${profile.name} (${profile.education[0].degree}, Grad: ${profile.education[0].graduationYear})`);
console.log(`Opportunity: ${opp.title} (${opp.organization})`);

const analysis = evaluateEligibility(profile, opp);
console.log("\n[VERDICT]:", analysis.verdict.badgeLabel);
console.log("[HEADLINE]:", analysis.verdict.headline);
console.log("[STATS]:", JSON.stringify(analysis.verdict.stats));

console.log("\n[EVALUATED REQUIREMENTS]:");
analysis.evaluatedRequirements.forEach((req) => {
  console.log(`  - [${req.status}] [${req.importance}] ${req.title} -> Evidence: ${req.profileEvidenceText}`);
});

console.log("\n=== 2. TESTING GPA RESOLUTION (UNKNOWN -> MATCHED) ===");
const profileWithGpa = {
  ...profile,
  education: [{ ...profile.education[0], gpa: 8.5 }],
};
const analysisWithGpa = evaluateEligibility(profileWithGpa, opp);
console.log("[UPDATED VERDICT AFTER GPA 8.5]:", analysisWithGpa.verdict.badgeLabel);
const gpaReq = analysisWithGpa.evaluatedRequirements.find((r) => r.category === "GPA");
console.log(`  - GPA Requirement: [${gpaReq?.status}] ${gpaReq?.profileEvidenceText}`);

console.log("\n=== 3. TESTING HTTP SERVER STATUS ===");
function checkEndpoint(path: string) {
  return new Promise((resolve) => {
    http
      .get(`http://localhost:3000${path}`, (res) => {
        console.log(`  - GET http://localhost:3000${path} -> HTTP ${res.statusCode}`);
        resolve(res.statusCode);
      })
      .on("error", (err) => {
        console.log(`  - GET http://localhost:3000${path} -> Error: ${err.message}`);
        resolve(null);
      });
  });
}

async function run() {
  await checkEndpoint("/");
  await checkEndpoint("/workspace");
  console.log("\nALL VERIFICATIONS COMPLETE.");
  process.exit(0);
}

run();
