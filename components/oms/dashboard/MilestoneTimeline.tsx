"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UpcomingMilestoneItem, MilestoneType } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export interface MilestoneTimelineProps {
  milestones: UpcomingMilestoneItem[];
  referenceDate?: string; // Default "2026-08-31"
  className?: string;
}

const TYPE_COLORS: Record<MilestoneType, { bg: string; border: string; text: string; label: string }> = {
  INTERVIEW: {
    bg: "bg-indigo-500",
    border: "border-indigo-600",
    text: "text-indigo-600 dark:text-indigo-400",
    label: "Interview",
  },
  JOINING: {
    bg: "bg-emerald-500",
    border: "border-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Joining",
  },
  DOCUMENT_EXPIRY: {
    bg: "bg-amber-500",
    border: "border-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    label: "Doc Expiry",
  },
  CONTRACT_END: {
    bg: "bg-rose-500",
    border: "border-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    label: "Contract End",
  },
};

interface MilestoneCluster {
  id: string;
  items: UpcomingMilestoneItem[];
  primaryType: MilestoneType;
  posPercent: number;
  date: Date;
  dateStr: string;
}

/**
 * V4 — Milestone timeline per DASHBOARD-VISUAL-DEPTH.md:
 * - Horizontal 60-day strip, 80px tall, full card width
 * - Month dividers with labels
 * - A vertical accent line marking TODAY
 * - One marker per milestone, positioned by date, coloured by type, sized by count (12px base, up to 20px)
 * - Overlapping markers within 2 days cluster into one with a count badge
 * - Hover shows a tooltip with type, detail and date; click navigates
 */
export function MilestoneTimeline({
  milestones,
  referenceDate = "2026-08-31",
  className,
}: MilestoneTimelineProps) {
  const router = useRouter();
  const [hoveredCluster, setHoveredCluster] = useState<MilestoneCluster | null>(null);

  const baseDate = useMemo(() => new Date(referenceDate), [referenceDate]);
  const windowDays = 60;
  const windowEnd = useMemo(() => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + windowDays);
    return d;
  }, [baseDate]);

  // Compute month dividers within the 60-day window
  const monthDividers = useMemo(() => {
    const dividers: { label: string; percent: number }[] = [];
    const current = new Date(baseDate);
    current.setHours(0, 0, 0, 0);

    // Find the first of next month
    const iter = new Date(current);
    iter.setDate(1);
    if (iter < current) {
      iter.setMonth(iter.getMonth() + 1);
    }

    const totalMs = windowDays * 24 * 60 * 60 * 1000;

    while (iter <= windowEnd) {
      const diffMs = iter.getTime() - current.getTime();
      const percent = (diffMs / totalMs) * 100;
      if (percent >= 0 && percent <= 100) {
        dividers.push({
          label: iter.toLocaleDateString("en-GB", { month: "short" }),
          percent,
        });
      }
      iter.setMonth(iter.getMonth() + 1);
    }

    return dividers;
  }, [baseDate, windowEnd, windowDays]);

  // Cluster milestones within 2 days of each other
  const clusters = useMemo(() => {
    const valid = milestones
      .map((m) => ({ ...m, dateObj: new Date(m.date) }))
      .filter((m) => !isNaN(m.dateObj.getTime()))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const result: MilestoneCluster[] = [];
    const totalMs = windowDays * 24 * 60 * 60 * 1000;
    const startTime = baseDate.getTime();

    for (const item of valid) {
      const diffDaysFromStart = (item.dateObj.getTime() - startTime) / (24 * 60 * 60 * 1000);
      const posPercent = Math.max(2, Math.min(98, (diffDaysFromStart / windowDays) * 100));

      const existing = result.find((c) => {
        const diff = Math.abs(item.dateObj.getTime() - c.date.getTime()) / (24 * 60 * 60 * 1000);
        return diff <= 2;
      });

      if (existing) {
        existing.items.push(item);
      } else {
        result.push({
          id: item.id,
          items: [item],
          primaryType: item.type,
          posPercent,
          date: item.dateObj,
          dateStr: item.formattedDate || item.date,
        });
      }
    }

    return result;
  }, [milestones, baseDate, windowDays]);

  return (
    <div
      className={cn(
        "relative w-full h-[80px] bg-muted/20 border border-border/40 rounded-md p-3 select-none flex flex-col justify-between overflow-visible",
        className
      )}
    >
      {/* Month Labels & Dividers */}
      <div className="relative w-full h-4">
        {/* Today Label */}
        <span className="absolute left-0 top-0 text-[10px] font-semibold text-primary uppercase tracking-wider">
          Today
        </span>

        {monthDividers.map((div, idx) => (
          <span
            key={idx}
            style={{ left: `${div.percent}%` }}
            className="absolute top-0 -translate-x-1/2 text-[10px] font-medium text-muted-foreground"
          >
            {div.label}
          </span>
        ))}
      </div>

      {/* Axis Track Line */}
      <div className="relative w-full h-8 flex items-center">
        {/* Horizontal Axis Baseline */}
        <div className="absolute left-0 right-0 h-[2px] bg-border/80" />

        {/* Vertical Today Marker */}
        <div className="absolute left-0 top-[-6px] bottom-[-6px] w-[2px] bg-primary z-10">
          <div className="absolute top-[-2px] left-[-3px] w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Month Divider Ticks */}
        {monthDividers.map((div, idx) => (
          <div
            key={idx}
            style={{ left: `${div.percent}%` }}
            className="absolute top-[-4px] bottom-[-4px] w-[1px] bg-border z-0"
          />
        ))}

        {/* Milestone Markers */}
        {clusters.map((cluster) => {
          const config = TYPE_COLORS[cluster.primaryType] || TYPE_COLORS.INTERVIEW;
          const count = cluster.items.length;
          const sizePx = Math.min(22, 13 + (count - 1) * 3);

          return (
            <div
              key={cluster.id}
              style={{ left: `${cluster.posPercent}%` }}
              className="absolute -translate-x-1/2 cursor-pointer z-20 group"
              onMouseEnter={() => setHoveredCluster(cluster)}
              onMouseLeave={() => setHoveredCluster(null)}
              onClick={() => {
                if (cluster.items[0]?.link) {
                  router.push(cluster.items[0].link);
                }
              }}
            >
              {/* Marker Circle */}
              <div
                style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                className={cn(
                  "rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs transition-transform duration-150 hover:scale-125 border-2 border-background",
                  config.bg
                )}
                title={`${cluster.items.map((i) => i.label).join(", ")} (${cluster.dateStr})`}
              >
                {count > 1 ? count : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Days window hint */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/80">
        <span>60-day horizon</span>
        <span>+60 days</span>
      </div>

      {/* Hover Floating Tooltip */}
      {hoveredCluster && (
        <div
          style={{
            left: `${Math.max(12, Math.min(88, hoveredCluster.posPercent))}%`,
            bottom: "82px",
          }}
          className="absolute -translate-x-1/2 z-50 bg-popover text-popover-foreground border border-border/80 rounded-md p-2 shadow-lg min-w-[180px] max-w-[260px] text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="font-semibold text-foreground pb-1 border-b border-border/40 flex items-center justify-between">
            <span>{hoveredCluster.dateStr}</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              {hoveredCluster.items.length} item{hoveredCluster.items.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 space-y-1">
            {hoveredCluster.items.map((item, idx) => {
              const cfg = TYPE_COLORS[item.type] || TYPE_COLORS.INTERVIEW;
              return (
                <div key={idx} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.bg)} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.detail && (
                    <span className="text-[11px] text-muted-foreground pl-3 truncate">
                      {item.detail}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
