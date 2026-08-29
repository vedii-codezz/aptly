"use client";

import React from "react";
import { ATSAnalysisResult, ATSReadiness } from "@/types/ats";
import { cn } from "@/lib/utils";
import { ShieldCheck, CheckCircle2, Ban } from "lucide-react";

interface ATSSectionProps {
  ats: ATSAnalysisResult;
}

export function ATSSection({ ats }: ATSSectionProps) {
  const { readinessState, readinessHeadline, readinessSummary, stats, terms, structuralRisks, antiStuffingPolicy } = ats;

  const readinessLabels: Record<ATSReadiness, { label: string; color: string }> = {
    CLEAR: { label: "CLEAR", color: "text-aptly-match" },
    MINOR_GAPS: { label: "MINOR GAPS", color: "text-aptly-partial" },
    NEEDS_ATTENTION: { label: "NEEDS ATTENTION", color: "text-aptly-fail" },
    STRUCTURAL_RISK: { label: "STRUCTURAL RISK", color: "text-aptly-fail" },
  };

  const currentReadiness = readinessLabels[readinessState] || { label: readinessState, color: "text-black" };

  return (
    <section id="sec-ats" className="py-12 space-y-12 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          09 / ATS — SCREENING READABILITY AUDIT
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          Screening Readability &amp; Keywords
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Evaluating structural readability and requirement terminology coverage for automated screening workflows.
        </p>
      </div>

      {/* Screening Readiness Hero */}
      <div className="space-y-4 pb-8 border-b border-[var(--color-border-subtle)]">
        <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">
          SCREENING READINESS
        </span>
        <div className="font-serif font-normal text-4xl md:text-6xl text-black tracking-tight">
          <span className={currentReadiness.color}>{currentReadiness.label}.</span>
        </div>
        <p className="text-base font-semibold text-black font-sans">
          {readinessHeadline}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-2xl">
          {readinessSummary}
        </p>
      </div>

      {/* 01 / Terminology Coverage Ledger */}
      <div className="space-y-4">
        <div className="border-b border-black pb-2 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
            01 / TERMINOLOGY COVERAGE ({terms.length})
          </span>
          <span className="text-[10px] font-mono text-[var(--color-text-ghost)]">
            STATUS
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {terms.map((term, idx) => {
            const isClear = term.presentInResume;

            return (
              <div
                key={idx}
                className="py-4 px-2 -mx-2 rounded-control hover:bg-[var(--color-surface-muted)] transition-colors duration-micro grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center text-xs font-sans"
              >
                {/* Left: Term + Importance */}
                <div className="md:col-span-4 flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[var(--color-text-ghost)] w-5 text-right">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-black">{term.term}</span>
                    <span className="text-[9px] font-mono uppercase ml-2 px-1 py-0.2 rounded-control bg-stone-100 text-stone-600">
                      {term.importance}
                    </span>
                  </div>
                </div>

                {/* Middle: Recommendation */}
                <div className="md:col-span-6 pl-8 md:pl-0 text-xs text-[var(--color-text-secondary)]">
                  {term.recommendation}
                </div>

                {/* Right: Status */}
                <div className="md:col-span-2 flex items-center justify-end pl-8 md:pl-0 font-mono text-xs font-bold">
                  {isClear ? (
                    <span className="text-aptly-match flex items-center gap-1">
                      ✓ CLEAR
                    </span>
                  ) : (
                    <span className="text-aptly-fail flex items-center gap-1">
                      ✕ MISSING
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 02 / Structure & Heading Audit */}
      <div className="space-y-4">
        <div className="border-b border-black pb-2 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
            02 / STRUCTURE &amp; HEADING AUDIT
          </span>
        </div>

        {structuralRisks.length === 0 ? (
          <div className="py-4 text-sm text-aptly-match flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Standard section headings and clean document structure detected. No extraction risks.</span>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {structuralRisks.map((risk) => (
              <div key={risk.id} className="py-4 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-black">{risk.title}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-aptly-fail bg-aptly-fail-bg px-2 py-0.5 rounded-control border border-aptly-fail-border">
                    {risk.severity} RISK
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] font-sans">{risk.issueDescription}</p>
                <div className="text-xs font-sans text-black pt-1">
                  <strong>Suggested Fix: </strong>{risk.suggestedFix}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 03 / Anti-Keyword-Stuffing Guardrail Policy */}
      <div className="p-6 bg-black text-white rounded-control space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-xs tracking-wider">
          <Ban className="w-4 h-4" />
          {antiStuffingPolicy.statement}
        </div>
        <p className="text-stone-300 font-sans text-xs leading-relaxed max-w-3xl">
          {antiStuffingPolicy.guidingRule}
        </p>
      </div>
    </section>
  );
}
