import { AnalysisResult } from "@/types/analysis";
import { StudentProfile } from "@/types/profile";
import { ResumeDocument } from "@/types/resume";
import {
  ATSAnalysisResult,
  ATSTermAnalysis,
  ATSStructuralRisk,
  ATSReadiness,
  ATSTermImportance,
} from "@/types/ats";

export function evaluateATSFit(
  analysis: AnalysisResult,
  profile: StudentProfile,
  resume: ResumeDocument
): ATSAnalysisResult {
  const terms: ATSTermAnalysis[] = [];
  const structuralRisks: ATSStructuralRisk[] = [];

  // 1. Terminology Analysis from Opportunity Requirements
  analysis.evaluatedRequirements.forEach((req) => {
    const traceData = analysis.requirementTraces.find((t) => t.requirementId === req.id);
    const profileEvidence = traceData?.evidenceTrace.evidenceStrength || "NOT_FOUND";
    const isProfileStrong = profileEvidence === "STRONG" || profileEvidence === "MODERATE";

    let termName = req.title
      .replace(/Proficiency in\s+/i, "")
      .replace(/Understanding of\s+/i, "")
      .replace(/Experience with\s+/i, "");

    if (req.category === "GRADUATION") termName = "Graduation Cohort (2029)";
    if (req.category === "GPA") termName = "Academic CGPA";
    if (req.category === "LOCATION") termName = "On-Site Availability";

    const importance: ATSTermImportance =
      req.importance === "MANDATORY"
        ? "REQUIRED"
        : req.importance === "PREFERRED"
        ? "HIGHLY_RELEVANT"
        : "SUPPORTING";

    const reqTextLower = (req.title + " " + req.sourceText).toLowerCase();
    const skillsInReq = ["Python", "C++", "React", "SQL", "TypeScript", "PyTorch", "JavaScript", "Linux", "Git"].filter(
      (s) => new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(reqTextLower)
    );

    let isPresent = false;

    if (req.category === "GRADUATION") {
      isPresent = resume.education.some((e) => e.graduationYear === 2029) || /2029/i.test(resume.rawText);
    } else if (req.category === "GPA") {
      isPresent = /\b(cgpa|gpa|8\.\d|9\.\d)\b/i.test(resume.rawText);
    } else if (req.category === "EDUCATION") {
      isPresent = /bachelor|computer science|b\.tech|engineering/i.test(resume.rawText);
    } else if (req.category === "LOCATION") {
      isPresent = /bengaluru|bangalore|india|on-site/i.test(resume.rawText);
    } else if (req.title.toLowerCase().includes("data structures")) {
      isPresent = /data structures|algorithms|dsa/i.test(resume.rawText);
    } else if (skillsInReq.length > 0) {
      isPresent = skillsInReq.some(
        (s) =>
          resume.detectedSkills.some((ds) => ds.skill.toLowerCase() === s.toLowerCase()) ||
          new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(resume.rawText)
      );
    } else {
      isPresent = new RegExp(`\\b${termName.replace("+", "\\+")}\\b`, "i").test(resume.rawText);
    }

    const occurrences = isPresent ? 1 : 0;
    const matchingSections = resume.sections
      .filter((s) => new RegExp(`\\b${termName.replace("+", "\\+")}\\b`, "i").test(s.content))
      .map((s) => s.title);

    // Anti-Keyword Stuffing Recommendation Guardrail
    let recommendation = "Term is clearly represented in resume context.";
    let actionTarget: ATSTermAnalysis["actionTarget"] = undefined;

    if (!isPresent) {
      if (isProfileStrong) {
        recommendation = `You have strong candidate evidence for ${termName} in your profile history, but it is omitted from the resume. Add it to your project bullets.`;
        actionTarget = { window: "RESUME" };
      } else {
        recommendation = `Do NOT add "${termName}" solely for keyword screening. No verifiable project evidence was detected in your profile. Build genuine evidence first.`;
        actionTarget = { window: "IMPROVE", planId: "plan-skill-0" };
      }
    }

    terms.push({
      term: termName,
      importance,
      presentInResume: isPresent,
      resumeOccurrences: occurrences,
      resumeSections: matchingSections,
      profileEvidenceStrength: profileEvidence,
      recommendation,
      actionTarget,
    });
  });

  // 2. Structural Parsing Checks
  const hasEducation = resume.sections.some((s) => s.type === "EDUCATION");
  const hasSkills = resume.sections.some((s) => s.type === "SKILLS");
  const hasProjects = resume.sections.some((s) => s.type === "PROJECTS");

  if (!hasEducation) {
    structuralRisks.push({
      id: "risk-missing-edu",
      severity: "HIGH",
      category: "HEADING",
      title: "Missing Education Section Heading",
      issueDescription: "No section clearly marked 'EDUCATION' was identified by the parser.",
      suggestedFix: "Add a standard 'EDUCATION' section heading with degree and expected graduation year.",
    });
  }

  if (!hasSkills) {
    structuralRisks.push({
      id: "risk-missing-skills",
      severity: "MEDIUM",
      category: "HEADING",
      title: "Missing Dedicated Technical Skills Section",
      issueDescription: "No dedicated skills section found. Automated parsers search for explicit skill categories.",
      suggestedFix: "Add a 'TECHNICAL SKILLS' section categorized by languages, frameworks, and tools.",
    });
  }

  // Non-standard section headings warning
  resume.parseWarnings.forEach((warning, idx) => {
    if (warning.includes("Non-standard section heading")) {
      structuralRisks.push({
        id: `risk-heading-${idx}`,
        severity: "MEDIUM",
        category: "HEADING",
        title: "Non-Standard Section Naming",
        issueDescription: warning,
        suggestedFix: "Replace informal heading with standard industry terminology (e.g. 'PROJECTS').",
      });
    } else if (warning.includes("GitHub")) {
      structuralRisks.push({
        id: `risk-github-${idx}`,
        severity: "LOW",
        category: "CONTACT_LINKS",
        title: "Missing Public Repository Link",
        issueDescription: "Your profile contains public GitHub projects, but no repository link was detected in your contact header.",
        suggestedFix: "Add your GitHub profile URL (e.g. github.com/username) to your contact header.",
      });
    }
  });

  // 3. ATS Readiness Calculation
  const requiredTerms = terms.filter((t) => t.importance === "REQUIRED");
  const requiredMatched = requiredTerms.filter((t) => t.presentInResume).length;
  const preferredTerms = terms.filter((t) => t.importance === "HIGHLY_RELEVANT");
  const preferredMatched = preferredTerms.filter((t) => t.presentInResume).length;

  let readinessState: ATSReadiness = "CLEAR";
  let headline = "Clean ATS Structure & Keyword Representation";
  let summary = "Core mandatory criteria and technical competencies are clearly formatted for standard parsing systems.";

  if (structuralRisks.some((r) => r.severity === "HIGH")) {
    readinessState = "STRUCTURAL_RISK";
    headline = "Potential Parsing Risks Detected";
    summary = "Essential section headings are missing or unformatted. Correct section names to prevent extraction failures.";
  } else if (requiredMatched < requiredTerms.length) {
    readinessState = "NEEDS_ATTENTION";
    headline = "Missing Required Screening Terminology";
    summary = `${requiredTerms.length - requiredMatched} mandatory term(s) are not clearly found in the resume.`;
  } else if (preferredMatched < preferredTerms.length) {
    readinessState = "MINOR_GAPS";
    headline = "Good Coverage with Minor Preferred Gaps";
    summary = `Mandatory qualifications are satisfied; ${preferredTerms.length - preferredMatched} preferred term(s) (e.g. SQL) are omitted.`;
  }

  return {
    opportunityId: analysis.verdict.headline,
    readinessState,
    readinessHeadline: headline,
    readinessSummary: summary,
    stats: {
      totalEvaluatedTerms: terms.length,
      requiredTermsMatched: requiredMatched,
      requiredTermsTotal: requiredTerms.length,
      preferredTermsMatched: preferredMatched,
      preferredTermsTotal: preferredTerms.length,
      structuralRisksCount: structuralRisks.length,
    },
    terms,
    structuralRisks,
    antiStuffingPolicy: {
      statement: "Anti-Keyword-Stuffing Policy: Do not artificially repeat terms or add unsupported claims.",
      guidingRule:
        "Modern screening systems and technical interviewers evaluate contextual evidence, project complexity, and verifiable work—not raw keyword counts.",
    },
  };
}
