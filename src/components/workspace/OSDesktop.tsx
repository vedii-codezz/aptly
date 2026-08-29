"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { TopMenuBar } from "./TopMenuBar";
import { DockBar } from "./DockBar";
import { CommandPalette } from "./CommandPalette";
import { WindowFrame } from "./WindowFrame";
import { CheckWindow } from "../windows/CheckWindow";
import { ProfileWindow } from "../windows/ProfileWindow";
import { AskAptlyDrawer } from "../shared/AskAptlyDrawer";
import { WindowId } from "@/types/workspace";
import { cn } from "@/lib/utils";

// Lazy-load contextual intelligence windows
const WhyWindow = dynamic(() => import("../windows/WhyWindow").then((m) => ({ default: m.WhyWindow })), {
  loading: () => <WindowLoadingState label="WHY" />,
});
const ImproveWindow = dynamic(() => import("../windows/ImproveWindow").then((m) => ({ default: m.ImproveWindow })), {
  loading: () => <WindowLoadingState label="IMPROVE" />,
});
const StrategyWindow = dynamic(() => import("../windows/StrategyWindow").then((m) => ({ default: m.StrategyWindow })), {
  loading: () => <WindowLoadingState label="STRATEGY" />,
});
const ResumeWindow = dynamic(() => import("../windows/ResumeWindow").then((m) => ({ default: m.ResumeWindow })), {
  loading: () => <WindowLoadingState label="RESUME" />,
});
const ATSWindow = dynamic(() => import("../windows/ATSWindow").then((m) => ({ default: m.ATSWindow })), {
  loading: () => <WindowLoadingState label="ATS" />,
});

function WindowLoadingState({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="type-system text-[var(--color-text-ghost)]">APTLY/{label}</div>
        <div className="text-xs text-[var(--color-text-muted)] font-sans">Loading...</div>
      </div>
    </div>
  );
}

const MOBILE_TABS: WindowId[] = ["CHECK", "PROFILE", "WHY", "IMPROVE", "STRATEGY", "RESUME", "ATS"];

export function OSDesktop() {
  const { openWindows, activeWindow, openWindow, loadSampleOpportunity } = useWorkspaceStore();
  const searchParams = useSearchParams();

  const [mobileActiveTab, setMobileActiveTab] = useState<WindowId>("CHECK");
  const [isAskAptlyOpen, setIsAskAptlyOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Handle demo mode from landing page
  useEffect(() => {
    if (searchParams?.get("demo") === "1") {
      loadSampleOpportunity(0);
    }
    // Workspace entrance animation
    requestAnimationFrame(() => setIsReady(true));
  }, [searchParams, loadSampleOpportunity]);

  return (
    <div
      className={cn(
        "relative w-screen h-screen overflow-hidden bg-[var(--color-bg)] select-none flex flex-col font-sans transition-opacity duration-500",
        isReady ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-border) 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Menu Bar */}
      <TopMenuBar onOpenAskAptly={() => setIsAskAptlyOpen(true)} />

      {/* ─── Desktop Workspace Canvas ─── */}
      <main className="hidden md:block relative flex-1 w-full h-full overflow-hidden">
        <WindowFrame id="CHECK" title="CHECK" subtitle="Opportunity Intelligence" defaultWidth={880} defaultHeight={640}>
          <CheckWindow />
        </WindowFrame>

        <WindowFrame id="PROFILE" title="PROFILE" subtitle="Evidence & Background" defaultWidth={800} defaultHeight={600}>
          <ProfileWindow />
        </WindowFrame>

        <WindowFrame id="WHY" title="WHY" subtitle="Requirement Intelligence" defaultWidth={860} defaultHeight={620}>
          <WhyWindow />
        </WindowFrame>

        <WindowFrame id="IMPROVE" title="IMPROVE" subtitle="Gap Roadmaps" defaultWidth={880} defaultHeight={630}>
          <ImproveWindow />
        </WindowFrame>

        <WindowFrame id="STRATEGY" title="STRATEGY" subtitle="Application Blueprint" defaultWidth={840} defaultHeight={620}>
          <StrategyWindow />
        </WindowFrame>

        <WindowFrame id="RESUME" title="RESUME" subtitle="Evidence & Coverage" defaultWidth={900} defaultHeight={640}>
          <ResumeWindow />
        </WindowFrame>

        <WindowFrame id="ATS" title="ATS" subtitle="Screening Readability" defaultWidth={840} defaultHeight={620}>
          <ATSWindow />
        </WindowFrame>
      </main>

      {/* ─── Mobile Full-Screen Experience ─── */}
      <main className="md:hidden flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Mobile System Bar */}
        <div className="px-3 py-1.5 flex items-center gap-1 overflow-x-auto border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] shrink-0">
          {MOBILE_TABS.map((win) => (
            <button
              key={win}
              onClick={() => {
                setMobileActiveTab(win);
                openWindow(win);
              }}
              className={cn(
                "px-2.5 py-1.5 rounded-control text-system-xs whitespace-nowrap transition-colors duration-micro",
                mobileActiveTab === win
                  ? "bg-black text-white"
                  : "text-[var(--color-text-muted)] hover:text-black"
              )}
            >
              {win}
            </button>
          ))}
        </div>

        {/* Full-screen app view */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[var(--color-surface)]">
          {mobileActiveTab === "CHECK" && <CheckWindow />}
          {mobileActiveTab === "PROFILE" && <ProfileWindow />}
          {mobileActiveTab === "WHY" && <WhyWindow />}
          {mobileActiveTab === "IMPROVE" && <ImproveWindow />}
          {mobileActiveTab === "STRATEGY" && <StrategyWindow />}
          {mobileActiveTab === "RESUME" && <ResumeWindow />}
          {mobileActiveTab === "ATS" && <ATSWindow />}
        </div>
      </main>

      {/* Desktop Dock */}
      <DockBar />

      {/* Command Palette */}
      <CommandPalette />

      {/* Ask APTLY Drawer */}
      <AskAptlyDrawer isOpen={isAskAptlyOpen} onClose={() => setIsAskAptlyOpen(false)} />
    </div>
  );
}
