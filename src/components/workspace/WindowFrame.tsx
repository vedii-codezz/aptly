"use client";

import React, { useRef, useState, useEffect } from "react";
import { WindowId } from "@/types/workspace";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/lib/utils";
import { Minus, Square, X } from "lucide-react";

interface WindowFrameProps {
  id: WindowId;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
}

export function WindowFrame({
  id,
  title,
  subtitle,
  children,
  defaultWidth = 840,
  defaultHeight = 600,
  className,
}: WindowFrameProps) {
  const {
    openWindows,
    activeWindow,
    minimizedWindows,
    maximizedWindows,
    windowPositions,
    windowZIndices,
    bringToFront,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    setWindowPosition,
  } = useWorkspaceStore();

  const isOpen = openWindows.includes(id);
  const isMinimized = minimizedWindows.includes(id);
  const isMaximized = maximizedWindows.includes(id);
  const isActive = activeWindow === id;
  const zIndex = windowZIndices[id] || 10;
  const position = windowPositions[id] || { x: 50, y: 50 };

  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0, startY: 0, posX: position.x, posY: position.y,
  });

  // Trigger entrance animation once
  useEffect(() => {
    if (isOpen && !isMinimized && !hasAnimated) {
      requestAnimationFrame(() => setHasAnimated(true));
    }
    if (!isOpen) setHasAnimated(false);
  }, [isOpen, isMinimized, hasAnimated]);

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    bringToFront(id);
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, posX: position.x, posY: position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragRef.current.posX + dx));
      const newY = Math.max(40, Math.min(window.innerHeight - 150, dragRef.current.posY + dy));
      setWindowPosition(id, { x: newX, y: newY });
    };
    const handleMouseUp = () => { if (isDragging) setIsDragging(false); };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, id, setWindowPosition]);

  if (!isOpen || isMinimized) return null;

  return (
    <div
      onMouseDown={() => bringToFront(id)}
      style={{
        zIndex,
        ...(isMaximized
          ? { top: "var(--topbar-height)", left: 0, width: "100vw", height: "calc(100vh - var(--topbar-height))" }
          : {
              top: `${position.y}px`,
              left: `${position.x}px`,
              width: `min(${defaultWidth}px, 94vw)`,
              height: `min(${defaultHeight}px, 86vh)`,
            }),
      }}
      className={cn(
        "fixed flex flex-col bg-[var(--color-surface)] border rounded-window select-text overflow-hidden",
        "transition-[box-shadow,border-color,opacity] duration-ui",
        isActive
          ? "shadow-window-active border-[var(--color-border-strong)]"
          : "shadow-window border-[var(--color-border)] opacity-[0.96]",
        isDragging && "select-none cursor-grabbing",
        !hasAnimated && "animate-window-open",
        className
      )}
    >
      {/* ─── Titlebar ─── */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center justify-between px-3 border-b select-none cursor-grab shrink-0",
          "transition-colors duration-micro",
          isActive
            ? "bg-[var(--color-surface-active)] border-[var(--color-border)]"
            : "bg-[var(--color-surface-muted)] border-[var(--color-border-subtle)]"
        )}
        style={{ height: "var(--titlebar-height)" }}
      >
        {/* Title */}
        <div className="flex items-center gap-1.5 overflow-hidden pr-2">
          <span className="text-system-xs text-[var(--color-text-muted)] tracking-widest">APTLY</span>
          <span className="text-[var(--color-text-ghost)]">/</span>
          <span className="text-system-xs text-black tracking-wider">{title}</span>
          {subtitle && (
            <span className="hidden sm:inline text-[10px] text-[var(--color-text-muted)] font-sans border-l border-[var(--color-border-subtle)] pl-2 ml-1 truncate">
              {subtitle}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => minimizeWindow(id)}
            title="Minimize"
            className="w-6 h-6 flex items-center justify-center rounded-control text-[var(--color-text-ghost)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition-colors duration-micro"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleMaximizeWindow(id)}
            title={isMaximized ? "Restore" : "Maximize"}
            className="w-6 h-6 flex items-center justify-center rounded-control text-[var(--color-text-ghost)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] transition-colors duration-micro"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => closeWindow(id)}
            title="Close"
            className="w-6 h-6 flex items-center justify-center rounded-control text-[var(--color-text-ghost)] hover:text-white hover:bg-rose-500 transition-colors duration-micro"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--color-surface)] relative flex flex-col">
        {children}
      </div>
    </div>
  );
}
