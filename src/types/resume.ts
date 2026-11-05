import { RequirementImportance } from "./opportunity";
import { EvidenceStrength } from "./evidence";

export type ResumeSectionType =
  | "SUMMARY"
  | "EDUCATION"
  | "SKILLS"
  | "PROJECTS"
  | "EXPERIENCE"
  | "ACHIEVEMENTS"
  | "CERTIFICATIONS"
  | "LINKS"
  | "OTHER";

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  title: string;
  content: string;
  rawLines: string[];
}

export type BulletQuality =
  | "STRONG"
  | "CLEAR_BUT_THIN"
  | "VAGUE"
  | "MISSING_EVIDENCE";

export interface ResumeBullet {
  id: string;
  sectionId: string;
  rawText: string;
  projectNameOrContext?: string;
  quality: BulletQuality;
  whatWorks: string[];
  whatsMissing: string[];
  detectedSkills: string[];
  recommendedFormula: string;
  suggestedRewriteSample?: string;
}

export interface ResumeSkillMention {
  skill: string;
  sectionTypes: ResumeSectionType[];
  occurrencesCount: number;
  inProjects: string[];
}

export interface ResumeProjectEntry {
  id: string;
  title: string;
  technologies: string[];
  bullets: ResumeBullet[];
  rawText: string;
}

export interface ResumeEducationEntry {
  institution: string;
  degree?: string;
  graduationYear?: number;
  gpaMentioned?: string;
}

export interface ResumeDocument {
  id: string;
  rawText: string;
  isDemo: boolean;
  sections: ResumeSection[];
  detectedSkills: ResumeSkillMention[];
  projects: ResumeProjectEntry[];
  education: ResumeEducationEntry[];
  links: Array<{ type: string; url: string; display: string }>;
  parseWarnings: string[];
}

export type ResumeRequirementState =
  | "CLEARLY_COMMUNICATED"
  | "PARTIALLY_COMMUNICATED"
  | "WEAKLY_COMMUNICATED"
  | "NOT_COMMUNICATED"
  | "NOT_APPLICABLE";

export interface RequirementResumeTrace {
  documentMatch?: import("@/lib/resume/requirementMatcher").ResumeRequirementMatch;
  requirementId: string;
  requirementTitle: string;
  importance: RequirementImportance;
  profileEvidenceStrength: EvidenceStrength;
  profileSummary: string;
  resumeState: ResumeRequirementState;
  resumeEvidenceLocations: Array<{
    sectionType: ResumeSectionType;
    snippet: string;
  }>;
  communicationVerdict: string;
  isProfileResumeDisconnect: boolean; // "YOU HAVE IT — YOUR RESUME DOESN'T SHOW IT"
  disconnectExplanation?: string;
  actionRecommendation?: string;
}

export interface ClaimedEvidenceItem {
  skill: string;
  claimedInResume: boolean;
  resumeLocations: ResumeSectionType[];
  profileEvidenceStrength: EvidenceStrength;
  supportingSources: {
    skills: boolean;
    projects: boolean;
    experience: boolean;
    github: boolean;
  };
  hasEvidenceWarning: boolean;
  warningMessage?: string;
}

export type FixDecisionState =
  | "RESUME_READY"
  | "VERIFY_REQUIRED_INFORMATION"
  | "FIX_KEY_EVIDENCE_FIRST"
  | "BUILD_REAL_EVIDENCE_FIRST";

export interface ResumeFitAnalysis {
  opportunityId: string;
  resumeId: string;
  stats: {
    mandatoryTotal: number;
    mandatoryClearlyCommunicated: number;
    preferredTotal: number;
    preferredClearlyCommunicated: number;
    totalSupportedClaims: number;
    disconnectCount: number;
  };
  traces: RequirementResumeTrace[];
  claimedEvidence: ClaimedEvidenceItem[];
  inspectedBullets: ResumeBullet[];
  fixDecision: {
    decision: FixDecisionState;
    badgeLabel: string;
    headline: string;
    reasoning: string;
    targetActionLabel: string;
    targetWindow?: "RESUME" | "IMPROVE" | "PROFILE" | "STRATEGY";
  };
  disconnects: Array<{
    id: string;
    requirementTitle: string;
    profileStrength: EvidenceStrength;
    resumeStatus: ResumeRequirementState;
    whyItMatters: string;
    howToFix: string;
  }>;
}
