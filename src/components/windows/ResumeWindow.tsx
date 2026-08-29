"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ResumeRequirementState, BulletQuality } from "@/types/resume";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Zap,
} from "lucide-react";

export function ResumeWindow() {
  const {
    activeResume,
    resumeFitAnalysis,
    pastedResumeText,
    setResumeText,
    loadDemoResume,
    selectedResumeTraceId,
    setSelectedResumeTraceId,
    selectedResumeBulletId,
    setSelectedResumeBulletId,
    openWindow,
    setActiveWhyTab,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<
    "TRACES" | "DISCONNECTS" | "EVIDENCE" | "BULLETS" | "RAW"
  >("TRACES");

  if (!resumeFitAnalysis || !activeResume) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 select-none">
        <div className="text-center space-y-3 max-w-sm">
          <div className="type-display text-display-md text-black">
            Your resume hasn&apos;t entered the room yet.
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-sans">
            Paste your resume text or load our structured demo resume to analyze requirement communication and evidence proof.
          </p>
          <div className="pt-2">
            <button
              onClick={loadDemoResume}
              className="px-4 py-2 bg-black text-white text-system-xs rounded-control hover:bg-[#222] transition-colors duration-micro inline-flex items-center gap-1.5"
            >
              <span>LOAD DEMO RESUME</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, traces, claimedEvidence, inspectedBullets, fixDecision, disconnects } = resumeFitAnalysis;

  const currentTrace =
    traces.find((t) => t.requirementId === selectedResumeTraceId) || traces[0];

  const currentBullet =
    inspectedBullets.find((b) => b.id === selectedResumeBulletId) || inspectedBullets[0];

  const commBadgeStyles: Record<ResumeRequirementState, string> = {
    CLEARLY_COMMUNICATED: "text-aptly-match bg-aptly-match-bg border-aptly-match-border font-bold",
    PARTIALLY_COMMUNICATED: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border font-bold",
    WEAKLY_COMMUNICATED: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border font-bold",
    NOT_COMMUNICATED: "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] border-[var(--color-border)]",
    NOT_APPLICABLE: "text-[var(--color-text-ghost)] bg-[var(--color-surface-muted)] border-[var(--color-border-subtle)]",
  };

  const qualityBadgeStyles: Record<BulletQuality, string> = {
    STRONG: "text-aptly-match bg-aptly-match-bg border-aptly-match-border font-bold",
    CLEAR_BUT_THIN: "text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] border-[var(--color-border)] font-medium",
    VAGUE: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border font-bold",
    MISSING_EVIDENCE: "text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] border-[var(--color-border)]",
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] font-sans">
      {/* ─── Header Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="type-system text-black">
            RESUME INSPECTION
          </span>
          {activeResume.isDemo && (
            <span className="text-[9px] font-mono px-1 py-0.2 rounded-control bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
              DEMO (AARAV SHARMA)
            </span>
          )}
        </div>

        {/* Coverage Stats */}
        <div className="flex items-center gap-3 text-xs font-sans text-[var(--color-text-muted)]">
          <div>
            Mandatory: <strong className="text-black">{stats.mandatoryClearlyCommunicated}/{stats.mandatoryTotal}</strong> proven
          </div>
          <span className="text-[var(--color-border)]">·</span>
          <div>
            Preferred: <strong className="text-black">{stats.preferredClearlyCommunicated}/{stats.preferredTotal}</strong>
          </div>
          {stats.disconnectCount > 0 && (
            <>
              <span className="text-[var(--color-border)]">·</span>
              <span className="type-system text-aptly-partial">
                {stats.disconnectCount} DISCONNECT{stats.disconnectCount > 1 ? "S" : ""}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── Sub-Navigation Tabs ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0 select-none">
        {[
          { id: "TRACES", label: "REQUIREMENT COVERAGE" },
          { id: "DISCONNECTS", label: `PROFILE vs RESUME (${disconnects.length})` },
          { id: "EVIDENCE", label: `EVIDENCE CHECKER (${claimedEvidence.length})` },
          { id: "BULLETS", label: `BULLET INSPECTOR (${inspectedBullets.length})` },
          { id: "RAW", label: "PASTE / EDIT RESUME" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-2.5 py-1 rounded-control text-system-xs transition-colors duration-micro whitespace-nowrap",
              activeTab === tab.id
                ? "bg-black text-white"
                : "text-[var(--color-text-muted)] hover:text-black hover:bg-[var(--color-surface-muted)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* TAB 1: REQUIREMENT COVERAGE & TRACES (Split View) */}
        {activeTab === "TRACES" && (
          <div className="space-y-6">
            {/* Fix Decision Module */}
            <div className="p-4 border border-[var(--color-border)] rounded-control space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="type-system text-black">
                  DECISION: {fixDecision.badgeLabel}
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-ghost)] uppercase">
                  COMMUNICATION AUDIT
                </span>
              </div>
              <h4 className="text-sm font-semibold text-black font-sans">{fixDecision.headline}</h4>
              <p className="text-xs text-[var(--color-text-secondary)] font-sans">{fixDecision.reasoning}</p>
            </div>

            {/* Split Inspection View */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Requirements List */}
              <div className="md:col-span-5 border border-[var(--color-border-subtle)] rounded-control overflow-hidden divide-y divide-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <div className="px-3 py-2 text-system-xs text-[var(--color-text-ghost)] bg-[var(--color-surface-muted)]">
                  OPPORTUNITY REQUIREMENTS
                </div>
                {traces.map((trace) => {
                  const isSelected = trace.requirementId === currentTrace.requirementId;
                  return (
                    <button
                      key={trace.requirementId}
                      onClick={() => setSelectedResumeTraceId(trace.requirementId)}
                      className={cn(
                        "w-full text-left p-3 space-y-1 transition-colors duration-micro block",
                        isSelected
                          ? "bg-[var(--color-surface-muted)] border-l-2 border-l-black"
                          : "hover:bg-[var(--color-surface-muted)]/60 text-[var(--color-text-secondary)]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <ImportanceBadge importance={trace.importance} />
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1 py-0.2 rounded-control border uppercase",
                            commBadgeStyles[trace.resumeState]
                          )}
                        >
                          {trace.resumeState.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-black font-sans truncate">{trace.requirementTitle}</div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Trace Details & Resume Excerpt */}
              <div className="md:col-span-7 p-4 md:p-5 border border-[var(--color-border)] rounded-control space-y-4 font-sans text-xs bg-[var(--color-surface)]">
                <div className="flex items-start justify-between flex-wrap gap-2 border-b border-[var(--color-border-subtle)] pb-3">
                  <div>
                    <span className="type-system text-[var(--color-text-muted)]">
                      REQUIREMENT EVIDENCE TRACE
                    </span>
                    <h3 className="text-sm font-bold text-black font-sans mt-0.5">
                      {currentTrace.requirementTitle}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-mono px-2 py-0.5 rounded-control border uppercase font-bold",
                      commBadgeStyles[currentTrace.resumeState]
                    )}
                  >
                    {currentTrace.resumeState.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Candidate Profile Evidence Basis */}
                <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1">
                  <div className="type-system text-[var(--color-text-muted)]">
                    CANDIDATE PROFILE EVIDENCE
                  </div>
                  <div className="font-semibold text-black font-sans">
                    Evidence Strength: {currentTrace.profileEvidenceStrength}
                  </div>
                  <p className="text-[var(--color-text-secondary)] font-sans text-xs">{currentTrace.profileSummary}</p>
                </div>

                {/* Matched Resume Snippets */}
                <div className="space-y-2">
                  <div className="type-system text-[var(--color-text-muted)]">
                    DETECTED RESUME EVIDENCE ({currentTrace.resumeEvidenceLocations.length})
                  </div>
                  {currentTrace.resumeEvidenceLocations.length > 0 ? (
                    currentTrace.resumeEvidenceLocations.map((loc, i) => (
                      <div key={i} className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control space-y-1">
                        <span className="text-[9px] font-mono uppercase text-[var(--color-text-muted)] font-bold">
                          [{loc.sectionType}] SECTION:
                        </span>
                        <div className="text-black bg-[var(--color-surface)] p-2 rounded-control border border-[var(--color-border-subtle)] font-mono text-[11px]">
                          {loc.snippet}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control text-[var(--color-text-muted)] italic font-sans">
                      No matching keywords or project descriptions found in current resume text.
                    </div>
                  )}
                </div>

                {/* Verdict & Action */}
                <div className="p-3 bg-black text-white rounded-control space-y-1 font-sans">
                  <div className="type-system text-[var(--color-text-ghost)]">VERDICT & ACTION</div>
                  <p className="text-xs text-stone-300">{currentTrace.communicationVerdict}</p>
                  {currentTrace.actionRecommendation && (
                    <div className="text-amber-300 font-mono text-[11px] pt-1">
                      → {currentTrace.actionRecommendation}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[var(--color-border-subtle)] text-xs">
                  <button
                    onClick={() => {
                      setActiveWhyTab("IMPROVE");
                      openWindow("WHY");
                    }}
                    className="text-[var(--color-text-muted)] hover:text-black flex items-center gap-1 font-sans"
                  >
                    <span>Inspect Requirement in APTLY/WHY</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIGNATURE DISCOVERY — YOU HAVE IT. YOUR RESUME DOESN'T SHOW IT. */}
        {activeTab === "DISCONNECTS" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="type-display text-display-md text-black">
                YOU HAVE IT.
                <br />
                <span className="text-aptly-partial">YOUR RESUME DOESN&apos;T SHOW IT.</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] font-sans max-w-xl">
                Discrepancies where you possess verified profile evidence, but your resume fails to communicate it clearly to recruiters or screening tools.
              </p>
            </div>

            {disconnects.length === 0 ? (
              <div className="p-8 border border-[var(--color-border)] rounded-control text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-aptly-match mx-auto" />
                <h5 className="text-sm font-semibold text-black font-sans">NO PROFILE-RESUME DISCONNECTS</h5>
                <p className="text-xs text-[var(--color-text-muted)] font-sans">
                  All verified qualifications in your background are appropriately communicated on your resume.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disconnects.map((disc) => (
                  <div key={disc.id} className="p-4 md:p-5 border border-black rounded-control space-y-3 bg-[var(--color-surface)]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-bold text-black font-sans">
                        {disc.requirementTitle}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 bg-aptly-match-bg text-aptly-match border border-aptly-match-border rounded-control font-semibold text-[10px]">
                          PROFILE: {disc.profileStrength}
                        </span>
                        <span className="px-2 py-0.5 bg-aptly-partial-bg text-aptly-partial border border-aptly-partial-border rounded-control font-semibold text-[10px]">
                          RESUME: {disc.resumeStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] font-sans leading-relaxed">
                      {disc.whyItMatters}
                    </p>

                    <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] text-xs text-black font-sans">
                      <strong>Recommended Fix: </strong>{disc.howToFix}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => setActiveTab("BULLETS")}
                        className="px-3.5 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                      >
                        <span>INSPECT & FIX BULLETS →</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLAIMED EVIDENCE CHECKER */}
        {activeTab === "EVIDENCE" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="type-system text-[var(--color-text-muted)]">
                  CLAIMED SKILLS EVIDENCE CHECKER
                </span>
                <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
                  Verifies that skills claimed on your resume are backed by demonstrable projects or coursework.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                {claimedEvidence.length} Total Claims
              </span>
            </div>

            <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border)] rounded-control bg-[var(--color-surface)]">
              {claimedEvidence.map((item, idx) => (
                <div key={idx} className="p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-black font-sans">{item.skill}</span>
                      <span className="text-[9px] font-mono text-[var(--color-text-ghost)] uppercase">
                        [{item.resumeLocations.join(", ")}]
                      </span>
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded-control border uppercase font-bold",
                        item.hasEvidenceWarning
                          ? "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border"
                          : "text-aptly-match bg-aptly-match-bg border-aptly-match-border"
                      )}
                    >
                      EVIDENCE: {item.profileEvidenceStrength}
                    </span>
                  </div>

                  {/* Supporting Sources Checklist */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={cn(item.supportingSources.skills ? "text-aptly-match font-medium" : "text-[var(--color-text-ghost)]")}>
                      Skills: {item.supportingSources.skills ? "✓" : "✗"}
                    </span>
                    <span className={cn(item.supportingSources.projects ? "text-aptly-match font-medium" : "text-[var(--color-text-ghost)]")}>
                      Projects: {item.supportingSources.projects ? "✓" : "✗"}
                    </span>
                    <span className={cn(item.supportingSources.experience ? "text-aptly-match font-medium" : "text-[var(--color-text-ghost)]")}>
                      Experience: {item.supportingSources.experience ? "✓" : "✗"}
                    </span>
                    <span className={cn(item.supportingSources.github ? "text-aptly-match font-medium" : "text-[var(--color-text-ghost)]")}>
                      GitHub: {item.supportingSources.github ? "✓" : "✗"}
                    </span>
                  </div>

                  {/* Evidence Warning */}
                  {item.hasEvidenceWarning && (
                    <div className="p-2.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control text-xs text-aptly-fail font-sans space-y-1">
                      <div className="font-bold font-mono flex items-center gap-1 text-[10px]">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        UNSUPPORTED SKILL WARNING
                      </div>
                      <p>{item.warningMessage}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BULLET INSPECTOR & REWRITE */}
        {activeTab === "BULLETS" && (
          <div className="space-y-6">
            <div>
              <span className="type-system text-[var(--color-text-muted)]">
                BULLET INSPECTOR
              </span>
              <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
                Evaluate project bullets against the Action + Work + Tech + Result standard without fabricating metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Bullet Selector */}
              <div className="md:col-span-5 border border-[var(--color-border-subtle)] rounded-control overflow-hidden divide-y divide-[var(--color-border-subtle)] bg-[var(--color-surface)]">
                <div className="px-3 py-2 text-system-xs text-[var(--color-text-ghost)] bg-[var(--color-surface-muted)]">
                  PROJECT BULLETS
                </div>
                {inspectedBullets.map((b) => {
                  const isSelected = b.id === currentBullet.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedResumeBulletId(b.id)}
                      className={cn(
                        "w-full text-left p-3 space-y-1 transition-colors duration-micro block",
                        isSelected ? "bg-[var(--color-surface-muted)] border-l-2 border-l-black" : "hover:bg-[var(--color-surface-muted)]/60 text-[var(--color-text-secondary)]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)] font-semibold truncate max-w-[150px]">
                          {b.projectNameOrContext}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1 py-0.2 rounded-control border uppercase",
                            qualityBadgeStyles[b.quality]
                          )}
                        >
                          {b.quality.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-black font-sans line-clamp-2">{b.rawText}</p>
                    </button>
                  );
                })}
              </div>

              {/* Bullet Inspector Details */}
              <div className="md:col-span-7 p-4 md:p-5 border border-[var(--color-border)] rounded-control space-y-4 font-sans text-xs bg-[var(--color-surface)]">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--color-border-subtle)] pb-3">
                  <div>
                    <span className="type-system text-[var(--color-text-muted)]">
                      CONTEXT: {currentBullet.projectNameOrContext}
                    </span>
                    <div className="mt-1">
                      <span
                        className={cn(
                          "text-[9px] font-mono px-2 py-0.5 rounded-control border uppercase font-bold",
                          qualityBadgeStyles[currentBullet.quality]
                        )}
                      >
                        {currentBullet.quality.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Raw Bullet */}
                <div className="space-y-1">
                  <span className="type-system text-[var(--color-text-muted)]">CURRENT BULLET:</span>
                  <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control text-black font-sans text-xs">
                    &ldquo;{currentBullet.rawText}&rdquo;
                  </div>
                </div>

                {/* What Works vs What's Missing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-aptly-match-bg rounded-control border border-aptly-match-border space-y-1 font-sans">
                    <div className="type-system text-aptly-match">WHAT WORKS:</div>
                    <ul className="space-y-1 text-aptly-match text-[11px]">
                      {currentBullet.whatWorks.map((w, i) => (
                        <li key={i}>✓ {w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-aptly-fail-bg rounded-control border border-aptly-fail-border space-y-1 font-sans">
                    <div className="type-system text-aptly-fail">WHAT&apos;S MISSING:</div>
                    <ul className="space-y-1 text-aptly-fail text-[11px]">
                      {currentBullet.whatsMissing.map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Structure */}
                <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1">
                  <div className="type-system text-[var(--color-text-muted)]">RECOMMENDED STRUCTURE:</div>
                  <div className="text-black font-mono text-xs font-medium">
                    {currentBullet.recommendedFormula}
                  </div>
                </div>

                {/* Sample Rewrite */}
                {currentBullet.suggestedRewriteSample && (
                  <div className="p-4 bg-aptly-partial-bg border border-aptly-partial-border rounded-control space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="type-system text-aptly-partial">
                        SAMPLE REWRITE
                      </span>
                      <span className="text-[9px] font-mono bg-white text-aptly-partial px-1.5 py-0.2 rounded-control border border-aptly-partial-border font-bold">
                        ADAPT TO REAL EXPERIENCE
                      </span>
                    </div>
                    <p className="text-xs text-black font-sans leading-relaxed">
                      &ldquo;{currentBullet.suggestedRewriteSample}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PASTE / EDIT RESUME TEXT */}
        {activeTab === "RAW" && (
          <div className="p-5 border border-[var(--color-border)] rounded-control space-y-4 font-sans text-xs bg-[var(--color-surface)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="type-system text-black">RESUME TEXT INPUT</span>
                <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
                  Paste plaintext resume content to run instant deterministic communication analysis.
                </p>
              </div>
              <button
                onClick={loadDemoResume}
                className="px-3 py-1.5 bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-active)] text-black rounded-control border border-[var(--color-border)] flex items-center gap-1 text-system-xs transition-colors duration-micro"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RELOAD DEMO RESUME</span>
              </button>
            </div>

            <textarea
              rows={18}
              value={pastedResumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your plain-text resume here..."
              className="w-full p-3 font-mono text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control focus:outline-none focus:border-black leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}
