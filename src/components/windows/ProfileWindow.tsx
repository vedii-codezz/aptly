"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { SkillEvidence, EvidenceStrength } from "@/types/evidence";
import { ProfileExtractionReviewModal } from "../modals/ProfileExtractionReviewModal";
import { ProfileExtractionOutput } from "@/lib/gemini/schemas/profile";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Plus,
  Save,
  Check,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";

export function ProfileWindow() {
  const { activeProfile, updateProfile, runAnalysis, activeProfileFocusedField } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "projects" | "education" | "raw">("overview");

  const [gpaInput, setGpaInput] = useState<string>(
    activeProfile.education[0]?.gpa?.toString() || ""
  );
  const [isSavedGpa, setIsSavedGpa] = useState(false);
  const gpaInputRef = React.useRef<HTMLInputElement>(null);

  // Natural language extraction state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [naturalText, setNaturalText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStage, setExtractionStage] = useState<string>("Extracting education details...");
  const [extractedResult, setExtractedResult] = useState<ProfileExtractionOutput | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeProfileFocusedField === "gpa") {
      setActiveTab("overview");
      setTimeout(() => {
        gpaInputRef.current?.focus();
        gpaInputRef.current?.select();
      }, 100);
    }
  }, [activeProfileFocusedField]);

  // New skill quick-add form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillStrength, setNewSkillStrength] = useState<EvidenceStrength>("STRONG");
  const [newSkillProject, setNewSkillProject] = useState("");

  const handleSaveGpa = () => {
    const parsedGpa = parseFloat(gpaInput);
    if (!isNaN(parsedGpa)) {
      updateProfile((prev) => ({
        ...prev,
        education: prev.education.map((edu, idx) =>
          idx === 0
            ? { ...edu, gpa: parsedGpa, gpaScale: 10.0 }
            : edu
        ),
        unknownFields: prev.unknownFields.filter((f) => !f.toLowerCase().includes("gpa")),
      }));
      setIsSavedGpa(true);
      setTimeout(() => setIsSavedGpa(false), 2000);
      runAnalysis();
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: SkillEvidence = {
      skill: newSkillName.trim(),
      claimed: true,
      evidenceStrength: newSkillStrength,
      category: "language",
      evidence: newSkillProject.trim()
        ? [
            {
              id: `ev-manual-${Date.now()}`,
              source: "project",
              title: newSkillProject.trim(),
              description: `Hands-on implementation and verifiable project work involving ${newSkillName.trim()}.`,
            },
          ]
        : [],
    };

    updateProfile((prev) => ({
      ...prev,
      skills: [...prev.skills.filter((s) => s.skill.toLowerCase() !== newSkill.skill.toLowerCase()), newSkill],
    }));

    setNewSkillName("");
    setNewSkillProject("");
    runAnalysis();
  };

  const handleExtractProfile = async () => {
    if (!naturalText.trim() || isExtracting) return;

    setIsExtracting(true);
    setErrorMessage(null);
    setExtractionStage("Extracting education details...");

    try {
      setTimeout(() => setExtractionStage("Finding explicit skills & coursework..."), 400);
      setTimeout(() => setExtractionStage("Identifying projects & verifiable work..."), 800);
      setTimeout(() => setExtractionStage("Preserving unstated information as UNKNOWN..."), 1200);

      const res = await fetch("/api/gemini/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: naturalText }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setExtractedResult(json.data);
        setIsImportModalOpen(false);
        setIsReviewOpen(true);
      } else {
        setErrorMessage(json.error || "Extraction failed. Offline mode active.");
      }
    } catch (err: any) {
      setErrorMessage("Network or offline fallback encountered.");
    } finally {
      setIsExtracting(false);
      setExtractionStage("");
    }
  };

  const strengthBadgeStyles: Record<EvidenceStrength, { bg: string; text: string; border: string }> = {
    STRONG: { bg: "bg-aptly-match-bg", text: "text-aptly-match", border: "border-aptly-match-border" },
    MODERATE: { bg: "bg-[var(--color-surface-muted)]", text: "text-[var(--color-text-secondary)]", border: "border-[var(--color-border)]" },
    WEAK: { bg: "bg-aptly-partial-bg", text: "text-aptly-partial", border: "border-aptly-partial-border" },
    NOT_FOUND: { bg: "bg-aptly-unknown-bg", text: "text-aptly-unknown", border: "border-aptly-unknown-border" },
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] font-sans">
      {/* ─── Top Header Strip ─── */}
      <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-control bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
            {activeProfile.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-black">{activeProfile.name}</span>
              <span className="type-system text-[var(--color-text-muted)]">
                VERIFIED PROFILE
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
              B.Tech 2nd Year (Grad: {activeProfile.education[0]?.graduationYear || 2029})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1 bg-black text-white hover:bg-[#222] rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
          >
            <Sparkles className="w-3 h-3 opacity-60" />
            <span>AI EXTRACT BIO</span>
          </button>

          {/* Sub-tabs */}
          <div className="flex items-center gap-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control p-0.5">
            {[
              { id: "overview", label: "OVERVIEW" },
              { id: "skills", label: "SKILLS" },
              { id: "projects", label: "PROJECTS" },
              { id: "education", label: "EDUCATION" },
              { id: "raw", label: "RAW" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-2 py-0.5 rounded-control text-system-xs transition-colors duration-micro",
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "text-[var(--color-text-muted)] hover:text-black"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Academic CGPA Editor */}
            <div className="p-4 border border-[var(--color-border)] rounded-control space-y-2 bg-[var(--color-surface)]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="type-system text-black flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    ACADEMIC CGPA
                  </span>
                  <p className="text-xs text-[var(--color-text-muted)] font-sans mt-0.5">
                    Enter cumulative CGPA to satisfy academic threshold criteria in real time.
                  </p>
                </div>
                {isSavedGpa && (
                  <span className="text-xs font-mono text-aptly-match flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved & Evaluated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  ref={gpaInputRef}
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={gpaInput}
                  onChange={(e) => setGpaInput(e.target.value)}
                  placeholder="e.g. 8.5 (Out of 10.0)"
                  className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control font-mono text-xs text-black focus:outline-none focus:border-black w-48"
                />
                <button
                  onClick={handleSaveGpa}
                  disabled={!gpaInput.trim()}
                  className="px-3.5 py-1.5 bg-black hover:bg-[#222] disabled:opacity-40 text-white rounded-control text-system-xs flex items-center gap-1.5 transition-colors duration-micro"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Profile Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)]">
                <div className="type-system text-[var(--color-text-muted)]">Degree & Year</div>
                <div className="text-sm font-semibold text-black mt-1 font-sans">B.Tech (2nd Year)</div>
                <div className="text-xs text-[var(--color-text-muted)] font-sans">Graduation: May 2029</div>
              </div>
              <div className="p-3.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)]">
                <div className="type-system text-[var(--color-text-muted)]">Documented Skills</div>
                <div className="text-sm font-semibold text-black mt-1 font-sans">{activeProfile.skills.length} Skills</div>
                <div className="text-xs text-[var(--color-text-muted)] font-sans">
                  {activeProfile.skills.filter((s) => s.evidenceStrength === "STRONG").length} with STRONG proof
                </div>
              </div>
              <div className="p-3.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)]">
                <div className="type-system text-[var(--color-text-muted)]">Recorded Projects</div>
                <div className="text-sm font-semibold text-black mt-1 font-sans">{activeProfile.projects.length} Projects</div>
                <div className="text-xs text-[var(--color-text-muted)] font-sans">Public GitHub repos</div>
              </div>
            </div>
          </div>
        )}

        {/* SKILLS & EVIDENCE TAB */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            {/* Quick Add Form */}
            <form onSubmit={handleAddSkill} className="p-3 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control space-y-2">
              <div className="type-system text-black flex items-center gap-1.5">
                <Plus className="w-3 h-3" /> Add Skill with Verifiable Evidence
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Skill name (e.g. SQL)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="px-2.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control focus:outline-none focus:border-black font-sans"
                />
                <input
                  type="text"
                  placeholder="Project name or repo"
                  value={newSkillProject}
                  onChange={(e) => setNewSkillProject(e.target.value)}
                  className="px-2.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control focus:outline-none focus:border-black font-sans"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newSkillStrength}
                    onChange={(e) => setNewSkillStrength(e.target.value as EvidenceStrength)}
                    className="px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control font-mono text-xs flex-1"
                  >
                    <option value="STRONG">STRONG (Project)</option>
                    <option value="MODERATE">MODERATE (Course)</option>
                    <option value="WEAK">WEAK (Claim only)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newSkillName.trim()}
                    className="px-3 py-1.5 bg-black hover:bg-[#222] disabled:opacity-40 text-white rounded-control text-system-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>

            {/* Skills Ledger */}
            <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border)] rounded-control bg-[var(--color-surface)]">
              {activeProfile.skills.map((skill, idx) => {
                const badge = strengthBadgeStyles[skill.evidenceStrength] || strengthBadgeStyles.NOT_FOUND;
                return (
                  <div key={idx} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-black font-sans">{skill.skill}</span>
                      <span className={cn("text-[9px] font-mono px-1.5 py-0.2 rounded-control border font-bold uppercase", badge.bg, badge.text, badge.border)}>
                        {skill.evidenceStrength}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-xs">
                      {skill.evidence.map((ev, i) => (
                        <div key={i} className="text-[var(--color-text-secondary)] font-sans pl-2 border-l-2 border-[var(--color-border)]">
                          <strong className="text-black font-mono text-[11px]">{ev.title || ev.source}:</strong> {ev.description}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="space-y-3">
            {activeProfile.projects.map((proj, idx) => (
              <div key={idx} className="p-4 border border-[var(--color-border)] rounded-control space-y-2 bg-[var(--color-surface)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-black font-sans">{proj.title}</h4>
                  {proj.links?.github && (
                    <a
                      href={proj.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-sans text-[var(--color-text-muted)] hover:text-black flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> GitHub
                    </a>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans">{proj.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.techStack.map((t, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 bg-[var(--color-surface-muted)] text-black rounded-control border border-[var(--color-border-subtle)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION & GPA TAB */}
        {activeTab === "education" && (
          <div className="space-y-3">
            {activeProfile.education.map((edu, idx) => (
              <div key={idx} className="p-4 border border-[var(--color-border)] rounded-control space-y-3 bg-[var(--color-surface)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-black font-sans">{edu.degree}</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] font-sans">{edu.field}</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono">{edu.institution}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                    Grad: {edu.graduationYear} (Yr {edu.currentYear}/{edu.totalYears})
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="type-system text-[var(--color-text-muted)]">RELEVANT COURSEWORK</div>
                  <div className="flex flex-wrap gap-1">
                    {edu.courses?.map((c, i) => (
                      <span key={i} className="text-[11px] font-mono px-1.5 py-0.2 bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] rounded-control border border-[var(--color-border-subtle)]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RAW BIO TAB */}
        {activeTab === "raw" && (
          <div className="p-4 border border-[var(--color-border)] rounded-control space-y-2 bg-[var(--color-surface)]">
            <span className="type-system text-[var(--color-text-muted)]">RAW BIO TEXT</span>
            <p className="text-xs font-mono bg-[var(--color-surface-muted)] p-3 rounded-control border border-[var(--color-border-subtle)] leading-relaxed text-black">
              {activeProfile.rawBio}
            </p>
          </div>
        )}
      </div>

      {/* Natural Language Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-window shadow-command max-w-lg w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] pb-3">
              <div>
                <span className="type-system text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  NATURAL LANGUAGE EXTRACTION
                </span>
                <h3 className="text-base font-bold text-black font-sans mt-0.5">
                  Paste Student Background
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-6 h-6 rounded-control hover:bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-muted)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] font-sans">
              Paste your degree, graduation year, skills, and projects. Gemini extracts structured facts with source provenance; you can review before committing.
            </p>

            <textarea
              rows={6}
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              placeholder="e.g. I'm a second-year B.Tech CSE student graduating in 2029. I have strong experience in Python and React. I built an expense tracker app..."
              disabled={isExtracting}
              className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control font-sans text-xs focus:outline-none focus:border-black"
            />

            <div className="text-[10px] text-[var(--color-text-ghost)] font-sans">
              Your text is processed by Gemini for structured extraction. You&apos;ll review all extracted fields.
            </div>

            {isExtracting && (
              <div className="p-2.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-control font-sans text-xs text-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
                <span>{extractionStage || "Processing..."}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 bg-aptly-fail-bg border border-aptly-fail-border rounded-control font-sans text-xs text-aptly-fail">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-active)] text-black rounded-control text-system-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleExtractProfile}
                disabled={!naturalText.trim() || isExtracting}
                className="px-4 py-1.5 bg-black hover:bg-[#222] disabled:opacity-40 text-white rounded-control text-system-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 opacity-60" />
                <span>EXTRACT WITH APTLY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ProfileExtractionReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        extractedData={extractedResult}
      />
    </div>
  );
}
