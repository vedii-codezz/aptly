"use client";

import React, { useState } from "react";
import { StudentProfile } from "@/types/profile";
import { ResumeDocument } from "@/types/resume";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Check,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ResumeReviewProps {
  profile: StudentProfile;
  resume: ResumeDocument;
  onUpdateProfile: (updater: (prev: StudentProfile) => StudentProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeReview({
  profile,
  resume,
  onUpdateProfile,
  isOpen,
  onClose,
}: ResumeReviewProps) {
  const [gpaInput, setGpaInput] = useState<string>(
    profile.education[0]?.gpa?.toString() || ""
  );
  const [gradYearInput, setGradYearInput] = useState<string>(
    profile.education[0]?.graduationYear?.toString() || "2029"
  );
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveAcademic = () => {
    const parsedGpa = parseFloat(gpaInput);
    const parsedYear = parseInt(gradYearInput, 10);

    onUpdateProfile((prev) => ({
      ...prev,
      education: prev.education.map((edu, idx) =>
        idx === 0
          ? {
              ...edu,
              gpa: isNaN(parsedGpa) ? edu.gpa : parsedGpa,
              graduationYear: isNaN(parsedYear) ? edu.graduationYear : parsedYear,
            }
          : edu
      ),
      unknownFields: isNaN(parsedGpa)
        ? prev.unknownFields
        : prev.unknownFields.filter((f) => !f.toLowerCase().includes("gpa")),
    }));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="border border-[var(--color-border-strong)] rounded-control p-4 bg-[var(--color-surface)] space-y-4 font-sans text-xs shadow-subtle animate-fade-in">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="type-system text-black font-semibold">
            PARSED RESUME DATA REVIEW
          </span>
          <span className="text-[9px] font-mono bg-aptly-match-bg text-aptly-match px-1.5 py-0.2 rounded-control border border-aptly-match-border font-bold">
            USER CONFIRMED
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-text-muted)] hover:text-black text-xs font-mono"
        >
          Close Review ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Education & GPA Edit */}
        <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-2.5">
          <div className="type-system text-[var(--color-text-muted)] flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            ACADEMIC DETAILS &amp; GPA
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-ghost)] uppercase block mb-1">
                Graduation Year:
              </label>
              <input
                type="number"
                value={gradYearInput}
                onChange={(e) => setGradYearInput(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control text-xs font-mono text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-[var(--color-text-ghost)] uppercase block mb-1">
                Cumulative CGPA (Out of 10.0 or 4.0):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={gpaInput}
                  onChange={(e) => setGpaInput(e.target.value)}
                  placeholder="e.g. 8.5"
                  className="flex-1 px-2.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control text-xs font-mono text-black focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleSaveAcademic}
                  className="px-3 py-1.5 bg-black hover:bg-[#222] text-white rounded-control text-system-xs flex items-center gap-1 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
            {isSaved && (
              <div className="text-[10px] font-mono text-aptly-match flex items-center gap-1">
                <Check className="w-3 h-3" /> Updated profile data successfully
              </div>
            )}
          </div>
        </div>

        {/* Skills Detected */}
        <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-2">
          <div className="type-system text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            EXTRACTED SKILLS ({profile.skills.length})
          </div>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {profile.skills.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-control border",
                  s.evidenceStrength === "STRONG"
                    ? "bg-aptly-match-bg text-aptly-match border-aptly-match-border font-medium"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)]"
                )}
              >
                {s.skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="space-y-1.5">
        <div className="type-system text-[var(--color-text-muted)] flex items-center gap-1.5">
          <FolderGit2 className="w-3.5 h-3.5" />
          EXTRACTED PROJECTS ({profile.projects.length})
        </div>
        <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border-subtle)] rounded-control bg-[var(--color-surface-muted)] max-h-40 overflow-y-auto">
          {profile.projects.map((p, i) => (
            <div key={i} className="p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-black font-sans">{p.title}</span>
                <span className="text-[10px] font-mono text-[var(--color-text-ghost)]">
                  {p.techStack.join(", ")}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 font-sans">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
