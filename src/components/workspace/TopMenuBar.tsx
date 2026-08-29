"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Search, Sparkles } from "lucide-react";

export function TopMenuBar({ onOpenAskAptly }: { onOpenAskAptly?: () => void }) {
  const {
    activeOpportunity,
    currentAnalysis,
    setCommandPaletteOpen,
    openWindow,
  } = useWorkspaceStore();

  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const verdictLabel = currentAnalysis
    ? currentAnalysis.verdict.verdict === "CAN_APPLY"
      ? "ELIGIBLE"
      : currentAnalysis.verdict.verdict === "POSSIBLY_ELIGIBLE"
      ? "POSSIBLY"
      : "INELIGIBLE"
    : null;

  return (
    <header
      className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 flex items-center justify-between select-none z-50"
      style={{ height: "var(--topbar-height)" }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => openWindow("CHECK")}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity duration-micro"
        >
          <span className="text-system-xs text-black tracking-widest">APTLY</span>
          <span className="text-[var(--color-text-ghost)]">/</span>
          <span className="text-system-xs text-[var(--color-text-muted)] tracking-widest">OS</span>
        </button>

        {activeOpportunity && (
          <>
            <span className="text-[var(--color-border-strong)]">·</span>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-sans text-[var(--color-text-secondary)] truncate max-w-[240px]">
                {activeOpportunity.title.replace("SAMPLE / ", "")}
              </span>
              {verdictLabel && (
                <span className="type-system text-[var(--color-text-muted)]">
                  {verdictLabel}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Center: Commands */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] rounded-control text-[var(--color-text-muted)] hover:text-black transition-colors duration-micro"
        >
          <Search className="w-3 h-3" />
          <span className="text-[10px] hidden md:inline font-sans">Command</span>
          <kbd className="text-[9px] bg-[var(--color-surface-muted)] text-[var(--color-text-ghost)] px-1 py-0.5 rounded border border-[var(--color-border-subtle)] font-mono">
            ⌘K
          </kbd>
        </button>

        {onOpenAskAptly && (
          <button
            onClick={onOpenAskAptly}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-black text-white hover:bg-[#222] rounded-control text-[10px] font-sans font-semibold transition-colors duration-micro"
          >
            <Sparkles className="w-3 h-3 opacity-60" />
            <span>ASK</span>
          </button>
        )}
      </div>

      {/* Right: Clock */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-[var(--color-text-ghost)] font-mono tracking-wider">
          {timeStr || "00:00"}
        </span>
      </div>
    </header>
  );
}
