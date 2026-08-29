import { SkillEvidence } from "./evidence";

export interface EducationEntry {
  id: string;
  degree: string; // e.g. "B.Tech"
  field: string; // e.g. "Computer Science & Engineering (AI/ML)"
  institution: string;
  currentYear?: number; // e.g. 2 (second year)
  totalYears?: number; // e.g. 4
  graduationYear: number; // e.g. 2029
  gpa?: number;
  gpaScale?: number; // e.g. 10.0 or 4.0
  isCurrent: boolean;
  courses?: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  role?: string;
  techStack: string[];
  description: string;
  highlights: string[];
  metrics?: string[];
  links?: {
    github?: string;
    live?: string;
    demo?: string;
  };
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  type?: "internship" | "full-time" | "part-time" | "research" | "leadership";
  description: string;
  bullets: string[];
  techStack?: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  date?: string;
  detail: string;
  category?: "hackathon" | "competition" | "academic" | "open-source";
}

export interface StudentProfile {
  id: string;
  name: string;
  headline: string;
  email?: string;
  rawBio?: string;
  education: EducationEntry[];
  skills: SkillEvidence[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
    isRemoteOk?: boolean;
    citizenship?: string[];
  };
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    resumePdf?: string;
  };
  resumeBullets?: Array<{
    id: string;
    section: "project" | "experience" | "achievement";
    parentTitle: string;
    bullet: string;
  }>;
  unknownFields: string[];
}
