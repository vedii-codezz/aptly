import assert from 'node:assert/strict';
import { summarizeMandatoryEligibility } from './eligibility/summary';
import { matchResumeRequirement } from './resume/requirementMatcher';
import { parseResumeText } from './resume/parser';
import { requirementAction } from './eligibility/recommendations';
import { OpportunityRequirement, RequirementStatus } from '@/types/opportunity';
import { buildImprovementPlans } from './improvement/engine';
import { evaluateEligibility } from './eligibility/engine';
import { buildStrategyPlan } from './improvement/engine';
import { defaultStudentProfile } from '../data/demo/defaultProfile';
import { sampleOpportunities } from '../data/demo/opportunities';
import { evaluateResumeFit } from './resume/engine';
import { evaluateATSFit } from './ats/engine';
import { defaultDemoResumeDocument } from '../data/demo/demoResume';

const profile = structuredClone(defaultStudentProfile);
const opportunity = structuredClone(sampleOpportunities[0]);
const analysis = evaluateEligibility(profile, opportunity);
assert.equal(analysis.verdict.verdict, 'POSSIBLY_ELIGIBLE');
assert.doesNotMatch(analysis.nextBestActions.map(a => a.why).join(' '), /hard eligibility requirements are satisfied/i);
const partialOpportunity = structuredClone(opportunity);
partialOpportunity.requirements = [opportunity.requirements.find(r => r.category === 'SKILL')!];
profile.skills = profile.skills.map(s => ({ ...s, evidence: [] }));
const partial = evaluateEligibility(profile, partialOpportunity);
assert.equal(partial.evaluatedRequirements[0].status, 'PARTIAL');
assert.equal(partial.verdict.verdict, 'POSSIBLY_ELIGIBLE');
assert.notEqual(buildStrategyPlan(partial, partialOpportunity, profile).applyDecision.decision, 'APPLY_NOW');
console.log('REPORT INTEGRITY: initial mandatory regression checks passed');

const degree = analysis.evaluatedRequirements.find(r => r.category === 'EDUCATION')!;
const degreeFit = evaluateResumeFit(analysis, defaultStudentProfile, defaultDemoResumeDocument).traces.find(t => t.requirementId === degree.id)!;
assert.notEqual(degreeFit.resumeState, 'NOT_COMMUNICATED', 'Degree recognized by ATS must also be present in Resume Fit');
const locations = evaluateResumeFit(analysis, defaultStudentProfile, defaultDemoResumeDocument).traces.flatMap(t => t.resumeEvidenceLocations);
assert.ok(locations.every(l => defaultDemoResumeDocument.rawText.includes(l.snippet)), 'All evidence snippets must be verbatim document text');
assert.ok(evaluateATSFit(analysis, defaultStudentProfile, defaultDemoResumeDocument).terms.length > 0);
const locationTrace = evaluateResumeFit(analysis, defaultStudentProfile, defaultDemoResumeDocument).traces.find(t => t.requirementTitle.includes('Availability'))!;
assert.doesNotMatch(locationTrace.actionRecommendation || '', /project bullet/i, 'Location advice must not prescribe project bullets');

