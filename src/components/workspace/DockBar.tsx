"use client";

import React from "react";
import { WindowId } from "@/types/workspace";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/lib/utils";

interface DockEntry {
  id: WindowId;
  label: string;
  isContextual?: boolean;
}

const PRIMARY_ITEMS: DockEntry[] = [
  { id: "CHECK", label: "CHECK" },
  { id: "PROFILE", label: "PROFILE" },
  { id: "RESUME", label: "RESUME" },
];

const CONTEXTUAL_ITEMS: DockEntry[] = [
  { id: "WHY", label: "WHY", isContextual: true },
  { id: "IMPROVE", label: "IMPROVE", isContextual: true },
  { id: "STRATEGY", label: "STRATEGY", isContextual: true },
  { id: "ATS", label: "ATS", isContextual: true },
];

export function DockBar() {
  const { openWindows, activeWindow, minimizedWindows, openWindow, restoreWindow, currentAnalysis } =
    useWorkspaceStore();

  const handleClick = (id: WindowId) => {
    if (minimizedWindows.includes(id)) {
      restoreWindow(id);
    } else {
      openWindow(id);
    }
  };

  // Show contextual items when analysis exists or they're already open
  const visibleContextual = CONTEXTUAL_ITEMS.filter(
    (item) =>
      openWindows.includes(item.id) ||
      minimizedWindows.includes(item.id) ||
      currentAnalysis !== null
  );

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto hidden md:block">
      <nav
        aria-label="Application Dock"
        className="flex items-center gap-0.5 px-1.5 py-1 bg-[var(--color-surface-muted)]/95 backdrop-blur-md border border-[var(--color-border)] rounded-lg shadow-dock"
      >
        {PRIMARY_ITEMS.map((item) => (
          <DockButton
            key={item.id}
            item={item}
            isOpen={openWindows.includes(item.id)}
            isActive={activeWindow === item.id && !minimizedWindows.includes(item.id)}
            onClick={() => handleClick(item.id)}
          />
        ))}

        {visibleContextual.length > 0 && (
          <div className="w-px h-5 bg-[var(--color-border)] mx-1 self-center" />
        )}

        {visibleContextual.map((item) => (
          <DockButton
            key={item.id}
            item={item}
            isOpen={openWindows.includes(item.id)}
            isActive={activeWindow === item.id && !minimizedWindows.includes(item.id)}
            onClick={() => handleClick(item.id)}
          />
        ))}
      </nav>
    </div>
  );
}

function DockButton({
  item,
  isOpen,
  isActive,
  onClick,
}: {
  item: DockEntry;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative px-3 py-1.5 rounded-control transition-all duration-micro select-none",
        isActive
          ? "bg-black text-white"
          : isOpen
          ? "bg-[var(--color-surface-active)] text-black hover:bg-[var(--color-border-subtle)]"
          : "text-[var(--color-text-muted)] hover:text-black hover:bg-[var(--color-surface-active)]"
      )}
    >
      <span className="text-system-xs tracking-wider">{item.label}</span>

      {/* Open indicator dot */}
      {isOpen && (
        <span
          className={cn(
            "absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
            isActive ? "bg-white" : "bg-[var(--color-text-muted)]"
          )}
        />
      )}

      {/* Tooltip */}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[9px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity duration-micro whitespace-nowrap">
        APTLY/{item.label}
      </span>
    </button>
  );
}
