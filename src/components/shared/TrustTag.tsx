import React from "react";
import { TrustState } from "@/types/evidence";
import { cn } from "@/lib/utils";

interface TrustTagProps {
  trust: TrustState;
  className?: string;
}

export function TrustTag({ trust, className }: TrustTagProps) {
  const styles: Record<TrustState, { bg: string; text: string; border: string; desc: string; prefix: string }> = {
    FACT: {
      bg: "bg-[var(--color-surface-muted)]",
      text: "text-[var(--color-text-primary)] font-medium",
      border: "border-[var(--color-border)]",
      desc: "Directly verified in profile or opportunity text",
      prefix: "FACT:",
    },
    INTERPRETATION: {
      bg: "bg-[var(--color-surface-muted)]",
      text: "text-[var(--color-text-secondary)] font-medium",
      border: "border-[var(--color-border-strong)]",
      desc: "Normalized interpretation of natural language",
      prefix: "INTERP:",
    },
    UNKNOWN: {
      bg: "bg-aptly-unknown-bg",
      text: "text-aptly-unknown font-medium",
      border: "border-aptly-unknown-border",
      desc: "Missing information; not assumed to be failure",
      prefix: "UNKNOWN:",
    },
    SUGGESTION: {
      bg: "bg-[var(--color-surface-muted)]",
      text: "text-[var(--color-text-secondary)] font-medium",
      border: "border-[var(--color-border)]",
      desc: "AI-generated recommendation",
      prefix: "SUGG:",
    },
    USER_CONFIRMED: {
      bg: "bg-aptly-match-bg",
      text: "text-aptly-match font-semibold",
      border: "border-aptly-match-border",
      desc: "Confirmed and verified directly by candidate",
      prefix: "CONFIRMED:",
    },
  };

  const item = styles[trust] || styles.FACT;

  const displayLabels: Record<TrustState, string> = {
    FACT: "FACT",
    INTERPRETATION: "INTERPRETATION",
    UNKNOWN: "UNKNOWN",
    SUGGESTION: "SUGGESTION",
    USER_CONFIRMED: "USER CONFIRMED",
  };

  return (
    <span
      title={item.desc}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-control text-[9px] font-mono uppercase tracking-wider border select-none",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span className="w-1 h-1 rounded-full bg-current opacity-70" />
      <span>{displayLabels[trust] || trust}</span>
    </span>
  );
}
