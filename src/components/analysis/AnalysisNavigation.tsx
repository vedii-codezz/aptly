"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw, MessageSquare, List, X, ChevronRight } from "lucide-react";

interface AnalysisNavigationProps {
  onNewAnalysis: () => void;
  onOpenAskAptly: () => void;
}

const CHAPTERS = [
  { id: "sec-verdict", num: "01", title: "VERDICT", subtitle: "Eligibility conclusion" },
  { id: "sec-requirements", num: "02", title: "REQUIREMENTS", subtitle: "Evaluated criteria ledger" },
  { id: "sec-why", num: "03", title: "WHY", subtitle: "4-step evidence provenance" },
  { id: "sec-fit", num: "04", title: "YOUR FIT", subtitle: "Strongest signals & evidence" },
  { id: "sec-gaps", num: "05", title: "GAPS", subtitle: "Prioritized gap triage" },
  { id: "sec-improve", num: "06", title: "IMPROVE", subtitle: "Connected skill roadmaps" },
  { id: "sec-strategy", num: "07", title: "STRATEGY", subtitle: "Application decision & countdown" },
  { id: "sec-resume", num: "08", title: "RESUME FIT", subtitle: "Profile vs resume disconnects" },
  { id: "sec-ats", num: "09", title: "ATS AUDIT", subtitle: "Screening readability & terms" },
];

export function AnalysisNavigation({
  onNewAnalysis,
  onOpenAskAptly,
}: AnalysisNavigationProps) {
  const [activeChapterId, setActiveChapterId] = useState("sec-verdict");
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for lightweight active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to get topmost visible
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveChapterId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.2],
      }
    );

    CHAPTERS.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsIndexOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsIndexOpen(false);
      }
    };

    if (isIndexOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isIndexOpen]);

  const currentChapter = CHAPTERS.find((c) => c.id === activeChapterId) || CHAPTERS[0];
  const currentIndex = CHAPTERS.findIndex((c) => c.id === activeChapterId);

  const scrollToChapter = (id: string) => {
    setIsIndexOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border-subtle)] px-4 md:px-8 lg:px-12 py-3 font-sans select-none transition-all">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand + Reading Progress */}
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-bold text-black tracking-tight text-sm font-sans shrink-0">
            APTLY<span className="text-[var(--color-text-ghost)] font-light">/REPORT</span>
          </span>

          <span className="hidden sm:inline text-[var(--color-border)]">·</span>

          {/* Current Chapter Indicator */}
          <div className="flex items-center gap-2 truncate text-xs font-mono text-black font-semibold">
            <span className="text-[var(--color-text-muted)] font-normal">
              {String(currentIndex + 1).padStart(2, "0")}/09
            </span>
            <span className="text-[var(--color-border)] hidden sm:inline">·</span>
            <span className="truncate tracking-wide uppercase">
              {currentChapter.title}
            </span>
          </div>
        </div>

        {/* Center/Right: Index Button + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Index Trigger */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setIsIndexOpen(!isIndexOpen)}
              className={cn(
                "px-3 py-1.5 rounded-control text-system-xs font-mono font-bold flex items-center gap-1.5 border transition-colors",
                isIndexOpen
                  ? "bg-black text-white border-black"
                  : "bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-active)] text-black border-[var(--color-border)]"
              )}
              aria-label="Table of contents index"
              aria-expanded={isIndexOpen}
            >
              <List className="w-3.5 h-3.5" />
              <span>INDEX</span>
            </button>

            {/* Index Popover Drawer */}
            {isIndexOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-control shadow-command p-2 space-y-1 animate-fade-in z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border-subtle)] text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                  <span>Report Chapters (9)</span>
                  <span className="text-[9px] text-[var(--color-text-ghost)]">ESC to close</span>
                </div>

                <div className="divide-y divide-[var(--color-border-subtle)] max-h-[70vh] overflow-y-auto">
                  {CHAPTERS.map((ch, idx) => {
                    const isActive = ch.id === activeChapterId;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => scrollToChapter(ch.id)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-control flex items-center justify-between gap-3 transition-colors",
                          isActive
                            ? "bg-black text-white"
                            : "hover:bg-[var(--color-surface-muted)] text-black"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "font-mono text-xs font-bold shrink-0",
                              isActive ? "text-emerald-400" : "text-[var(--color-text-ghost)]"
                            )}
                          >
                            {ch.num}
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-semibold font-sans tracking-wide">
                              {ch.title}
                            </div>
                            <div
                              className={cn(
                                "text-[10px] font-sans truncate",
                                isActive ? "text-stone-300" : "text-[var(--color-text-muted)]"
                              )}
                            >
                              {ch.subtitle}
                            </div>
                          </div>
                        </div>

                        <ChevronRight
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isActive ? "text-white" : "text-[var(--color-text-ghost)]"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Bottom utility: New Analysis */}
                <div className="pt-2 border-t border-[var(--color-border-subtle)] px-2">
                  <button
                    onClick={() => {
                      setIsIndexOpen(false);
                      onNewAnalysis();
                    }}
                    className="w-full py-2 text-center text-xs font-mono text-[var(--color-text-muted)] hover:text-black flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>START NEW ANALYSIS</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ask APTLY Trigger */}
          <button
            onClick={onOpenAskAptly}
            className="px-3 py-1.5 bg-black text-white hover:bg-[#222] rounded-control text-system-xs font-semibold flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            <MessageSquare className="w-3 h-3 opacity-80" />
            <span className="hidden sm:inline">ASK APTLY</span>
          </button>

          {/* New Analysis (Desktop quick button) */}
          <button
            onClick={onNewAnalysis}
            title="Start New Analysis"
            className="hidden md:flex p-1.5 text-[var(--color-text-muted)] hover:text-black rounded-control hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
