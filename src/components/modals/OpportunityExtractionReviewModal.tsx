"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { OpportunityExtractionOutput, ExtractedRequirementItem } from "@/lib/gemini/schemas/opportunity";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import { Check, X, Sparkles, Layers, AlertTriangle, ArrowRight, Edit3 } from "lucide-react";
import { Opportunity, OpportunityType, RequirementImportance, RequirementCategory } from "@/types/opportunity";

export function OpportunityExtractionReviewModal({
  isOpen,
  onClose,
  extractedData,
}: {
  isOpen: boolean;
  onClose: () => void;
  extractedData: OpportunityExtractionOutput | null;
}) {
  const { setActiveOpportunity, runAnalysis, openWindow } = useWorkspaceStore();

  const [requirements, setRequirements] = useState<ExtractedRequirementItem[]>(
    extractedData?.requirements || []
  );

  React.useEffect(() => {
    if (extractedData) {
      setRequirements(extractedData.requirements);
    }
  }, [extractedData]);

  if (!isOpen || !extractedData) return null;

  const mandatoryCount = requirements.filter((r) => r.importance === "MANDATORY").length;
  const preferredCount = requirements.filter((r) => r.importance === "PREFERRED").length;
  const bonusCount = requirements.filter((r) => r.importance === "BONUS").length;

  const updateReqImportance = (id: string, newImp: RequirementImportance) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, importance: newImp } : r))
    );
  };

  const updateReqCategory = (id: string, newCat: RequirementCategory) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, category: newCat } : r))
    );
  };

  const updateReqTitle = (id: string, newTitle: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title: newTitle } : r))
    );
  };

  const handleConfirmAndAnalyze = () => {
    const newOpp: Opportunity = {
      id: `opp-custom-${Date.now()}`,
      title: extractedData.title || "Custom Analyzed Opportunity",
      organization: extractedData.organization || "Direct Opportunity Listing",
      type: (extractedData.type as OpportunityType) || "INTERNSHIP",
      deadline: extractedData.deadline,
      deadlineRelative: extractedData.deadlineRelative || "Active Listing",
      location: extractedData.location || "Remote / Specified Location",
      stipendOrAward: extractedData.stipendOrAward || "Competitive Compensation",
      description: extractedData.description,
      isSample: false,
      tags: ["AI Extracted", extractedData.type],
      requirements: requirements.map((r) => ({
        id: r.id,
        category: r.category,
        importance: r.importance,
        title: r.title,
        sourceText: r.sourceText,
        normalizedValue: r.normalizedValue,
        status: "UNKNOWN",
        evidence: [],
        reasoning: r.interpretation || "Extracted and confirmed by candidate.",
        trust: "USER_CONFIRMED",
        sourceLocation: "Opportunity Text Listing",
        isDeterministic: true,
      })),
    };

    setActiveOpportunity(newOpp);
    runAnalysis(newOpp);
    openWindow("CHECK");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#D5D5CB] rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 font-mono text-xs animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200 pb-3 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              APTLY/REQUIREMENT EXTRACTION AUDIT & CORRECTION
            </div>
            <h3 className="text-base font-bold text-black font-sans mt-0.5">
              {extractedData.title}
            </h3>
            <p className="text-stone-500 font-sans text-xs mt-0.5">
              {requirements.length} discrete requirements extracted. You can edit importance tiers below before running analysis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breakdown Stats Strip */}
        <div className="grid grid-cols-3 gap-2 text-center shrink-0">
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded">
            <div className="text-base font-bold text-rose-900">{mandatoryCount}</div>
            <div className="text-[10px] text-rose-800 uppercase font-bold">MANDATORY</div>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded">
            <div className="text-base font-bold text-amber-900">{preferredCount}</div>
            <div className="text-[10px] text-amber-800 uppercase font-bold">PREFERRED</div>
          </div>
          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <div className="text-base font-bold text-stone-900">{bonusCount}</div>
            <div className="text-[10px] text-stone-600 uppercase font-bold">BONUS / OTHER</div>
          </div>
        </div>

        {/* Scrollable Editable Requirement List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-stone-100">
          {requirements.map((req) => (
            <div key={req.id} className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <input
                  type="text"
                  value={req.title}
                  onChange={(e) => updateReqTitle(req.id, e.target.value)}
                  className="font-bold text-black bg-stone-50 hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-stone-200 focus:border-black flex-1 min-w-[200px]"
                />

                <div className="flex items-center gap-1.5">
                  <select
                    value={req.importance}
                    onChange={(e) => updateReqImportance(req.id, e.target.value as RequirementImportance)}
                    className="px-2 py-0.5 bg-white border border-stone-300 rounded font-mono font-bold text-[10px]"
                  >
                    <option value="MANDATORY">MANDATORY</option>
                    <option value="PREFERRED">PREFERRED</option>
                    <option value="BONUS">BONUS</option>
                    <option value="INFORMATIONAL">INFORMATIONAL</option>
                  </select>

                  <select
                    value={req.category}
                    onChange={(e) => updateReqCategory(req.id, e.target.value as RequirementCategory)}
                    className="px-2 py-0.5 bg-stone-100 border border-stone-300 rounded font-mono text-[10px]"
                  >
                    <option value="SKILL">SKILL</option>
                    <option value="GRADUATION">GRADUATION</option>
                    <option value="GPA">GPA</option>
                    <option value="EDUCATION">EDUCATION</option>
                    <option value="LOCATION">LOCATION</option>
                    <option value="EXPERIENCE">EXPERIENCE</option>
                    <option value="DOCUMENT">DOCUMENT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-stone-600 font-sans pl-2 border-l-2 border-stone-200 italic">
                &ldquo;{req.sourceText}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="pt-3 flex items-center justify-between border-t border-stone-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-mono text-xs"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirmAndAnalyze}
            className="px-5 py-2 bg-black hover:bg-stone-800 text-white rounded font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <span>CONFIRM AS USER-CHECKED & ANALYZE →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
