import { ResumeDocument, ResumeSection, ResumeBullet, ResumeSkillMention } from "@/types/resume";
import { ResumeEnrichmentOutput } from "@/lib/gemini/schemas/resume";

export function mergeResumeWithEnrichment(
  deterministicResume: ResumeDocument,
  geminiEnrichment: ResumeEnrichmentOutput
): ResumeDocument {
  // 1. Prioritize Exact Resume Text and Deterministic Sections
  const mergedSections: ResumeSection[] = [...deterministicResume.sections];

  // If deterministic parser missed a section, add it with INTERPRETATION tag
  geminiEnrichment.sectionsDetected.forEach((gSec) => {
    const exists = mergedSections.some((s) => s.type === gSec.type);
    if (!exists) {
      mergedSections.push({
        id: `sec-ai-${gSec.type.toLowerCase()}`,
        type: gSec.type,
        title: gSec.title,
        content: gSec.rawSnippet,
        rawLines: gSec.rawSnippet.split("\n").filter((l) => l.trim().length > 0),
      });
    }
  });

  // 2. Enhance Project Bullets cautiously
  const mergedProjects = deterministicResume.projects.map((proj) => {
    const gProj = geminiEnrichment.projectsEnriched.find(
      (p) => p.title.toLowerCase() === proj.title.toLowerCase()
    );

    if (!gProj) return proj;

    const enrichedBullets: ResumeBullet[] = proj.bullets.map((b) => {
      const gInsight = gProj.bulletInsights.find((bi) =>
        b.rawText.toLowerCase().includes(bi.rawText.slice(0, 30).toLowerCase())
      );

      if (!gInsight) return b;

      const updatedWhatWorks = [...b.whatWorks];
      if (gInsight.actionVerb && !updatedWhatWorks.some((w) => w.includes(gInsight.actionVerb!))) {
        updatedWhatWorks.push(`Action Verb: ${gInsight.actionVerb}`);
      }

      return {
        ...b,
        whatWorks: updatedWhatWorks,
      };
    });

    return {
      ...proj,
      technologies: Array.from(new Set([...proj.technologies, ...gProj.technologies])),
      bullets: enrichedBullets,
    };
  });

  // 3. Merge Detected Skills cautiously
  const existingSkillSet = new Set(deterministicResume.detectedSkills.map((s) => s.skill.toLowerCase()));
  const newSkills: ResumeSkillMention[] = geminiEnrichment.skillsExtracted
    .filter((s) => !existingSkillSet.has(s.name.toLowerCase()))
    .map((s) => ({
      skill: s.name,
      sectionTypes: [s.section as any],
      occurrencesCount: 1,
      inProjects: [],
    }));

  return {
    ...deterministicResume,
    sections: mergedSections,
    projects: mergedProjects,
    detectedSkills: [...deterministicResume.detectedSkills, ...newSkills],
    parseWarnings: [
      ...deterministicResume.parseWarnings,
      ...geminiEnrichment.parsingFlags.map((f) => `AI Interpretation: ${f}`),
    ],
  };
}
