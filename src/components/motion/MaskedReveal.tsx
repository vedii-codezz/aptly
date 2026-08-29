"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MaskedRevealProps {
  lines: string[];
  lastLineColor?: string;
  className?: string;
  staggerMs?: number;
}

export function MaskedReveal({
  lines,
  lastLineColor = "text-black",
  className,
  staggerMs = 120,
}: MaskedRevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={cn("space-y-0 select-none", className)}>
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1;
        const colorClass = isLast ? lastLineColor : "text-black";

        return (
          <div key={i} className="overflow-hidden py-0.5">
            <div
              className={cn(
                "font-serif font-normal tracking-tight leading-[0.95] text-[clamp(3.5rem,8.5vw,8.5rem)]",
                colorClass,
                !reducedMotion && "animate-clip-reveal"
              )}
              style={
                !reducedMotion
                  ? {
                      animationDelay: `${i * staggerMs}ms`,
                      animationFillMode: "backwards",
                    }
                  : undefined
              }
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
}
