"use client";

import React from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ATSReadiness, ATSTermImportance } from "@/types/ats";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Ban,
} from "lucide-react";

export function ATSWindow() {
  const {
    atsAnalysisResult,
    openWindow,
    openImproveWithPlan,
    activeResume,
  } = useWorkspaceStore();

  if (!atsAnalysisResult || !activeResume) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 select-none">
        <div className="text-center space-y-3 max-w-sm">
          <div className="type-display text-display-md text-black">
            No ATS report yet.
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Load or paste a resume in APTLY/RESUME to analyze screening readability and terminology coverage.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openWindow("RESUME")}
              className="px-4 py-2 bg-black text-white text-system-xs rounded-control hover:bg-[#222] transition-colors duration-micro inline-flex items-center gap-1.5"
            >
              <span>OPEN APTLY/RESUME</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { readinessState, readinessHeadline, readinessSummary, stats, terms, structuralRisks, antiStuffingPolicy } =
    atsAnalysisResult;

  const readinessLabels: Record<ATSReadiness, { label: string; color: string }> = {
    CLEAR: { label: "CLEAR", color: "text-aptly-match" },
    MINOR_GAPS: { label: "MINOR GAPS", color: "text-aptly-partial" },
    NEEDS_ATTENTION: { label: "NEEDS ATTENTION", color: "text-aptly-fail" },
    STRUCTURAL_RISK: { label: "STRUCTURAL RISK", color: "text-aptly-fail" },
  };

  const currentReadiness = readinessLabels[readinessState] || { label: readinessState, color: "text-black" };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] font-sans">
      {/* ─── Header Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="type-system text-black">
            SCREENING AUDIT
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-sans">
            · Readability & Terminology Coverage
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
          <span>{stats.requiredTermsMatched}/{stats.requiredTermsTotal} REQUIRED TERMS</span>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
        {/* Screening Readiness Hero */}
        <div className="py-4 md:py-6 border-b border-[var(--color-border-subtle)] space-y-2">
          <div className="type-system text-[var(--color-text-muted)]">
            SCREENING READINESS
          </div>
          <div className="type-display text-display-md text-black">
            <span className={currentReadiness.color}>{currentReadiness.label}.</span>
          </div>
          <p className="text-xs font-semibold text-black font-sans mt-1">
            {readinessHeadline}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-2xl">
            {readinessSummary}
          </p>
        </div>

        {/* 01 / TERMINOLOGY COVERAGE LEDGER */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="type-system text-[var(--color-text-muted)]">
              01 / TERMINOLOGY COVERAGE ({terms.length})
            </span>
            <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
              EVALUATED AGAINST CANDIDATE PROOF
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle)]">
            {terms.map((term, idx) => {
              const statusColor = term.presentInResume ? "text-aptly-match" : "text-aptly-fail";
              const statusIcon = term.presentInResume ? "✓" : "✕";

              return (
                <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-right text-[10px] font-mono text-[var(--color-text-ghost)] shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-black font-sans">{term.term}</span>
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded-control bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                          {term.importance}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-sans mt-0.5 max-w-lg">
                        {term.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[10px] shrink-0">
                    <span className={cn("font-bold", statusColor)}>
                      {statusIcon} {term.presentInResume ? "CLEAR" : "MISSING"}
                    </span>
                    {term.actionTarget?.window === "IMPROVE" && (
                      <button
                        onClick={() => openImproveWithPlan(term.actionTarget?.planId)}
                        className="px-2 py-0.5 bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-active)] text-black rounded-control border border-[var(--color-border)] transition-colors duration-micro"
                      >
                        Improve →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 02 / STRUCTURE & PARSING AUDIT */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="type-system text-[var(--color-text-muted)]">
              02 / STRUCTURE & PARSING AUDIT
            </span>
            <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
              {structuralRisks.length} RISKS DETECTED
            </span>
          </div>

          {structuralRisks.length === 0 ? (
            <div className="p-3 bg-aptly-match-bg border border-aptly-match-border rounded-control text-xs text-aptly-match font-sans flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Standard section headings and clean contact links detected. No extraction risks.</span>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {structuralRisks.map((risk) => (
                <div key={risk.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black font-sans">{risk.title}</span>
                    <span className="type-system text-aptly-fail">
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-[var(--color-text-secondary)] font-sans">{risk.issueDescription}</p>
                  <div className="text-[11px] font-sans text-black pt-0.5">
                    <strong>Suggested Fix: </strong>{risk.suggestedFix}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 03 / ANTI-KEYWORD-STUFFING POLICY */}
        <div className="p-4 bg-black text-white rounded-control space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[10px]">
            <Ban className="w-3.5 h-3.5" />
            {antiStuffingPolicy.statement}
          </div>
          <p className="text-stone-300 font-sans text-xs leading-relaxed">
            {antiStuffingPolicy.guidingRule}
          </p>
        </div>
      </div>
    </div>
  );
}
