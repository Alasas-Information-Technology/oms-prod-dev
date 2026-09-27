"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatAbbreviated } from "@/lib/money";
import { Progress } from "@/components/ui/progress";

export type HeroTone = "accent" | "danger";

export interface HeroInsightCardProps {
  /** Large figure — rendered as a formatted monetary value when isCurrency is true */
  value: string | number;
  /** Whether the value is a monetary amount in minor units (fils) */
  isCurrency?: boolean;
  /** Plain-language sentence explaining what the value means */
  sentence: string;
  /** Optional progress track at the bottom (0–1) */
  trackProgress?: number;
  /** Tone: 'accent' for normal, 'danger' for failure states */
  tone?: HeroTone;
  /** Additional class names */
  className?: string;
}

/**
 * U1 / I1 — Hero Insight Card
 *
 * The ONLY component in the dashboard allowed a non-white,
 * non-hairline-bordered, filled-background surface.
 *
 * Rules:
 * - Filled background using the DIEZ-grounded indigo accent token.
 * - Light/white text.
 * - One large number or short phrase.
 * - One plain-language sentence stating what it means.
 * - An optional thin progress track at the base.
 * - Exactly ONE per dashboard. If a second use is needed, stop and ask first.
 */
export function HeroInsightCard({
  value,
  isCurrency = false,
  sentence,
  trackProgress,
  tone = "accent",
  className,
}: HeroInsightCardProps) {
  const displayValue = isCurrency
    ? formatAbbreviated(Number(value), { showCurrency: true })
    : String(value);

  const isAccent = tone === "accent";

  return (
    <div
      className={cn(
        // U4: 20px radius, no border
        "relative rounded-[20px] border-0 overflow-hidden select-none",
        "flex flex-col justify-between p-5 min-h-[152px]",
        // SVG background images
        "bg-cover bg-center",
        isAccent
          ? "bg-[url('/images/kpi-gradient.svg')] dark:bg-[url('/images/kpi-gradient-dark.svg')] text-[var(--primary-foreground)]"
          : "bg-[url('/images/kpi-gradient-danger.svg')] dark:bg-[url('/images/kpi-gradient-danger-dark.svg')] text-white",
        // Subtle inner glow
        isAccent
          ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.10)]"
          : "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.10)]",
        className,
      )}
    >

      {/* Top: Large value */}
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "text-[28px] font-bold tracking-tight leading-none font-display",
            isAccent ? "text-white" : "text-white",
          )}
        >
          {displayValue}
        </span>
      </div>

      {/* Bottom: Sentence */}
      <p
        className={cn(
          "text-[13px] leading-snug font-medium mt-2",
          isAccent
            ? "text-white/80"
            : "text-white/85",
        )}
      >
        {sentence}
      </p>

      {/* Optional progress track at the base */}
      {trackProgress !== undefined && trackProgress >= 0 && (
        <Progress
          value={Math.min(100, Math.max(0, trackProgress * 100))}
          className="mt-3 h-[6px] bg-white/20 [&_[data-slot=progress-indicator]]:bg-white/60"
        />
      )}
    </div>
  );
}
