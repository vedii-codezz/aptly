import { SkillEvidence } from "./evidence";
import { OpportunityRequirement, RequirementImportance } from "./opportunity";
import { DetailedGapItem, NextBestAction, RequirementTrace } from "./trace";

export type VerdictType =
  | "CAN_APPLY"
  | "POSSIBLY_ELIGIBLE"
  | "NOT_CURRENTLY_ELIGIBLE";

export interface AnalysisStats {
  total: number;
  matched: number;
  partial: number;
  failed: number;
  unknown: number;
  mandatoryTotal: number;
  mandatoryMatched: number;
  mandatoryFailed: number;
  mandatoryUnknown: number;
  preferredTotal: number;
  preferredMatched: number;
  evidenceBackedSkillRatio: {
    supported: number;
    totalRelevant: number;
  };
}

export interface MatchHighlight {
  title: string;
  category: string;
  importance: RequirementImportance;
  evidenceCount: number;
  summary: string;
  evidenceDetail: string;
}

export interface AnalysisVerdict {
  verdict: VerdictType;
  badgeLabel: string;
  headline: string;
  summary: string;
  eligibilitySummary: string;
  competitivenessSummary: string;
  stats: AnalysisStats;
  strongestMatch: MatchHighlight;
  needsAttention: MatchHighlight | null;
  strongestSignal: string;
  weakestSignal: string;
  missingRequiredInfo: Array<{
    title: string;
    requirementId: string;
    category: string;
    field: string;
    actionLabel: string;
  }>;
}

export interface SkillGapItem {
  skill: string;
  importance: RequirementImportance;
  why: string;
  currentEvidence?: string;
  evidenceStrength?: "STRONG" | "MODERATE" | "WEAK" | "NOT_FOUND";
  learnTopics: string[];
  practiceExercises: string[];
  projectIdea: string;
  howToProve: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface GapCategorization {
  eligibilityGaps: DetailedGapItem[];
  competitivenessGaps: DetailedGapItem[];
  applicationGaps: DetailedGapItem[];
}

export interface AnalysisResult {
  id: string;
  opportunityId: string;
  profileId: string;
  timestamp: string;
  verdict: AnalysisVerdict;
  evaluatedRequirements: OpportunityRequirement[];
  requirementTraces: RequirementTrace[];
  skillBreakdown: {
    matchedSkills: Array<SkillEvidence & { isRequired: boolean; importance: RequirementImportance }>;
    missingMandatorySkills: SkillGapItem[];
    missingPreferredSkills: SkillGapItem[];
    additionalStrengths: SkillEvidence[];
  };
  gaps: GapCategorization;
  strengths: Array<{
    title: string;
    detail: string;
    evidenceSource: string;
    evidenceItemsCount: number;
  }>;
  weakAreas: Array<{
    title: string;
    detail: string;
    evidenceSource?: string;
    impact: string;
  }>;
  nextBestActions: NextBestAction[];
}
