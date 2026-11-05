import { requirementAction } from '@/lib/eligibility/recommendations';
import { summarizeMandatoryEligibility } from '@/lib/eligibility/summary';
import { matchResumeRequirement } from './requirementMatcher';
import { AnalysisResult } from "@/types/analysis";
import { StudentProfile } from "@/types/profile";
import {
  ResumeDocument,
  ResumeFitAnalysis,
  RequirementResumeTrace,
  ClaimedEvidenceItem,
  ResumeRequirementState,
  FixDecisionState,
} from "@/types/resume";

export function evaluateResumeFit(
  analysis: AnalysisResult,
  profile: StudentProfile,
  resume: ResumeDocument
): ResumeFitAnalysis {
  const traces: RequirementResumeTrace[] = [];
  const disconnects: ResumeFitAnalysis["disconnects"] = [];

  // 1. Evaluate each requirement against Resume Content
  analysis.evaluatedRequirements.forEach((req) => {
    const traceData = analysis.requirementTraces.find((t) => t.requirementId === req.id);
    const profileEvidence = traceData?.evidenceTrace.evidenceStrength || "NOT_FOUND";
    const profileSummaryText = traceData?.evidenceTrace.matchedSummary || "No profile evidence recorded.";

    const documentMatch = matchResumeRequirement(req, resume);
    const locations = documentMatch.locations;

    const isPresentInSkills = locations.some((l) => l.sectionType === "SKILLS");
    const isPresentInProjectsOrExp = locations.some(
      (l) => l.sectionType === "PROJECTS" || l.sectionType === "EXPERIENCE" || l.sectionType === "ACHIEVEMENTS" || l.sectionType === "EDUCATION"
    );

    let resumeState: ResumeRequirementState = "NOT_COMMUNICATED";
    if (isPresentInSkills && isPresentInProjectsOrExp) {
      resumeState = "CLEARLY_COMMUNICATED";
    } else if (isPresentInProjectsOrExp) {
      resumeState = "CLEARLY_COMMUNICATED";
    } else if (isPresentInSkills) {
      resumeState = "PARTIALLY_COMMUNICATED"; // Listed in skills only, no project proof in resume
    }

    if (locations.length && resumeState === "NOT_COMMUNICATED") resumeState = "PARTIALLY_COMMUNICATED";
    if (req.category === "EDUCATION" && documentMatch.qualification === "INSUFFICIENT") resumeState = "PARTIALLY_COMMUNICATED";
    const isProfileStrong = req.status === "MATCHED" && (profileEvidence === "STRONG" || profileEvidence === "MODERATE");
    const isProfileResumeDisconnect = isProfileStrong && (resumeState === "NOT_COMMUNICATED" || resumeState === "PARTIALLY_COMMUNICATED");

    let communicationVerdict = "No resume evidence found.";
    if (resumeState === "CLEARLY_COMMUNICATED") {
      communicationVerdict = "Mentioned in the resume; document presence does not establish eligibility.";
    } else if (resumeState === "PARTIALLY_COMMUNICATED") {
      communicationVerdict = "Mentioned in the document, but supporting context is limited; qualification still requires verification.";
    }

    if (isProfileResumeDisconnect) {
      disconnects.push({
        id: `disc-${req.id}`,
        requirementTitle: req.title,
        profileStrength: profileEvidence,
        resumeStatus: resumeState,
        whyItMatters: `Your profile records ${profileEvidence} evidence, but your resume ${
          resumeState === "PARTIALLY_COMMUNICATED" ? "mentions it without sufficient requirement-specific context" : "omits it completely"
        }.`,
        howToFix: requirementAction(req),
      });
    }

    traces.push({
      documentMatch,
      requirementId: req.id,
      requirementTitle: req.title,
      importance: req.importance,
      profileEvidenceStrength: profileEvidence,
      profileSummary: profileSummaryText,
      resumeState,
      resumeEvidenceLocations: locations,
      communicationVerdict,
      isProfileResumeDisconnect,
      disconnectExplanation: isProfileResumeDisconnect
        ? "Verified in profile history, but insufficiently evidenced on resume."
        : undefined,
      actionRecommendation: resumeState !== "CLEARLY_COMMUNICATED"
        ? requirementAction(req)
        : undefined,
    });
  });

  // 2. Claimed Evidence Checker (for all skills claimed in resume)
  const claimedEvidence: ClaimedEvidenceItem[] = resume.detectedSkills.map((mention) => {
    const profSkill = profile.skills.find((s) => s.skill.toLowerCase() === mention.skill.toLowerCase());
    const strength = profSkill?.evidenceStrength || "NOT_FOUND";
    const hasProjects = Boolean(profSkill?.evidence.some((e) => e.source === "project"));
    const hasExp = Boolean(profSkill?.evidence.some((e) => e.source === "experience"));
    const hasGithub = Boolean(profSkill?.evidence.some((e) => e.source === "github"));

    const hasWarning = strength === "WEAK" || strength === "NOT_FOUND";

    return {
      skill: mention.skill,
      claimedInResume: true,
      resumeLocations: mention.sectionTypes,
      profileEvidenceStrength: strength,
      supportingSources: {
        skills: true,
        projects: hasProjects,
        experience: hasExp,
        github: hasGithub,
      },
      hasEvidenceWarning: hasWarning,
      warningMessage: hasWarning
        ? `Claimed in resume, but no verifiable implementation evidence detected in profile. Do not present "${mention.skill}" as a core competency unless you can defend it technically in an interview.`
        : undefined,
    };
  });

  // 3. Fix Decision State
  const mandatoryTotal = traces.filter((t) => t.importance === "MANDATORY").length;
  const mandatoryClearly = traces.filter((t) => t.importance === "MANDATORY" && t.resumeState === "CLEARLY_COMMUNICATED").length;
  const preferredTotal = traces.filter((t) => t.importance === "PREFERRED").length;
  const preferredClearly = traces.filter((t) => t.importance === "PREFERRED" && t.resumeState === "CLEARLY_COMMUNICATED").length;

  let fixDecisionState: FixDecisionState = "RESUME_READY";
  let fixBadge = "RESUME READY";
  let fixHeadline = "Resume Clearly Communicates Core Profile Fit";
  let fixReasoning = "Your resume communicates the evaluated mandatory requirements. Presence does not establish eligibility.";
  let targetAction = "Review Application Strategy";
  let targetWindow: ResumeFitAnalysis["fixDecision"]["targetWindow"] = "STRATEGY";

  if (disconnects.length > 0) {
    fixDecisionState = "FIX_KEY_EVIDENCE_FIRST";
    fixBadge = "FIX KEY EVIDENCE FIRST";
    fixHeadline = "Profile Evidence Exists but Resume Doesn't Show It";
    fixReasoning = `You have strong candidate evidence in your background for ${disconnects[0]?.requirementTitle}, but your resume does not communicate it clearly. Review the requirement-specific recommendation before submitting.`;
    targetAction = "Review Requirement Evidence";
    targetWindow = "RESUME";
  } else if (!summarizeMandatoryEligibility(analysis.evaluatedRequirements).allMatched || mandatoryClearly < mandatoryTotal) {
    fixDecisionState = "VERIFY_REQUIRED_INFORMATION";
    fixBadge = "VERIFY REQUIRED INFORMATION";
    fixHeadline = "Required Qualifications Need Verification";
    fixReasoning = summarizeMandatoryEligibility(analysis.evaluatedRequirements).message + " Review missing or incomplete document evidence without inventing claims.";
    targetAction = "Verify Profile Information";
    targetWindow = "PROFILE";
  }

  // 4. Collect inspected bullets
  const inspectedBullets = resume.projects.flatMap((p) => p.bullets);

  return {
    opportunityId: analysis.verdict.headline,
    resumeId: resume.id,
    stats: {
      mandatoryTotal,
      mandatoryClearlyCommunicated: mandatoryClearly,
      preferredTotal,
      preferredClearlyCommunicated: preferredClearly,
      totalSupportedClaims: claimedEvidence.filter((c) => !c.hasEvidenceWarning).length,
      disconnectCount: disconnects.length,
    },
    traces,
    claimedEvidence,
    inspectedBullets,
    fixDecision: {
      decision: fixDecisionState,
      badgeLabel: fixBadge,
      headline: fixHeadline,
      reasoning: fixReasoning,
      targetActionLabel: targetAction,
      targetWindow,
    },
    disconnects,
  };
}
