"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Check,
  ShieldAlert,
} from "lucide-react";

export function ImproveWindow() {
  const {
    activeImprovementPlans,
    selectedImprovementPlanId,
    setSelectedImprovementPlanId,
    openWindow,
    navigateToRequirementInCheck,
    simulateAddSkillEvidence,
  } = useWorkspaceStore();

  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);

  if (!activeImprovementPlans || activeImprovementPlans.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 select-none">
        <div className="text-center space-y-3 max-w-sm">
          <div className="type-display text-display-md text-black">
            No critical gaps.
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Your mandatory eligibility requirements are satisfied. Review application strategy to optimize positioning.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openWindow("STRATEGY")}
              className="px-4 py-2 bg-black text-white text-system-xs rounded-control hover:bg-[#222] transition-colors duration-micro inline-flex items-center gap-1.5"
            >
              <span>VIEW STRATEGY BLUEPRINT</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlan =
    activeImprovementPlans.find((p) => p.id === selectedImprovementPlanId) ||
    activeImprovementPlans[0];

  const priorityStyles = {
    CRITICAL: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border font-bold",
    HIGH: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border font-bold",
    MEDIUM: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)] font-medium",
    LOW: "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] border-[var(--color-border-subtle)]",
  };

  const handleSimulateEvidence = (skillName: string) => {
    simulateAddSkillEvidence(skillName);
    setSimulatedSkills((prev) => [...prev, skillName.toLowerCase()]);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] font-sans">
      {/* ─── Control Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="type-system text-black">
            IMPROVEMENT ROADMAPS
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-sans">
            · {activeImprovementPlans.length} prioritized
          </span>
        </div>

        <button
          onClick={() => openWindow("STRATEGY")}
          className="px-2.5 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-active)] text-black rounded-control border border-[var(--color-border)] text-system-xs transition-colors duration-micro flex items-center gap-1"
        >
          <span>Strategy Blueprint</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* ─── Main Workbench Grid ─── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left: Prioritized Plans Sidebar */}
        <div className="md:col-span-4 border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
          <div className="px-3 py-2 text-system-xs text-[var(--color-text-ghost)] flex items-center justify-between">
            <span>ROADMAPS</span>
            <span>BLOCKERS FIRST</span>
          </div>

          {activeImprovementPlans.map((plan, idx) => {
            const isSelected = plan.id === selectedPlan.id;
            const isSimulated = simulatedSkills.includes(
              plan.title.toLowerCase().replace("strengthen ", "").replace(" evidence", "")
            );

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedImprovementPlanId(plan.id)}
                className={cn(
                  "w-full text-left p-3 space-y-1 transition-colors duration-micro block select-none",
                  isSelected
                    ? "bg-[var(--color-surface)] border-l-2 border-l-black shadow-subtle"
                    : "hover:bg-[var(--color-surface-active)] text-[var(--color-text-secondary)]"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-[var(--color-text-ghost)]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-mono px-1 py-0.2 rounded-control border uppercase",
                      priorityStyles[plan.priority]
                    )}
                  >
                    {plan.priority}
                  </span>
                </div>

                <div className="text-xs font-semibold text-black truncate font-sans">
                  {plan.title}
                </div>

                <p className="text-[10px] text-[var(--color-text-muted)] truncate font-sans">
                  {plan.whyItMatters}
                </p>

                {isSimulated && (
                  <div className="text-[9px] font-mono text-aptly-match font-bold flex items-center gap-1 pt-0.5">
                    <Check className="w-2.5 h-2.5" />
                    SIMULATED EVIDENCE ACTIVE
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Selected Roadmap Workbench */}
        <div className="md:col-span-8 overflow-y-auto p-4 md:p-6 space-y-6 bg-[var(--color-surface)]">
          {/* Header */}
          <div className="border-b border-[var(--color-border-subtle)] pb-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded-control border uppercase font-bold",
                    priorityStyles[selectedPlan.priority]
                  )}
                >
                  {selectedPlan.priority}
                </span>
                <ImportanceBadge importance={selectedPlan.importance} />
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-control bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] uppercase">
                  {selectedPlan.type}
                </span>
              </div>

              {selectedPlan.requirementId && (
                <button
                  onClick={() => navigateToRequirementInCheck(selectedPlan.requirementId!)}
                  className="text-xs font-sans text-[var(--color-text-muted)] hover:text-black flex items-center gap-1 transition-colors"
                >
                  <span>Source Requirement</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <h3 className="type-display text-display-md text-black">
              {selectedPlan.title}
            </h3>

            <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
              <strong>Why It Matters: </strong>{selectedPlan.whyItMatters}
            </p>
          </div>

          {/* Current State vs Target Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1">
              <div className="type-system text-[var(--color-text-muted)]">CURRENT STATE</div>
              <p className="text-[var(--color-text-secondary)] font-sans">{selectedPlan.currentState}</p>
            </div>

            <div className="p-3 bg-aptly-match-bg rounded-control border border-aptly-match-border space-y-1">
              <div className="type-system text-aptly-match">TARGET GOAL</div>
              <p className="text-aptly-match font-sans font-medium">{selectedPlan.targetState}</p>
            </div>
          </div>

          {/* FIXED CONSTRAINT WARNING (If Immutable) */}
          {!selectedPlan.actionable && selectedPlan.fixedConstraintExplanation && (
            <div className="p-4 bg-aptly-fail-bg border border-aptly-fail-border rounded-control space-y-2">
              <div className="type-system text-aptly-fail flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                FIXED ELIGIBILITY CONSTRAINT
              </div>
              <p className="text-xs text-aptly-fail leading-relaxed font-sans">
                {selectedPlan.fixedConstraintExplanation}
              </p>
              <div className="pt-1">
                <button
                  onClick={() => openWindow("CHECK")}
                  className="px-3 py-1.5 bg-black text-white rounded-control text-system-xs flex items-center gap-1.5 hover:bg-[#222] transition-colors"
                >
                  <span>Check Other Opportunities →</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIONABLE 4-PHASE CONNECTED ROADMAP (Learn -> Practice -> Build -> Prove) */}
          {selectedPlan.actionable && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="type-system text-[var(--color-text-muted)]">
                  STRUCTURED PROGRESSION
                </span>
                <span className="text-[9px] font-mono text-[var(--color-text-ghost)]">
                  01 LEARN → 02 PRACTICE → 03 BUILD → 04 PROVE
                </span>
              </div>

              {/* Connected vertical step tree */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-[var(--color-border)]">
                {selectedPlan.steps.map((step, stepIdx) => (
                  <div key={step.stepNumber} className="relative space-y-1.5">
                    {/* Node bullet */}
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[var(--color-surface)] border-2 border-black flex items-center justify-center text-[9px] font-mono font-bold text-black">
                      {step.stepNumber}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="type-system text-black">
                        {step.phase}
                      </span>
                      <span className="text-[var(--color-border)]">·</span>
                      <span className="text-xs font-semibold text-black font-sans">
                        {step.title}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-muted)] font-sans">
                      {step.description}
                    </p>

                    <div className="p-2.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1 text-xs font-sans">
                      {step.items.map((item, i) => (
                        <div key={i} className="text-[var(--color-text-secondary)] flex items-start gap-1.5">
                          <span className="text-[var(--color-text-ghost)]">›</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECT RECOMMENDATION */}
          {selectedPlan.projectRecommendation && (
            <div className="p-4 border border-black rounded-control space-y-3 bg-[var(--color-surface)]">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="type-system text-[var(--color-text-muted)]">
                    RECOMMENDED MINI-PROJECT
                  </span>
                  <h4 className="text-sm font-bold text-black font-sans mt-0.5">
                    {selectedPlan.projectRecommendation.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans">
                    {selectedPlan.projectRecommendation.tagline}
                  </p>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-control bg-[var(--color-surface-muted)] text-black border border-[var(--color-border)] font-semibold">
                  {selectedPlan.projectRecommendation.estimatedHours}
                </span>
              </div>

              <div className="p-2.5 bg-[var(--color-surface-muted)] rounded-control text-xs font-sans text-[var(--color-text-secondary)]">
                <strong>Why This Project: </strong>
                <span>{selectedPlan.projectRecommendation.whyThisProject}</span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="type-system text-[var(--color-text-muted)]">DELIVERABLES:</span>
                <div className="space-y-1 pl-1 font-sans">
                  {selectedPlan.projectRecommendation.proofDeliverables.map((deliv, i) => (
                    <div key={i} className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
                      <span className="text-aptly-match font-bold">✓</span>
                      <span>{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* COMPLETION CRITERIA */}
          {selectedPlan.completionCriteria.length > 0 && (
            <div className="p-3.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-2">
              <div className="type-system text-black flex items-center gap-1.5">
                <span>DONE WHEN</span>
              </div>
              <div className="space-y-1 text-xs font-sans text-[var(--color-text-secondary)]">
                {selectedPlan.completionCriteria.map((crit, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-aptly-match font-bold text-xs">✓</span>
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIMULATE DEMO EVIDENCE BUTTON */}
          {selectedPlan.canSimulateDemoEvidence && (
            <div className="p-4 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="type-system text-aptly-partial">
                    DEMO SIMULATION: TEST FIT RE-EVALUATION
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-sans mt-0.5">
                    Simulate adding this project evidence to test how your requirement status updates in real-time.
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleSimulateEvidence(
                      selectedPlan.title.replace("Strengthen ", "").replace(" Evidence", "")
                    )
                  }
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                >
                  <Sparkles className="w-3 h-3 opacity-60" />
                  <span>SIMULATE EVIDENCE ADDED</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
