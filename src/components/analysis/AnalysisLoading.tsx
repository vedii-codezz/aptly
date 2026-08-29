"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnalysisLoadingProps {
  currentStepIndex: number;
}

const ANALYSIS_STEPS = [
  "EDUCATION CRITERIA",
  "GRADUATION CONSTRAINTS",
  "REQUIRED SKILLS",
  "PREFERRED SIGNALS",
  "PROFILE EVIDENCE",
  "RESUME COMMUNICATION",
  "FINAL VERDICT",
];

export function AnalysisLoading({ currentStepIndex }: AnalysisLoadingProps) {
  return (
    <div className="py-16 max-w-xl mx-auto space-y-6 font-sans">
      <div className="text-center space-y-1.5">
        <div className="type-system text-[var(--color-text-muted)]">APTLY/READ</div>
        <h3 className="type-display text-display-md text-black">
          Reading the fine print.
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] font-sans">
          Evaluating opportunity requirements against candidate evidence.
        </p>
      </div>

      <div className="border border-[var(--color-border)] rounded-control p-5 bg-[var(--color-surface)] space-y-2 divide-y divide-[var(--color-border-subtle)]">
        {ANALYSIS_STEPS.map((step, i) => {
          const isDone = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 pt-2 first:pt-0 transition-opacity duration-ui",
                isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-30"
              )}
            >
              <span className="w-5 text-right text-[10px] text-[var(--color-text-ghost)] font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "flex-1 font-mono text-xs tracking-wider uppercase",
                  isDone ? "text-black font-semibold" : isCurrent ? "text-black" : "text-[var(--color-text-ghost)]"
                )}
              >
                {step}
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-14 text-right">
                {isDone ? "DONE ✓" : isCurrent ? "READING..." : "WAITING"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
