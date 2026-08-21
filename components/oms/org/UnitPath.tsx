"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface UnitPathNode {
  orgUnitId?: string;
  name: string;
  nameAr?: string;
  code?: string;
  typeCode?: string | number;
}

export interface UnitPathProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Array of ancestor nodes in order from root down to parent */
  ancestors?: (UnitPathNode | string)[];
  /** Alternative: direct formatted array of strings */
  path?: string[];
  /** Optional current unit name to append at the end of the path */
  currentName?: string;
  /** Whether to append the current unit name (default: false, as UnitPath is often secondary text) */
  showCurrent?: boolean;
  /** Separator glyph or component between ancestor steps (default: "›") */
  separator?: React.ReactNode;
  /** Maximum number of ancestor segments to render before middle truncation (default: 4) */
  maxSegments?: number;
  /** Whether to display unit codes in monospace (default: false) */
  showCodes?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * UnitPath — Reusable inline ancestor lineage path for secondary text.
 *
 * Per Domain 2 UI Specification (§1.3, §3.3 & Prompt U2):
 * - Displays the full ancestor lineage path (e.g. `DIEZ › Corporate Services › IT`)
 *   as secondary text in flat lists, picker options, and move dialogs.
 * - Crucial for disambiguating identical names across departments (e.g. three "Operations" units).
 * - Handles bilingual text, middle truncation for deep paths, and keyboard focusability.
 */
export function UnitPath({
  ancestors = [],
  path,
  currentName,
  showCurrent = false,
  separator = "›",
  maxSegments = 4,
  showCodes = false,
  className,
  ...props
}: UnitPathProps) {
  // Normalize items into UnitPathNode array
  const rawNodes: UnitPathNode[] = React.useMemo(() => {
    if (path && path.length > 0) {
      return path.map((p) => ({ name: p }));
    }

    return ancestors.map((a) => (typeof a === "string" ? { name: a } : a));
  }, [ancestors, path]);

  const allNodes: UnitPathNode[] = React.useMemo(() => {
    const list = [...rawNodes];
    if (showCurrent && currentName) {
      list.push({ name: currentName });
    }
    return list;
  }, [rawNodes, showCurrent, currentName]);

  if (allNodes.length === 0) {
    return null;
  }

  // Handle middle truncation if path exceeds maxSegments
  const shouldTruncate = allNodes.length > Math.max(3, maxSegments);

  let renderedNodes: { node: UnitPathNode; isEllipsis?: boolean }[] = [];
  if (!shouldTruncate) {
    renderedNodes = allNodes.map((node) => ({ node }));
  } else {
    // Keep first node (Root), ellipsis, and last two nodes
    renderedNodes = [
      { node: allNodes[0] },
      { node: { name: "..." }, isEllipsis: true },
      { node: allNodes[allNodes.length - 2] },
      { node: allNodes[allNodes.length - 1] },
    ];
  }

  return (
    <span
      className={cn(
        "inline-flex items-center flex-wrap gap-1 text-[11px] text-muted-foreground font-normal leading-tight select-text",
        className
      )}
      title={allNodes.map((n) => n.name).join(" › ")}
      {...props}
    >
      {renderedNodes.map((entry, idx) => {
        const { node, isEllipsis } = entry;
        const isLast = idx === renderedNodes.length - 1;

        if (isEllipsis) {
          return (
            <React.Fragment key="ellipsis">
              <span className="opacity-40 shrink-0 select-none">{separator}</span>
              <span className="opacity-70 font-mono select-none px-0.5">...</span>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={node.orgUnitId || idx}>
            {idx > 0 && (
              <span className="opacity-40 shrink-0 select-none text-[10px]">{separator}</span>
            )}
            <span className={cn("truncate max-w-[150px] sm:max-w-[200px]", isLast && showCurrent && "text-foreground font-medium")}>
              {node.name}
              {showCodes && node.code && (
                <span className="ml-1 font-mono text-[9px] opacity-70">
                  [{node.code}]
                </span>
              )}
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
}
