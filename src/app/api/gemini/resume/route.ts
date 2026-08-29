import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { RESUME_ENRICHMENT_SYSTEM_PROMPT } from "@/lib/gemini/prompts/resume";
import { ResumeEnrichmentSchema } from "@/lib/gemini/schemas/resume";
import { parseResumeText } from "@/lib/resume/parser";
import { mergeResumeWithEnrichment } from "@/lib/resume/cautiousMerge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Resume text is required." }, { status: 400 });
    }

    // 1. Run deterministic parser first
    const deterministicResume = parseResumeText(text);

    // 2. If Gemini is not configured, return deterministic resume directly
    if (!isGeminiConfigured()) {
      return NextResponse.json({
        success: true,
        offlineMode: true,
        data: deterministicResume,
      });
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return NextResponse.json({
        success: true,
        offlineMode: true,
        data: deterministicResume,
      });
    }

    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
      systemInstruction: RESUME_ENRICHMENT_SYSTEM_PROMPT,
    });

    const prompt = `Analyze and enrich this resume text:\n\n"""\n${text}\n"""\n\nReturn valid JSON matching the schema.`;
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    const parsedJson = JSON.parse(rawResponse);
    const validated = ResumeEnrichmentSchema.parse(parsedJson);

    // 3. Cautious merge: exact text and deterministic sections take priority
    const enrichedResume = mergeResumeWithEnrichment(deterministicResume, validated);

    return NextResponse.json({
      success: true,
      data: enrichedResume,
    });
  } catch (error: any) {
    console.error("Gemini resume enrichment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to enrich resume with Gemini.",
        offlineMode: true,
      },
      { status: 500 }
    );
  }
}
