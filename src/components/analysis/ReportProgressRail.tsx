"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const RAIL_CHAPTERS = [
  { id: "sec-verdict", num: "01", title: "VERDICT" },
  { id: "sec-requirements", num: "02", title: "REQUIREMENTS" },
  { id: "sec-why", num: "03", title: "WHY" },
  { id: "sec-fit", num: "04", title: "YOUR FIT" },
  { id: "sec-gaps", num: "05", title: "GAPS" },
  { id: "sec-improve", num: "06", title: "IMPROVE" },
  { id: "sec-strategy", num: "07", title: "STRATEGY" },
  { id: "sec-resume", num: "08", title: "RESUME FIT" },
  { id: "sec-ats", num: "09", title: "ATS" },
];

export function ReportProgressRail() {
  const [activeId, setActiveId] = useState("sec-verdict");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.2],
      }
    );

    RAIL_CHAPTERS.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const activeIndex = RAIL_CHAPTERS.findIndex((c) => c.id === activeId);

  return (
    <aside
      aria-label="Report section progress rail"
      className="hidden xl:flex fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-30 font-mono select-none"
    >
      {/* Background Track Line */}
      <div className="relative flex flex-col items-center gap-3 py-2">
        <div className="absolute top-3 bottom-3 w-px bg-[var(--color-border)] -z-10" />

        {RAIL_CHAPTERS.map((ch, idx) => {
          const isActive = ch.id === activeId;
          const isPassed = idx < activeIndex;
          const isHovered = hoveredId === ch.id;

          return (
            <div
              key={ch.id}
              className="relative flex items-center group cursor-pointer"
              onMouseEnter={() => setHoveredId(ch.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => scrollTo(ch.id)}
            >
              {/* Marker Dot */}
              <button
                type="button"
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-micro flex items-center justify-center",
                  isActive
                    ? "bg-black ring-4 ring-black/10 scale-125"
                    : isPassed
                    ? "bg-black"
                    : "bg-[var(--color-surface)] border border-[var(--color-border-strong)] hover:border-black"
                )}
                aria-label={`Jump to ${ch.num} ${ch.title}`}
              >
                {isActive && <span className="w-1 h-1 rounded-full bg-white" />}
              </button>

              {/* Hover Tooltip Label */}
              {isHovered && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-black text-white text-[10px] rounded-control whitespace-nowrap shadow-subtle animate-fade-in pointer-events-none z-40">
                  <span className="text-emerald-400 font-bold">{ch.num}</span> / {ch.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
