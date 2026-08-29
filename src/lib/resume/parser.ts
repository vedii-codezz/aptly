import {
  ResumeDocument,
  ResumeSection,
  ResumeSectionType,
  ResumeSkillMention,
  ResumeProjectEntry,
  ResumeBullet,
  BulletQuality,
} from "@/types/resume";

const KNOWN_SKILL_DICTIONARY = [
  "Python",
  "C++",
  "C",
  "Java",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express",
  "PyTorch",
  "TensorFlow",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "Git",
  "Linux",
  "AWS",
  "OpenCV",
  "NumPy",
  "Pandas",
  "Tailwind CSS",
  "Next.js",
  "GraphQL",
  "HTML",
  "CSS",
];

const SECTION_PATTERNS: Array<{ type: ResumeSectionType; regex: RegExp }> = [
  { type: "EDUCATION", regex: /^(education|academic background|academics)$/i },
  { type: "SKILLS", regex: /^(technical skills|skills|technologies|technical proficiencies|core competencies)$/i },
  { type: "PROJECTS", regex: /^(projects|technical projects|key projects|selected projects|personal projects)$/i },
  { type: "EXPERIENCE", regex: /^(experience|work experience|professional experience|experience & leadership|employment)$/i },
  { type: "ACHIEVEMENTS", regex: /^(honors & achievements|achievements|honors|awards|hackathons|accolades)$/i },
  { type: "CERTIFICATIONS", regex: /^(certifications|licenses & certifications)$/i },
  { type: "SUMMARY", regex: /^(summary|professional summary|about me|objective)$/i },
];

export function parseResumeText(rawText: string, isDemo = false): ResumeDocument {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parseWarnings: string[] = [];

  if (lines.length === 0) {
    return {
      id: `resume-${Date.now()}`,
      rawText: "",
      isDemo,
      sections: [],
      detectedSkills: [],
      projects: [],
      education: [],
      links: [],
      parseWarnings: ["Resume content is empty. Paste resume text or load demo resume to analyze."],
    };
  }

  const sections: ResumeSection[] = [];
  let currentSectionType: ResumeSectionType = "SUMMARY";
  let currentSectionTitle = "HEADER & CONTACT";
  let currentSectionLines: string[] = [];

  lines.forEach((line) => {
    // Check if line is a section heading
    const matchedSection = SECTION_PATTERNS.find((sec) => sec.regex.test(line));

    if (matchedSection) {
      if (currentSectionLines.length > 0) {
        sections.push({
          id: `sec-${sections.length + 1}`,
          type: currentSectionType,
          title: currentSectionTitle,
          content: currentSectionLines.join("\n"),
          rawLines: [...currentSectionLines],
        });
      }
      currentSectionType = matchedSection.type;
      currentSectionTitle = line.toUpperCase();
      currentSectionLines = [];
    } else if (/^(things i built|what i made|cool stuff|my hacks)$/i.test(line)) {
      parseWarnings.push(
        `Non-standard section heading detected: "${line}". ATS parsers favor standard headings like "PROJECTS" or "TECHNICAL EXPERIENCE".`
      );
      if (currentSectionLines.length > 0) {
        sections.push({
          id: `sec-${sections.length + 1}`,
          type: "PROJECTS",
          title: line.toUpperCase(),
          content: currentSectionLines.join("\n"),
          rawLines: [...currentSectionLines],
        });
      }
      currentSectionType = "PROJECTS";
      currentSectionTitle = line.toUpperCase();
      currentSectionLines = [];
    } else {
      currentSectionLines.push(line);
    }
  });

  if (currentSectionLines.length > 0) {
    sections.push({
      id: `sec-${sections.length + 1}`,
      type: currentSectionType,
      title: currentSectionTitle,
      content: currentSectionLines.join("\n"),
      rawLines: [...currentSectionLines],
    });
  }

  // 1. Detect Skills across sections
  const detectedSkillsMap = new Map<string, { sections: Set<ResumeSectionType>; count: number; inProjects: string[] }>();

  KNOWN_SKILL_DICTIONARY.forEach((skill) => {
    const escaped = skill.replace("+", "\\+");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");

    sections.forEach((sec) => {
      if (regex.test(sec.content)) {
        if (!detectedSkillsMap.has(skill)) {
          detectedSkillsMap.set(skill, { sections: new Set(), count: 0, inProjects: [] });
        }
        const entry = detectedSkillsMap.get(skill)!;
        entry.sections.add(sec.type);
        const matches = sec.content.match(new RegExp(`\\b${escaped}\\b`, "gi"));
        entry.count += matches ? matches.length : 1;
      }
    });
  });

  const detectedSkills: ResumeSkillMention[] = Array.from(detectedSkillsMap.entries()).map(([skill, data]) => ({
    skill,
    sectionTypes: Array.from(data.sections),
    occurrencesCount: data.count,
    inProjects: data.inProjects,
  }));

  // 2. Parse Projects & Bullets
  const projectSections = sections.filter((s) => s.type === "PROJECTS");
  const projects: ResumeProjectEntry[] = [];

  projectSections.forEach((projSec) => {
    let currentProject: ResumeProjectEntry | null = null;

    projSec.rawLines.forEach((pLine, idx) => {
      const isBullet = pLine.startsWith("•") || pLine.startsWith("-") || pLine.startsWith("*");
      const isTitleLine = pLine.includes("|") || (!isBullet && pLine.length < 80);

      if (isTitleLine && !isBullet) {
        if (currentProject) {
          projects.push(currentProject);
        }
        const parts = pLine.split("|");
        const title = parts[0].trim();
        const techStr = parts[1] || "";
        const projTechs = KNOWN_SKILL_DICTIONARY.filter((s) =>
          new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(techStr || pLine)
        );

        currentProject = {
          id: `proj-${projects.length + 1}`,
          title,
          technologies: projTechs,
          rawText: pLine,
          bullets: [],
        };
      } else if (currentProject) {
        const cleanBulletText = pLine.replace(/^[•\-\*]\s*/, "").trim();
        const bulletTechs = KNOWN_SKILL_DICTIONARY.filter((s) =>
          new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(cleanBulletText)
        );

        // Evaluate Bullet Quality Deterministically
        const quality = evaluateBulletQuality(cleanBulletText, bulletTechs);

        currentProject.bullets.push({
          id: `b-${currentProject.id}-${currentProject.bullets.length + 1}`,
          sectionId: projSec.id,
          projectNameOrContext: currentProject.title,
          rawText: cleanBulletText,
          quality: quality.quality,
          whatWorks: quality.whatWorks,
          whatsMissing: quality.whatsMissing,
          detectedSkills: bulletTechs,
          recommendedFormula: "Action Verb + Concrete Work + Technology + Observable Result",
          suggestedRewriteSample: quality.suggestedSample,
        });
      }
    });

    if (currentProject) {
      projects.push(currentProject);
    }
  });

  // 3. Extract Links
  const links: Array<{ type: string; url: string; display: string }> = [];
  const linkRegex = /(github\.com\/[a-zA-Z0-9\-_]+|linkedin\.com\/in\/[a-zA-Z0-9\-_]+|https?:\/\/[^\s]+)/gi;
  const linkMatches = rawText.match(linkRegex) || [];

  linkMatches.forEach((l) => {
    if (l.includes("github.com")) {
      links.push({ type: "github", url: l.startsWith("http") ? l : `https://${l}`, display: l });
    } else if (l.includes("linkedin.com")) {
      links.push({ type: "linkedin", url: l.startsWith("http") ? l : `https://${l}`, display: l });
    } else {
      links.push({ type: "portfolio", url: l.startsWith("http") ? l : `https://${l}`, display: l });
    }
  });

  if (!links.some((l) => l.type === "github")) {
    parseWarnings.push("No GitHub link detected in resume contact info.");
  }

  // 4. Education
  const eduSec = sections.find((s) => s.type === "EDUCATION");
  const education: ResumeDocument["education"] = [];
  if (eduSec) {
    const gradMatch = eduSec.content.match(/\b(202[4-9]|203[0-5])\b/);
    education.push({
      institution: eduSec.rawLines[0] || "University Record",
      degree: eduSec.rawLines[1],
      graduationYear: gradMatch ? parseInt(gradMatch[0]) : undefined,
    });
  }

  return {
    id: `resume-${Date.now()}`,
    rawText,
    isDemo,
    sections,
    detectedSkills,
    projects,
    education,
    links,
    parseWarnings,
  };
}

