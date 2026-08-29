import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { OPPORTUNITY_EXTRACTION_SYSTEM_PROMPT } from "@/lib/gemini/prompts/opportunity";
import { OpportunityExtractionSchema } from "@/lib/gemini/schemas/opportunity";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Opportunity listing text is required." }, { status: 400 });
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json({
        success: false,
        offlineMode: true,
        error: "GEMINI_API_KEY not configured. Using deterministic offline sample opportunities.",
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
        temperature: 0.15,
      },
      systemInstruction: OPPORTUNITY_EXTRACTION_SYSTEM_PROMPT,
    });

    const prompt = `Extract all opportunity metadata and discrete requirements from this listing text:\n\n"""\n${text}\n"""\n\nReturn valid JSON matching the schema.`;
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    const parsedJson = JSON.parse(rawResponse);
    const validated = OpportunityExtractionSchema.parse(parsedJson);

    return NextResponse.json({
      success: true,
      data: validated,
    });
  } catch (error: any) {
    console.error("Gemini opportunity extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to extract opportunity requirements with Gemini.",
        offlineMode: true,
      },
      { status: 500 }
    );
  }
}
