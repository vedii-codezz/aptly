import { OpportunityRequirement } from '@/types/opportunity';

export function requirementAction(req: OpportunityRequirement): string {
  const actions: Record<OpportunityRequirement['category'], string> = {
    SKILL: 'Show genuine implementation evidence in relevant projects or experience, if available. Add it to your project bullets only when supported by real work.',
    EDUCATION: 'Clarify your actual degree, field, institution and enrollment status in the Education section.',
    GPA: 'Verify your actual cumulative GPA and scale against your transcript; include accurate information where appropriate.',
    GRADUATION: 'Confirm your actual expected graduation date in the Education section.',
    LOCATION: 'Confirm your actual location and ability to meet the on-site or remote requirement. Do not assume willingness to relocate.',
    EXPERIENCE: 'Provide genuine work or project evidence appropriate to the experience requirement, including accurate dates.',
    DOCUMENT: 'Check the requested document and provide accurate supporting information.',
    OTHER: 'Review the source requirement and provide the missing information or genuine supporting documentation.',
  };
  return req.status === 'UNKNOWN' ? `Request and verify missing information for ${req.title}. ${req.category === 'SKILL' ? 'Confirm your actual experience before recommending new work.' : actions[req.category]}` : actions[req.category];
}
