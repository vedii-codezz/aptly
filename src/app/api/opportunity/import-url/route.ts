import { NextRequest, NextResponse } from "next/server";
import { importOpportunityUrl } from "@/lib/opportunity/importer";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    return NextResponse.json({ success: true, data: await importOpportunityUrl(url) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "IMPORT_FAILED";
    const messages: Record<string, string> = { INVALID_URL: "Enter a public HTTP or HTTPS link.", UNSAFE_URL: "This link can't be imported.", FETCH_TIMEOUT: "This page took too long to respond.", CONTENT_TOO_LARGE: "This page is too large to import safely.", UNSUPPORTED_CONTENT: "This link does not contain a public HTML listing.", PAGE_NOT_PUBLIC: "APTLY couldn't read this public page directly.", NO_OPPORTUNITY_CONTENT: "No opportunity content was found. Paste the description instead." };
    return NextResponse.json({ success: false, code, message: messages[code] || "APTLY couldn't import this page. Paste the description instead." }, { status: code === "INVALID_URL" || code === "UNSAFE_URL" ? 400 : 422 });
  }
}
