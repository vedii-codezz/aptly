import { create } from "zustand";
import { WindowId, WhyTab } from "@/types/workspace";
import { StudentProfile } from "@/types/profile";
import { Opportunity } from "@/types/opportunity";
import { AnalysisResult } from "@/types/analysis";
import { ImprovementPlan, StrategyPlan } from "@/types/improvement";
import { SampleTemplate } from "@/types/sample";
import { ResumeDocument, ResumeFitAnalysis } from "@/types/resume";
import { ATSAnalysisResult } from "@/types/ats";
import { defaultStudentProfile } from "@/data/demo/defaultProfile";
import { sampleOpportunities } from "@/data/demo/opportunities";
import { defaultDemoResumeDocument, demoResumeRawText } from "@/data/demo/demoResume";
import { evaluateEligibility } from "@/lib/eligibility/engine";
import { buildImprovementPlans, buildStrategyPlan } from "@/lib/improvement/engine";
import { generateSampleTemplates } from "@/lib/samples/generator";
import { parseResumeText } from "@/lib/resume/parser";
import { evaluateResumeFit } from "@/lib/resume/engine";
import { evaluateATSFit } from "@/lib/ats/engine";
import { SkillEvidence } from "@/types/evidence";

interface WorkspaceState {
  // Window System
  openWindows: WindowId[];
  activeWindow: WindowId | null;
  minimizedWindows: WindowId[];
  maximizedWindows: WindowId[];
  windowPositions: Partial<Record<WindowId, { x: number; y: number }>>;
  windowZIndices: Partial<Record<WindowId, number>>;
  highestZIndex: number;

  // Active Context
  activeProfile: StudentProfile;
  activeOpportunity: Opportunity;
  currentAnalysis: AnalysisResult | null;
  activeWhyTab: WhyTab;
  savedOpportunityIds: string[];

  // Phase 4 Improvement & Strategy State
  activeImprovementPlans: ImprovementPlan[];
  selectedImprovementPlanId: string | null;
  activeStrategyPlan: StrategyPlan | null;
  activeSamples: SampleTemplate[];
  selectedSampleId: string | null;

  // Phase 5 Resume & ATS State
  activeResume: ResumeDocument;
  pastedResumeText: string;
  resumeFitAnalysis: ResumeFitAnalysis | null;
  atsAnalysisResult: ATSAnalysisResult | null;
  selectedResumeTraceId: string | null;
  selectedResumeBulletId: string | null;

  // Analysis Animation States
  isAnalyzing: boolean;
  analysisStepIndex: number;

  // Command Palette
  isCommandPaletteOpen: boolean;

  // Inspecting Requirement & Focused Field
  selectedRequirementId: string | null;
  activeProfileFocusedField: string | null;

