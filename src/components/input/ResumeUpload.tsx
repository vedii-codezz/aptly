"use client";

import React, { useState, useRef } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { parseDocumentFile } from "@/lib/file-parsing/extractText";
import { parseResumeText } from "@/lib/resume/parser";
import { createProfileFromResume } from "@/lib/resume/profileAdapter";
import { ResumeReview } from "./ResumeReview";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileCode,
  Edit3,
} from "lucide-react";

export type ParseStage =
  | "idle"
  | "reading"
  | "extracting"
  | "structuring"
  | "mapping"
  | "ready"
  | "error";

export function ResumeUpload() {
  const {
    activeResume,
    pastedResumeText,
    setResumeText,
    loadDemoResume,
    activeProfile,
    updateProfile,
  } = useWorkspaceStore();

  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseStage, setParseStage] = useState<ParseStage>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  // This belongs to the visible upload transaction, not the global/demo resume.
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessText = (rawText: string, fileName?: string) => {
    setParseStage("structuring");
    setResumeText(rawText);
    const parsedDoc = parseResumeText(rawText, false);

    setParseStage("mapping");
    const adaptedProfile = createProfileFromResume(parsedDoc, activeProfile);
    updateProfile(() => adaptedProfile);

    if (fileName) setUploadedFileName(fileName);
    setUploadError(null);
    setParseStage("ready");
  };

  const beginUpload = () => {
    setUploadError(null);
    setUploadedFileName(null);
    setIsReviewOpen(false);
    setParseStage("reading");
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    beginUpload();

    try {
      // Small tick for UI feedback
      await new Promise((r) => setTimeout(r, 100));
      setParseStage("extracting");

      const result = await parseDocumentFile(file);

      if (!result.success || !result.text) {
        // Invariant: an error transaction never renders a current-upload success.
        setUploadedFileName(null);
        setParseStage("error");
        setUploadError(
          result.error ||
            "Unable to parse this document. Please ensure it is a valid text-based PDF, Word (.docx), or plain text (.txt) file, or paste your resume text directly."
        );
      } else {
        handleProcessText(result.text, file.name);
      }
    } catch (e: any) {
      setParseStage("error");
      setUploadError(
        e.message || "Error reading file. Please paste your resume text instead."
      );
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Do not let preloaded demo/Zustand resume data masquerade as this upload.
  const isLoaded = parseStage === "ready" && uploadError === null;

  const stageLabels: Record<ParseStage, string> = {
    idle: "READY",
    reading: "READING DOCUMENT...",
    extracting: "EXTRACTING TEXT & STRUCTURE...",
    structuring: "IDENTIFYING SECTIONS & SKILLS...",
    mapping: "MAPPING CANDIDATE EVIDENCE...",
    ready: "READY ✓",
    error: "PARSE NOTICE",
  };

  return (
    <div className="border border-[var(--color-border)] rounded-control p-5 bg-[var(--color-surface)] space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="type-system text-black font-semibold">
              YOUR RESUME
            </span>
            {isLoaded && (
              <span className="text-[9px] font-mono bg-aptly-match-bg text-aptly-match px-1.5 py-0.2 rounded-control border border-aptly-match-border font-bold">
                READY ✓
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] font-sans mt-0.5">
            Drop PDF, DOCX or TXT, or paste plaintext.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex rounded-control border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-0.5">
          <button
            onClick={() => setInputMode("upload")}
            className={cn(
              "px-2.5 py-1 text-system-xs rounded-control transition-colors duration-micro",
              inputMode === "upload" ? "bg-black text-white" : "text-[var(--color-text-muted)] hover:text-black"
            )}
          >
            FILE UPLOAD
          </button>
          <button
            onClick={() => setInputMode("paste")}
            className={cn(
              "px-2.5 py-1 text-system-xs rounded-control transition-colors duration-micro",
              inputMode === "paste" ? "bg-black text-white" : "text-[var(--color-text-muted)] hover:text-black"
            )}
          >
            PASTE TEXT
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      {inputMode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!isProcessing) {
              if (fileInputRef.current) fileInputRef.current.value = "";
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            "border-2 border-dashed rounded-control p-6 text-center cursor-pointer transition-all duration-micro space-y-2 select-none",
            isDragging
              ? "border-black bg-[var(--color-surface-active)]"
              : isLoaded
              ? "border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]"
              : "border-[var(--color-border)] hover:border-black hover:bg-[var(--color-surface-muted)]"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {isProcessing ? (
            <div className="py-6 space-y-3 relative overflow-hidden">
              {/* Document Scan Line - Active Cobalt Signal */}
              <div className="absolute left-0 right-0 h-[2px] bg-[var(--color-accent)] shadow-[0_0_8px_rgba(36,87,255,0.4)] animate-doc-scan pointer-events-none" />

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono font-bold text-[var(--color-accent)] uppercase tracking-wider">
                  PARSING DOCUMENT
                </div>
                <div className="text-xs font-mono text-black font-bold tracking-wide">
                  {stageLabels[parseStage]}
                </div>
              </div>

              {/* Connected Real Stage Markers */}
              <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono pt-1">
                <span className={cn(parseStage === "reading" ? "text-[var(--color-accent)] font-bold" : parseStage !== "idle" ? "text-black font-semibold" : "text-[var(--color-text-ghost)]")}>
                  01 READ
                </span>
                <span className="text-[var(--color-text-ghost)]">›</span>
                <span className={cn(parseStage === "extracting" ? "text-[var(--color-accent)] font-bold" : ["structuring", "mapping", "ready"].includes(parseStage) ? "text-black font-semibold" : "text-[var(--color-text-ghost)]")}>
                  02 EXTRACT
                </span>
                <span className="text-[var(--color-text-ghost)]">›</span>
                <span className={cn(parseStage === "structuring" ? "text-[var(--color-accent)] font-bold" : ["mapping", "ready"].includes(parseStage) ? "text-black font-semibold" : "text-[var(--color-text-ghost)]")}>
                  03 STRUCTURE
                </span>
                <span className="text-[var(--color-text-ghost)]">›</span>
                <span className={cn(parseStage === "mapping" ? "text-[var(--color-accent)] font-bold" : parseStage === "ready" ? "text-[var(--color-success)] font-bold" : "text-[var(--color-text-ghost)]")}>
                  04 EVIDENCE
                </span>
              </div>
            </div>
          ) : isLoaded ? (
            <div className="space-y-1.5 py-1">
              <div className="flex items-center justify-center gap-1.5 text-aptly-match font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>RESUME LOADED</span>
              </div>
              <div className="text-sm font-semibold text-black font-sans">
                {uploadedFileName || "Resume Document"}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--color-text-muted)] font-mono">
                <span>{activeResume.sections.length} sections</span>
                <span>·</span>
                <span>{activeResume.detectedSkills.length} skills</span>
                <span>·</span>
                <span>{activeResume.projects.length} projects</span>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReviewOpen(!isReviewOpen);
                  }}
                  className="px-3 py-1 bg-black text-white rounded-control text-system-xs hover:bg-[#222] transition-colors"
                >
                  {isReviewOpen ? "HIDE REVIEW ↑" : "REVIEW PARSED DATA →"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control text-system-xs text-[var(--color-text-secondary)] hover:text-black transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-3">
              <Upload className="w-6 h-6 text-[var(--color-text-muted)] mx-auto" />
              <div>
                <div className="text-xs font-semibold text-black font-sans">
                  Drop your resume here, or <span className="underline">browse files</span>
                </div>
                <div className="text-[10px] text-[var(--color-text-ghost)] font-mono mt-0.5">
                  Supports PDF (.pdf), Word (.docx), or plain text (.txt) · Max 10MB
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Paste Mode */}
      {inputMode === "paste" && (
        <div className="space-y-2">
          <textarea
            rows={7}
            value={pastedResumeText}
            onChange={(e) => handleProcessText(e.target.value, "Pasted_Resume_Text.txt")}
            placeholder="Paste your plain-text resume here (Education, Skills, Projects, Experience)..."
            className="w-full text-xs font-mono p-3 border border-[var(--color-border)] rounded-control focus:outline-none focus:border-black bg-[var(--color-surface)] resize-none placeholder:text-[var(--color-text-ghost)]"
          />
          <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
            <span>{pastedResumeText.length} characters</span>
            <button
              onClick={() => setIsReviewOpen(!isReviewOpen)}
              className="font-bold underline text-black hover:opacity-80"
            >
              {isReviewOpen ? "Hide Review ↑" : "Review Parsed Data →"}
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control space-y-2 text-xs text-aptly-fail font-sans">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[10px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DOCUMENT PARSE NOTICE</span>
          </div>
          <p className="text-[11px] leading-relaxed">{uploadError}</p>
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => setInputMode("paste")}
              className="px-2.5 py-1 bg-black text-white rounded-control text-system-xs hover:bg-[#222] font-mono"
            >
              PASTE RESUME TEXT INSTEAD →
            </button>
            <button
              onClick={() => {
                setUploadError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
              className="px-2.5 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control text-system-xs text-black hover:bg-[var(--color-surface-muted)] font-mono"
            >
              TRY ANOTHER FILE
            </button>
          </div>
        </div>
      )}

      {/* Review Drawer / Panel */}
      <ResumeReview
        profile={activeProfile}
        resume={activeResume}
        onUpdateProfile={updateProfile}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />
    </div>
  );
}
