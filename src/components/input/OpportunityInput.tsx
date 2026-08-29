"use client";

import React, { useState, useRef } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { sampleOpportunities } from "@/data/demo/opportunities";
import { OpportunityType, Opportunity } from "@/types/opportunity";
import { parseDocumentFile } from "@/lib/file-parsing/extractText";
import { OpportunityExtractionOutput } from "@/lib/gemini/schemas/opportunity";
import { OpportunityExtractionReviewModal } from "../modals/OpportunityExtractionReviewModal";
import { OpportunityReview } from "./OpportunityReview";
import { cn } from "@/lib/utils";
import {
  Upload,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const OPPORTUNITY_TYPES: OpportunityType[] = [
  "INTERNSHIP",
  "JOB",
  "FELLOWSHIP",
  "SCHOLARSHIP",
  "HACKATHON",
  "RESEARCH",
  "COMPETITION",
  "PROGRAM",
  "OTHER",
];

export function OpportunityInput() {
  const {
    activeOpportunity,
    setActiveOpportunity,
    loadSampleOpportunity,
    activeProfile,
  } = useWorkspaceStore();

  const [inputMode, setInputMode] = useState<"demo" | "paste" | "upload">("demo");
  const [customText, setCustomText] = useState("");
  const [selectedType, setSelectedType] = useState<OpportunityType>(activeOpportunity.type);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractingStage, setExtractingStage] = useState("");
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<OpportunityExtractionOutput | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCriteriaReviewOpen, setIsCriteriaReviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (idx: number) => {
    loadSampleOpportunity(idx);
    setSelectedType(sampleOpportunities[idx]?.type || "INTERNSHIP");
  };

  const handleExtractWithAI = async (textToExtract: string) => {
    if (!textToExtract.trim() || isExtracting) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractingStage("Reading opportunity text...");

    try {
      setTimeout(() => setExtractingStage("Separating mandatory criteria..."), 400);
      setTimeout(() => setExtractingStage("Finding preferred qualifications..."), 800);
      setTimeout(() => setExtractingStage("Detecting constraints & dates..."), 1200);

      const res = await fetch("/api/gemini/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToExtract }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setExtractedResult(json.data);
        setIsReviewModalOpen(true);
      } else {
        setExtractionError(json.error || "Extraction failed. Falling back to offline rule parser.");
      }
    } catch (err: any) {
      setExtractionError("Network error during extraction. Please review text directly.");
    } finally {
      setIsExtracting(false);
      setExtractingStage("");
    }
  };

  const handleFileUpload = async (file: File) => {
    const parsed = await parseDocumentFile(file);
    if (parsed.success && parsed.text) {
      setCustomText(parsed.text);
      handleExtractWithAI(parsed.text);
    } else {
      setExtractionError(parsed.error || "Unable to read document file.");
    }
  };

  const isLoaded = activeOpportunity.requirements.length > 0;

  return (
    <div className="border border-[var(--color-border)] rounded-control p-5 bg-[var(--color-surface)] space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="type-system text-black font-semibold">
              OPPORTUNITY
            </span>
            {isLoaded && (
              <span className="text-[9px] font-mono bg-aptly-match-bg text-aptly-match px-1.5 py-0.2 rounded-control border border-aptly-match-border font-bold">
                READY ✓
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] font-sans mt-0.5">
            Select a sample opportunity, paste fine print, or upload a document.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex rounded-control border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-0.5">
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
          <button
            onClick={() => setInputMode("upload")}
            className={cn(
              "px-2.5 py-1 text-system-xs rounded-control transition-colors duration-micro",
              inputMode === "upload" ? "bg-black text-white" : "text-[var(--color-text-muted)] hover:text-black"
            )}
          >
            UPLOAD
          </button>
        </div>
      </div>

      {/* Type Selector Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono text-[var(--color-text-ghost)] uppercase shrink-0">
          TYPE:
        </span>
        {OPPORTUNITY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setActiveOpportunity({ ...activeOpportunity, type });
            }}
            className={cn(
              "px-2 py-0.5 rounded-control text-[10px] font-mono uppercase border transition-colors duration-micro whitespace-nowrap",
              selectedType === type
                ? "bg-black text-white border-black"
                : "bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:text-black"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Demo Scenario Picker */}
      {inputMode === "demo" && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleOpportunities.map((opp, idx) => {
              const isSelected = activeOpportunity.id === opp.id;
              return (
                <button
                  key={opp.id}
                  onClick={() => handleSelectSample(idx)}
                  className={cn(
                    "p-3 rounded-control border text-left transition-all duration-micro space-y-1 block",
                    isSelected
                      ? "border-black bg-[var(--color-surface-muted)] shadow-subtle"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase font-semibold">
                      {opp.type}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-text-ghost)]">
                      {opp.requirements.length} criteria
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-black font-sans line-clamp-1">
                    {opp.title.replace("SAMPLE / ", "")}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">
                    {opp.organization} · {opp.deadlineRelative}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
            <span>{activeOpportunity.title.replace("SAMPLE / ", "")} selected</span>
            <button
              onClick={() => setIsCriteriaReviewOpen(!isCriteriaReviewOpen)}
              className="font-bold underline text-black hover:opacity-80"
            >
              {isCriteriaReviewOpen ? "Hide Criteria ↑" : "Review Requirements →"}
            </button>
          </div>
        </div>
      )}

      {/* Paste Opportunity Text */}
      {inputMode === "paste" && (
        <div className="space-y-3">
          <textarea
            rows={5}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste job posting, internship eligibility criteria, fellowship guidelines, or hackathon rules..."
            disabled={isExtracting}
            className="w-full text-xs font-mono p-3 border border-[var(--color-border)] rounded-control focus:outline-none focus:border-black bg-[var(--color-surface)] resize-none placeholder:text-[var(--color-text-ghost)]"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
              AI separates mandatory criteria from preferred signals
            </span>
            <button
              onClick={() => handleExtractWithAI(customText)}
              disabled={!customText.trim() || isExtracting}
              className="px-3.5 py-1.5 bg-black hover:bg-[#222] disabled:opacity-40 text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3 h-3 opacity-60" />
              <span>EXTRACT REQUIREMENTS</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload Opportunity Document */}
      {inputMode === "upload" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--color-border)] hover:border-black rounded-control p-6 text-center cursor-pointer transition-all duration-micro space-y-2 bg-[var(--color-surface-muted)]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-[var(--color-text-muted)] mx-auto" />
          <div className="text-xs font-semibold text-black font-sans">
            Upload Opportunity Brief / Terms (.pdf, .docx, .txt)
          </div>
          <div className="text-[10px] text-[var(--color-text-ghost)] font-mono">
            Automatically reads and extracts criteria via Gemini
          </div>
        </div>
      )}

      {/* Extraction Status */}
      {isExtracting && (
        <div className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-control text-xs font-mono text-black flex items-center gap-2">
          <span className="w-2 h-2 bg-black rounded-full animate-ping" />
          <span>{extractingStage || "Processing opportunity..."}</span>
        </div>
      )}

      {/* Extraction Error */}
      {extractionError && (
        <div className="p-3 bg-aptly-fail-bg border border-aptly-fail-border rounded-control text-xs text-aptly-fail font-sans">
          {extractionError}
        </div>
      )}

      {/* Compact Criteria Review */}
      <OpportunityReview
        opportunity={activeOpportunity}
        isOpen={isCriteriaReviewOpen}
        onClose={() => setIsCriteriaReviewOpen(false)}
      />

      {/* Extraction Review Modal */}
      <OpportunityExtractionReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        extractedData={extractedResult}
      />
    </div>
  );
}
