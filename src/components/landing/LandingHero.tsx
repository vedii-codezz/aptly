"use client";

import React from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { ArrowRight, Sparkles } from "lucide-react";

interface LandingHeroProps {
  onEnter: () => void;
  onDemo: () => void;
}

export function LandingHero({ onEnter, onDemo }: LandingHeroProps) {
  return (
    <section className="bg-[var(--color-bg)] flex flex-col selection:bg-black selection:text-white border-b border-[var(--color-border-subtle)] font-sans">
      {/* ─── Top Bar ─── */}
      <header className="px-6 md:px-12 lg:px-20 py-5 flex items-center justify-between border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-black font-sans">APTLY</span>
          <span className="text-lg text-[var(--color-text-ghost)] font-light">/</span>
        </div>
        <div className="flex items-center gap-4 text-system-xs text-[var(--color-text-muted)] font-mono uppercase tracking-widest">
          <span className="hidden sm:inline">2026</span>
          <span className="hidden sm:inline text-[var(--color-border)]">·</span>
          <span className="hidden sm:inline">Opportunity Intelligence</span>
        </div>
      </header>

      {/* ─── Hero Content ─── */}
      <div className="px-6 md:px-12 lg:px-20 py-16 md:py-24 lg:py-28">
        <div className="max-w-5xl space-y-10 md:space-y-14">
          {/* Headline */}
          <div className="space-y-1 select-none">
            <h1 className="type-display text-display-xl text-black">
              CAN I
            </h1>
            <h1 className="type-display text-display-xl text-black">
              ACTUALLY
            </h1>
            <h1 className="type-display text-display-xl text-[var(--color-text-ghost)]">
              APPLY?
            </h1>
          </div>

          {/* Subtext + CTAs */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-16">
            <div className="space-y-6 max-w-md">
              <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed font-sans">
                Upload your resume. Drop the opportunity.
                <br />
                <span className="text-black font-medium">APTLY reads the fine print.</span>
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onEnter}
                  className="group px-6 py-3 bg-black hover:bg-[#222] text-white rounded-control text-sm font-sans font-semibold flex items-center gap-2 transition-colors duration-micro cursor-pointer shadow-subtle"
                >
                  <span>START ANALYSIS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-micro" />
                </button>

                <button
                  onClick={onDemo}
                  className="px-6 py-3 bg-transparent hover:bg-[var(--color-surface-muted)] text-black border border-[var(--color-border)] rounded-control text-sm font-sans font-medium transition-colors duration-micro cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 opacity-60" />
                  <span>TRY DEMO →</span>
                </button>
              </div>
            </div>

            {/* Right annotation column */}
            <div className="hidden md:block space-y-3 text-right">
              <div className="type-system text-[var(--color-text-muted)]">
                WHAT WE CHECK
              </div>
              <div className="text-xs text-[var(--color-text-muted)] font-sans leading-relaxed space-y-1">
                <div>Internship · Job · Fellowship</div>
                <div>Scholarship · Hackathon · Research</div>
              </div>
            </div>
          </div>

          {/* Editorial Principles */}
          <div className="pt-8 md:pt-12 border-t border-[var(--color-border-subtle)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="space-y-2">
                <div className="type-system text-[var(--color-text-muted)]">01 / ELIGIBILITY</div>
                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed">
                  Deterministic rule verification. Graduation dates and academic criteria checked without AI hallucination.
                </p>
              </div>
              <div className="space-y-2">
                <div className="type-system text-[var(--color-text-muted)]">02 / EVIDENCE</div>
                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed">
                  Every verdict traces back to your actual background. Claims separated from verified project proof.
                </p>
              </div>
              <div className="space-y-2">
                <div className="type-system text-[var(--color-text-muted)]">03 / STRATEGY</div>
                <p className="text-sm text-[var(--color-text-secondary)] font-sans leading-relaxed">
                  Apply now or improve first. Connected skill roadmaps. Resume intelligence. ATS screening audit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
