import { EvidenceItem, TrustState } from "./evidence";

export type RequirementImportance =
  | "MANDATORY"
  | "PREFERRED"
  | "BONUS"
  | "INFORMATIONAL";

export type RequirementCategory =
  | "EDUCATION"
  | "SKILL"
  | "EXPERIENCE"
  | "LOCATION"
  | "GRADUATION"
  | "GPA"
  | "DOCUMENT"
  | "OTHER";

export type RequirementStatus = "MATCHED" | "PARTIAL" | "FAILED" | "UNKNOWN";

export interface NormalizedConstraint {
  minGradYear?: number;
  maxGradYear?: number;
  exactGradYears?: number[];
  degreeLevels?: string[];
  fieldsOfStudy?: string[];
  minGpa?: number;
  gpaScale?: number;
  requiredSkills?: string[];
  locations?: string[];
  isRemote?: boolean;
  minExperienceMonths?: number;
  workAuthorization?: string[];
  raw?: string;
}

export interface OpportunityRequirement {
  id: string;
  category: RequirementCategory;
  importance: RequirementImportance;
  title: string;
  sourceText: string;
  normalizedValue?: NormalizedConstraint;
  status: RequirementStatus;
  evidence: EvidenceItem[];
  profileEvidenceText?: string;
  reasoning?: string;
  trust: TrustState;
  sourceLocation?: string;
  isDeterministic: boolean;
}

export type OpportunityType =
  | "INTERNSHIP"
  | "JOB"
  | "FELLOWSHIP"
  | "SCHOLARSHIP"
  | "HACKATHON"
  | "RESEARCH"
  | "COMPETITION"
  | "PROGRAM"
  | "OTHER";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  deadline?: string;
  deadlineRelative?: string;
  location?: string;
  stipendOrAward?: string;
  description: string;
  rawSource?: string;
  isSample: boolean;
  requirements: OpportunityRequirement[];
  tags: string[];
  sourceUrl?: string;
  source?: { type: "url"; originalUrl: string; resolvedUrl: string; title?: string; importedAt: string };
}
