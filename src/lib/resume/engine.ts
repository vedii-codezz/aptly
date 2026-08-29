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

    // Check where it appears in resume
    const locations: RequirementResumeTrace["resumeEvidenceLocations"] = [];

    const reqTextLower = (req.title + " " + req.sourceText).toLowerCase();

    // Check skills mentioned in requirement
    const skillsInReq = ["Python", "C++", "React", "SQL", "TypeScript", "PyTorch", "JavaScript", "Linux", "Git"].filter(
      (s) => new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(reqTextLower)
    );

    resume.sections.forEach((sec) => {
      if (req.category === "SKILL" || skillsInReq.length > 0) {
        skillsInReq.forEach((s) => {
          const escaped = s.replace("+", "\\+");
          if (new RegExp(`\\b${escaped}\\b`, "i").test(sec.content)) {
            const matchLine = sec.rawLines.find((l) => new RegExp(`\\b${escaped}\\b`, "i").test(l)) || sec.content.slice(0, 100);
            if (!locations.some((loc) => loc.snippet === matchLine)) {
              locations.push({ sectionType: sec.type, snippet: matchLine });
            }
          }
        });
      }

      if (req.category === "GRADUATION") {
        if (sec.type === "EDUCATION" && /2029/i.test(sec.content)) {
          locations.push({ sectionType: sec.type, snippet: "Expected Graduation: May 2029" });
        }
      } else if (req.category === "GPA") {
        if (sec.type === "EDUCATION" && /\b(cgpa|gpa|8\.\d|9\.\d)\b/i.test(sec.content)) {
          locations.push({ sectionType: sec.type, snippet: sec.content });
        }
      } else if (req.importance === "BONUS") {
        if (sec.type === "ACHIEVEMENTS" && /hackathon|codesprint|winner|finalist/i.test(sec.content)) {
          locations.push({ sectionType: sec.type, snippet: sec.rawLines[0] || sec.content });
        }
      }
    });

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

    const isProfileStrong = profileEvidence === "STRONG" || profileEvidence === "MODERATE";
    const isProfileResumeDisconnect = isProfileStrong && (resumeState === "NOT_COMMUNICATED" || resumeState === "PARTIALLY_COMMUNICATED");

    let communicationVerdict = "No resume evidence found.";
    if (resumeState === "CLEARLY_COMMUNICATED") {
      communicationVerdict = "Clearly demonstrated across resume sections with project context.";
    } else if (resumeState === "PARTIALLY_COMMUNICATED") {
      communicationVerdict = "Claimed in skills list, but lacking verifiable implementation detail in project bullets.";
    }

    if (isProfileResumeDisconnect) {
      disconnects.push({
        id: `disc-${req.id}`,
        requirementTitle: req.title,
        profileStrength: profileEvidence,
        resumeStatus: resumeState,
        whyItMatters: `You have demonstrable ${profileEvidence} evidence in your candidate profile, but your resume ${
          resumeState === "PARTIALLY_COMMUNICATED" ? "only lists it in a skill list without project context" : "omits it completely"
        }.`,
        howToFix: `Add a dedicated project bullet or rewrite an existing bullet to highlight your ${req.title} work.`,
      });
    }

    traces.push({
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
      actionRecommendation: isProfileResumeDisconnect
        ? "Rewrite project bullet to explicitly mention this technology."
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
  let fixReasoning = "Your resume directly reflects your verified technical background and satisfies mandatory opportunity requirements.";
  let targetAction = "Review Application Strategy";
  let targetWindow: ResumeFitAnalysis["fixDecision"]["targetWindow"] = "STRATEGY";

  if (disconnects.length > 0) {
    fixDecisionState = "FIX_KEY_EVIDENCE_FIRST";
    fixBadge = "FIX KEY EVIDENCE FIRST";
    fixHeadline = "Profile Evidence Exists but Resume Doesn't Show It";
    fixReasoning = `You have strong candidate evidence in your background for ${disconnects[0]?.requirementTitle}, but your resume does not communicate it clearly. Update the project bullets before submitting.`;
    targetAction = "Inspect & Fix Resume Bullets";
    targetWindow = "RESUME";
  } else if (analysis.verdict.stats.mandatoryFailed > 0 || analysis.verdict.stats.mandatoryUnknown > 0) {
    fixDecisionState = "BUILD_REAL_EVIDENCE_FIRST";
    fixBadge = "BUILD REAL EVIDENCE FIRST";
    fixHeadline = "Missing Genuine Evidence for Required Qualifications";
    fixReasoning = "Do not add keywords to your resume to game ATS screening. Complete actionable project roadmaps in APTLY/IMPROVE first.";
    targetAction = "Open APTLY/IMPROVE";
    targetWindow = "IMPROVE";
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
