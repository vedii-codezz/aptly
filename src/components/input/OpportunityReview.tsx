"use client";

import React from "react";
import { Opportunity } from "@/types/opportunity";
import { ImportanceBadge } from "../shared/ImportanceBadge";
import { cn } from "@/lib/utils";
import {
  Building,
  MapPin,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";

interface OpportunityReviewProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
}

export function OpportunityReview({
  opportunity,
  isOpen,
  onClose,
}: OpportunityReviewProps) {
  if (!isOpen) return null;

  const mandatoryReqs = opportunity.requirements.filter((r) => r.importance === "MANDATORY");
  const preferredReqs = opportunity.requirements.filter((r) => r.importance === "PREFERRED");
  const bonusReqs = opportunity.requirements.filter((r) => r.importance === "BONUS" || r.importance === "INFORMATIONAL");

  return (
    <div className="border border-[var(--color-border-strong)] rounded-control p-4 bg-[var(--color-surface)] space-y-4 font-sans text-xs shadow-subtle animate-fade-in">
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="type-system text-black font-semibold">
            EXTRACTED OPPORTUNITY CRITERIA
          </span>
          <span className="text-[9px] font-mono bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] px-1.5 py-0.2 rounded-control border border-[var(--color-border-subtle)]">
            {opportunity.requirements.length} DETECTED
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-text-muted)] hover:text-black text-xs font-mono"
        >
          Close Review ✕
        </button>
      </div>

      {/* Meta Bar */}
      <div className="p-3 bg-[var(--color-surface-muted)] rounded-control border border-[var(--color-border-subtle)] space-y-1">
        <div className="flex items-center gap-2">
          <span className="type-system text-black">{opportunity.type}</span>
          <span className="text-[var(--color-border)]">·</span>
          <span className="text-xs font-semibold text-black">{opportunity.title.replace("SAMPLE / ", "")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-text-muted)] font-mono pt-1">
          <div className="flex items-center gap-1">
            <Building className="w-3 h-3 text-[var(--color-text-ghost)]" />
            <span>{opportunity.organization}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[var(--color-text-ghost)]" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-1 text-black font-medium">
            <Clock className="w-3 h-3 text-[var(--color-text-muted)]" />
            <span>{opportunity.deadlineRelative || opportunity.deadline}</span>
          </div>
        </div>
      </div>

      {/* Requirements Ledger */}
      <div className="space-y-3">
        {/* Mandatory */}
        {mandatoryReqs.length > 0 && (
          <div className="space-y-1.5">
            <div className="type-system text-aptly-fail">
              MANDATORY ELIGIBILITY ({mandatoryReqs.length})
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border-subtle)] rounded-control bg-[var(--color-surface)]">
              {mandatoryReqs.map((req) => (
                <div key={req.id} className="p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-black text-xs">{req.title}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-mono">{req.sourceText}</div>
                  </div>
                  <ImportanceBadge importance="MANDATORY" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferred */}
        {preferredReqs.length > 0 && (
          <div className="space-y-1.5">
            <div className="type-system text-aptly-partial">
              PREFERRED QUALIFICATIONS ({preferredReqs.length})
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)] border border-[var(--color-border-subtle)] rounded-control bg-[var(--color-surface)]">
              {preferredReqs.map((req) => (
                <div key={req.id} className="p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium text-black text-xs">{req.title}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)] font-mono">{req.sourceText}</div>
                  </div>
                  <ImportanceBadge importance="PREFERRED" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
