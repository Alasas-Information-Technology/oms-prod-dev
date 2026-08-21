"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface HierarchySpineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Depth level in tree hierarchy (0 = Root Holding, 1 = BU, 2 = Dept, 3 = Section) */
  depth: number;
  /** Whether this unit is the last sibling at its current depth level (draws elbow └─ instead of ├─) */
  isLast?: boolean;
  /** Whether this unit has child nodes hanging off it */
  hasChildren?: boolean;
  /**
   * Array indicating whether each ancestor level was the last child in its parent.
   * Length equals depth. Used to draw continuous ancestor vertical lines (│) vs empty space.
   */
  ancestorIsLast?: boolean[];
  /** Width per indent step in pixels (default: 20px) */
  stepWidthPx?: number;
  /** Optional custom class name */
  className?: string;
}

/**
 * HierarchySpine — Structural vertical lineage connector rules.
 *
 * Per Domain 2 UI Specification (§1.3 & Prompt U2):
 * - Consistent visual encoding of lineage across Tree, Picker, and Move Dialogs.
 * - Presentation-only: takes depth, isLast, hasChildren, and optional ancestorIsLast.
 * - Draws thin, pixel-perfect vertical rules and elbows (├─ and └─) using existing border tokens.
 * - Accessible: Marked as aria-hidden="true" to prevent screen reader clutter.
 */
export function HierarchySpine({
  depth,
  isLast = false,
  hasChildren = false,
  ancestorIsLast = [],
  stepWidthPx = 20,
  className,
  ...props
}: HierarchySpineProps) {
  // Depth 0 (Root unit) has no ancestors and needs no spine connectors
  if (depth <= 0) {
    return null;
  }

  const columns = Array.from({ length: depth });

  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-flex items-stretch select-none shrink-0 h-full pointer-events-none self-stretch",
        className
      )}
      style={{ width: `${depth * stepWidthPx}px` }}
      {...props}
    >
      {columns.map((_, index) => {
        const isCurrentLevel = index === depth - 1;

        if (!isCurrentLevel) {
          // Ancestor Column: Draw continuous vertical line (│) only if that ancestor branch is still active
          const isAncestorClosed = Boolean(ancestorIsLast[index]);

          return (
            <div
              key={index}
              className="relative h-full shrink-0 flex items-center justify-center"
              style={{ width: `${stepWidthPx}px` }}
            >
              {!isAncestorClosed && (
                <div
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-border/80 dark:bg-border/60"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        }

        // Current Node Column: Draw elbow or T-connector to attach to current unit node
        return (
          <div
            key={index}
            className="relative h-full shrink-0 flex items-center justify-center"
            style={{ width: `${stepWidthPx}px` }}
          >
            {/* Upper vertical line (from top down to center) */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-1/2 bg-border/80 dark:bg-border/60"
              aria-hidden="true"
            />

            {/* Lower vertical line (from center to bottom, only if NOT the last sibling) */}
            {!isLast && (
              <div
                className="absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-border/80 dark:bg-border/60"
                aria-hidden="true"
              />
            )}

            {/* Horizontal branch connector (from center to right edge) */}
            <div
              className="absolute top-1/2 left-1/2 right-0 -translate-y-1/2 h-[1.5px] bg-border/80 dark:bg-border/60"
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}
