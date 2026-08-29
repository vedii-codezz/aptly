import { NextRequest, NextResponse } from "next/server";
import { explainAnalysisResult, ExplanationContext } from "@/lib/gemini/explanation";

export async function POST(req: NextRequest) {
  try {
    const body: ExplanationContext = await req.json();

    if (!body.requirementTitle) {
      return NextResponse.json({ success: false, error: "Requirement title is required." }, { status: 400 });
    }

    const explanation = await explainAnalysisResult(body);

    return NextResponse.json({
      success: true,
      data: {
        explanation,
        trustTag: "INTERPRETATION",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate explanation.",
      },
      { status: 500 }
    );
  }
}
