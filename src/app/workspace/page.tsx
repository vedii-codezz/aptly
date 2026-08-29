"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import HomePage from "../page";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";
  const { loadDemoResume, loadSampleOpportunity } = useWorkspaceStore();

  useEffect(() => {
    if (isDemo) {
      loadDemoResume();
      loadSampleOpportunity(0);
    }
  }, [isDemo, loadDemoResume, loadSampleOpportunity]);

  return <HomePage />;
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-[#FBFBF9] flex items-center justify-center font-sans">
          <div className="type-system text-[var(--color-text-muted)]">APTLY/ INITIALIZING...</div>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
