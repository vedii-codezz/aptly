"use client";

import React, { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { TrustTag } from "./TrustTag";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Send,
  X,
  ArrowRight,
} from "lucide-react";

export function AskAptlyDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    activeOpportunity,
    currentAnalysis,
    activeStrategyPlan,
    resumeFitAnalysis,
  } = useWorkspaceStore();

  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: "user" | "aptly";
      text: string;
      trustTag?: "FACT" | "INTERPRETATION" | "SUGGESTION" | "USER_CONFIRMED";
      citations?: Array<{ source: string; excerptOrDetail?: string }>;
      suggestedFollowUps?: string[];
    }>
  >([]);

  if (!isOpen) return null;

  // Contextual suggested questions derived deterministically from active state
  const suggestedQuestions: string[] = [];
  if (currentAnalysis?.verdict.stats.mandatoryUnknown && currentAnalysis.verdict.stats.mandatoryUnknown > 0) {
    suggestedQuestions.push("Why can't APTLY confirm eligibility yet?");
  }
  if (activeStrategyPlan?.applyDecision.decision === "APPLY_NOW") {
    suggestedQuestions.push("Should I apply now or improve SQL first?");
  } else if (activeStrategyPlan?.applyDecision.decision === "FIX_ONE_THING_FIRST") {
    suggestedQuestions.push("What is currently blocking my application?");
  }
  if (resumeFitAnalysis && resumeFitAnalysis.disconnects.length > 0) {
    suggestedQuestions.push("What is my resume failing to show?");
  }
  suggestedQuestions.push("Why is SQL categorized as medium priority?");
  suggestedQuestions.push("Will I get selected for this role?");

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg = { id: userMsgId, sender: "user" as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsLoading(true);

    try {
      const payloadContext = {
        opportunityTitle: activeOpportunity?.title,
        verdict: currentAnalysis?.verdict.badgeLabel,
        mandatoryFailed: currentAnalysis?.verdict.stats.mandatoryFailed,
        mandatoryUnknown: currentAnalysis?.verdict.stats.mandatoryUnknown,
        applyDecision: activeStrategyPlan?.applyDecision.decision,
        applyDecisionReasoning: activeStrategyPlan?.applyDecision.reasoning,
        gapsCount: currentAnalysis?.gaps.competitivenessGaps.length,
        disconnectCount: resumeFitAnalysis?.disconnects.length,
      };

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context: payloadContext }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-aptly-${Date.now()}`,
            sender: "aptly",
            text: json.data.answer,
            trustTag: json.data.trustTag,
            citations: json.data.citations,
            suggestedFollowUps: json.data.suggestedFollowUps,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-aptly-${Date.now()}`,
            sender: "aptly",
            text: json.error || "Unable to retrieve contextual answer. Deterministic analysis remains active.",
            trustTag: "FACT",
            citations: [{ source: "APTLY Offline Engine" }],
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-aptly-${Date.now()}`,
          sender: "aptly",
          text: "APTLY is operating in offline mode. Deterministic analysis and requirement traces remain available.",
          trustTag: "FACT",
          citations: [{ source: "APTLY Rule Pipeline" }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[var(--color-surface)] border-l border-[var(--color-border-strong)] shadow-command z-50 flex flex-col font-sans text-black animate-fade-in">
      {/* ─── Drawer Header ─── */}
      <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="type-system text-black">ASK APTLY</span>
          <span className="text-[var(--color-text-ghost)] font-mono">/</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-control hover:bg-[var(--color-surface-active)] flex items-center justify-center text-[var(--color-text-muted)] transition-colors duration-micro"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Status Strip ─── */}
      <div className="px-4 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-border-subtle)] text-[10px] font-mono text-[var(--color-text-muted)] flex items-center justify-between">
        <span>Context: {activeOpportunity?.title.replace("SAMPLE / ", "").slice(0, 24)}...</span>
        <span className="text-aptly-match font-semibold">ENGINE-ALIGNED</span>
      </div>

      {/* ─── Message List ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {messages.length === 0 ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-1 text-xs">
              <span className="type-system text-[var(--color-text-muted)]">CONTEXTUAL QUERY ASSISTANT</span>
              <p className="text-[var(--color-text-secondary)] leading-relaxed font-sans text-xs">
                Ask specific questions about requirement interpretations, gap priorities, your resume fit, or whether you should apply now.
              </p>
            </div>

            {/* Suggested Queries */}
            <div className="space-y-1.5 pt-2">
              <div className="type-system text-[var(--color-text-ghost)]">
                SUGGESTED QUERIES
              </div>
              <div className="space-y-1">
                {suggestedQuestions.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sq)}
                    className="w-full text-left p-2.5 bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-active)] rounded-control border border-[var(--color-border-subtle)] text-black font-sans text-xs transition-colors duration-micro flex items-center justify-between group"
                  >
                    <span>{sq}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--color-text-ghost)] group-hover:text-black shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-1.5">
              {/* Sender label */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {msg.sender === "user" ? (
                  <span className="text-[var(--color-text-muted)] font-mono">&gt; USER QUERY</span>
                ) : (
                  <>
                    <span className="font-bold text-black uppercase">APTLY</span>
                    {msg.trustTag && <TrustTag trust={msg.trustTag as any} />}
                  </>
                )}
              </div>

              {/* Message text */}
              <div
                className={cn(
                  "p-3 rounded-control text-xs leading-relaxed",
                  msg.sender === "user"
                    ? "bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] font-mono text-black"
                    : "bg-[var(--color-surface)] border border-[var(--color-border)] text-black font-sans"
                )}
              >
                {msg.text}
              </div>

              {/* References / Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="space-y-0.5 pt-1 text-[10px] font-mono text-[var(--color-text-muted)] pl-1">
                  <div className="type-system text-[var(--color-text-ghost)]">REFERENCES</div>
                  {msg.citations.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-[var(--color-text-ghost)]">·</span>
                      <strong className="text-black">{c.source}</strong>
                      {c.excerptOrDetail && <span className="text-[var(--color-text-muted)]">({c.excerptOrDetail})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="p-2.5 bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] rounded-control text-xs font-mono text-[var(--color-text-muted)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
            <span>Consulting deterministic engine state...</span>
          </div>
        )}
      </div>

      {/* ─── Input Bar ─── */}
      <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuestion);
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-control px-2.5 py-1.5 focus-within:border-black">
            <span className="text-xs font-mono text-[var(--color-text-ghost)] mr-1.5">&gt;</span>
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask about this opportunity..."
              disabled={isLoading}
              className="w-full text-xs font-sans bg-transparent text-black placeholder:text-[var(--color-text-ghost)] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="px-3 py-2 bg-black hover:bg-[#222] disabled:opacity-40 text-white rounded-control text-system-xs flex items-center justify-center transition-colors duration-micro"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
