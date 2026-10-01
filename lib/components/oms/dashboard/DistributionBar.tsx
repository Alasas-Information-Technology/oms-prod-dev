"use client";

import React, { useId, useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { categoricalScale } from "@/lib/dashboard/chart-tokens";
import { HatchPatternDefs } from "./HatchPattern";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DistributionSegment {
  label: string;
  value: number | bigint;
  formatted?: string | React.ReactNode;
  percent: number;
  isResidual?: boolean;
  color?: string;
  subtext?: string;
  href?: string;
  onClick?: () => void;
}

export interface DistributionBarProps {
  segments: DistributionSegment[];
  className?: string;
  variant?: "default" | "detailed-legend";
  interactive?: boolean;
  onSegmentClick?: (segment: DistributionSegment, index: number) => void;
}

/**
 * Distribution Bar Component per T6 (DASHBOARD-VISUAL-LANGUAGE.md):
 * - One stacked bar with 6px radius on outer ends only, 2px gap between segments.
 * - Single hue descending scale matching the dashboard.
 * - Residual segment (Available / Other) uses T4 HatchPattern.
 * - Interactive hover synchronization between bar and legend.
 * - Tooltip displaying detailed values and percentages.
 */
export function DistributionBar({
  segments,
  className,
  variant = "default",
  interactive = true,
  onSegmentClick,
}: DistributionBarProps) {
  const router = useRouter();
  const generatedId = useId().replace(/:/g, "");
  const hatchPatternId = `dist-hatch-${generatedId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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

  // Determine segment colors and geometry
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

  const handleAction = (seg: (typeof processedSegments)[0], idx: number) => {
    seg.onClick?.();
    onSegmentClick?.(seg, idx);
    if (seg.href) router.push(seg.href);
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full flex flex-col justify-between gap-2.5 select-none font-sans", className)}
    >
      {/* Embedded SVG Defs for Hatched Pattern */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <HatchPatternDefs
            id={hatchPatternId}
            color="var(--accent-interactive, var(--primary))"
            strokeWidth={1}
            opacity={0.22}
          />
        </defs>
      </svg>

      {/* Top Row: Labels & Values Left-Aligned (ONLY when ALL segments fit inline and variant is default) */}
      {!hasNarrowSegment && variant === "default" && (
        <div className="flex w-full items-start min-h-[38px]">
          {processedSegments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                style={{ width: `${seg.percent}%` }}
                onMouseEnter={() => interactive && setHoveredIdx(idx)}
                onMouseLeave={() => interactive && setHoveredIdx(null)}
                className={cn(
                  "flex flex-col min-w-0 pr-2 relative transition-opacity duration-150 cursor-pointer",
                  idx > 0 && "pl-2.5 border-l border-border/40",
                  hoveredIdx !== null && (isHovered ? "opacity-100" : "opacity-45")
                )}
              >
                <span className={cn(
                  "text-[12px] font-medium font-sans truncate leading-tight transition-colors",
                  isHovered ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {seg.label}
                </span>
                <div className="text-[13px] font-bold text-foreground font-sans tabular-nums truncate mt-0.5">
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

      {/* Middle Row: 28px Sleek Stacked Bar with 6px outer radii & 2px gap per T6 */}
      <div className="h-[28px] w-full flex items-center gap-[2px] bg-transparent">
        {processedSegments.map((seg, idx) => {
          if (seg.percent <= 0) return null;
          const isHovered = hoveredIdx === idx;

          return (
            <TooltipProvider key={idx} delayDuration={50}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleAction(seg, idx)}
                    onMouseEnter={() => interactive && setHoveredIdx(idx)}
                    onMouseLeave={() => interactive && setHoveredIdx(null)}
                    style={{
                      width: `${seg.percent}%`,
                      background: seg.isResidual
                        ? `url(#${hatchPatternId})`
                        : undefined,
                      backgroundColor: seg.isResidual
                        ? "color-mix(in srgb, var(--accent-interactive, var(--primary)) 4%, transparent)"
                        : seg.resolvedColor,
                    }}
                    className={cn(
                      "h-full relative transition-all duration-150 cursor-pointer select-none outline-hidden",
                      seg.isFirst && "rounded-l-[6px]",
                      seg.isLast && "rounded-r-[6px]",
                      isHovered
                        ? "-translate-y-[2px] shadow-xs brightness-105 z-10"
                        : hoveredIdx !== null
                        ? "opacity-40"
                        : "opacity-100",
                      seg.isResidual && "border border-primary/30"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={4}
                  className="px-3 py-2 bg-popover text-popover-foreground border border-border shadow-md rounded-lg text-xs z-50 animate-in fade-in-0 zoom-in-95"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        seg.isResidual && "border border-primary/50"
                      )}
                      style={{
                        backgroundColor: seg.isResidual
                          ? "color-mix(in srgb, var(--accent-interactive, var(--primary)) 30%, transparent)"
                          : seg.resolvedColor,
                      }}
                    />
                    <span className="font-semibold text-foreground text-xs">
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 text-xs font-bold text-foreground tabular-nums">
                    <span>
                      {seg.formatted !== undefined
                        ? seg.formatted
                        : typeof seg.value === "number"
                        ? seg.value.toLocaleString()
                        : seg.value.toString()}
                    </span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({seg.percent.toFixed(1)}%)
                    </span>
                  </div>
                  {seg.subtext && (
                    <p className="text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/40">
                      {seg.subtext}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Bottom Row: Percentages Left-Aligned (ONLY when ALL segments fit inline and variant is default) */}
      {!hasNarrowSegment && variant === "default" && (
        <div className="flex w-full items-center min-h-[16px]">
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

      {/* Fallback Compact Row (when ANY segment is too narrow and variant is default) */}
      {hasNarrowSegment && variant === "default" && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1.5 border-t border-border/30 text-xs">
          {processedSegments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => handleAction(seg, idx)}
                onMouseEnter={() => interactive && setHoveredIdx(idx)}
                onMouseLeave={() => interactive && setHoveredIdx(null)}
                className={cn(
                  "flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all duration-150 cursor-pointer",
                  isHovered ? "bg-muted/60" : "hover:bg-muted/30"
                )}
              >
                <span
                  style={{
                    backgroundColor: seg.isResidual
                      ? "color-mix(in srgb, var(--accent-interactive, var(--primary)) 30%, transparent)"
                      : seg.resolvedColor,
                  }}
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    seg.isResidual && "border border-primary/40"
                  )}
                />
                <span className="text-[11.5px] font-medium text-muted-foreground font-sans">
                  {seg.label}:
                </span>
                <span className="text-[11.5px] font-semibold text-foreground font-sans tabular-nums">
                  {seg.formatted !== undefined
                    ? seg.formatted
                    : typeof seg.value === "number"
                    ? seg.value.toLocaleString()
                    : seg.value.toString()}
                </span>
                <span className="text-[10.5px] text-muted-foreground font-sans tabular-nums">
                  ({seg.percent.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Clean Vertical Legend (variant="detailed-legend") */}
      {variant === "detailed-legend" && (
        <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-border/30">
          {processedSegments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => handleAction(seg, idx)}
                onMouseEnter={() => interactive && setHoveredIdx(idx)}
                onMouseLeave={() => interactive && setHoveredIdx(null)}
                className={cn(
                  "flex items-center justify-between px-2 py-1 rounded-md transition-colors cursor-pointer",
                  isHovered ? "bg-muted/50" : "hover:bg-muted/25"
                )}
              >
                {/* Left: Circular Dot & Stage/Category Label */}
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className={cn(
                      "size-2.5 rounded-full shrink-0 transition-transform duration-150",
                      isHovered && "scale-125",
                      seg.isResidual && "border border-primary/40"
                    )}
                    style={{
                      background: seg.isResidual ? `url(#${hatchPatternId})` : undefined,
                      backgroundColor: seg.isResidual
                        ? "color-mix(in srgb, var(--accent-interactive, var(--primary)) 25%, transparent)"
                        : seg.resolvedColor,
                    }}
                  />
                  <span
                    className={cn(
                      "text-xs truncate transition-colors",
                      isHovered ? "text-primary font-semibold" : "text-foreground font-medium"
                    )}
                  >
                    {seg.label}
                  </span>
                </div>

                {/* Right: Value & Percentage */}
                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <span className="text-xs font-semibold text-foreground tracking-tight text-right min-w-[50px]">
                    {seg.formatted !== undefined
                      ? seg.formatted
                      : typeof seg.value === "number"
                      ? seg.value.toLocaleString()
                      : seg.value.toString()}
                  </span>

                  <span className="text-[11px] font-normal text-muted-foreground text-right w-11">
                    {seg.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
