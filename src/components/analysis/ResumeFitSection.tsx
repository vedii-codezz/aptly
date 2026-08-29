"use client";

import React, { useState } from "react";
import { ResumeFitAnalysis, BulletQuality } from "@/types/resume";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResumeFitSectionProps {
  resumeFit: ResumeFitAnalysis;
}

export function ResumeFitSection({ resumeFit }: ResumeFitSectionProps) {
  const { stats, disconnects, claimedEvidence, inspectedBullets } = resumeFit;
  const [expandedBulletId, setExpandedBulletId] = useState<string | null>(null);

  const qualityStyles: Record<BulletQuality, string> = {
    STRONG: "text-aptly-match bg-aptly-match-bg border-aptly-match-border font-bold",
    CLEAR_BUT_THIN: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)] font-medium",
    VAGUE: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border font-bold",
    MISSING_EVIDENCE: "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] border-[var(--color-border)]",
  };

  return (
    <section id="sec-resume" className="py-12 border-b border-[var(--color-border-subtle)] space-y-12 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          08 / RESUME FIT — EVIDENCE &amp; PROOF CHECKER
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          Resume Communication &amp; Disconnects
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Comparing candidate background proof against uploaded resume text to catch hidden qualifications.
        </p>
      </div>

      {/* Signature Moment: YOU HAVE IT. YOUR RESUME DOESN'T SHOW IT. */}
      <div className="space-y-6 pb-6 border-b border-[var(--color-border-subtle)]">
        <div className="space-y-1 select-none">
          <div className="font-serif font-normal text-2xl md:text-4xl lg:text-5xl text-black leading-tight">
            YOU HAVE IT.
            <br />
            <span className="text-aptly-partial">YOUR RESUME DOESN&apos;T SHOW IT.</span>
          </div>
          <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-2xl pt-2">
            Discrepancies where your profile possesses verified experience, but the resume fails to communicate it clearly to screening systems.
          </p>
        </div>

        {disconnects.length === 0 ? (
          <div className="py-6 text-sm text-aptly-match flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-aptly-match shrink-0" />
            <span>No profile-resume disconnects detected. All qualifications are clearly communicated.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {disconnects.map((disc) => (
              <div key={disc.id} className="p-6 border border-black rounded-control space-y-4 bg-[var(--color-surface)]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-lg font-bold text-black font-sans">
                    {disc.requirementTitle}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-1 bg-aptly-match-bg text-aptly-match border border-aptly-match-border rounded-control font-bold text-[10px]">
                      PROFILE: {disc.profileStrength}
                    </span>
                    <span className="px-2.5 py-1 bg-aptly-partial-bg text-aptly-partial border border-aptly-partial-border rounded-control font-bold text-[10px]">
                      RESUME: {disc.resumeStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed">
                  {disc.whyItMatters}
                </p>

                <div className="p-4 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] text-xs text-black font-sans leading-relaxed">
                  <strong>Recommended Bullet Fix: </strong>{disc.howToFix}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Line-by-Line Bullet Inspector */}
      <div className="space-y-4">
        <div className="border-b border-black pb-2 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
            RESUME BULLET CRITIQUE &amp; REWRITES ({inspectedBullets.length})
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {inspectedBullets.map((bullet) => {
            const isExpanded = expandedBulletId === bullet.id;

            return (
              <div key={bullet.id} className="py-4 space-y-2 text-xs font-sans">
                <div
                  onClick={() => setExpandedBulletId(isExpanded ? null : bullet.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black text-sm group-hover:underline">
                        {bullet.projectNameOrContext}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0.2 rounded-control border uppercase font-bold",
                          qualityStyles[bullet.quality]
                        )}
                      >
                        {bullet.quality.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed line-clamp-1">
                      &ldquo;{bullet.rawText}&rdquo;
                    </p>
                  </div>

                  <button type="button" className="text-[10px] font-mono text-[var(--color-text-muted)] group-hover:text-black shrink-0 flex items-center gap-1">
                    <span>{isExpanded ? "Hide" : "Inspect"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 p-5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-control space-y-4 animate-fade-in text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-aptly-match-bg rounded-control border border-aptly-match-border space-y-1">
                        <div className="text-[10px] font-mono font-bold text-aptly-match uppercase">WHAT WORKS:</div>
                        <ul className="space-y-1 text-xs text-aptly-match">
                          {bullet.whatWorks.map((w, i) => (
                            <li key={i}>✓ {w}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-aptly-fail-bg rounded-control border border-aptly-fail-border space-y-1">
                        <div className="text-[10px] font-mono font-bold text-aptly-fail uppercase">WHAT&apos;S MISSING:</div>
                        <ul className="space-y-1 text-xs text-aptly-fail">
                          {bullet.whatsMissing.map((m, i) => (
                            <li key={i}>• {m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-[var(--color-surface)] rounded-control border border-[var(--color-border-subtle)] space-y-1">
                      <div className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase">RECOMMENDED FORMULA:</div>
                      <div className="text-black font-mono text-xs font-semibold">
                        {bullet.recommendedFormula}
                      </div>
                    </div>

                    {bullet.suggestedRewriteSample && (
                      <div className="p-4 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-aptly-partial uppercase">
                            SAMPLE REWRITE
                          </span>
                          <span className="text-[9px] font-mono bg-white text-aptly-partial px-1.5 py-0.2 rounded-control border border-aptly-partial-border font-bold">
                            ADAPT TO REAL EXPERIENCE
                          </span>
                        </div>
                        <p className="text-sm text-black font-sans leading-relaxed">
                          &ldquo;{bullet.suggestedRewriteSample}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
