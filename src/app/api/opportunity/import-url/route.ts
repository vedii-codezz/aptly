import { NextRequest, NextResponse } from "next/server";
import { assertSafePublicUrl } from "@/lib/opportunity/urlSafety";
import { extractOpportunityHtml } from "@/lib/opportunity/extractHtml";
export const runtime = "nodejs";
const MAX_REDIRECTS = 3;
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    let current = await assertSafePublicUrl(url);
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(current, { redirect: "manual", signal: controller.signal, headers: { "User-Agent": "AptlyOpportunityImporter/1.0 (+public-listing-import)" } }); clearTimeout(timeout);
      if ([301,302,303,307,308].includes(response.status)) { const next = response.headers.get("location"); if (!next || redirects === MAX_REDIRECTS) throw new Error("REDIRECT_LIMIT"); current = await assertSafePublicUrl(new URL(next, current).href); continue; }
      if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "PAGE_NOT_PUBLIC" : "FETCH_FAILED");
      if (!response.headers.get("content-type")?.includes("text/html")) throw new Error("UNSUPPORTED_CONTENT");
      const html = (await response.text()).slice(0, 750000); const extracted = extractOpportunityHtml(html);
      if (extracted.text.length < 200) throw new Error("NO_OPPORTUNITY_CONTENT");
      return NextResponse.json({ success: true, data: { ...extracted, sourceUrl: url, resolvedUrl: current.href, importedAt: new Date().toISOString() } });
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "IMPORT_FAILED";
    return NextResponse.json({ success: false, error: code }, { status: code === "INVALID_URL" || code === "UNSAFE_URL" ? 400 : 422 });
  }
}
