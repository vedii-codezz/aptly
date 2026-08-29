"use client";

import React, { useState } from "react";
import { OpportunityRequirement } from "@/types/opportunity";
import { StatusBadge } from "../shared/StatusBadge";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

interface RequirementsSectionProps {
  requirements: OpportunityRequirement[];
  onTraceWhy: (requirementId: string) => void;
}

export function RequirementsSection({ requirements, onTraceWhy }: RequirementsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const groups = [
    { title: "MANDATORY ELIGIBILITY", importance: "MANDATORY" as const, items: requirements.filter((r) => r.importance === "MANDATORY") },
    { title: "PREFERRED QUALIFICATIONS", importance: "PREFERRED" as const, items: requirements.filter((r) => r.importance === "PREFERRED") },
    { title: "BONUS & TRACK RECORD", importance: "BONUS" as const, items: requirements.filter((r) => r.importance === "BONUS") },
    { title: "INFORMATIONAL", importance: "INFORMATIONAL" as const, items: requirements.filter((r) => r.importance === "INFORMATIONAL") },
  ].filter((g) => g.items.length > 0);

  return (
    <section id="sec-requirements" className="py-12 border-b border-[var(--color-border-subtle)] space-y-10 font-sans">
      {/* Chapter Header */}
      <div className="space-y-2 max-w-3xl">
        <span className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest uppercase">
          02 / REQUIREMENTS
        </span>
        <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-black tracking-tight">
          Requirement Evaluation Ledger
        </h3>
        <p className="text-base text-[var(--color-text-secondary)] font-sans leading-relaxed">
          Line-by-line comparison between opportunity specifications and verified candidate evidence.
        </p>
      </div>

      {/* Grouped Ledger Sections (Minimal Rules, No Box-in-Box) */}
      <div className="space-y-12">
        {groups.map((group) => (
          <div key={group.importance} className="space-y-4">
            {/* Group Label */}
            <div className="flex items-center justify-between border-b border-black pb-2">
              <span className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                {group.title} ({group.items.length})
              </span>
              <span className="text-[10px] font-mono text-[var(--color-text-ghost)] uppercase">
                STATUS
              </span>
            </div>

            {/* Requirement Rows */}
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {group.items.map((req, idx) => {
                const isExpanded = expandedId === req.id;
                const isDimmed = hoveredId !== null && hoveredId !== req.id;

                return (
                  <div
                    key={req.id}
                    onMouseEnter={() => setHoveredId(req.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(req.id)}
                    onBlur={() => setHoveredId(null)}
                    tabIndex={0}
                    className={cn(
                      "py-5 space-y-3 transition-opacity duration-micro border-l-2 border-transparent focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:pl-2",
                      isDimmed ? "md:opacity-55" : "opacity-100",
                      hoveredId === req.id && "border-[var(--color-accent)] pl-2"
                    )}
                  >
                    {/* Main Row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-start cursor-pointer select-none group"
                    >
                      {/* Left: Index + Title + Source Quote */}
                      <div className="md:col-span-6 flex items-start gap-3">
                        <span className="w-6 text-[11px] font-mono text-[var(--color-text-ghost)] shrink-0 pt-0.5">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-semibold text-black group-hover:underline">
                              {req.title}
                            </span>
                            <ImportanceBadge importance={req.importance} />
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] font-mono leading-relaxed">
                            &ldquo;{req.sourceText}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Middle: Candidate Evidence */}
                      <div className="md:col-span-4 pl-9 md:pl-0 text-xs font-sans text-black">
                        <span className="text-[10px] font-mono text-[var(--color-text-ghost)] uppercase block mb-0.5">
                          YOUR EVIDENCE:
                        </span>
                        <span className="leading-relaxed">
                          {req.profileEvidenceText || "No evidence recorded for this criteria."}
                        </span>
                      </div>

                      {/* Right: Status Badge + Toggle */}
                      <div className="md:col-span-2 flex items-center justify-end gap-2 shrink-0 pl-9 md:pl-0">
                        <StatusBadge status={req.status} size="sm" />
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); onTraceWhy(req.id); }}
                          className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent)] focus-visible:text-[var(--color-accent)] focus-visible:outline-none"
                          aria-label={`Trace why ${req.title} was evaluated this way`}
                        >
                          TRACE WHY <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          className="text-[10px] font-mono text-[var(--color-text-muted)] group-hover:text-black flex items-center gap-0.5"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Reasoning Drawer */}
                    {isExpanded && (
                      <div className="ml-9 p-4 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-control space-y-3 text-xs animate-fade-in">
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider font-bold">
                          DETERMINISTIC EVALUATION REASONING
                        </div>
                        <p className="text-sm text-black leading-relaxed font-sans">
                          {req.reasoning || "Evaluated through deterministic constraint validation."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
