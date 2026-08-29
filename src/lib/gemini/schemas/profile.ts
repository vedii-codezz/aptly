import { z } from "zod";

export const ProfileExtractionSchema = z.object({
  education: z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    field: z.string().optional(),
    yearOfStudy: z.number().optional(),
    graduationYear: z.number().optional(),
    gpa: z.number().optional(),
    gpaScale: z.number().optional(),
  }),
  skills: z.array(
    z.object({
      name: z.string(),
      confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).default("HIGH"),
      sourceText: z.string().default(""),
      category: z
        .enum(["language", "framework", "tool", "concept", "database", "other"])
        .default("language"),
    })
  ).default([]),
  projects: z.array(
    z.object({
      title: z.string().default("Project"),
      description: z.string(),
      technologies: z.array(z.string()).default([]),
      sourceText: z.string().default(""),
    })
  ).default([]),
  experience: z.array(
    z.object({
      role: z.string(),
      organization: z.string(),
      description: z.string(),
    })
  ).default([]),
  hackathons: z.array(
    z.object({
      name: z.string(),
      awardOrPlacement: z.string(),
      year: z.number().optional(),
    })
  ).default([]),
  unknownFields: z.array(z.string()).default([]),
});

export type ProfileExtractionOutput = z.infer<typeof ProfileExtractionSchema>;
