"use client";

import * as React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollapsedSiblingsData {
  parentId?: string;
  totalCount?: number;
  collapsedCount?: number;
  childTypeWord?: string;
  orientation?: "TB" | "LR";
  onShowAllSiblings?: (parentId: string) => void;
  [key: string]: unknown;
}

export type CollapsedSiblingsNodeType = Node<CollapsedSiblingsData, "collapsedSiblingsNode">;

/**
 * CollapsedSiblingsCard — Visual indicator for nodes exceeding 12 siblings.
 *
 * Implements:
 * - Part 5 Scale Rules: "Collapse siblings beyond 12 into a '+ 8 more departments' card".
 * - Prevents layout explosion on wide graphs while remaining fully interactive.
 */
export function CollapsedSiblingsCard({ data, targetPosition }: NodeProps<CollapsedSiblingsNodeType>) {
  const {
    parentId,
    totalCount = 0,
    collapsedCount = 0,
    childTypeWord = "departments",
    orientation = "TB",
    onShowAllSiblings,
  } = (data || {}) as CollapsedSiblingsData;

  const isVertical = orientation === "TB";
  const targetPos = targetPosition || (isVertical ? Position.Top : Position.Left);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (parentId) {
      onShowAllSiblings?.(parentId);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (parentId) onShowAllSiblings?.(parentId);
        }
      }}
      aria-label={`Show ${collapsedCount} more ${childTypeWord}`}
      className={cn(
        "relative flex flex-col items-center justify-center w-[240px] h-[140px] rounded-md border-2 border-dashed border-border/80 bg-muted/20 hover:bg-muted/50 hover:border-primary/60 transition-all duration-150 cursor-pointer p-4 text-center select-none group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={targetPos}
        className="!opacity-0 !w-2 !h-2 !pointer-events-none !border-0 !bg-transparent"
      />

      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        <PlusCircle className="h-4 w-4" />
      </div>

      <p className="text-sm font-semibold text-foreground leading-tight">
        + {collapsedCount} more {childTypeWord}
      </p>

      <p className="text-[11px] text-muted-foreground mt-1">
        Show all {totalCount} {childTypeWord}
      </p>
    </div>
  );
}
