"use client";

import React from "react";
import { AnalysisResult } from "@/types/analysis";
import { StatusBadge } from "../shared/StatusBadge";
import { MaskedReveal } from "../motion/MaskedReveal";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

interface VerdictSectionProps {
  analysis: AnalysisResult;
}

export function VerdictSection({ analysis }: VerdictSectionProps) {
  const { verdict, evaluatedRequirements } = analysis;
  const stats = verdict.stats;

  const verdictConfig = {
    CAN_APPLY: { lines: ["YOU", "CAN", "APPLY."], color: "text-aptly-match" },
    POSSIBLY_ELIGIBLE: { lines: ["POSSIBLY", "ELIGIBLE."], color: "text-aptly-partial" },
    NOT_CURRENTLY_ELIGIBLE: { lines: ["NOT", "CURRENTLY", "ELIGIBLE."], color: "text-aptly-fail" },
  }[verdict.verdict] || { lines: ["ANALYSIS", "COMPLETE."], color: "text-black" };

  const scrollToNext = () => {
    const el = document.getElementById("sec-requirements");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
  };

  return (
    <section id="sec-verdict" className="pt-4 pb-12 border-b border-[var(--color-border-subtle)] space-y-10 md:space-y-14 font-sans">
      {/* Chapter Tag + Status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          01 / VERDICT
        </span>
        <StatusBadge
          status={
            verdict.verdict === "CAN_APPLY"
              ? "MATCHED"
              : verdict.verdict === "POSSIBLY_ELIGIBLE"
              ? "PARTIAL"
              : "FAILED"
          }
          size="md"
        />
      </div>

      {/* Monumental Masked Newsreader Display Headline */}
      <MaskedReveal
        lines={verdictConfig.lines}
        lastLineColor={verdictConfig.color}
        staggerMs={130}
      />

      {/* Summary Reasoning Text (Constrained Reading Width, 17-18px) */}
      <div className="max-w-3xl space-y-6">
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] font-sans leading-relaxed">
          {verdict.summary}
        </p>

        {/* Stats Ledger */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-mono pt-2">
          <div className="flex items-center gap-1.5 text-aptly-match font-bold">
            <span className="text-base">{stats.mandatoryMatched}</span>
            <span className="text-xs uppercase">Matched</span>
          </div>
          <span className="text-[var(--color-border)]">/</span>
          <div className="flex items-center gap-1.5 text-aptly-partial font-bold">
            <span className="text-base">{stats.mandatoryUnknown}</span>
            <span className="text-xs uppercase">Unrecorded</span>
          </div>
          <span className="text-[var(--color-border)]">/</span>
          <div className="flex items-center gap-1.5 text-aptly-fail font-bold">
            <span className="text-base">{stats.mandatoryFailed}</span>
            <span className="text-xs uppercase">Failed</span>
          </div>
          <span className="text-[var(--color-border)]">/</span>
          <div className="text-xs text-[var(--color-text-muted)]">
            {evaluatedRequirements.length} Total Criteria Evaluated
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-xs font-sans">
          <button type="button" onClick={() => scrollTo("sec-requirements")} className="text-left border-l border-[var(--color-accent)] pl-3 py-1 hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:bg-[var(--color-surface-muted)]">
            <span className="block text-[10px] font-mono tracking-wider text-[var(--color-text-muted)]">ELIGIBILITY</span>
            <span className="font-semibold text-black">{stats.mandatoryMatched} mandatory requirements satisfied</span>
          </button>
          <button type="button" onClick={() => scrollTo("sec-gaps")} className="text-left border-l border-[var(--color-border-strong)] pl-3 py-1 hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:bg-[var(--color-surface-muted)]">
            <span className="block text-[10px] font-mono tracking-wider text-[var(--color-text-muted)]">COMPETITIVENESS</span>
            <span className="font-semibold text-black">{stats.failed + stats.partial + stats.unknown} items need attention</span>
          </button>
        </div>

        {/* Scroll CTA Link */}
        <div className="pt-4 flex flex-wrap gap-x-5 gap-y-2">
          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-black hover:underline group cursor-pointer"
          >
            <span>See requirement evaluation ledger</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
          </button>
          <button onClick={() => scrollTo("sec-why")} className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-black hover:underline cursor-pointer">
            <span>Inspect WHY traces</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
