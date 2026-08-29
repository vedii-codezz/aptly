"use client";

import React from "react";
import { StrategyPlan } from "@/types/improvement";
import { MaskedReveal } from "../motion/MaskedReveal";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2 } from "lucide-react";

interface StrategySectionProps {
  strategy: StrategyPlan;
  onOpenProfileForGpa?: () => void;
}

export function StrategySection({
  strategy,
  onOpenProfileForGpa,
}: StrategySectionProps) {
  const {
    readinessState,
    applyDecision,
    emphasize,
    positioning,
    preparationTopics,
    timelinePlan,
  } = strategy;

  const decisionConfig = {
    APPLY_NOW: {
      lines: ["APPLY", "NOW."],
      color: "text-aptly-match",
      badgeText: "READY TO APPLY",
    },
    FIX_ONE_THING_FIRST: {
      lines: ["FIX ONE THING", "FIRST."],
      color: "text-aptly-partial",
      badgeText: "SINGLE BLOCKER",
    },
    RESOLVE_ELIGIBILITY_FIRST: {
      lines: ["RESOLVE", "ELIGIBILITY FIRST."],
      color: "text-aptly-fail",
      badgeText: "HARD CONSTRAINT",
    },
  }[applyDecision.decision] || {
    lines: ["REVIEW", "STRATEGY."],
    color: "text-black",
    badgeText: "ASSESSMENT",
  };

  return (
    <section id="sec-strategy" className="py-12 border-b border-[var(--color-border-subtle)] space-y-12 font-sans relative overflow-hidden">
      {/* Editorial Watermark */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 text-[10rem] md:text-[14rem] font-serif font-black text-black/[0.02] select-none pointer-events-none -z-10 leading-none -translate-y-10"
      >
        APTLY/07
      </div>

      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          07 / STRATEGY — APPLICATION BLUEPRINT
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          Application Decision &amp; Plan
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Deterministic readiness decision, positioning blueprint, and deadline-aware countdown schedule.
        </p>
      </div>

      {/* Dominant Decision Landmark Banner */}
      <div className="space-y-6 pb-8 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <span className="text-black font-bold uppercase tracking-wider">
            STRATEGY DECISION · {decisionConfig.badgeText}
          </span>
          {timelinePlan.deadlineText && (
            <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {timelinePlan.deadlineText}
            </span>
          )}
        </div>

        {/* Monumental Masked Newsreader Decision */}
        <MaskedReveal
          lines={decisionConfig.lines}
          lastLineColor={decisionConfig.color}
          staggerMs={130}
        />

        <p className="text-lg text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-3xl">
          {applyDecision.reasoning}
        </p>
      </div>

      {/* 4 Clean Briefing Chapters */}
      <div className="space-y-12">
        {/* 01 EMPHASIZE */}
        <div className="space-y-4">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
              01 / EMPHASIZE · KEY PROVEN STRENGTHS ({emphasize.length})
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-ghost)]">
              PLACEMENT STRATEGY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emphasize.map((emp) => (
              <div key={emp.id} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-2 text-xs">
                <h4 className="text-base font-bold text-black font-sans">{emp.title}</h4>
                <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">{emp.why}</p>
                <div className="pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[var(--color-text-muted)]">
                  <span>Evidence: {emp.sources.join(", ")}</span>
                  <span className="font-semibold text-black">{emp.placement.join(" · ")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 02 POSITION */}
        <div className="space-y-4">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
              02 / POSITION · RESUME SECTION HIERARCHY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-5 bg-aptly-match-bg border border-aptly-match-border rounded-control space-y-2">
              <div className="text-xs font-mono font-bold text-aptly-match uppercase">
                LEAD WITH (TOP OF RESUME)
              </div>
              <ul className="space-y-1.5 text-xs text-black">
                {positioning.leadWith.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-aptly-match font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--color-text-muted)] uppercase">
                SUPPORTING SECTIONS
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                {positioning.supportingSection.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[var(--color-text-ghost)]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control space-y-2">
              <div className="text-xs font-mono font-bold text-aptly-fail uppercase">
                DE-EMPHASIZE / REMOVE
              </div>
              <ul className="space-y-1.5 text-xs text-aptly-fail">
                {positioning.deEmphasize.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 03 PREPARE */}
        <div className="space-y-4">
          <div className="border-b border-black pb-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
              03 / PREPARE · TARGETED TECHNICAL INTERVIEW TOPICS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preparationTopics.map((prep) => (
              <div key={prep.id} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-black font-sans">{prep.topic}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-control bg-stone-100 text-stone-700 uppercase font-bold">
                    {prep.urgency}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[var(--color-text-ghost)]">
                  Derived from: {prep.sourceReq}
                </div>
                <div className="space-y-1 text-xs text-[var(--color-text-secondary)] font-sans pt-1">
                  {prep.focusAreas.map((area, i) => (
                    <div key={i}>• {area}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 04 COUNTDOWN SCHEDULE */}
        <div className="p-6 md:p-8 bg-black text-white rounded-control space-y-6 font-mono">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                04 / COUNTDOWN SCHEDULE
              </span>
              <h5 className="text-base font-bold text-white font-sans mt-0.5">
                Structured Application Milestones
              </h5>
            </div>

            {timelinePlan.deadlineText && (
              <span className="text-xs text-stone-400 border border-stone-700 px-3 py-1 rounded-control">
                Target Deadline: {timelinePlan.deadlineText}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {timelinePlan.schedule.map((slot, idx) => (
              <div key={idx} className="p-4 bg-stone-950 rounded-control border border-stone-800 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase">
                  [{slot.dayLabel}]
                </div>

                <div className="space-y-2">
                  {slot.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-2.5 rounded-control text-xs font-sans",
                        task.isBlocker
                          ? "bg-amber-950/70 text-amber-200 border border-amber-800"
                          : "bg-stone-900 text-stone-300 border border-stone-800"
                      )}
                    >
                      <div className="font-medium">• {task.task}</div>
                      <span className="text-[9px] uppercase text-stone-500 font-mono block mt-1">
                        {task.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
