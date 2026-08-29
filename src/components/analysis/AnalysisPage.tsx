"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { AnalysisNavigation } from "./AnalysisNavigation";
import { ReportProgressRail } from "./ReportProgressRail";
import { VerdictSection } from "./VerdictSection";
import { RequirementsSection } from "./RequirementsSection";
import { WhySection } from "./WhySection";
import { FitSection } from "./FitSection";
import { GapsSection } from "./GapsSection";
import { ImproveSection } from "./ImproveSection";
import { StrategySection } from "./StrategySection";
import { ResumeFitSection } from "./ResumeFitSection";
import { ATSSection } from "./ATSSection";
import { AskAptlyDrawer } from "../shared/AskAptlyDrawer";
import { ChapterReveal } from "../motion/ChapterReveal";

interface AnalysisPageProps {
  onNewAnalysis: () => void;
}

export function AnalysisPage({ onNewAnalysis }: AnalysisPageProps) {
  const {
    currentAnalysis,
    activeStrategyPlan,
    activeImprovementPlans,
    resumeFitAnalysis,
    atsAnalysisResult,
    simulateAddSkillEvidence,
  } = useWorkspaceStore();

  const [isAskAptlyOpen, setIsAskAptlyOpen] = useState(false);

  if (!currentAnalysis) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-black font-sans selection:bg-black selection:text-white relative">
      {/* Minimal Sticky Reading Progress & Index Navigator */}
      <AnalysisNavigation
        onNewAnalysis={onNewAnalysis}
        onOpenAskAptly={() => setIsAskAptlyOpen(true)}
      />

      {/* Desktop Vertical Progress Rail */}
      <ReportProgressRail />

      {/* Wide Editorial Analysis Canvas */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-24 space-y-24 md:space-y-32 lg:space-y-36">
        {/* 01 / VERDICT */}
        <VerdictSection analysis={currentAnalysis} />

        {/* 02 / REQUIREMENTS */}
        <ChapterReveal>
          <RequirementsSection requirements={currentAnalysis.evaluatedRequirements} />
        </ChapterReveal>

        {/* 03 / WHY */}
        <ChapterReveal>
          <WhySection traces={currentAnalysis.requirementTraces} />
        </ChapterReveal>

        {/* 04 / FIT */}
        <ChapterReveal>
          <FitSection
            skillBreakdown={currentAnalysis.skillBreakdown}
            strengths={currentAnalysis.strengths}
            weakAreas={currentAnalysis.weakAreas}
          />
        </ChapterReveal>

        {/* 05 / GAPS */}
        <ChapterReveal>
          <GapsSection gaps={currentAnalysis.gaps} />
        </ChapterReveal>

        {/* 06 / IMPROVE */}
        {activeImprovementPlans.length > 0 && (
          <ChapterReveal>
            <ImproveSection
              plans={activeImprovementPlans}
              onSimulateEvidence={simulateAddSkillEvidence}
            />
          </ChapterReveal>
        )}

        {/* 07 / STRATEGY */}
        {activeStrategyPlan && (
          <ChapterReveal>
            <StrategySection strategy={activeStrategyPlan} />
          </ChapterReveal>
        )}

        {/* 08 / RESUME FIT */}
        {resumeFitAnalysis && (
          <ChapterReveal>
            <ResumeFitSection resumeFit={resumeFitAnalysis} />
          </ChapterReveal>
        )}

        {/* 09 / ATS */}
        {atsAnalysisResult && (
          <ChapterReveal>
            <ATSSection ats={atsAnalysisResult} />
          </ChapterReveal>
        )}
      </main>

      {/* Report Footer */}
      <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-6 md:px-12 py-8">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--color-text-muted)]">
          <span>APTLY/ · Know where you fit.</span>
          <span>Deterministic Eligibility Engine · Evidence Intelligence</span>
        </div>
      </footer>

      {/* Contextual Ask APTLY Drawer */}
      <AskAptlyDrawer
        isOpen={isAskAptlyOpen}
        onClose={() => setIsAskAptlyOpen(false)}
      />
    </div>
  );
}
