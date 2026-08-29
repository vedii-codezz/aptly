import { z } from "zod";

export const AskAptlyResponseSchema = z.object({
  answer: z.string(),
  trustTag: z.enum(["FACT", "INTERPRETATION", "SUGGESTION", "USER_CONFIRMED"]).default("INTERPRETATION"),
  citations: z.array(
    z.object({
      source: z.string(), // e.g. "Opportunity Requirement #04", "Profile -> Projects", "Decision Engine: Apply Now"
      excerptOrDetail: z.string().optional(),
    })
  ).default([]),
  suggestedFollowUps: z.array(z.string()).default([]),
  engineAlignmentVerified: z.boolean().default(true),
});

export type AskAptlyResponse = z.infer<typeof AskAptlyResponseSchema>;
