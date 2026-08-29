"use client";

import React from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ResumeUpload } from "./ResumeUpload";
import { OpportunityInput } from "./OpportunityInput";
import { ArrowRight, Sparkles, Check, AlertCircle } from "lucide-react";
import { MagneticButton } from "../motion/MagneticButton";
import { cn } from "@/lib/utils";

interface AnalysisInputProps {
  onStartAnalysis: () => void;
}

export function AnalysisInput({ onStartAnalysis }: AnalysisInputProps) {
  const {
    activeResume,
    pastedResumeText,
    activeOpportunity,
    isAnalyzing,
  } = useWorkspaceStore();

  const isResumeReady = activeResume.sections.length > 0 || pastedResumeText.trim().length > 0;
  const isOpportunityReady = activeOpportunity.requirements.length > 0;
  const canAnalyze = isResumeReady && isOpportunityReady && !isAnalyzing;

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Readiness Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[var(--color-border)] rounded-control bg-[var(--color-surface-muted)] text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isResumeReady ? "bg-aptly-match" : "bg-[var(--color-text-ghost)]"
              )}
            />
            <span className={cn("font-medium", isResumeReady ? "text-black" : "text-[var(--color-text-muted)]")}>
              01 RESUME {isResumeReady ? "READY ✓" : "REQUIRED"}
            </span>
          </div>
          <span className="text-[var(--color-border)]">·</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isOpportunityReady ? "bg-aptly-match" : "bg-[var(--color-text-ghost)]"
              )}
            />
            <span className={cn("font-medium", isOpportunityReady ? "text-black" : "text-[var(--color-text-muted)]")}>
              02 OPPORTUNITY {isOpportunityReady ? "READY ✓" : "REQUIRED"}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[var(--color-text-muted)] font-mono">
          APTLY deterministic hybrid eligibility engine
        </div>
      </div>

      {/* Two-Column Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumeUpload />
        <OpportunityInput />
      </div>

      {/* Prominent Primary CTA with Subtle Magnetic Interaction */}
      <div className="text-center pt-2">
        <MagneticButton
          onClick={onStartAnalysis}
          disabled={!canAnalyze}
          className={cn(
            "group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-control text-sm font-sans font-bold shadow-subtle transition-all duration-ui",
            canAnalyze
              ? "bg-black hover:bg-[#222] text-white cursor-pointer hover:shadow-command active:scale-[0.985]"
              : "bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[var(--color-text-ghost)] cursor-not-allowed opacity-60"
          )}
        >
          <Sparkles className={cn("w-4 h-4 transition-transform group-hover:scale-110", canAnalyze ? "opacity-90" : "opacity-30")} />
          <span>ANALYZE MY FIT</span>
          <ArrowRight className={cn("w-4 h-4 transition-transform duration-micro group-hover:translate-x-1", canAnalyze ? "text-white" : "text-[var(--color-text-ghost)]")} />
        </MagneticButton>

        {!canAnalyze && (
          <p className="text-[11px] text-[var(--color-text-muted)] font-sans mt-2">
            {!isResumeReady && !isOpportunityReady
              ? "Provide your resume and an opportunity to begin analysis."
              : !isResumeReady
              ? "Please provide your resume above."
              : "Please select or provide an opportunity above."}
          </p>
        )}
      </div>
    </div>
  );
}
