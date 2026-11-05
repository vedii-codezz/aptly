import { requirementAction } from '@/lib/eligibility/recommendations';
import { summarizeMandatoryEligibility } from '@/lib/eligibility/summary';
import { AnalysisResult } from "@/types/analysis";
import { Opportunity } from "@/types/opportunity";
import { StudentProfile } from "@/types/profile";
import {
  ApplyDecisionState,
  ImprovementPlan,
  ProjectRecommendation,
  ResourceCategory,
  StrategyPlan,
} from "@/types/improvement";

/**
 * Deterministically constructs actionable improvement plans from active analysis gaps.
 * Strictly separates actionable skills from fixed/immutable eligibility constraints.
 */
export function buildImprovementPlans(
  analysis: AnalysisResult,
  opportunity: Opportunity,
  profile: StudentProfile
): ImprovementPlan[] {
  const plans: ImprovementPlan[] = [];

  // 1. Check for Fixed Constraints (e.g. Graduation Year out of bounds)
  const gradReq = analysis.evaluatedRequirements.find((r) => r.category === "GRADUATION");
  if (gradReq && gradReq.status === "FAILED") {
    const currentEdu = profile.education[0];
    const minYear = gradReq.normalizedValue?.minGradYear ?? 2027;
    const maxYear = gradReq.normalizedValue?.maxGradYear ?? 2029;
    const gradYear = currentEdu?.graduationYear ?? "Unknown";

    plans.push({
      id: "plan-fixed-grad",
      gapId: `el-gap-${gradReq.id}`,
      requirementId: gradReq.id,
      title: "Graduation Cohort Window (Fixed Constraint)",
      type: "FIXED_CONSTRAINT",
      priority: "CRITICAL",
      importance: "MANDATORY",
      actionable: false,
      whyItMatters: `This opportunity is restricted to students graduating between ${minYear} and ${maxYear}.`,
      sourceRequirementText: gradReq.sourceText,
      currentState: `Your graduation year is ${gradYear} (outside eligible window [${minYear}, ${maxYear}]).`,
      targetState: "Find opportunities matching your cohort year.",
      fixedConstraintExplanation:
        "This requirement cannot realistically be changed for this application. Do NOT attempt to 'fix' your graduation year. Recommended action: Look for similar opportunities matching your actual graduation year.",
      steps: [
        {
          stepNumber: "01",
          phase: "VERIFY",
          title: "Verify Cohort Policy",
          description: "Confirm if the organization allows exceptions for off-cycle graduation.",
          items: ["Check official FAQ for off-cycle candidates", "Verify if subsequent cohorts exist for your year"],
        },
      ],
      resources: [],
      completionCriteria: ["Acknowledge cohort boundary and redirect application efforts to matching opportunities"],
      canSimulateDemoEvidence: false,
    });
  }

  // 2. Check for Missing Mandatory Information (e.g. Unrecorded GPA)
  const gpaReq = analysis.evaluatedRequirements.find((r) => r.category === "GPA");
  if (gpaReq && gpaReq.status === "UNKNOWN") {
    plans.push({
      id: "plan-info-gpa",
      gapId: `app-gap-${gpaReq.id}`,
      requirementId: gpaReq.id,
      title: "Add Unrecorded Cumulative CGPA",
      type: "INFORMATION",
      priority: "HIGH",
      importance: "MANDATORY",
      actionable: true,
      whyItMatters: gpaReq.sourceText,
      sourceRequirementText: gpaReq.sourceText,
      currentState: "CGPA not recorded in profile record.",
      targetState: "Record verified transcript CGPA in profile (e.g. 8.5/10.0).",
      steps: [
        {
          stepNumber: "01",
          phase: "VERIFY",
          title: "Inspect Official Transcript",
          description: "Verify your latest cumulative grade point average on your institute portal.",
          items: ["Check university grade report", "Confirm scale is 10.0 or 4.0 equivalent"],
        },
        {
          stepNumber: "02",
          phase: "PROVE",
          title: "Update Profile Record",
          description: "Enter your verified GPA in APTLY/PROFILE.",
          items: ["Click 'ADD GPA' in Overview or Profile window", "Save to trigger deterministic re-evaluation"],
        },
      ],
      resources: [
        {
          category: "REFERENCE",
          title: "Transcript & Grade Verification",
          description: "Ensure official grade transcripts match entered metrics before submission.",
          suggestedTopics: ["Cumulative GPA calculation", "Equivalency percentage rules"],
        },
      ],
      completionCriteria: [
        "CGPA entered in APTLY/PROFILE",
        "Verify the recorded GPA and scale against the actual requirement",
        "Verdict transitions to YOU CAN APPLY",
      ],
      canSimulateDemoEvidence: false,
    });
  }

  // 3. Check for Skill Gaps (e.g. SQL Preferred Gap)
  const missingSkills = analysis.skillBreakdown.missingPreferredSkills.concat(
    analysis.skillBreakdown.missingMandatorySkills
  );

  missingSkills.forEach((skillGap, idx) => {
    const isSql = skillGap.skill.toLowerCase().includes("sql") || skillGap.skill.toLowerCase().includes("database");

    const projectRec: ProjectRecommendation = isSql
      ? {
          id: "proj-rec-sql-expense",
          title: "Expense & Query Analytics Lab",
          tagline: "PostgreSQL-backed application storing structured transaction streams with aggregation queries.",
          whyThisProject:
            "Addresses the preferred SQL requirement by demonstrating real schema normalization, multi-table joins, and query optimization without building an unnecessarily massive app.",
          targetSkill: "SQL / Relational Databases",
          estimatedHours: "8–12 hours",
          architecture: [
            "PostgreSQL relational database schema (Users, Accounts, Categories, Transactions)",
            "Node.js or Python backend driver (pg / psycopg2) with parameterized SQL queries",
            "Indexed transaction queries with EXPLAIN ANALYZE execution inspection",
          ],
          coreQueriesOrFeatures: [
            "Monthly expenditure breakdown with GROUP BY & HAVING",
            "Multi-table JOIN computing user balances across accounts",
            "Window function (RANK / OVER) identifying highest transaction per category",
          ],
          proofDeliverables: [
            "Public GitHub repository with schema.sql and seed data",
            "Clean README with architecture diagram and sample SQL query outputs",
            "Resume bullet: 'Engineered PostgreSQL-backed expense analytics service using complex JOINs and aggregations.'",
          ],
        }
      : {
          id: `proj-rec-${idx}`,
          title: `${skillGap.skill} Proof-of-Concept Project`,
          tagline: `Targeted implementation showcasing ${skillGap.skill} fundamentals.`,
          whyThisProject: `Provides verifiable repository and resume evidence for ${skillGap.skill}.`,
          targetSkill: skillGap.skill,
          estimatedHours: "6–10 hours",
          architecture: ["Core standard library implementation", "Unit test suite with 90%+ branch coverage"],
          coreQueriesOrFeatures: ["Functional pipeline", "Benchmark scripts"],
          proofDeliverables: ["Public GitHub repository", "Resume project bullet"],
        };

    const resources: ResourceCategory[] = [
      {
        category: "LEARN",
        title: `${skillGap.skill} Core Fundamentals`,
        description: "Conceptual foundations required by typical opportunity technical interviews.",
        suggestedTopics: skillGap.learnTopics,
      },
      {
        category: "PRACTICE",
        title: `${skillGap.skill} Hands-On Drills`,
        description: "Targeted problem sets and query challenges.",
        suggestedTopics: skillGap.practiceExercises,
      },
      {
        category: "BUILD",
        title: "Proof-of-Concept Project",
        description: "Small application where the technology is genuinely necessary.",
        suggestedTopics: [projectRec.title, "Architecture design", "Schema normalization"],
      },
      {
        category: "REFERENCE",
        title: "Documentation & Cheat Sheets",
        description: "Standard library references and syntax manuals.",
        suggestedTopics: ["Official Documentation", "Performance Tuning Guide"],
      },
    ];

    plans.push({
      id: `plan-skill-${idx}`,
      gapId: `skill-gap-${skillGap.skill.toLowerCase()}`,
      requirementId: `req-skill-${idx}`,
      title: `Strengthen ${skillGap.skill} Evidence`,
      type: "SKILL",
      priority: skillGap.priority,
      importance: skillGap.importance,
      actionable: true,
      whyItMatters: skillGap.why,
      sourceRequirementText: skillGap.why,
      currentState: `Evidence Strength: ${skillGap.evidenceStrength || "NOT FOUND"}. No project or coursework evidence detected in profile.`,
      targetState: `Demonstrate practical ${skillGap.skill} fundamentals in at least one verifiable project.`,
      steps: [
        {
          stepNumber: "01",
          phase: "LEARN",
          title: `Learn ${skillGap.skill} Fundamentals`,
          description: "Review core concepts, syntax, and relational data modeling.",
          items: skillGap.learnTopics,
        },
        {
          stepNumber: "02",
          phase: "PRACTICE",
          title: "Solve Focused Exercises",
          description: "Complete targeted problem sets to build query fluency.",
          items: skillGap.practiceExercises,
        },
        {
          stepNumber: "03",
          phase: "BUILD",
          title: `Build Mini-Project (${projectRec.title})`,
          description: "Construct a focused application where the technology is essential.",
          items: projectRec.coreQueriesOrFeatures,
        },
        {
          stepNumber: "04",
          phase: "PROVE",
          title: "Document & Add Resume Evidence",
          description: "Publish public code and add a structured bullet to your resume.",
          items: projectRec.proofDeliverables,
        },
      ],
      projectRecommendation: projectRec,
      resources,
      completionCriteria: [
        `Core ${skillGap.skill} syntax and concepts understood`,
        `${skillGap.skill} utilized meaningfully in one public project`,
        "Project repository published on GitHub with schema and seed data",
        "Resume accurately reflects practical experience with this technology",
      ],
      canSimulateDemoEvidence: true,
    });
  });

  for (const req of analysis.evaluatedRequirements.filter(r => r.status === 'UNKNOWN' || r.status === 'PARTIAL')) {
    if (plans.some(p => p.requirementId === req.id)) continue;
    plans.push({
      id: `plan-verify-${req.id}`, gapId: `app-gap-${req.id}`, requirementId: req.id,
      title: `Verify ${req.title}`, type: 'INFORMATION', priority: req.importance === 'MANDATORY' ? 'HIGH' : 'LOW',
      importance: req.importance, actionable: true, whyItMatters: req.sourceText,
      sourceRequirementText: req.sourceText, currentState: req.profileEvidenceText || 'Information incomplete.',
      targetState: 'Record accurate information and re-evaluate the requirement.',
      steps: [{ stepNumber: '01', phase: 'VERIFY', title: 'Verify Actual Information', description: requirementAction(req), items: [requirementAction(req)] }],
      resources: [], completionCriteria: ['Missing information verified against genuine supporting documentation'], canSimulateDemoEvidence: false,
    });
  }
  return plans;
}

