import { z } from "zod";

export const LiveSampleSchema = z.object({
  title: z.string(),
  category: z.enum(["RESUME_BULLET", "PROJECT_DESCRIPTION", "README_SUMMARY", "APPLICATION_RESPONSE", "SKILL_EVIDENCE"]),
  disclaimer: z.literal("SAMPLE — ADAPT TO YOUR REAL EXPERIENCE"),
  sampleText: z.string(),
  formulaUsed: z.string(),
  breakdown: z.array(
    z.object({
      label: z.string(),
      text: z.string(),
    })
  ),
});

export type LiveSampleOutput = z.infer<typeof LiveSampleSchema>;
