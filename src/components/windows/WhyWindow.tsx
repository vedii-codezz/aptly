"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { WhyTab } from "@/types/workspace";
import { StatusBadge } from "../shared/StatusBadge";
import { TrustTag } from "../shared/TrustTag";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  BarChart3,
  TrendingUp,
  Target,
  Sparkles,
  FileText,
  ShieldCheck,
  Code2,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle as QuestionIcon,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Check,
} from "lucide-react";

export function WhyWindow() {
  const {
    currentAnalysis,
    activeWhyTab,
    setActiveWhyTab,
    activeOpportunity,
    openWindow,
    selectedRequirementId,
    setSelectedRequirementId,
    navigateToProfileField,
    navigateToRequirementInCheck,
  } = useWorkspaceStore();

  const [selectedTraceId, setSelectedTraceId] = useState<string>(
    selectedRequirementId || currentAnalysis?.evaluatedRequirements[0]?.id || "req-1"
  );

  const tabs: Array<{ id: WhyTab; label: string; icon: React.ElementType }> = [
    { id: "OVERVIEW", label: "OVERVIEW", icon: BarChart3 },
    { id: "FIT", label: "FIT & EVIDENCE", icon: Target },
    { id: "IMPROVE", label: "TRACES & GAPS", icon: Layers },
    { id: "STRATEGY", label: "STRATEGY", icon: Sparkles },
    { id: "RESUME", label: "RESUME FIT", icon: FileText },
    { id: "ATS", label: "ATS TERMINOLOGY", icon: ShieldCheck },
    { id: "SAMPLES", label: "SAMPLES", icon: Code2 },
  ];

  if (!currentAnalysis) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 select-none">
        <div className="text-center space-y-3 max-w-sm">
          <div className="type-display text-display-md text-black">
            No verdict.
            <br />
            No mystery.
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Analyze an opportunity in APTLY/CHECK first to inspect requirement traces and evidence.
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
    verdict,
    evaluatedRequirements,
    requirementTraces,
    skillBreakdown,
    gaps,
    strengths,
    weakAreas,
    nextBestActions,
  } = currentAnalysis;

  const currentTrace =
    requirementTraces.find((t) => t.requirementId === selectedTraceId) ||
    requirementTraces[0];

  const strengthBadgeStyles = {
    STRONG: "text-aptly-match bg-aptly-match-bg border-aptly-match-border",
    MODERATE: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)]",
    WEAK: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border",
    NOT_FOUND: "text-aptly-unknown bg-aptly-unknown-bg border-aptly-unknown-border",
  };

  const priorityStyles = {
    CRITICAL: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border font-bold",
    HIGH: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border font-bold",
    MEDIUM: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)] font-medium",
    LOW: "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] border-[var(--color-border-subtle)]",
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* ─── Top Tab Navigation Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-3 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0 select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeWhyTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveWhyTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-control text-system-xs transition-colors duration-micro whitespace-nowrap",
                isActive
                  ? "bg-black text-white"
                  : "text-[var(--color-text-muted)] hover:text-black hover:bg-[var(--color-surface-active)]"
              )}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Main Tab Content ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* OVERVIEW TAB */}
        {activeWhyTab === "OVERVIEW" && (
          <div className="space-y-6">
            {/* Verdict Recap Header */}
            <div className="pb-6 border-b border-[var(--color-border-subtle)] space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        verdict.verdict === "CAN_APPLY"
                          ? "MATCHED"
                          : verdict.verdict === "POSSIBLY_ELIGIBLE"
                          ? "PARTIAL"
                          : "FAILED"
                      }
                      size="sm"
                    />
                    <span className="type-system text-[var(--color-text-muted)]">
                      VERDICT EXPLAINABILITY
                    </span>
                  </div>
                  <h3 className="type-display text-display-md text-black">
                    {verdict.headline}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans">
                    {verdict.summary}
                  </p>
                </div>

                {/* Metrics Matrix */}
                <div className="flex items-center gap-2 font-mono text-center">
                  <div className="px-3 py-2 bg-aptly-match-bg border border-aptly-match-border rounded-control min-w-[64px]">
                    <div className="text-base font-bold text-aptly-match">{verdict.stats.matched}</div>
                    <div className="text-[9px] text-aptly-match uppercase tracking-wider">Matched</div>
                  </div>
                  <div className="px-3 py-2 bg-aptly-partial-bg border border-aptly-partial-border rounded-control min-w-[64px]">
                    <div className="text-base font-bold text-aptly-partial">{verdict.stats.partial}</div>
                    <div className="text-[9px] text-aptly-partial uppercase tracking-wider">Partial</div>
                  </div>
                  <div className="px-3 py-2 bg-aptly-fail-bg border border-aptly-fail-border rounded-control min-w-[64px]">
                    <div className="text-base font-bold text-aptly-fail">{verdict.stats.failed}</div>
                    <div className="text-[9px] text-aptly-fail uppercase tracking-wider">Failed</div>
                  </div>
                  <div className="px-3 py-2 bg-aptly-unknown-bg border border-aptly-unknown-border rounded-control min-w-[64px]">
                    <div className="text-base font-bold text-aptly-unknown">{verdict.stats.unknown}</div>
                    <div className="text-[9px] text-aptly-unknown uppercase tracking-wider">Unknown</div>
                  </div>
                </div>
              </div>

              {/* Requirement Summary Strip */}
              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between text-xs font-sans text-[var(--color-text-muted)] gap-2">
                <div>
                  <span className="font-semibold text-black">{verdict.stats.total} TOTAL REQUIREMENTS</span>
                  <span className="mx-2 text-[var(--color-border)]">·</span>
                  <span>{verdict.stats.mandatoryTotal} Mandatory ({verdict.stats.mandatoryMatched} satisfied, {verdict.stats.mandatoryUnknown} unknown)</span>
                  <span className="mx-2 text-[var(--color-border)]">·</span>
                  <span>{verdict.stats.preferredTotal} Preferred</span>
                </div>
                <button
                  onClick={() => setActiveWhyTab("IMPROVE")}
                  className="text-black font-medium hover:underline flex items-center gap-1 text-xs font-sans"
                >
                  <span>Inspect Traces</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Core Signals: Strongest Match vs Needs Attention */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* STRONGEST MATCH */}
              <div className="p-4 bg-aptly-match-bg border border-aptly-match-border rounded-control space-y-2">
                <div className="flex items-center justify-between">
                  <span className="type-system text-aptly-match flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    STRONGEST MATCH
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-control bg-white text-aptly-match border border-aptly-match-border font-bold">
                    {verdict.strongestMatch.evidenceCount} SOURCES
                  </span>
                </div>
                <h4 className="text-xs font-bold text-black font-sans">
                  {verdict.strongestMatch.title}
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
                  {verdict.strongestMatch.summary}
                </p>
                <div className="text-[10px] font-mono text-aptly-match pt-1 border-t border-aptly-match-border">
                  {verdict.strongestMatch.evidenceDetail}
                </div>
              </div>

              {/* NEEDS ATTENTION */}
              {verdict.needsAttention ? (
                <div className="p-4 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="type-system text-aptly-partial flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      NEEDS ATTENTION
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-control bg-white text-aptly-partial border border-aptly-partial-border font-bold">
                      {verdict.needsAttention.importance}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-black font-sans">
                    {verdict.needsAttention.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
                    {verdict.needsAttention.summary}
                  </p>
                  <div className="text-[10px] font-mono text-aptly-partial pt-1 border-t border-aptly-partial-border">
                    {verdict.needsAttention.evidenceDetail}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-control space-y-2">
                  <span className="type-system text-aptly-match flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    NO CRITICAL BLOCKERS
                  </span>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans">
                    All mandatory and preferred requirements are currently supported by candidate evidence.
                  </p>
                </div>
              )}
            </div>

            {/* UNRESOLVED / UNKNOWN INFORMATION */}
            {verdict.missingRequiredInfo.length > 0 && (
              <div className="p-4 bg-[var(--color-surface)] border border-black rounded-control space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="type-system text-aptly-fail flex items-center gap-1">
                      <QuestionIcon className="w-3.5 h-3.5" />
                      ACTION REQUIRED: UNRESOLVED PROFILE DATA
                    </div>
                    <h4 className="text-xs font-bold text-black font-sans mt-0.5">
                      {verdict.missingRequiredInfo[0].title} is currently UNKNOWN
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] font-sans mt-0.5">
                      This opportunity specifies a mandatory requirement, but your profile has no recorded data for it. Adding it triggers instant deterministic re-evaluation.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigateToProfileField(verdict.missingRequiredInfo[0].field)
                    }
                    className="px-3.5 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                  >
                    <span>{verdict.missingRequiredInfo[0].actionLabel} →</span>
                  </button>
                </div>
              </div>
            )}

            {/* NEXT BEST ACTIONS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="type-system text-[var(--color-text-muted)]">
                  WHAT SHOULD I DO NEXT?
                </span>
                <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
                  DETERMINISTIC ACTION PIPELINE
                </span>
              </div>

              <div className="divide-y divide-[var(--color-border-subtle)]">
                {nextBestActions.map((action) => (
                  <div
                    key={action.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-control bg-[var(--color-surface-muted)] border border-[var(--color-border)] flex items-center justify-center font-mono text-[10px] font-bold text-black shrink-0">
                        {action.stepNumber}
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-black font-sans">
                            {action.title}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-mono px-1 py-0.2 rounded-control border uppercase",
                              priorityStyles[action.priority]
                            )}
                          >
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] font-sans">{action.why}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (action.targetWindow === "PROFILE") {
                          navigateToProfileField(action.targetField || "gpa");
                        } else if (action.targetWindow === "WHY") {
                          setActiveWhyTab("IMPROVE");
                        } else if (action.targetWindow === "STRATEGY") {
                          openWindow("STRATEGY");
                        } else {
                          openWindow(action.targetWindow);
                        }
                      }}
                      className="px-3 py-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] text-black rounded-control border border-[var(--color-border)] text-system-xs transition-colors duration-micro shrink-0 flex items-center gap-1"
                    >
                      <span>{action.buttonLabel}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FIT & EVIDENCE TAB */}
        {activeWhyTab === "FIT" && (
          <div className="space-y-6">
            {/* Matched Skills with Evidence Tiers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="type-system text-[var(--color-text-muted)]">
                  MATCHED SKILLS ({skillBreakdown.matchedSkills.length})
                </span>
                <span className="text-[10px] text-aptly-match font-mono font-medium">
                  {skillBreakdown.matchedSkills.length} Verified
                </span>
              </div>

              <div className="divide-y divide-[var(--color-border-subtle)]">
                {skillBreakdown.matchedSkills.map((s, idx) => (
                  <div key={idx} className="py-3 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-sans text-black">{s.skill}</span>
                        <ImportanceBadge importance={s.importance} />
                        <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded-control bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                          {s.category || "Skill"}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0.5 rounded-control border uppercase font-bold",
                          strengthBadgeStyles[s.evidenceStrength]
                        )}
                      >
                        EVIDENCE: {s.evidenceStrength}
                      </span>
                    </div>

                    <div className="space-y-1 pl-2 border-l-2 border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-sans">
                      {s.evidence.map((ev) => (
                        <div key={ev.id}>
                          • <strong className="font-mono text-black text-[11px]">[{ev.source.toUpperCase()}]</strong>{" "}
                          {ev.title && <span className="font-medium text-black">{ev.title}: </span>}
                          {ev.description}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Required vs Preferred Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Missing Mandatory */}
              <div className="p-4 border border-[var(--color-border)] rounded-control space-y-3">
                <div className="type-system text-aptly-fail flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  MISSING MANDATORY SKILLS ({skillBreakdown.missingMandatorySkills.length})
                </div>
                {skillBreakdown.missingMandatorySkills.length === 0 ? (
                  <p className="text-xs text-aptly-match font-medium font-sans">
                    ✓ All mandatory technical skills are satisfied by verified evidence.
                  </p>
                ) : (
                  skillBreakdown.missingMandatorySkills.map((gap, i) => (
                    <div key={i} className="p-2.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control space-y-1 text-xs">
                      <div className="font-bold text-aptly-fail font-mono">{gap.skill}</div>
                      <p className="text-[var(--color-text-secondary)] font-sans">{gap.why}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Missing Preferred */}
              <div className="p-4 border border-[var(--color-border)] rounded-control space-y-3">
                <div className="type-system text-aptly-partial flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  PREFERRED SKILLS GAPS ({skillBreakdown.missingPreferredSkills.length})
                </div>
                {skillBreakdown.missingPreferredSkills.map((gap, i) => (
                  <div key={i} className="p-2.5 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-aptly-partial">{gap.skill}</span>
                      <span className="text-[9px] text-[var(--color-text-muted)] uppercase">
                        Evidence: {gap.evidenceStrength || "NOT FOUND"}
                      </span>
                    </div>
                    <p className="text-[var(--color-text-secondary)] font-sans">{gap.why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence-Backed Strengths */}
            <div className="space-y-3 pt-2">
              <span className="type-system text-[var(--color-text-muted)]">
                APPLICATION EVIDENCE STRENGTHS
              </span>
              <div className="space-y-2">
                {strengths.map((s, i) => (
                  <div key={i} className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-black font-sans">{s.title}</span>
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                        {s.evidenceItemsCount} verified items
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans">{s.detail}</p>
                    <div className="text-[10px] font-mono text-[var(--color-text-muted)] pt-0.5">
                      Source: {s.evidenceSource}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Application Evidence */}
            <div className="space-y-3 pt-2">
              <span className="type-system text-aptly-partial">
                WEAK EVIDENCE & RISKS
              </span>
              <div className="space-y-2">
                {weakAreas.map((w, i) => (
                  <div key={i} className="p-3 bg-aptly-partial-bg rounded-control border border-aptly-partial-border space-y-1">
                    <div className="text-xs font-semibold text-black font-sans">{w.title}</div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans">{w.detail}</p>
                    <div className="text-[10px] font-mono text-aptly-partial pt-0.5">
                      Impact: {w.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRACES & GAPS TAB (Requirement Trace System + 3-Tier Gap Model) */}
        {activeWhyTab === "IMPROVE" && (
          <div className="space-y-6">
            {/* Section 1: Requirement Trace Inspector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="type-system text-[var(--color-text-muted)]">
                    REQUIREMENT TRACE SYSTEM
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                  Trace {requirementTraces.findIndex((t) => t.requirementId === currentTrace.requirementId) + 1} of {requirementTraces.length}
                </span>
              </div>

              {/* Requirement Selector Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {requirementTraces.map((trace) => {
                  const isSelected = trace.requirementId === currentTrace.requirementId;
                  return (
                    <button
                      key={trace.requirementId}
                      onClick={() => setSelectedTraceId(trace.requirementId)}
                      className={cn(
                        "px-2.5 py-1 rounded-control text-[10px] font-mono border transition-all duration-micro whitespace-nowrap flex items-center gap-1.5",
                        isSelected
                          ? "bg-black text-white border-black font-bold"
                          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                      )}
                    >
                      <span>{trace.title}</span>
                      <StatusBadge status={trace.status} size="sm" />
                    </button>
                  );
                })}
              </div>

              {/* Selected Trace Visual Pipeline */}
              <div className="p-4 md:p-5 border border-[var(--color-border)] rounded-control space-y-4 font-mono">
                {/* Trace Header */}
                <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[var(--color-border-subtle)] pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                        REQUIREMENT #{currentTrace.requirementId}
                      </span>
                      <ImportanceBadge importance={currentTrace.importance} />
                      <TrustTag trust={currentTrace.trust} />
                    </div>
                    <h3 className="text-sm font-bold text-black font-sans">
                      {currentTrace.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={currentTrace.status} size="md" />
                    <button
                      onClick={() => navigateToRequirementInCheck(currentTrace.requirementId)}
                      className="px-2 py-1 text-[10px] border border-[var(--color-border)] rounded-control hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition-colors flex items-center gap-1"
                    >
                      <span>CHECK</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4-Step Investigative Flow */}
                <div className="space-y-3">
                  {/* STEP 1: SOURCE QUOTE */}
                  <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control space-y-1">
                    <div className="flex items-center justify-between text-[9px] uppercase text-[var(--color-text-muted)] font-bold">
                      <span>01 / SOURCE REQUIREMENT</span>
                      <TrustTag trust="FACT" />
                    </div>
                    <p className="text-xs text-black leading-relaxed font-mono">
                      &ldquo;{currentTrace.sourceQuote}&rdquo;
                    </p>
                    {currentTrace.highlightedPhrase && (
                      <div className="text-[10px] text-[var(--color-text-muted)] font-mono pt-0.5">
                        Key Parameter:{" "}
                        <span className="bg-aptly-partial-bg text-aptly-partial px-1 py-0.2 rounded font-bold">
                          {currentTrace.highlightedPhrase}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* STEP 2: NORMALIZED INTERPRETATION */}
                  <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control space-y-1">
                    <div className="flex items-center justify-between text-[9px] uppercase text-[var(--color-text-muted)] font-bold">
                      <span>02 / NORMALIZED INTERPRETATION</span>
                      <TrustTag trust={currentTrace.interpretation.trustClassification} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[var(--color-text-muted)]">Category: </span>
                        <strong className="text-black">{currentTrace.interpretation.categoryLabel}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Rule: </span>
                        <strong className="text-black">{currentTrace.interpretation.normalizedRule}</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-sans pt-0.5">
                      {currentTrace.interpretation.explanation}
                    </p>
                  </div>

                  {/* STEP 3: CANDIDATE PROFILE EVIDENCE */}
                  <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] uppercase text-[var(--color-text-muted)] font-bold">
                      <span>03 / CANDIDATE PROFILE EVIDENCE</span>
                      <span
                        className={cn(
                          "text-[9px] px-1 py-0.2 rounded-control border uppercase font-bold",
                          strengthBadgeStyles[currentTrace.evidenceTrace.evidenceStrength]
                        )}
                      >
                        STRENGTH: {currentTrace.evidenceTrace.evidenceStrength}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-black font-sans">
                      {currentTrace.evidenceTrace.matchedSummary}
                    </p>

                    {currentTrace.evidenceTrace.items.length > 0 ? (
                      <div className="space-y-1 pl-2 border-l-2 border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-sans">
                        {currentTrace.evidenceTrace.items.map((item, i) => (
                          <div key={i}>
                            • <strong className="text-black font-mono text-[11px]">[{item.source.toUpperCase()}]</strong>{" "}
                            {item.title && <span className="font-medium">{item.title}: </span>}
                            {item.description}
                          </div>
                        ))}
                      </div>
                    ) : currentTrace.evidenceTrace.isExplicitlyUnknown ? (
                      <div className="text-xs text-aptly-partial bg-aptly-partial-bg p-2 rounded-control border border-aptly-partial-border font-sans">
                        Field is currently unrecorded in your profile. Supply official transcript data in APTLY/PROFILE.
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--color-text-muted)] italic font-sans">
                        No supporting projects, coursework, or certifications detected for this requirement.
                      </div>
                    )}

                    {currentTrace.evidenceTrace.rawProfileField && (
                      <div className="text-[10px] text-[var(--color-text-ghost)] pt-0.5">
                        Field Origin: <code>{currentTrace.evidenceTrace.rawProfileField}</code>
                      </div>
                    )}
                  </div>

                  {/* STEP 4: DETERMINISTIC DECISION */}
                  <div className="p-3 bg-black text-white rounded-control space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] uppercase text-[var(--color-text-ghost)] font-bold">
                      <span>04 / DETERMINISTIC EVALUATION</span>
                      <StatusBadge status={currentTrace.decision.status} size="sm" />
                    </div>

                    <div className="text-xs font-mono text-emerald-400 font-bold">
                      {currentTrace.decision.comparisonLogic}
                    </div>

                    <p className="text-xs text-stone-300 font-sans leading-relaxed">
                      {currentTrace.decision.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: 3-Tier Gap Hierarchy */}
            <div className="space-y-4 pt-4 border-t border-[var(--color-border-subtle)]">
              <span className="type-system text-[var(--color-text-muted)]">
                TRIAGED GAP INTELLIGENCE
              </span>

              {/* 1. ELIGIBILITY GAPS */}
              <div className="border border-[var(--color-border)] rounded-control p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="type-system text-aptly-fail flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    1. ELIGIBILITY GAPS ({gaps.eligibilityGaps.length})
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">
                    MANDATORY DISQUALIFIERS
                  </span>
                </div>
                {gaps.eligibilityGaps.length === 0 ? (
                  <p className="text-xs text-aptly-match font-medium font-sans">
                    ✓ No mandatory eligibility blockers. All hard criteria are satisfied.
                  </p>
                ) : (
                  gaps.eligibilityGaps.map((gap) => (
                    <div key={gap.id} className="p-2.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between font-bold text-aptly-fail">
                        <span>{gap.title}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded-control bg-white border border-aptly-fail-border">
                          PRIORITY: {gap.priority}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-secondary)] font-sans">{gap.whyThisMatters}</p>
                      <div className="text-[10px] text-aptly-fail">
                        Next Action: {gap.nextAction}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 2. COMPETITIVENESS GAPS */}
              <div className="border border-[var(--color-border)] rounded-control p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="type-system text-aptly-partial flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    2. COMPETITIVENESS GAPS ({gaps.competitivenessGaps.length})
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">
                    PREFERRED QUALIFICATIONS
                  </span>
                </div>
                {gaps.competitivenessGaps.map((gap) => (
                  <div key={gap.id} className="p-3 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono flex-wrap gap-2">
                      <span className="font-bold text-black text-xs font-sans">{gap.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-control bg-white border border-aptly-partial-border text-aptly-partial font-bold">
                        {gap.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                      <div>
                        <span className="text-[var(--color-text-muted)]">Why this matters: </span>
                        <span className="text-black">{gap.whyThisMatters}</span>
                      </div>
                      <div>
                        <span className="text-[var(--color-text-muted)]">Current evidence: </span>
                        <span className="text-black">{gap.currentEvidence}</span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[var(--color-text-muted)]">
                      <strong>Next Action: </strong>{gap.nextAction}
                    </div>
                  </div>
                ))}
              </div>

              {/* 3. APPLICATION GAPS */}
              <div className="border border-[var(--color-border)] rounded-control p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="type-system text-aptly-unknown flex items-center gap-1.5">
                    <QuestionIcon className="w-3.5 h-3.5" />
                    3. APPLICATION GAPS ({gaps.applicationGaps.length})
                  </div>
                  <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">
                    UNRECORDED PROFILE FACTS
                  </span>
                </div>
                {gaps.applicationGaps.map((gap) => (
                  <div key={gap.id} className="p-3 bg-aptly-unknown-bg border border-aptly-unknown-border rounded-control space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono flex-wrap gap-2">
                      <span className="font-bold text-black font-sans">{gap.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-control bg-white border border-aptly-unknown-border text-aptly-unknown font-bold">
                        {gap.priority}
                      </span>
                    </div>
                    <p className="text-[var(--color-text-secondary)] font-sans">{gap.whyThisMatters}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-aptly-unknown-border">
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                        Next Action: {gap.nextAction}
                      </span>
                      {gap.actionTarget?.window === "PROFILE" && (
                        <button
                          onClick={() => navigateToProfileField(gap.actionTarget?.field || "gpa")}
                          className="text-xs font-mono font-bold underline text-black hover:opacity-80"
                        >
                          Open APTLY/PROFILE →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STRATEGY TAB */}
        {activeWhyTab === "STRATEGY" && (
          <div className="space-y-4 font-sans">
            <div className="p-5 border border-[var(--color-border)] rounded-control space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="type-display text-display-md text-black">
                    Application Strategy
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans">
                    Readiness assessment, countdown schedule, and Apply Now vs Improve First decision.
                  </p>
                </div>
                <button
                  onClick={() => openWindow("STRATEGY")}
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                >
                  <span>LAUNCH APTLY/STRATEGY</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] text-xs space-y-1 font-sans">
                <p className="text-black font-medium">
                  Your customized strategy briefing contains tailored EMPHASIZE, IMPROVE, POSITION, PREPARE, and a countdown schedule.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RESUME TAB */}
        {activeWhyTab === "RESUME" && (
          <div className="space-y-4 font-sans">
            <div className="p-5 border border-[var(--color-border)] rounded-control space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="type-display text-display-md text-black">
                    Resume Intelligence
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans">
                    Line-by-line Action + Work + Tech + Result analysis and disconnect detection.
                  </p>
                </div>
                <button
                  onClick={() => openWindow("RESUME")}
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                >
                  <span>LAUNCH APTLY/RESUME</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] text-xs space-y-1 font-sans">
                <p className="text-black font-medium">
                  Inspect your resume against opportunity criteria to catch disconnects where you have experience in your profile that isn&apos;t communicated on your resume.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ATS TAB */}
        {activeWhyTab === "ATS" && (
          <div className="space-y-4 font-sans">
            <div className="p-5 border border-[var(--color-border)] rounded-control space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="type-display text-display-md text-black">
                    ATS Terminology Audit
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans">
                    Screening readability, terminology coverage, and anti-keyword-stuffing guardrails.
                  </p>
                </div>
                <button
                  onClick={() => openWindow("ATS")}
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                >
                  <span>LAUNCH APTLY/ATS</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-aptly-partial-bg border border-aptly-partial-border rounded-control text-xs space-y-1.5 font-sans">
                <div className="font-bold text-aptly-partial font-mono text-[10px]">ANTI-KEYWORD-STUFFING GUARDRAIL</div>
                <p className="text-[var(--color-text-secondary)]">
                  Terminology is analyzed against verified profile evidence. Keywords without demonstrable experience are flagged rather than encouraged.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SAMPLES TAB */}
        {activeWhyTab === "SAMPLES" && (
          <div className="space-y-4 font-mono">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="type-system text-[var(--color-text-muted)]">
                  SAMPLE INTELLIGENCE & STRUCTURES
                </span>
                <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
                  Concrete application bullet, project description, and README structures.
                </p>
              </div>
              <span className="text-[9px] font-mono bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-control border border-[var(--color-border)] font-bold">
                ADAPT TO REAL EXPERIENCE
              </span>
            </div>

            <div className="space-y-4">
              {useWorkspaceStore.getState().activeSamples.map((sample) => (
                <div key={sample.id} className="p-4 border border-[var(--color-border)] rounded-control space-y-3 bg-[var(--color-surface)]">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--color-border-subtle)] pb-2">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">
                        {sample.category.replace(/_/g, " ")}
                      </div>
                      <h5 className="text-xs font-bold text-black font-sans">{sample.title}</h5>
                    </div>
                    <span className="text-[9px] font-mono bg-aptly-partial-bg text-aptly-partial border border-aptly-partial-border px-1.5 py-0.2 rounded font-bold">
                      {sample.disclaimer}
                    </span>
                  </div>

                  {sample.structuralProblem && (
                    <div className="p-2.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control text-xs text-aptly-fail font-sans">
                      <strong>Current Weakness: </strong>{sample.structuralProblem}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">
                      RECOMMENDED FORMULA:
                    </div>
                    <div className="text-xs text-black font-sans bg-[var(--color-surface-muted)] p-2 rounded-control border border-[var(--color-border-subtle)]">
                      <code>{sample.recommendedFormula}</code>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-[var(--color-text-muted)]">
                      EXEMPLARY SAMPLE OUTPUT:
                    </div>
                    <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control text-xs text-black font-sans leading-relaxed whitespace-pre-line">
                      {sample.sampleText}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[var(--color-border-subtle)] text-[11px] font-sans">
                    {sample.breakdown.map((b, i) => (
                      <div key={i} className="p-2 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)]">
                        <strong className="text-black font-mono">[{b.label}]: </strong>
                        <span className="text-[var(--color-text-secondary)]">{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
