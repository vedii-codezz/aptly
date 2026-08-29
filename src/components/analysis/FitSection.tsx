"use client";

import React from "react";
import { SkillEvidence, EvidenceStrength } from "@/types/evidence";
import { RequirementImportance } from "@/types/opportunity";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface FitSectionProps {
  skillBreakdown: {
    matchedSkills: Array<SkillEvidence & { isRequired: boolean; importance: RequirementImportance }>;
  };
  strengths: Array<{
    title: string;
    detail: string;
    evidenceSource: string;
    evidenceItemsCount: number;
  }>;
  weakAreas: Array<{
    title: string;
    detail: string;
    evidenceSource?: string;
    impact: string;
  }>;
}

export function FitSection({
  skillBreakdown,
  strengths,
  weakAreas,
}: FitSectionProps) {
  const strengthStyles: Record<EvidenceStrength, string> = {
    STRONG: "text-aptly-match bg-aptly-match-bg border-aptly-match-border",
    MODERATE: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)]",
    WEAK: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border",
    NOT_FOUND: "text-aptly-unknown bg-aptly-unknown-bg border-aptly-unknown-border",
  };

  return (
    <section id="sec-fit" className="py-12 border-b border-[var(--color-border-subtle)] space-y-10 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          04 / YOUR FIT
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          Where Your Profile is Strongest
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Comprehensive synthesis of candidate evidence strengths against opportunity requirements.
        </p>
      </div>

      {/* Two-Sided Desktop Grid: Strongest Signals vs Weak / Missing Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Strongest Signals */}
        <div className="space-y-6">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-aptly-match uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              YOUR STRONGEST SIGNALS ({strengths.length})
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
              VERIFIED PROOF
            </span>
          </div>

          <div className="space-y-6">
            {strengths.map((s, idx) => (
              <div key={idx} className="space-y-1.5 pb-5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[var(--color-text-ghost)]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-base font-bold text-black font-sans">
                    {s.title}
                  </h4>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed pl-7">
                  {s.detail}
                </p>
                <div className="text-[11px] font-mono text-[var(--color-text-muted)] pl-7 pt-1">
                  Source: <strong className="text-black">{s.evidenceSource}</strong> · {s.evidenceItemsCount} verified items
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Weak or Missing Evidence */}
        <div className="space-y-6">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-aptly-partial uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              WEAK OR MISSING EVIDENCE ({weakAreas.length})
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">
              APPLICATION IMPACT
            </span>
          </div>

          <div className="space-y-6">
            {weakAreas.map((w, idx) => (
              <div key={idx} className="space-y-1.5 pb-5 border-b border-[var(--color-border-subtle)] last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-aptly-partial">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-base font-bold text-black font-sans">
                    {w.title}
                  </h4>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed pl-7">
                  {w.detail}
                </p>
                <div className="text-[11px] font-mono text-aptly-partial pl-7 pt-1 font-semibold">
                  Impact: {w.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matched Application Skills Ledger */}
      <div className="space-y-4 pt-6">
        <div className="border-b border-black pb-2 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
            VERIFIED APPLICATION SKILLS ({skillBreakdown.matchedSkills.length})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillBreakdown.matchedSkills.map((s, idx) => (
            <div key={idx} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black text-sm font-sans">{s.skill}</span>
                  <ImportanceBadge importance={s.importance} />
                </div>
                <span className={cn("text-[9px] font-mono px-1.5 py-0.2 rounded-control border uppercase font-bold", strengthStyles[s.evidenceStrength])}>
                  {s.evidenceStrength}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-[var(--color-text-secondary)] font-sans">
                {s.evidence.map((ev, i) => (
                  <div key={i} className="line-clamp-2">
                    • <strong className="text-black font-mono">[{ev.source}]</strong> {ev.title ? `${ev.title}: ` : ""}{ev.description}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
