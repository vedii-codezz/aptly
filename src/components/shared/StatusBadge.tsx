import React from "react";
import { RequirementStatus } from "@/types/opportunity";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: RequirementStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const styles: Record<RequirementStatus, string> = {
    MATCHED: "text-aptly-match bg-aptly-match-bg border-aptly-match-border",
    PARTIAL: "text-aptly-partial bg-aptly-partial-bg border-aptly-partial-border",
    FAILED: "text-aptly-fail bg-aptly-fail-bg border-aptly-fail-border",
    UNKNOWN: "text-aptly-unknown bg-aptly-unknown-bg border-aptly-unknown-border",
  };

  const icons: Record<RequirementStatus, string> = {
    MATCHED: "✓",
    PARTIAL: "◐",
    FAILED: "✕",
    UNKNOWN: "?",
  };

  const labels: Record<RequirementStatus, string> = {
    MATCHED: "MATCHED",
    PARTIAL: "PARTIAL",
    FAILED: "FAILED",
    UNKNOWN: "UNKNOWN",
  };

  const sizeClasses = {
    sm: "text-[9px] px-1 py-0.5 tracking-wider gap-1",
    md: "text-[10px] px-1.5 py-0.5 tracking-wider gap-1",
    lg: "text-xs px-2 py-0.5 tracking-wider gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-control border font-mono uppercase select-none",
        styles[status],
        sizeClasses[size],
        className
      )}
    >
      <span className="font-bold opacity-90">{icons[status]}</span>
      <span className="font-medium">{labels[status]}</span>
    </span>
  );
}
