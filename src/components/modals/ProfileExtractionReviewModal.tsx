"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ProfileExtractionOutput } from "@/lib/gemini/schemas/profile";
import { cn } from "@/lib/utils";
import { Check, X, Edit3, UserCheck, AlertTriangle, Sparkles, Quote } from "lucide-react";

export function ProfileExtractionReviewModal({
  isOpen,
  onClose,
  extractedData,
}: {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ProfileExtractionOutput | null;
}) {
  const { updateProfile, runAnalysis } = useWorkspaceStore();

  const [degree, setDegree] = useState(extractedData?.education.degree || "Bachelor of Technology");
  const [field, setField] = useState(extractedData?.education.field || "Computer Science & Engineering");
  const [gradYear, setGradYear] = useState<number>(extractedData?.education.graduationYear || 2029);
  const [gpaInput, setGpaInput] = useState<string>(extractedData?.education.gpa?.toString() || "");
  const [skillsList, setSkillsList] = useState<
    Array<{ name: string; sourceText: string; confidence: "HIGH" | "MEDIUM" | "LOW" }>
  >(extractedData?.skills || []);

  React.useEffect(() => {
    if (extractedData) {
      setDegree(extractedData.education.degree || "Bachelor of Technology");
      setField(extractedData.education.field || "Computer Science & Engineering");
      setGradYear(extractedData.education.graduationYear || 2029);
      setGpaInput(extractedData.education.gpa?.toString() || "");
      setSkillsList(extractedData.skills);
    }
  }, [extractedData]);

  if (!isOpen || !extractedData) return null;

  const handleConfirm = () => {
    const parsedGpa = parseFloat(gpaInput);
    const validGpa = !isNaN(parsedGpa) ? parsedGpa : undefined;

    updateProfile((prev) => ({
      ...prev,
      education: [
        {
          ...prev.education[0],
          degree,
          fieldOfStudy: field,
          graduationYear: gradYear,
          gpa: validGpa,
        },
      ],
      skills: [
        ...prev.skills,
        ...skillsList
          .filter((s) => !prev.skills.some((ps) => ps.skill.toLowerCase() === s.name.toLowerCase()))
          .map((s) => ({
            skill: s.name,
            claimed: true,
            evidenceStrength: "MODERATE" as const,
            category: "language" as const,
            evidence: [
              {
                id: `ev-ai-${Date.now()}-${s.name}`,
                source: "manual" as const,
                title: "User-Confirmed Profile Fact",
                description: `Extracted from personal input: "${s.sourceText || s.name}"`,
                verifiedDate: new Date().toISOString().split("T")[0],
              },
            ],
          })),
      ],
      unknownFields: validGpa ? prev.unknownFields.filter((f) => !f.toLowerCase().includes("gpa")) : prev.unknownFields,
    }));

    runAnalysis();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#D5D5CB] rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5 font-mono text-xs animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-stone-200 pb-3 shrink-0">
          <div>
            <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-700" />
              APTLY/PROFILE EXTRACTION PROVENANCE & REVIEW
            </div>
            <h3 className="text-base font-bold text-black font-sans mt-0.5">
              Review Extracted Facts with Source Provenance
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-stone-100 flex items-center justify-center text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-stone-600 font-sans text-xs shrink-0">
          Verify extracted fields. Confirming marks these records as <strong className="text-black">USER CONFIRMED</strong> with source citations.
        </p>

        {/* Scrollable Form Fields */}
        <div className="flex-1 overflow-y-auto space-y-3 font-mono pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Degree Program</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Field of Study</label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Graduation Year</label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(parseInt(e.target.value) || 2029)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Cumulative CGPA (Optional)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 8.65 (Leave blank if unrecorded)"
                value={gpaInput}
                onChange={(e) => setGpaInput(e.target.value)}
                className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Extracted Skills with Source Provenance */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-stone-500 uppercase">
              Extracted Skills & Source Quotes ({skillsList.length})
            </label>
            <div className="space-y-1.5">
              {skillsList.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-stone-50 border border-stone-200 rounded flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-black text-xs font-mono">{s.name}</span>
                    {s.sourceText && (
                      <p className="text-[10px] text-stone-500 font-sans italic mt-0.5 flex items-center gap-1">
                        <Quote className="w-2.5 h-2.5 shrink-0 text-stone-400" />
                        &ldquo;{s.sourceText}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-stone-300 text-stone-600 font-bold uppercase">
                    {s.confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Unknown Fields Preserved */}
          {extractedData.unknownFields.length > 0 && !gpaInput && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 font-sans space-y-1">
              <div className="font-bold font-mono text-[10px] uppercase text-amber-900">
                PRESERVED UNKNOWN FIELDS ({extractedData.unknownFields.length})
              </div>
              <p>
                {extractedData.unknownFields.join(", ")} were not explicitly stated and remain preserved as UNKNOWN per APTLY principles.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-mono text-xs transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-black hover:bg-stone-800 text-white rounded font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>CONFIRM & APPLY TO PROFILE →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
