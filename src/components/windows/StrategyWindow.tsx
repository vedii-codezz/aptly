"use client";

import React from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";

export function StrategyWindow() {
  const {
    activeStrategyPlan,
    activeOpportunity,
    openWindow,
    openImproveWithPlan,
    navigateToProfileField,
  } = useWorkspaceStore();

  if (!activeStrategyPlan) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 select-none">
        <div className="text-center space-y-3 max-w-sm">
          <div className="type-display text-display-md text-black">
            No active strategy.
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Run an opportunity analysis in APTLY/CHECK to generate your customized application briefing.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openWindow("CHECK")}
              className="px-4 py-2 bg-black text-white text-system-xs rounded-control hover:bg-[#222] transition-colors duration-micro inline-flex items-center gap-1.5"
            >
              <span>OPEN APTLY/CHECK</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    readinessState,
    applyDecision,
    emphasize,
    improveGaps,
    positioning,
    preparationTopics,
    timelinePlan,
  } = activeStrategyPlan;

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
    <div className="flex flex-col h-full bg-[var(--color-surface)] font-sans">
      {/* ─── Header Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="type-system text-black">
            APPLICATION BRIEFING
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-sans truncate max-w-xs">
            · {activeOpportunity.title.replace("SAMPLE / ", "")}
          </span>
        </div>

        <span className="type-system text-[var(--color-text-muted)]">
          READINESS: {readinessState.replace(/_/g, " ")}
        </span>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
        {/* SIGNATURE DECISION HERO */}
        <div className="py-6 md:py-8 border-b border-[var(--color-border-subtle)] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="type-system text-[var(--color-text-muted)]">
              STRATEGY DECISION · {decisionConfig.badgeText}
            </span>
            {timelinePlan.deadlineText && (
              <span className="text-xs font-mono text-[var(--color-text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timelinePlan.deadlineText}
              </span>
            )}
          </div>

          <div className="space-y-0">
            {decisionConfig.lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "type-display text-display-lg",
                  i === decisionConfig.lines.length - 1 ? decisionConfig.color : "text-black"
                )}
              >
                {line}
              </div>
            ))}
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-2xl">
            {applyDecision.reasoning}
          </p>

          {applyDecision.decision === "FIX_ONE_THING_FIRST" && (
            <div className="pt-2">
              <button
                onClick={() => navigateToProfileField("gpa")}
                className="px-4 py-2 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
              >
                <span>ADD MISSING GPA IN PROFILE →</span>
              </button>
            </div>
          )}
        </div>

        {/* 01 / EMPHASIZE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="type-system text-[var(--color-text-muted)]">
              01 / EMPHASIZE · PROVEN STRENGTHS
            </span>
            <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
              TOP PROVEN SIGNALS
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle)]">
            {emphasize.map((emp) => (
              <div key={emp.id} className="py-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-black font-sans">{emp.title}</div>
                <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">{emp.why}</p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-[var(--color-text-muted)] font-mono pt-1">
                  <div>
                    <span>Evidence: </span>
                    <span className="text-black">{emp.sources.join(", ")}</span>
                  </div>
                  <div>
                    <span>Placement: </span>
                    <span className="text-black">{emp.placement.join(" · ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 02 / IMPROVE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="type-system text-[var(--color-text-muted)]">
              02 / IMPROVE · TIMING & STRATEGY
            </span>
            <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
              PROPORTIONAL EFFORT
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle)]">
            {improveGaps.map((imp) => (
              <div key={imp.id} className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-black font-sans">{imp.title}</span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-control bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                    {imp.priority}
                  </span>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] font-sans">{imp.why}</p>

                <div className="p-2.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] text-xs text-black font-sans">
                  <strong>Timing Advice: </strong>{imp.timingAdvice}
                </div>

                <button
                  onClick={() => openImproveWithPlan(imp.planId)}
                  className="text-xs font-sans font-medium text-black hover:underline flex items-center gap-1 pt-0.5"
                >
                  <span>Open Roadmap in APTLY/IMPROVE →</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 03 / POSITIONING */}
        <div className="space-y-3">
          <span className="type-system text-[var(--color-text-muted)]">
            03 / POSITION · RESUME HIERARCHY
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1.5">
              <div className="type-system text-aptly-match">LEAD WITH (TOP OF RESUME)</div>
              <ul className="space-y-1 text-[var(--color-text-secondary)] text-[11px] font-sans">
                {positioning.leadWith.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1.5">
              <div className="type-system text-[var(--color-text-muted)]">SUPPORTING SECTIONS</div>
              <ul className="space-y-1 text-[var(--color-text-secondary)] text-[11px] font-sans">
                {positioning.supportingSection.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-aptly-fail-bg rounded-control border border-aptly-fail-border space-y-1.5">
              <div className="type-system text-aptly-fail">DE-EMPHASIZE / REMOVE</div>
              <ul className="space-y-1 text-aptly-fail text-[11px] font-sans">
                {positioning.deEmphasize.map((item, i) => (
                  <li key={i}>✕ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 04 / PREPARE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="type-system text-[var(--color-text-muted)]">
              04 / PREPARE · TARGETED TOPICS
            </span>
            <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
              DERIVED FROM LISTING
            </span>
          </div>

          <div className="divide-y divide-[var(--color-border-subtle)]">
            {preparationTopics.map((prep) => (
              <div key={prep.id} className="py-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black font-sans">{prep.topic}</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded-control bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] uppercase">
                    {prep.urgency}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--color-text-ghost)] font-mono">
                  Origin: {prep.sourceReq}
                </div>
                <div className="space-y-0.5 pl-2 border-l-2 border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)] pt-1 font-sans">
                  {prep.focusAreas.map((area, i) => (
                    <div key={i}>• {area}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 05 / COUNTDOWN SCHEDULE */}
        <div className="p-5 bg-black text-white rounded-control space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
            <div>
              <div className="type-system text-emerald-400">
                05 / APPLICATION PLAN
              </div>
              <h4 className="text-sm font-bold text-white font-sans mt-0.5">
                Targeted Countdown Schedule
              </h4>
            </div>

            {timelinePlan.deadlineText && (
              <span className="text-[10px] text-stone-400 border border-stone-700 px-2 py-0.5 rounded-control">
                Deadline: {timelinePlan.deadlineText}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {timelinePlan.schedule.map((slot, idx) => (
              <div key={idx} className="p-3 bg-stone-950 rounded-control border border-stone-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  [{slot.dayLabel}]
                </div>

                <div className="space-y-1.5">
                  {slot.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-2 rounded-control text-xs flex items-start justify-between gap-3 font-sans",
                        task.isBlocker
                          ? "bg-amber-950/60 text-amber-200 border border-amber-800/80 font-medium"
                          : "bg-stone-900 text-stone-300 border border-stone-800"
                      )}
                    >
                      <span>• {task.task}</span>
                      <span className="text-[9px] uppercase text-stone-500 shrink-0 font-mono">
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
    </div>
  );
}
