import { GapPriority } from "./trace";
import { RequirementImportance } from "./opportunity";

export type ImprovementType =
  | "INFORMATION"
  | "SKILL"
  | "EVIDENCE"
  | "APPLICATION"
  | "FIXED_CONSTRAINT";

export interface ImprovementStep {
  stepNumber: string;
  phase: "LEARN" | "PRACTICE" | "BUILD" | "PROVE" | "VERIFY";
  title: string;
  description: string;
  items: string[];
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  tagline: string;
  whyThisProject: string;
  targetSkill: string;
  estimatedHours: string;
  architecture: string[];
  coreQueriesOrFeatures: string[];
  proofDeliverables: string[];
}

export interface ResourceCategory {
  category: "LEARN" | "PRACTICE" | "BUILD" | "REFERENCE";
  title: string;
  description: string;
  suggestedTopics: string[];
}

export interface ImprovementPlan {
  id: string;
  gapId: string;
  requirementId?: string;
  title: string;
  type: ImprovementType;
  priority: GapPriority;
  importance: RequirementImportance;
  actionable: boolean;
  whyItMatters: string;
  sourceRequirementText: string;
  currentState: string;
  targetState: string;
  fixedConstraintExplanation?: string;
  steps: ImprovementStep[];
  projectRecommendation?: ProjectRecommendation;
  resources: ResourceCategory[];
  completionCriteria: string[];
  canSimulateDemoEvidence?: boolean;
}

export type ApplicationReadinessState =
  | "BLOCKED"
  | "NEEDS_INFORMATION"
  | "READY_WITH_GAPS"
  | "READY_TO_APPLY";

export type ApplyDecisionState =
  | "APPLY_NOW"
  | "FIX_ONE_THING_FIRST"
  | "RESOLVE_ELIGIBILITY_FIRST";

export interface StrategyPlan {
  opportunityId: string;
  profileId: string;
  readinessState: ApplicationReadinessState;
  readinessSummary: string;
  applyDecision: {
    decision: ApplyDecisionState;
    badgeLabel: string;
    headline: string;
    reasoning: string;
    urgencyText?: string;
  };
  emphasize: Array<{
    id: string;
    title: string;
    why: string;
    sources: string[];
    placement: string[];
  }>;
  improveGaps: Array<{
    id: string;
    title: string;
    priority: GapPriority;
    why: string;
    timingAdvice: string;
    planId?: string;
  }>;
  positioning: {
    leadWith: string[];
    supportingSection: string[];
    deEmphasize: string[];
  };
  preparationTopics: Array<{
    id: string;
    topic: string;
    urgency: "HIGH" | "MEDIUM" | "LOW";
    sourceReq: string;
    focusAreas: string[];
  }>;
  timelinePlan: {
    deadlineText?: string;
    daysRemaining?: number;
    schedule: Array<{
      dayLabel: string; // e.g. "TODAY", "TOMORROW", "DAY 3", "BEFORE SUBMISSION"
      tasks: Array<{
        id: string;
        task: string;
        category: "PROFILE" | "RESUME" | "EVIDENCE" | "APPLICATION";
        isBlocker?: boolean;
      }>;
    }>;
  };
}
