"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { sampleOpportunities } from "@/data/demo/opportunities";
import { Search, X, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandAction {
  id: string;
  label: string;
  category: string;
  sub: string;
  run: () => void;
}

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    openWindow,
    loadSampleOpportunity,
    activeProfile,
  } = useWorkspaceStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  const actions: CommandAction[] = [
    // Navigate
    { id: "nav-check", label: "CHECK — Opportunity Analysis", category: "NAVIGATE", sub: "Eligibility fine print", run: () => openWindow("CHECK") },
    { id: "nav-profile", label: `PROFILE — ${activeProfile.name}`, category: "NAVIGATE", sub: "Evidence & background", run: () => openWindow("PROFILE") },
    { id: "nav-why", label: "WHY — Requirement Intelligence", category: "NAVIGATE", sub: "Deep explainability", run: () => openWindow("WHY") },
    { id: "nav-improve", label: "IMPROVE — Gap Roadmaps", category: "NAVIGATE", sub: "Actionable improvement", run: () => openWindow("IMPROVE") },
    { id: "nav-strategy", label: "STRATEGY — Application Blueprint", category: "NAVIGATE", sub: "Decision framework", run: () => openWindow("STRATEGY") },
    { id: "nav-resume", label: "RESUME — Evidence & Coverage", category: "NAVIGATE", sub: "Proof inspection", run: () => openWindow("RESUME") },
    { id: "nav-ats", label: "ATS — Screening Readability", category: "NAVIGATE", sub: "Terminology analysis", run: () => openWindow("ATS") },
    // Opportunities
    ...sampleOpportunities.map((opp, i) => ({
      id: `opp-${i}`,
      label: opp.title.replace("SAMPLE / ", ""),
      category: "OPPORTUNITIES",
      sub: opp.organization,
      run: () => { loadSampleOpportunity(i); openWindow("CHECK"); },
    })),
  ];

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.sub.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  // Arrow key navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        filtered[selectedIndex].run();
        setCommandPaletteOpen(false);
      }
    },
    [filtered, selectedIndex, setCommandPaletteOpen]
  );

  // Reset selection on query change
  useEffect(() => { setSelectedIndex(0); }, [query]);

  if (!isCommandPaletteOpen) return null;

  // Group by category
  const groups: Record<string, CommandAction[]> = {};
  filtered.forEach((a) => {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category].push(a);
  });

  let flatIndex = 0;

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100] flex items-start justify-center pt-[15vh] px-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-window shadow-command overflow-hidden flex flex-col animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]">
          <span className="type-system text-[var(--color-text-ghost)]">APTLY/COMMAND</span>
          <kbd className="text-[9px] text-[var(--color-text-ghost)] font-mono border border-[var(--color-border-subtle)] px-1 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Search */}
        <div className="flex items-center px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
          <Search className="w-3.5 h-3.5 text-[var(--color-text-ghost)] mr-3 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, windows, opportunities..."
            className="w-full bg-transparent text-sm text-black placeholder:text-[var(--color-text-ghost)] focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[var(--color-text-ghost)] hover:text-black ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1">
          {Object.keys(groups).length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)] font-sans">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(groups).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 type-system text-[var(--color-text-ghost)]">
                  {category}
                </div>
                {items.map((action) => {
                  const thisIndex = flatIndex++;
                  const isSelected = thisIndex === selectedIndex;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.run();
                        setCommandPaletteOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(thisIndex)}
                      className={cn(
                        "w-full text-left px-4 py-2 flex items-center justify-between group transition-colors duration-micro",
                        isSelected ? "bg-[var(--color-surface-active)]" : "hover:bg-[var(--color-surface-muted)]"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-black truncate">{action.label}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)] truncate">{action.sub}</div>
                      </div>
                      {isSelected && (
                        <CornerDownLeft className="w-3 h-3 text-[var(--color-text-ghost)] shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-[9px] text-[var(--color-text-ghost)] font-mono">
          <span>↑↓ Navigate · ↵ Select · ESC Close</span>
          <span>APTLY/OS</span>
        </div>
      </div>
    </div>
  );
}
