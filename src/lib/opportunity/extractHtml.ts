const decode = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export function extractOpportunityHtml(html: string) {
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const scripts = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  let structured = "";
  for (const script of scripts) {
    try {
      const values = Array.isArray(JSON.parse(script[1])) ? JSON.parse(script[1]) : [JSON.parse(script[1])];
      const job = values.find((item: any) => item?.["@type"] === "JobPosting");
      if (job) structured += [job.title, job.description, job.qualifications, job.responsibilities, job.skills, job.experienceRequirements, job.educationRequirements, job.employmentType].filter(Boolean).join("\n");
    } catch { /* fall back to readable HTML */ }
  }
  const cleaned = html.replace(/<(script|style|noscript|svg|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const body = decode(cleaned.match(/<(main|article)[^>]*>([\s\S]*?)<\/\1>/i)?.[2] || cleaned);
  const text = `${structured}\n${body}`.replace(/\n{3,}/g, "\n\n").slice(0, 50000).trim();
  return { title, text };
}
