"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface UnitPathNode {
  orgUnitId?: string;
  id?: string;
  name: string;
  nameAr?: string | null;
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
    if (showCurrent && currentName) {
      return [...rawNodes, { name: currentName }];
    }
    return rawNodes;
  }, [rawNodes, showCurrent, currentName]);

  if (allNodes.length === 0) {
    return null;
  }

  // Handle truncation if segments exceed maxSegments
  const displayNodes: (UnitPathNode | "ELLIPSIS")[] = React.useMemo(() => {
    if (allNodes.length <= maxSegments) {
      return allNodes;
    }

    // Keep first item, ellipsis, and last 2 items
    return [allNodes[0], "ELLIPSIS", ...allNodes.slice(-2)];
  }, [allNodes, maxSegments]);

  const fullPathTitle = allNodes
    .map((n) => (showCodes && n.code ? `${n.name} (${n.code})` : n.name))
    .join(" › ");

  return (
    <span
      className={cn(
        "inline-flex items-center flex-wrap gap-1 text-xs text-muted-foreground",
        className
      )}
      title={fullPathTitle}
      {...props}
    >
      {displayNodes.map((node, index) => {
        const isLast = index === displayNodes.length - 1;

        if (node === "ELLIPSIS") {
          return (
            <React.Fragment key="ellipsis">
              <span className="text-muted-foreground/60 select-none px-0.5">…</span>
              <span className="text-muted-foreground/40 select-none font-sans px-0.5" aria-hidden="true">
                {separator}
              </span>
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={`${node.name}-${index}`}>
            <span
              className={cn(
                "truncate max-w-[140px] sm:max-w-[200px] transition-colors",
                isLast && showCurrent ? "font-medium text-foreground" : "text-muted-foreground/80 hover:text-foreground"
              )}
            >
              {node.name}
              {showCodes && node.code && (
                <span className="font-mono text-[10px] ml-1 text-muted-foreground/70">
                  [{node.code}]
                </span>
              )}
            </span>

            {!isLast && (
              <span className="text-muted-foreground/40 select-none font-sans px-0.5" aria-hidden="true">
                {separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
}
