"use client";

import React, { useState, useRef } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { LandingHero } from "@/components/landing/LandingHero";
import { AnalysisInput } from "@/components/input/AnalysisInput";
import { AnalysisLoading } from "@/components/analysis/AnalysisLoading";
import { AnalysisPage } from "@/components/analysis/AnalysisPage";

export default function HomePage() {
  const {
    isAnalyzing,
    analysisStepIndex,
    currentAnalysis,
    runAnalysis,
    loadDemoResume,
    loadSampleOpportunity,
  } = useWorkspaceStore();

  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDemo = () => {
    loadDemoResume();
    loadSampleOpportunity(0);
    scrollToInput();
  };

  const handleStartAnalysis = () => {
    setHasAnalyzed(true);
    runAnalysis();
  };

  const handleNewAnalysis = () => {
    setHasAnalyzed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If analysis completed and user has run it, show the single continuous report
  if (hasAnalyzed && !isAnalyzing && currentAnalysis) {
    return <AnalysisPage onNewAnalysis={handleNewAnalysis} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] selection:bg-black selection:text-white font-sans">
      {/* Editorial Landing Hero */}
      <LandingHero
        onEnter={scrollToInput}
        onDemo={handleDemo}
      />

      {/* Two-Column Input Workspace */}
      <section
        id="input-workspace"
        ref={inputRef}
        className="px-4 md:px-8 lg:px-16 py-16 md:py-24 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="type-system text-[var(--color-text-muted)]">
              INPUT WORKSPACE
            </div>
            <h2 className="type-display text-display-md text-black">
              Drop your resume. Drop the opportunity.
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] font-sans max-w-xl">
              Upload your documents or paste plaintext. APTLY extracts requirements and evaluates eligibility with 100% deterministic precision.
            </p>
          </div>

          {isAnalyzing ? (
            <AnalysisLoading currentStepIndex={analysisStepIndex} />
          ) : (
            <AnalysisInput onStartAnalysis={handleStartAnalysis} />
          )}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="px-6 md:px-12 lg:px-20 py-6 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface)]">
        <span>APTLY/ · Know where you fit.</span>
        <span className="hidden sm:inline">Deterministic Hybrid Eligibility Engine</span>
      </footer>
    </div>
  );
}
