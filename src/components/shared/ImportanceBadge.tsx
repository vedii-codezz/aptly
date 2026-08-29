import React from "react";
import { RequirementImportance } from "@/types/opportunity";
import { cn } from "@/lib/utils";

interface ImportanceBadgeProps {
  importance: RequirementImportance;
  className?: string;
}

export function ImportanceBadge({ importance, className }: ImportanceBadgeProps) {
  const styles: Record<RequirementImportance, { bg: string; text: string; border: string; indicator: string }> = {
    MANDATORY: {
      bg: "bg-aptly-fail-bg",
      text: "text-aptly-fail font-semibold",
      border: "border-aptly-fail-border",
      indicator: "●",
    },
    PREFERRED: {
      bg: "bg-aptly-partial-bg",
      text: "text-aptly-partial font-medium",
      border: "border-aptly-partial-border",
      indicator: "◆",
    },
    BONUS: {
      bg: "bg-[var(--color-surface-muted)]",
      text: "text-[var(--color-text-secondary)] font-normal",
      border: "border-[var(--color-border)]",
      indicator: "○",
    },
    INFORMATIONAL: {
      bg: "bg-[var(--color-surface-muted)]",
      text: "text-[var(--color-text-muted)] font-normal",
      border: "border-[var(--color-border-subtle)]",
      indicator: "·",
    },
  };

  const item = styles[importance] || styles.INFORMATIONAL;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-control text-[10px] font-mono uppercase tracking-wider border select-none",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span className="text-[8px] opacity-80">{item.indicator}</span>
      <span>{importance}</span>
    </span>
  );
}
