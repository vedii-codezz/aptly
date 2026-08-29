import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { PROFILE_EXTRACTION_SYSTEM_PROMPT } from "@/lib/gemini/prompts/profile";
import { ProfileExtractionSchema } from "@/lib/gemini/schemas/profile";
import { normalizeSkillName } from "@/lib/gemini/normalizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Profile text is required." }, { status: 400 });
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json({
        success: false,
        offlineMode: true,
        error: "GEMINI_API_KEY not configured. Deterministic offline demo mode remains active.",
      });
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return NextResponse.json({ success: false, offlineMode: true, error: "Failed to initialize Gemini client." });
    }

    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
      systemInstruction: PROFILE_EXTRACTION_SYSTEM_PROMPT,
    });

    const prompt = `Extract structured profile data from this student text:\n\n"""\n${text}\n"""\n\nReturn valid JSON matching the schema.`;
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    const parsedJson = JSON.parse(rawResponse);
    const validated = ProfileExtractionSchema.parse(parsedJson);

    // Normalize extracted skill names
    const normalizedSkills = validated.skills.map((s) => ({
      ...s,
      name: normalizeSkillName(s.name),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...validated,
        skills: normalizedSkills,
      },
    });
  } catch (error: any) {
    console.error("Gemini profile extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to extract profile with Gemini.",
        offlineMode: true,
      },
      { status: 500 }
    );
  }
}
