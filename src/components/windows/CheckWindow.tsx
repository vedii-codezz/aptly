"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { sampleOpportunities } from "@/data/demo/opportunities";
import { OpportunityExtractionReviewModal } from "../modals/OpportunityExtractionReviewModal";
import { OpportunityExtractionOutput } from "@/lib/gemini/schemas/opportunity";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, ArrowUpRight } from "lucide-react";

export function CheckWindow() {
  const {
    activeOpportunity,
    currentAnalysis,
    isAnalyzing,
    analysisStepIndex,
    runAnalysis,
    setActiveOpportunity,
    openWindow,
    setSelectedRequirementId,
    activeProfile,
  } = useWorkspaceStore();

  const [inputMode, setInputMode] = useState<"demo" | "paste">("demo");
  const [customText, setCustomText] = useState("");
  const [isExtractingOpp, setIsExtractingOpp] = useState(false);
  const [extractingStage, setExtractingStage] = useState("");
  const [extractedOppResult, setExtractedOppResult] = useState<OpportunityExtractionOutput | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [oppError, setOppError] = useState<string | null>(null);

  const analysisSteps = [
    "APPLICANT TYPE",
    "EDUCATION CRITERIA",
    "SKILL REQUIREMENTS",
    "DEADLINES & LOCATION",
    "PROFILE EVIDENCE",
    "FINE PRINT",
    "VERDICT",
  ];

  const handleSelectSample = (index: number) => {
    const opp = sampleOpportunities[index];
    if (opp) {
      setActiveOpportunity(opp);
      runAnalysis(opp, activeProfile);
    }
  };

  const handleExtractOpportunity = async () => {
    if (!customText.trim() || isExtractingOpp) return;
    setIsExtractingOpp(true);
    setOppError(null);
    setExtractingStage("Reading opportunity text...");

    try {
      setTimeout(() => setExtractingStage("Separating mandatory criteria..."), 400);
      setTimeout(() => setExtractingStage("Finding preferred qualifications..."), 800);
      setTimeout(() => setExtractingStage("Detecting constraints & ambiguous wording..."), 1200);

      const res = await fetch("/api/gemini/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: customText }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setExtractedOppResult(json.data);
        setIsReviewModalOpen(true);
      } else {
        setOppError(json.error || "Extraction failed. Offline mode active.");
      }
    } catch (err: any) {
      setOppError("Network error or offline mode fallback.");
    } finally {
      setIsExtractingOpp(false);
      setExtractingStage("");
    }
  };

  const handleNavigateToWhy = (reqId?: string) => {
    if (reqId) setSelectedRequirementId(reqId);
    openWindow("WHY");
  };

  // Derive verdict display values
  const verdictConfig = currentAnalysis
    ? currentAnalysis.verdict.verdict === "CAN_APPLY"
      ? { lines: ["YOU", "CAN", "APPLY."], color: "text-aptly-match" }
      : currentAnalysis.verdict.verdict === "POSSIBLY_ELIGIBLE"
      ? { lines: ["POSSIBLY", "ELIGIBLE."], color: "text-aptly-partial" }
      : { lines: ["NOT", "CURRENTLY", "ELIGIBLE."], color: "text-aptly-fail" }
    : null;

  const stats = currentAnalysis?.verdict.stats;
  const noAnalysis = !currentAnalysis && !isAnalyzing;

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* ─── Control Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 flex flex-wrap items-center gap-3 shrink-0">
        <div className="inline-flex rounded-control border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
          <button
            onClick={() => setInputMode("demo")}
            className={cn(
              "px-2.5 py-1 text-system-xs rounded-control transition-colors duration-micro",
              inputMode === "demo" ? "bg-black text-white" : "text-[var(--color-text-muted)] hover:text-black"
            )}
          >
            DEMO
          </button>
          <button
            onClick={() => setInputMode("paste")}
            className={cn(
              "px-2.5 py-1 text-system-xs rounded-control transition-colors duration-micro",
              inputMode === "paste" ? "bg-black text-white" : "text-[var(--color-text-muted)] hover:text-black"
            )}
          >
            PASTE
          </button>
        </div>

        {inputMode === "demo" ? (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {sampleOpportunities.map((opp, idx) => (
              <button
                key={opp.id}
                onClick={() => handleSelectSample(idx)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-sans font-medium rounded-control border whitespace-nowrap transition-all duration-micro",
                  activeOpportunity.id === opp.id
                    ? "bg-black text-white border-black"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-black"
                )}
              >
                {opp.title.replace("SAMPLE / ", "")}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={handleExtractOpportunity}
            disabled={!customText.trim() || isExtractingOpp}
            className="px-3 py-1 bg-black text-white rounded-control text-system-xs flex items-center gap-1.5 hover:bg-[#222] disabled:opacity-40 transition-colors duration-micro"
          >
            <Sparkles className="w-3 h-3 opacity-60" />
            <span>EXTRACT WITH AI</span>
          </button>
        )}
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 overflow-y-auto">
        {/* Paste textarea */}
        {inputMode === "paste" && (
          <div className="p-4 border-b border-[var(--color-border-subtle)]">
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste the opportunity description, eligibility requirements, or job posting..."
              disabled={isExtractingOpp}
              className="w-full text-sm font-sans p-3 border border-[var(--color-border)] rounded-control focus:outline-none focus:border-[var(--color-border-strong)] resize-none bg-[var(--color-surface)] placeholder:text-[var(--color-text-ghost)]"
            />
            <div className="mt-2 text-[10px] text-[var(--color-text-ghost)] font-sans">
              Text is processed by Gemini for structured requirement extraction. You&apos;ll review before analysis.
            </div>

            {isExtractingOpp && (
              <div className="mt-2 p-2.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-control text-xs font-sans text-[var(--color-text-secondary)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
                <span>{extractingStage || "Reading opportunity..."}</span>
              </div>
            )}

            {oppError && (
              <div className="mt-2 p-2.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control text-xs font-sans text-aptly-fail">
                {oppError}
              </div>
            )}
          </div>
        )}

        {/* ─── Empty State ─── */}
        {noAnalysis && inputMode === "demo" && (
          <div className="flex-1 flex items-center justify-center py-24 px-6">
            <div className="text-center space-y-3 max-w-md">
              <h2 className="type-display text-display-md text-black">
                Nothing to inspect yet.
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] font-sans">
                Select a demo opportunity above, or switch to paste mode and drop in the fine print.
              </p>
            </div>
          </div>
        )}

        {/* ─── Analysis Sequence (while analyzing) ─── */}
        {isAnalyzing && (
          <div className="p-6 space-y-1">
            <div className="type-system text-[var(--color-text-ghost)] mb-4">ANALYZING</div>
            {analysisSteps.map((step, i) => {
              const isDone = i < analysisStepIndex;
              const isCurrent = i === analysisStepIndex;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 py-1.5 font-sans text-sm transition-opacity duration-ui",
                    isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-30"
                  )}
                >
                  <span className="w-6 text-right text-system-xs text-[var(--color-text-ghost)] font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn(
                    "flex-1 font-mono text-xs tracking-wider uppercase",
                    isDone ? "text-black" : isCurrent ? "text-black" : "text-[var(--color-text-ghost)]"
                  )}>
                    {step}
                  </span>
                  <span className="text-system-xs text-[var(--color-text-ghost)]">
                    {isDone ? "DONE" : isCurrent ? "···" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Opportunity Header ─── */}
        {currentAnalysis && (
          <div className="p-4 md:p-6 space-y-8">
            {/* Meta row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="type-system text-[var(--color-text-muted)]">{activeOpportunity.type}</span>
                  {activeOpportunity.isSample && (
                    <span className="type-system text-[var(--color-text-ghost)]">· SAMPLE</span>
                  )}
                </div>
                <h2 className="text-lg font-semibold font-sans text-black tracking-tight">
                  {activeOpportunity.title.replace("SAMPLE / ", "")}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)] font-sans">
                  <span>{activeOpportunity.organization}</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span>{activeOpportunity.location}</span>
                  <span className="text-[var(--color-border)]">·</span>
                  <span className="text-black font-medium">{activeOpportunity.deadlineRelative}</span>
                </div>
              </div>

              <button
                onClick={() => handleNavigateToWhy()}
                className="px-3 py-1.5 border border-[var(--color-border)] rounded-control text-system-xs text-[var(--color-text-muted)] hover:text-black hover:border-[var(--color-border-strong)] transition-colors duration-micro flex items-center gap-1.5"
              >
                <span>INSPECT IN WHY</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* ─── Verdict Hero ─── */}
            {verdictConfig && (
              <div className="py-6 md:py-10 border-y border-[var(--color-border-subtle)]">
                <div className="space-y-0">
                  {verdictConfig.lines.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "type-display text-display-lg",
                        i === verdictConfig.lines.length - 1 ? verdictConfig.color : "text-black"
                      )}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Inline stats */}
                {stats && (
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-sans">
                    <span className="text-aptly-match font-medium">{stats.mandatoryMatched} passed</span>
                    <span className="text-[var(--color-border)]">·</span>
                    <span className="text-aptly-partial font-medium">{stats.mandatoryUnknown} unknown</span>
                    <span className="text-[var(--color-border)]">·</span>
                    <span className="text-aptly-fail font-medium">{stats.mandatoryFailed} failed</span>
                    <span className="text-[var(--color-border)]">·</span>
                    <span className="text-[var(--color-text-muted)]">{currentAnalysis.evaluatedRequirements.length} total requirements</span>
                  </div>
                )}

                {/* Summary */}
                <p className="mt-4 text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed max-w-2xl">
                  {currentAnalysis.verdict.summary}
                </p>
              </div>
            )}

            {/* ─── Requirement Ledger ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="type-system text-[var(--color-text-muted)]">
                  REQUIREMENTS · {currentAnalysis.evaluatedRequirements.length}
                </span>
                <span className="text-[10px] text-[var(--color-text-ghost)] font-sans">
                  Click to inspect evidence
                </span>
              </div>

              <div className="divide-y divide-[var(--color-border-subtle)]">
                {currentAnalysis.evaluatedRequirements.map((req, idx) => {
                  const statusColor =
                    req.status === "MATCHED" ? "text-aptly-match"
                    : req.status === "PARTIAL" ? "text-aptly-partial"
                    : req.status === "FAILED" ? "text-aptly-fail"
                    : "text-aptly-unknown";

                  const statusIcon =
                    req.status === "MATCHED" ? "✓"
                    : req.status === "PARTIAL" ? "◐"
                    : req.status === "FAILED" ? "✕"
                    : "?";

                  return (
                    <button
                      key={req.id}
                      onClick={() => handleNavigateToWhy(req.id)}
                      className="w-full text-left py-3 px-1 flex items-center gap-3 group hover:bg-[var(--color-surface-muted)] transition-colors duration-micro rounded-control"
                    >
                      {/* Index */}
                      <span className="w-6 text-right text-system-xs text-[var(--color-text-ghost)] font-mono shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      {/* Importance */}
                      <span className={cn(
                        "w-20 text-system-xs shrink-0",
                        req.importance === "MANDATORY" ? "text-aptly-fail" : "text-[var(--color-text-ghost)]"
                      )}>
                        {req.importance}
                      </span>

                      {/* Title + evidence */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-sans font-medium text-black truncate group-hover:underline">
                          {req.title}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] truncate font-sans">
                          {req.profileEvidenceText || req.sourceText || "No evidence"}
                        </div>
                      </div>

                      {/* Status */}
                      <span className={cn("text-system-xs shrink-0 w-16 text-right font-mono", statusColor)}>
                        {statusIcon} {req.status}
                      </span>

                      {/* Arrow */}
                      <ChevronRight className="w-3 h-3 text-[var(--color-text-ghost)] group-hover:text-black shrink-0 transition-transform duration-micro group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <OpportunityExtractionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        extractedData={extractedOppResult}
      />
    </div>
  );
}
