import { ResumeDocument } from "@/types/resume";
import { StudentProfile, EducationEntry, ProjectEntry } from "@/types/profile";
import { SkillEvidence, EvidenceStrength, EvidenceItem } from "@/types/evidence";

export function createProfileFromResume(
  resume: ResumeDocument,
  existingProfile?: StudentProfile
): StudentProfile {
  // Extract candidate name from first non-empty lines or default
  const lines = resume.rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const detectedName =
    lines[0] && lines[0].length < 40 && !lines[0].includes(":")
      ? lines[0]
      : existingProfile?.name || "Candidate";

  // Extract education
  const education: EducationEntry[] = resume.education.map((edu, idx) => {
    const parsedGpa = edu.gpaMentioned ? parseFloat(edu.gpaMentioned.replace(/[^0-9.]/g, "")) : undefined;

    return {
      id: `edu-${idx + 1}`,
      degree: edu.degree || "Bachelor of Technology",
      field: "Computer Science",
      institution: edu.institution || "University / Institute",
      graduationYear: edu.graduationYear || 2028,
      gpa: !isNaN(parsedGpa as number) ? parsedGpa : undefined,
      gpaScale: 10.0,
      isCurrent: true,
    };
  });

  // If no education parsed from resume, fallback to existing or sensible default
  if (education.length === 0) {
    if (existingProfile?.education?.length) {
      education.push(...existingProfile.education);
    } else {
      education.push({
        id: "edu-default",
        degree: "B.Tech",
        field: "Computer Science & Engineering",
        institution: "University",
        graduationYear: 2028,
        isCurrent: true,
      });
    }
  }

  // Extract skills with evidence mapping
  const skills: SkillEvidence[] = resume.detectedSkills.map((s) => {
    let strength: EvidenceStrength = "WEAK";
    const evidenceList: EvidenceItem[] = [];

    if (s.inProjects && s.inProjects.length > 0) {
      strength = "STRONG";
      s.inProjects.forEach((proj, pIdx) => {
        evidenceList.push({
          id: `ev-proj-${s.skill.toLowerCase()}-${pIdx}`,
          source: "project",
          title: proj,
          description: `Applied in project ${proj} with verified project implementation.`,
        });
      });
    } else if (s.sectionTypes.includes("EXPERIENCE")) {
      strength = "STRONG";
      evidenceList.push({
        id: `ev-exp-${s.skill.toLowerCase()}`,
        source: "experience",
        title: "Work Experience",
        description: `Demonstrated in professional or leadership experience.`,
      });
    } else if (s.sectionTypes.includes("EDUCATION")) {
      strength = "MODERATE";
      evidenceList.push({
        id: `ev-edu-${s.skill.toLowerCase()}`,
        source: "education",
        title: "Academic Coursework",
        description: `Mentioned in academic curriculum.`,
      });
    } else {
      strength = "WEAK";
      evidenceList.push({
        id: `ev-claim-${s.skill.toLowerCase()}`,
        source: "resume",
        title: "Skills Section",
        description: `Listed in technical competencies without direct project link.`,
      });
    }

    return {
      skill: s.skill,
      claimed: true,
      evidenceStrength: strength,
      category: "other",
      evidence: evidenceList,
    };
  });

  // Extract projects
  const projects: ProjectEntry[] = resume.projects.map((p, idx) => ({
    id: `proj-${idx + 1}`,
    title: p.title,
    techStack: p.technologies,
    description: p.bullets.map((b) => b.rawText).join(" "),
    highlights: p.bullets.map((b) => b.rawText),
  }));

  // Build unknown fields
  const unknownFields: string[] = [];
  if (!education.some((e) => e.gpa !== undefined && e.gpa !== null)) {
    unknownFields.push("CGPA / GPA");
  }

  return {
    id: `profile-${Date.now()}`,
    name: detectedName,
    headline: existingProfile?.headline || "Student & Developer",
    rawBio: resume.rawText,
    education,
    skills,
    projects,
    experience: existingProfile?.experience || [],
    certifications: existingProfile?.certifications || [],
    achievements: existingProfile?.achievements || [],
    links: {
      github:
        resume.links.find((l) => (typeof l === "string" ? l : l.url || "").toLowerCase().includes("github"))?.url ||
        existingProfile?.links.github,
      linkedin:
        resume.links.find((l) => (typeof l === "string" ? l : l.url || "").toLowerCase().includes("linkedin"))?.url ||
        existingProfile?.links.linkedin,
      portfolio:
        resume.links.find(
          (l) =>
            !(typeof l === "string" ? l : l.url || "").toLowerCase().includes("github") &&
            !(typeof l === "string" ? l : l.url || "").toLowerCase().includes("linkedin")
        )?.url || existingProfile?.links.portfolio,
    },
    unknownFields,
  };
}
