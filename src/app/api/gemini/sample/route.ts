import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { LIVE_SAMPLE_SYSTEM_PROMPT } from "@/lib/gemini/prompts/sample";
import { LiveSampleSchema } from "@/lib/gemini/schemas/sample";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sampleType, projectOrContext, technology, targetRequirement } = body;

    if (!isGeminiConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          title: `${technology || "Technical"} Project Bullet`,
          category: sampleType || "RESUME_BULLET",
          disclaimer: "SAMPLE — ADAPT TO YOUR REAL EXPERIENCE",
          sampleText: `Engineered an attention-based ${technology || "Python"} pipeline; implemented modular data ingestion and unit tests to achieve observable accuracy.`,
          formulaUsed: "Action Verb + Concrete Work + Technology + Observable Result",
          breakdown: [
            { label: "Action Verb", text: "Engineered" },
            { label: "Concrete Work", text: "Modular data ingestion and attention sequence decoding" },
            { label: "Technology", text: technology || "Python / PyTorch" },
            { label: "Result", text: "Verified test accuracy without fabricated statistics" },
          ],
        },
      });
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return NextResponse.json({ success: false, error: "Failed to initialize Gemini." });
    }

    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.15,
      },
      systemInstruction: LIVE_SAMPLE_SYSTEM_PROMPT,
    });

    const prompt = `Generate a truthful, non-hallucinated sample:
Sample Type: ${sampleType || "RESUME_BULLET"}
Project / Context: ${projectOrContext || "General"}
Technology: ${technology || "Python"}
Target Requirement: ${targetRequirement || "Relevant Engineering Experience"}

Remember: NEVER invent fake percentages (e.g. 47%), fake revenue, or unstated metrics.
Return strictly valid JSON matching the schema.`;

    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    const parsedJson = JSON.parse(rawResponse);
    const validated = LiveSampleSchema.parse(parsedJson);

    // Post-generation validation & sanitization: remove fabricated metrics if none were in input context
    let sanitizedText = validated.sampleText;
    if (!projectOrContext?.match(/\d+%/)) {
      sanitizedText = sanitizedText.replace(/\b\d{1,3}%\s*(improvement|efficiency|faster|boost|increase)?/gi, "demonstrated performance improvements");
    }

    return NextResponse.json({
      success: true,
      data: {
        ...validated,
        sampleText: sanitizedText,
      },
    });
  } catch (error: any) {
    console.error("Gemini sample generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate sample with Gemini.",
      },
      { status: 500 }
    );
  }
}
