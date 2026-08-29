"use client";

import React, { useState } from "react";
import { RequirementTrace } from "@/types/trace";
import { EvidenceStrength } from "@/types/evidence";
import { StatusBadge } from "../shared/StatusBadge";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { TrustTag } from "../shared/TrustTag";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowDown } from "lucide-react";

interface WhySectionProps {
  traces: RequirementTrace[];
}

export function WhySection({ traces }: WhySectionProps) {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.requirementId || "");

  const currentTrace = traces.find((t) => t.requirementId === selectedTraceId) || traces[0];

  if (!currentTrace) return null;

  const strengthBadgeStyles: Record<EvidenceStrength, string> = {
    STRONG: "text-aptly-match bg-aptly-match-bg border-aptly-match-border",
    MODERATE: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)]",
    WEAK: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border",
    NOT_FOUND: "text-aptly-unknown bg-aptly-unknown-bg border-aptly-unknown-border",
  };

  return (
    <section id="sec-why" className="py-12 border-b border-[var(--color-border-subtle)] space-y-10 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          03 / WHY — EVIDENCE PROVENANCE
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          How APTLY Reached Each Verdict
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Inspect the full 4-stage evidence chain from raw opportunity text to normalized rules, candidate history, and deterministic decision logic.
        </p>
      </div>

      {/* Requirement Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[var(--color-border-subtle)]">
        {traces.map((trace) => {
          const isSelected = trace.requirementId === currentTrace.requirementId;
          return (
            <button
              key={trace.requirementId}
              onClick={() => setSelectedTraceId(trace.requirementId)}
              className={cn(
                "px-3 py-2 rounded-control text-xs font-mono border transition-all duration-micro whitespace-nowrap flex items-center gap-2",
                isSelected
                  ? "bg-black text-white border-black font-bold shadow-subtle"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-black hover:text-black"
              )}
            >
              <span>{trace.title}</span>
              <StatusBadge status={trace.status} size="sm" />
            </button>
          );
        })}
      </div>

      {/* Spatial 4-Stage Evidence Pipeline (Desktop: 4 Columns, Mobile: Stacked) */}
      <div className="space-y-6">
        {/* Active Trace Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <h4 className="text-lg md:text-xl font-bold text-black font-sans">
              {currentTrace.title}
            </h4>
            <ImportanceBadge importance={currentTrace.importance} />
            <TrustTag trust={currentTrace.trust} />
          </div>

          <StatusBadge status={currentTrace.status} size="md" />
        </div>

        {/* 4 Connected Stages Across Desktop Width */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 relative">
          {/* STAGE 1: SOURCE REQUIREMENT */}
          <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">
                <span>01 / SOURCE SPECIFICATION</span>
                <TrustTag trust="FACT" />
              </div>
              <p className="text-xs text-black font-mono leading-relaxed">
                &ldquo;{currentTrace.sourceQuote}&rdquo;
              </p>
            </div>

            {currentTrace.highlightedPhrase && (
              <div className="text-[10px] font-mono text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-subtle)]">
                Parameter:{" "}
                <span className="font-bold text-black bg-stone-100 px-1 py-0.5 rounded">
                  {currentTrace.highlightedPhrase}
                </span>
              </div>
            )}
          </div>

          {/* STAGE 2: NORMALIZED INTERPRETATION */}
          <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">
                <span>02 / NORMALIZED RULE</span>
                <TrustTag trust={currentTrace.interpretation.trustClassification} />
              </div>
              <div className="text-xs font-mono font-bold text-black">
                {currentTrace.interpretation.normalizedRule}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
                {currentTrace.interpretation.explanation}
              </p>
            </div>

            <div className="text-[10px] font-mono text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-subtle)]">
              Category: <strong className="text-black">{currentTrace.interpretation.categoryLabel}</strong>
            </div>
          </div>

          {/* STAGE 3: CANDIDATE PROFILE EVIDENCE */}
          <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">
                <span>03 / CANDIDATE EVIDENCE</span>
                <span
                  className={cn(
                    "text-[9px] font-mono px-1 py-0.2 rounded-control border uppercase font-bold",
                    strengthBadgeStyles[currentTrace.evidenceTrace.evidenceStrength]
                  )}
                >
                  {currentTrace.evidenceTrace.evidenceStrength}
                </span>
              </div>

              <div className="text-xs font-semibold text-black font-sans">
                {currentTrace.evidenceTrace.matchedSummary}
              </div>

              {currentTrace.evidenceTrace.items.length > 0 ? (
                <div className="space-y-1 text-[11px] text-[var(--color-text-secondary)] font-sans">
                  {currentTrace.evidenceTrace.items.slice(0, 2).map((item, i) => (
                    <div key={i} className="line-clamp-2">
                      • <strong className="text-black font-mono">[{item.source}]</strong> {item.description}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic font-sans">
                  No verified project, experience, or academic evidence recorded.
                </p>
              )}
            </div>

            <div className="text-[10px] font-mono text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-subtle)]">
              {currentTrace.evidenceTrace.items.length} proof items detected
            </div>
          </div>

          {/* STAGE 4: DETERMINISTIC DECISION */}
          <div className="p-5 bg-black text-white rounded-control space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-400 uppercase">
                <span>04 / DETERMINISTIC DECISION</span>
                <StatusBadge status={currentTrace.decision.status} size="sm" />
              </div>

              <div className="text-xs font-mono font-bold text-emerald-400">
                {currentTrace.decision.comparisonLogic}
              </div>

              <p className="text-xs text-stone-300 font-sans leading-relaxed">
                {currentTrace.decision.reasoning}
              </p>
            </div>

            <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-stone-800">
              100% Deterministic Rule Engine
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
