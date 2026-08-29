import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "./client";
import { RequirementImportance } from "@/types/opportunity";
import { RequirementStatus } from "@/types/opportunity";

export interface ExplanationContext {
  requirementTitle: string;
  sourceText: string;
  importance: RequirementImportance;
  deterministicStatus: RequirementStatus;
  profileEvidenceText?: string;
  gapPriority?: "HIGH" | "MEDIUM" | "LOW" | "FIXED_CONSTRAINT";
  applyDecision?: "APPLY_NOW" | "FIX_ONE_THING_FIRST" | "RESOLVE_ELIGIBILITY_FIRST";
}

export async function explainAnalysisResult(context: ExplanationContext): Promise<string> {
  // Deterministic fallback explanation
  if (!isGeminiConfigured()) {
    if (context.deterministicStatus === "MATCHED") {
      return `You satisfy this ${context.importance.toLowerCase()} requirement with verified profile evidence.`;
    }
    if (context.deterministicStatus === "UNKNOWN") {
      return `This ${context.importance.toLowerCase()} requirement could not be verified because information is missing from your profile. Adding this detail will enable deterministic evaluation.`;
    }
    if (context.importance === "PREFERRED") {
      return `This is a preferred qualification rather than a mandatory requirement. Its absence creates a competitiveness gap but does not block you from applying.`;
    }
    return `This mandatory requirement is currently unsatisfied based on your recorded profile history.`;
  }

  try {
    const gemini = getGeminiClient();
    if (!gemini) throw new Error("Gemini client unavailable");

    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 250,
      },
      systemInstruction: `
You are the APTLY Explanation Assistant.
Explain the deterministic eligibility outcome in 2 concise sentences for the student.
Never alter the importance, status, or decision provided in the context.
`,
    });

    const prompt = `Explain this deterministic result to the student:
Requirement: ${context.requirementTitle} ("${context.sourceText}")
Importance: ${context.importance}
Status: ${context.deterministicStatus}
Profile Evidence: ${context.profileEvidenceText || "None"}
Gap Priority: ${context.gapPriority || "N/A"}
Apply Decision: ${context.applyDecision || "N/A"}`;

    const res = await model.generateContent(prompt);
    return res.response.text().trim();
  } catch (error) {
    console.error("Gemini explain error:", error);
    return `This ${context.importance.toLowerCase()} requirement was evaluated as ${context.deterministicStatus} by the deterministic engine.`;
  }
}
