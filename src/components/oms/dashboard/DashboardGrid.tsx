"use client";

import React from "react";
import {
  DashboardBand,
  DashboardScope,
  WidgetId,
  WidgetPlacement,
} from "@/src/types/dashboard";
import { getWidgetDefinition } from "@/src/lib/dashboard/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// Hole-Free Row Expansion Algorithm
// =============================================================================

/**
 * Calculates balanced spans for a list of widgets within a band so that
 * rows never leave empty holes on a 12-column grid.
 */
export function calculateBalancedSpans(
  placements: WidgetPlacement[]
): Map<WidgetId, number> {
  const spanMap = new Map<WidgetId, number>();
  if (!placements || placements.length === 0) return spanMap;

  // Sort by priority ascending
  const sorted = [...placements].sort((a, b) => a.priority - b.priority);

  // Group into rows of at most 12 requested columns
  const rows: WidgetPlacement[][] = [];
  let currentRow: WidgetPlacement[] = [];
  let currentSum = 0;

  for (const item of sorted) {
    const rawSpan = item.span || 3;
    if (currentSum + rawSpan > 12 && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [item];
      currentSum = rawSpan;
    } else {
      currentRow.push(item);
      currentSum += rawSpan;
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Balance each row to fill exactly 12 columns
  for (const row of rows) {
    const count = row.length;
    const rowRequestedSum = row.reduce((s, w) => s + (w.span || 3), 0);

    if (rowRequestedSum === 12) {
      // Perfect match
      for (const w of row) {
        spanMap.set(w.id, w.span || 3);
      }
    } else if (count === 1) {
      // Single widget in row -> expand to full 12 columns
      spanMap.set(row[0].id, 12);
    } else if (count === 2 && rowRequestedSum === 6) {
      // Two 3-span widgets -> 6 each
      spanMap.set(row[0].id, 6);
      spanMap.set(row[1].id, 6);
    } else if (count === 2 && rowRequestedSum === 8) {
      // Two 4-span widgets -> 6 each
      spanMap.set(row[0].id, 6);
      spanMap.set(row[1].id, 6);
    } else if (count === 3 && rowRequestedSum === 9) {
      // Three 3-span widgets -> 4 each
      spanMap.set(row[0].id, 4);
      spanMap.set(row[1].id, 4);
      spanMap.set(row[2].id, 4);
    } else if (12 % count === 0) {
      // Even division possible (e.g. 4 -> 3 each, 6 -> 2 each)
      const uniformSpan = 12 / count;
      for (const w of row) {
        spanMap.set(w.id, uniformSpan);
      }
    } else {
      // Proportional expansion with integer remainder distribution
      const baseSpan = Math.floor(12 / count);
      let remainder = 12 - baseSpan * count;

      for (let i = 0; i < count; i++) {
        const extra = remainder > 0 ? 1 : 0;
        remainder = Math.max(0, remainder - 1);
        spanMap.set(row[i].id, baseSpan + extra);
      }
    }
  }

  return spanMap;
}

// =============================================================================
// Helper for Responsive Grid Classes
// =============================================================================

function getResponsiveSpanClasses(span12: number): string {
  switch (span12) {
    case 12:
      return "col-span-1 md:col-span-4 lg:col-span-8 2xl:col-span-12";
    case 8:
      return "col-span-1 md:col-span-4 lg:col-span-8 2xl:col-span-8";
    case 6:
      return "col-span-1 md:col-span-4 lg:col-span-4 2xl:col-span-6";
    case 4:
      return "col-span-1 md:col-span-2 lg:col-span-4 2xl:col-span-4";
    case 3:
      return "col-span-1 md:col-span-2 lg:col-span-2 2xl:col-span-3";
    case 2:
      return "col-span-1 md:col-span-2 lg:col-span-2 2xl:col-span-2";
    default:
      return "col-span-1 md:col-span-2 lg:col-span-4 2xl:col-span-6";
  }
}

// =============================================================================
// DashboardGrid Component
// =============================================================================

export interface DashboardGridProps {
  /** Array of layout bands from layout endpoint */
  bands: DashboardBand[];
  /** Default scope passed down from layout */
  scope: DashboardScope;
  /** Active period code/label */
  period?: string;
  /** Map of widget results by widgetId */
  widgetResponses?: Map<
    WidgetId,
    {
      data?: unknown;
      isLoading?: boolean;
      error?: Error | string | null;
      onRetry?: () => void;
      scope?: DashboardScope;
      link?: string;
    }
  >;
  className?: string;
}

export function DashboardGrid({
  bands,
  scope,
  period,
  widgetResponses,
  className,
}: DashboardGridProps) {
  // Filter bands: omit any band with zero widgets
  const activeBands = (bands || []).filter(
    (band) => Array.isArray(band.widgets) && band.widgets.length > 0
  );

  if (activeBands.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border/60 rounded-xl">
        <p className="text-sm font-medium text-foreground">
          No dashboard widgets configured.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Check your account permissions or contact your system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)}>
      {activeBands.map((band) => {
        // Sort widgets within band by priority ascending
        const sortedWidgets = [...band.widgets].sort(
          (a, b) => (a.priority || 0) - (b.priority || 0)
        );

        // Compute hole-free balanced spans
        const balancedSpans = calculateBalancedSpans(sortedWidgets);

        return (
          <section
            key={`dashboard-band-${band.band}`}
            aria-label={`Dashboard Band ${band.band}`}
            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 2xl:grid-cols-12 gap-6 w-full items-stretch"
          >
            {sortedWidgets.map((placement) => {
              const definition = getWidgetDefinition(placement.id);
              const computedSpan = balancedSpans.get(placement.id) || placement.span || 3;
              const spanClasses = getResponsiveSpanClasses(computedSpan);

              // Extract response state for this widget
              const responseState = widgetResponses?.get(placement.id);
              const widgetScope = responseState?.scope || scope;

              if (!definition) {
                // Fallback for unregistered widget
                return (
                  <div
                    key={placement.id}
                    className={cn(spanClasses, "flex flex-col")}
                  >
                    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs">
                      Unregistered widget: {placement.id}
                    </div>
                  </div>
                );
              }

              const WidgetComponent = definition.component;

              return (
                <div
                  key={placement.id}
                  className={cn(spanClasses, "flex flex-col")}
                >
                  <WidgetComponent
                    widgetId={placement.id}
                    scope={widgetScope}
                    period={period}
                    data={responseState?.data}
                    isLoading={responseState?.isLoading ?? false}
                    error={responseState?.error ?? null}
                    onRetry={responseState?.onRetry}
                  />
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
