"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { categoricalScale } from "@/lib/dashboard/chart-tokens";
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
  variant?: "default" | "detailed-legend";
}

/**
 * Distribution Bar Component per T6 (DASHBOARD-VISUAL-LANGUAGE.md & DASHBOARD-VISUAL-DEPTH.md):
 * - All-or-nothing label placement: If ANY segment is < 90px, ALL labels move to the legend row beneath.
 * - Measured width via ResizeObserver.
 * - Bar 28px tall, 6px radius on OUTER ENDS ONLY, 2px gap between segments, square interior edges.
 * - Segments in one hue at 100% / 72% / 48% / 30%.
 * - Residual segment (Available / Other) uses HatchPattern with 1px outline at 30% opacity.
 */
export function DistributionBar({ segments, className, variant = "default" }: DistributionBarProps) {
  const generatedId = useId().replace(/:/g, "");
  const hatchPatternId = `dist-hatch-${generatedId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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
    if (containerRef.current.clientWidth > 0) {
      setContainerWidth(containerRef.current.clientWidth);
    }
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

  // Determine segment colors and narrow status
  const { processedSegments, hasNarrowSegment } = useMemo(() => {
    let nonResidualIdx = 0;
    const width = containerWidth || 600;

    let anyNarrow = false;
    const procs = segments.map((seg, idx) => {
      let color = seg.color;
      if (!color) {
        if (seg.isResidual) {
          color = undefined;
        } else {
          color = scale[nonResidualIdx % scale.length];
          nonResidualIdx++;
        }
      }

      const segmentPx = (seg.percent / 100) * width;
      const isNarrow = seg.percent > 0 && segmentPx < 90;
      if (isNarrow) {
        anyNarrow = true;
      }

      return {
        ...seg,
        resolvedColor: color,
        segmentPx,
        isFirst: idx === 0,
        isLast: idx === segments.length - 1,
      };
    });

    return { processedSegments: procs, hasNarrowSegment: anyNarrow };
  }, [segments, scale, containerWidth]);


  return (
    <div
      ref={containerRef}
      className={cn("w-full flex flex-col justify-between gap-2 select-none font-sans", className)}
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

      {/* Top Row: Labels & Values Left-Aligned to Segment Start (ONLY when ALL segments fit inline and variant is default) */}
      {!hasNarrowSegment && variant === "default" && (
        <div className="flex w-full items-start min-h-[38px]">
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
              </div>
            );
          })}
        </div>
      )}

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

      {/* Bottom Row: Percentages Left-Aligned (ONLY when ALL segments fit inline and variant is default) */}
      {!hasNarrowSegment && variant === "default" && (
        <div className="flex w-full items-center min-h-[18px]">
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
      )}

      {/* ALL-OR-NOTHING Legend Row (Rendered when ANY segment is too narrow and variant is default) */}
      {hasNarrowSegment && variant === "default" && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1.5 border-t border-border/40 text-xs">
          {processedSegments.map((seg, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
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

      {/* Detailed Vertical Legend */}
      {variant === "detailed-legend" && (
        <div className="flex flex-col gap-2.5 mt-3 pt-2 border-t border-border/40">
          {processedSegments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "w-3 h-3 rounded-sm shrink-0 shadow-2xs",
                    seg.isResidual && "border border-primary/30"
                  )}
                  style={{
                    background: seg.isResidual ? `url(#${hatchPatternId})` : undefined,
                    backgroundColor: seg.isResidual
                      ? "color-mix(in srgb, var(--primary) 30%, transparent)"
                      : seg.resolvedColor,
                  }}
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {seg.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-sm font-bold text-foreground tracking-tight tabular-nums">
                  {seg.formatted !== undefined
                    ? seg.formatted
                    : typeof seg.value === "number"
                    ? seg.value.toLocaleString()
                    : seg.value.toString()}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground tabular-nums w-12 text-right">
                  {seg.percent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
