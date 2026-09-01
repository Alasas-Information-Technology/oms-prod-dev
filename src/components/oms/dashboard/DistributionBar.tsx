"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { categoricalScale } from "@/src/lib/dashboard/chart-tokens";
import { HatchPatternDefs } from "./HatchPattern";

export interface DistributionSegment {
  label: string;
  value: number | bigint;
  formatted?: string | React.ReactNode;
  percent: number;
  isResidual?: boolean;
  color?: string;
}

export interface DistributionBarProps {
  segments: DistributionSegment[];
  className?: string;
}

/**
 * Distribution Bar Component per T6 (DASHBOARD-VISUAL-LANGUAGE.md):
 * - Labels and values ABOVE: 12px weight 400 muted sans label, 14px weight 600 sans tabular-nums value
 * - Bar 28px tall, 6px radius on OUTER ENDS ONLY, 2px gap between segments, square interior edges
 * - Segments in one hue at 100% / 72% / 48% / 30%
 * - Residual segment (Available / Other) uses HatchPattern with 1px outline at 30% opacity
 * - Percentages BELOW: 11px weight 400 muted sans tabular-nums
 * - Narrow segment handling (<90px width): moved to legend row below rather than truncating
 */
export function DistributionBar({ segments, className }: DistributionBarProps) {
  const generatedId = useId().replace(/:/g, "");
  const hatchPatternId = `dist-hatch-${generatedId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter out zero percent segments for scale calculations
  const nonResidualCount = useMemo(
    () => segments.filter((s) => !s.isResidual).length,
    [segments]
  );
  const scale = useMemo(
    () => categoricalScale(Math.max(nonResidualCount, 1)),
    [nonResidualCount]
  );

  // Determine segment colors and narrow status (< 90px threshold)
  let nonResidualIdx = 0;
  const processedSegments = useMemo(() => {
    return segments.map((seg, idx) => {
      let color = seg.color;
      if (!color) {
        if (seg.isResidual) {
          color = undefined;
        } else {
          color = scale[nonResidualIdx] || scale[0];
          nonResidualIdx++;
        }
      }

      const segmentPx = (seg.percent / 100) * containerWidth;
      const isNarrow = segmentPx < 90;

      return {
        ...seg,
        resolvedColor: color,
        isNarrow,
        isFirst: idx === 0,
        isLast: idx === segments.length - 1,
      };
    });
  }, [segments, scale, containerWidth]);

  // Narrow segments that overflow into the bottom legend
  const narrowSegments = useMemo(
    () => processedSegments.filter((s) => s.isNarrow && s.percent > 0),
    [processedSegments]
  );

  return (
    <div
      ref={containerRef}
      className={cn("w-full flex flex-col justify-between gap-1.5 select-none font-sans", className)}
    >
      {/* Embedded SVG Defs for Hatched Pattern */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <HatchPatternDefs
            id={hatchPatternId}
            color="var(--primary)"
            strokeWidth={1}
            opacity={0.30}
          />
        </defs>
      </svg>

      {/* Top Row: Labels & Values Left-Aligned to Segment Start (h-10 / 40px) */}
      <div className="flex w-full items-start min-h-[40px]">
        {processedSegments.map((seg, idx) => {
          return (
            <div
              key={idx}
              style={{ width: `${seg.percent}%` }}
              className={cn(
                "flex flex-col min-w-0 pr-2 relative",
                idx > 0 && "pl-2.5 border-l border-border/50"
              )}
            >
              {!seg.isNarrow ? (
                <>
                  <span className="text-[12px] font-normal text-muted-foreground font-sans truncate leading-tight">
                    {seg.label}
                  </span>
                  <div className="text-[14px] font-semibold text-foreground font-sans tabular-nums truncate mt-0.5">
                    {seg.formatted !== undefined
                      ? seg.formatted
                      : typeof seg.value === "number"
                      ? seg.value.toLocaleString()
                      : seg.value.toString()}
                  </div>
                </>
              ) : (
                /* Keep vertical boundary divider aligned without truncated text */
                <div className="h-full min-h-[36px]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Middle Row: 28px Stacked Bar with 6px outer radii ONLY & 2px gap */}
      <div className="h-[28px] w-full flex items-center gap-[2px] bg-transparent overflow-hidden">
        {processedSegments.map((seg, idx) => {
          if (seg.percent <= 0) return null;

          return (
            <div
              key={idx}
              style={{
                width: `${seg.percent}%`,
                background: seg.isResidual ? `url(#${hatchPatternId})` : undefined,
                backgroundColor: seg.isResidual
                  ? "color-mix(in srgb, var(--primary) 4%, transparent)"
                  : seg.resolvedColor,
              }}
              className={cn(
                "h-full relative transition-all duration-150",
                seg.isResidual && "border border-primary/30",
                seg.isFirst && "rounded-l-[6px]",
                seg.isLast && "rounded-r-[6px]",
                !seg.isFirst && !seg.isLast && "rounded-none"
              )}
              title={`${seg.label}: ${seg.percent.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Bottom Row: Percentages Left-Aligned to Segment Start (h-5 / 20px) */}
      <div className="flex w-full items-center min-h-[20px]">
        {processedSegments.map((seg, idx) => {
          return (
            <div
              key={idx}
              style={{ width: `${seg.percent}%` }}
              className={cn(
                "flex items-center min-w-0 pr-2",
                idx > 0 && "pl-2.5"
              )}
            >
              <span className="text-[11px] font-normal text-muted-foreground font-sans tabular-nums truncate">
                {seg.percent.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Overflow Legend Row for Narrow Segments (<90px wide) */}
      {narrowSegments.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 pt-1.5 mt-0.5 border-t border-border/40 text-xs">
          {narrowSegments.map((seg, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: seg.isResidual
                    ? "color-mix(in srgb, var(--primary) 30%, transparent)"
                    : seg.resolvedColor,
                }}
                className="w-2.5 h-2.5 rounded-xs shrink-0"
              />
              <span className="text-[12px] font-normal text-muted-foreground font-sans">
                {seg.label}:
              </span>
              <span className="text-[13px] font-semibold text-foreground font-sans tabular-nums">
                {seg.formatted !== undefined
                  ? seg.formatted
                  : typeof seg.value === "number"
                  ? seg.value.toLocaleString()
                  : seg.value.toString()}
              </span>
              <span className="text-[11px] font-normal text-muted-foreground font-sans tabular-nums">
                ({seg.percent.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