  // Actions
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  toggleMaximizeWindow: (id: WindowId) => void;
  bringToFront: (id: WindowId) => void;
  setWindowPosition: (id: WindowId, pos: { x: number; y: number }) => void;
  setActiveWhyTab: (tab: WhyTab) => void;
  setActiveOpportunity: (opp: Opportunity) => void;
  updateProfile: (updater: (prev: StudentProfile) => StudentProfile) => void;
  runAnalysis: (opp?: Opportunity, prof?: StudentProfile) => void;
  toggleSaveOpportunity: (oppId: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedRequirementId: (reqId: string | null) => void;
  setActiveProfileFocusedField: (field: string | null) => void;
  navigateToRequirementInCheck: (reqId: string) => void;
  navigateToProfileField: (field: string) => void;
  setSelectedImprovementPlanId: (planId: string | null) => void;
  openImproveWithPlan: (planId?: string) => void;
  openStrategyWindow: () => void;
  setSelectedSampleId: (sampleId: string | null) => void;
  simulateAddSkillEvidence: (skillName: string, projectTitle?: string) => void;

  // Phase 5 Actions
  setResumeText: (text: string) => void;
  loadDemoResume: () => void;
  setSelectedResumeTraceId: (traceId: string | null) => void;
  setSelectedResumeBulletId: (bulletId: string | null) => void;
  openResumeWithRequirement: (reqId: string) => void;
  openATSWindow: () => void;
  loadSampleOpportunity: (index?: number) => void;
}

// Initial smart cascade offsets for windows
const defaultPositions: Partial<Record<WindowId, { x: number; y: number }>> = {
  CHECK: { x: 40, y: 55 },
  PROFILE: { x: 90, y: 70 },
  WHY: { x: 70, y: 60 },
  IMPROVE: { x: 100, y: 65 },
  STRATEGY: { x: 120, y: 75 },
  RESUME: { x: 80, y: 50 },
  ATS: { x: 130, y: 70 },
  EXPLORE: { x: 60, y: 65 },
  TRACK: { x: 110, y: 80 },
  SIMULATE: { x: 80, y: 70 },
  COMPARE: { x: 95, y: 75 },
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  const initialOpp = sampleOpportunities[0];
  const initialProfile = defaultStudentProfile;
  const initialAnalysis = evaluateEligibility(initialProfile, initialOpp);
  const initialPlans = buildImprovementPlans(initialAnalysis, initialOpp, initialProfile);
  const initialStrategy = buildStrategyPlan(initialAnalysis, initialOpp, initialProfile);
  const initialSamples = generateSampleTemplates(initialProfile, initialOpp);
  const initialResume = defaultDemoResumeDocument;
  const initialResumeFit = evaluateResumeFit(initialAnalysis, initialProfile, initialResume);
  const initialATS = evaluateATSFit(initialAnalysis, initialProfile, initialResume);

  return {
    openWindows: ["CHECK"],
    activeWindow: "CHECK",
    minimizedWindows: [],
    maximizedWindows: [],
    windowPositions: defaultPositions,
    windowZIndices: { CHECK: 10 },
    highestZIndex: 10,

    activeProfile: initialProfile,
    activeOpportunity: initialOpp,
    currentAnalysis: initialAnalysis,
    activeWhyTab: "OVERVIEW",
    savedOpportunityIds: ["opp-swe-internship-sample"],

    activeImprovementPlans: initialPlans,
    selectedImprovementPlanId: initialPlans[0]?.id || null,
    activeStrategyPlan: initialStrategy,
    activeSamples: initialSamples,
    selectedSampleId: initialSamples[0]?.id || null,

    activeResume: initialResume,
    pastedResumeText: demoResumeRawText,
    resumeFitAnalysis: initialResumeFit,
    atsAnalysisResult: initialATS,
    selectedResumeTraceId: initialResumeFit.traces[0]?.requirementId || null,
    selectedResumeBulletId: initialResume.projects[0]?.bullets[0]?.id || null,

    isAnalyzing: false,
    analysisStepIndex: 0,
    isCommandPaletteOpen: false,
    selectedRequirementId: "req-1",
    activeProfileFocusedField: null,

    openWindow: (id: WindowId) => {
      const { openWindows, minimizedWindows, highestZIndex, windowZIndices } = get();
      const nextZ = highestZIndex + 1;
      const nextOpen = openWindows.includes(id) ? openWindows : [...openWindows, id];
      const nextMin = minimizedWindows.filter((w) => w !== id);

      set({
        openWindows: nextOpen,
        minimizedWindows: nextMin,
        activeWindow: id,
        highestZIndex: nextZ,
        windowZIndices: { ...windowZIndices, [id]: nextZ },
      });
    },

    closeWindow: (id: WindowId) => {
      const { openWindows, activeWindow } = get();
      const nextOpen = openWindows.filter((w) => w !== id);
      const nextActive = activeWindow === id ? nextOpen[nextOpen.length - 1] || null : activeWindow;

      set({
        openWindows: nextOpen,
        activeWindow: nextActive,
      });
    },

    minimizeWindow: (id: WindowId) => {
      const { minimizedWindows, activeWindow, openWindows } = get();
      if (!minimizedWindows.includes(id)) {
        const nextMin = [...minimizedWindows, id];
        const remaining = openWindows.filter((w) => !nextMin.includes(w));
        set({
          minimizedWindows: nextMin,
          activeWindow: activeWindow === id ? remaining[remaining.length - 1] || null : activeWindow,
        });
      }
    },

    restoreWindow: (id: WindowId) => {
      const { minimizedWindows, highestZIndex, windowZIndices } = get();
      const nextZ = highestZIndex + 1;
      set({
        minimizedWindows: minimizedWindows.filter((w) => w !== id),
        activeWindow: id,
        highestZIndex: nextZ,
        windowZIndices: { ...windowZIndices, [id]: nextZ },
      });
    },

    toggleMaximizeWindow: (id: WindowId) => {
      const { maximizedWindows } = get();
      if (maximizedWindows.includes(id)) {
        set({ maximizedWindows: maximizedWindows.filter((w) => w !== id) });
      } else {
        set({ maximizedWindows: [...maximizedWindows, id] });
      }
    },

    bringToFront: (id: WindowId) => {
      const { highestZIndex, windowZIndices, activeWindow } = get();
      if (activeWindow === id) return;
      const nextZ = highestZIndex + 1;
      set({
        activeWindow: id,
        highestZIndex: nextZ,
        windowZIndices: { ...windowZIndices, [id]: nextZ },
      });
    },

    setWindowPosition: (id: WindowId, pos: { x: number; y: number }) => {
      const { windowPositions } = get();
      set({
        windowPositions: { ...windowPositions, [id]: pos },
      });
    },

    setActiveWhyTab: (tab: WhyTab) => {
      set({ activeWhyTab: tab });
    },

    setActiveOpportunity: (opp: Opportunity) => {
      const { activeProfile, activeResume } = get();
      const newAnalysis = evaluateEligibility(activeProfile, opp);
      const plans = buildImprovementPlans(newAnalysis, opp, activeProfile);
      const strategy = buildStrategyPlan(newAnalysis, opp, activeProfile);
      const samples = generateSampleTemplates(activeProfile, opp);
      const resumeFit = evaluateResumeFit(newAnalysis, activeProfile, activeResume);
      const ats = evaluateATSFit(newAnalysis, activeProfile, activeResume);

      set({
        activeOpportunity: opp,
        currentAnalysis: newAnalysis,
        activeImprovementPlans: plans,
        selectedImprovementPlanId: plans[0]?.id || null,
        activeStrategyPlan: strategy,
        activeSamples: samples,
        resumeFitAnalysis: resumeFit,
        atsAnalysisResult: ats,
        selectedRequirementId: opp.requirements[0]?.id || null,
      });
    },

    updateProfile: (updater) => {
      const { activeProfile, activeOpportunity, activeResume } = get();
      const updated = updater(activeProfile);
      const newAnalysis = evaluateEligibility(updated, activeOpportunity);
      const plans = buildImprovementPlans(newAnalysis, activeOpportunity, updated);
      const strategy = buildStrategyPlan(newAnalysis, activeOpportunity, updated);
      const samples = generateSampleTemplates(updated, activeOpportunity);
      const resumeFit = evaluateResumeFit(newAnalysis, updated, activeResume);
      const ats = evaluateATSFit(newAnalysis, updated, activeResume);

      set({
        activeProfile: updated,
        currentAnalysis: newAnalysis,
        activeImprovementPlans: plans,
        activeStrategyPlan: strategy,
        activeSamples: samples,
        resumeFitAnalysis: resumeFit,
        atsAnalysisResult: ats,
      });
    },

    runAnalysis: (opp?: Opportunity, prof?: StudentProfile) => {
      const targetOpp = opp || get().activeOpportunity;
      const targetProf = prof || get().activeProfile;
      const targetResume = get().activeResume;

      set({ isAnalyzing: true, analysisStepIndex: 0 });

      // Progressive cascade animation step sequence
      const stepInterval = setInterval(() => {
        const currentStep = get().analysisStepIndex;
        if (currentStep >= 6) {
          clearInterval(stepInterval);
          const computed = evaluateEligibility(targetProf, targetOpp);
          const plans = buildImprovementPlans(computed, targetOpp, targetProf);
          const strategy = buildStrategyPlan(computed, targetOpp, targetProf);
          const samples = generateSampleTemplates(targetProf, targetOpp);
          const resumeFit = evaluateResumeFit(computed, targetProf, targetResume);
          const ats = evaluateATSFit(computed, targetProf, targetResume);

          set({
            isAnalyzing: false,
            currentAnalysis: computed,
            activeOpportunity: targetOpp,
            activeProfile: targetProf,
            activeImprovementPlans: plans,
            selectedImprovementPlanId: plans[0]?.id || null,
            activeStrategyPlan: strategy,
            activeSamples: samples,
            resumeFitAnalysis: resumeFit,
            atsAnalysisResult: ats,
            selectedRequirementId: computed.evaluatedRequirements[0]?.id || null,
          });
        } else {
          set({ analysisStepIndex: currentStep + 1 });
        }
      }, 350);
    },

    toggleSaveOpportunity: (oppId: string) => {
      const { savedOpportunityIds } = get();
      if (savedOpportunityIds.includes(oppId)) {
        set({ savedOpportunityIds: savedOpportunityIds.filter((id) => id !== oppId) });
      } else {
        set({ savedOpportunityIds: [...savedOpportunityIds, oppId] });
      }
    },

    setCommandPaletteOpen: (open: boolean) => {
      set({ isCommandPaletteOpen: open });
    },

    setSelectedRequirementId: (reqId: string | null) => {
      set({ selectedRequirementId: reqId });
    },

    setActiveProfileFocusedField: (field: string | null) => {
      set({ activeProfileFocusedField: field });
    },

    navigateToRequirementInCheck: (reqId: string) => {
      get().setSelectedRequirementId(reqId);
      get().openWindow("CHECK");
    },

    navigateToProfileField: (field: string) => {
      get().setActiveProfileFocusedField(field);
      get().openWindow("PROFILE");
    },

    setSelectedImprovementPlanId: (planId: string | null) => {
      set({ selectedImprovementPlanId: planId });
    },

    openImproveWithPlan: (planId?: string) => {
      if (planId) {
        set({ selectedImprovementPlanId: planId });
      }
      get().openWindow("IMPROVE");
    },

    openStrategyWindow: () => {
      get().openWindow("STRATEGY");
    },

    setSelectedSampleId: (sampleId: string | null) => {
      set({ selectedSampleId: sampleId });
    },

    simulateAddSkillEvidence: (skillName: string, projectTitle = "Expense & Query Analytics Lab") => {
      const simulatedSkill: SkillEvidence = {
        skill: skillName,
        claimed: true,
        evidenceStrength: "STRONG",
        category: "database",
        evidence: [
          {
            id: `ev-sim-${Date.now()}-1`,
            source: "project",
            title: projectTitle,
            description: `Engineered PostgreSQL-backed service with multi-table JOINs and indexed aggregation queries.`,
          },
          {
            id: `ev-sim-${Date.now()}-2`,
            source: "github",
            title: "Public GitHub Repository",
            description: `Published clean database schema.sql and seed data with unit test query validation.`,
          },
        ],
      };

      get().updateProfile((prev) => ({
        ...prev,
        skills: [
          ...prev.skills.filter((s) => s.skill.toLowerCase() !== skillName.toLowerCase()),
          simulatedSkill,
        ],
      }));
    },

    setResumeText: (text: string) => {
      const parsed = parseResumeText(text, false);
      const { currentAnalysis, activeProfile } = get();
      if (currentAnalysis) {
        const resumeFit = evaluateResumeFit(currentAnalysis, activeProfile, parsed);
        const ats = evaluateATSFit(currentAnalysis, activeProfile, parsed);
        set({
          pastedResumeText: text,
          activeResume: parsed,
          resumeFitAnalysis: resumeFit,
          atsAnalysisResult: ats,
        });
      } else {
        set({ pastedResumeText: text, activeResume: parsed });
      }
    },

    loadDemoResume: () => {
      const { currentAnalysis, activeProfile } = get();
      const resume = defaultDemoResumeDocument;
      if (currentAnalysis) {
        const resumeFit = evaluateResumeFit(currentAnalysis, activeProfile, resume);
        const ats = evaluateATSFit(currentAnalysis, activeProfile, resume);
        set({
          pastedResumeText: demoResumeRawText,
          activeResume: resume,
          resumeFitAnalysis: resumeFit,
          atsAnalysisResult: ats,
        });
      } else {
        set({ pastedResumeText: demoResumeRawText, activeResume: resume });
      }
    },

    setSelectedResumeTraceId: (traceId: string | null) => {
      set({ selectedResumeTraceId: traceId });
    },

    setSelectedResumeBulletId: (bulletId: string | null) => {
      set({ selectedResumeBulletId: bulletId });
    },

    openResumeWithRequirement: (reqId: string) => {
      set({ selectedResumeTraceId: reqId });
      get().openWindow("RESUME");
    },

    openATSWindow: () => {
      get().openWindow("ATS");
    },

    loadSampleOpportunity: (index = 0) => {
      const sample = sampleOpportunities[index] || sampleOpportunities[0];
      get().setActiveOpportunity(sample);
    },
  };
});
