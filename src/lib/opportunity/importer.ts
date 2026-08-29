import { assertSafePublicUrl, DnsLookup } from "./urlSafety";
import { extractOpportunityHtml } from "./extractHtml";

export const MAX_RESPONSE_BYTES = 750_000;
const MAX_REDIRECTS = 3;
export type ImportDependencies = { fetcher?: typeof fetch; resolve?: DnsLookup; timeoutMs?: number };

async function readLimitedText(response: Response) {
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_RESPONSE_BYTES) throw new Error("CONTENT_TOO_LARGE");
  if (!response.body) return "";
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_RESPONSE_BYTES) { await reader.cancel(); throw new Error("CONTENT_TOO_LARGE"); } chunks.push(value); }
  const merged = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; } return new TextDecoder().decode(merged);
}

export async function importOpportunityUrl(value: string, deps: ImportDependencies = {}) {
  const fetcher = deps.fetcher || fetch; const timeoutMs = deps.timeoutMs ?? 12_000;
  let current = await assertSafePublicUrl(value, deps.resolve);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try { response = await fetcher(current, { redirect: "manual", signal: controller.signal, headers: { "User-Agent": "AptlyOpportunityImporter/1.0 (+public-listing-import)" } }); }
    catch (error: any) { throw new Error(error?.name === "AbortError" || controller.signal.aborted ? "FETCH_TIMEOUT" : "FETCH_FAILED"); }
    finally { clearTimeout(timeout); }
    if ([301, 302, 303, 307, 308].includes(response.status)) { const next = response.headers.get("location"); if (!next || redirects === MAX_REDIRECTS) throw new Error("REDIRECT_LIMIT"); current = await assertSafePublicUrl(new URL(next, current).href, deps.resolve); continue; }
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "PAGE_NOT_PUBLIC" : "FETCH_FAILED");
    if (!response.headers.get("content-type")?.includes("text/html")) throw new Error("UNSUPPORTED_CONTENT");
    const html = await readLimitedText(response); const extracted = extractOpportunityHtml(html);
    if (extracted.text.length < 200) throw new Error("NO_OPPORTUNITY_CONTENT");
    return { ...extracted, sourceUrl: value, resolvedUrl: current.href, importedAt: new Date().toISOString() };
  }
  throw new Error("REDIRECT_LIMIT");
}
