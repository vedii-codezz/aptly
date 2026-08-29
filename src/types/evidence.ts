export type EvidenceSource =
  | "resume"
  | "project"
  | "experience"
  | "education"
  | "certification"
  | "github"
  | "manual";

export type EvidenceStrength = "STRONG" | "MODERATE" | "WEAK" | "NOT_FOUND";

export type TrustState = "FACT" | "INTERPRETATION" | "UNKNOWN" | "SUGGESTION" | "USER_CONFIRMED";

export interface EvidenceItem {
  id: string;
  source: EvidenceSource;
  title?: string;
  section?: string;
  description: string;
  excerpt?: string;
  url?: string;
  verifiedDate?: string;
  confidence?: number;
}

export interface SkillEvidence {
  skill: string;
  claimed: boolean;
  evidence: EvidenceItem[];
  evidenceStrength: EvidenceStrength;
  notes?: string;
  category?: "language" | "framework" | "tool" | "concept" | "database" | "other";
}