/**
 * Deterministically generates application strategy, positioning blueprint,
 * and "Apply Now or Improve First?" decision.
 */
export function buildStrategyPlan(
  analysis: AnalysisResult,
  opportunity: Opportunity,
  profile: StudentProfile
): StrategyPlan {
  const { stats } = analysis.verdict;
  const mandatory = summarizeMandatoryEligibility(analysis.evaluatedRequirements);
  const isMandatoryFailed = mandatory.failed > 0;
  const isMandatoryUnknown = !mandatory.allMatched;
  const hasPreferredGaps = stats.preferredTotal > stats.preferredMatched;

  // 1. "Apply Now or Improve First?" Signature Decision
  let applyDecision: ApplyDecisionState = "APPLY_NOW";
  let badgeLabel = "APPLY NOW";
  let headline = "Ready to Apply — Do Not Delay for Preferred Gaps";
  let reasoning =
    mandatory.message + " Preferred qualifications affect competitiveness separately. Review application materials before submission.";
  let urgencyText = "Ready to submit once materials are formatted.";

  if (isMandatoryFailed) {
    applyDecision = "RESOLVE_ELIGIBILITY_FIRST";
    badgeLabel = "RESOLVE ELIGIBILITY FIRST";
    headline = "Hard Eligibility Blockers Present";
    reasoning =
      mandatory.message + " Review the failed requirements and their category-specific actions before submitting.";
    urgencyText = "Review the actual mandatory constraints and whether they can be resolved honestly.";
  } else if (isMandatoryUnknown) {
    applyDecision = "FIX_ONE_THING_FIRST";
    badgeLabel = "FIX ONE THING FIRST";
    headline = "Verify Unresolved Mandatory Requirements Before Submitting";
    reasoning = mandatory.message;
    urgencyText = "Action required in profile before application.";
  }

  // 2. Application Readiness
  let readinessState: StrategyPlan["readinessState"] = "READY_TO_APPLY";
  let readinessSummary = mandatory.message;

  if (isMandatoryFailed) {
    readinessState = "BLOCKED";
    readinessSummary = "Hard eligibility constraints not met.";
  } else if (isMandatoryUnknown) {
    readinessState = "NEEDS_INFORMATION";
    readinessSummary = mandatory.message;
  } else if (hasPreferredGaps) {
    readinessState = "READY_WITH_GAPS";
    readinessSummary = mandatory.message + " Preferred qualification gaps remain.";
  }

  // Report recommendations come from the evaluated requirements and their actual evidence.
  const emphasize = analysis.evaluatedRequirements.filter(r => r.status === "MATCHED").map(r => ({
    id: `emp-${r.id}`, title: r.title, why: r.reasoning || "Matched by the eligibility engine.",
    sources: r.evidence.map(e => e.title).filter((title): title is string => Boolean(title)), placement: [r.category === "EDUCATION" ? "Education" : "Relevant resume section"],
  }));
  const improveGaps = analysis.gaps.competitivenessGaps.map((gap, index) => ({
    id: gap.id, title: gap.title, priority: gap.priority, why: gap.whyThisMatters,
    timingAdvice: mandatory.allMatched
      ? "Do NOT delay submitting solely for preferred gaps. Communicate genuine evidence if available."
      : "Resolve mandatory eligibility uncertainty or failures before deciding to apply.",
    planId: `plan-skill-${index}`,
  }));
  const positioning = {
    leadWith: emphasize.map(e => e.title), supportingSection: ["Relevant supporting qualifications"],
    deEmphasize: ["Unsupported claims and irrelevant details"],
  };
  const preparationTopics = analysis.evaluatedRequirements.filter(r => r.category === "SKILL" || r.category === "EXPERIENCE").map(r => ({
    id: `prep-${r.id}`, topic: r.title, urgency: r.importance === "MANDATORY" ? "HIGH" as const : "MEDIUM" as const,
    sourceReq: r.sourceText, focusAreas: [requirementAction(r)],
  }));
  const timelinePlan: StrategyPlan["timelinePlan"] = {
    deadlineText: opportunity.deadlineRelative || opportunity.deadline,
    schedule: [{ dayLabel: "BEFORE SUBMISSION", tasks: analysis.evaluatedRequirements
      .filter(r => r.importance === "MANDATORY" && r.status !== "MATCHED")
      .map(r => ({ id: `verify-${r.id}`, task: requirementAction(r), category: "PROFILE" as const, isBlocker: true }))
    }],
  };

  return {
    opportunityId: opportunity.id,
    profileId: profile.id,
    readinessState,
    readinessSummary,
    applyDecision: {
      decision: applyDecision,
      badgeLabel,
      headline,
      reasoning,
      urgencyText,
    },
    emphasize,
    improveGaps,
    positioning,
    preparationTopics,
    timelinePlan,
  };
}
