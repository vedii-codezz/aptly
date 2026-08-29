import { z } from "zod";

export const ExtractedRequirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum([
    "EDUCATION",
    "SKILL",
    "EXPERIENCE",
    "LOCATION",
    "GRADUATION",
    "GPA",
    "DOCUMENT",
    "OTHER",
  ]),
  importance: z.enum(["MANDATORY", "PREFERRED", "BONUS", "INFORMATIONAL"]),
  sourceText: z.string(),
  interpretation: z.string().optional(),
  ambiguity: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]).default("NONE"),
  normalizedValue: z
    .object({
      minGradYear: z.number().optional(),
      maxGradYear: z.number().optional(),
      minGpa: z.number().optional(),
      gpaScale: z.number().optional(),
      requiredDegree: z.string().optional(),
      primarySkills: z.array(z.string()).optional(),
    })
    .optional(),
});

export const OpportunityExtractionSchema = z.object({
  title: z.string(),
  organization: z.string().optional(),
  type: z.enum(["INTERNSHIP", "SCHOLARSHIP", "HACKATHON", "COMPETITION", "FELLOWSHIP", "RESEARCH"]).default("INTERNSHIP"),
  deadline: z.string().optional(),
  deadlineRelative: z.string().optional(),
  location: z.string().optional(),
  stipendOrAward: z.string().optional(),
  description: z.string(),
  requirements: z.array(ExtractedRequirementSchema),
  extractionConfidence: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
  ambiguousClauses: z.array(z.string()).default([]),
});

export type OpportunityExtractionOutput = z.infer<typeof OpportunityExtractionSchema>;
export type ExtractedRequirementItem = z.infer<typeof ExtractedRequirementSchema>;
