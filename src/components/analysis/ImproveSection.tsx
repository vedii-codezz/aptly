"use client";

import React, { useState } from "react";
import { ImprovementPlan } from "@/types/improvement";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ImproveSectionProps {
  plans: ImprovementPlan[];
  onSimulateEvidence: (skillName: string) => void;
}

export function ImproveSection({ plans, onSimulateEvidence }: ImproveSectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  if (!selectedPlan) return null;

  const handleSimulate = (skillName: string) => {
    onSimulateEvidence(skillName);
  };

  const priorityStyles = {
    CRITICAL: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border font-bold",
    HIGH: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border font-bold",
    MEDIUM: "text-stone-700 bg-stone-100 border-stone-300 font-medium",
    LOW: "text-stone-500 bg-stone-50 border-stone-200",
  };

  return (
    <section id="sec-improve" className="py-12 border-b border-[var(--color-border-subtle)] space-y-10 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          06 / IMPROVE — ACTIONABLE ROADMAPS
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          How to Bridge Priority Gaps
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Structured 4-phase learning and proof pipelines converting missing evidence into verified project deliverables.
        </p>
      </div>

      {/* Plan Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[var(--color-border-subtle)]">
        {plans.map((plan, idx) => {
          const isSelected = plan.id === selectedPlan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={cn(
                "px-3.5 py-2 rounded-control text-xs font-sans border transition-all duration-micro whitespace-nowrap flex items-center gap-2",
                isSelected
                  ? "bg-black text-white border-black font-bold shadow-subtle"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-black hover:text-black"
              )}
            >
              <span className="font-mono text-xs opacity-60">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{plan.title}</span>
              <span
                className={cn(
                  "text-[9px] font-mono px-1 py-0.2 rounded-control uppercase font-bold",
                  priorityStyles[plan.priority]
                )}
              >
                {plan.priority}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Roadmap Canvas */}
      <div className="space-y-8">
        {/* Title + Why It Matters */}
        <div className="space-y-3 pb-6 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={cn(
                "text-[9px] font-mono px-2 py-0.5 rounded-control border uppercase font-bold",
                priorityStyles[selectedPlan.priority]
              )}
            >
              {selectedPlan.priority} PRIORITY
            </span>
            <ImportanceBadge importance={selectedPlan.importance} />
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
              {selectedPlan.type}
            </span>
          </div>

          <h4 className="font-serif font-normal text-2xl md:text-3xl text-black">
            {selectedPlan.title}
          </h4>

          <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-3xl">
            <strong className="text-black font-semibold">Why It Matters: </strong>{selectedPlan.whyItMatters}
          </p>
        </div>

        {/* Current State vs Target Goal (Wide Split) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-1">
            <div className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">
              CURRENT EVIDENCE STATE
            </div>
            <p className="text-sm text-black">{selectedPlan.currentState}</p>
          </div>

          <div className="p-4 bg-aptly-match-bg border border-aptly-match-border rounded-control space-y-1">
            <div className="text-[10px] font-mono font-bold text-aptly-match uppercase">
              TARGET PROOF GOAL
            </div>
            <p className="text-sm text-aptly-match font-medium">{selectedPlan.targetState}</p>
          </div>
        </div>

        {/* Fixed Constraint Warning */}
        {!selectedPlan.actionable && selectedPlan.fixedConstraintExplanation && (
          <div className="p-5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control space-y-2">
            <div className="text-xs font-mono font-bold text-aptly-fail flex items-center gap-1.5 uppercase">
              <ShieldAlert className="w-4 h-4" />
              FIXED ELIGIBILITY CONSTRAINT
            </div>
            <p className="text-sm text-aptly-fail leading-relaxed font-sans">
              {selectedPlan.fixedConstraintExplanation}
            </p>
          </div>
        )}

        {/* 4-Phase Horizontal Progression (Desktop: 4-Col Grid, Mobile: Stack) */}
        {selectedPlan.actionable && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                STRUCTURED PROGRESSION PIPELINE
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-ghost)]">
                01 LEARN → 02 PRACTICE → 03 BUILD → 04 PROVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {selectedPlan.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-mono text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">
                        {step.phase}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-black font-sans">
                      {step.title}
                    </h5>

                    <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)] font-sans">
                    {step.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
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

        {/* Project Recommendation & Real-Time Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Targeted Mini-Project */}
          {selectedPlan.projectRecommendation && (
            <div className="p-6 border border-black rounded-control space-y-4 bg-[var(--color-surface)]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">
                  RECOMMENDED MINI-PROJECT
                </span>
                <h5 className="text-lg font-bold text-black font-sans mt-1">
                  {selectedPlan.projectRecommendation.title}
                </h5>
                <p className="text-xs text-[var(--color-text-secondary)] font-sans mt-0.5">
                  {selectedPlan.projectRecommendation.tagline}
                </p>
              </div>

              <div className="space-y-1.5 text-xs font-sans">
                <span className="text-[10px] font-mono font-bold text-black uppercase">PROOF DELIVERABLES:</span>
                {selectedPlan.projectRecommendation.proofDeliverables.map((deliv, i) => (
                  <div key={i} className="flex items-center gap-2 text-black">
                    <span className="text-aptly-match font-bold">✓</span>
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Simulation Trigger */}
          {selectedPlan.canSimulateDemoEvidence && (
            <div className="p-6 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-aptly-partial uppercase">
                  LIVE DEMO SIMULATION
                </span>
                <p className="text-sm text-black font-sans mt-1 leading-relaxed">
                  Simulate adding this verified project evidence to your profile history to test real-time re-evaluation of eligibility and readiness.
                </p>
              </div>

              <button
                onClick={() =>
                  handleSimulate(
                    selectedPlan.title.replace("Strengthen ", "").replace(" Evidence", "")
                  )
                }
                className="px-4 py-2.5 bg-black hover:bg-[#222] text-white rounded-control text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-subtle"
              >
                <Sparkles className="w-4 h-4 opacity-70" />
                <span>SIMULATE EVIDENCE ADDED</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
