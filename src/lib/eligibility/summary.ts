import { OpportunityRequirement } from '@/types/opportunity';

/** Summarizes decisions already made by the deterministic eligibility engine. */
export function summarizeMandatoryEligibility(requirements: OpportunityRequirement[]) {
  const mandatory = requirements.filter(r => r.importance === 'MANDATORY');
  const count = (status: OpportunityRequirement['status']) => mandatory.filter(r => r.status === status).length;
  const matched = count('MATCHED'), failed = count('FAILED'), unknown = count('UNKNOWN'), partial = count('PARTIAL');
  const allMatched = mandatory.length > 0 && matched === mandatory.length;
  const message = failed > 0
    ? 'One or more mandatory requirements are not satisfied.'
    : partial > 0
    ? 'Mandatory requirements are not fully verified; eligibility requires verification.'
    : unknown > 0
    ? 'No confirmed mandatory failures; eligibility requires verification.'
    : allMatched
    ? 'All evaluated mandatory requirements are satisfied.'
    : 'No mandatory requirements were evaluated; eligibility cannot be confirmed.';
  return { total: mandatory.length, matched, failed, unknown, partial, allMatched, message };
}