let passed = 0;
function test(name: string, run: () => void) { run(); passed++; console.log(`PASS: ${name}`); }
const withStatus = (statuses: RequirementStatus[]) => statuses.map((status, i) => ({ ...degree, id: `mandatory-${i}`, status, importance: 'MANDATORY' as const }));
for (const [name, statuses, expected] of [
  ['mandatory GPA UNKNOWN', ['UNKNOWN'], false],
  ['mandatory FAILED plus UNKNOWN', ['FAILED', 'UNKNOWN'], false],
  ['all mandatory MATCHED', ['MATCHED', 'MATCHED'], true],
  ['mandatory PARTIAL', ['PARTIAL', 'MATCHED'], false],
  ['empty mandatory set preserves uncertainty', [], false],
] as Array<[string, RequirementStatus[], boolean]>) {
  test(name, () => {
    const requirements = withStatus(statuses);
    const summary = summarizeMandatoryEligibility(requirements);
    assert.equal(summary.allMatched, expected);
    if (!expected) assert.doesNotMatch(summary.message, /are satisfied/);
    const data = { ...analysis, evaluatedRequirements: requirements };
    const strategy = buildStrategyPlan(data, opportunity, defaultStudentProfile);
    assert.equal(strategy.applyDecision.decision === 'APPLY_NOW', expected);
  });
}
test('FAILED takes precedence over UNKNOWN', () => assert.match(summarizeMandatoryEligibility(withStatus(['FAILED', 'UNKNOWN'])).message, /not satisfied/));
test('UNKNOWN GPA agreement across engine, WHY, Gaps and Strategy', () => {
  const req = analysis.evaluatedRequirements.find(r => r.category === 'GPA')!;
  assert.equal(req.status, 'UNKNOWN');
  assert.equal(analysis.requirementTraces.find(t => t.requirementId === req.id)?.decision.status, 'UNKNOWN');
  assert.equal(buildStrategyPlan(analysis, opportunity, defaultStudentProfile).readinessState, 'NEEDS_INFORMATION');
  assert.ok(buildImprovementPlans(analysis, opportunity, defaultStudentProfile).some(p => p.requirementId === req.id && p.type === 'INFORMATION'));
});
const eduReq: OpportunityRequirement = { ...degree, normalizedValue: { degreeLevels: ['Bachelor'], fieldsOfStudy: ['Computer Science'] } };
for (const [name, text, presence, qualification] of [
  ['degree present with supporting field', 'EDUCATION\nBachelor of Science in Computer Science', 'PRESENT', 'SUPPORTED'],
  ['degree absent', 'SUMMARY\nInterested in software engineering', 'NOT_FOUND', 'UNVERIFIED'],
  ['degree mentioned but insufficient', 'EDUCATION\nBachelor of Arts in History', 'PRESENT', 'INSUFFICIENT'],
  ['empty document cannot be verified', '', 'UNVERIFIABLE', 'UNVERIFIED'],
] as const) test(name, () => {
  const match = matchResumeRequirement(eduReq, parseResumeText(text));
  assert.equal(match.presence, presence); assert.equal(match.qualification, qualification);
  assert.ok(match.locations.every(l => text.includes(l.snippet)));
});
const skillReq: OpportunityRequirement = { ...degree, id: 'skill-cpp', category: 'SKILL', title: 'C++', sourceText: 'C++ required', normalizedValue: { requiredSkills: ['C++'] } };
test('skill listed only in Skills is a mention without implementation proof', () => {
  const match = matchResumeRequirement(skillReq, parseResumeText('SKILLS\nC++'));
  assert.equal(match.presence, 'PRESENT'); assert.equal(match.qualification, 'INSUFFICIENT');
});
test('skill backed by project context', () => {
  const match = matchResumeRequirement(skillReq, parseResumeText('PROJECTS\nBuilt a parser using C++ with regression tests.'));
  assert.equal(match.presence, 'PRESENT'); assert.equal(match.qualification, 'SUPPORTED');
});
test('C++ matching does not treat C as C++', () => assert.equal(matchResumeRequirement(skillReq, parseResumeText('SKILLS\nC and Rust')).presence, 'NOT_FOUND'));
test('arbitrary normalized skills and regex punctuation match safely', () => {
  const req = { ...skillReq, normalizedValue: { requiredSkills: ['C#', 'Node.js'] } };
  assert.equal(matchResumeRequirement(req, parseResumeText('SKILLS\nC# and Node.js')).presence, 'PRESENT');
});
const locReq = analysis.evaluatedRequirements.find(r => r.category === 'LOCATION')!;
test('location unknown asks for verification', () => {
  const noLocation = structuredClone(defaultStudentProfile); noLocation.location = undefined;
  const result = evaluateEligibility(noLocation, opportunity);
  assert.equal(result.evaluatedRequirements.find(r => r.id === locReq.id)?.status, 'UNKNOWN');
  const plan = buildImprovementPlans(result, opportunity, noLocation).find(p => p.requirementId === locReq.id)!;
  assert.equal(plan.type, 'INFORMATION'); assert.doesNotMatch(JSON.stringify(plan), /project bullet/i);
});
test('on-site mention does not establish availability', () => {
  const match = matchResumeRequirement(locReq, parseResumeText('SUMMARY\nBengaluru, India'));
  assert.equal(match.presence, 'PRESENT'); assert.equal(match.qualification, 'UNVERIFIED');
});
test('unrelated country does not imply requested city', () => assert.equal(matchResumeRequirement({ ...locReq, normalizedValue: { locations: ['Bengaluru'] } }, parseResumeText('SUMMARY\nIndia')).presence, 'NOT_FOUND'));
test('graduation year is read from source without fixed candidate years', () => {
  const req = { ...degree, category: 'GRADUATION' as const };
  const text = 'EDUCATION\nExpected graduation: June 2032';
  const match = matchResumeRequirement(req, parseResumeText(text));
  assert.equal(match.presence, 'PRESENT'); assert.ok(match.locations.every(l => text.includes(l.snippet)));
  assert.ok(match.locations.some(l => l.snippet.includes('2032')));
});
test('GPA mention below threshold remains presence, not qualification', () => {
  const req = { ...degree, category: 'GPA' as const, normalizedValue: { minGpa: 8, gpaScale: 10 } };
  const match = matchResumeRequirement(req, parseResumeText('EDUCATION\nCGPA: 6.5/10'));
  assert.equal(match.presence, 'PRESENT'); assert.equal(match.qualification, 'UNVERIFIED');
});
for (const category of ['EDUCATION', 'GPA', 'GRADUATION', 'LOCATION', 'EXPERIENCE', 'DOCUMENT', 'OTHER'] as const) test(`${category} advice matches category`, () => {
  const advice = requirementAction({ ...degree, category });
  assert.doesNotMatch(advice, /project bullet|rewrite.*technology/i);
});
test('UNKNOWN skill asks for information instead of prescribing a project', () => assert.match(requirementAction({ ...skillReq, status: 'UNKNOWN' }), /missing information/));
test('ATS and Resume Fit agree on presence for present, absent and insufficient degree', () => {
  for (const text of ['EDUCATION\nBachelor of Science in Computer Science', 'SUMMARY\nSoftware developer', 'EDUCATION\nBachelor of Arts in History']) {
    const doc = parseResumeText(text);
    const data = { ...analysis, evaluatedRequirements: [eduReq] };
    const fit = evaluateResumeFit(data, defaultStudentProfile, doc).traces[0];
    const ats = evaluateATSFit(data, defaultStudentProfile, doc).terms[0];
    assert.deepEqual(fit.documentMatch, ats.documentMatch);
    assert.equal(ats.presentInResume, fit.resumeState !== 'NOT_COMMUNICATED');
  }
});
test('all evidence snippets are verbatim and traceable to document', () => {
  const fit = evaluateResumeFit(analysis, defaultStudentProfile, defaultDemoResumeDocument);
  assert.ok(fit.traces.flatMap(t => t.resumeEvidenceLocations).every(l => defaultDemoResumeDocument.rawText.includes(l.snippet)));
});
test('no unqualified resume-ready conclusion for mandatory PARTIAL', () => {
  const data = { ...analysis, evaluatedRequirements: withStatus(['PARTIAL']) };
  assert.notEqual(evaluateResumeFit(data, defaultStudentProfile, defaultDemoResumeDocument).fixDecision.decision, 'RESUME_READY');
});
test('unverified mandatory information is not classified as a need to build projects', () => {
  const data = { ...analysis, evaluatedRequirements: [{ ...degree, category: 'GPA' as const, status: 'UNKNOWN' as const }] };
  const decision = evaluateResumeFit(data, defaultStudentProfile, parseResumeText('EDUCATION\nCGPA: 8.5/10')).fixDecision;
  assert.equal(decision.decision, 'VERIFY_REQUIRED_INFORMATION');
  assert.equal(decision.targetWindow, 'PROFILE');
});
test('report strengths and weaknesses reflect current requirements', () => {
  assert.ok(analysis.strengths.every(s => analysis.evaluatedRequirements.some(r => r.title === s.title && r.status === 'MATCHED')));
  assert.ok(analysis.weakAreas.every(s => analysis.evaluatedRequirements.some(r => r.title === s.title && r.status !== 'MATCHED')));
});
console.log(`REPORT INTEGRITY: ${passed}/${passed} named tests passed`);
