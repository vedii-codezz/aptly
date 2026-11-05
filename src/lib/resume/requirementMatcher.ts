import { OpportunityRequirement } from '@/types/opportunity';
import { ResumeDocument, ResumeSectionType } from '@/types/resume';

export interface ResumeRequirementMatch {
  requirementId: string;
  category: OpportunityRequirement['category'];
  presence: 'PRESENT' | 'NOT_FOUND' | 'UNVERIFIABLE';
  qualification: 'SUPPORTED' | 'INSUFFICIENT' | 'UNVERIFIED';
  confidence: 'HIGH' | 'LOW';
  locations: Array<{ sectionType: ResumeSectionType; sectionId?: string; snippet: string }>;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const contains = (text: string, term: string) => new RegExp(`(^|[^a-z0-9])${escape(term)}(?=$|[^a-z0-9])`, 'i').test(text);
const degreeText = /\b(bachelor|master|doctorate|phd|b\.?\s?tech|m\.?\s?tech|bsc|msc|b\.?s\.?|m\.?s\.?)\b/i;

/** Document evidence only. This never overrides the eligibility engine's decisions. */
export function matchResumeRequirement(req: OpportunityRequirement, resume: ResumeDocument): ResumeRequirementMatch {
  const constraint = req.normalizedValue;
  const source = `${req.title} ${req.sourceText}`;
  const skills = constraint?.requiredSkills?.length ? constraint.requiredSkills :
    ['Python', 'C++', 'React', 'SQL', 'TypeScript', 'PyTorch', 'JavaScript', 'Linux', 'Git', 'Data Structures', 'Algorithms'].filter(s => contains(source, s));
  const matches = (line: string): boolean => {
    switch (req.category) {
      case 'EDUCATION': return degreeText.test(line) || (constraint?.fieldsOfStudy || []).some(f => contains(line, f));
      case 'GRADUATION': return /\b(19|20)\d{2}\b/.test(line) && /graduat|expected|complet|\b(?:19|20)\d{2}\s*[-–]/i.test(line);
      case 'GPA': return /\b(?:c?gpa)\b/i.test(line);
      case 'LOCATION': return (constraint?.locations || []).some(l => contains(line, l)) || /\bon[- ]site\b|\brelocat|\bremote\b/i.test(line);
      case 'SKILL': return skills.some(s => contains(line, s));
      default: return contains(line, req.title) || (/hackathon/i.test(source) && /hackathon|codesprint|winner|finalist/i.test(line));
    }
  };
  const locations: ResumeRequirementMatch['locations'] = [];
  for (const sec of resume.sections) {
    for (const line of sec.content.split(/\r?\n/)) {
      if (line.trim() && resume.rawText.includes(line) && matches(line)) {
        locations.push({ sectionType: sec.type, sectionId: sec.id, snippet: line });
      }
    }
  }
  // Unclassified text still counts as a mention, without inventing a section or snippet.
  for (const line of resume.rawText.split(/\r?\n/)) {
    if (line.trim() && matches(line) && !locations.some(l => l.snippet === line)) locations.push({ sectionType: 'OTHER', snippet: line });
  }
  let qualification: ResumeRequirementMatch['qualification'] = 'UNVERIFIED';
  if (req.category === 'SKILL' && locations.length) {
    qualification = locations.some(l => ['PROJECTS', 'EXPERIENCE'].includes(l.sectionType)) ? 'SUPPORTED' : 'INSUFFICIENT';
  }
  if (req.category === 'EDUCATION' && locations.length) {
    const text = locations.map(l => l.snippet).join('\n');
    const aliases = (level: string) => /bachelor|undergraduate|b\.?tech/i.test(level) ? /bachelor|b\.?\s?tech|bsc|b\.?s\.?\b/i : /master|postgraduate|m\.?tech/i.test(level) ? /master|m\.?\s?tech|msc|m\.?s\.?\b/i : new RegExp(escape(level), 'i');
    const levels = constraint?.degreeLevels || [];
    const fields = constraint?.fieldsOfStudy || [];
    if (levels.length || fields.length) qualification =
      (!levels.length || levels.some(l => aliases(l).test(text))) && (!fields.length || fields.some(f => contains(text, f))) ? 'SUPPORTED' : 'INSUFFICIENT';
  }
  return { requirementId: req.id, category: req.category, presence: locations.length ? 'PRESENT' : resume.rawText.trim() ? 'NOT_FOUND' : 'UNVERIFIABLE', qualification, confidence: locations.length ? 'HIGH' : 'LOW', locations };
}
