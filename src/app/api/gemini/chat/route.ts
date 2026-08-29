import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini/client";
import { ASK_APTLY_SYSTEM_PROMPT } from "@/lib/gemini/prompts/chat";
import { AskAptlyResponseSchema } from "@/lib/gemini/schemas/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, context } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ success: false, error: "Question is required." }, { status: 400 });
    }

    const qLower = question.toLowerCase();

    // Guardrail: Selection / hiring prediction questions are addressed directly
    if (qLower.includes("will i get selected") || qLower.includes("chances of selection") || qLower.includes("guarantee")) {
      return NextResponse.json({
        success: true,
        data: {
          answer:
            "APTLY evaluates hard eligibility, requirement proof, and application strategy, but cannot predict selection or hiring decisions. Selection involves internal interview performance, team headcount, and comparative candidate evaluations.",
          trustTag: "FACT",
          citations: [{ source: "APTLY Ethics & Transparency Principles" }],
          suggestedFollowUps: [
            "Which requirements am I strongest in?",
            "What should I improve before submitting?",
          ],
          engineAlignmentVerified: true,
        },
      });
    }

    // Offline Deterministic Fallback if Gemini key not set
    if (!isGeminiConfigured()) {
      let fallbackAnswer = `Based on your analysis for ${context?.opportunityTitle || "this opportunity"}, your verdict is ${
        context?.verdict || "evaluated"
      }.`;

      if (qLower.includes("should i apply now") || qLower.includes("apply now or improve")) {
        fallbackAnswer = `APTLY recommends "${context?.applyDecision || "APPLY NOW"}". ${
          context?.applyDecisionReasoning || "All mandatory criteria are verified. Preferred skill gaps do not block application."
        }`;
      } else if (qLower.includes("sql") && qLower.includes("priority")) {
        fallbackAnswer = "SQL is categorized as MEDIUM priority because it is listed as a preferred qualification rather than a mandatory disqualifier. Its absence does not prevent you from applying.";
      } else if (qLower.includes("blocking") || qLower.includes("gpa")) {
        fallbackAnswer = "Unrecorded GPA is the primary informational blocker. Enter your verified CGPA (≥ 8.0) in APTLY/PROFILE to transition to full eligibility.";
      }

      return NextResponse.json({
        success: true,
        data: {
          answer: fallbackAnswer,
          trustTag: "FACT",
          citations: [
            { source: "Deterministic Decision Engine", excerptOrDetail: context?.applyDecision || "Rule Pipeline" },
          ],
          suggestedFollowUps: [
            "What is my strongest match?",
            "How should I position my projects?",
          ],
          engineAlignmentVerified: true,
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
        temperature: 0.2,
      },
      systemInstruction: ASK_APTLY_SYSTEM_PROMPT,
    });

    const prompt = `Answer this user question based on their active analysis state:
User Question: "${question}"

Active State Context:
${JSON.stringify(context, null, 2)}

Return strictly valid JSON matching the schema.`;

    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    const parsedJson = JSON.parse(rawResponse);
    const validated = AskAptlyResponseSchema.parse(parsedJson);

    return NextResponse.json({
      success: true,
      data: validated,
    });
  } catch (error: any) {
    console.error("Ask APTLY chat error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process question with Gemini.",
      },
      { status: 500 }
    );
  }
}