function evaluateBulletQuality(
  bulletText: string,
  detectedSkills: string[]
): {
  quality: BulletQuality;
  whatWorks: string[];
  whatsMissing: string[];
  suggestedSample?: string;
} {
  const words = bulletText.split(/\s+/);
  const hasActionVerb = /^(built|developed|engineered|architected|implemented|designed|created|integrated|orchestrated|constructed|scaled)\b/i.test(
    words[0] || ""
  );
  const hasMetric = /\b(\d+%|\d+\+?|\d+x|\d+\s*(users|requests|ms|seconds|accuracy))\b/i.test(bulletText);
  const hasTech = detectedSkills.length > 0;

  const whatWorks: string[] = [];
  const whatsMissing: string[] = [];

  if (hasActionVerb) whatWorks.push(`Clear action verb ("${words[0]}")`);
  else whatsMissing.push("Start with a strong active engineering verb (e.g. Engineered, Architected, Implemented)");

  if (hasTech) whatWorks.push(`Explicit technology stack (${detectedSkills.join(", ")})`);
  else whatsMissing.push("Mention the explicit technology or language utilized");

  if (hasMetric) whatWorks.push("Contains observable outcome or scale indicator");
  else whatsMissing.push("Lacks observable metric, accuracy, benchmark, or scale indicator");

  if (words.length < 10) {
    whatsMissing.push("Very short description; lacks technical engineering depth");
  }

  let quality: BulletQuality = "CLEAR_BUT_THIN";
  if (hasActionVerb && hasTech && hasMetric && words.length >= 14) {
    quality = "STRONG";
  } else if (!hasTech || words.length < 10) {
    quality = "VAGUE";
  }

  return {
    quality,
    whatWorks,
    whatsMissing,
    suggestedSample:
      quality === "VAGUE"
        ? `Built a ${detectedSkills[0] || "software"} application that manages structured workflow data and displays interactive outputs.`
        : undefined,
  };
}
