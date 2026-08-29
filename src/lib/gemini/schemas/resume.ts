import { z } from "zod";

export const ResumeEnrichmentSchema = z.object({
  sectionsDetected: z.array(
    z.object({
      type: z.enum([
        "SUMMARY",
        "EDUCATION",
        "SKILLS",
        "PROJECTS",
        "EXPERIENCE",
        "ACHIEVEMENTS",
        "CERTIFICATIONS",
        "LINKS",
        "OTHER",
      ]),
      title: z.string(),
      rawSnippet: z.string(),
    })
  ),
  skillsExtracted: z.array(
    z.object({
      name: z.string(),
      section: z.string(),
      context: z.string().optional(),
    })
  ),
  projectsEnriched: z.array(
    z.object({
      title: z.string(),
      technologies: z.array(z.string()),
      bulletInsights: z.array(
        z.object({
          rawText: z.string(),
          actionVerb: z.string().optional(),
          technicalContribution: z.string().optional(),
          measurableOutput: z.string().optional(),
        })
      ),
    })
  ),
  parsingFlags: z.array(z.string()).default([]),
});

export type ResumeEnrichmentOutput = z.infer<typeof ResumeEnrichmentSchema>;
