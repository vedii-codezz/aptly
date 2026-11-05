"use client";

import React from "react";
import { summarizeMandatoryEligibility } from "@/lib/eligibility/summary";
import { OpportunityRequirement } from "@/types/opportunity";
import { GapCategorization } from "@/types/analysis";
import { DetailedGapItem } from "@/types/trace";
import { AlertOctagon, TrendingUp, HelpCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GapsSectionProps {
  gaps: GapCategorization;
  requirements: OpportunityRequirement[];
  onNavigateToProfile?: (field: string) => void;
  onBuildPlan?: (gapId: string) => void;
}

export function GapsSection({ gaps, requirements, onNavigateToProfile, onBuildPlan }: GapsSectionProps) {
  const mandatory = summarizeMandatoryEligibility(requirements);
  const priorityBadgeStyles = {
    CRITICAL: "bg-aptly-fail-bg text-aptly-fail border-aptly-fail-border",
    HIGH: "bg-aptly-partial-bg text-aptly-partial border-aptly-partial-border",
    MEDIUM: "bg-stone-100 text-stone-700 border-stone-300",
    LOW: "bg-stone-50 text-stone-500 border-stone-200",
  };

  return (
    <section id="sec-gaps" className="py-12 border-b border-[var(--color-border-subtle)] space-y-10 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          05 / GAPS — DIAGNOSTIC HIERARCHY
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          What Could Hold You Back
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Triaged diagnostic evaluation separating mandatory eligibility blockers from preferred qualifications and unrecorded data.
        </p>
      </div>

      {/* Diagnostic Gap Categories */}
      <div className="space-y-10">
        {/* 1. ELIGIBILITY GAPS */}
        <div className="space-y-4">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-aptly-fail uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              1. ELIGIBILITY GAPS ({gaps.eligibilityGaps.length})
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
              MANDATORY DISQUALIFIERS
            </span>
          </div>

          {gaps.eligibilityGaps.length === 0 ? (
            <div className={cn("py-4 text-sm flex items-center gap-2 font-medium", mandatory.allMatched ? "text-aptly-match" : "text-aptly-partial")}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mandatory.message}</span>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {gaps.eligibilityGaps.map((gap: DetailedGapItem, idx: number) => (
                <div key={gap.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-aptly-fail">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h4 className="text-base font-bold text-black font-sans">
                        {gap.title}
                      </h4>
                    </div>
                    <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-control border font-bold uppercase", priorityBadgeStyles[gap.priority])}>
                      {gap.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed pl-7">
                    {gap.whyThisMatters}
                  </p>
                  <div className="text-xs font-mono text-aptly-fail pl-7 font-semibold">
                    Action: {gap.nextAction}
                  </div>
                  {onBuildPlan && <button type="button" onClick={() => onBuildPlan(gap.id)} className="ml-7 inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-accent)] hover:underline focus-visible:outline-none">BUILD A PLAN <ArrowRight className="w-3 h-3" /></button>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. COMPETITIVENESS GAPS */}
        <div className="space-y-4">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-aptly-partial uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              2. COMPETITIVENESS GAPS ({gaps.competitivenessGaps.length})
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
              PREFERRED SIGNALS
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle)]">
            {gaps.competitivenessGaps.map((gap: DetailedGapItem, idx: number) => (
              <div key={gap.id} className="py-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-aptly-partial">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-base font-bold text-black font-sans">
                      {gap.title}
                    </h4>
                  </div>
                  <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-control border font-bold uppercase", priorityBadgeStyles[gap.priority])}>
                    {gap.priority} PRIORITY
                  </span>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed pl-7">
                  {gap.whyThisMatters}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7 text-xs font-sans pt-1">
                  <div>
                    <span className="text-[var(--color-text-muted)]">Current Evidence: </span>
                    <strong className="text-black">{gap.currentEvidence}</strong>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">Next Step: </span>
                    <strong className="text-black">{gap.nextAction}</strong>
                  </div>
                </div>
                {onBuildPlan && <button type="button" onClick={() => onBuildPlan(gap.id)} className="ml-7 inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-accent)] hover:underline focus-visible:outline-none">BUILD A PLAN <ArrowRight className="w-3 h-3" /></button>}
              </div>
            ))}
          </div>
        </div>

        {/* 3. APPLICATION GAPS */}
        <div className="space-y-4">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[var(--color-text-muted)]" />
              3. APPLICATION GAPS ({gaps.applicationGaps.length})
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
              UNRECORDED FACTS
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle)]">
            {gaps.applicationGaps.map((gap: DetailedGapItem, idx: number) => (
              <div key={gap.id} className="py-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-base font-bold text-black font-sans">
                      {gap.title}
                    </h4>
                  </div>
                  <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-control border font-bold uppercase", priorityBadgeStyles[gap.priority])}>
                    {gap.priority}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed pl-7">
                  {gap.whyThisMatters}
                </p>
                <div className="text-xs font-mono text-[var(--color-text-muted)] pl-7">
                  Action: {gap.nextAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
