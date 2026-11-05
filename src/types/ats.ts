import { EvidenceStrength } from "./evidence";

export type ATSTermImportance =
  | "REQUIRED"
  | "HIGHLY_RELEVANT"
  | "SUPPORTING"
  | "OPTIONAL";

export type ATSReadiness =
  | "CLEAR"
  | "MINOR_GAPS"
  | "NEEDS_ATTENTION"
  | "STRUCTURAL_RISK";

export interface ATSTermAnalysis {
  requirementId?: string;
  documentMatch?: import("@/lib/resume/requirementMatcher").ResumeRequirementMatch;
  term: string;
  importance: ATSTermImportance;
  presentInResume: boolean;
  resumeOccurrences: number;
  resumeSections: string[];
  profileEvidenceStrength: EvidenceStrength;
  recommendation: string;
  actionTarget?: {
    window: "RESUME" | "IMPROVE" | "PROFILE";
    planId?: string;
  };
}

export interface ATSStructuralRisk {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: "HEADING" | "FORMATTING" | "CONTACT_LINKS" | "CONTENT_DENSITY";
  title: string;
  issueDescription: string;
  affectedSectionOrText?: string;
  suggestedFix: string;
}

export interface ATSAnalysisResult {
  opportunityId: string;
  readinessState: ATSReadiness;
  readinessHeadline: string;
  readinessSummary: string;
  stats: {
    totalEvaluatedTerms: number;
    requiredTermsMatched: number;
    requiredTermsTotal: number;
    preferredTermsMatched: number;
    preferredTermsTotal: number;
    structuralRisksCount: number;
  };
  terms: ATSTermAnalysis[];
  structuralRisks: ATSStructuralRisk[];
  antiStuffingPolicy: {
    statement: string;
    guidingRule: string;
  };
}
