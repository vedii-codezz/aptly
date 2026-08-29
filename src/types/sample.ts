export type SampleCategory =
  | "RESUME_BULLET"
  | "PROJECT_DESCRIPTION"
  | "README_SUMMARY"
  | "APPLICATION_RESPONSE"
  | "SKILL_EVIDENCE";

export interface SampleTemplate {
  id: string;
  category: SampleCategory;
  title: string;
  targetSkillOrContext: string;
  disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE";
  currentClaimOrEvidence?: string;
  structuralProblem?: string;
  recommendedFormula: string; // e.g. "Action Verb + Concrete Work + Technology Stack + Observable Result"
  sampleText: string;
  breakdown: Array<{
    label: string;
    text: string;
  }>;
}
