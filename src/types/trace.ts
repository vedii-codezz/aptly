import { EvidenceItem, EvidenceStrength, TrustState } from "./evidence";
import {
  OpportunityRequirement,
  RequirementCategory,
  RequirementImportance,
  RequirementStatus,
} from "./opportunity";

export type GapPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RequirementTrace {
  requirementId: string;
  title: string;
  category: RequirementCategory;
  importance: RequirementImportance;
  status: RequirementStatus;
  trust: TrustState;

  // Step 1: Source
  sourceQuote: string;
  highlightedPhrase?: string;
  sourceContext?: string;

  // Step 2: Interpretation
  interpretation: {
    categoryLabel: string;
    importanceLabel: string;
    normalizedRule: string;
    trustClassification: TrustState;
    explanation: string;
  };

  // Step 3: Profile Evidence
  evidenceTrace: {
    matchedSummary: string;
    evidenceStrength: EvidenceStrength;
    items: EvidenceItem[];
    rawProfileField?: string;
    isExplicitlyUnknown?: boolean;
  };

  // Step 4: Decision & Deterministic Rule Check
  decision: {
    status: RequirementStatus;
    comparisonLogic: string; // e.g. "2029 ∈ [2027, 2029]" or "CGPA: unrecorded < 8.0 threshold"
    isDeterministic: boolean;
    reasoning: string;
  };
}

export interface DetailedGapItem {
  id: string;
  title: string;
  type: "ELIGIBILITY" | "COMPETITIVENESS" | "APPLICATION";
  priority: GapPriority;
  requirementId?: string;
  whyThisMatters: string;
  sourceRequirement: string;
  currentEvidence: string;
  impactType: string;
  nextAction: string;
  actionTarget?: {
    window: "PROFILE" | "CHECK" | "WHY";
    tab?: string;
    field?: string;
  };
}

export interface NextBestAction {
  id: string;
  stepNumber: string;
  title: string;
  why: string;
  priority: GapPriority;
  buttonLabel: string;
  targetWindow: "PROFILE" | "CHECK" | "WHY" | "STRATEGY";
  targetField?: string;
  targetReqId?: string;
  isPhasePreview?: boolean;
  phaseLabel?: string;
}
